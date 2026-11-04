import { Problem,validateRequest,analyse,candidates,providerPrompt,parseProvider } from './domain.mjs';
import { callCoach,providerReady,providerProblems,providerName,providerDetails } from './coach.mjs';
import {validateQuestion,answerQuestion} from './questions.mjs';
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
const enc=new TextEncoder();
const b64=bytes=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const unb64=text=>Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
async function key(secret){return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function digest(text){return b64(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(text))));}
async function sign(data,secret){const body=b64(enc.encode(JSON.stringify(data)));return body+'.'+b64(new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret),enc.encode(body))));}
async function verify(token,secret,origin){
 try{if(token.length>1500)throw 0;const [body,sig,...rest]=token.split('.');if(rest.length||!sig||!await crypto.subtle.verify('HMAC',await key(secret),unb64(sig),enc.encode(body)))throw 0;const x=JSON.parse(new TextDecoder().decode(unb64(body)));if(!/^[-a-z0-9]{36}$/.test(x.id)||!Number.isSafeInteger(x.exp)||x.exp<Date.now()||x.origin!==origin)throw 0;return x;}catch{throw new Problem('SESSION_EXPIRED',401);}
}
async function body(request,max=24000){
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Problem('JSON_REQUIRED',415);
 const reader=request.body?.getReader();if(!reader)throw new Problem('BODY_REQUIRED');let size=0,parts=[];
 while(true){const x=await reader.read();if(x.done)break;size+=x.value.byteLength;if(size>max){await reader.cancel();throw new Problem('BODY_TOO_LARGE',413);}parts.push(x.value);}
 const bytes=new Uint8Array(size);let i=0;for(const part of parts){bytes.set(part,i);i+=part.length;}try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Problem('INVALID_JSON');}
}
function origins(env){return (env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);}
function configured(env){return providerReady(env)&&typeof env.SESSION_SECRET==='string'&&env.SESSION_SECRET.length>=32&&origins(env).length>0;}
function status(env){
 const missing=providerProblems(env);
 if(typeof env.SESSION_SECRET!=='string'||env.SESSION_SECRET.length<32)missing.push('SESSION_SECRET');
 const ready=configured(env);
 return {schemaVersion:3,ready,provider:ready?providerName(env):null,...providerDetails(env),selectionMode:ready?'agent':'local',missing};
}
export default {async fetch(request,env){
 const origin=request.headers.get('origin')||'',url=new URL(request.url);let response;
 const cors={'access-control-allow-origin':origin,'access-control-allow-methods':'POST, GET, OPTIONS','access-control-allow-headers':'Content-Type, Authorization','access-control-max-age':'600','vary':'Origin','x-content-type-options':'nosniff'};
 try{
  if(!origins(env).includes(origin))throw new Problem('ORIGIN_NOT_ALLOWED',403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(url.pathname==='/api/status'&&request.method==='GET')return json(status(env),200,cors);
  if(!configured(env))throw new Problem('COACH_NOT_CONFIGURED',503);
  if(request.method!=='POST')throw new Problem('METHOD_NOT_ALLOWED',405);
  const gate=env.COACH_GATE.get(env.COACH_GATE.idFromName('global'));
  if(url.pathname==='/api/session'){
   const ip=request.headers.get('cf-connecting-ip')||'unknown',ipKey=await digest(env.SESSION_SECRET+ip);
   const allowance=await gate.fetch(new Request('https://gate.internal/session',{method:'POST',body:JSON.stringify({ipKey})}));
   if(!allowance.ok){response=allowance;}else{const exp=Date.now()+6*60*60*1000;response=json({token:await sign({id:crypto.randomUUID(),exp,origin},env.SESSION_SECRET),expiresAt:exp});}
  }else if(['/api/coach/automatic','/api/coach/question'].includes(url.pathname)){
   const session=await verify((request.headers.get('authorization')||'').replace(/^Bearer /,''),env.SESSION_SECRET,origin);
   const question=url.pathname.endsWith('/question');
   if(question&&providerName(env)!=='workers-ai')throw new Problem('QUESTIONS_NOT_CONFIGURED',503);
   const x=(question?validateQuestion:validateRequest)(await body(request));
   const stub=env.COACH_SESSIONS.get(env.COACH_SESSIONS.idFromName(session.id));
   response=await stub.fetch(new Request('https://session.internal/'+(question?'question':'coach'),{method:'POST',headers:{'content-type':'application/json','x-session-expiry':String(session.exp)},body:JSON.stringify(x)}));
  }else throw new Problem('NOT_FOUND',404);
 }catch(e){response=json({error:e instanceof Problem?e.code:'INTERNAL_ERROR'},e instanceof Problem?e.status:500);}
 return new Response(response.body,{status:response.status,headers:{...Object.fromEntries(response.headers),...cors}});
}};
export class CoachGate {
 constructor(ctx,env){this.ctx=ctx;this.env=env;}
 async fetch(request){
  try{const path=new URL(request.url).pathname,data=await request.json(),now=Date.now(),day=Math.floor(now/86400000),hour=Math.floor(now/3600000);
   const allowed=await this.ctx.storage.transaction(async tx=>{
    const s=await tx.get('quota')||{day,hour,calls:0,sessions:0,ips:{}};
    if(s.day!==day){s.day=day;s.calls=0;}if(s.hour!==hour){s.hour=hour;s.sessions=0;s.ips={};}
    if(path==='/session'){
     if(s.sessions>=Number(this.env.MAX_SESSIONS_PER_HOUR||200)||(s.ips[data.ipKey]||0)>=20)return false;
     s.sessions++;s.ips[data.ipKey]=(s.ips[data.ipKey]||0)+1;
    }else if(path==='/call'){
     if(s.calls>=Number(this.env.MAX_PROVIDER_CALLS_PER_DAY||500))return false;s.calls++;
    }else throw new Problem('NOT_FOUND',404);
    await tx.put('quota',s);return true;
   });
   await this.ctx.storage.setAlarm(now+86400000);
   return allowed?json({ok:true}):json({error:'QUOTA_REACHED'},429,{'retry-after':'60'});
  }catch(e){return json({error:e instanceof Problem?e.code:'GATE_FAILED'},e instanceof Problem?e.status:500);}
 }
 async alarm(){await this.ctx.storage.deleteAll();}
}
export class CoachSession {
 constructor(ctx,env){this.ctx=ctx;this.env=env;}
 async fetch(request){
  let x,hash;
  const question=new URL(request.url).pathname==='/question',lane=question?'questionSequence':'sequence';
  try{
   x=(question?validateQuestion:validateRequest)(await request.json());hash=await digest(JSON.stringify(x));
   const cacheKey=(question?'question:':'')+x.requestId;
   const now=Date.now(),reservation=await this.ctx.storage.transaction(async tx=>{
    const s=await tx.get('state')||{sequence:0,minute:0,calls:0,total:0,cache:{}};
    const old=s.cache[cacheKey];if(old){if(old.hash!==hash)throw new Problem('REQUEST_ID_REUSED',409);return old;}
    if(x.sequence<=(s[lane]||0))throw new Problem('STALE_REQUEST',409);
    const minute=Math.floor(now/60000);if(s.minute!==minute){s.minute=minute;s.calls=0;}
    if(s.calls>=15||s.total>=120)throw new Problem('SESSION_QUOTA_REACHED',429);
    s.calls++;s.total++;s[lane]=x.sequence;
    const entry={hash,status:'pending',sequence:x.sequence};s.cache[cacheKey]=entry;
    const keys=Object.keys(s.cache);while(keys.length>40)delete s.cache[keys.shift()];
    await tx.put('state',s);return {...entry,reserved:true};
   });
   if(!reservation.reserved)return reservation.status==='done'?json(reservation.body,reservation.httpStatus):json({error:'REQUEST_PENDING'},202);
   const exp=Number(request.headers.get('x-session-expiry'));await this.ctx.storage.setAlarm(Number.isFinite(exp)&&exp>now?exp:now+6*3600000);
   let result,status=200;
   try{
    const gate=this.env.COACH_GATE.get(this.env.COACH_GATE.idFromName('global'));
    const quota=await gate.fetch(new Request('https://gate.internal/call',{method:'POST',body:'{}'}));if(!quota.ok)throw new Problem('QUOTA_REACHED',429);
    if(question){result={schemaVersion:1,requestId:x.requestId,sequence:x.sequence,revision:x.revision,source:'workers-ai',...await answerQuestion(x,this.env)};}
    else{const observation=analyse(x),choices=candidates(x),raw=await callCoach(providerPrompt(x,observation,choices),this.env);
     result={schemaVersion:3,requestId:x.requestId,sequence:x.sequence,revision:x.revision,source:providerName(this.env),...parseProvider(raw,choices,observation)};}
   }catch(e){status=e instanceof Problem?e.status:502;result={error:e instanceof Problem?e.code:'COACH_UNAVAILABLE'};}
   const stale=await this.ctx.storage.transaction(async tx=>{const s=await tx.get('state');if(!s||s[lane]!==x.sequence)return true;s.cache[cacheKey]={hash,status:'done',sequence:x.sequence,body:result,httpStatus:status};await tx.put('state',s);return false;});
   if(stale)throw new Problem('STALE_RESPONSE',409);
   return json(result,status);
  }catch(e){return json({error:e instanceof Problem?e.code:'INTERNAL_ERROR'},e instanceof Problem?e.status:500);}
 }
 async alarm(){await this.ctx.storage.deleteAll();}
}

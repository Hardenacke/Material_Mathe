import {createState,publicState,submitAnswer,useHint,nextTask,coachPacket,applyCoach,validateTaskPlan} from '../src/domain.mjs';
import {HttpError,json,randomToken,newCode,digest,codeHash,equalSecret,uuid,fobizzUrl,readJson,listAll} from './security.mjs';
import {fobizzAdapter} from './fobizz-adapter.mjs';
import {LEARNING_PATH_ID,DEFAULT_COACH_CONFIG,coachConfig,initializeCoach,capabilities,requireTransport,conversation,publicMessages,requireModeVersion} from './coach.mjs';
export {LearningRoom} from './legacy-v1.mjs'; // v1-Migration bleibt erhalten; alte temporäre Sitzungen laufen aus.
const HOUR=3600000,DAY=24*HOUR;
const MAX_ROOMS=20,MAX_LEARNERS=40;
const allowedPaths=new Set(['/api/health','/api/session','/api/state','/api/answer','/api/hint','/api/next','/api/coach/packet','/api/coach/apply','/api/coach/automatic','/api/coach/capabilities','/api/learning-mode','/api/chat/history','/api/chat/messages','/api/admin/session','/api/admin/rooms']);
function publicRoom(r){const {id,name,active,expiresAt,createdAt,count}=r;return {id,name,active,expiresAt,createdAt,count};}
function view(learner,room,adapterReady=false){initializeCoach(learner,room);return {state:publicState(learner.state),classroom:publicRoom(room),learnerLabel:learner.label,lastFeedback:learner.lastFeedback||'',fobizzClassroomUrl:room.fobizzUrl||'',learningPathId:LEARNING_PATH_ID,learningMode:learner.learningMode,modeVersion:learner.modeVersion,capabilities:capabilities(room,adapterReady),...(learner.state.task.hinted?{hint:learner.state.task.hint}:{})};}
function requireLive(room,learner){if(!room||!room.active||room.expiresAt<=Date.now()||!learner?.active)throw new HttpError(401,'Code ungültig oder Zugang nicht verfügbar.');}
export default {async fetch(request,env){
  const origin=request.headers.get('Origin'),origins=(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim());
  if(!origin||!origins.includes(origin))return json({error:'Origin nicht erlaubt.'},403);
  const cors={'Access-Control-Allow-Origin':origin,Vary:'Origin','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET, POST, PATCH, DELETE, OPTIONS','Access-Control-Max-Age':'600'};
  let r;
  try{
    if(request.method==='OPTIONS')r=new Response(null,{status:204});
    else if(new URL(request.url).pathname==='/api/health'&&request.method==='GET')r=json({status:'ok',version:3,automaticFobizz:fobizzAdapter.ready});
    else if(!env.TEACHER_KEY||env.TEACHER_KEY.length<32||!env.CODE_PEPPER||env.CODE_PEPPER.length<32||!env.SCHOOL_ID)r=json({error:'Klassenzimmer noch nicht eingerichtet.'},503);
    else r=await env.SCHOOL.get(env.SCHOOL.idFromName(env.SCHOOL_ID)).fetch(request);
  }catch{r=json({error:'Dienst vorübergehend nicht verfügbar.'},503);}
  const headers=new Headers(r.headers);for(const[k,v]of Object.entries(cors))headers.set(k,v);headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');return new Response(r.body,{status:r.status,headers});
}};
export class School{
  constructor(ctx,env,adapter=fobizzAdapter){this.ctx=ctx;this.env=env;this.adapter=adapter;}
  async fetch(request){const result=await this.ctx.blockConcurrencyWhile(async()=>{
    try{return await this.route(request);}catch(e){return json({error:e instanceof HttpError?e.message:'Aktion konnte nicht verarbeitet werden.'},e instanceof HttpError?e.status:500);}
  });return result instanceof Response?result:this.runChat(result);}
  view(learner,room){return view(learner,room,this.adapter.ready);}
  async quota(kind,limit,storage=this.ctx.storage){const key='quota:'+kind,now=Date.now(),minute=Math.floor(now/60000);let q=await storage.get(key)||{};if(q.minute!==minute)q={minute,count:0};q.count++;await storage.put(key,q);if(q.count>limit)throw new HttpError(429,'Zu viele Anfragen. Bitte eine Minute warten.');}
  async ensureAlarm(){if(!await this.ctx.storage.getAlarm())await this.ctx.storage.setAlarm(Date.now()+HOUR);}
  async route(request){
    const path=new URL(request.url).pathname,method=request.method;
    if(!allowedPaths.has(path)&&!/^\/api\/admin\/rooms\/[a-f0-9-]{36}(?:\/learners\/[a-f0-9-]{36}(?:\/(?:rotate-code|reset))?)?$/.test(path))throw new HttpError(404,'Unbekannter Endpunkt.');
    if(!['GET','POST','PATCH','DELETE'].includes(method))throw new HttpError(405,'Methode nicht erlaubt.');
    const body=['POST','PATCH'].includes(method)||(method==='DELETE'&&path==='/api/chat/history')?await readJson(request):{};
    if(method==='POST'&&(path==='/api/session'||path==='/api/admin/session')){
      const admin=path==='/api/admin/session';await this.quota(admin?'teacher-login':'learner-login',admin?20:120);await this.ensureAlarm();
      return this.ctx.storage.transaction(async tx=>{
        let learner,room;
        if(admin){if(!await equalSecret(body.key,this.env.TEACHER_KEY))throw new HttpError(401,'Lehrkraft-Zugang ungültig.');const old=await tx.get('admin-current');if(old)await tx.delete('session:'+old);}
        else{const hash=await codeHash(body.code,this.env.CODE_PEPPER),id=await tx.get('code:'+hash);learner=id?await tx.get('learner:'+id):null;room=learner?await tx.get('room:'+learner.roomId):null;requireLive(room,learner);if(learner.sessionHash)await tx.delete('session:'+learner.sessionHash);}
        const token=randomToken(),tokenHash=await digest(token),expiresAt=Date.now()+HOUR*(admin?1:2);
        const session={role:admin?'teacher':'learner',expiresAt,credentialEpoch:await digest(this.env.TEACHER_KEY),...(admin?{}:{learnerId:learner.id,codeVersion:learner.codeVersion}),cache:[]};
        await tx.put('session:'+tokenHash,session);
        if(admin)await tx.put('admin-current',tokenHash);else{learner.sessionHash=tokenHash;await tx.put('learner:'+learner.id,learner);}
        if(!admin){initializeCoach(learner,room);await tx.put('learner:'+learner.id,learner);}
        return json({token,expiresAt,...(admin?{role:'teacher'}:this.view(learner,room))},201);
      });
    }
    const authorization=request.headers.get('Authorization')||'';if(!/^Bearer [a-f0-9]{64}$/.test(authorization))throw new HttpError(401,'Bitte erneut mit deinem Code anmelden.');
    const tokenHash=await digest(authorization.slice(7)),session=await this.ctx.storage.get('session:'+tokenHash);
    if(!session||session.expiresAt<=Date.now()||session.credentialEpoch!==await digest(this.env.TEACHER_KEY)){if(session)await this.ctx.storage.delete('session:'+tokenHash);throw new HttpError(401,'Die Sitzung ist abgelaufen. Bitte erneut anmelden.');}
    const adminRoute=path.startsWith('/api/admin/');if(adminRoute&&session.role!=='teacher')throw new HttpError(403,'Nur für die Lehrkraft.');
    if(!adminRoute&&session.role!=='learner')throw new HttpError(403,'Lernendenzugang erforderlich.');
    await this.quota('session:'+tokenHash,60);
    return this.ctx.storage.transaction(async tx=>{
      if((path==='/api/session'||path==='/api/admin/session')&&method==='DELETE'){await tx.delete('session:'+tokenHash);if(session.role==='teacher')await tx.delete('admin-current');else{const learner=await tx.get('learner:'+session.learnerId);if(learner?.sessionHash===tokenHash){learner.sessionHash=null;await tx.put('learner:'+learner.id,learner);}}return json({loggedOut:true,progressRetained:true});}
      if(adminRoute)return this.admin(path,method,body,tx);
      const learner=await tx.get('learner:'+session.learnerId),room=learner?await tx.get('room:'+learner.roomId):null;requireLive(room,learner);
      initializeCoach(learner,room);
      if(learner.codeVersion!==session.codeVersion||learner.sessionHash!==tokenHash)throw new HttpError(401,'Zugang erneuert. Bitte erneut anmelden.');
      if(path==='/api/state'&&method==='GET')return json(this.view(learner,room));
      if(path==='/api/coach/capabilities'&&method==='GET')return json({learningMode:learner.learningMode,modeVersion:learner.modeVersion,capabilities:capabilities(room,this.adapter.ready)});
      if(path==='/api/chat/history'&&method==='GET')return json({learningMode:learner.learningMode,modeVersion:learner.modeVersion,messages:publicMessages(learner)});
      if(method!=='POST'&&!(method==='PATCH'&&path==='/api/learning-mode')&&!(method==='DELETE'&&path==='/api/chat/history'))throw new HttpError(405,'Methode nicht erlaubt.');
      uuid(body.requestId);const signature=JSON.stringify({path,body}),cached=session.cache.find(x=>x.id===body.requestId);
      if(cached){if(cached.signature!==signature||cached.response.modeVersion!==learner.modeVersion)throw new HttpError(409,'requestId bereits anders verwendet oder Lernmodus inzwischen geändert.');return json(cached.response);}
      if(body.revision!==learner.state.revision)throw new HttpError(409,'Der Lernstand hat sich geändert. Bitte den aktuellen Stand laden.');
      if(path.startsWith('/api/coach/')||path.startsWith('/api/chat/')||path==='/api/learning-mode')requireModeVersion(learner,body);
      let extra={};try{
        if(path==='/api/learning-mode'){
          if(method!=='PATCH')throw new HttpError(405,'PATCH erforderlich.');
          if(!capabilities(room,this.adapter.ready).some(c=>c.learningMode===body.learningMode&&c.allowed))throw new HttpError(400,'Dieser Lernmodus ist nicht freigegeben.');
          if(body.learningMode!==learner.learningMode){learner.learningMode=body.learningMode;learner.modeVersion++;learner.state.revision++;learner.state.coach=null;learner.chatPending=null;}
        }
        else if(path==='/api/chat/history'){
          if(method!=='DELETE')throw new HttpError(405,'DELETE erforderlich.');
          if(learner.chatContexts[LEARNING_PATH_ID])delete learner.chatContexts[LEARNING_PATH_ID][learner.learningMode];
          learner.chatPending=null;learner.modeVersion++;learner.state.revision++;learner.state.coach=null;session.cache=[];extra.messages=[];
        }
        else if(path==='/api/chat/messages'){
          requireTransport(learner,room,'fobizz-api',this.adapter.ready);
          if(typeof body.message!=='string'||!body.message.trim()||body.message.length>2000)throw new HttpError(400,'Die Frage muss 1–2000 Zeichen enthalten.');
          if(body.taskId!==undefined&&body.taskId!==learner.state.task.id)throw new HttpError(409,'Die Frage gehört zu einer anderen Aufgabe.');
          if(learner.chatPending?.expiresAt>Date.now())throw new HttpError(409,'Eine Chatantwort wird bereits vorbereitet.');
          const context=conversation(learner),packetId=crypto.randomUUID();
          const pending={requestId:body.requestId,signature,revision:learner.state.revision,modeVersion:learner.modeVersion,learningMode:learner.learningMode,expiresAt:Date.now()+25000};
          learner.chatPending=pending;await tx.put('learner:'+learner.id,learner);
          return {learnerId:learner.id,tokenHash,pending,packetId,message:body.message.trim(),input:{contextId:context.contextId,learningPathId:LEARNING_PATH_ID,learningMode:learner.learningMode,packetId,task:publicState(learner.state).task,evidence:{completed:learner.state.completed,skills:learner.state.skills,recent:learner.state.history.slice(-6)},messages:[...context.messages.slice(-8).map(({role,text})=>({role,text})),{role:'user',text:body.message.trim()}]}};
        }
        else if(path==='/api/answer'){if(body.taskId!==learner.state.task.id)throw new HttpError(409,'Diese Aufgabe ist nicht mehr aktuell.');extra.result=submitAnswer(learner.state,body.value,body.unit);}
        else if(path==='/api/hint')extra.hint=useHint(learner.state);
        else if(path==='/api/next')nextTask(learner.state);
        else if(path==='/api/coach/packet'){requireTransport(learner,room,'fobizz-transfer',this.adapter.ready);extra.packet=coachPacket(learner.state);}
        else if(path==='/api/coach/apply'){requireTransport(learner,room,'fobizz-transfer',this.adapter.ready);extra.coach=applyCoach(learner.state,body.recommendation);learner.lastFeedback=extra.coach.feedback;}
        else if(path==='/api/coach/automatic')throw new HttpError(501,'Automatische fobizz-Anbindung noch nicht bestätigt. Bitte den Transfer nutzen.');
        else throw new HttpError(405,'Methode nicht erlaubt.');
      }catch(e){throw e instanceof HttpError?e:new HttpError(400,e.message);}
      const response={...this.view(learner,room),...extra};session.cache.push({id:body.requestId,signature,response});session.cache=session.cache.slice(-5);
      await tx.put('learner:'+learner.id,learner);await tx.put('session:'+tokenHash,session);return json(response);
    });
  }
  async runChat(job){
    let timer;const controller=new AbortController();
    try{
      const reply=await Promise.race([
        this.adapter.chat(job.input,this.env,{signal:controller.signal}),
        new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new HttpError(503,'Die Chatantwort hat zu lange gedauert. Bitte später erneut versuchen.'));},20000);})
      ]);
      if(!reply||typeof reply.chatReply!=='string'||!reply.chatReply.trim()||reply.chatReply.length>4000)throw new HttpError(502,'Die Chatantwort hat ein ungültiges Format.');
      return await this.ctx.blockConcurrencyWhile(()=>this.ctx.storage.transaction(async tx=>{
        const learner=await tx.get('learner:'+job.learnerId),room=learner?await tx.get('room:'+learner.roomId):null;
        requireLive(room,learner);
        const session=await tx.get('session:'+job.tokenHash);
        if(!session||session.expiresAt<=Date.now()||learner.sessionHash!==job.tokenHash||session.credentialEpoch!==await digest(this.env.TEACHER_KEY))throw new HttpError(401,'Die Sitzung ist nicht mehr gültig.');
        if(learner.chatPending?.requestId!==job.pending.requestId||learner.state.revision!==job.pending.revision||learner.modeVersion!==job.pending.modeVersion||learner.learningMode!==job.pending.learningMode)throw new HttpError(409,'Lernstand oder Lernmodus inzwischen geändert. Die Chatantwort wurde verworfen.');
        requireTransport(learner,room,'fobizz-api',this.adapter.ready);
        // Eine Chatfrage ist kein Kompetenznachweis. Jede Antwort zur laufenden
        // Übung zählt vorsorglich als Unterstützung, ohne die Aufgabe zu ändern.
        if(!learner.state.task.solved)learner.state.task.hinted=true;
        learner.state.revision++;learner.state.coach=null;
        let recommendationStatus='none',taskPlanStatus='none';
        if(reply.recommendation){
          try{
            if(learner.state.completed<2)throw new Error('Zu wenig Belege.');
            const candidate=structuredClone(learner.state);
            candidate.coach={packetId:job.packetId,revision:candidate.revision};
            const result=applyCoach(candidate,reply.recommendation);
            learner.state=candidate;learner.lastFeedback=result.feedback;recommendationStatus='applied';
          }catch{recommendationStatus='rejected';}
        }
        if(reply.taskPlan){
          try{learner.state.pendingTaskPlan=validateTaskPlan(learner.state,reply.taskPlan);taskPlanStatus='queued';}
          catch{taskPlanStatus='rejected';}
        }
        const context=conversation(learner),createdAt=Date.now();
        context.messages.push({role:'user',text:job.message,createdAt},{role:'assistant',text:reply.chatReply.trim(),createdAt});
        context.messages=context.messages.slice(-20);learner.chatPending=null;
        const response={...this.view(learner,room),messages:context.messages,recommendationStatus,taskPlanStatus};
        session.cache.push({id:job.pending.requestId,signature:job.pending.signature,response});session.cache=session.cache.slice(-5);
        await tx.put('learner:'+learner.id,learner);await tx.put('session:'+job.tokenHash,session);
        return json(response);
      }));
    }catch(e){
      await this.ctx.blockConcurrencyWhile(()=>this.ctx.storage.transaction(async tx=>{
        const learner=await tx.get('learner:'+job.learnerId);
        if(learner?.chatPending?.requestId===job.pending.requestId){learner.chatPending=null;await tx.put('learner:'+learner.id,learner);}
      }));
      return json({error:e instanceof HttpError?e.message:'fobizz ist momentan nicht erreichbar.'},e instanceof HttpError?e.status:503);
    }finally{clearTimeout(timer);controller.abort();}
  }
  async admin(path,method,body,tx){
    if(path==='/api/admin/rooms'&&method==='GET')return json({rooms:[...(await listAll(tx,'room:')).values()].map(publicRoom)});
    if(method==='POST'&&path==='/api/admin/rooms'){
      uuid(body.requestId);const receipt=await tx.get('receipt:'+body.requestId);
      if(receipt){if(receipt.action!=='create-room'||receipt.signature!==await digest(JSON.stringify(body)))throw new HttpError(409,'requestId bereits verwendet.');const room=await tx.get('room:'+receipt.roomId);if(!room)throw new HttpError(409,'Der Klassenraum wurde bereits entfernt.');return json({room:publicRoom(room),credentials:[],credentialsAvailable:false});}
      const name=String(body.name||'').trim(),count=body.count,retentionDays=body.retentionDays??90;
      if(name.length<1||name.length>64||/[\r\n]/.test(name)||!Number.isInteger(count)||count<1||count>MAX_LEARNERS||!Number.isInteger(retentionDays)||retentionDays<7||retentionDays>365)throw new HttpError(400,'Name, Anzahl (1–40) oder Speicherdauer (7–365 Tage) prüfen.');
      if((await listAll(tx,'room:')).size>=MAX_ROOMS)throw new HttpError(409,'Maximal 20 Klassenräume im Pilotprojekt.');
      const room={id:crypto.randomUUID(),name,count,active:true,createdAt:Date.now(),expiresAt:Date.now()+retentionDays*DAY,fobizzUrl:fobizzUrl(body.fobizzUrl),coachConfig:coachConfig(body.coachConfig)};const credentials=[];
      for(let i=0;i<count;i++){
        const id=crypto.randomUUID(),code=newCode(),hash=await codeHash(code,this.env.CODE_PEPPER),label='Lernplatz '+String(i+1).padStart(2,'0');
        if(await tx.get('code:'+hash))throw new HttpError(503,'Codekollision. Bitte erneut versuchen.');
        await tx.put('learner:'+id,{id,roomId:room.id,label,active:true,codeHash:hash,codeVersion:1,sessionHash:null,state:createState(),lastFeedback:'',learningMode:room.coachConfig.defaultLearningMode,modeVersion:1,chatContexts:{}});await tx.put('code:'+hash,id);credentials.push({learnerId:id,label,code});
      }
      await tx.put('room:'+room.id,room);await tx.put('receipt:'+body.requestId,{action:'create-room',signature:await digest(JSON.stringify(body)),roomId:room.id,expiresAt:room.expiresAt});return json({room:publicRoom(room),credentials,credentialsAvailable:true},201);
    }
    const match=path.match(/^\/api\/admin\/rooms\/([a-f0-9-]{36})(?:\/learners\/([a-f0-9-]{36})(?:\/(rotate-code|reset))?)?$/);
    if(!match)throw new HttpError(405,'Methode nicht erlaubt.');
    const [,roomId,learnerId,action]=match,room=await tx.get('room:'+roomId);if(!room)throw new HttpError(404,'Klassenraum nicht gefunden.');
    if(!learnerId){
      if(method==='GET'){
        const learners=[...(await listAll(tx,'learner:')).values()].filter(x=>x.roomId===roomId).map(x=>({id:x.id,label:x.label,active:x.active,completed:x.state.completed,skills:x.state.skills})).sort((a,b)=>a.label.localeCompare(b.label));
        return json({room:{...publicRoom(room),fobizzUrl:room.fobizzUrl||'',coachConfig:room.coachConfig||{...DEFAULT_COACH_CONFIG,defaultLearningMode:'classroom'}},learners});
      }
      if(method==='PATCH'){
        const active=Object.hasOwn(body,'active'),url=Object.hasOwn(body,'fobizzUrl'),config=Object.hasOwn(body,'coachConfig');
        if(!active&&!url&&!config)throw new HttpError(400,'active, fobizzUrl oder coachConfig erforderlich.');
        if(active){if(typeof body.active!=='boolean')throw new HttpError(400,'active muss boolesch sein.');room.active=body.active;}
        if(url)room.fobizzUrl=fobizzUrl(body.fobizzUrl);
        if(config)room.coachConfig=coachConfig(body.coachConfig);
        if(config||url)for(const [key,l]of await listAll(tx,'learner:'))if(l.roomId===roomId){
          initializeCoach(l,room);
          if(config&&!room.coachConfig.allowedLearningModes.includes(l.learningMode))l.learningMode=room.coachConfig.defaultLearningMode;
          l.modeVersion++;l.state.revision++;l.state.coach=null;l.chatPending=null;
          if(l.sessionHash){const s=await tx.get('session:'+l.sessionHash);if(s){s.cache=[];await tx.put('session:'+l.sessionHash,s);}}
          await tx.put(key,l);
        }
        await tx.put('room:'+roomId,room);return json({room:publicRoom(room)});
      }
      if(method==='DELETE'){await this.purgeRoom(tx,roomId);return json({deleted:true});}
      throw new HttpError(405,'Methode nicht erlaubt.');
    }
    const learner=await tx.get('learner:'+learnerId);if(!learner||learner.roomId!==roomId)throw new HttpError(404,'Lernplatz nicht gefunden.');
    if(method==='PATCH'&&!action){if(typeof body.active!=='boolean')throw new HttpError(400,'active muss boolesch sein.');learner.active=body.active;if(!body.active)await this.invalidate(tx,learner);await tx.put('learner:'+learnerId,learner);return json({updated:true});}
    if(method==='POST'&&action==='rotate-code'){
      uuid(body.requestId);const receipt=await tx.get('receipt:'+body.requestId);
      if(receipt){if(receipt.action!=='rotate-code'||receipt.learnerId!==learnerId)throw new HttpError(409,'requestId bereits verwendet.');return json({credentialsAvailable:false});}
      const code=newCode(),hash=await codeHash(code,this.env.CODE_PEPPER);if(await tx.get('code:'+hash))throw new HttpError(503,'Codekollision.');
      await tx.delete('code:'+learner.codeHash);await this.invalidate(tx,learner);learner.codeHash=hash;learner.codeVersion++;learner.active=true;
      await tx.put('code:'+hash,learnerId);await tx.put('learner:'+learnerId,learner);await tx.put('receipt:'+body.requestId,{action:'rotate-code',learnerId,roomId,expiresAt:room.expiresAt});
      return json({credentialsAvailable:true,credentials:[{learnerId,label:learner.label,code}],progressRetained:true});
    }
    if(method==='POST'&&action==='reset'){
      uuid(body.requestId);const existing=await tx.get('receipt:'+body.requestId);
      if(existing){if(existing.action!=='reset'||existing.learnerId!==learnerId)throw new HttpError(409,'requestId bereits verwendet.');return json({reset:true});}
      await this.invalidate(tx,learner);learner.state=createState();learner.lastFeedback='';learner.chatContexts={};learner.chatPending=null;learner.modeVersion=(learner.modeVersion||1)+1;
      await tx.put('learner:'+learnerId,learner);await tx.put('receipt:'+body.requestId,{action:'reset',roomId,learnerId,expiresAt:room.expiresAt});return json({reset:true});
    }
    throw new HttpError(405,'Methode nicht erlaubt.');
  }
  async invalidate(tx,learner){if(learner.sessionHash)await tx.delete('session:'+learner.sessionHash);learner.sessionHash=null;}
  async purgeRoom(tx,roomId){
    for(const[k,l]of await listAll(tx,'learner:'))if(l.roomId===roomId){await this.invalidate(tx,l);await tx.delete('code:'+l.codeHash);await tx.delete(k);}
    for(const[k,r]of await listAll(tx,'receipt:'))if(r.roomId===roomId)await tx.delete(k);
    await tx.delete('room:'+roomId);
  }
  async alarm(){return this.ctx.blockConcurrencyWhile(async()=>{
    const now=Date.now();await this.ctx.storage.transaction(async tx=>{
      for(const room of (await listAll(tx,'room:')).values())if(room.expiresAt<=now)await this.purgeRoom(tx,room.id);
      for(const[k,s]of await listAll(tx,'session:'))if(s.expiresAt<=now){await tx.delete(k);await tx.delete('quota:'+k);}
      for(const[k,q]of await listAll(tx,'quota:'))if(q.minute<Math.floor(now/60000)-60)await tx.delete(k);
    });
    if((await listAll(this.ctx.storage,'room:')).size||(await listAll(this.ctx.storage,'session:')).size)await this.ctx.storage.setAlarm(now+HOUR);else await this.ctx.storage.deleteAlarm();
  });}
}

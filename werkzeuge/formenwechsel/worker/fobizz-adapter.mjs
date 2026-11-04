// Dieser interne Service-Vertrag ist KEINE behauptete fobizz-API.
// Erst ein nach offizieller Dokumentation implementierter Connector darf gebunden werden.
import { Problem } from './domain.mjs';
export function assistantId(env){return typeof env.FOBIZZ_ASSISTANT_ID==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(env.FOBIZZ_ASSISTANT_ID)?env.FOBIZZ_ASSISTANT_ID:null;}
export function providerProblems(env){
 const missing=[];
 if(!assistantId(env))missing.push('FOBIZZ_ASSISTANT_ID');
 if(env.FOBIZZ_API_CONFIRMED!=='true')missing.push('FOBIZZ_API_CONFIRMED');
 if(typeof env.FOBIZZ_CONNECTOR?.fetch!=='function')missing.push('FOBIZZ_CONNECTOR');
 return missing;
}
export function providerReady(env){return providerProblems(env).length===0;}
export async function callFobizz(packet,env){
 if(!providerReady(env))throw new Problem('FOBIZZ_NOT_CONFIGURED',503);
 const controller=new AbortController();let timer;
 const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Problem('FOBIZZ_TIMEOUT',504));},6500);});
 try{
  const response=await Promise.race([env.FOBIZZ_CONNECTOR.fetch(new Request('https://fobizz-connector.internal/coach',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...packet,assistantId:assistantId(env)}),signal:controller.signal})),deadline]);
  if(!response.ok)throw new Problem('FOBIZZ_UNAVAILABLE',502);
  if(Number(response.headers.get('content-length'))>4096)throw new Problem('PROVIDER_RESPONSE_TOO_LARGE',502);
  const reader=response.body?.getReader();if(!reader)throw new Problem('INVALID_PROVIDER_RESPONSE',502);
  let size=0,parts=[];while(true){const {done,value}=await Promise.race([reader.read(),deadline]);if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();throw new Problem('PROVIDER_RESPONSE_TOO_LARGE',502);}parts.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}
  try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Problem('INVALID_PROVIDER_RESPONSE',502);}
 }catch(e){if(e instanceof Problem)throw e;throw new Problem('FOBIZZ_UNAVAILABLE',502);}finally{clearTimeout(timer);}
}

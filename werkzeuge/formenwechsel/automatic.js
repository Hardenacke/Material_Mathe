/* Automatischer Transport: keine Schlüssel und keine fobizz-Chat-URL im Browser. */
'use strict';
(()=>{
 globalThis.createCoachTransport=(config={},deps={})=>{
  const fetcher=deps.fetch||globalThis.fetch?.bind(globalThis);
  let storage=deps.storage;try{if(!storage)storage=globalThis.sessionStorage;}catch{}
  let base='';try{if(config.workerUrl){const u=new URL(config.workerUrl);if((u.protocol!=='https:'&&!(/^localhost$|^127\.0\.0\.1$/.test(u.hostname)&&u.protocol==='http:'))||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error();base=u.origin;}}catch{base='';}
  const storageKey='formenwechsel-auto:'+base;let session=null,sequence=0,generation=0;
  try{const s=JSON.parse(storage?.getItem(storageKey)||'null');if(s&&typeof s.token==='string'&&Number.isFinite(s.expiresAt)&&s.expiresAt>Date.now()+10000){session=s;sequence=Number.isSafeInteger(s.sequence)?s.sequence:0;}}catch{}
  const enabled=!!base&&!!fetcher;
  async function request(packet){
   if(!enabled)throw Error('NOT_CONFIGURED');
   const epoch=generation,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.min(12000,Math.max(1000,Number(config.timeoutMs)||9000)));
   try{
    if(!session||session.expiresAt<Date.now()+10000){const r=await fetcher(base+'/api/session',{method:'POST',headers:{'content-type':'application/json'},body:'{}',signal:controller.signal,credentials:'omit'});if(!r.ok)throw Error('SESSION_UNAVAILABLE');const s=await r.json();if(typeof s.token!=='string'||!Number.isFinite(s.expiresAt))throw Error('INVALID_SESSION');session=s;}
    if(epoch!==generation)throw Error('CANCELLED');
    sequence++;try{storage?.setItem(storageKey,JSON.stringify({...session,sequence}));}catch{}
    const body={...packet,sequence};
    const r=await fetcher(base+'/api/coach/automatic',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+session.token},body:JSON.stringify(body),signal:controller.signal,credentials:'omit'});
    if(r.status===401){session=null;try{storage?.removeItem(storageKey);}catch{}}
    if(!r.ok||r.status===202)throw Error('COACH_UNAVAILABLE');
    const result=await r.json();if(epoch!==generation)throw Error('CANCELLED');
    if(result.schemaVersion!==3||result.requestId!==body.requestId||result.sequence!==sequence||result.revision!==body.revision||result.source!=='fobizz'||typeof result.feedback!=='string'||!result.feedback.trim()||result.feedback.length>220||!['hint','praise','encouragement'].includes(result.feedbackKind))throw Error('INVALID_RESPONSE');
    return result;
   }finally{clearTimeout(timer);}
  }
  function reset(){generation++;session=null;sequence=0;try{storage?.removeItem(storageKey);}catch{}}
  return {enabled,request,reset};
 };
})();

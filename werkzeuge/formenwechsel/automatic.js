/* Automatischer Transport: keine Schlüssel und keine fobizz-Chat-URL im Browser. */
'use strict';
(()=>{
 globalThis.createCoachTransport=(config={},deps={})=>{
  const fetcher=deps.fetch||globalThis.fetch?.bind(globalThis);
  let storage=deps.storage;try{if(!storage)storage=globalThis.sessionStorage;}catch{}
  let base='';try{if(config.workerUrl){const u=new URL(config.workerUrl);if((u.protocol!=='https:'&&!(/^localhost$|^127\.0\.0\.1$/.test(u.hostname)&&u.protocol==='http:'))||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error();base=u.origin;}}catch{base='';}
  const storageKey='formenwechsel-auto:'+base;let session=null,sequence=0,questionSequence=0,generation=0,sessionPending=null;
  try{const s=JSON.parse(storage?.getItem(storageKey)||'null');if(s&&typeof s.token==='string'&&Number.isFinite(s.expiresAt)&&s.expiresAt>Date.now()+10000){session=s;sequence=Number.isSafeInteger(s.sequence)?s.sequence:0;questionSequence=Number.isSafeInteger(s.questionSequence)?s.questionSequence:0;}}catch{}
  const enabled=!!base&&!!fetcher;
  async function send(packet,question=false){
   if(!enabled)throw Error('NOT_CONFIGURED');
   const epoch=generation,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.min(12000,Math.max(1000,Number(config.timeoutMs)||9000)));
   try{
    if(!session||session.expiresAt<Date.now()+10000){
     if(!sessionPending){const pending=(async()=>{const r=await fetcher(base+'/api/session',{method:'POST',headers:{'content-type':'application/json'},body:'{}',signal:controller.signal,credentials:'omit'});if(!r.ok)throw Error('SESSION_UNAVAILABLE');const s=await r.json();if(typeof s.token!=='string'||!Number.isFinite(s.expiresAt))throw Error('INVALID_SESSION');if(epoch!==generation)throw Error('CANCELLED');session=s;})();sessionPending=pending;pending.finally(()=>{if(sessionPending===pending)sessionPending=null;}).catch(()=>{});}
     await sessionPending;
    }
    if(epoch!==generation)throw Error('CANCELLED');
    const currentSequence=question?++questionSequence:++sequence;
    try{storage?.setItem(storageKey,JSON.stringify({...session,sequence,questionSequence}));}catch{}
    const body={...packet,sequence:currentSequence};
    const r=await fetcher(base+'/api/coach/'+(question?'question':'automatic'),{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+session.token},body:JSON.stringify(body),signal:controller.signal,credentials:'omit'});
    if(r.status===401){session=null;try{storage?.removeItem(storageKey);}catch{}}
    if(!r.ok||r.status===202)throw Error('COACH_UNAVAILABLE');
    const result=await r.json();if(epoch!==generation)throw Error('CANCELLED');
    if(result.schemaVersion!==(question?1:3)||result.requestId!==body.requestId||result.sequence!==currentSequence||result.revision!==body.revision||!['fobizz','workers-ai'].includes(result.source)||(config.provider&&result.source!==config.provider))throw Error('INVALID_RESPONSE');
    if(question?(result.source!=='workers-ai'||typeof result.answer!=='string'||!result.answer.trim()||result.answer.length>1200):(typeof result.feedback!=='string'||!result.feedback.trim()||result.feedback.length>220||!['hint','praise','encouragement'].includes(result.feedbackKind)))throw Error('INVALID_RESPONSE');
    return result;
   }finally{clearTimeout(timer);}
  }
  function reset(){generation++;session=null;sessionPending=null;sequence=0;questionSequence=0;try{storage?.removeItem(storageKey);}catch{}}
  return {enabled,request:packet=>send(packet),ask:packet=>send(packet,true),reset};
 };
})();

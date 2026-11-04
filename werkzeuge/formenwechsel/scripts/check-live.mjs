// Echte KI-Abfragen mit synthetischen Antworten; keine Zugangsdaten ausgeben.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {boot} from '../tests/harness.cjs';
import {expected} from '../worker/domain.mjs';

const config=JSON.parse(readFileSync(new URL('../config.public.json',import.meta.url),'utf8'));
const base=process.argv[2]||config.workerUrl;
assert(base,'Eine bereitgestellte Worker-Adresse ist erforderlich.');
const origin='https://hardenacke.github.io';
const scope={URL,AbortController,setTimeout,clearTimeout,Date,JSON,
 sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}}};
vm.createContext(scope);
vm.runInContext(readFileSync(new URL('../automatic.js',import.meta.url),'utf8'),scope);
const status=await fetch(base+'/api/status',{headers:{origin}}).then(r=>r.json());
assert.equal(status.ready,true,JSON.stringify(status));
assert.equal(status.provider,'workers-ai');
console.log('STATUS OK:',status.provider,status.model);
const transport=scope.createCoachTransport({...config,workerUrl:base},{fetch:async(url,options)=>{
 const r=await fetch(url,{...options,headers:{...options.headers,origin}});
 if(!r.ok)console.error('Worker meldet:',r.status,await r.clone().text());
 return r;
}});
let pending,calls=0;
const observer={enabled:true,reset:()=>transport.reset(),request:packet=>{
 const start=Date.now();
 pending=transport.request(packet).then(result=>{
  calls++;assert.equal(result.source,'workers-ai');
  console.log(`KI ${calls}: ${packet.event}, ${result.feedbackKind}, ${Date.now()-start} ms`,result.feedback);
  return result;
 });
 return pending;
}};
const wait=async()=>{assert(pending);await pending;await new Promise(r=>setTimeout(r,0));};
const b=boot(null,observer);
b.click('#resume');await wait();
assert.equal(b.api.getState().current.source,'workers-ai');
assert.equal(b.get('#autoCoachCard').dataset.state,'workers-ai');
b.fill(0,999);b.fill(1,999);b.submit();await wait();
assert.equal(b.api.getState().current.aiAssisted,true);
while(!b.api.getState().current.solved){
 const values=expected(b.api.getState().current);
 b.fill(0,values[0]);b.fill(1,values[1]);b.submit();await wait();
}
const selected=b.api.getState().queue;
assert.equal(selected.source,'workers-ai');
b.click('#nextTask');
const next=b.api.getState().current;
assert.equal(next.source,'workers-ai');
assert.deepEqual([next.skill,next.a,next.p,next.k],
 [selected.plan.skill,selected.plan.a,selected.plan.p,selected.plan.k]);
console.log('LIVE-KETTE OK: KI-Auswahl, Fehlerhinweis, Erfolg und unveränderte Übernahme der KI-Folgeaufgabe.');

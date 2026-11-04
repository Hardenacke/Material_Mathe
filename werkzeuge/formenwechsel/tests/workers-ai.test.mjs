import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {callWorkersAI,modelInput,DEFAULT_MODEL} from '../worker/workers-ai.mjs';
import {providerName,providerProblems} from '../worker/coach.mjs';
import {providerPrompt,candidates,analyse,parseProvider,learningHint} from '../worker/domain.mjs';
import {boot} from './harness.cjs';

const request={event:'select',task:null,records:[],practiceLimit:10,finished:false};
const choices=candidates(request),packet=providerPrompt(request,analyse(request),choices);
const plan={skill:'complete',level:1,a:1,p:-4,k:5,promptStyle:'step_by_step'};
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));

test('Cloudflare wird explizit ausgewählt und benötigt keine fobizz-Zugangsdaten',()=>{
 const env={COACH_PROVIDER:'workers-ai',AI:{run(){}}};
 assert.equal(providerName(env),'workers-ai');
 assert.deepEqual(providerProblems(env),[]);
 assert.deepEqual(providerProblems({...env,AI:undefined}),['AI']);
});

test('Die KI erhält Lernbeobachtungen, festen Systemauftrag und ausschließlich zulässige Kennungen',()=>{
 const input=modelInput(packet);
 assert.equal(input.messages[0].role,'system');
 const data=JSON.parse(input.messages[1].content);
 assert.equal(data.observation.result,'start');
 assert(!Object.hasOwn(data,'instruction'));
 assert.deepEqual(input.response_format.json_schema.properties.nextTaskId.enum,choices.map(c=>c.id));
 assert.deepEqual(modelInput({...packet,candidates:[]}).response_format.json_schema.properties.nextTaskId.enum,[null]);
});

test('Native AI-Bindung und strukturiertes Objekt bestimmen die konkrete Aufgabe',async()=>{
 let called;
 const answer=await callWorkersAI(packet,{AI:{run:async(model,input)=>{
  called={model,input};return {response:{feedback:'Starte mit dem Ausmultiplizieren.',nextTaskId:choices.at(-1).id}};
 }}});
 assert.equal(called.model,DEFAULT_MODEL);
 assert.deepEqual(parseProvider(answer,choices,analyse(request)).taskPlan,choices.at(-1).plan);
});

test('JSON-Textantworten werden geprüft; freie Aufgaben, Zusatzbefehle und defekte Ausgaben verworfen',async()=>{
 const call=response=>callWorkersAI(packet,{AI:{run:async()=>({response})}});
 assert.equal((await call(JSON.stringify({feedback:'Los geht es.',nextTaskId:choices[0].id}))).nextTaskId,choices[0].id);
 for(const response of ['kein JSON','x'.repeat(5000),null,[]])await assert.rejects(call(response));
 const unknown=await call({feedback:'Los geht es.',nextTaskId:'FREIE-AUFGABE'});
 assert.throws(()=>parseProvider(unknown,choices,analyse(request)),{code:'INVALID_TASK_SELECTION'});
 assert.throws(()=>parseProvider({feedback:'Los geht es.',nextTaskId:choices[0].id,code:'alert(1)'},choices,analyse(request)));
});

test('Zeitlimit und Dienstfehler liefern keinen vorgetäuschten KI-Erfolg',async()=>{
 await assert.rejects(callWorkersAI(packet,{AI:{run:()=>new Promise(()=>{})}},{timeoutMs:10}),{code:'AI_TIMEOUT'});
 await assert.rejects(callWorkersAI(packet,{AI:{run:async()=>{throw Error('unavailable');}}}),{code:'AI_UNAVAILABLE'});
 await assert.rejects(callWorkersAI(packet,{}),{code:'AI_NOT_CONFIGURED'});
});

test('Ein falscher konstanter Term beim Ausmultiplizieren erhält einen geprüften Hinweis zum Quadrieren',async()=>{
 const x={event:'checked',task:{skill:'expand',a:1,p:3,k:-4,stage:2,guided:false,answers:[6,999]},records:[],finished:false,practiceLimit:10};
 const observation=analyse(x),hint=learningHint(x,observation),p=providerPrompt(x,observation,[]);
 assert.deepEqual(observation.matches,[true,false]);
 assert.match(hint,/Quadriere/);
 assert(!hint.includes('Ausklammer'));
 assert.deepEqual(modelInput(p).response_format.json_schema.properties.feedback.enum,[hint]);
 await assert.rejects(callWorkersAI(p,{AI:{run:async()=>({response:{feedback:'Prüfe das Ausklammern.',nextTaskId:null}})}}),{code:'INVALID_PROVIDER_RESPONSE'});
 const result=await callWorkersAI(p,{AI:{run:async()=>({response:{feedback:hint,nextTaskId:null}})}});
 assert.equal(parseProvider(result,[],observation).feedback,hint);
});

test('Workers-AI-Auswahl, Feedback, Hilfe und Folgewahl bleiben im Lernverlauf als Workers AI erhalten',async()=>{
 const b=boot(null,{enabled:true,reset(){},request:async p=>({schemaVersion:3,requestId:p.requestId,revision:p.revision,
  source:'workers-ai',feedback:'Prüfe das Vorzeichen beim Halbieren.',feedbackKind:p.event==='select'?'encouragement':'hint',
  taskPlan:p.event==='select'?plan:null})});
 b.click('#resume');await tick();
 assert.equal(b.api.getState().current.source,'workers-ai');
 assert.equal(b.get('#autoCoachCard').dataset.state,'workers-ai');
 assert.match(b.get('#autoCoachSource').textContent,/Charles/);
 b.fill(0,999);b.fill(1,999);b.submit();await tick();
 assert.equal(b.api.getState().current.aiAssisted,true);
 assert.equal(b.get('#autoCoachCard').dataset.state,'workers-ai');
});

test('Eine erfolgreiche KI-Folgewahl wird ohne lokalen Austausch oder zweite Auswahl übernommen',async()=>{
 const next={skill:'expand',level:1,a:1,p:4,k:-2,promptStyle:'standard'};
 let selections=0;
 const b=boot(null,{enabled:true,reset(){},request:async p=>{
  if(p.event==='select')selections++;
  return {source:'workers-ai',feedback:'Der Rechenschritt stimmt.',feedbackKind:p.event==='select'?'encouragement':'praise',
   taskPlan:p.event==='select'?plan:p.finished?next:null};
 }});
 b.click('#resume');await tick();
 for(const values of [[-8,-4],[16,-16],[4,5]]){b.fill(0,values[0]);b.fill(1,values[1]);b.submit();await tick();}
 assert.equal(b.api.getState().records[0].source,'workers-ai');
 b.click('#nextTask');await tick();
 assert.equal(b.api.getState().current.source,'workers-ai');
 assert.equal(b.api.getState().current.p,4);
 assert.equal(selections,1);
});

test('Der Browser akzeptiert die konfigurierte Herkunft und weist einen anderen Anbieter zurück',async()=>{
 const box={URL,AbortController,setTimeout,clearTimeout,Date,JSON,sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}}};
 vm.createContext(box);vm.runInContext(readFileSync(new URL('../automatic.js',import.meta.url),'utf8'),box);
 let source='workers-ai';
 const transport=box.createCoachTransport({workerUrl:'https://worker.example.org',provider:'workers-ai'},{fetch:async(url,o)=>{
  if(url.endsWith('/api/session'))return Response.json({token:'test',expiresAt:Date.now()+60000});
  const p=JSON.parse(o.body);return Response.json({...p,schemaVersion:3,source,feedback:'Gut gerechnet.',feedbackKind:'praise'});
 }});
 assert.equal((await transport.request({requestId:'request-one',revision:1})).source,'workers-ai');
 source='fobizz';
 await assert.rejects(transport.request({requestId:'request-two',revision:2}),/INVALID_RESPONSE/);
});

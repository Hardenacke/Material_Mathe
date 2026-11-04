import test from 'node:test';
import assert from 'node:assert/strict';
import {setup,answerBody} from './support.mjs';
import {DEFAULT_COACH_CONFIG,LEARNING_PATH_ID} from '../worker/coach.mjs';
import {createState,validateTaskPlan,nextTask,submitAnswer} from '../src/domain.mjs';

const ready = {ready:true,chat:async()=>({chatReply:'Prüfe zuerst die Einheiten.'})};
async function fixture(adapter,options={}) {
  const f=setup(adapter),admin=await f.teacher();
  const created=await f.room(admin,{coachConfig:DEFAULT_COACH_CONFIG,fobizzUrl:'',...options});
  return {...f,admin,created};
}
const body=(f,a,extra={})=>({requestId:f.requestId(),revision:a.state.revision,modeVersion:a.modeVersion,...extra});
async function mutate(f,a,path,extra={},method) {
  const r=await f.req(path,body(f,a,extra),a.token,method);
  assert.equal(r.status,200,JSON.stringify(await r.clone().json()));
  return {...a,...await r.json()};
}
const chat=(f,a,extra={})=>mutate(f,a,'chat/messages',{message:'Wie gehe ich vor?',taskId:a.state.task.id,...extra});
const switchMode=(f,a,learningMode)=>mutate(f,a,'learning-mode',{learningMode},'PATCH');

test('Vorhandene v2-Lernplätze migrieren additiv mit Aufgabe und Fortschritt',async()=>{
  const f=await fixture(),c=f.created.credentials[0];let a=await f.login(c.code);
  a=await mutate(f,a,'answer',answerBody(f,a));
  const old=f.data().get('learner:'+c.learnerId);delete old.learningMode;delete old.modeVersion;delete old.chatContexts;
  delete f.data().get('room:'+f.created.room.id).coachConfig;
  const b=await f.login(c.code);assert.equal(b.learningMode,'classroom');assert.equal(b.modeVersion,1);
  assert.deepEqual(b.state,a.state);assert.equal(b.state.completed,1);
  assert.deepEqual(f.data().get('learner:'+c.learnerId).chatContexts,{});
});

test('Beide Modi bleiben sichtbar; Einzelchat benötigt keinen Klassenraum und täuscht keine API vor',async()=>{
  const f=await fixture(),a=await f.login(f.created.credentials[0].code);
  assert.equal(a.learningMode,'single_chat');assert.equal(a.fobizzClassroomUrl,'');
  assert.deepEqual(a.capabilities.map(c=>c.status),['api_unconfirmed','setup_required']);
  const r=await f.req('chat/messages',body(f,a,{message:'Frage'}),a.token);
  assert.equal(r.status,501);
  const b=await switchMode(f,a,'classroom');assert.equal(b.state.task.id,a.state.task.id);
  assert.equal((await f.req('coach/packet',body(f,b),b.token)).status,409);
});

test('Moduswahl bleibt bei erneutem Login erhalten und verliert keinen Fortschritt',async()=>{
  const f=await fixture(),code=f.created.credentials[0].code;
  let a=await f.login(code);a=await mutate(f,a,'answer',answerBody(f,a));
  const switched=await switchMode(f,a,'classroom'),b=await f.login(code);
  assert.equal(b.learningMode,'classroom');assert.equal(b.modeVersion,switched.modeVersion);
  assert.deepEqual(b.state,switched.state);assert.equal(b.state.completed,1);
});

test('Lehrkraft kann Modi begrenzen; Browser kann Modi und Transport nicht erweitern',async()=>{
  const config={...DEFAULT_COACH_CONFIG,allowedLearningModes:['single_chat']};
  const f=await fixture(undefined,{coachConfig:config}),a=await f.login(f.created.credentials[0].code);
  assert.equal((await f.req('learning-mode',body(f,a,{learningMode:'classroom'}),a.token,'PATCH')).status,400);
  assert.equal((await f.req('learning-mode',body(f,a,{learningMode:'admin'}),a.token,'PATCH')).status,400);
  assert.equal((await f.req('chat/messages',body(f,a,{message:'Frage',transportMode:'fobizz-transfer',apiReady:true}),a.token)).status,501);
  const invalid={...DEFAULT_COACH_CONFIG,singleChat:{transportMode:'fobizz-transfer'}};
  assert.equal((await f.req('admin/rooms/'+f.created.room.id,{coachConfig:invalid},f.admin,'PATCH')).status,400);
});

test('Chatkontext ist persönlich und minimiert; Chathilfe zählt nicht als selbstständiger Erfolg',async()=>{
  const inputs=[],f=await fixture({ready:true,chat:async input=>{inputs.push(input);return {chatReply:'<b>Prüfe die Einheiten.</b>'};}});
  const a=await f.login(f.created.credentials[0].code),other=await f.login(f.created.credentials[1].code);
  const helped=await chat(f,a);
  assert.equal(helped.messages.length,2);assert.equal(helped.state.task.id,a.state.task.id);
  assert.equal(helped.state.task.prompt,a.state.task.prompt);assert.equal(helped.state.task.hinted,true);
  assert.equal(helped.state.completed,0);assert.equal(inputs[0].task.answer,undefined);assert.equal(inputs[0].task.hint,undefined);
  const wire=JSON.stringify(inputs[0]);
  for(const secret of [a.token,f.created.credentials[0].code,f.created.room.name,f.env.TEACHER_KEY,f.env.CODE_PEPPER])assert.ok(!wire.includes(secret));
  assert.deepEqual((await(await f.req('chat/history',null,other.token)).json()).messages,[]);
  const done=await mutate(f,helped,'answer',answerBody(f,helped));assert.equal(done.state.history[0].independent,false);
  assert.equal(done.state.skills.speed.independent,0);
});

test('Chatverläufe und Providerkontexte sind nach Modus und Lernplatz getrennt',async()=>{
  const ids=[],config={...DEFAULT_COACH_CONFIG,classroom:{transportMode:'fobizz-api'}};
  const f=await fixture({ready:true,chat:async input=>{ids.push(input.contextId);return {chatReply:'Hinweis'};}},{coachConfig:config});
  let a=await f.login(f.created.credentials[0].code);a=await chat(f,a);
  a=await switchMode(f,a,'classroom');assert.deepEqual((await(await f.req('chat/history',null,a.token)).json()).messages,[]);
  a=await chat(f,a);a=await switchMode(f,a,'single_chat');
  assert.equal((await(await f.req('chat/history',null,a.token)).json()).messages.length,2);
  await chat(f,a);const b=await f.login(f.created.credentials[1].code);await chat(f,b);
  assert.notEqual(ids[0],ids[1]);assert.equal(ids[0],ids[2]);assert.notEqual(ids[0],ids[3]);
});

test('Moduswechsel während einer Provideranfrage verwirft die alte Antwort',async()=>{
  let finish,started;const begun=new Promise(resolve=>started=resolve);
  const f=await fixture({ready:true,chat:()=>{started();return new Promise(resolve=>finish=resolve);}});
  const a=await f.login(f.created.credentials[0].code);
  const pending=f.req('chat/messages',body(f,a,{message:'Frage'}),a.token);
  await begun;const b=await switchMode(f,a,'classroom');
  finish({chatReply:'Veraltete Hilfe',taskPlan:{templateId:'units-v1'}});
  assert.equal((await pending).status,409);
  const state=await(await f.req('state',null,b.token)).json();
  assert.equal(state.learningMode,'classroom');assert.equal(state.state.task.hinted,false);
  assert.deepEqual((await(await f.req('chat/history',null,b.token)).json()).messages,[]);
});

test('Lernstandänderung, Abmeldung und Raumlöschung während Chat verhindern spätes Speichern',async()=>{
  for(const action of ['answer','logout','delete']){
    let finish,started;const begun=new Promise(resolve=>started=resolve);
    const f=await fixture({ready:true,chat:()=>{started();return new Promise(resolve=>finish=resolve);}});
    const a=await f.login(f.created.credentials[0].code),pending=f.req('chat/messages',body(f,a,{message:'Frage'}),a.token);
    await begun;
    if(action==='answer')await mutate(f,a,'answer',answerBody(f,a));
    if(action==='logout')await f.req('session',null,a.token,'DELETE');
    if(action==='delete')await f.req('admin/rooms/'+f.created.room.id,null,f.admin,'DELETE');
    finish({chatReply:'Zu spät'});assert.ok([401,409].includes((await pending).status));
    if(action==='delete')assert.ok(!f.data().has('learner:'+f.created.credentials[0].learnerId));
    else assert.deepEqual(f.data().get('learner:'+f.created.credentials[0].learnerId).chatContexts[LEARNING_PATH_ID].single_chat.messages,[]);
  }
});

test('Chatwiederholungen rufen den Provider nicht doppelt auf und sind nach Erfolg idempotent',async()=>{
  let calls=0,finish,started;const begun=new Promise(resolve=>started=resolve);
  const f=await fixture({ready:true,chat:()=>{calls++;started();return new Promise(resolve=>finish=resolve);}});
  const a=await f.login(f.created.credentials[0].code),payload=body(f,a,{message:'Frage'});
  const pending=f.req('chat/messages',payload,a.token);await begun;
  assert.equal((await f.req('chat/messages',payload,a.token)).status,409);
  finish({chatReply:'Hinweis'});const first=await(await pending).json();
  const repeated=await f.req('chat/messages',payload,a.token);assert.equal(repeated.status,200);
  assert.deepEqual(await repeated.json(),first);assert.equal(calls,1);
});

test('Fehlerhafte Providerantworten und Eingaben erzeugen keine Erfolge oder verwaisten Sperren',async()=>{
  let calls=0;const f=await fixture({ready:true,chat:async()=>{calls++;if(calls===1)throw new Error('Provider');return {chatReply:'x'.repeat(4001)};}});
  const a=await f.login(f.created.credentials[0].code);
  for(const message of ['', 'x'.repeat(2001)])assert.equal((await f.req('chat/messages',body(f,a,{message}),a.token)).status,400);
  assert.equal((await f.req('chat/messages',body(f,a,{message:'Frage'}),a.token)).status,503);
  assert.equal((await f.req('chat/messages',body(f,a,{message:'Frage'}),a.token)).status,502);
  assert.equal(f.data().get('learner:'+f.created.credentials[0].learnerId).chatPending,null);
  assert.equal((await(await f.req('state',null,a.token)).json()).state.completed,0);
});

test('Verlauf ist begrenzt; Löschen erhält Lernstand und erzeugt neuen Providerkontext',async()=>{
  const ids=[],sizes=[],f=await fixture({ready:true,chat:async input=>{ids.push(input.contextId);sizes.push(input.messages.length);return {chatReply:'Hilfe'};}});
  let a=await f.login(f.created.credentials[0].code);
  for(let i=0;i<12;i++)a=await chat(f,a,{message:'Frage '+i});
  assert.equal(a.messages.length,20);assert.ok(sizes.every(n=>n<=9));
  const before=a.state.task.id;a=await mutate(f,a,'chat/history',{},'DELETE');
  assert.deepEqual(a.messages,[]);assert.equal(a.state.task.id,before);assert.equal(a.state.task.hinted,true);
  await chat(f,a);assert.notEqual(ids[0],ids.at(-1));
});

test('Ungültige Empfehlungen bleiben vom Chat getrennt; Aufgabenpläne ändern nur Folgeaufgaben',async()=>{
  const plan={templateId:'units-v1',level:1,parameters:{base:5},wordingVariant:1,hintVariant:'steps'};
  const f=await fixture({ready:true,chat:async()=>({chatReply:'Übe als Nächstes Einheiten.',recommendation:{schemaVersion:1,nextFocus:'admin'},taskPlan:plan})});
  const a=await f.login(f.created.credentials[0].code),helped=await chat(f,a);
  assert.equal(helped.recommendationStatus,'rejected');assert.equal(helped.taskPlanStatus,'queued');
  assert.deepEqual(helped.state.task.prompt,a.state.task.prompt);
  let b=await mutate(f,helped,'answer',answerBody(f,helped));b=await mutate(f,b,'next');
  assert.equal(b.state.task.skill,'units');assert.match(b.state.task.prompt,/18 km\/h/);
  assert.equal(b.state.task.answer,undefined);assert.equal(b.state.task.hint,undefined);
});

test('Belegte Empfehlung wird separat validiert, darf keine Punkte erfinden und keinen freien Code ausführen',async()=>{
  const f=await fixture({ready:true,chat:async input=>({chatReply:'Übe Einheiten.',recommendation:{schemaVersion:1,packetId:input.packetId,feedback:'Zwei Aufgaben abgeschlossen.',nextFocus:'units',challenge:'increase'},taskPlan:{templateId:'<script>',level:4}})});
  let a=await f.login(f.created.credentials[0].code);
  for(let i=0;i<2;i++){a=await mutate(f,a,'answer',answerBody(f,a));a=await mutate(f,a,'next');}
  const helped=await chat(f,a);assert.equal(helped.recommendationStatus,'applied');assert.equal(helped.taskPlanStatus,'rejected');
  assert.equal(helped.state.completed,2);assert.equal(helped.state.skills.units.level,1);
  assert.equal(helped.lastFeedback,'Zwei Aufgaben abgeschlossen.');
});

test('Zurücksetzen und Ablauf löschen alle Chatkontexte; Codeersatz bewahrt persönlichen Verlauf',async()=>{
  for(const action of ['reset','expire','rotate-code']){
    const f=await fixture(ready),c=f.created.credentials[0];let a=await f.login(c.code);a=await chat(f,a);
    const path='admin/rooms/'+f.created.room.id+'/learners/'+c.learnerId+'/';
    if(action==='expire'){f.data().get('room:'+f.created.room.id).expiresAt=0;await f.school.alarm();assert.ok(!f.data().has('learner:'+c.learnerId));}
    else if(action==='reset'){await f.req(path+'reset',{requestId:f.requestId()},f.admin);const b=await f.login(c.code);assert.deepEqual((await(await f.req('chat/history',null,b.token)).json()).messages,[]);}
    else{const result=await(await f.req(path+'rotate-code',{requestId:f.requestId()},f.admin)).json();const b=await f.login(result.credentials[0].code);assert.equal((await(await f.req('chat/history',null,b.token)).json()).messages.length,2);}
  }
});

test('Klassenraumkonfiguration widerruft alte Transfers und schaltet keine persönliche KI frei',async()=>{
  const f=await fixture(undefined,{coachConfig:{...DEFAULT_COACH_CONFIG,defaultLearningMode:'classroom'},fobizzUrl:'https://app.fobizz.com/test'});
  let a=await f.login(f.created.credentials[0].code);
  for(let i=0;i<2;i++){a=await mutate(f,a,'answer',answerBody(f,a));if(!i)a=await mutate(f,a,'next');}
  a=await mutate(f,a,'coach/packet');const old=a;
  await f.req('admin/rooms/'+f.created.room.id,{coachConfig:DEFAULT_COACH_CONFIG},f.admin,'PATCH');
  assert.equal((await f.req('coach/apply',body(f,old,{recommendation:{schemaVersion:1,packetId:old.packet.packetId,feedback:'Hilfe',nextFocus:'units',challenge:'maintain'}}),old.token)).status,409);
  const current=await(await f.req('state',null,a.token)).json();assert.equal(current.state.completed,2);
  assert.equal(current.capabilities.find(c=>c.learningMode==='single_chat').available,false);
});

test('Vorlagen prüfen Zahlen, Textvarianten und belegte Anforderungen; alte Pläne blockieren nicht',()=>{
  const s=createState(),plan={templateId:'speed-v1',level:1,parameters:{speed:3,seconds:20},wordingVariant:0,hintVariant:'standard'};
  for(const change of [{level:4},{parameters:{speed:0,seconds:20}},{parameters:{speed:3,seconds:20,answer:99}},{wordingVariant:'<script>'},{hintVariant:'solution'}])assert.throws(()=>validateTaskPlan(s,{...plan,...change}));
  s.pendingTaskPlan=validateTaskPlan(s,plan);assert.throws(()=>nextTask(s));
  submitAnswer(s,s.task.answer,s.task.unit);nextTask(s);assert.equal(s.task.answer,3);assert.match(s.task.prompt,/60 m in 20 s/);
  s.pendingTaskPlan={...plan,level:4};submitAnswer(s,s.task.answer,s.task.unit);assert.doesNotThrow(()=>nextTask(s));
});

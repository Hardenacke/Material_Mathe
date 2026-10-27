import {makeTask,build,linePoints} from './rules.mjs';
const API='https://mathe-wettkampf-api.physik-wettkampf-api.workers.dev/api/v1/quizzes/wurzelwerk';
const root=document.getElementById('view'),PROFILE='wurzelwerk-profile-v1',DRAFT='wurzelwerk-draft-v2';
const state={topic:'mix',level:2,mode:'training',attempt:null,local:null,board:[],connected:false,busy:false,pending:null,generation:0,clock:Date.now(),received:performance.now(),questionKey:'',activeInput:'answer',timeoutId:null};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=value=>Number(value).toLocaleString('de-DE');
const math=tex=>window.katex?window.katex.renderToString(tex,{trust:false,throwOnError:false}):esc(tex);
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
let profile={token:token(),alias:''},draft={id:'',a:'',b:''},messageTimer;
try{const saved=JSON.parse(localStorage.getItem(PROFILE));if(saved&&/^[a-zA-Z0-9_-]{32,128}$/.test(saved.token))profile=saved}catch{}
try{draft=JSON.parse(sessionStorage.getItem(DRAFT))||draft}catch{}
const remember=()=>{try{localStorage.setItem(PROFILE,JSON.stringify(profile))}catch{}};
function notify(text){const box=document.getElementById('message');box.textContent=text;box.hidden=false;clearTimeout(messageTimer);messageTimer=setTimeout(()=>box.hidden=true,6000)}
function clock(){return state.clock+performance.now()-state.received}
function time(ms){const seconds=Math.max(0,Math.floor(ms/1000));return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')}
function route(){return location.hash.replace(/^#\/?/,'')||'start'}
function go(path){if(route()===path)render();else location.hash='/'+path}
function head(back,label,step=''){return `<nav class="step-nav"><a class="back" href="#/${back}">← ${label}</a><span class="step-count">${step}</span></nav>`}
function online(){return `<p class="status ${state.connected?'online':''}" id="connectionStatus">${state.connected?'Online · Wettbewerb bereit':'Verbindung wird aufgebaut …'}</p>`}
function status(){const el=document.getElementById('connectionStatus');if(el){el.classList.toggle('online',state.connected);el.textContent=state.connected?'Online · Wettbewerb bereit':'Verbindung unterbrochen · Wir versuchen es erneut.'}const button=root.querySelector('[data-play="competition"]');if(button)button.disabled=state.busy||!state.connected}
function setBusy(value){state.busy=value;root.querySelectorAll('[data-play],#checkAnswer,#nextTask,#newPlayer').forEach(button=>button.disabled=value||(!state.connected&&(button.dataset.play==='competition'||state.mode==='competition'&&['checkAnswer','nextTask'].includes(button.id))));root.querySelectorAll('.answer-input,#numberRange,[data-key],#nextInput').forEach(input=>input.disabled=value||Boolean(current()?.answered))}
async function request(path,body){
  const options={headers:{Authorization:'Bearer '+profile.token},signal:AbortSignal.timeout(15000)};
  if(body!==undefined){state.generation++;if(!state.pending||state.pending.path!==path)state.pending={path,body,key:crypto.randomUUID()};Object.assign(options,{method:'POST',body:JSON.stringify(state.pending.body)});Object.assign(options.headers,{'Content-Type':'application/json','Idempotency-Key':state.pending.key})}
  const response=await fetch(API+path,options),data=await response.json();
  if(!response.ok)throw new Error(data.error?.message||'Die Verbindung ist gerade unterbrochen.');
  if(body!==undefined)state.pending=null;if(data.serverNow){state.clock=data.serverNow;state.received=performance.now()}return data;
}
async function sync(){
  const generation=state.generation,data=await request('');if(generation!==state.generation)return;
  state.connected=true;state.board=data.leaderboard;profile.alias=data.alias;remember();
  if(data.current){state.attempt=data.current;if(route()==='aufgabe'&&(state.mode==='competition'||!state.local)){state.mode='competition';renderQuestion()}}
  setBusy(state.busy);status();if(route()==='rangliste')render();
}
async function connect(alias=''){
  const response=await fetch(API+'/join',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:profile.token,alias}),signal:AbortSignal.timeout(15000)}),data=await response.json();
  if(!response.ok)throw new Error(data.error?.message||'Der Wettbewerb ist noch nicht erreichbar.');profile.alias=data.alias;remember();await sync();
}
async function start(mode){
  if(state.busy)return;state.mode=mode;
  if(mode==='training'){const game=build('training',state.topic,state.level);state.local={...game,id:crypto.randomUUID(),phase:'active',basePoints:0,timeBonus:0,startedAt:Date.now(),task:{...makeTask(game.types[0],state.level),id:crypto.randomUUID()}};state.questionKey='';go('aufgabe');return}
  setBusy(true);try{await connect(document.getElementById('competitionAlias')?.value.trim()||'');state.attempt=(await request('/attempts',{})).attempt;state.questionKey='';go('aufgabe')}catch(error){state.connected=false;notify(error.message)}finally{setBusy(false);status()}
}
function current(){return state.mode==='competition'?state.attempt:state.local}
function question(){const game=current();return state.mode==='competition'?game?.question:game?.task}
function readNumber(value){const text=String(value).trim().replace(',','.');return /^[+]?(?:\d+\.?\d*|\.\d+)$/.test(text)&&Number.isFinite(Number(text))?Number(text):null}
function saveDraft(){try{sessionStorage.setItem(DRAFT,JSON.stringify(draft))}catch{}}
function taskAnswer(){const q=question();if(q.kind==='extract'){const a=readNumber(draft.a),b=readNumber(draft.b);if(a===null||b===null)throw new Error('Trage zuerst den Faktor und dann den Rest ein.');return {a,b}}const value=readNumber(draft.a);if(value===null)throw new Error('Gib zuerst eine Zahl ein.');if(q.type==='line'&&(value<0||value>q.max))throw new Error('Wähle eine Zahl zwischen 0 und '+q.max+'.');return value}
async function submit(timedOut=false){
  const game=current();if(!game||game.answered||state.busy)return;
  let answer;try{answer=timedOut?null:taskAnswer()}catch(error){notify(error.message);document.getElementById(state.activeInput)?.focus();return}
  if(state.mode==='training'){
    const q=question(),points=q.type==='line'?linePoints(Math.abs(answer-q.answer),state.level===1?.42:state.level===2?.29:.19):q.kind==='extract'?(answer.a===q.a&&answer.b===q.b?100:0):answer===q.answer?100:0;
    game.score+=points;game.correct+=points===100?1:0;game.attempted++;game.answered=true;game.feedback={points,basePoints:points,timeBonus:0,correct:points===100,explanation:q.explanation||`\\sqrt{${q.n}}\\approx ${q.answer.toFixed(2).replace('.', '{,}')}`};if(game.attempted===game.limit){game.phase='finished';game.endedAt=Date.now()}renderQuestion();return;
  }
  if(!state.connected)return;setBusy(true);
  try{state.attempt=(await request('/attempts/'+game.id+'/answer',{questionId:question().id,answer})).attempt;renderQuestion();await sync()}catch(error){state.connected=false;notify(error.message+' Deine Eingabe bleibt erhalten.')}finally{setBusy(false);status()}
}
async function next(){
  const game=current();if(!game?.answered||state.busy)return;if(game.phase==='finished'){go('ergebnis');return}
  if(state.mode==='training'){game.index++;game.task={...makeTask(game.types[game.index],state.level),id:crypto.randomUUID()};game.answered=false;game.feedback=null;state.questionKey='';renderQuestion();return}
  setBusy(true);try{state.attempt=(await request('/attempts/'+game.id+'/next',{})).attempt;state.questionKey='';renderQuestion()}catch(error){state.connected=false;notify(error.message)}finally{setBusy(false);status()}
}
function field(id,label,value){return `<div class="answer-field"><label for="${id}">${label}</label><input class="answer-input" id="${id}" type="text" inputmode="none" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="12" value="${esc(value)}"></div>`}
function renderQuestion(){
  if(route()!=='aufgabe')return;const game=current(),q=question();if(!game||!q){root.innerHTML='<p class="loading">Dein Spielstand wird geladen …</p>';return}
  const key=game.id+'/'+q.id+'/'+game.answered;if(key===state.questionKey){tick();return}state.questionKey=key;state.timeoutId=null;
  if(draft.id!==q.id){draft={id:q.id,a:'',b:''};saveDraft()}state.activeInput=q.kind==='extract'?'factor':'answer';
  const pair=q.kind==='extract',competition=state.mode==='competition',feedback=game.feedback;
  root.innerHTML=`<div class="play-top"><a class="back" href="#/${competition?'wettbewerb':'training/stufe'}">← Auswahl</a><span class="step-count">Aufgabe ${game.index+1} von ${game.limit}</span><strong class="score">${number(game.score)} Punkte</strong></div><div class="progress" aria-label="Fortschritt"><span style="width:${game.attempted/game.limit*100}%"></span></div>
  ${competition?'<div class="time-row"><div class="time-card" id="questionClock"><span>Zeit für die Aufgabe</span><strong id="remaining" role="timer" aria-live="off"></strong></div><div class="time-card"><span>Rundenzeit</span><strong id="roundTime" role="timer" aria-live="off"></strong></div></div>':'<p class="eyebrow">Training · Ohne Zeitdruck</p>'}
  <section class="panel task-card"><p class="eyebrow">${q.type==='roots'?'Quadratwurzel':q.type==='line'?'Zahlenstrahl':'Wurzelgesetz'}${competition?' · Mittelschwer':''}</p><h1>${esc(q.title)}</h1><p class="task-help">${esc(q.help)}</p><div class="expression">${math(q.expression)}</div>
  ${q.type==='line'?`<div class="range-wrap"><input id="numberRange" type="range" min="0" max="${q.max}" step=".01" value="${readNumber(draft.a)||0}" aria-label="Geschätzte Position auf dem Zahlenstrahl"><div class="range-labels"><span>0</span><span>${q.max}</span></div></div>`:''}
  <div class="answer-row">${pair?field('factor','1. Faktor',draft.a)+'<span class="radical" aria-hidden="true">√</span>'+field('radicand','2. Rest unter der Wurzel',draft.b):field('answer',q.type==='line'?'Deine Schätzung':'Dein Ergebnis',draft.a)}</div>
  ${!game.answered?`<div class="keypad" aria-label="Zifferntastatur">${['7','8','9','4','5','6','1','2','3',',','0','⌫'].map(value=>`<button type="button" data-key="${value}" ${value==='⌫'?'aria-label="Letzte Ziffer löschen"':value===','?'aria-label="Komma"':''} class="${value==='⌫'||value===','?'function':''}">${value}</button>`).join('')}</div>${pair?'<button type="button" class="input-next" id="nextInput">Zum Rest unter der Wurzel →</button>':''}<div class="task-actions"><button class="primary" id="checkAnswer">Antwort prüfen →</button></div>`:
  `<div class="feedback ${feedback.correct?'good':feedback.points?'':'bad'}" id="feedback" role="status"><strong>${feedback.timedOut?'Die Zeit ist abgelaufen.':feedback.correct?'Richtig gelöst!':feedback.points?'Gute Annäherung.':'Noch nicht ganz.'}</strong><div class="explanation">${math(feedback.explanation)}</div><p>${feedback.basePoints??feedback.points} Grundpunkte${feedback.timeBonus?' + '+feedback.timeBonus+' Zeitbonus':''}</p></div><div class="task-actions"><button class="primary" id="nextTask">${game.phase==='finished'?'Ergebnis ansehen':'Nächste Aufgabe'} →</button></div>`}</section>`;
  for(const input of root.querySelectorAll('.answer-input')){
    input.disabled=game.answered;input.addEventListener('focus',()=>state.activeInput=input.id);
    input.addEventListener('input',()=>{draft[input.id==='radicand'?'b':'a']=input.value;saveDraft();const range=document.getElementById('numberRange');if(range&&readNumber(input.value)!==null)range.value=readNumber(input.value)});
    input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();if(input.id==='factor')document.getElementById('radicand').focus();else submit()}});
  }
  const range=document.getElementById('numberRange');if(range){range.disabled=game.answered;range.addEventListener('input',()=>{draft.a=Number(range.value).toFixed(2).replace('.',',');document.getElementById('answer').value=draft.a;saveDraft()})}
  root.querySelectorAll('[data-key]').forEach(button=>{button.addEventListener('pointerdown',event=>event.preventDefault());button.addEventListener('click',()=>{const input=document.getElementById(state.activeInput);if(!input||input.disabled)return;const value=button.dataset.key,start=input.selectionStart??input.value.length,end=input.selectionEnd??start;let position=start;if(value==='⌫'){position=start===end?Math.max(0,start-1):start;input.value=input.value.slice(0,position)+input.value.slice(end)}else{const rest=input.value.slice(0,start)+input.value.slice(end);if(rest.length>=12||value===','&&/[,.]/.test(rest))return;input.value=input.value.slice(0,start)+value+input.value.slice(end);position=start+1}input.dispatchEvent(new Event('input'));input.focus({preventScroll:true});input.setSelectionRange(position,position)})});
  document.getElementById('nextInput')?.addEventListener('click',()=>document.getElementById('radicand').focus());document.getElementById('checkAnswer')?.addEventListener('click',()=>submit());document.getElementById('nextTask')?.addEventListener('click',next);
  setBusy(state.busy);if(!game.answered)document.getElementById(state.activeInput)?.focus({preventScroll:true});tick();
}
function tick(){
  if(route()!=='aufgabe'||state.mode!=='competition'||!state.attempt)return;const game=state.attempt,remaining=Math.max(0,Math.ceil((game.deadline-clock())/1000));
  const display=document.getElementById('remaining');if(display)display.textContent=game.answered?'Erledigt':remaining+' s';document.getElementById('questionClock')?.classList.toggle('urgent',remaining<=10&&!game.answered);
  const elapsed=document.getElementById('roundTime');if(elapsed)elapsed.textContent=time((game.endedAt||clock())-game.startedAt);
  if(!game.answered&&remaining===0&&state.connected&&!state.busy&&state.timeoutId!==game.question.id){state.timeoutId=game.question.id;submit(true)}
}
function render(){
  state.questionKey='';const path=route();if(path==='aufgabe'){renderQuestion();return}
  if(path==='start')root.innerHTML=`<p class="eyebrow">Wurzeln verstehen. Sicher rechnen.</p><h1>Was möchtest<br>du heute machen?</h1><p class="intro">Wähle deinen Weg. Du siehst immer nur das, was du gerade brauchst.</p><div class="cards"><a class="mode-card" href="#/training/thema"><span class="mode-icon">√</span><strong>In Ruhe üben</strong><p>Wähle dein Thema und deine Stufe. Ohne Timer, mit Erklärungen.</p><span class="arrow">Training wählen →</span></a><a class="mode-card competition" href="#/wettbewerb"><span class="mode-icon">↗</span><strong>Wettbewerb spielen</strong><p>Zwölf mittelschwere Aufgaben. Sichere Antworten und Tempo bringen Punkte.</p><span class="arrow">Zur Wettbewerbsrunde →</span></a></div><div class="bottom-nav"><a class="quiet-link" href="#/rangliste">Rangliste ansehen →</a><span class="hint">Ohne Anmeldung und ohne Code.</span></div>`;
  else if(path==='training/thema')root.innerHTML=head('start','Start','Training · 1 von 2')+'<p class="eyebrow">Training</p><h1>Was möchtest du üben?</h1><p class="intro">Ein Thema oder eine gemischte Runde – du entscheidest.</p><div class="cards">'+[['mix','Gemischte Runde','Alle drei Themen im Wechsel.'],['roots','Quadratwurzeln','Quadratzahlen erkennen und Wurzeln ziehen.'],['laws','Wurzelgesetze','Vereinfachen, multiplizieren und teilen.'],['line','Zahlenstrahl','Wurzeln schätzen und einordnen.']].map(([id,title,description])=>`<button class="option" data-topic="${id}"><strong>${title}</strong><span>${description}</span></button>`).join('')+'</div>';
  else if(path==='training/stufe')root.innerHTML=head('training/thema','Thema wählen','Training · 2 von 2')+'<p class="eyebrow">Training</p><h1>Welche Stufe passt zu dir?</h1><p class="intro">Zehn Aufgaben pro Runde. Du kannst danach jederzeit eine andere Stufe wählen.</p><div class="cards levels">'+[['Einstieg','Kleine Zahlen, klare Schritte.'],['Aufbau','Mittlere Zahlen und Wurzelgesetze.'],['Challenge','Größere Zahlen, anspruchsvollere Terme.']].map(([title,description],i)=>`<button class="option" data-level="${i+1}" aria-pressed="${state.level===i+1}"><strong>${i+1} · ${title}</strong><span>${description}</span></button>`).join('')+'</div><div class="actions"><button class="primary" data-play="training">Training starten →</button></div>';
  else if(path==='wettbewerb')root.innerHTML=head('start','Start')+`<p class="eyebrow">Wettbewerb · Neue Zeitwertung</p><h1>Bereit für deine Runde?</h1><p class="intro">Rechne sicher und sammle Zeitbonus. Zwischen den Aufgaben kannst du die Erklärung in Ruhe lesen.</p><div class="panel"><div class="rules"><span>12 Aufgaben</span><span>Mittelschwer</span><span>60 Sekunden pro Aufgabe</span></div><label class="field-label" for="competitionAlias">Dein Pseudonym (optional)</label><input class="name-input" id="competitionAlias" maxlength="24" autocomplete="off" placeholder="Zum Beispiel Wurzelfuchs" value="${esc(profile.alias)}"><p class="hint">Ohne Eingabe erhältst du automatisch ein Pseudonym.</p><p class="hint">Richtig: 100 Punkte + bis zu 50 Zeitbonus. Annäherungen am Zahlenstrahl bringen Teilpunkte.</p><div class="actions"><button class="primary" data-play="competition" ${!state.connected?'disabled':''}>${state.attempt?.phase==='active'?'Runde fortsetzen':'Wettbewerb starten'} →</button></div>${online()}<button class="text-button" id="newPlayer">Andere Person auf diesem Gerät</button></div>`;
  else if(path==='ergebnis'){
    const game=current();if(!game){go('start');return}
    root.innerHTML=head('start','Start')+`<section class="panel"><div class="result-title"><p class="eyebrow">${state.mode==='competition'?'Wettbewerb':'Training'} abgeschlossen</p><h1>Stark gemacht!</h1><p>Deine Runde ist geschafft.</p></div><div class="stats"><div class="stat"><span>Gesamtpunkte</span><strong>${number(game.score)}</strong></div><div class="stat"><span>Richtig gelöst</span><strong>${game.correct} / ${game.limit}</strong></div><div class="stat"><span>${state.mode==='competition'?'Zeitbonus':'Trefferquote'}</span><strong>${state.mode==='competition'?number(game.timeBonus):Math.round(game.correct/game.limit*100)+' %'}</strong></div></div><p class="hint">${state.mode==='competition'?`${game.basePoints} Grundpunkte und ${game.timeBonus} Zeitbonus. Dein Bestwert wird automatisch gespeichert.`:'Mit jeder Runde wirst du sicherer. Training zählt nicht zur Rangliste.'}</p><div class="actions"><button class="primary" data-play="${state.mode}">Noch eine Runde</button><a class="secondary" href="#/${state.mode==='competition'?'rangliste':'training/thema'}">${state.mode==='competition'?'Zur Rangliste':'Anderes Thema'}</a></div></section>`;
  }else if(path==='rangliste')root.innerHTML=head('start','Start')+`<p class="eyebrow">Wettbewerb · Mittelschwer mit Zeitbonus</p><h1>Die besten Runden.</h1><p class="intro">Dein bester abgeschlossener Versuch zählt. Höchstens 1.800 Punkte pro Runde.</p><section class="panel">${state.board.length?'<table class="board-table"><thead><tr><th>Platz</th><th>Pseudonym</th><th>Punkte</th></tr></thead><tbody>'+state.board.slice(0,10).map(row=>`<tr><td>${row.rank}.</td><td>${esc(row.alias)}</td><td>${number(row.score)}</td></tr>`).join('')+'</tbody></table>':'<p class="empty">Die erste Runde wartet noch auf dich.</p>'}<p class="board-note">Diese Rangliste gehört zur neuen Zeitwertung. Frühere Runden bleiben getrennt gespeichert.</p></section><div class="actions"><a class="primary" href="#/wettbewerb">Selbst mitspielen →</a></div>`;
  else{go('start');return}
  root.querySelectorAll('[data-topic]').forEach(button=>button.addEventListener('click',()=>{state.topic=button.dataset.topic;go('training/stufe')}));root.querySelectorAll('[data-level]').forEach(button=>button.addEventListener('click',()=>{state.level=Number(button.dataset.level);render()}));root.querySelectorAll('[data-play]').forEach(button=>button.addEventListener('click',()=>start(button.dataset.play)));
  document.getElementById('competitionAlias')?.addEventListener('keydown',event=>{if(event.key==='Enter')start('competition')});document.getElementById('newPlayer')?.addEventListener('click',async()=>{if(state.busy)return;state.generation++;profile={token:token(),alias:''};remember();state.pending=null;state.attempt=null;state.connected=false;render();try{await connect();render()}catch(error){notify(error.message)}});
  status();
}
window.addEventListener('hashchange',()=>{render();const heading=root.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}window.scrollTo({top:0,behavior:'instant'})});
window.addEventListener('offline',()=>{state.connected=false;setBusy(false);status();notify('Du bist offline. Die Wettbewerbszeit läuft auf dem Server weiter. Deine Eingabe bleibt erhalten.')});window.addEventListener('online',()=>connect().catch(()=>{}));document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!state.busy)connect().catch(()=>{})});
setInterval(()=>{if(!document.hidden&&!state.busy)(state.connected?sync():connect()).catch(()=>{state.connected=false;status()})},10000);setInterval(tick,200);render();connect().catch(()=>{state.connected=false;status()});

/* Formenwechsel – fachlich geprüfte Vorlagen, keine externen Laufzeitabhängigkeiten. */
'use strict';
(() => {
const $ = s => document.querySelector(s);
const KEY = 'formenwechsel-k9-v1';
const skills = ['expand','complete'];
const names = {expand:'Ausmultiplizieren', complete:'Quadratisch ergänzen'};
const fmt = n => {
  const s=String(n);
  if(s.includes('e')){const [m,e]=s.split('e');return `${m.replace('.', '{,}')}\\cdot10^{${Number(e)}}`;}
  return s.replace('.', '{,}');
};
const term = (n, v='', first=false) => n === 0 ? '' : (n < 0 ? '-' : first ? '' : '+') + ((Math.abs(n)===1 && v) ? '' : fmt(Math.abs(n))) + v;
const poly = (a,b,c) => term(a,'x^{2}',true)+term(b,'x')+term(c);
const bracket = p => p===0 ? 'x' : `x${term(p)}`;
const vertex = (a,p,k) => `${a===1?'':a===-1?'-':fmt(a)}(${bracket(p)})^{2}${term(k)}`;
const tex = (t, block=false) => `<span data-tex="${t}"${block?' class="mathline"':''}></span>`;
function render(root=document) {
  root.querySelectorAll('[data-tex]').forEach(n=>{
    if(n.dataset.done===n.dataset.tex) return;
    katex.render(n.dataset.tex,n,{throwOnError:true,strict:'error',trust:false,output:'htmlAndMathml'});
    n.dataset.done=n.dataset.tex;
  });
}
function setTex(node,t) {node.dataset.tex=t;delete node.dataset.done; render(node.parentElement);}
function parse(value) {
  const text=String(value).trim().replace(/−/g,'-');
  // Gemischte Zahlen werden erkannt, niemals durch Entfernen von Leerzeichen verändert.
  const mixed=text.match(/^([+-]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if(mixed){const whole=Number(mixed[2]),num=Number(mixed[3]),den=Number(mixed[4]);if(den===0||num>=den)return null;const n=(whole+num/den)*(mixed[1]==='-'?-1:1);return Math.abs(n)<=10000?n:null;}
  const number=/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/;
  const parts=text.split('/').map(x=>x.trim());
  if(parts.length>2||!parts.every(x=>number.test(x)))return null;
  const nums=parts.map(x=>Number(x.replace(',','.')));
  const n=parts.length===2?nums[0]/nums[1]:nums[0];
  return Number.isFinite(n)&&Math.abs(n)<=10000?n:null;
}
const eq=(x,y)=>x!==null&&Math.abs(x-y)<1e-8;
const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const blankSkill=()=>({level:0,independent:0,helped:0,seen:0,byLevel:[0,0,0],streak:[0,0,0]});
const fresh=()=>({version:2,revision:0,page:'intro',lessonTab:'complete',lessonStep:0,p:3,q:5,practiceLimit:10,total:12,
  stats:{expand:blankSkill(),complete:blankSkill()},records:[],current:null,mode:'single_chat',modeVersion:0,queue:null,feedback:''});
let state=fresh(),pending=null,storageOK=true,recovery='';
let autoGeneration=0,autoBusy=false,autoSelecting=false,autoView={text:'',source:'local'};
let autoConfig={};try{autoConfig=JSON.parse($('#coachConfig').textContent||'{}');}catch{}
const autoTransport=globalThis.createCoachTransport?.(autoConfig)||{enabled:false,request:async()=>{throw Error('NOT_CONFIGURED');},reset(){}};
const integer=(x,max=100000)=>Number.isInteger(x)&&x>=0&&x<=max;
const triple=a=>Array.isArray(a)&&a.length===3&&a.every(n=>integer(n));
function validRecord(r){return r&&skills.includes(r.skill)&&integer(r.level,2)&&typeof r.independent==='boolean'&&integer(r.attempts)&&integer(r.hints,2)&&typeof r.revealed==='boolean'&&typeof r.exit==='boolean'&&Array.isArray(r.errors)&&r.errors.length<=200&&r.errors.every(x=>typeof x==='string'&&x.length<80);}
function validTask(t){
  return t&&skills.includes(t.skill)&&integer(t.level,2)&&['a','p','k','b','c'].every(k=>Number.isFinite(t[k])&&Math.abs(t[k])<=1000)&&t.a!==0&&eq(t.b,2*t.a*t.p)&&eq(t.c,t.a*t.p*t.p+t.k)&&typeof t.id==='string'&&t.id.length<=160&&
    Array.isArray(t.values)&&t.values.length===2&&t.values.every(v=>typeof v==='string'&&v.length<=30)&&integer(t.attempts)&&integer(t.hints,2)&&typeof t.solved==='boolean'&&typeof t.revealed==='boolean'&&Array.isArray(t.errors)&&t.errors.length<=200&&t.errors.every(x=>typeof x==='string'&&x.length<80)&&typeof t.exit==='boolean'&&
    typeof t.guided==='boolean'&&integer(t.stage,2)&&integer(t.failures)&&t.failures<=t.attempts&&Array.isArray(t.stepsDone)&&t.stepsDone.length===2&&t.stepsDone.every(v=>typeof v==='boolean')&&(!t.guided||t.stage===0||t.stepsDone[0])&&(!t.guided||t.stage<2||t.stepsDone[1]);
}
function restore(input){
  if(!input||![1,2].includes(input.version)||!['intro','practice','summary'].includes(input.page)||!integer(input.revision)||!integer(input.modeVersion)||!['single_chat','classroom'].includes(input.mode)||!Array.isArray(input.records)||input.records.length>10000||!input.records.every(validRecord)||!skills.every(k=>{const x=input.stats?.[k];return x&&integer(x.level,2)&&['seen','independent','helped'].every(n=>integer(x[n]))&&x.seen===x.independent+x.helped&&triple(x.byLevel)&&(input.version===1||triple(x.streak));}))return null;
  const x=JSON.parse(JSON.stringify(input)),legacy=x.version===1;
  // Ältere Klassenraum-Stände ohne Verlust des fachlichen Fortschritts übernehmen.
  if(x.mode==='classroom'){x.mode='single_chat';x.modeVersion++;x.revision++;x.queue=null;x.feedback='';}
  if(legacy){
    x.version=2;x.practiceLimit=x.records.length>=10?8:10;x.total=x.practiceLimit+2;
    for(const k of skills)x.stats[k].streak=[0,0,0];
    if(x.records.length<10)x.records.forEach(r=>r.exit=false);
    if(x.current){Object.assign(x.current,{guided:false,stage:2,stepsDone:[false,false],failures:Math.max(0,x.current.attempts-1)});if(x.records.length<10)x.current.exit=false;}
  }
  if(![8,10].includes(x.practiceLimit)||x.total!==x.practiceLimit+2)return null;
  if(!['complete','expand'].includes(x.lessonTab)||!integer(x.lessonStep,3)||!Number.isInteger(x.p)||x.p< -4||x.p>4||!Number.isInteger(x.q)||x.q< -5||x.q>5){Object.assign(x,{lessonTab:'complete',lessonStep:0,p:3,q:5});recovery='Dein Beispiel wurde wiederhergestellt.';}
  if(x.current!==null&&!validTask(x.current)){x.current=null;x.page=x.records.length>=x.total?'summary':'intro';recovery='Eine beschädigte Aufgabe wurde neu vorbereitet. Deine bisherigen Ergebnisse bleiben erhalten.';}
  else if(x.current)x.current.milestone='';
  if(!x.current&&x.page==='practice')x.page='intro';
  if(typeof x.feedback!=='string'||x.feedback.length>500)x.feedback='';
  if(x.queue&&(!skills.includes(x.queue.focus)||!integer(x.queue.level,2)))x.queue=null;
  if(x.queue&&!x.queue.automatic)x.queue=null;
  if(x.queue?.plan&&(!validPlan(x.queue.plan)||x.queue.plan.skill!==x.queue.focus||x.queue.plan.level-1>x.queue.level))x.queue=null;
  if(x.current)x.current.aiAssisted=x.current.aiAssisted===true;
  return x;
}
try{const raw=localStorage.getItem(KEY);if(raw){let restored;try{restored=restore(JSON.parse(raw));}catch(e){restored=null;}if(restored)state=restored;else{try{localStorage.setItem(KEY+'-recovery',raw);}catch(e){}recovery='Der gespeicherte Stand war beschädigt. Ein neuer Lernpfad wurde gestartet; eine Sicherung wurde versucht.';}}}catch(e){storageOK=false;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;}$('#saveInfo').textContent=(storageOK?'Dein Fortschritt bleibt in diesem Browser gespeichert.':'Speichern ist hier nicht möglich. Lass diesen Tab geöffnet.')+(recovery?' '+recovery:'');}
function parameters(level){return {
  A:level===2?[-2,-1,0.5,2,3]:[1],
  P:level===0?[-3,-2,-1,0,1,2,3]:level===1?[-3.5,-2.5,-1.5,-0.5,0.5,1.5,2.5,3.5]:[-3,-2,-1,0,1,2,3],
  K:level===0?[-4,-2,0,1,3,5]:[-7,-5,-3,-1,0,1,2,4,6]
};}
function signature(t){return `${t.skill}:${t.a}:${t.p}:${t.k}`;}
function makeTask(skill,level,avoid=[]){
  const pool=[],{A,P,K}=parameters(level),blocked=new Set(Array.isArray(avoid)?avoid:[avoid]);
  for(const a of A)for(const p of P)for(const k of K)pool.push({a,p,k});
  const available=pool.filter(t=>!blocked.has(signature({...t,skill})));let choices=available.length?available:pool;
  // Die erste Vorfaktorübung enthält tatsächlich einen linearen Term.
  if(level===2&&!state.records.some(r=>r.skill===skill&&r.level===2&&r.independent))choices=choices.filter(t=>t.p!==0);
  const {a,p,k}=choices[Math.floor(Math.random()*choices.length)],exit=state.records.length>=state.practiceLimit&&state.records.length<state.total;
  const guided=skill==='complete'&&!exit;
  return {id:uid(),skill,level,a,p,k,b:2*a*p,c:a*p*p+k,attempts:0,failures:0,hints:0,solved:false,revealed:false,values:['',''],errors:[],exit,guided,source:'local',aiAssisted:false,promptStyle:'standard',stage:guided?0:2,stepsDone:[false,false]};
}
function nextSkill(){
  const n=state.records.length;
  if(n===state.practiceLimit)return 'expand';if(n===state.practiceLimit+1)return 'complete';
  const counts=skills.map(k=>state.records.filter(r=>r.skill===k).length),quota=state.practiceLimit/2;
  if(n<state.practiceLimit&&counts[0]>=quota)return 'complete';if(n<state.practiceLimit&&counts[1]>=quota)return 'expand';
  if(state.queue){const k=state.queue.focus;if(n>=state.total||counts[skills.indexOf(k)]<quota)return k;}
  if(counts[0]!==counts[1])return counts[0]<counts[1]?'expand':'complete';
  return state.stats.expand.independent-state.stats.expand.helped<=state.stats.complete.independent-state.stats.complete.helped?'expand':'complete';
}
function exitLevel(skill){const proven=state.records.filter(r=>r.skill===skill&&!r.exit&&r.independent).map(r=>r.level);return proven.length?Math.max(...proven):0;}
function newTask(){
  const skill=nextSkill(),queued=state.queue&&state.queue.focus===skill?state.queue:null;
  let level=state.stats[skill].level;
  if(queued){level=Math.min(queued.level,recommendationLevel(skill,queued.challenge||'maintain'));state.queue=null;}
  if(state.records.length>=state.practiceLimit&&state.records.length<state.total)level=Math.min(level,exitLevel(skill));
  const avoid=state.records.filter(r=>r.skill===skill).slice(-5).map(r=>r.signature).filter(Boolean);
  if(state.current)avoid.push(signature(state.current));
  const task=makeTask(skill,level,avoid);
  if(queued?.plan){
    const plan=queued.plan;
    if(validPlan(plan)&&plan.skill===skill&&plan.level-1<=level&&!avoid.includes(signature(plan))&&!(plan.level===3&&plan.p===0&&!state.records.some(r=>r.skill===skill&&r.level===2&&r.independent))){
      Object.assign(task,{a:plan.a,p:plan.p,k:plan.k,b:2*plan.a*plan.p,c:plan.a*plan.p*plan.p+plan.k,level:plan.level-1,source:'fobizz',promptStyle:plan.promptStyle});
    }else task.coachNote='Der Vorschlag passt inzwischen nicht mehr zum Lernstand. Du erhältst eine geprüfte lokale Aufgabe.';
  }
  state.current=task;state.page='practice';state.revision++;pending=null;save();paint();window.scrollTo({top:0,behavior:'auto'});
  autoView={text:'',source:'local'};paintAutomatic();
  if(task.source!=='fobizz'&&autoTransport.enabled)void automaticRequest('select');
}
function showPage(page){state.page=page;save();paint();window.scrollTo({top:0,behavior:'auto'});}
function field(label,i,variable){return `<label class="field"><span>${label} ${tex(variable)}</span><div class="inputrow"><input id="v${i}" aria-label="${label} ${variable}" aria-describedby="preview${i} answerStatus${i}" aria-invalid="false" inputmode="decimal" autocomplete="off" maxlength="24"><button type="button" class="sign" data-sign="${i}" aria-label="Vorzeichen von ${variable} wechseln">${tex('\\pm')}</button></div><span class="answerState" id="answerStatus${i}" role="status" aria-live="polite"></span><output id="preview${i}" aria-label="Deine Eingabe"></output></label>`;}
function markAnswer(i,verdict=''){
 const input=$(`#v${i}`),status=$(`#answerStatus${i}`);input.dataset.verdict=verdict;input.setAttribute('aria-invalid',String(verdict==='incorrect'||verdict==='invalid'));
 status.dataset.verdict=verdict;status.textContent=verdict==='correct'?'✓ Richtig':verdict==='incorrect'?'! Noch nicht richtig':verdict==='invalid'?'! Zahl prüfen':'';
}
const parameterSpecs={p:{min:-4,max:4},q:{min:-5,max:5}};
function paintSliders(){for(const key of ['p','q']){const {min,max}=parameterSpecs[key],value=state[key],range=$(`#${key}Slider`);range.value=value;range.setAttribute('style',`--range-fill:${(value-min)/(max-min)*100}%`);range.setAttribute('aria-valuetext',String(value).replace('.',','));$(`#${key}Decrease`).disabled=value===min;$(`#${key}Increase`).disabled=value===max;}}
function setParameter(key,value){const {min,max}=parameterSpecs[key];if(!Number.isFinite(Number(value)))return;state[key]=Math.max(min,Math.min(max,Math.round(Number(value))));save();paintLesson();}

function paintJourney(){
  $('#journeyStages').dataset.phase=state.page;
  const n=Math.min(state.records.length,state.total),phase=state.page==='summary'?'Geschafft · deine Auswertung':state.page==='intro'?'Entdecken · beide Formen verstehen':state.current?.exit?'Abschlusscheck · das Gelernte anwenden':'Trainieren · dein nächster Schritt';
  $('#progress').style.width=`${n/state.total*100}%`;setTex($('#progressValue'),`${n}\\,/\\,${state.total}`);$('#journeyLabel').textContent=phase;
  $('#journeyDots').innerHTML=Array.from({length:state.total},(_,i)=>`<span class="journeydot ${i>=state.practiceLimit?'checkpoint':''} ${i<n?'done':i===n?'current':''}" aria-label="Aufgabe ${i+1}${i<n?' bearbeitet':''}">${i<n?'✓':''}</span>`).join('');
}
function paint(){
  setTex($('#trainingCount'),String(state.practiceLimit));
  $('#intro').hidden=state.page!=='intro';$('#practice').hidden=state.page!=='practice';$('#summary').hidden=state.page!=='summary';paintJourney();
  $('#navIntro').setAttribute('aria-current',String(state.page==='intro'));$('#navPractice').setAttribute('aria-current',String(state.page==='practice'));
  if(state.page==='intro')paintLesson();if(state.page==='practice'){if(!state.current){newTask();return;}paintTask();}if(state.page==='summary')paintSummary();
  $('#resume').textContent=state.current?'Deinen Weg fortsetzen':'Los geht’s · Training starten';render();save();
}
function paintLesson() {
  const p=state.p,q=state.q,step=state.lessonStep,com=state.lessonTab==='complete';
  paintSliders();
  $('#tabComplete').setAttribute('aria-selected',String(com));$('#tabExpand').setAttribute('aria-selected',String(!com));$('#tabComplete').tabIndex=com?0:-1;$('#tabExpand').tabIndex=com?-1:0;$('#lessonLines').setAttribute('aria-labelledby',com?'tabComplete':'tabExpand');
  setTex($('#pValue'),`p=${fmt(p)}`);setTex($('#qValue'),`q=${fmt(q)}`);
  const a=1,k=q-p*p, B=bracket(p);
  const lines=com?[
    [poly(a,2*p,q),'Ausgangspunkt: Normalform.'],
    [`x^{2}${term(2*p,'x')}+\\underbrace{${fmt(p*p)}-${fmt(p*p)}}_{=0}${term(q)}`,'Die Hälfte des linearen Koeffizienten quadrieren. Ergänze und ziehe denselben Wert ab.'],
    [`\\underbrace{x^{2}${term(2*p,'x')}${term(p*p)}}_{(${B})^{2}}${term(-p*p)}${term(q)}`,'Fasse die ersten Terme mit der binomischen Formel zusammen.'],
    [vertex(1,p,k),'Fasse die Zahlen außerhalb der Klammer zusammen.']
  ]:[
    [vertex(1,p,k),'Ausgangspunkt: Scheitelpunktform.'],
    [`x^{2}${term(2*p,'x')}${term(p*p)}${term(k)}`,'Binomische Formel: Der gemischte Term gehört dazu.'],
    [poly(1,2*p,q),'Fasse die konstanten Zahlen zusammen.']
  ];
  const visible=Math.min(step,lines.length-1);
  setTex($('#lessonStepCount'),`${visible+1}\\,/\\,${lines.length}`);
  $('#lessonLines').innerHTML=lines.slice(0,visible+1).map((l,i)=>`<div class="equationstep ${i===visible?'active':''}">${tex(`f(x)=${l[0]}`,true)}<p>${l[1]}</p></div>`).join('');
  $('#lessonNext').disabled=visible===lines.length-1;
  $('#lessonNext').textContent=visible===lines.length-1?'Rechenweg vollständig':'Nächsten Schritt aufdecken';
  $('#lessonReset').disabled=step===0;
  // Graph: ausschließlich das vollständig erklärte Beispiel, nie eine aktive Übungsaufgabe.
  paintGraph(p,k);
  $('#squareExplain').innerHTML=`Der lineare Koeffizient ist ${tex(fmt(2*p))}. Seine Hälfte ist ${tex(fmt(p))}; ihr Quadrat ist ${tex(fmt(p*p))}. Deshalb ergänzen wir ${tex(fmt(p*p))} und ziehen ${tex(fmt(p*p))} wieder ab. Der Termwert bleibt gleich.`;
  render($('#intro'));
}
function paintGraph(p,k) {
  const w=400,h=260,xmin=-8,xmax=8,ymin=-25,ymax=40;
  const X=x=>(x-xmin)/(xmax-xmin)*w,Y=y=>h-(y-ymin)/(ymax-ymin)*h;
  let path='';for(let i=0;i<=320;i++){const x=xmin+i/20;path+=(i?'L':'M')+X(x).toFixed(2)+','+Y((x+p)**2+k).toFixed(2);}
  let grid='';for(let x=-8;x<=8;x++)grid+=`<path d="M${X(x)},0V${h}"/>`;for(let y=-25;y<=40;y+=5)grid+=`<path d="M0,${Y(y)}H${w}"/>`;
  const sx=X(-p),sy=Y(k);
  $('#graphSvg').innerHTML=`<defs><clipPath id="plotClip"><rect width="${w}" height="${h}" rx="8"/></clipPath><linearGradient id="curveFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#078678" stop-opacity=".10"/><stop offset="1" stop-color="#078678" stop-opacity=".01"/></linearGradient></defs><g stroke="#e6eee7" stroke-width=".7" fill="none">${grid}</g><g stroke="#aebfb3" stroke-width="1"><path d="M0,${Y(0)}H${w}M${X(0)},0V${h}"/></g><g clip-path="url(#plotClip)"><path d="${path}L${w},${h}L0,${h}Z" fill="url(#curveFade)"/><path d="M${sx},${Y(0)}V${sy}H${X(0)}" fill="none" stroke="#c79b72" stroke-dasharray="3 4" stroke-width="1"/><path d="${path}" fill="none" stroke="#078678" stroke-opacity=".08" stroke-width="11"/><path d="${path}" fill="none" stroke="#078678" stroke-width="3.2" stroke-linecap="round"/><circle class="vertexHalo" cx="${sx}" cy="${sy}" r="10" fill="#d68054" fill-opacity=".14"/><circle cx="${sx}" cy="${sy}" r="4.5" fill="#d68054" stroke="white" stroke-width="2"/></g>`;
  let labels='';const lab=(x,y,t,cls='')=>`<span class="plotlabel ${cls}" style="left:${x}%;top:${y}%">${tex(t)}</span>`;
  labels+=lab(97,Y(0)/h*100-5,'x')+lab(X(0)/w*100+4,4,'y');
  [-6,-3,3,6].forEach(x=>labels+=lab(X(x)/w*100,Y(0)/h*100+7,fmt(x)));
  [-20,-10,10,20,30].forEach(y=>labels+=lab(X(0)/w*100-5,Y(y)/h*100,fmt(y)));
  labels+=lab(sx/w*100+8,Math.min(91,sy/h*100+9),'S','vertexLabel');
  $('#graphLabels').innerHTML=labels;
  $('#graphCaption').innerHTML=`Dein Scheitelpunkt: ${tex(`S(${fmt(-p)}\\mid ${fmt(k)})`)}. Ein Graph, zwei Schreibweisen.`;
  $('#formPair').innerHTML=`<div><small>Normalform</small>${tex(`f(x)=${poly(1,2*p,p*p+k)}`,true)}</div><div><small>Scheitelpunktform</small>${tex(`f(x)=${vertex(1,p,k)}`,true)}</div>`;
}

function currentExpected(t){if(t.guided&&t.stage===0)return [t.b/t.a,t.p];if(t.guided&&t.stage===1)return [t.p*t.p,-t.a*t.p*t.p];return t.skill==='expand'?[t.b,t.c]:[-t.p,t.k];}
function paintTask(){
  const t=state.current,exp=t.skill==='expand',stage=t.guided?t.stage:2;
  $('#phaseLabel').textContent=t.exit?'Dein Abschlusscheck':state.records.length>=state.total?'Deine Extrarunde':'Deine Trainingsrunde';
  $('#taskTitle').textContent=exp?'Entfalte die Klammer.':'Finde den Scheitelpunkt.';
  $('#directionLabel').textContent=exp?'Scheitelpunktform → Normalform':'Normalform → Scheitelpunktform';
  $('#taskOrigin').hidden=t.source!=='fobizz'&&!t.coachNote;$('#taskOrigin').textContent=t.source==='fobizz'?'Vom Tutor ausgewählt · mathematisch geprüft':t.coachNote||'';
  $('#levelName').textContent=['Basis · ganze Zahlen','Vertiefung · halbe Zahlen','Erweiterung · Vorfaktoren'][t.level];
  $('#taskFormula').innerHTML=tex(`f(x)=${exp?vertex(t.a,t.p,t.k):poly(t.a,t.b,t.c)}`,true);
  $('#targetFormula').innerHTML=exp?`Dein Ziel: ${tex(`f(x)=${term(t.a,'x^{2}',true)}+bx+c`)}`:`Dein Ziel: ${tex(`f(x)=${t.a===1?'':t.a===-1?'-':fmt(t.a)}(x-d)^{2}+e`)}`;
  $('#processBanner').hidden=!t.guided;
  if(t.guided){$('#processSteps').innerHTML=['Halbieren','Ergänzen & ausgleichen','Zusammensetzen'].map((label,i)=>`<span class="processStep ${i<stage||(t.solved&&!t.revealed)?'done':i===stage&&!t.solved?'active':''}">${i<stage||(t.solved&&!t.revealed)?'✓ ':''}${label}</span>`).join('');$('#processNote').innerHTML=stage===0?(t.a===1?'Bestimme den linearen Koeffizienten und seine Hälfte.':`Klammere zuerst ${tex(fmt(t.a))} aus den Termen mit ${tex('x')} aus. Bestimme dann den linearen Koeffizienten in dieser Klammer und seine Hälfte.`):stage===1?`Ergänze und subtrahiere innen dieselbe Zahl ${tex('z')}. Bestimme danach den Ausgleich ${tex('r=-az')} außerhalb der Klammer.`:'Setze die Scheitelpunktform zusammen. Denke an das Minus vor der ersten Scheitelkoordinate.';}
  $('#taskPrompt').textContent=t.guided&&stage<2?'Arbeite Schritt für Schritt. Prüfe deine Eingaben, um den nächsten Rechenschritt zu öffnen.':exp?'Multipliziere aus und fasse zusammen. Trage beide Koeffizienten mit Vorzeichen ein.':'Trage die Scheitelkoordinaten mit Vorzeichen ein. Vergleiche deine Klammer mit der Zielform.';
  if(t.source==='fobizz'&&t.promptStyle==='check_signs')$('#taskPrompt').textContent+=' Achte besonders auf die Vorzeichen und einen äußeren Vorfaktor.';
  if(t.source==='fobizz'&&t.promptStyle==='step_by_step')$('#taskPrompt').textContent+=' Notiere deine Zwischenschritte und prüfe jede Umformung.';
  if(t.guided&&stage===0)$('#fields').innerHTML=field(t.a===1?'Linearer Koeffizient':'Linearer Koeffizient nach Ausklammern',0,'B')+field('Hälfte des Koeffizienten',1,'p');
  else if(t.guided&&stage===1)$('#fields').innerHTML=field('Ergänzungszahl in der Klammer',0,'z')+field('Ausgleich außerhalb der Klammer',1,'r');
  else $('#fields').innerHTML=exp?field('Koeffizient',0,'b')+field('Konstante',1,'c'):field('Erste Scheitelkoordinate',0,'d')+field('Zweite Scheitelkoordinate',1,'e');
  [0,1].forEach(i=>{const input=$(`#v${i}`);input.value=t.values[i];input.disabled=t.solved;updatePreview(i);markAnswer(i,t.solved&&!t.revealed?'correct':'');input.addEventListener('input',()=>{t.values[i]=input.value;markAnswer(i);updatePreview(i);save();});});
  document.querySelectorAll('[data-sign]').forEach(b=>{b.disabled=t.solved;b.onclick=()=>{const i=Number(b.dataset.sign),input=$(`#v${i}`);input.value=input.value.startsWith('-')?input.value.slice(1):'-'+input.value;t.values[i]=input.value;markAnswer(i);updatePreview(i);save();input.focus();};});
  $('#check').disabled=t.solved;$('#check').textContent=t.guided&&stage<2?'Schritt prüfen':'Antwort prüfen';$('#hint').disabled=t.solved||t.hints>=2;$('#worked').hidden=t.solved||(t.failures<2&&t.hints<2);
  $('#nextTask').hidden=!t.solved;$('#nextTask').textContent=state.records.length>=state.total?'Deine Auswertung ansehen':state.records.length===state.practiceLimit?'Zum Abschlusscheck':'Weiter zur nächsten Runde';
  $('#taskFeedback').hidden=!t.solved;$('#taskFeedback').className=t.revealed?'feedback neutral':'feedback good';
  if(t.solved){const independent=t.failures===0&&t.hints===0&&!t.revealed&&!t.aiAssisted;$('#taskFeedback').innerHTML=`<strong>${t.revealed?'Rechenweg entdeckt.':independent?'Das sitzt – selbstständig gelöst!':t.failures>0?'Gut überarbeitet – dein Rechenweg stimmt!':'Richtig gelöst – mit Unterstützung.'}</strong><p>${t.revealed?'Probiere den Rechenweg bei einer neuen Aufgabe selbst aus.':t.milestone||'Nimm den gelungenen Rechenschritt mit in die nächste Runde.'}</p>`;}
  $('#hintBox').hidden=t.hints===0;if(t.hints)$('#hintBox').innerHTML=hintText(t);
  $('#solutionBox').hidden=!t.revealed;if(t.revealed)$('#solutionBox').innerHTML=solution(t);
  $('#adaptation').textContent=t.exit?'Hier kommt eine Anforderung, die du schon geübt hast. Versuche es ohne zusätzliche Hilfe.':t.level===0?'Zuerst Sicherheit gewinnen. Neue sichere Lösungen öffnen den nächsten Schritt.':'Dein Anspruch passt sich an. Nach Schwierigkeiten festigst du den Rechenweg mit neuen Aufgaben.';
  const completed=state.records.filter(r=>r.skill===t.skill).length;$('#skillFocus').textContent=names[t.skill];$('#skillDetail').innerHTML=`Schon bearbeitet: ${tex(String(completed))} Aufgaben in dieser Richtung. Dein nächster Schritt zählt.`;
  render($('#practice'));paintAutomatic();
}
function updatePreview(i) {
  const n=parse($(`#v${i}`).value),out=$(`#preview${i}`);
  out.innerHTML=n===null?'Noch keine gültige Zahl':`Deine Eingabe: ${tex(fmt(n))}`;render(out);
}
function hintText(t) {
  if(t.guided&&t.stage<2){let h=t.stage===0?`Nach dem Ausklammern teilst du den linearen Koeffizienten durch den Vorfaktor. Halbiere anschließend. Die Hälfte kann negativ sein.`:`Die Ergänzung ist das Quadrat deiner Hälfte: ${tex('z=p^{2}')}. Innen ergänzt und subtrahierst du denselben Wert. Der äußere Ausgleich ist ${tex('r=-az')}.`;
    if(t.hints>=2)h+=t.stage===0?` Der Vorfaktor ist ${tex(fmt(t.a))}; teile den ursprünglichen linearen Koeffizienten ${tex(fmt(t.b))} durch diesen Faktor.`:` Deine Hälfte ist ${tex(fmt(t.p))}; quadriere sie und rechne beim Ausgleich auch mit dem Vorfaktor ${tex(fmt(t.a))}.`;
    return `<strong>Ein passender Denkanstoß</strong><p>${h}</p>`;}
  const exp=t.skill==='expand';
  let h=exp?`Denke an ${tex('(x+p)^{2}=x^{2}+2px+p^{2}')}. Quadriere auch bei negativem Vorzeichen die Zahl vollständig.`:`${t.a!==1?`Klammere zuerst ${tex(fmt(t.a))} aus den Termen mit der Variablen aus. Teile dazu deren Koeffizienten durch diesen Faktor. `:''}Halbiere den linearen Koeffizienten ${t.a!==1?'in der Klammer ':''}und quadriere diese Hälfte. Ergänze und subtrahiere denselben Wert.`;
  if(t.hints>=2)h+=exp?`<hr>Der gemischte Term entsteht aus ${tex(`2\\cdot(${fmt(t.p)} )\\cdot x`)}. ${t.a!==1?`Multipliziere anschließend alle Klammerterme mit ${tex(fmt(t.a))}.`:''}`:`<hr>Nach dem Ausklammern ist der lineare Koeffizient ${tex(fmt(t.b/t.a))}. Seine Hälfte ist ${tex(fmt(t.p))}. Ergänze innen ${tex(fmt(t.p*t.p))} und ziehe innen denselben Wert ab. Die erste Scheitelkoordinate hat das entgegengesetzte Vorzeichen dieser Hälfte.`;
  return `<strong>${t.hints>=2?'Konkrete Rechenhilfe':'Denkanstoß'}</strong><p>${h}</p>`;
}
function solution(t) {
  const pre=t.a===1?'':t.a===-1?'-':fmt(t.a);
  const lines=t.skill==='expand'?[
    vertex(t.a,t.p,t.k),`${pre}[x^{2}${term(2*t.p,'x')}${term(t.p*t.p)}]${term(t.k)}`,poly(t.a,t.b,t.c)
  ]:[
    poly(t.a,t.b,t.c),`${pre}[x^{2}${term(2*t.p,'x')}+${fmt(t.p*t.p)}-${fmt(t.p*t.p)}]${term(t.c)}`,
    `${pre}(${bracket(t.p)})^{2}${term(-t.a*t.p*t.p)}${term(t.c)}`,vertex(t.a,t.p,t.k)
  ];
  return '<strong>Rechenweg</strong>'+lines.map(l=>tex(`f(x)=${l}`,true)).join('')+(t.skill==='complete'?`<p>${tex(`S(${fmt(-t.p)}\\mid ${fmt(t.k)})`)}</p>`:'');
}
function diagnostic(t,x,y) {
  if(t.skill==='expand'){
    if(t.p!==0&&eq(x,t.a*t.p))return ['mixed','Prüfe den gemischten Term: Beim Quadrieren der Klammer entstehen zwei gleiche Kreuzprodukte.'];
    if(t.b!==0&&eq(x,-t.b))return ['sign','Prüfe das Produkt aus dem Vorfaktor und der Klammerzahl. Ein negatives Vorzeichen vor der Klammer ändert auch das Vorzeichen des linearen Terms.'];
    if(t.p!==0&&eq(y,t.k))return ['square','Die Zahl in der Klammer wird ebenfalls quadriert und gehört zur Konstanten.'];
    if(!eq(x,t.b))return ['linear','Der lineare Koeffizient passt noch nicht. Nutze die binomische Formel und beachte einen Faktor vor der Klammer.'];
    return ['constant','Der lineare Term passt. Prüfe nun das Quadrat der Klammerzahl und die Zahl außerhalb.'];
  }
  if(eq(x,t.p)&&t.p!==0)return ['vertex_sign','Das Vorzeichen der ersten Scheitelkoordinate ist vertauscht. Vergleiche die Klammer mit der angegebenen Zielform.'];
  if(t.p!==0&&eq(y,t.c))return ['compensate','Die ergänzte Zahl muss wieder ausgeglichen werden. Sonst änderst du die Funktion.'];
  if(t.a!==1 && eq(x,-t.b/2))return ['factor','Beachte zuerst den Faktor vor dem quadratischen Term. Klammere ihn aus den beiden Termen mit der Variablen aus.'];
  if(!eq(x,-t.p))return ['half','Prüfe zuerst die Hälfte des linearen Koeffizienten nach dem Ausklammern und dann das Vorzeichen der Scheitelkoordinate.'];
  return ['compensate','Die erste Scheitelkoordinate passt. Prüfe die Konstante: Die Ergänzung muss ausgeglichen und ein Faktor vor der Klammer mitgerechnet werden.'];
}
function finish(independent,revealed=false){
  const t=state.current,s=state.stats[t.skill];t.solved=true;t.revealed=revealed;s.seen++;
  const previous=s.level;
  if(independent){s.independent++;s.byLevel[t.level]++;s.streak=s.streak.map((n,l)=>l===t.level?n+1:0);s.level=t.level;if(s.streak[t.level]>=2)s.level=Math.min(2,t.level+1);}
  else{s.helped++;s.streak=[0,0,0];s.level=Math.max(0,t.level-1);}
  t.milestone=independent&&s.level>previous?'Deine neuen sicheren Lösungen öffnen die nächste Anforderung.':t.guided&&!revealed?'Halbiert, ergänzt und ausgeglichen: Du hast alle Rechenschritte geprüft.':revealed?'':'Du hast diese Umwandlung erfolgreich geprüft.';
  state.records.push({skill:t.skill,level:t.level,independent,attempts:t.attempts,hints:t.hints,revealed,exit:t.exit,errors:[...new Set(t.errors)],guided:t.guided,processChecked:t.guided&&!revealed&&t.stepsDone.every(Boolean),signature:signature(t),aiAssisted:!!t.aiAssisted,source:t.source==='fobizz'?'fobizz':'local'});
  state.revision++;pending=null;save();paint();$('#nextTask').focus();
}
function check(){
  const t=state.current;if(t.solved)return;
  const x=parse($('#v0').value),y=parse($('#v1').value);
  if(x===null||y===null){[x,y].forEach((v,i)=>markAnswer(i,v===null?'invalid':''));$('#taskFeedback').hidden=false;$('#taskFeedback').className='feedback warn';$('#taskFeedback').textContent='Prüfe die Schreibweise in beiden Feldern. Zahlen, einfache Brüche und gemischte Zahlen sind möglich. Getrennte Zahlblöcke ohne Bruch werden nicht verbunden. Diese Eingabe zählt noch nicht als Versuch.';return;}
  t.attempts++;const expected=currentExpected(t);[x,y].forEach((v,i)=>markAnswer(i,eq(v,expected[i])?'correct':'incorrect'));
  if(eq(x,expected[0])&&eq(y,expected[1])){
    if(t.guided&&t.stage<2){t.stepsDone[t.stage]=true;t.stage++;t.values=['',''];state.revision++;pending=null;save();paintTask();$('#taskFeedback').hidden=false;$('#taskFeedback').className='feedback good';$('#taskFeedback').textContent=t.stage===1?'Richtig halbiert! Jetzt machst du die Ergänzung wertneutral.':'Ergänzung und Ausgleich stimmen! Setze nun die Scheitelpunktform zusammen.';$('#v0').focus();return;}
    finish(t.failures===0&&t.hints===0&&!t.aiAssisted);return;
  }
  t.failures++;let code,msg;
  if(t.guided&&t.stage===0){code=eq(x,t.b/t.a)?'half':'factor';msg=code==='half'?'Der lineare Koeffizient stimmt. Halbiere genau diesen Wert und behalte sein Vorzeichen.':'Prüfe zuerst das Ausklammern. Der lineare Koeffizient in der Klammer entsteht durch Teilen durch den Vorfaktor.';}
  else if(t.guided&&t.stage===1){code=eq(x,t.p*t.p)?'outside_factor':'square';msg=code==='square'?'Quadriere die zuvor bestimmte Hälfte. Das Quadrat ist auch bei negativer Hälfte nicht negativ.':'Die Ergänzungszahl stimmt. Der Ausgleich außerhalb ist das negative Produkt aus Vorfaktor und Ergänzungszahl.';}
  else [code,msg]=diagnostic(t,x,y);
  t.errors=[...t.errors.slice(-199),code];$('#taskFeedback').hidden=false;$('#taskFeedback').className='feedback bad';$('#taskFeedback').textContent=msg+' Du kannst deine Eingabe jetzt überarbeiten.';$('#worked').hidden=t.failures<2&&t.hints<2;save();
}
function paintSummary() {
  $('#summaryCards').innerHTML=skills.map(k=>{const s=state.stats[k],check=state.records.find(r=>r.exit&&r.skill===k);return `<article class="statcard"><h3>${names[k]}</h3><p>${tex(String(s.independent))} selbstständig gelöst · ${tex(String(s.helped))} mit Hilfe oder Rechenweg</p><p>${check?(check.independent?'Abschlusscheck selbstständig gelöst.':'Abschlusscheck mit Unterstützung bearbeitet.'):'Abschlusscheck noch offen.'}</p><p class="small">${s.independent>=2?'Mehrere selbstständige Lösungen beobachtet.': 'Empfehlung: Übe diese Richtung nochmals ohne Hilfe.'}</p></article>`;}).join('');
  $('#processCount').innerHTML=`${tex(String(state.records.filter(r=>r.processChecked).length))} Rechenwege zur quadratischen Ergänzung vollständig geprüft.`;
  const both=skills.every(k=>state.records.some(r=>r.exit&&r.skill===k&&r.independent));
  $('#summaryLead').textContent=both?'Beide Richtungen im Abschlusscheck selbstständig gelöst. Bewahre dir die beiden Rechenideen.':'Du hast beide Richtungen bearbeitet. Festige jetzt gezielt die Schritte, für die du noch Hilfe gebraucht hast.';
  $('#summarySymbol').textContent=both?'✓':'↗';
  $('#summaryRule').innerHTML=`Ausmultiplizieren: ${tex('(x-d)^{2}=x^{2}-2dx+d^{2}')}<br>Quadratisch ergänzen: ${tex('x^{2}+bx+c=(x+\\frac{b}{2})^{2}+c-(\\frac{b}{2})^{2}')}<p>Bei einem Vorfaktor klammerst du diesen zuerst aus den Termen mit der Variablen aus. Die Ergänzung bleibt innerhalb der Klammer wertneutral.</p>`;
  render($('#summary'));
}
function validPlan(p){
  const keys=['skill','level','a','p','k','promptStyle'];
  if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length!==keys.length||!keys.every(k=>Object.hasOwn(p,k))||!skills.includes(p.skill)||!Number.isInteger(p.level)||p.level<1||p.level>3||!['a','p','k'].every(k=>typeof p[k]==='number'&&Number.isFinite(p[k]))||Math.abs(p.p)>6||Math.abs(p.k)>12||!Number.isInteger(p.k)||!['standard','step_by_step','check_signs'].includes(p.promptStyle))return false;
  if(p.level===1)return p.a===1&&Number.isInteger(p.p);
  if(p.level===2)return p.a===1&&Number.isInteger(p.p*2)&&!Number.isInteger(p.p);
  return [-3,-2,-1,0.5,2,3].includes(p.a)&&Number.isInteger(p.p);
}
function recommendationLevel(skill,challenge){const s=state.stats[skill];let level=s.level;if(challenge==='support')level=Math.max(0,level-1);if(challenge==='increase'&&s.independent>=3&&s.streak[s.level]>=2)level=Math.min(2,level+1);return level;}
function inputSnapshot(){const t=state.current;return t?JSON.stringify({id:t.id,stage:t.stage,values:t.values,solved:t.solved,attempts:t.attempts,hints:t.hints}):null;}
function automaticTask(){const t=state.current;return t?{id:t.id,skill:t.skill,level:t.level+1,a:t.a,p:t.p,k:t.k,promptStyle:t.promptStyle||'standard',guided:t.guided,stage:t.guided?t.stage:2,answers:t.values.map(parse),hints:t.hints,failures:t.failures}:null;}
function automaticPacket(event,task){return {schemaVersion:3,requestId:uid(),revision:state.revision,event,task,finished:event!=='select'&&!!state.current?.solved,records:state.records.slice(0,200).map(r=>({skill:r.skill,level:r.level,independent:r.independent,hints:r.hints,revealed:r.revealed,exit:r.exit,aiAssisted:!!r.aiAssisted,signature:r.signature||''})),practiceLimit:state.practiceLimit};}
function paintAutomatic(){
 const t=state.current;
 shortMathText($('#autoCoachText'),autoView.text||(autoTransport.enabled?'Nach dem Prüfen erhältst du eine kurze Rückmeldung. Dein Tutor wählt passende Folgeaufgaben.':'Du übst mit den integrierten Hinweisen. Die Online-Lernbegleitung ist hier noch nicht verbunden.'));
 $('#autoCoachSource').textContent=autoBusy?'Dein Tutor schaut auf deinen Rechenschritt …':autoView.source==='fobizz'?'Rückmeldung deines Tutors':autoTransport.enabled?'Integrierte Rückmeldung · Tutor bei Bedarf erreichbar':'Integrierte Lernbegleitung';
 $('#autoCoachCard').dataset.state=autoBusy?'loading':autoView.source;
 $('#autoCoachCard').dataset.tone=autoView.tone||'neutral';$('#autoCoachIcon').textContent=autoView.tone==='correct'?'✓':autoView.tone==='incorrect'?'!':'✦';
 if(t&&state.page==='practice'){$('#nextTask').disabled=autoBusy;$('#check').disabled=t.solved||autoSelecting;for(const id of ['#v0','#v1'])$(id).disabled=t.solved||autoSelecting;$('#hint').disabled=t.solved||t.hints>=2||autoSelecting;$('#worked').disabled=autoSelecting;}
}
function shortMathText(node,text){
 node.replaceChildren();
 // Unicode-Grenzen verhindern z. B. ein mathematisches r mitten in „für“.
 for(const part of text.split(/((?<![\p{L}\p{N}])[abcdeprxz](?:=[+-]?\d+(?:[.,]\d+)?)?(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])[+-]?\d+(?:[.,]\d+)?(?![\p{L}\p{N}]))/gu)){
  if(/^(?:[abcdeprxz](?:=[+-]?\d+(?:[.,]\d+)?)?|[+-]?\d+(?:[.,]\d+)?)$/.test(part)){const span=document.createElement('span');span.dataset.tex=part.replace(/[.,]/g,'{,}');node.append(span);}else if(part)node.append(document.createTextNode(part));
 }render(node);
}
function allowedAutomaticPlan(plan,selection){
 if(!validPlan(plan))return false;
 const n=state.records.length,skill=plan.skill,counts=skills.map(k=>state.records.filter(r=>r.skill===k&&!r.exit).length);
 if(n===state.practiceLimit&&skill!=='expand'||n===state.practiceLimit+1&&skill!=='complete')return false;
 if(n<state.practiceLimit&&counts[skills.indexOf(skill)]>=state.practiceLimit/2)return false;
 let max=state.stats[skill].level;if(n>=state.practiceLimit&&n<state.total)max=Math.min(max,exitLevel(skill));
 if(plan.level-1>max||plan.level===3&&plan.p===0&&!state.records.some(r=>r.skill===skill&&r.level===2&&r.independent))return false;
 if(state.records.filter(r=>r.skill===skill).slice(-5).some(r=>r.signature===signature(plan)))return false;
 return selection||!state.current||signature(plan)!==signature(state.current);
}
async function automaticRequest(event,submitted=null){
 if(!autoTransport.enabled){paintAutomatic();return;}
 const gen=++autoGeneration,stamp=inputSnapshot(),revision=state.revision,currentId=state.current?.id,selection=event==='select';
 const packet=automaticPacket(event,selection?null:submitted);
 const localFeedback=autoView.text,localTone=autoView.tone||'neutral';autoBusy=true;autoSelecting=selection;paintAutomatic();
 try{
  const r=await autoTransport.request(packet);
  if(gen!==autoGeneration||revision!==state.revision||stamp!==inputSnapshot()||currentId!==state.current?.id)return;
  if(r.taskPlan&&!allowedAutomaticPlan(r.taskPlan,selection))throw Error('INVALID_PLAN');
  if(selection&&!r.taskPlan)throw Error('MISSING_PLAN');
  const correct=submitted&&currentExpected({...submitted,level:submitted.level-1,b:2*submitted.a*submitted.p,c:submitted.a*submitted.p*submitted.p+submitted.k}).every((v,i)=>eq(v,submitted.answers[i]));
  if(event==='checked'&&r.feedbackKind!==(correct?'praise':'hint'))throw Error('INVALID_FEEDBACK_KIND');
  if(selection){
   const old=state.current,p=r.taskPlan;
   Object.assign(old,{skill:p.skill,level:p.level-1,a:p.a,p:p.p,k:p.k,b:2*p.a*p.p,c:p.a*p.p*p.p+p.k,source:'fobizz',promptStyle:p.promptStyle,guided:p.skill==='complete'&&!old.exit,stage:p.skill==='complete'&&!old.exit?0:2});
   state.revision++;save();paintTask();
  }else if(r.taskPlan)state.queue={focus:r.taskPlan.skill,level:r.taskPlan.level-1,challenge:'maintain',plan:r.taskPlan,automatic:true};
  if(!selection&&r.feedbackKind==='hint'&&state.current&&!state.current.solved)state.current.aiAssisted=true;
  autoView={text:r.feedback,source:'fobizz',tone:event==='checked'?(correct?'correct':'incorrect'):'neutral'};save();
 }catch(e){if(gen===autoGeneration)autoView={text:selection?'Deine nächste Aufgabe ist bereit. Heute übernimmt die integrierte Aufgabensteuerung.':localFeedback||'Die integrierte Prüfung gilt weiter. Du kannst weiterüben.',source:'local',tone:selection?'neutral':localTone};}
 finally{if(gen===autoGeneration){autoBusy=false;autoSelecting=false;paintAutomatic();if(autoView.source==='fobizz')shortMathText($('#autoCoachText'),autoView.text);}}
}
function checkWithTutor(){
 if(autoSelecting)return;
 const task=automaticTask(),attempts=state.current?.attempts;check();
 if(task&&state.current?.attempts>attempts){
  const t={...task,level:task.level-1,b:2*task.a*task.p,c:task.a*task.p*task.p+task.k},correct=currentExpected(t).every((v,i)=>eq(v,task.answers[i]));
  autoView={text:correct?(state.current.solved?'Gut gemacht – deine Umwandlung stimmt.':'Richtig gerechnet. Gehe jetzt zum nächsten Rechenschritt.'):$('#taskFeedback').textContent,source:'local',tone:correct?'correct':'incorrect'};
  paintAutomatic();void automaticRequest('checked',task);
 }else if(task&&!state.current.solved&&task.answers.includes(null)){
  autoView={text:$('#taskFeedback').textContent,source:'local',tone:'invalid'};paintAutomatic();
 }
}

function cancelAutomatic(){autoGeneration++;autoBusy=false;autoSelecting=false;autoView={text:'',source:'local'};autoTransport.reset();paintAutomatic();}
// Öffentliche reine Funktionen dienen unabhängigen Fach- und Regressionstests.
globalThis.Formenwechsel={parse,poly,vertex,parameters,makeTask,diagnostic,currentExpected,restore,validPlan,automaticPacket,allowedAutomaticPlan,automaticRequest,getState:()=>JSON.parse(JSON.stringify(state))};
$('#resume').onclick=()=>{if(state.current)showPage('practice');else newTask();};
$('#navIntro').onclick=()=>showPage('intro');
$('#navPractice').onclick=()=>{if(state.current)showPage('practice');else newTask();};
$('#tabComplete').onclick=()=>{state.lessonTab='complete';state.lessonStep=0;save();paintLesson();};
$('#tabExpand').onclick=()=>{state.lessonTab='expand';state.lessonStep=0;save();paintLesson();};
for(const id of ['#tabComplete','#tabExpand'])$(id).onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const target=e.key==='Home'?'#tabComplete':e.key==='End'?'#tabExpand':id==='#tabComplete'?'#tabExpand':'#tabComplete';$(target).onclick();$(target).focus();}};
$('#lessonNext').onclick=()=>{state.lessonStep++;save();paintLesson();};
$('#lessonReset').onclick=()=>{state.lessonStep=0;save();paintLesson();};
for(const key of ['p','q']){$(`#${key}Slider`).oninput=()=>setParameter(key,$(`#${key}Slider`).value);$(`#${key}Decrease`).onclick=()=>setParameter(key,state[key]-1);$(`#${key}Increase`).onclick=()=>setParameter(key,state[key]+1);}
$('#answerForm').onsubmit=e=>{e.preventDefault();checkWithTutor();};
$('#hint').onclick=()=>{const t=state.current;if(!t.solved&&t.hints<2){t.hints++;save();$('#hintBox').hidden=false;$('#hintBox').innerHTML=hintText(t);$('#hint').disabled=t.hints===2;$('#worked').hidden=t.failures<2&&t.hints<2;render($('#hintBox'));}};
$('#worked').onclick=()=>{if(autoSelecting)return;if(!state.current.solved&&(state.current.failures>=2||state.current.hints>=2)){const task=automaticTask();finish(false,true);void automaticRequest('revealed',task);}};
$('#nextTask').onclick=()=>{if(autoBusy)return;if(state.records.length>=state.total)showPage('summary');else{newTask();$('#taskTitle').focus();}};
$('#morePractice').onclick=()=>newTask();
$('#reset').onclick=()=>$('#resetDialog').showModal();
$('#cancelReset').onclick=()=>$('#resetDialog').close();
$('#confirmReset').onclick=()=>{cancelAutomatic();state=fresh();pending=null;save();paint();$('#resetDialog').close();};

paint();paintAutomatic();
})();

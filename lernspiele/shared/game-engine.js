/*
   Mathe-Lernspiele – gemeinsamer, dependency-freier Spielmotor.
   Die HTML-Dateien liefern nur GAME_META; Aufgaben und Darstellungen kommen
   aus math.js und den jahrgangsbezogenen Aufgabenmodulen.
*/
(function(){
  'use strict';
  const meta=window.GAME_META||{};
  const generator=window.G&&window.G[meta.id];
  const $=s=>document.querySelector(s);
  const app=$('#app');
  const STORAGE='mathe_lernspiel_'+meta.id+'_v2';
  const HINT_COOLDOWN=30000;
  const defaultState=()=>({stats:{},best:{},lastMode:'training',level:'0',levelStats:{}});
  function readState(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(STORAGE)||'{}')};}catch{return defaultState();}}
  let state=readState();
  const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{}};
  const escHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s).trim().replace(/−/g,'-').replace(/,/g,'.').replace(/\s+/g,'');
  const familyName=i=>(meta.skills||[])[i%Math.max(1,(meta.skills||[]).length)]||'Kompetenz';
  const activeStats=()=>{state.levelStats=state.levelStats||{};return state.levelStats[state.level||'0']||(state.levelStats[state.level||'0']={});};
  const levelName=()=>({'0':'Leicht','1':'Mittel','3':'Schwer',auto:'Automatisch'})[state.level||'0'];
  const skillData=skill=>activeStats()[skill]||(activeStats()[skill]={attempts:0,independent:0,correct:0,hints:0,errors:0});
  const difficulty=skill=>{if(state.level!=='auto')return Number(state.level||0);const s=skillData(skill);if(s.independent<3)return 0;if(s.independent<7)return 1;if(s.independent<12)return 2;return 3;};
  const random=(lo,hi)=>Math.floor(Math.random()*(hi-lo+1))+lo;
  const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=random(0,i);[x[i],x[j]]=[x[j],x[i]];}return x;};
  const answerNumbers=(x)=>Array.isArray(x)?x:[x];
  const numeric=raw=>{if(typeof parseNumber==='function')return parseNumber(raw);let n=Number(norm(raw));return Number.isFinite(n)?n:null;};
  function numberMatch(raw,expected,tol=0.0001){const a=numeric(raw),b=Number(expected);return a!==null&&Number.isFinite(b)&&Math.abs(a-b)<=tol+1e-9;}
  function numbersMatch(raws,expected,q){const a=answerNumbers(raws),b=answerNumbers(expected);if(a.length!==b.length)return false;const tol=q.tolerance||0.0001;const av=a.map(numeric),bv=b.map(Number);if(av.some(x=>x===null)||bv.some(x=>!Number.isFinite(x)))return false;if(q.unordered){const rest=[...bv];return av.every(x=>{const i=rest.findIndex(y=>Math.abs(x-y)<=tol+1e-9);if(i<0)return false;rest.splice(i,1);return true;});}return av.every((x,i)=>Math.abs(x-bv[i])<=tol+1e-9);}
  let session={mode:'training',index:0,total:12,correct:0,independent:0,usedHints:0,errors:0,started:null,remaining:[],current:null,history:[],hintUnlocked:1,hintTimer:null,locked:false,prediction:null};
  function shell(){
    app.innerHTML=`
      <div class="game-shell">
        <header class="game-header">
          <div class="eyebrow">${escHtml(meta.gradeTitle||meta.grade||'Mathematik')} · ${escHtml(meta.fieldTitle||'Mathematik')}</div>
          <h1>${escHtml(meta.title||'Mathe-Lernspiel')}</h1>
          <p class="subtitle">${escHtml(meta.topic||'Kompetenzorientiert üben')}</p>
          <div class="header-actions"><button class="icon-btn" id="helpBtn" type="button" aria-label="Spielhinweise">?</button><button class="icon-btn" id="resetBtn" type="button" aria-label="Lokalen Fortschritt zurücksetzen">↺</button></div>
        </header>
        <main>
          <section id="startView" class="panel start-view"></section>
          <section id="playView" class="hidden">
            <div class="status-row"><div><strong id="progressText"></strong><div class="progress-track" role="progressbar" aria-label="Bearbeitete Aufgaben" aria-valuemin="0" aria-valuemax="12" aria-valuenow="0"><span id="progressBar"></span></div></div><div class="stats"><span id="scoreText">0 Punkte</span><span id="heartText"></span><span id="timerText" aria-live="polite"></span></div></div>
            <div id="roundTrail" class="round-trail" aria-hidden="true"></div><section id="taskCard" class="task-card" aria-live="polite"></section>
          </section>
          <section id="summaryView" class="panel hidden"></section>
        </main>
        <footer><span>Dein Fortschritt wird nur auf diesem Gerät gespeichert.</span><span><a class="link-btn" href="${escHtml(meta.hubPath||'index.html')}">Materialübersicht</a> <button id="homeBtn" class="link-btn hidden" type="button">Zur Auswahl</button></span></footer>
      </div>
      <div id="helpDialog" class="dialog hidden" role="dialog" aria-modal="true" aria-labelledby="helpTitle"><div class="dialog-card"><button id="closeHelp" class="close" type="button" aria-label="Schließen">×</button><h2 id="helpTitle">So funktioniert die Mission</h2><p>Du bearbeitest kurze Aufgaben. Nach jeder Antwort erhältst du eine mathematische Rückmeldung. Bei Fehlern wird dieselbe Kompetenz später mit neuen Zahlen wiederholt.</p><p>Im Training kannst du Hinweise nutzen. Der zweite und dritte Hinweis werden nach jeweils 30 Sekunden freigeschaltet. Die Mission zählt nur selbstständige Erstlösungen für das Kompetenzprofil.</p></div></div>
      <section id="certificate" class="certificate hidden"><p class="cert-kicker">Teilnehmerurkunde</p><h1>${escHtml(meta.title||'Mathe-Lernspiel')}</h1><p>Diese Urkunde bestätigt, dass</p><input id="certName" placeholder="Vorname oder Nickname" aria-label="Name für die Urkunde"><p>die Lernmission erfolgreich abgeschlossen hat.</p><p class="cert-detail">Trainiert wurden: ${escHtml((meta.skills||[]).join(' · '))}</p><p id="certDate"></p><button id="printCert" type="button">Urkunde drucken / als PDF sichern</button></section>`;
    $('#helpBtn').onclick=()=>$('#helpDialog').classList.remove('hidden');
    $('#closeHelp').onclick=()=>$('#helpDialog').classList.add('hidden');
    $('#helpDialog').onclick=e=>{if(e.target.id==='helpDialog')$('#helpDialog').classList.add('hidden');};
    $('#resetBtn').onclick=()=>{if(confirm('Nur den lokalen Fortschritt dieses Spiels zurücksetzen?')){state=defaultState();save();renderStart();}};
    $('#homeBtn').onclick=()=>{stopTimer();renderStart();};
  }
  function renderStart(){
    document.body.dataset.playing='false';clearInterval(session.hintTimer);$('#certificate').classList.add('hidden');
    stopTimer();session={...session,index:0,total:12,correct:0,independent:0,usedHints:0,errors:0,started:null,remaining:[],current:null,hintUnlocked:1,prediction:null};
    $('#playView').classList.add('hidden');$('#summaryView').classList.add('hidden');$('#homeBtn').classList.add('hidden');$('#startView').classList.remove('hidden');
    const isJunior=['5','6'].includes(String(meta.grade));
    const best=state.best||{};
    $('#startView').innerHTML=`<div class="start-intro"><div><p class="section-kicker">DEINE NÄCHSTE RUNDE</p><h2>Entdecken. Üben. Weiterkommen.</h2></div><p class="lead">${escHtml(meta.goal||'Wende mathematische Strategien an und erkläre deine Entscheidung.')}</p></div><div class="setup-grid"><fieldset class="difficulty-picker"><legend>01 · Deine Schwierigkeit</legend><label for="difficultySelect">Womit möchtest du starten?</label><select id="difficultySelect"><option value="0">Leicht</option><option value="1">Mittel</option><option value="3">Schwer</option><option value="auto">Automatisch steigern</option></select><p id="difficultyDescription"></p><p class="difficulty-note">Du kannst vor jeder Runde neu wählen. Deine feste Stufe bleibt während der Runde gleich.</p></fieldset><section class="mode-picker"><h3>02 · Dein Spielmodus</h3><div class="mode-grid">${[
      ['training','Üben','12 Aufgaben · ohne Zeitdruck · mit Tipps'],
      ['mission','Mission',`12 Aufgaben · 3 Herzen · ${isJunior?'8':'15'} Minuten`],
      ['exam','Prüfungsmodus','10 Aufgaben · 20 Minuten · ohne Tipps']
    ].map(([mode,title,detail])=>`<button class="mode-card" data-mode="${mode}" type="button"><span class="mode-icon" aria-hidden="true">${window.GameLook?.icon(mode)||''}</span><span class="mode-copy"><strong>${title}</strong><small>${detail}</small></span><span class="mode-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></section></div><details class="start-notes"><summary>Kompetenzen & letzter Fortschritt</summary><p><strong>Das trainierst du:</strong> ${escHtml((meta.skills||[]).join(' · '))}</p><p><strong>Letzter Fortschritt:</strong> ${best.score!==undefined?`${best.score}/${best.total} Punkte (${best.level||'frühere Runde'})`:'Noch keine Runde abgeschlossen.'}</p></details>`;
    $('#difficultySelect').value=state.level||'0';
    const describe=()=>{const specific=meta.id==='gleichung'?' Äquivalenzumformungen: leicht eine Ergebnislücke, mittel mehrere Lücken, schwer Variablen auf beiden Seiten und fehlende Umformungszahlen.':'';$('#difficultyDescription').textContent=({'0':'Kleine Einstiegswerte, soweit vorgesehen; im Üben und in der Mission wird der erste Tipp direkt gezeigt.','1':'Mehr Selbstständigkeit: Hinweise nur auf Wunsch; mittlere Zahlen bei skalierbaren Aufgaben.','3':'Größere Zahlen bei skalierbaren Aufgaben. Hinweise bleiben freiwillig; Begriffsfragen behalten ihren fachlichen Kern.',auto:'Die Zahlenstufe wächst mit selbstständigen Lösungen. Hinweise bleiben freiwillig.'})[state.level||'0']+specific+' Im Prüfungsmodus gibt es auf keiner Stufe Tipps.';};
    describe();$('#difficultySelect').onchange=e=>{state.level=e.target.value;save();describe();};
    $('#startView').querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>start(b.dataset.mode));
  }
  function start(mode){
    document.body.dataset.playing='true';$('#certificate').classList.add('hidden');
    session={...session,mode,index:0,total:mode==='exam'?10:12,correct:0,independent:0,usedHints:0,errors:0,started:Date.now(),remaining:[],current:null,hintUnlocked:1,prediction:null,history:[]};
    $('#startView').classList.add('hidden');$('#summaryView').classList.add('hidden');$('#playView').classList.remove('hidden');$('#homeBtn').classList.remove('hidden');
    updateStatus();showNext();
    if(mode!=='training')startTimer(mode==='exam'?1200:(['5','6'].includes(String(meta.grade))?480:900));
  }
  let timerId=null,timerEnd=0;
  function startTimer(seconds){timerEnd=Date.now()+seconds*1000;clearInterval(timerId);timerId=setInterval(()=>{const left=Math.max(0,timerEnd-Date.now());$('#timerText').textContent='⏱ '+Math.ceil(left/1000)+' s';if(left<=0){clearInterval(timerId);finish(true);}},500);}
  function stopTimer(){clearInterval(timerId);timerId=null;$('#timerText').textContent='';}
  function updateStatus(){const trail=$('#roundTrail');if(trail)trail.innerHTML=Array.from({length:session.total},(_,i)=>`<span class="${i<session.index?'done':i===session.index?'current':''}"></span>`).join('');const track=$('.progress-track');track.setAttribute('aria-valuemax',session.total);track.setAttribute('aria-valuenow',Math.min(session.index,session.total));const pct=Math.round(100*session.index/session.total);$('#progressText').textContent=`${levelName()} · Aufgabe ${Math.min(session.index+1,session.total)} von ${session.total}`;$('#progressBar').style.width=pct+'%';$('#scoreText').textContent=`${session.correct} richtig · ${session.independent} selbstständig`;$('#heartText').textContent=session.mode==='mission'?'❤ '.repeat(Math.max(0,3-session.errors)):'';}
  function nextDescriptor(){
    const family=session.remaining.length?session.remaining.shift():session.index%4;
    const skill=familyName(family),q=generator(family,difficulty(skill),random,session.index);
    q.level=difficulty(skill);q.family=family;q.skill=skill;q.started=Date.now();return q;
  }
  function showNext(){
    if(session.index>=session.total){finish(false);return;}
    session.current=nextDescriptor();session.hintUnlocked=1;session.usedHints=0;session.prediction=null;session.locked=false;updateStatus();renderTask(session.current);
  }
  function commonTaskHead(q){return `<div class="task-meta"><span class="task-type">${escHtml(q.operator||'mathematisch handeln')}</span><span class="skill-pill">${escHtml(q.skill)}</span></div><h2>${q.prompt}</h2>${q.visual?`<div class="visual">${q.visual}</div>`:''}`;}
  function renderTask(q){
    const card=$('#taskCard');
    card.innerHTML=commonTaskHead(q)+'<div id="workspace"></div><div id="hintArea"></div><div id="feedback" class="feedback hidden"></div>';
    renderWorkspace(q);
    renderHintArea(q);
  }
  function renderHintArea(q){
    clearInterval(session.hintTimer);session.hintTimer=null;
    const h=$('#hintArea');if(session.mode==='exam'){h.innerHTML='<p class="hint-muted">Im Prüfungsmodus sind Hinweise ausgeschaltet.</p>';return;}
    h.innerHTML=`<div class="hint-row"><button id="hintBtn" class="soft-btn" type="button">Tipp anzeigen</button><span id="hintStatus">Tipp 1 von ${q.hints?.length||0} verfügbar</span></div>`;
    $('#hintBtn').onclick=()=>{const now=Date.now();if(session.hintUnlocked>(q.hints||[]).length)return;if(session.hintUnlocked>1&&now<session.nextHintAt){setHintStatus();return;}const text=q.hints[session.hintUnlocked-1];session.usedHints++;skillData(q.skill).hints++;save();const box=document.createElement('div');box.className='hint-card';box.innerHTML=`<strong>Tipp ${session.hintUnlocked}:</strong> ${escHtml(text)}`;h.appendChild(box);session.hintUnlocked++;session.nextHintAt=Date.now()+HINT_COOLDOWN;setHintStatus();};
    function setHintStatus(){const left=Math.max(0,(session.nextHintAt||0)-Date.now());$('#hintStatus').textContent=left?`Tipp ${session.hintUnlocked} in ${Math.ceil(left/1000)} s verfügbar`:`Tipp ${session.hintUnlocked} von ${q.hints.length} verfügbar`;}
    if(q.level===0&&q.hints?.length){$('#hintBtn').click();}
    if(q.hints?.length>1){session.hintTimer=setInterval(()=>{if($('#hintStatus'))setHintStatus();},500);}
  }
  function renderWorkspace(q){
    const w=$('#workspace');
    if(q.type==='gaps')return renderGaps(q,w);
    if(q.type==='num')return renderNum(q,w);
    if(q.type==='choice')return renderChoice(q,w);
    if(q.type==='order')return renderOrder(q,w);
    if(q.type==='paint')return renderPaint(q,w);
    if(q.type==='error')return renderError(q,w);
    if(q.type==='target')return renderTarget(q,w);
    w.innerHTML='<p>Aufgabentyp nicht verfügbar.</p>';
  }
  function submitButton(label='Antwort prüfen'){return `<button class="primary-btn submit-btn" type="button">${label}</button>`;}
  function renderGaps(q,w){
    w.innerHTML='<p>Fülle die Lücken. Jede Umformung gilt auf beiden Seiten.</p><div class="equation-lines" tabindex="0" role="region" aria-label="Lösungsweg, bei Bedarf seitlich wischen">'+q.lines.map(row=>'<div class="equation-row">'+row.map(cell=>'<span>'+cell.replace(/\{(\d+)\}/g,(_,i)=>`<input class="answer-input gap-input" data-i="${i}" aria-label="${escHtml(q.labels[i])}" inputmode="decimal" autocomplete="off">`)+'</span>').join('')+'</div>').join('')+'</div>'+submitButton();
    w.querySelector('.submit-btn').onclick=()=>check(q,readNum(q));
  }
  function renderNum(q,w){
    const vals=answerNumbers(q.answer),labels=q.labels||[];
    w.innerHTML=`<div class="input-grid">${vals.map((_,i)=>`<label>${escHtml(labels[i]|| (vals.length>1?`Wert ${i+1}`:'Antwort'))}<input class="answer-input" data-i="${i}" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="${escHtml(labels[i]||'Antwort')}"></label>`).join('')}</div>${q.unit?`<span class="unit-note">${escHtml(q.unit)}</span>`:''}${submitButton()}`;
    w.querySelector('.submit-btn').onclick=()=>check(q,readNum(q));/* Focus is user initiated: do not open the iPad keyboard on task changes. */
  }
  function readNum(q){return [...document.querySelectorAll('.answer-input')].sort((a,b)=>a.dataset.i-b.dataset.i).map(x=>x.value);}
  function renderChoice(q,w){
    // Keep the selected value in JavaScript rather than in an escaped HTML
    // attribute.  Correct options can themselves contain fraction/markup
    // spans, so comparing an escaped dataset value would reject them.
    const choices=shuffle(q.choices||[]);w.innerHTML=`<div class="choice-grid">${choices.map((c,i)=>`<button class="choice-btn" data-index="${i}" type="button">${c}</button>`).join('')}</div>${submitButton('Auswahl prüfen')}`;
    let selected=null;w.querySelectorAll('.choice-btn').forEach(b=>b.onclick=()=>{w.querySelectorAll('.choice-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selected=choices[Number(b.dataset.index)];});w.querySelector('.submit-btn').onclick=()=>check(q,selected);
  }
  function renderOrder(q,w){
    let selected=[];const cards=shuffle(q.answer.map((x,i)=>({x,i})));
    w.innerHTML=`<p class="instruction">Tippe die Schritte in der richtigen Reihenfolge an.</p><div class="order-cards">${cards.map(c=>`<button type="button" class="order-card" data-i="${c.i}">${c.x}</button>`).join('')}</div><div id="orderSelected" class="order-selected" aria-live="polite">Noch kein Schritt ausgewählt.</div><div class="order-actions"><button class="soft-btn" id="orderUndo" type="button">Letzten Schritt zurücknehmen</button>${submitButton('Reihenfolge prüfen')}</div>`;
    const update=()=>$('#orderSelected').innerHTML=selected.length?selected.map((x,i)=>`<span>${i+1}. ${x}</span>`).join(''):'Noch kein Schritt ausgewählt.';
    w.querySelectorAll('.order-card').forEach(b=>b.onclick=()=>{if(selected.length>=q.answer.length)return;selected.push(q.answer[Number(b.dataset.i)]);b.disabled=true;b.classList.add('picked');update();});$('#orderUndo').onclick=()=>{if(!selected.length)return;const last=selected.pop();const btn=[...w.querySelectorAll('.order-card')].find(b=>b.textContent===last);if(btn){btn.disabled=false;btn.classList.remove('picked');}update();};w.querySelector('.submit-btn').onclick=()=>check(q,selected);
  }
  function renderPaint(q,w){
    const total=q.total||8,cols=q.cols||Math.min(8,total),rows=q.rows||Math.ceil(total/cols),target=new Set(q.answer||[]),fixed=new Set(q.fixed||[]);let selected=new Set(fixed);
    w.innerHTML=`<p class="instruction">${q.mirror?'Tippe die Kästchen an, die du spiegeln möchtest.':'Tippe die Kästchen an, die gefärbt werden sollen.'}</p><div class="paint-scroll" tabindex="0" role="region" aria-label="Kästchenfeld, bei Bedarf seitlich wischen"><div class="paint-grid" style="--cols:${cols};--rows:${rows}">${Array.from({length:total},(_,i)=>`<button class="paint-cell${fixed.has(i)?' fixed':''}" data-i="${i}" type="button" aria-label="Kästchen ${i+1}"></button>`).join('')}</div></div>${submitButton(q.mirror?'Spiegelbild prüfen':'Färbung prüfen')}`;
    w.querySelectorAll('.paint-cell').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.i);if(fixed.has(i))return;if(selected.has(i)){selected.delete(i);b.classList.remove('on');}else{selected.add(i);b.classList.add('on');}});w.querySelector('.submit-btn').onclick=()=>check(q,[...selected]);
  }
  function renderError(q,w){
    let idx=null,reason=null;const arr=answerNumbers(q.answer);
    w.innerHTML=`<p class="instruction">Tippe zuerst die fehlerhafte Zeile an und wähle danach die Fehlerart.</p><div class="error-steps">${q.steps.map((s,i)=>`<button type="button" class="error-step" data-i="${i}"><span>${i+1}</span>${s}</button>`).join('')}</div><div class="reason-grid">${(q.reasons||[]).map((s,i)=>`<button type="button" class="reason-btn" data-i="${i}">${s}</button>`).join('')}</div><div class="input-grid">${arr.map((_,i)=>`<label>${escHtml(q.labels?.[i]||'Korrektur')}<input class="answer-input" data-i="${i}" inputmode="decimal" autocomplete="off"></label>`).join('')}</div>${submitButton('Fehlerdiagnose prüfen')}`;
    w.querySelectorAll('.error-step').forEach(b=>b.onclick=()=>{w.querySelectorAll('.error-step').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');idx=Number(b.dataset.i);});w.querySelectorAll('.reason-btn').forEach(b=>b.onclick=()=>{w.querySelectorAll('.reason-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');reason=q.reasons[Number(b.dataset.i)];});w.querySelector('.submit-btn').onclick=()=>check(q,{idx,reason,values:readNum(q)});
  }
  function renderTarget(q,w){
    const lab=q.lab||{};if(q.predict&&!session.prediction){w.innerHTML=`<p class="instruction">Treffe zuerst eine Vorhersage. Beobachte danach die Veränderung.</p><div class="choice-grid prediction-grid">${q.predict.map(x=>`<button class="choice-btn" data-predict="${escHtml(x)}" type="button">${x}</button>`).join('')}</div>`;w.querySelectorAll('[data-predict]').forEach(b=>b.onclick=()=>{session.prediction=b.dataset.predict;renderTarget(q,w);});return;}
    const kind=lab.kind||'linear';let controls='';
    if(kind==='linear')controls=rangeControl('m','Steigung',-4,4,.5,lab.target?.[0]??1)+rangeControl('b','y-Achsenabschnitt',-4,4,.5,lab.target?.[1]??0);
    else if(kind==='parabola')controls=rangeControl('a','Öffnungsfaktor',.5,2,.5,lab.target?.[0]??1)+rangeControl('h','Scheitel-x',-3,3,1,lab.target?.[1]??0)+rangeControl('k','Scheitel-y',-3,3,1,lab.target?.[2]??0);
    else if(kind==='sinus')controls=rangeControl('A','Amplitude',1,4,1,lab.target?.[0]??1)+rangeControl('T','Periode',4,8,1,lab.target?.[1]??6);
    else if(kind==='secant')controls=rangeControl('delta','Abstand zur Tangentenstelle',.05,2,.05,lab.target?.[0]??.05);
    else if(kind==='riemann')controls=rangeControl('n','Rechtecke',1,20,1,lab.target?.[0]??8);
    else if(kind==='coin')controls=`<button class="soft-btn" id="simulateCoin" type="button">100 Würfe simulieren</button><div id="coinResult" class="simulation-result"></div>`;
    w.innerHTML=`${session.prediction?`<p class="prediction-note">Deine Vorhersage: <strong>${escHtml(session.prediction)}</strong></p>`:''}<div class="lab-controls">${controls}</div><div id="labVisual" class="visual"></div>${kind!=='coin'?submitButton('Beobachtung und Antwort prüfen'):''}`;
    if(kind==='coin'){$('#simulateCoin').onclick=()=>{$('#coinResult').textContent='Kopf: '+Array.from({length:100},()=>Math.random()<.5?1:0).reduce((a,b)=>a+b,0)+' · Zahl: siehe Streuung';};return;}
    const draw=()=>{const val=readRanges();$('#labVisual').innerHTML=labVisual(kind,val);};w.querySelectorAll('input[type=range]').forEach(x=>x.oninput=()=>{x.nextElementSibling.textContent=x.value;draw();});draw();w.querySelector('.submit-btn').onclick=()=>check(q,readRanges());
    function rangeControl(id,label,min,max,step,value){return `<label class="range-label">${label}<input type="range" data-range="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><output>${value}</output></label>`;}
    function readRanges(){const o={};w.querySelectorAll('[data-range]').forEach(x=>o[x.dataset.range]=Number(x.value));return o;}
  }
  function labVisual(kind,v){
    if(kind==='linear'){const m=v.m??1,b=v.b??0;return plot([{fn:x=>m*x+b,color:'#245cad'},{fn:x=>m*x+b,color:'#a45129',dash:true}],[-5,5,-6,6]);}
    if(kind==='parabola'){const a=v.a??1,h=v.h??0,k=v.k??0;return plot([{fn:x=>a*(x-h)**2+k,color:'#245cad'}],[-5,5,-6,6],[[h,k,'S']]);}
    if(kind==='sinus'){const A=v.A??1,T=v.T??6;return plot([{fn:x=>A*Math.sin(2*Math.PI*x/T),color:'#245cad'}],[0,T,-A-1,A+1]);}
    if(kind==='secant'){const delta=v.delta??.5;const x0=1;const y0=x0*x0;const x1=x0+delta,y1=x1*x1;return plot([{fn:x=>x*x,color:'#245cad'}],[0,3,0,10],[[x0,y0,'T'],[x1,y1]]).replace('</svg>',`<line x1="0" y1="0" x2="0" y2="0"/></svg>`);}
    if(kind==='riemann'){const n=Math.round(v.n??4),w=4/n;let body='';for(let i=0;i<n;i++){const x=i*w,h=(x+w/2)**2;body+=`<rect x="${60+i*330/n}" y="${220-h*12}" width="${330/n-1}" height="${h*12}" fill="#83c4b8"/>`; }return svg(body+tx(240,250,`${n} Rechtecke`,'text-anchor="middle"'),'Rechtecksumme unter f(x)=x²','0 0 480 270');}
    return '';
  }
  function readError(q,obj){return numbersMatch(obj.values,q.answer,q);}
  function check(q,input){
    if(session.locked)return;let correct=false;
    if(q.type==='num'||q.type==='gaps')correct=numbersMatch(input,q.answer,q);
    if(q.type==='choice')correct=input===q.answer;
    if(q.type==='order')correct=Array.isArray(input)&&input.length===q.answer.length&&input.every((x,i)=>x===q.answer[i]);
    if(q.type==='paint'){const a=[...(input||[])].sort((a,b)=>a-b),b=[...(q.answer||[])].sort((a,b)=>a-b);correct=a.length===b.length&&a.every((x,i)=>x===b[i]);}
    if(q.type==='error')correct=input&&input.idx===q.wrong&&input.reason===q.reason&&readError(q,input);
    if(q.type==='target')correct=targetMatch(q,input);
    session.locked=true;document.querySelectorAll('#workspace button,#workspace input').forEach(x=>x.disabled=true);const gameOver=record(q,!!correct,session.usedHints>0);showFeedback(q,!!correct,gameOver);updateStatus();
  }
  function targetMatch(q,v){const t=q.lab?.target||q.answer||[];const kind=q.lab?.kind;if(kind==='linear')return Math.abs(v.m-t[0])<.01&&Math.abs(v.b-t[1])<.01;if(kind==='parabola')return ['a','h','k'].every((x,i)=>Math.abs(v[x]-t[i])<.01);if(kind==='sinus')return Math.abs(v.A-t[0])<.01&&Math.abs(v.T-t[1])<.01;if(kind==='secant')return Math.abs(v.delta-t[0])<.051;if(kind==='riemann')return Math.round(v.n)===Math.round(t[0]);return true;}
  function record(q,correct,usedHint){const d=skillData(q.skill);d.attempts++;if(correct)d.correct++;if(correct&&!usedHint){d.independent++;session.independent++;}if(!correct){d.errors++;session.errors++;if(session.mode==='mission'&&session.errors>=3){session.history.push({q,correct:false,usedHint});return true;}}if(correct)session.correct++;session.history.push({q,correct,usedHint});if(!correct&&session.index+2<session.total)session.remaining.push(q.family);session.index++;return false;}
  function showFeedback(q,correct,gameOver=false){
    const f=$('#feedback');f.className='feedback '+(correct?'good':'needs-work');const detail=session.mode==='exam'?'Die vollständige Rückmeldung erscheint in der Auswertung.':(correct?`Richtig. ${q.solution||''}`:`Noch nicht. ${q.solution||''}`);f.innerHTML=`<strong>${correct?'✓ Gut gelöst':'↺ Diese Kompetenz kommt später noch einmal'}</strong><p>${detail}</p>${!correct&&q.reason?`<p><strong>Fehleridee:</strong> ${escHtml(q.reason)}</p>`:''}<button id="nextBtn" class="primary-btn" type="button">${gameOver?'Auswertung anzeigen':'Weiter'}</button>`;f.classList.remove('hidden');$('#nextBtn').onclick=()=>{if(gameOver){finish(true);return;}if(session.mode==='mission'&&session.errors>=3){finish(true);return;}showNext();};if(gameOver){$('#nextBtn').textContent='Auswertung anzeigen';}}
  function finish(forced){stopTimer();clearInterval(session.hintTimer);$('#playView').classList.add('hidden');$('#summaryView').classList.remove('hidden');$('#homeBtn').classList.remove('hidden');const total=session.total,score=session.correct,percent=Math.round(100*score/Math.max(1,total));const best=state.best||{};if(!best.score||score>best.score)state.best={score,total,level:levelName(),date:new Date().toISOString()};state.lastMode=session.mode;save();const rows=(meta.skills||[]).map(s=>{const d=activeStats()[s]||{};const p=d.attempts?Math.round(100*d.independent/d.attempts):0;return `<tr><td>${escHtml(s)}</td><td>${d.independent||0}</td><td>${d.attempts||0}</td><td><span class="mini-bar"><i style="width:${Math.min(100,p)}%"></i></span>${p}%</td></tr>`;}).join('');$('#summaryView').innerHTML=`<div class="summary-mark">${percent>=80?'★':'·'}</div><h2>${forced?'Runde beendet':'Runde geschafft'}</h2><p>Schwierigkeit: ${levelName()} · Kompetenzprofil nur für diese Auswahl</p><p class="summary-score">${score} von ${total} Aufgaben richtig · ${percent}%</p><p>${percent>=80?'Du hast viele Kompetenzen sicher gezeigt.':'Nutze die Rückmeldungen und starte eine weitere Runde – die schwächeren Kompetenzen werden bevorzugt wiederholt.'}</p><div class="tablewrap"><table><thead><tr><th>Kompetenz</th><th>Selbstständig</th><th>Versuche</th><th>Profil</th></tr></thead><tbody>${rows}</tbody></table></div><div class="summary-actions"><button id="againBtn" class="primary-btn" type="button">Noch eine Runde</button><button id="certBtn" class="soft-btn" type="button">Teilnehmerurkunde</button></div><p class="summary-note">Das Profil zählt nur Erstlösungen ohne Hinweis. Es behauptet keine Beherrschung, wenn noch zu wenige Aufgaben vorliegen.</p>`;$('#againBtn').onclick=()=>start(session.mode);$('#certBtn').onclick=()=>showCertificate();}
  function showCertificate(){const cert=$('#certificate');cert.classList.remove('hidden');$('#certDate').textContent='Schwierigkeit: '+levelName()+' · Datum: '+new Date().toLocaleDateString('de-DE');$('#printCert').onclick=()=>{document.body.classList.add('print-certificate');window.print();setTimeout(()=>document.body.classList.remove('print-certificate'),400);};cert.scrollIntoView({behavior:'smooth'});}
  if(!generator){app.innerHTML='<p>Für dieses Spiel wurde keine Aufgabenbank geladen.</p>';return;}shell();renderStart();
})();

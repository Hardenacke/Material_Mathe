/*
 * Eigene Offline-Algebra-Plättchen.
 *
 * The interaction is deliberately independent from Polypad: every tile is an
 * accessible button, and the same source also accepts a Pointer-Events drag.
 * The model uses signed counts. A positive and a negative tile form a
 * zero-pair and can be removed explicitly by the learner.
 */
(function(){
  'use strict';
  const TILE={
    x2:{label:'x²',short:'x²',className:'x2',value:'x²'},
    x:{label:'x',short:'x',className:'x',value:'x'},
    one:{label:'+1',short:'1',className:'one',value:'1'},
    negx:{label:'−x',short:'−x',className:'negx',value:'−x'},
    negone:{label:'−1',short:'−1',className:'negone',value:'−1'}
  };
  const TYPE_ORDER=['x2','x','one'];
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const sign=n=>n<0?'−':'+';
  const abs=n=>Math.abs(Number(n));
  const normaliseCounts=(counts)=>TYPE_ORDER.reduce((o,k)=>{o[k]=Number(counts?.[k]||0);return o;},{});
  function termHTML(counts,options={}){
    const c=normaliseCounts(counts),parts=[];
    TYPE_ORDER.forEach(k=>{const n=c[k];if(!n)return;const symbol=TILE[k].short;const coeff=abs(n)===1&&k!=='one'?'':String(abs(n));const body=k==='one'?String(abs(n)):(coeff+symbol);parts.push({n,body});});
    if(!parts.length)return '<span class="empty-term">0</span>';
    return parts.map((p,i)=>`<span class="term-part ${p.n<0?'negative':''}">${i===0?(p.n<0?'−':''):(p.n<0?' − ':' + ')}${p.n<0&&i===0&&p.body==='1'?'1':p.body}</span>`).join('');
  }
  function expressionText(counts){
    const c=normaliseCounts(counts),out=[];TYPE_ORDER.forEach(k=>{const n=c[k];if(!n)return;const coeff=abs(n)===1&&k!=='one'?'':abs(n);const body=k==='one'?String(abs(n)):`${coeff}${TILE[k].short}`;out.push((out.length?(n<0?' − ':' + '):(n<0?'−':' '))+body);});return out.join('').trim()||'0';
  }
  function tokensFromCounts(counts){
    const c=normaliseCounts(counts),out=[];
    if(c.x2>0)for(let i=0;i<c.x2;i++)out.push('x2');
    if(c.x2<0)for(let i=0;i<Math.abs(c.x2);i++)out.push('negx2');
    if(c.x>0)for(let i=0;i<c.x;i++)out.push('x');
    if(c.x<0)for(let i=0;i<Math.abs(c.x);i++)out.push('negx');
    if(c.one>0)for(let i=0;i<c.one;i++)out.push('one');
    if(c.one<0)for(let i=0;i<Math.abs(c.one);i++)out.push('negone');
    return out;
  }
  function tokenNet(tokens,base=''){
    const c={x2:0,x:0,one:0};(tokens||[]).forEach(t=>{if(t==='x2')c.x2++;else if(t==='negx2')c.x2--;else if(t==='x')c.x++;else if(t==='negx')c.x--;else if(t==='one')c.one++;else if(t==='negone')c.one--;});return c;
  }
  function tileElement(kind,attrs={}){
    const t=TILE[kind]||TILE.one;return `<button type="button" class="tile ${t.className}" data-kind="${kind}" ${Object.entries(attrs).map(([k,v])=>`data-${k}="${esc(v)}"`).join(' ')} aria-label="${esc(t.label)}">${t.short}<span class="tile-remove" aria-hidden="true">×</span></button>`;
  }
  function sourceElement(kind,showText=true){const t=TILE[kind];return `<button type="button" class="tile-source" data-source-kind="${kind}" aria-label="${esc(t.label)}"><span class="tile-swatch ${t.className}">${t.short}</span>${showText?`<span class="tile-label"><span class="tile-symbol">${esc(t.label)}</span><small>Plättchen</small></span>`:''}</button>`;}
  function feedback(root,kind,title,text){const el=$('.algebra-feedback',root);if(!el)return;el.className='algebra-feedback show '+kind;el.innerHTML=`<strong>${title}</strong><span>${text}</span>`;el.scrollIntoView?.({block:'nearest',behavior:'smooth'});}
  function clearFeedback(root){const el=$('.algebra-feedback',root);if(el){el.className='algebra-feedback';el.textContent='';}}
  function setScore(root,score,total,streak){const el=$('.algebra-score',root);if(el)el.innerHTML=`<span>Runde <strong>${score}</strong></span><span>·</span><span>Trefferquote <strong>${total?Math.round(score/total*100):0}%</strong></span>${streak?`<span>·</span><span>Serie <strong>${streak}</strong></span>`:''}`;}
  function bindPointerSources(root,onTap,onDrop){
    $$('.tile-source',root).forEach(el=>{
      let down=null,moved=false,ghost=null;
      const position=e=>{if(ghost){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';}};
      const clean=()=>{ghost?.remove();ghost=null;down=null;moved=false;el.classList.remove('dragging-source');document.querySelectorAll('.drop-hint').forEach(x=>x.classList.remove('drop-hint'));};
      el.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;down={x:e.clientX,y:e.clientY,id:e.pointerId};moved=false;el.setPointerCapture?.(e.pointerId);});
      el.addEventListener('pointermove',e=>{if(!down)return;const distance=Math.hypot(e.clientX-down.x,e.clientY-down.y);if(!moved&&distance>8){moved=true;ghost=el.cloneNode(true);ghost.className='tile-source drag-ghost';ghost.style.width=el.offsetWidth+'px';ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';document.body.append(ghost);el.classList.add('dragging-source');}if(moved){position(e);const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop-zone]');document.querySelectorAll('.drop-hint').forEach(x=>x.classList.remove('drop-hint'));target?.classList.add('drop-hint');}});
      el.addEventListener('pointerup',e=>{if(!down)return;const kind=el.dataset.sourceKind;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop-zone]');if(moved){if(target)onDrop(kind,target.dataset.dropZone);clean();}else{clean();onTap(kind);}});
      el.addEventListener('pointercancel',clean);
    });
  }
  function levelPicker(value){return `<label>Schwierigkeit <select class="algebra-level" aria-label="Schwierigkeit"><option value="auto" ${value==='auto'?'selected':''}>Automatisch</option><option value="easy" ${value==='easy'?'selected':''}>Leicht</option><option value="medium" ${value==='medium'?'selected':''}>Mittel</option><option value="hard" ${value==='hard'?'selected':''}>Schwer</option></select></label>`;}
  function autoLevel(score,total){if(total<3)return 'easy';const rate=score/total;return total>=7&&rate>=.8?'hard':total>=3&&rate>=.65?'medium':'easy';}
  function taskHeading(task,number){return `<div class="task-prompt"><span class="task-number">${number}</span><h2>${task.prompt} ${task.target?`<span class="math-expression">${termHTML(task.target)}</span>`:''}</h2></div>`;}
  function buildCountsLinear(level){
    if(level==='easy')return {x:rand(1,3),one:rand(1,6)};
    if(level==='medium')return {x:rand(-4,5)||2,one:rand(-5,8)||3};
    return {x:rand(-6,7)||3,one:rand(-9,10)||4};
  }
  function buildCountsQuadratic(level){
    const x2=1,x=level==='easy'?rand(1,4):level==='medium'?(rand(-5,6)||2):(rand(-7,8)||3),one=level==='easy'?rand(1,6):(rand(-8,10)||4);return {x2,x,one};
  }
  const termTasks={
    linear:(level)=>{const target=buildCountsLinear(level);return {prompt:'Baue den Term aus den passenden Plättchen.',target,hint:'Lege für jeden Summanden die passende Anzahl an Plättchen. Rote Plättchen bedeuten ein negatives Vorzeichen.',solution:`${expressionText(target)} besteht aus ${Math.abs(target.x)} x-Plättchen und ${Math.abs(target.one)} Einheitsplättchen${target.x<0||target.one<0?' mit den jeweils passenden Vorzeichen.':'.'}`};},
    quadratic:(level)=>{const target=buildCountsQuadratic(level);return {prompt:'Baue den Flächenterm aus x²-, x- und Einheitsplättchen.',target,hint:'Das große Quadrat steht für x². Ein x-Rechteck hat die Seiten x und 1. Ein kleines Quadrat steht für 1.',solution:`${expressionText(target)} benötigt ein x²-Plättchen, ${Math.abs(target.x)} x-Rechteck${Math.abs(target.x)===1?'':'e'} und ${Math.abs(target.one)} Einheitsplättchen.`};}
  };
  function initTermBuilder(root,quadratic=false){
    const config=window.ALGEBRA_GAME||{};let level='easy',taskLevel='easy',round=0,score=0,total=0,streak=0,task=null,placed={};
    const makeTask=()=>{taskLevel=level==='auto'?autoLevel(score,total):level;task=(quadratic?termTasks.quadratic:termTasks.linear)(taskLevel);placed={};round++;render();};
    const allowed=()=>quadratic?['x2','x','one',...(taskLevel!=='easy'?['negx','negone']:[])]:['x','one',...(taskLevel!=='easy'?['negx','negone']:[])];
    function render(){
      root.innerHTML=`<div class="algebra-controls"><div class="algebra-score"></div>${levelPicker(level)}<button type="button" class="soft-btn" data-action="new">Neue Aufgabe</button></div>${taskHeading(task,round)}<div class="tile-lab"><aside class="tile-panel"><h3>Plättchen auswählen</h3><p class="tile-help">Tippe ein Plättchen an oder ziehe es auf den Bauplatz. Ein Plättchen auf dem Bauplatz antippen, um es wieder wegzunehmen.</p><div class="tile-bank">${allowed().map(k=>sourceElement(k)).join('')}</div><div class="algebra-note"><strong>Darstellung:</strong> ${quadratic?'x² ist ein Quadrat mit Seitenlänge x; x ist ein Rechteck x · 1; 1 ist ein Einheitsquadrat.':'x ist ein Rechteck mit Seitenlänge x und Breite 1; 1 ist ein Einheitsplättchen.'}</div></aside><section class="tile-panel"><div class="board-label"><span>Bauplatz</span><span class="board-expression">${termHTML(placed)}</span></div><div class="workbench" data-drop-zone="board"><div class="workbench-inner"><div class="tile-tray" data-tile-tray>${Object.entries(placed).flatMap(([k,n])=>Array.from({length:n},()=>tileElement(k))).join('')||'<div class="empty-board">Lege hier die Plättchen ab.<br>Der Term entsteht sichtbar.</div>'}</div></div></div></section></div><div class="algebra-actions"><button type="button" class="primary-btn" data-action="check">Term prüfen</button><button type="button" class="soft-btn" data-action="hint">Tipp anzeigen</button></div><div class="algebra-feedback"></div>`;
      setScore(root,score,total,streak);
      $$('.algebra-level',root)[0].onchange=e=>{level=e.target.value;makeTask();};
      $('[data-action=new]',root).onclick=makeTask;
      $('[data-action=hint]',root).onclick=()=>feedback(root,'info','Bauhinweis',task.hint);
      $('[data-action=check]',root).onclick=check;
      $$('.tile',root).forEach(el=>el.onclick=()=>{const k=el.dataset.kind;placed[k]=Math.max(0,(placed[k]||0)-1);if(!placed[k])delete placed[k];render();});
      bindPointerSources(root,k=>{placed[k]=(placed[k]||0)+1;render();},k=>{placed[k]=(placed[k]||0)+1;render();});
    }
    function check(){total++;const target=normaliseCounts(task.target),actual=normaliseCounts(placed),ok=TYPE_ORDER.every(k=>target[k]===actual[k]);if(ok){score++;streak++;feedback(root,'good','Treffer!','Dein Bau entspricht genau dem Zielterm. Du hast Symbol, Koeffizient und Vorzeichen passend dargestellt.');}else{streak=0;const missing=TYPE_ORDER.filter(k=>target[k]!==actual[k]).map(k=>`${TILE[k].short}: Ziel ${target[k]}, gelegt ${actual[k]}`).join(' · ');feedback(root,'try','Noch nicht passend',`${missing}. Vergleiche zuerst die Anzahl und dann das Vorzeichen jedes Plättchentyps.`);}setScore(root,score,total,streak);$('.algebra-actions [data-action=check]',root).disabled=true;const next=document.createElement('button');next.type='button';next.className='primary-btn';next.dataset.action='next';next.textContent='Nächste Aufgabe';next.onclick=makeTask;$('.algebra-actions',root).append(next);}
    makeTask();
  }
  function equationTask(level){
    const x=level==='hard'?rand(1,8):rand(1,7);let a,b,d,e;
    if(level==='easy'){a=1;b=rand(1,6);d=0;e=x+b;}
    else if(level==='medium'){a=rand(2,4);b=rand(0,6);d=0;e=a*x+b;}
    else {a=rand(2,5);d=rand(1,a-1);b=rand(0,6);e=(a-d)*x+b;}
    const firstStep=d?`Ziehe zuerst ${d} x-Plättchen`:'Ziehe zuerst keine x-Plättchen';
    const divideStep=(a-d)===1?' Danach ist x bereits isoliert.':` Teile danach durch ${a-d}.`;
    return {x,a,b,d,e,left:tokensFromCounts({x:a,one:b}),right:tokensFromCounts({x:d,one:e}),prompt:'Löse die Gleichung mit Plättchen.',solution:x,initial:`${expressionText({x:a,one:b})} = ${expressionText({x:d,one:e})}`,explanation:`${firstStep} auf beiden Seiten ab. Entferne danach ${b} Einheitsplättchen.${divideStep}`};
  }
  function cloneSides(task){return {left:[...task.left],right:[...task.right]};}
  function renderSideTokens(tokens,side){return tokens.map((k,i)=>tileElement(k,{side,index:i})).join('')||'<div class="empty-board">Keine Plättchen</div>';}
  function initBalance(root){
    let level='easy',taskLevel='easy',round=0,score=0,total=0,streak=0,task=null,sides=null,history=[];
    const makeTask=()=>{taskLevel=level==='auto'?autoLevel(score,total):level;task=equationTask(taskLevel);sides=cloneSides(task);history=[];round++;render();};
    const net=s=>tokenNet(s);
    const expressionSide=s=>termHTML(net(s));
    function render(){
      const l=net(sides.left),r=net(sides.right);
      root.innerHTML=`<div class="algebra-controls"><div class="algebra-score"></div>${levelPicker(level)}<button type="button" class="soft-btn" data-action="new">Neue Gleichung</button></div>${taskHeading({...task,target:null},round)}<div class="balance-status"><span>Aktuelle Gleichung: <strong>${expressionSide(sides.left)} = ${expressionSide(sides.right)}</strong></span><span>Nullpaare werden erst nach deinem Auftrag entfernt.</span></div><div class="balance-lab"><section class="balance-side"><h3>linke Seite</h3><div class="tile-tray" data-side="left" data-drop-zone="left">${renderSideTokens(sides.left,'left')}</div></section><div class="balance-sign" aria-hidden="true">=</div><section class="balance-side"><h3>rechte Seite</h3><div class="tile-tray" data-side="right" data-drop-zone="right">${renderSideTokens(sides.right,'right')}</div></section></div><div class="operation-palette"><button type="button" data-op="plus-one">+1 auf beiden Seiten</button><button type="button" data-op="minus-one">−1 auf beiden Seiten</button><button type="button" data-op="plus-x">+x auf beiden Seiten</button><button type="button" data-op="minus-x">−x auf beiden Seiten</button><button type="button" data-op="divide-2">: 2 auf beiden Seiten</button><button type="button" data-op="divide-3">: 3 auf beiden Seiten</button><button type="button" data-op="divide-4">: 4 auf beiden Seiten</button><button type="button" data-op="divide-5">: 5 auf beiden Seiten</button><button type="button" class="soft-btn" data-op="zero">Nullpaare entfernen</button></div><div class="operation-history"><strong>Dein Lösungsweg</strong>${history.length?`<ol>${history.map(x=>`<li>${x}</li>`).join('')}</ol>`:'<p>Noch keine Umformung durchgeführt.</p>'}</div><div class="algebra-actions"><button type="button" class="primary-btn" data-action="check">Lösung prüfen</button><button type="button" class="soft-btn" data-action="hint">Tipp anzeigen</button></div><div class="algebra-feedback"></div>`;
      setScore(root,score,total,streak);
      $$('.algebra-level',root)[0].onchange=e=>{level=e.target.value;makeTask();};
      $('[data-action=new]',root).onclick=makeTask; $('[data-action=hint]',root).onclick=()=>feedback(root,'info','Waagenhinweis',`Jede Operation gilt für beide Seiten. Bei ${expressionSide(sides.right)} stehen ${r.x} x-Plättchen und ${r.one} Einheitsplättchen netto.`);
      $$('[data-op]',root).forEach(b=>b.onclick=()=>operate(b.dataset.op));
      $('[data-action=check]',root).onclick=check;
      // A tile can be moved to the other side to explore, but this action does
      // not count as an equivalent transformation; the explicit operation
      // buttons are the assessed step.
      $$('.tile',root).forEach(el=>el.onclick=()=>feedback(root,'info','Plättchen ausgewählt','Nutze die Operationsknöpfe, damit dieselbe Veränderung auf beiden Seiten passiert.'));
    }
    function pushBoth(kind,label){sides.left.push(kind);sides.right.push(kind);history.push(label);render();}
    function divide(n){
      const counts=[net(sides.left),net(sides.right)];if(counts.some(c=>TYPE_ORDER.some(k=>c[k]%n!==0))){feedback(root,'try','Teilen noch nicht möglich',`Auf beiden Seiten müssen alle Plättchen in ${n} gleich großen Gruppen vorliegen. Entferne zuerst Nullpaare oder wähle die passende Zahl.`);return;}
      const reduce=s=>tokensFromCounts(Object.fromEntries(TYPE_ORDER.map(k=>[k,net(s)[k]/n])));sides.left=reduce(sides.left);sides.right=reduce(sides.right);history.push(`beide Seiten durch ${n} teilen`);render();
    }
    function removeZeros(){let removed=0;for(const side of ['left','right']){for(const [pos,neg] of [['x','negx'],['one','negone']]){while(sides[side].includes(pos)&&sides[side].includes(neg)){sides[side].splice(sides[side].indexOf(pos),1);sides[side].splice(sides[side].indexOf(neg),1);removed++;}}}history.push(removed?`${removed} Nullpaar${removed===1?'':'e'} entfernen`:'keine Nullpaare vorhanden');render();}
    function operate(op){if(op==='plus-one')pushBoth('one','+1 auf beiden Seiten');else if(op==='minus-one')pushBoth('negone','−1 auf beiden Seiten');else if(op==='plus-x')pushBoth('x','+x auf beiden Seiten');else if(op==='minus-x')pushBoth('negx','−x auf beiden Seiten');else if(op==='zero')removeZeros();else if(op.startsWith('divide-'))divide(Number(op.split('-')[1]));}
    function check(){total++;const l=net(sides.left),r=net(sides.right);const noPairs=['left','right'].every(side=>!((sides[side].includes('x')&&sides[side].includes('negx'))||(sides[side].includes('one')&&sides[side].includes('negone'))));const ok=noPairs&&l.x===1&&l.one===0&&r.x===0&&r.one===task.solution;if(ok){score++;streak++;feedback(root,'good','Gleichgewicht gelöst!',`Du hast x isoliert: <span class="explanation">x = ${task.solution}</span>. Jede deiner Umformungen wurde auf beiden Seiten ausgeführt.`);}else{streak=0;feedback(root,'try','Die Variable ist noch nicht isoliert',`Links müssen genau ein x-Plättchen und keine Einheitsplättchen liegen; rechts ${task.solution} Einheitsplättchen. Aktuell: <span class="mini-expression">${expressionSide(sides.left)} = ${expressionSide(sides.right)}</span>.`);}setScore(root,score,total,streak);$('[data-action=check]',root).disabled=true;const next=document.createElement('button');next.type='button';next.className='primary-btn';next.textContent='Nächste Gleichung';next.onclick=makeTask;$('.algebra-actions',root).append(next);}
    makeTask();
  }
  function factorPairs(c){const out=[];for(let p=1;p<=Math.sqrt(c);p++)if(c%p===0)out.push([p,c/p]);return out;}
  function quadraticTask(level,mode){
    if(mode==='build'){const target=buildCountsQuadratic(level);return {mode,prompt:'Lege den quadratischen Term als Flächenmodell.',target,hint:'Ein x²-Quadrat, x-Rechtecke mit Seiten x und 1 sowie Einheitsquadrate ergeben zusammen den Term.',solution:expressionText(target)};}
    if(mode==='complete'){const k=level==='easy'?rand(2,3):level==='medium'?rand(2,4):rand(3,5);const b=2*k;const gap=level==='easy'?0:rand(0,Math.min(3,k*k-1));const c=k*k-gap;return {mode,k,b,c,target:{x2:1,x:b,one:c},prompt:`Vervollständige das Quadrat: <span class="math-expression">x² + ${b}x + ${c} = 0</span>`,hint:`Verteile die ${b} x-Streifen gleichmäßig auf die beiden Seiten des x²-Quadrats. Dann fehlt bis zu (${k})² noch ${gap} Einheitsplättchen.`,solution:`x² + ${b}x + ${c} = 0 → (x + ${k})² = ${gap?`${gap}`:'0'}.`};}
    let p,q;
    do {p=level==='easy'?rand(1,3):level==='medium'?rand(2,4):rand(2,5);q=level==='easy'?rand(1,3):level==='medium'?rand(2,5):rand(2,6);} while(p===q);
    const b=p+q,c=p*q;
    if(mode==='solve')return {mode,p,q,b,c,target:{x2:1,x:b,one:c},prompt:`Löse die quadratische Gleichung: <span class="math-expression">x² + ${b}x + ${c} = 0</span>`,hint:'Lege zuerst das Rechteckmodell. Bei einem Produkt gleich 0 muss mindestens einer der beiden Faktoren 0 sein.',solution:[-p,-q]};
    return {mode,p,q,b,c,target:{x2:1,x:b,one:c},prompt:`Faktorisiere <span class="math-expression">x² + ${b}x + ${c}</span>.`,hint:'Die beiden Seiten des Rechtecks heißen x+p und x+q. Suche zwei Zahlen mit Summe b und Produkt c.',solution:`(x + ${p})(x + ${q})`};
  }
  function factorRectangle(p,q){const rows=[];rows.push(`<div class="factor-row"><span class="factor-cell x2">x²</span>${Array.from({length:q},()=>'<span class="factor-cell x">x</span>').join('')}</div>`);for(let i=0;i<p;i++)rows.push(`<div class="factor-row"><span class="factor-cell x">x</span>${Array.from({length:q},()=>'<span class="factor-cell">1</span>').join('')}</div>`);return `<div class="factor-rectangle" style="grid-template-rows:repeat(${p+1},auto)">${rows.join('')}</div>`;}
  function initQuadratic(root){
    let level='easy',taskLevel='easy',mode='build',round=0,score=0,total=0,streak=0,task=null,placed={x2:0,x:0,one:0},xTop=0,xSide=0,corners=0,selectedFactor=null,selectedRoots=[];
    const newTask=()=>{taskLevel=level==='auto'?autoLevel(score,total):level;task=quadraticTask(taskLevel,mode);placed={x2:0,x:0,one:0};xTop=0;xSide=0;corners=task.c||0;selectedFactor=null;selectedRoots=[];round++;render();};
    function render(){
      const isBuild=mode==='build',isComplete=mode==='complete';
      let workspace='';
      if(isBuild)workspace=`<div class="board-label"><span>Bauplatz</span><span class="board-expression">${termHTML(placed)}</span></div><div class="workbench" data-drop-zone="board"><div class="workbench-inner"><div class="tile-tray">${Object.entries(placed).flatMap(([k,n])=>Array.from({length:n},()=>tileElement(k))).join('')||'<div class="empty-board">Lege die Flächenplättchen hier ab.</div>'}</div></div></div>`;
      else if(isComplete)workspace=`<div class="board-label"><span>Flächenmodell</span><span class="board-expression">x² + ${task.b}x + ${task.c}</span></div><div class="square-model" style="--cells:${task.k}"><div class="model-corner">x²</div><div class="model-top">${Array.from({length:xTop},()=>'<span class="model-strip">x</span>').join('')||'<span class="empty-board">oben</span>'}</div><div class="model-side">${Array.from({length:xSide},()=>'<span class="model-strip">x</span>').join('')||'<span class="empty-board">seitlich</span>'}</div><div class="model-cells">${Array.from({length:task.k*task.k},(_,i)=>`<span class="model-cell${i>=corners?' missing':''}">${i<corners?'1':''}</span>`).join('')}</div></div>`;
      else if(mode==='factor')workspace=`<div class="board-label"><span>Rechteckmodell</span><span class="board-expression">${selectedFactor?`(x + ${selectedFactor[0]})(x + ${selectedFactor[1]})`:'Wähle zwei Seiten'}</span></div>${selectedFactor?factorRectangle(...selectedFactor):'<div class="empty-board">Tippe auf ein Zahlenpaar. Das Rechteck zeigt die Zerlegung des Terms.</div>'}`;
      else workspace=`<div class="board-label"><span>Nullprodukt-Modell</span><span class="board-expression">(x + ${task.p})(x + ${task.q}) = 0</span></div><div class="solve-visual">${factorRectangle(task.p,task.q)}<p class="solve-rule"><strong>Nullproduktregel:</strong> Ein Produkt ist 0, wenn mindestens ein Faktor 0 ist.</p></div>`;
      const solveChoices=mode==='solve'?[...new Set([...task.solution,task.p,task.q,0,1,-1])].sort((a,b)=>a-b):[];
      root.innerHTML=`<div class="algebra-controls"><div class="algebra-score"></div><label>Spielbereich <select class="quad-mode"><option value="build" ${mode==='build'?'selected':''}>Term bauen</option><option value="complete" ${mode==='complete'?'selected':''}>Quadrat ergänzen</option><option value="factor" ${mode==='factor'?'selected':''}>Faktorisieren</option><option value="solve" ${mode==='solve'?'selected':''}>Nullstellen lösen</option></select></label>${levelPicker(level)}<button type="button" class="soft-btn" data-action="new">Neue Aufgabe</button></div>${taskHeading({...task,target:isBuild?task.target:null},round)}<div class="quad-target"><strong>Dein Auftrag</strong>${isBuild?'Lege alle Plättchen des Terms.':isComplete?'Lege auf beide Seiten des x²-Quadrats gleich viele x-Streifen und ergänze die Einheitsfläche.':mode==='factor'?'Finde die beiden Seitenlängen des Rechtecks. Die Summe der x-Zahlen soll '+task.b+' und das Produkt '+task.c+' sein.':'Wähle beide Zahlen, die die Gleichung lösen. Begründe sie mit der Nullproduktregel.'}</div><div class="quad-lab"><section>${workspace}</section><aside class="tile-panel quad-tools">${isBuild?`<h3>Flächenplättchen</h3><p class="tile-help">Tippe oder ziehe x², x und 1 auf das Modell. Rote Plättchen stehen für negative Terme.</p><div class="tile-bank">${['x2','x','one',...(taskLevel!=='easy'?['negx','negone']:[])].map(k=>sourceElement(k)).join('')}</div>`:isComplete?`<h3>Quadrat aufbauen</h3><div class="quad-step"><span>x-Streifen oben</span><button data-qop="top-" type="button">−</button><span class="counter">${xTop}</span><button data-qop="top+" type="button">+</button></div><div class="quad-step"><span>x-Streifen rechts</span><button data-qop="side-" type="button">−</button><span class="counter">${xSide}</span><button data-qop="side+" type="button">+</button></div><div class="quad-step"><span>Einheitsplättchen</span><button data-qop="one-" type="button">−</button><span class="counter">${corners}</span><button data-qop="one+" type="button">+</button></div>`:mode==='factor'?`<h3>Faktorpaare</h3><div class="factor-options">${factorPairs(task.c).map(pair=>`<button type="button" data-factor="${pair[0]},${pair[1]}">(x + ${pair[0]})(x + ${pair[1]})</button>`).join('')}</div><p class="tile-help">Prüfe Summe und Produkt der beiden Zahlen. Nur ein Paar passt zum Zielterm.</p>`:`<h3>Nullstellen auswählen</h3><div class="factor-options solve-options">${solveChoices.map(v=>`<button type="button" data-root="${v}" class="${selectedRoots.includes(v)?'selected':''}">x = ${v}</button>`).join('')}</div><p class="tile-help">Wähle genau die beiden Zahlen, bei denen einer der Faktoren 0 wird.</p>`}</aside></div><div class="algebra-actions"><button type="button" class="primary-btn" data-action="check">${isBuild?'Term prüfen':isComplete?'Quadrat prüfen':mode==='factor'?'Faktorisierung prüfen':'Nullstellen prüfen'}</button><button type="button" class="soft-btn" data-action="hint">Tipp anzeigen</button></div><div class="algebra-feedback"></div>`;
      setScore(root,score,total,streak);
      $('.quad-mode',root).onchange=e=>{mode=e.target.value;newTask();};$('.algebra-level',root).onchange=e=>{level=e.target.value;newTask();};$('[data-action=new]',root).onclick=newTask;$('[data-action=hint]',root).onclick=()=>feedback(root,'info','Atelierhinweis',task.hint);$('[data-action=check]',root).onclick=check;
      if(isBuild){$$('.tile',root).forEach(el=>el.onclick=()=>{const k=el.dataset.kind;placed[k]=Math.max(0,(placed[k]||0)-1);render();});bindPointerSources(root,k=>{placed[k]=(placed[k]||0)+1;render();},k=>{placed[k]=(placed[k]||0)+1;render();});}
      if(isComplete){$$('[data-qop]',root).forEach(b=>b.onclick=()=>{const [where,change]=b.dataset.qop.split(/(?=[+-])/);if(where==='top')xTop=Math.max(0,xTop+(change==='+'?1:-1));if(where==='side')xSide=Math.max(0,xSide+(change==='+'?1:-1));if(where==='one')corners=Math.max(0,corners+(change==='+'?1:-1));render();});}
      if(mode==='factor')$$('[data-factor]',root).forEach(b=>b.onclick=()=>{selectedFactor=b.dataset.factor.split(',').map(Number);render();});
      if(mode==='solve')$$('[data-root]',root).forEach(b=>b.onclick=()=>{const value=Number(b.dataset.root);selectedRoots=selectedRoots.includes(value)?selectedRoots.filter(x=>x!==value):[...selectedRoots,value];render();});
    }
    function check(){total++;let ok=false,msg='';if(mode==='build'){ok=TYPE_ORDER.every(k=>normaliseCounts(placed)[k]===normaliseCounts(task.target)[k]);msg=ok?`Der Term ist vollständig gelegt: <span class="explanation">${task.solution}</span>.`:`Vergleiche x², x und 1 getrennt. Dein Bau ergibt <span class="mini-expression">${termHTML(placed)}</span>.`;}else if(mode==='complete'){ok=xTop===task.k&&xSide===task.k&&corners===task.k*task.k;msg=ok?`Du hast ein vollständiges Quadrat gelegt: <span class="explanation">(x + ${task.k})²</span>. ${task.c<task.k*task.k?`Du hast ${task.k*task.k-task.c} Einheitsplättchen ergänzt.`:''}`:`Für ein Quadrat müssen oben und seitlich gleich viele x-Streifen liegen (${task.k}) und die Eckfläche ${task.k*task.k} Einheiten enthalten.`;}else if(mode==='factor'){ok=selectedFactor&&selectedFactor[0]+selectedFactor[1]===task.b&&selectedFactor[0]*selectedFactor[1]===task.c;msg=ok?`Richtig: <span class="explanation">${task.solution}</span>. Die x-Koeffizienten addieren sich zu ${task.b}, die Einheiten multiplizieren sich zu ${task.c}.`:`Prüfe Summe = ${task.b} und Produkt = ${task.c}. Dein gewähltes Paar passt noch nicht.`;}else{const expected=new Set(task.solution),actual=new Set(selectedRoots);ok=actual.size===expected.size&&[...expected].every(x=>actual.has(x));msg=ok?`Richtig: <span class="explanation">x = ${task.solution.join(' oder x = ')}</span>. Aus (x + ${task.p})(x + ${task.q}) = 0 folgt die Nullproduktregel.`:`Wähle die beiden Nullstellen des Rechteckmodells. Die Faktoren sind x + ${task.p} und x + ${task.q}.`;}if(ok){score++;streak++;feedback(root,'good','Gut gelegt!',msg);}else{streak=0;feedback(root,'try','Noch nicht passend',msg);}setScore(root,score,total,streak);$('[data-action=check]',root).disabled=true;const next=document.createElement('button');next.type='button';next.className='primary-btn';next.textContent='Nächste Aufgabe';next.onclick=newTask;$('.algebra-actions',root).append(next);}
    newTask();
  }
  function mount(){
    const root=$('#algebraApp');if(!root)return;const kind=(window.ALGEBRA_GAME||{}).kind;
    if(kind==='term-linear')initTermBuilder(root,false);else if(kind==='term-quadratic')initTermBuilder(root,true);else if(kind==='balance')initBalance(root);else if(kind==='quadratic')initQuadratic(root);
  }
  window.AlgebraTiles={TILE,termHTML,expressionText,tokensFromCounts,tokenNet,termTasks,equationTask,quadraticTask,factorPairs,autoLevel,mount};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

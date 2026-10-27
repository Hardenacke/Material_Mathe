
(function(){
"use strict";
var KEY="wurzelwerk_leaderboard_v1", TYPES=["roots","laws","line"];
var selectedMode="training",topic="mix",level=1,session=null,task=null,records=[],storageOK=true,toastTimer=null;
function id(x){return document.getElementById(x)}
function choose(a){return a[Math.floor(Math.random()*a.length)]}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function clamp(x,a,b){return Math.min(b,Math.max(a,x))}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]})}
function mathHTML(tex,cls){return '<span'+(cls?' class="'+esc(cls)+'"':'')+' data-tex="'+esc(tex)+'"></span>'}
function ntex(n,d){var o={useGrouping:false,maximumFractionDigits:d==null?0:d};if(d!=null)o.minimumFractionDigits=d;return Number(n).toLocaleString("de-DE",o).replace(",", "{,}")}
function dateShow(s){return /^\d{4}-\d{2}-\d{2}$/.test(s||"")?s.slice(8,10)+"."+s.slice(5,7)+"."+s.slice(0,4):""}
function dateTex(s){return "\\text{"+dateShow(s)+"}"}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function renderMath(box){if(!window.katex)return;var nodes=[];if(box&&box.matches&&box.matches("[data-tex]"))nodes.push(box);if(box&&box.querySelectorAll)nodes=nodes.concat(Array.prototype.slice.call(box.querySelectorAll("[data-tex]")));nodes.forEach(function(el){var t=el.getAttribute("data-tex");if(el.getAttribute("data-rendered-tex")===t)return;try{window.katex.render(t,el,{throwOnError:true,strict:"error",trust:false,output:"htmlAndMathml",displayMode:el.getAttribute("data-display")==="true"});el.setAttribute("data-rendered-tex",t)}catch(e){el.textContent="Formel nicht verfügbar";el.setAttribute("data-tex-error","true")}})}
function toast(s){var el=id("toast");el.textContent=s;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove("show")},2400)}
function loadRecords(){records=[]}
function sorted(){return records.slice().sort(function(a,b){return Number(b.score)-Number(a.score)||String(a.date).localeCompare(String(b.date))||String(a.name).localeCompare(String(b.name),"de")})}
function drawBoard(){var body=id("leaderboardBody");body.innerHTML="";var arr=sorted().slice(0,10);id("leaderboardEmpty").hidden=arr.length>0;arr.forEach(function(r,i){var tr=document.createElement("tr"),td1=document.createElement("td"),rank=document.createElement("span");rank.className="rank";rank.dataset.tex=ntex(r.rank||i+1);td1.appendChild(rank);var td2=document.createElement("td");td2.textContent=r.name;var td3=document.createElement("td");td3.textContent=r.className;var td4=document.createElement("td"),sc=document.createElement("span");sc.dataset.tex=ntex(r.score);td4.appendChild(sc);var td5=document.createElement("td"),dt=document.createElement("span");dt.dataset.tex=dateTex(r.date);td5.appendChild(dt);tr.append(td1,td2,td3,td4,td5);body.appendChild(tr)});renderMath(body);id("storageState").hidden=storageOK}
function rootTask(l){var a=rand(l===1?1:(l===2?8:20),l===1?15:(l===2?32:50)),s=a*a;return{type:"roots",level:l,answer:a,expression:"\\sqrt{"+s+"}",title:"Ziehe die Wurzel.",help:"Gib die nicht-negative Zahl an, deren Quadrat dem Wert unter der Wurzel entspricht.",explanation:"\\sqrt{"+s+"}="+a}}
function extractTask(l){var aa=l===1?[2,3,4,5,6]:(l===2?[3,4,5,6,7,8,9,10]:[6,7,8,9,10,11,12,13,14,15,16,17,18]),bb=l===1?[2,3,5]:(l===2?[2,3,5,7,11]:[2,3,5,7,11,13,17,19]),a=choose(aa),b=choose(bb),s=a*a*b;return{type:"laws",kind:"extract",level:l,a:a,b:b,expression:"\\sqrt{"+s+"}",title:"Vereinfache vollständig.",help:"Trage den Faktor vor der Wurzel und die Zahl unter der Wurzel getrennt ein.",explanation:"\\sqrt{"+s+"}=\\sqrt{"+(a*a)+"\\cdot "+b+"}="+a+"\\sqrt{"+b+"}"}}
function productTask(l){var d=choose(l===2?[2,3,5,7]:[2,3,5,7,11,13]),x=rand(2,l===2?5:9),y=rand(2,l===2?6:11),a=d*x*x,b=d*y*y,z=d*x*y;return{type:"laws",kind:"product",level:l,answer:z,expression:"\\sqrt{"+a+"}\\cdot\\sqrt{"+b+"}",title:"Wende das Produktgesetz an.",help:"Fasse die Wurzeln zusammen und vereinfache das Ergebnis vollständig.",explanation:"\\sqrt{"+a+"}\\cdot\\sqrt{"+b+"}=\\sqrt{"+a+"\\cdot "+b+"}=\\sqrt{"+(a*b)+"}="+z}}
function quotientTask(l){var d=choose(l===2?[2,3,5,7,10,11]:[2,3,5,7,11,13,17]),k=rand(l===2?3:5,l===2?10:18),top=d*k*k;return{type:"laws",kind:"quotient",level:l,answer:k,expression:"\\frac{\\sqrt{"+top+"}}{\\sqrt{"+d+"}}",title:"Wende das Quotientengesetz an.",help:"Fasse die Wurzeln zusammen und vereinfache das Ergebnis vollständig.",explanation:"\\frac{\\sqrt{"+top+"}}{\\sqrt{"+d+"}}=\\sqrt{\\frac{"+top+"}{"+d+"}}=\\sqrt{"+(k*k)+"}="+k}}
function lawTask(l){if(l===1)return extractTask(l);var r=Math.random();return r<.44?extractTask(l):(r<.72?productTask(l):quotientTask(l))}
function lineTask(l){var lo=l===1?2:(l===2?20:40),hi=l===1?20:(l===2?60:120),c=[];for(var n=lo;n<=hi;n++)if(!Number.isInteger(Math.sqrt(n)))c.push(n);var a=choose(c);return{type:"line",level:l,n:a,answer:Math.sqrt(a),max:l===1?5:(l===2?8:12),expression:"\\sqrt{"+a+"}",title:"Wo liegt diese Wurzel?",help:"Ziehe die Marke an die Stelle, an der du den Wert auf dem Zahlenstrahl vermutest."}}
function makeTask(t,l){return t==="roots"?rootTask(l):(t==="laws"?lawTask(l):lineTask(l))}
function shuffle(a){var b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),v=b[i];b[i]=b[j];b[j]=v}return b}
function build(mode,t,l){var list=[];if(mode==="competition"){for(var j=0;j<4;j++)list=list.concat(TYPES);list=shuffle(list)}else if(t==="mix")list=shuffle(["roots","roots","roots","roots","laws","laws","laws","line","line","line"]);else for(var i=0;i<10;i++)list.push(t);return{mode:mode,topic:t,level:l,types:list,limit:list.length,index:0,score:0,correct:0,attempted:0,answered:false,stored:false}}
function typeName(t,k){return t==="roots"?"Quadratwurzel":(t==="line"?"Zahlenstrahl":(k==="extract"?"Wurzel vereinfachen":(k==="product"?"Produktgesetz":"Quotientengesetz")))}
function parse(v){var s=String(v).trim().replace(/\s+/g,"").replace(",",".");if(!s||!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(s))return null;var n=Number(s);return Number.isFinite(n)?n:null}
function bindPreview(input,out,d){function update(){var n=parse(input.value);out.dataset.tex=n==null?"\\text{Eingabe}":ntex(n,d);renderMath(out)}input.addEventListener("input",update);update()}
function oneInput(){return'<div class="answer-single"><div class="input-group"><label for="answerMain">Dein Ergebnis</label><input class="answer-input" id="answerMain" type="text" inputmode="decimal" autocomplete="off" spellcheck="false"><div class="input-preview"><span>Eingegeben:</span><span id="previewMain" data-tex="\\text{Eingabe}"></span></div></div></div>'}
function pairInputs(){return'<div class="law-pair"><div class="input-group"><label for="answerA">Faktor vor der Wurzel</label><input class="answer-input" id="answerA" type="text" inputmode="decimal" autocomplete="off"><div class="input-preview"><span>Eingabe:</span><span id="previewA" data-tex="\\text{Eingabe}"></span></div></div><span class="sep" aria-hidden="true">·</span><div class="input-group"><label for="answerB">Zahl unter der Wurzel</label><input class="answer-input" id="answerB" type="text" inputmode="decimal" autocomplete="off"><div class="input-preview"><span>Eingabe:</span><span id="previewB" data-tex="\\text{Eingabe}"></span></div></div><div class="law-preview" id="lawPreview" data-tex="\\sqrt{\\phantom{x}}"></div></div>'}
function numberline(t){var marks="";for(var i=0;i<=t.max;i++){var pc=i/t.max*100,cl="tick-label"+(i===0?" first":"")+(i===t.max?" last":"");marks+='<span class="tick" style="left:'+pc+'%" aria-hidden="true"></span><span class="'+cl+'" style="left:'+pc+'%">'+mathHTML(ntex(i))+"</span>"}return'<div class="line-card"><div class="line-note"><span>Tippe oder ziehe die Marke</span><span>Auch mit den Pfeiltasten</span></div><div class="line-track" id="lineTrack" aria-label="Interaktiver Zahlenstrahl"><div class="axis"></div>'+marks+'<button type="button" class="marker" id="marker" role="slider" aria-label="Geschätzte Position" aria-valuemin="0" aria-valuemax="'+t.max+'" aria-valuenow="0"><span data-tex="0"></span></button></div><div class="line-readout"><span>Deine Position:</span><span id="lineReadout" data-tex="0"></span></div></div>'}
function attachLine(t){var track=id("lineTrack"),marker=id("marker"),drag=false,val=0;function upd(v){val=clamp(v,0,t.max);marker.style.left=(val/t.max*100)+"%";marker.setAttribute("aria-valuenow",val.toFixed(2));marker.setAttribute("aria-valuetext",val.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}));marker.dataset.tex=ntex(val,2);id("lineReadout").dataset.tex=ntex(val,2);renderMath(marker);renderMath(id("lineReadout"))}function set(x){var r=track.getBoundingClientRect();if(r.width)upd(Math.round(clamp((x-r.left)/r.width,0,1)*t.max*100)/100)}track.addEventListener("pointerdown",function(e){if(session.answered)return;e.preventDefault();drag=true;track.setPointerCapture(e.pointerId);set(e.clientX)});track.addEventListener("pointermove",function(e){if(drag&&!session.answered)set(e.clientX)});track.addEventListener("pointerup",function(){drag=false});track.addEventListener("pointercancel",function(){drag=false});marker.addEventListener("keydown",function(e){var d=e.shiftKey ? 0.01 : 0.1;if(e.key==="ArrowRight"||e.key==="ArrowUp"){e.preventDefault();upd(val+d)}else if(e.key==="ArrowLeft"||e.key==="ArrowDown"){e.preventDefault();upd(val-d)}else if(e.key==="Home"){e.preventDefault();upd(0)}else if(e.key==="End"){e.preventDefault();upd(t.max)}});upd(0)}
function startLocal(mode){if(!window.katex){id("mathWarning").classList.add("show");return}var lev=mode==="competition"?3:level;session=build(mode,topic,lev);id("setupScreen").hidden=true;id("resultsScreen").hidden=true;id("gameScreen").hidden=false;id("gameModeChip").innerHTML=mode==="competition"?"Wettbewerb · Challenge":"Training · Stufe "+mathHTML(ntex(lev));showTask();window.scrollTo({top:0,behavior:"smooth"})}
function renderTask(){task=session.mode==="competition"?session.remote.question:makeTask(session.types[session.index],session.level);session.answered=session.mode==="competition"?session.remote.answered:false;id("feedback").hidden=true;id("feedback").className="feedback";id("submitAnswer").hidden=false;id("nextQuestion").hidden=true;id("submitAnswer").disabled=false;id("progressCount").innerHTML=mathHTML(ntex(session.index+1))+" / "+mathHTML(ntex(session.limit));id("progressFill").style.width=(session.index/session.limit*100)+"%";id("scoreValue").innerHTML=mathHTML(ntex(session.score));id("questionType").textContent=typeName(task.type,task.kind);id("questionKicker").innerHTML=session.mode==="competition"?"Challenge":"Stufe "+mathHTML(ntex(session.level));id("questionTitle").textContent=task.title;id("questionHelp").textContent=task.help;id("expression").innerHTML=mathHTML(task.expression);var area=id("answerArea");
if(task.type==="roots"||task.kind==="product"||task.kind==="quotient"){area.innerHTML=oneInput();bindPreview(id("answerMain"),id("previewMain"));id("answerMain").addEventListener("keydown",function(e){if(e.key==="Enter")submit()})}
else if(task.kind==="extract"){area.innerHTML=pairInputs();bindPreview(id("answerA"),id("previewA"));bindPreview(id("answerB"),id("previewB"));function preview(){var a=parse(id("answerA").value),b=parse(id("answerB").value);id("lawPreview").dataset.tex=a==null||b==null?"\\sqrt{\\phantom{x}}":ntex(a)+"\\sqrt{"+ntex(b)+"}";renderMath(id("lawPreview"))}id("answerA").addEventListener("input",preview);id("answerB").addEventListener("input",preview);[id("answerA"),id("answerB")].forEach(function(x){x.addEventListener("keydown",function(e){if(e.key==="Enter")submit()})})}
else{area.innerHTML=numberline(task);attachLine(task)}
renderMath(id("gameScreen"));if(task.type!=="line")setTimeout(function(){var q=area.querySelector("input");if(q)q.focus({preventScroll:true})},30)}
function linePoints(err,tol){return err<=tol?100:(err<=2*tol?70:(err<=4*tol?40:0))}
function trainingSubmit(){if(!session||session.answered)return;var pts=0,ok=false,title="",msg="",eq=task.explanation||"";
if(task.type==="line"){var guess=Number(id("marker").getAttribute("aria-valuenow")),err=Math.abs(guess-task.answer),tol=session.level===1 ? 0.42 : (session.level===2 ? 0.29 : 0.19);pts=linePoints(err,tol);ok=err<=tol;title=pts===100?"Sehr gut eingeordnet!":(pts?"Gute Annäherung":"Noch nicht ganz");msg=pts===100?"Deine Marke liegt sehr nah am Näherungswert.":(pts?"Du bekommst Teilpunkte für deine Annäherung.":"Achte auf den Abstand zu den benachbarten ganzen Zahlen.");eq="\\sqrt{"+task.n+"}\\approx "+ntex(task.answer,2);id("marker").disabled=true}
else if(task.kind==="extract"){var a=parse(id("answerA").value),b=parse(id("answerB").value);if(a==null||b==null){toast("Bitte trage beide Zahlen ein.");(a==null?id("answerA"):id("answerB")).focus();return}ok=a===task.a&&b===task.b;pts=ok?100:0;title=ok?"Richtig vereinfacht!":"Da steckt noch ein Quadrat drin.";msg=ok?"Du hast den quadratischen Faktor aus der Wurzel herausgezogen.":"Suche unter der Wurzel einen möglichst großen quadratischen Faktor."}
else{var answer=parse(id("answerMain").value);if(answer==null){toast("Gib zuerst ein Ergebnis ein.");id("answerMain").focus();return}ok=answer===task.answer;pts=ok?100:0;title=ok?"Genau richtig!":"Das war noch nicht die passende Zahl.";msg=task.type==="roots"?(ok?"Deine Zahl ergibt beim Quadrieren genau den Wert unter der Wurzel.":"Prüfe, welche Quadratzahl zur Zahl unter der Wurzel passt."):(ok?"Du hast die Wurzeln passend zusammengefasst.":"Prüfe den Zwischenschritt mit dem passenden Wurzelgesetz.")}
session.answered=true;session.attempted++;session.score+=pts;if(ok)session.correct++;id("scoreValue").innerHTML=mathHTML(ntex(session.score));id("submitAnswer").hidden=true;id("nextQuestion").hidden=false;id("actionHint").innerHTML=pts?"Punkte für diese Aufgabe: "+mathHTML(ntex(pts)):"Lies den Rechenschritt und probiere es in der nächsten Aufgabe erneut.";var fb=id("feedback");fb.className="feedback "+(pts===100?"good":(pts?"partial":"bad"));fb.innerHTML="<strong><span aria-hidden=\"true\">"+(pts===100?"✓":(pts?"≈":"↻"))+"</span>"+esc(title)+"</strong><p>"+esc(msg)+"</p><div class=\"equation\" data-tex=\""+esc(eq)+"\"></div>";fb.hidden=false;id("answerArea").querySelectorAll("input").forEach(function(x){x.disabled=true;x.setAttribute("aria-invalid",ok?"false":"true")});renderMath(fb);renderMath(id("gameScreen"))}
function trainingNext(){if(!session||!session.answered)return;session.index++;if(session.index>=session.limit){results();return}showTask();window.scrollTo({top:0,behavior:"smooth"})}
function home(){id("resultsScreen").hidden=true;id("gameScreen").hidden=true;id("setupScreen").hidden=false;session=null;drawBoard();window.scrollTo({top:0,behavior:"smooth"})}
function switchMode(m){selectedMode=m;id("trainingTab").setAttribute("aria-pressed",String(m==="training"));id("competitionTab").setAttribute("aria-pressed",String(m==="competition"));id("trainingControls").hidden=m!=="training";id("competitionControls").hidden=m!=="competition";id("setupTitle").textContent=m==="training"?"Dein Trainingsplan":"Bereit für die Wurzel-Arena?";id("setupDescription").textContent=m==="training"?"Wähle einen Bereich und starte auf dem Niveau, das zu dir passt.":"Stelle dich einer gemischten Runde und sichere dir einen Platz in der Rangliste.";id("setupTag").textContent=m==="training"?"Üben · ohne Druck":"Messen · eintragen"}
id("trainingTab").addEventListener("click",function(){switchMode("training")});id("competitionTab").addEventListener("click",function(){switchMode("competition")});
document.querySelectorAll("[data-topic]").forEach(function(b){b.addEventListener("click",function(){topic=b.dataset.topic;document.querySelectorAll("[data-topic]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))})})});
document.querySelectorAll("[data-level]").forEach(function(b){b.addEventListener("click",function(){level=Number(b.dataset.level);document.querySelectorAll("[data-level]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))})})});
id("startTraining").addEventListener("click",function(){start("training")});id("startCompetition").addEventListener("click",function(){start("competition")});id("backToSetup").addEventListener("click",home);id("submitAnswer").addEventListener("click",submit);id("nextQuestion").addEventListener("click",next);
// Wird beim Import innerhalb der bestehenden Quizfunktion eingefügt.
var cloud = {base:'https://mathe-wettkampf-api.physik-wettkampf-api.workers.dev',token:'',alias:'',connected:false,busy:false,pending:null,generation:0};
var profileKey='wurzelwerk-profile-v1';
function newToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),function(value){return value.toString(16).padStart(2,'0')}).join('')}
function rememberProfile(){try{localStorage.setItem(profileKey,JSON.stringify({token:cloud.token,alias:cloud.alias}))}catch(error){/* Teilnahme bleibt im aktuellen Tab möglich. */}}
try{var savedProfile=JSON.parse(localStorage.getItem(profileKey)||'null');if(savedProfile&&/^[A-Za-z0-9_-]{32,128}$/.test(savedProfile.token)){cloud.token=savedProfile.token;cloud.alias=typeof savedProfile.alias==='string'?savedProfile.alias:''}}catch(error){/* Neues Browserprofil anlegen. */}
if(!cloud.token)cloud.token=newToken();
id('competitionAlias').value=cloud.alias;
function connection(text, ok){id('connectionStatus').textContent=text;id('connectionStatus').dataset.connected=String(ok);id('startCompetition').disabled=!ok;cloud.connected=ok}
async function cloudRequest(path,body){
  var options={headers:{Authorization:'Bearer '+cloud.token},signal:AbortSignal.timeout(15000)};
  if(body!==undefined){
    cloud.generation++;
    if(!cloud.pending||cloud.pending.path!==path)cloud.pending={path:path,body:body,key:crypto.randomUUID()};
    options.method='POST';options.headers['Content-Type']='application/json';options.headers['Idempotency-Key']=cloud.pending.key;options.body=JSON.stringify(cloud.pending.body);
  }
  var response=await fetch(cloud.base+'/api/v1/quizzes/wurzelwerk'+path,options),data=await response.json();
  if(!response.ok)throw new Error(data.error&&data.error.message||'Der Wettbewerb ist gerade nicht erreichbar.');
  if(body!==undefined)cloud.pending=null;
  return data;
}
function remoteSession(value){return{mode:'competition',level:3,limit:12,index:value.index,score:value.score,correct:value.correct,attempted:value.attempted,answered:value.answered,stored:value.phase==='finished',remote:value}}
async function refreshCloud(){
  var generation=cloud.generation,data=await cloudRequest('');if(generation!==cloud.generation)return data;cloud.alias=data.alias;
  records=data.leaderboard.map(function(row){return{rank:row.rank,name:row.alias,className:'9',score:row.score,date:new Date(row.endedAt).toISOString().slice(0,10)}});drawBoard();
  connection('Cloudflare verbunden · '+data.alias,true);
  if(data.current&&session&&session.mode==='competition'&&data.current.id===session.remote.id){session=remoteSession(data.current);showTask()}
  return data;
}
async function connectCloud(alias){
  if(cloud.busy)return;
  cloud.busy=true;connection('Verbindung zu Cloudflare wird aufgebaut …',false);
  try{
    var response=await fetch(cloud.base+'/api/v1/quizzes/wurzelwerk/join',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token:cloud.token,alias:typeof alias==='string'?alias:''}),signal:AbortSignal.timeout(15000)});
    var data=await response.json();if(!response.ok)throw new Error(data.error&&data.error.message||'Verbindung derzeit nicht möglich.');
    cloud.alias=data.alias;rememberProfile();id('competitionAlias').placeholder=data.alias;await refreshCloud();
  }catch(error){connection(error.message+' Die Verbindung wird automatisch erneut versucht.',false)}
  finally{cloud.busy=false;id('nextQuestion').disabled=false}
}
async function start(mode){
  if(mode==='training'){startLocal(mode);return}
  if(cloud.busy)return;
  await connectCloud(id('competitionAlias').value.trim());
  if(!cloud.connected)return;
  cloud.busy=true;id('startCompetition').disabled=true;
  try{
    var data=await cloudRequest('/attempts',{});session=remoteSession(data.attempt);
    id('setupScreen').hidden=true;id('resultsScreen').hidden=true;id('gameScreen').hidden=false;
    id('gameModeChip').textContent='Wettbewerb · Cloudflare';showTask();window.scrollTo({top:0,behavior:'smooth'});
  }catch(error){connection(error.message,false)}finally{cloud.busy=false;id('startCompetition').disabled=!cloud.connected;id('nextQuestion').disabled=false}
}
function remoteFeedback(){
  var feedback=session.remote.feedback;if(!feedback)return;
  id('submitAnswer').hidden=true;id('nextQuestion').hidden=false;id('actionHint').textContent='Von Cloudflare bewertet: '+feedback.points+' Punkte';
  id('nextQuestion').disabled=cloud.busy;
  var box=id('feedback');box.hidden=false;box.className='feedback '+(feedback.points===100?'good':feedback.points?'partial':'bad');
  box.innerHTML='<strong>'+esc(feedback.correct?'Richtig gelöst!':feedback.points?'Gute Annäherung':'Noch nicht ganz')+'</strong><div class="equation" data-tex="'+esc(feedback.explanation)+'"></div>';
  id('answerArea').querySelectorAll('input,button').forEach(function(input){input.disabled=true});renderMath(box);
}
function showTask(){renderTask();if(session.mode==='competition'&&session.answered)remoteFeedback()}
async function submit(){
  if(!session||session.answered)return;
  if(session.mode==='training'){trainingSubmit();return}
  if(cloud.busy)return;
  if(!cloud.connected){toast('Bitte die Verbindung wiederherstellen.');return}
  var answer;
  if(task.type==='line')answer=Number(id('marker').getAttribute('aria-valuenow'));
  else if(task.kind==='extract'){answer={a:parse(id('answerA').value),b:parse(id('answerB').value)};if(answer.a===null||answer.b===null){toast('Bitte beide Zahlen eingeben.');return}}
  else{answer=parse(id('answerMain').value);if(answer===null){toast('Bitte eine Zahl eingeben.');return}}
  cloud.busy=true;id('submitAnswer').disabled=true;
  try{
    var data=await cloudRequest('/attempts/'+session.remote.id+'/answer',{questionId:task.id,answer:answer});
    session=remoteSession(data.attempt);showTask();await refreshCloud();
  }catch(error){toast(error.message);connection('Verbindung unterbrochen. Stelle sie zur Wiederaufnahme erneut her.',false);id('submitAnswer').disabled=false}
  finally{cloud.busy=false;id('nextQuestion').disabled=false}
}
async function next(){
  if(!session||!session.answered)return;
  if(session.mode==='training'){trainingNext();return}
  if(cloud.busy)return;
  if(session.remote.phase==='finished'){results();return}
  cloud.busy=true;id('nextQuestion').disabled=true;
  try{var data=await cloudRequest('/attempts/'+session.remote.id+'/next',{});session=remoteSession(data.attempt);showTask()}
  catch(error){toast(error.message);connection('Verbindung unterbrochen. Bitte erneut verbinden.',false)}
  finally{cloud.busy=false;id('nextQuestion').disabled=false}
}
function results(){
  id('gameScreen').hidden=true;var el=id('resultsScreen');el.hidden=false;
  var online=session.mode==='competition';
  el.innerHTML='<article class="results"><div class="result-hero"><p class="hero-label">'+(online?'Wettbewerb abgeschlossen':'Trainingsrunde geschafft')+'</p><h2>Stark gespielt!</h2><p>'+session.attempted+' Aufgaben bearbeitet.</p></div><div class="stats"><div class="stat"><span class="stat-label">Punkte</span><span class="stat-value">'+session.score+'</span></div><div class="stat"><span class="stat-label">Richtig gelöst</span><span class="stat-value">'+session.correct+' / '+session.limit+'</span></div><div class="stat"><span class="stat-label">Trefferquote</span><span class="stat-value">'+Math.round(session.correct/session.limit*100)+' %</span></div></div><div class="save"><p>'+(online?'Dein Ergebnis wurde von Cloudflare bewertet und als '+esc(cloud.alias)+' gespeichert. Dein bester Versuch zählt für die gemeinsame Rangliste.':'Trainiere weiter in deinem Tempo. Trainingsergebnisse gehen nicht in die Wettbewerbsrangliste ein.')+'</p></div><div class="result-actions"><button class="primary" id="playAgain">Noch eine Runde</button><button class="secondary" id="resultsHome">Zur Auswahl</button></div></article>';
  id('playAgain').addEventListener('click',function(){start(session.mode)});id('resultsHome').addEventListener('click',home);window.scrollTo({top:0,behavior:'smooth'});
}
id('competitionAlias').addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();start('competition')}});
id('newPlayer').addEventListener('click',function(){
  if(cloud.busy)return;home();cloud.generation++;cloud.token=newToken();cloud.alias='';cloud.pending=null;
  id('competitionAlias').value='';rememberProfile();connectCloud('');
});
window.addEventListener('offline',function(){connection('Offline · Training bleibt verfügbar.',false);if(session&&session.mode==='competition')id('submitAnswer').disabled=true});
window.addEventListener('online',function(){connectCloud('')});
document.addEventListener('visibilitychange',function(){if(!document.hidden&&cloud.connected&&!cloud.busy)refreshCloud().catch(function(){connection('Verbindung unterbrochen. Bitte erneut verbinden.',false)})});
setInterval(function(){if(!document.hidden&&!cloud.busy){if(cloud.connected)refreshCloud().catch(function(){connection('Verbindung unterbrochen. Wiederverbindung läuft automatisch.',false)});else connectCloud('')}},10000);
connectCloud('');

loadRecords();drawBoard();if(!window.katex)id("mathWarning").classList.add("show");renderMath(document);
}());

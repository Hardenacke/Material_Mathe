// Wird beim Import innerhalb der bestehenden Quizfunktion eingefügt.
var cloud = {base:'https://mathe-wettkampf-api.physik-wettkampf-api.workers.dev',code:'',alias:'',connected:false,busy:false,pending:null,generation:0};
function connection(text, ok){id('connectionStatus').textContent=text;id('connectionStatus').dataset.connected=String(ok);id('startCompetition').disabled=!ok;cloud.connected=ok}
async function cloudRequest(path,body){
  var options={headers:{Authorization:'Bearer '+cloud.code},signal:AbortSignal.timeout(15000)};
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
async function connectCloud(){
  if(cloud.busy)return;var code=id('competitionCode').value.trim();if(code)cloud.code=code;
  if(!/^[A-Za-z0-9_-]{32,128}$/.test(cloud.code)){connection('Bitte deinen persönlichen Wettbewerbscode eingeben.',false);return}
  cloud.busy=true;id('connectCompetition').disabled=true;connection('Verbindung zu Cloudflare wird geprüft …',false);
  try{await refreshCloud();id('competitionCode').value=''}catch(error){connection(error.message,false)}
  finally{cloud.busy=false;id('connectCompetition').disabled=false;id('nextQuestion').disabled=false}
}
async function start(mode){
  if(mode==='training'){startLocal(mode);return}
  if(!cloud.connected||cloud.busy){toast('Bitte zuerst die Cloudflare-Verbindung prüfen.');return}
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
  if(!session||session.answered||cloud.busy)return;
  if(session.mode==='training'){trainingSubmit();return}
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
  if(!session||!session.answered||cloud.busy)return;
  if(session.mode==='training'){trainingNext();return}
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
id('connectCompetition').addEventListener('click',connectCloud);
id('competitionCode').addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();connectCloud()}});
window.addEventListener('offline',function(){connection('Offline · Training bleibt verfügbar.',false);if(session&&session.mode==='competition')id('submitAnswer').disabled=true});
window.addEventListener('online',function(){if(cloud.code)connectCloud()});
document.addEventListener('visibilitychange',function(){if(!document.hidden&&cloud.connected&&!cloud.busy)refreshCloud().catch(function(){connection('Verbindung unterbrochen. Bitte erneut verbinden.',false)})});
setInterval(function(){if(!document.hidden&&cloud.connected&&!cloud.busy)refreshCloud().catch(function(){connection('Verbindung unterbrochen. Bitte erneut verbinden.',false)})},10000);
fetch(cloud.base+'/health',{signal:AbortSignal.timeout(10000)}).then(function(response){if(!cloud.code)connection(response.ok?'Cloudflare erreichbar · Wettbewerbscode eingeben.':'Cloudflare derzeit nicht erreichbar.',false)}).catch(function(){if(!cloud.code)connection('Cloudflare derzeit nicht erreichbar. Training bleibt verfügbar.',false)});

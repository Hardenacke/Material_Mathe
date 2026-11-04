const $=id=>document.getElementById(id);
if(typeof CONFIG.title==='string'){document.title=CONFIG.title+' · Adaptiver Lernpfad';$('pageTitle').textContent=CONFIG.title;}
let localState=null,view=null,remote=null,busy=false;
$('demo').hidden=CONFIG.allowLocalDemo!==true;
$('setupNotice').textContent=CONFIG.workerBase?'Melde dich mit dem Code deiner Lehrkraft an.':'Die Anmeldung wird nach der Cloudflare-Einrichtung freigeschaltet. Du kannst die Aufgaben bereits ohne Code ausprobieren.';
const modeLabel=mode=>mode==='single_chat'?'Persönlicher Einzelchat':'fobizz-Klassenraum';
function drawChat(messages=[]){
  $('chatHistory').replaceChildren();
  for(const message of messages){const box=document.createElement('div');box.className='coach';const name=document.createElement('strong'),text=document.createElement('p');name.textContent=message.role==='user'?'Du':'Lernbegleitung';text.textContent=message.text;text.style.whiteSpace='pre-wrap';box.append(name,text);$('chatHistory').append(box);}
}
function renderCoach(){
  const selected=remote?.capabilities?.find(c=>c.learningMode===remote.learningMode);
  $('learningMode').value=remote?.learningMode||'single_chat';
  $('learningMode').disabled=!remote||busy;$('changeMode').disabled=!remote||busy;
  const statuses={ready:'nutzbar',api_unconfirmed:'automatische Schnittstelle noch nicht bestätigt',setup_required:'Einrichtung durch die Lehrkraft nötig',disabled:'nicht freigegeben'};
  $('modeStatuses').replaceChildren();
  for(const option of $('learningMode').options){
    const c=remote?.capabilities?.find(c=>c.learningMode===option.value);option.disabled=Boolean(c&&!c.allowed);
    const p=document.createElement('p');p.textContent=modeLabel(option.value)+': '+(c?statuses[c.status]:'in der Demo ohne fobizz-Verbindung');$('modeStatuses').append(p);
  }
  $('coachStatus').textContent=!remote?'Die Demo passt Aufgaben anhand deiner Antworten an. fobizz wird dabei nicht aufgerufen.':selected?.status==='api_unconfirmed'?'Du kannst hier weiterüben. Der persönliche Livechat wird nach Einrichtung einer bestätigten fobizz-Schnittstelle verfügbar.':selected?.status==='setup_required'?'Du kannst hier weiterüben. Deine Lehrkraft hinterlegt den fobizz-Klassenraum separat.':selected?.transportMode==='fobizz-transfer'?'Nach zwei Aufgaben kannst du deinen Lernstand bewusst übertragen und die Rückmeldung hier prüfen lassen. Ein Klassenraumlink überträgt keine Chats automatisch.':'Frage deine Lernbegleitung zur aktuellen Aufgabe.';
  const chatReady=Boolean(selected?.available&&selected.transportMode==='fobizz-api');
  $('chatPanel').hidden=!chatReady&&!$('chatHistory').children.length;$('chatForm').hidden=!chatReady;$('sendChat').disabled=!chatReady||busy;$('deleteChat').disabled=!remote||busy;
  $('packet').hidden=selected?.transportMode!=='fobizz-transfer';$('packet').disabled=!selected?.available||!view||view.completed<2||busy;
  $('fobizz').hidden=!(remote?.learningMode==='classroom'&&remote.fobizzUrl);
  if(remote?.learningMode==='classroom'&&remote.fobizzUrl)$('fobizz').href=remote.fobizzUrl;else $('fobizz').removeAttribute('href');
}
function baseUrl(){let u;try{u=new URL(CONFIG.workerBase);}catch{throw new Error('Der Klassenraum ist noch nicht eingerichtet. Bitte deine Lehrkraft informieren.');}if(!(u.protocol==='https:'||(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw new Error('Die Klassenraum-Adresse ist nicht korrekt eingerichtet.');return u.origin;}
function render(){
  $('loginPanel').hidden=!(!remote&&!localState);$('learningPanel').hidden=!view||(!remote&&!localState);
  $('mode').textContent=remote?'Angemeldet · Lernstand wird gespeichert':localState?'Lokale Demo · ohne Speicherung':'Dein Lerncode öffnet deinen Lernplatz';
  $('login').disabled=!CONFIG.workerBase||busy;
  if(!view){$('skills').replaceChildren();$('question').textContent='';$('summary').textContent='';$('classroomName').textContent='';$('learnerInfo').textContent='';$('saveInfo').textContent='';$('fobizz').hidden=true;$('fobizz').removeAttribute('href');return;}
  $('taskNo').textContent=`Aufgabe ${view.completed+(view.task.solved?0:1)}`;$('level').textContent=`Anforderung ${view.task.level} von 4`;$('question').textContent=view.task.prompt;
  $('check').hidden=view.task.solved;$('next').hidden=!view.task.solved;$('hint').disabled=view.task.solved||busy;$('value').disabled=view.task.solved||busy;$('unit').disabled=view.task.solved||busy;
  $('summary').textContent=view.summary;$('packet').disabled=view.completed<2||busy;
  $('skills').replaceChildren();
  for(const[key,p]of Object.entries(view.skills)){
    const box=document.createElement('div');box.className='skill';const strong=document.createElement('strong');strong.textContent=SKILLS[key];const progress=document.createElement('progress');progress.max=4;progress.value=p.level;progress.setAttribute('aria-label',`${SKILLS[key]}: aktuelle Anforderung ${p.level} von 4`);const span=document.createElement('span');span.textContent=`${p.completed} abgeschlossen · ${p.independent} im ersten Versuch ohne Hinweis`;box.append(strong,progress,span);$('skills').append(box);
  }
  $('classroomName').textContent=remote?remote.room.name:'Übung ohne Anmeldung';$('learnerInfo').textContent=remote?`${remote.label} · ohne Namenseingabe`:'Diese Demo startet beim nächsten Öffnen neu.';
  $('saveInfo').textContent=remote?`Dein Lernstand bleibt bis zum ${new Date(remote.room.expiresAt).toLocaleDateString('de-DE')} gespeichert. Abmelden beendet nur die Sitzung.`:'Deine Demo-Eingaben werden nicht an Cloudflare gesendet.';
  renderCoach();
}
async function api(path,body,method){
  const payload=body?JSON.stringify(body):undefined;
  for(let attempt=0;attempt<2;attempt++){
    try{
      const r=await fetch(baseUrl()+path,{method:method||(body?'POST':'GET'),headers:{...(body?{'Content-Type':'application/json'}:{}),...(remote?{Authorization:'Bearer '+remote.token}:{})},body:payload,credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(path==='/api/chat/messages'?24000:12000)});
      let data;try{data=await r.json();}catch{const e=new Error('Der Dienst hat keine lesbare Antwort geliefert.');e.status=r.status;throw e;}
      if(!r.ok){const e=new Error(data.error||'Aktion fehlgeschlagen.');e.status=r.status;throw e;}return data;
    }catch(e){if(e.status||attempt===1)throw e;}
  }
}
function clearPanels(){$('value').value='';$('unit').value='m/s';$('packetArea').hidden=true;$('coachResult').hidden=true;$('hintText').hidden=true;$('packetText').value='';$('coachReply').value='';$('chatMessage').value='';drawChat();$('result').className='';$('result').textContent='Du kannst in deinem Tempo arbeiten.';}
function absorb(data){view=data.state;if(remote){if(data.classroom)remote.room=data.classroom;if(data.learnerLabel)remote.label=data.learnerLabel;for(const key of ['learningMode','modeVersion','capabilities'])if(Object.hasOwn(data,key))remote[key]=data[key];}let url=null;try{const u=new URL(data.fobizzClassroomUrl);if(u.protocol==='https:'&&['app.fobizz.com','go.fobizz.com','tools.fobizz.com'].includes(u.hostname)&&!u.username&&!u.password)url=u.href;}catch{}if(remote)remote.fobizzUrl=url;if(data.messages)drawChat(data.messages);if(data.lastFeedback){$('coachResult').textContent=data.lastFeedback;$('coachResult').hidden=false;}}
async function loadChat(){if(remote)drawChat((await api('/api/chat/history')).messages);}
async function withBusy(fn){if(busy)return;busy=true;$('notice').textContent='';$('loginMessage').textContent='';for(const b of document.querySelectorAll('button'))b.disabled=true;try{await fn();}catch(e){
  if(e.status===401&&remote){remote=null;view=null;localState=null;clearPanels();$('loginMessage').textContent=e.message;}
  else if(e.status===409&&remote){try{clearPanels();absorb(await api('/api/state'));await loadChat();}catch{}$('notice').textContent=e.message;}
  else{$('notice').textContent=e.message||'Verbindung fehlgeschlagen.';$('loginMessage').textContent=e.message||'Verbindung fehlgeschlagen.';}
}finally{busy=false;for(const b of document.querySelectorAll('button'))b.disabled=false;render();}}
async function action(path,data={},method){let r;if(remote){r=await api('/api/'+path,{requestId:newId(),revision:view.revision,modeVersion:remote.modeVersion,...data},method);absorb(r);}else{
  r={};if(path==='answer')r.result=submitAnswer(localState,data.value,data.unit);if(path==='hint')r.hint=useHint(localState);if(path==='next')nextTask(localState);if(path==='coach/packet')r.packet=coachPacket(localState);if(path==='coach/apply')r.coach=applyCoach(localState,data.recommendation);view=publicState(localState);
}render();return r;}
$('loginForm').onsubmit=e=>{e.preventDefault();withBusy(async()=>{const r=await api('/api/session',{code:$('learningCode').value});remote={token:r.token,room:r.classroom,label:r.learnerLabel};localState=null;clearPanels();absorb(r);$('learningCode').value='';await loadChat();if(r.hint){$('hintText').textContent=r.hint;$('hintText').hidden=false;}if(view.task.solved)$('result').textContent='Diese Aufgabe hast du bereits gelöst. Du kannst direkt weiterarbeiten.';});};
$('demo').onclick=()=>withBusy(async()=>{remote=null;localState=createState();view=publicState(localState);clearPanels();$('fobizz').hidden=true;$('fobizz').removeAttribute('href');});
$('logout').onclick=()=>withBusy(async()=>{const wasRemote=Boolean(remote);let offline=false;if(remote){try{await api('/api/session',null,'DELETE');}catch(e){if(e.status!==401)offline=true;}}remote=null;localState=null;view=null;clearPanels();$('learningCode').value='';$('loginMessage').textContent=offline?'Auf diesem Gerät abgemeldet. Die Serversitzung konnte nicht beendet werden und läuft automatisch ab. Dein Lernstand bleibt gespeichert.':wasRemote?'Abgemeldet. Dein gespeicherter Lernstand bleibt erhalten.':'Demo beendet. Die lokalen Eingaben wurden verworfen.';});
$('answerForm').onsubmit=e=>{e.preventDefault();withBusy(async()=>{const r=await action('answer',{taskId:view.task.id,value:$('value').value,unit:$('unit').value});$('result').textContent=r.result.message;$('result').className=r.result.correct?'success':'error';});};
$('hint').onclick=()=>withBusy(async()=>{const r=await action('hint');$('hintText').textContent=r.hint;$('hintText').hidden=false;});
$('next').onclick=()=>withBusy(async()=>{await action('next');$('value').value='';$('unit').value='m/s';$('hintText').hidden=true;$('result').className='';$('result').textContent='Neuer Schritt, neue Chance.';$('packetArea').hidden=true;if(view.completed%4===0){$('coachResult').textContent=view.summary;$('coachResult').hidden=false;}setTimeout(()=>$('value').focus(),0);});
$('packet').onclick=()=>withBusy(async()=>{const r=await action('coach/packet');$('packetText').value=r.packet.prompt;$('coachReply').value='';$('packetArea').hidden=false;});
$('copy').onclick=()=>withBusy(async()=>{try{await navigator.clipboard.writeText($('packetText').value);$('notice').textContent='Text kopiert. Füge ihn in deinen freigegebenen fobizz-Assistenten ein.';}catch{$('packetText').focus();$('packetText').select();$('notice').textContent='Bitte den markierten Text über das Gerätemenü kopieren.';}});
$('apply').onclick=()=>withBusy(async()=>{let recommendation;try{recommendation=JSON.parse($('coachReply').value);}catch{throw new Error('Bitte ausschließlich das JSON-Objekt von fobizz einfügen.');}const r=await action('coach/apply',{recommendation});$('coachResult').textContent=r.coach.feedback;$('coachResult').hidden=false;$('packetArea').hidden=true;});
$('learningModeForm').onsubmit=e=>{e.preventDefault();withBusy(async()=>{const learningMode=$('learningMode').value;await action('learning-mode',{learningMode},'PATCH');$('packetArea').hidden=true;$('chatMessage').value='';await loadChat();});};
$('chatForm').onsubmit=e=>{e.preventDefault();withBusy(async()=>{const r=await action('chat/messages',{message:$('chatMessage').value,taskId:view.task.id});$('chatMessage').value='';$('packetArea').hidden=true;if(r.recommendationStatus==='rejected'||r.taskPlanStatus==='rejected')$('notice').textContent='Die Antwort ist da. Eine unpassende Aufgabenempfehlung wurde verworfen.';});};
$('deleteChat').onclick=()=>withBusy(async()=>{await action('chat/history',{},'DELETE');$('notice').textContent='Dein hier gespeicherter Verlauf wurde gelöscht. Dein Lernstand bleibt erhalten.';});
render();

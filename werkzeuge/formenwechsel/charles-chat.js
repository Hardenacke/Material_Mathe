/* Gespräch bleibt im geöffneten Tab und wird bei einem neuen Kontext geleert. */
'use strict';
(()=>{
 const dock=document.querySelector('#coachDock'),card=document.querySelector('#autoCoachCard');
 const form=document.querySelector('#charlesForm'),input=document.querySelector('#charlesQuestion'),send=document.querySelector('#charlesSend');
 const log=document.querySelector('#charlesMessages'),status=document.querySelector('#charlesStatus');
 let context='',history=[],generation=0,busy=false;
 function paint(){
  const ready=dock.dataset.questionReady==='true';
  input.disabled=!ready;send.disabled=!ready||busy||!input.value.trim();
  form.setAttribute('aria-busy',String(busy));card.dataset.questionLoading=String(busy);
  if(!ready&&!busy)status.textContent='Fragen sind gerade nicht verfügbar. Nutze die Hinweise an der Aufgabe oder versuche es gleich erneut.';
 }
 function sync(){
  const next=dock.dataset.questionContext||'';
  if(next!==context){context=next;generation++;history=[];busy=false;log.replaceChildren();input.value='';status.textContent='';}
  if(dock.dataset.questionReady==='true'&&!busy&&!history.length)status.textContent='';
  paint();
 }
 function message(role,text){
  const box=document.createElement('div');box.className='charlesMessage '+role;
  const label=document.createElement('strong');label.textContent=role==='user'?'Du':'Charles';
  const content=document.createElement('p');content.textContent=text;box.append(label,content);log.append(box);
  // Ältere Nachrichten bleiben nur im begrenzten Verlauf dieses Beispiels.
  while(log.children.length>8)log.firstElementChild.remove();
  const body=log.closest('.coachDockBody');body.scrollTop=body.scrollHeight;
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();const question=input.value.trim();
  if(busy||dock.dataset.questionReady!=='true')return;
  if(!question){input.focus();return;}
  if(question.length>600){status.textContent='Kürze deine Frage bitte auf höchstens 600 Zeichen.';return;}
  const epoch=generation,stamp=context,previous=history.slice(-6);
  message('user',question);input.value='';busy=true;status.textContent='Charles denkt nach …';paint();
  try{
   const result=await globalThis.Formenwechsel.askCharles(question,previous);
   if(epoch!==generation||stamp!==dock.dataset.questionContext)return;
   history=[...previous,{role:'user',text:question},{role:'assistant',text:result.answer}].slice(-6);
   message('assistant',result.answer);status.textContent='';
  }catch{
   if(epoch!==generation||stamp!==dock.dataset.questionContext)return;
   input.value=question;status.textContent='Charles konnte gerade nicht antworten. Sende deine Frage noch einmal oder nutze den Hinweis an der Aufgabe.';
  }finally{if(epoch===generation){busy=false;paint();}}
 });
 input.addEventListener('input',paint);
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();form.requestSubmit();}});
 new MutationObserver(sync).observe(dock,{attributes:true,attributeFilter:['data-question-context','data-question-ready']});
 sync();
})();

/* Bildschirmfeste Lernbegleitung; unabhängig von Aufgaben und KI-Anfragen. */
'use strict';
(() => {
 const dock=document.querySelector('#coachDock'),card=document.querySelector('#autoCoachCard');
 const launcher=document.querySelector('#coachLauncher'),collapse=document.querySelector('#coachCollapse');
 if(!dock||!card||!launcher||!collapse)return;
 const root=document.documentElement,key='formenwechsel-k9-coach-dock';
 let collapsed=false,unread=false,lastFeedback='',frame=0,focusTimer=0;
 try{collapsed=localStorage.getItem(key)==='collapsed';}catch{}

 function fitViewport(){
  const v=window.visualViewport;
  const width=v?.width||window.innerWidth,height=v?.height||window.innerHeight;
  root.style.setProperty('--coach-vw',`${width}px`);
  root.style.setProperty('--coach-vh',`${height}px`);
  root.style.setProperty('--coach-keyboard-gap',`${Math.max(0,window.innerHeight-height-(v?.offsetTop||0))}px`);
  root.style.setProperty('--coach-right-gap',`${Math.max(0,window.innerWidth-width-(v?.offsetLeft||0))}px`);
  root.style.setProperty('--coach-clearance',`${Math.ceil(dock.getBoundingClientRect().height)+24}px`);
  scheduleReveal();
 }
 function scheduleReveal(){
  clearTimeout(focusTimer);
  // Nach der nativen Safari-Fokusbewegung und der Tastaturanimation korrigieren.
  focusTimer=setTimeout(()=>{
   const input=document.activeElement;
   if(collapsed||!input?.matches?.('#answerForm input'))return;
   const field=input.getBoundingClientRect(),panel=card.getBoundingClientRect();
   if(field.bottom>panel.top-12&&field.right>panel.left-12)
    window.scrollBy({top:Math.max(0,field.bottom-panel.top+16),behavior:'auto'});
  },120);
 }
 function scheduleFit(){
  if(frame)return;
  frame=requestAnimationFrame(()=>{frame=0;fitViewport();});
 }
 function paint(){
  card.hidden=collapsed;
  launcher.hidden=!collapsed;
  dock.dataset.collapsed=String(collapsed);
  dock.dataset.unread=String(unread);
  dock.dataset.tone=card.dataset.tone||'neutral';
  dock.dataset.loading=String(card.dataset.state==='loading'||card.dataset.questionLoading==='true');
  document.body.dataset.coachCollapsed=String(collapsed);
  launcher.setAttribute('aria-expanded',String(!collapsed));
  collapse.setAttribute('aria-expanded',String(!collapsed));
  launcher.setAttribute('aria-label',unread?'Neue Rückmeldung – Charles öffnen':'Charles öffnen');
  scheduleFit();
 }
 function setCollapsed(value){
  collapsed=value;
  if(!value)unread=false;
  try{localStorage.setItem(key,value?'collapsed':'expanded');}catch{}
  paint();
  (value?launcher:collapse).focus({preventScroll:true});
 }
 collapse.addEventListener('click',()=>setCollapsed(true));
 launcher.addEventListener('click',()=>setCollapsed(false));
 dock.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!collapsed){event.preventDefault();setCollapsed(true);}
 });
 function feedbackChanged(){
  const text=[document.querySelector('#autoCoachText').textContent,document.querySelector('#charlesMessages').textContent].join('|').trim();
  const stamp=[card.dataset.state,card.dataset.tone,text].join('|');
  if(card.dataset.state!=='loading'){
   if(collapsed&&lastFeedback&&stamp!==lastFeedback&&text)unread=true;
   lastFeedback=stamp;
  }
  paint();
 }
 new MutationObserver(feedbackChanged).observe(card,{
  subtree:true,childList:true,characterData:true,attributes:true,
  attributeFilter:['data-state','data-tone','data-question-loading'],
 });
 if(window.ResizeObserver)new ResizeObserver(scheduleFit).observe(dock);
 window.addEventListener('resize',scheduleFit,{passive:true});
 window.visualViewport?.addEventListener('resize',scheduleFit,{passive:true});
 window.visualViewport?.addEventListener('scroll',scheduleFit,{passive:true});
 document.addEventListener('focusin',event=>{
  if(!event.target.matches?.('#answerForm input'))return;
  scheduleReveal();
 });
 feedbackChanged();
})();

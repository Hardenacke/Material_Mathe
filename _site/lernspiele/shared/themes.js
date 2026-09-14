/* Four offline, vector-based looks. This module never changes task data or scores. */
(function(){
  'use strict';
  const meta=window.GAME_META||{};
  // Preferences belong to one page; the previous global v1 preference is ignored.
  const scope=meta.id?JSON.stringify([meta.grade,meta.course||'',meta.id]):'hub';
  const KEY='mathe_lernspiele_look_v2_'+encodeURIComponent(scope);
  const looks=[
    {id:'retro64',name:'Retro 64',tag:'Ein kleines Abenteuer',description:'Schwebende Inseln, facettierte Formen und kräftige Farben.',color:'#242d65'},
    {id:'pixel',name:'Pixel-Werkstatt',tag:'Block für Block weiter',description:'Klare Pixel, kleine Figuren und große Entdeckungen.',color:'#d9f0df'},
    {id:'paper',name:'Papierwelt',tag:'Platz für gute Ideen',description:'Papier, Farbstifte und eine Prise Werkstattgefühl.',color:'#f4e6ce'},
    {id:'studio',name:'Mathe-Studio',tag:'Klar denken. Weiterkommen.',description:'Ruhige Flächen, klare Formen und viel Raum zum Denken.',color:'#172d42'}
  ];
  const fallback=looks.some(x=>x.id===meta.defaultLook)?meta.defaultLook:'studio';
  const lookName=id=>looks.find(x=>x.id===id)?.name||'Mathe-Studio';
  function resetLook(){try{localStorage.removeItem(KEY);}catch{}applyLook(fallback,false);}
  let chosen=fallback;try{const stored=localStorage.getItem(KEY);if(looks.some(x=>x.id===stored))chosen=stored;}catch{}
  document.documentElement.dataset.look=chosen;
  document.body.style.setProperty('--subject',window.GAME_META?.color||'#4b6b83');
  document.body.style.removeProperty('--accent');
  const iconPaths={
    aa:'<path d="M6 19h20M16 5v21M6 9h20M7 9l-5 9h10L7 9zm18 0-5 9h10l-5-9z"/>',
    fun:'<path d="M5 3v24h24M8 22c3 0 4-13 8-13s5 9 8 9 3-7 5-11"/>',
    ana:'<path d="M5 3v24h24M8 22c3 0 4-13 8-13s5 9 8 9 3-7 5-11"/>',
    geo:'<path d="m16 3 12 7v13l-12 7L4 23V10zm0 13L4 10m12 6 12-6m-12 6v14M10 7l12 7v12"/>',
    geo2:'<path d="m16 3 12 7v13l-12 7L4 23V10zm0 13L4 10m12 6 12-6m-12 6v14M10 7l12 7v12"/>',
    sto:'<rect x="4" y="4" width="24" height="24" rx="5"/><path d="M10 10h.01M22 10h.01M16 16h.01M10 22h.01M22 22h.01" stroke-width="4"/>',
    training:'<path d="m6 23-1 5 5-1L27 10l-4-4L6 23zm14-14 4 4M6 23l4 4"/>',
    mission:'<path d="M6 29V4m0 1c7-6 12 5 20 0v14c-8 5-13-6-20 0"/>',
    exam:'<rect x="6" y="5" width="21" height="24" rx="3"/><path d="M12 3h9v6h-9zm-1 15 3 3 8-8"/>',
    theme:'<path d="m16 3 13 13-13 13L3 16zM3 16h26M16 3l-6 13 6 13 6-13-6-13"/>',
    star:'<path d="m16 3 4 8 9 2-6 6 1 10-8-5-8 5 1-10-6-6 9-2z"/>'
  };
  function icon(name){return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(iconPaths[name]||iconPaths.geo)+'</svg>';}
  function cube(x,y,s,top,left,right){return `<g transform="translate(${x} ${y})"><path d="M0 0 ${s} ${-s/2} ${2*s} 0 ${s} ${s/2}Z" fill="${top}"/><path d="M0 0v${s}l${s} ${s/2}V${s/2}Z" fill="${left}"/><path d="m${s} ${s/2} ${s} ${-s/2}v${s}l${-s} ${s/2}Z" fill="${right}"/></g>`;}
  function scene(id,field='geo'){
    const glyph=icon(field);
    let art='';
    if(id==='retro64')art=`
      <ellipse cx="272" cy="289" rx="154" ry="20" fill="#10183f" opacity=".22"/>
      <circle cx="399" cy="63" r="40" fill="#ffcc84"/><path d="m399 23 21 40-21 40-20-40z" fill="#ffe5b1"/>
      <path d="m38 88 20-12 20 12-20 12zM442 145l17-10 17 10-17 10z" fill="#93c5ea"/>
      <path d="m79 190 173-83 178 75-80 77-141 4z" fill="#9bbde9"/>
      <path d="m79 190 99 44 32 60-88-45z" fill="#485aa0"/><path d="m178 234 172 25-59 64-81-29z" fill="#39477f"/><path d="m350 259 80-77-27 73-112 68z" fill="#28336a"/>
      <path d="m79 190 173-83 41 74-115 53z" fill="#b8daaa"/><path d="m252 107 178 75-137-1z" fill="#daebbf"/><path d="m178 234 115-53 137 1-80 77z" fill="#91c69c"/>
      <path d="m195 217 71-34 12 6-73 36zm34 12 68-35 14 7-69 35z" fill="#e5efd0"/>
      ${cube(247,122,42,'#fff2ce','#f0aa65','#d27659')}
      ${cube(141,155,27,'#b5e5f0','#6cbbc9','#428dba')}
      <path d="M318 179v-61c0-39 60-39 60 0v29l-17 10v-39c0-18-25-18-25 0v51z" fill="#ffbe86"/><path d="m318 179 9 5 18-10-9-5zM378 147l9 4v-34c0-28-18-48-44-39 20 0 34 14 34 40z" fill="#d8896d"/>
      <path d="m207 66 8 19 20 2-15 14 4 20-17-10-18 10 4-20-14-14 20-2z" fill="#ffd37b"/><path d="m207 66 0 30 17 25-4-20 15-14-20-2z" fill="#edaa50"/>
      <path d="m374 242 16 8-7 15-13-6z" fill="#728ac9"/>`;
    else if(id==='pixel')art=`
      <g shape-rendering="crispEdges">
      <path d="M57 52h27V40h46v12h26v24H57zM337 56h21V43h33v13h34v23h-88z" fill="#f8fff3"/>
      <path d="M434 34h27v27h-27zM424 44h47v7h-47z" fill="#f1c45f"/>
      <path d="M44 200h95v-26h99v-19h100v35h105v40H44z" fill="#83b78e"/>
      <path d="M44 214h95v-26h99v-19h100v35h105v26H44z" fill="#badb95"/>
      <path d="M44 230h95v-26h99v-19h100v35h105v48H44z" fill="#617b68"/>
      <path d="M44 230h95v38H44zm95-26h99v64h-99zm99-19h100v83H238z" fill="#91774f"/>
      <path d="M58 244h14v13H58zm44-4h14v14h-14zm56-22h15v15h-15zm36 22h15v15h-15zm59-38h14v14h-14zm37 30h16v16h-16zm75 5h17v17h-17zm41 0h17v17h-17z" fill="#b39967"/>
      <path d="M107 178v-42H92v-31h15V89h31v16h15v31h-15v42z" fill="#44755b"/><path d="M107 105h16v31h-16z" fill="#72975e"/>
      <path d="M253 107h52v62h-52zM265 94h29v13h-29z" fill="#d47c4c"/><path d="M253 107h13v62h-13zM265 94h29v13h-29z" fill="#efaf65"/>
      <path d="M263 116h32v27h-32z" fill="#fff0bf"/><path d="M269 121h6v9h-6zm15 0h6v9h-6z" fill="#334c45"/>
      <path d="M248 166h23v14h-23zm39 0h23v14h-23zM244 133h9v21h-9zm61 0h9v21h-9z" fill="#334c45"/>
      <path d="M190 56h12v-12h13v12h12v12h-12v12h-13V68h-12zM358 118h12v-12h13v12h12v12h-12v12h-13v-12h-12z" fill="#e9b94f"/>
      <path d="M353 197v-35h8v35zm8-35h36v22h-36z" fill="#c17054"/>
      </g>`;
    else if(id==='paper')art=`
      <g transform="translate(160 68) rotate(-9)"><rect x="5" y="9" width="184" height="195" rx="3" fill="#302e29" opacity=".1"/><rect width="184" height="195" rx="3" fill="#fffcf1" stroke="#bcb6a3"/>
      <path d="M16 44h152M16 75h152M16 106h152M16 137h152M16 168h152" stroke="#d7e3dc"/><path d="M35 0v195" stroke="#dda29a"/>
      <path d="m47 108 36-63 49 61z" fill="#bed2c0" stroke="#455a4b" stroke-width="2"/><path d="M65 155q28-59 74-28" fill="none" stroke="#a76546" stroke-width="3"/>
      <path d="M58-10h63v27H58z" fill="#dfb66b" opacity=".7"/></g>
      <g transform="translate(351 149) rotate(13)"><rect width="82" height="87" rx="3" fill="#cb704f"/><path d="M21 45h41M42 24v42" stroke="#fff1d7" stroke-width="6" stroke-linecap="round"/></g>
      <path d="m105 92 17-31 15 33 33 5-24 24 4 35-29-17-29 14 6-34-23-26z" fill="#e5bb61" stroke="#876339" stroke-width="2"/>
      <path d="m94 245 99-35-29 78z" fill="#82988d"/><path d="m112 250 58-19-20 45z" fill="#efe7d3"/>
      <g transform="translate(339 52) rotate(22)"><path d="M0 0h15v90H0z" fill="#ba7652"/><path d="M4 0h5v90H4z" fill="#e9ba71"/><path d="m0 90 7.5 20L15 90z" fill="#e9cba0"/><path d="m5 103 2.5 7 2.5-7z" fill="#373e34"/></g>
      <path d="M396 255q21-8 31-23M70 183l-13 6m19 5-4 10M216 42l1-15m10 21 12-9" fill="none" stroke="#827964" stroke-width="2" stroke-linecap="round"/>`;
    else art=`
      <circle cx="274" cy="167" r="115" fill="none" stroke="#8fa7bc" stroke-opacity=".24"/><ellipse cx="274" cy="168" rx="186" ry="66" fill="none" stroke="#8fa7bc" stroke-opacity=".4" transform="rotate(-26 274 168)"/>
      <path d="M58 260h380M96 285V49" stroke="#8fa7bc" stroke-opacity=".18"/><path d="M119 223q55-3 80-93t98 5q34 68 100-43" fill="none" stroke="#b0cab6" stroke-width="2"/>
      <circle cx="397" cy="92" r="6" fill="#b0cab6"/>
      ${cube(196,141,69,'#c6d9d8','#95b3b9','#698c9d')}
      <circle cx="372" cy="236" r="34" fill="#cb866a"/><path d="M352 209a34 34 0 0 1 41 48 34 34 0 0 0-41-48" fill="#e3a081"/>
      <circle cx="148" cy="91" r="12" fill="#eed19c"/>
      <path d="m305 56 19-11 19 11-19 11zm0 0v22l19 11V67m19-11v22l-19 11" fill="#89989c" stroke="#c8d3cb"/>
      <circle cx="82" cy="207" r="3" fill="#a8c1c8"/>`;
    return `<svg class="scene-art" viewBox="0 0 500 340" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${art}</svg><span class="scene-emblem" aria-hidden="true">${glyph}</span>`;
  }
  function applyLook(id,persist=true){
    if(!looks.some(x=>x.id===id))return;
    chosen=id;document.documentElement.dataset.look=id;
    if(persist)try{localStorage.setItem(KEY,id);}catch{}
    document.querySelectorAll('[data-look-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lookChoice===id)));
    document.querySelectorAll('[data-scene]').forEach(el=>{el.innerHTML=scene(id,el.dataset.field||'geo');});
    const label=document.querySelector('#lookCurrent');if(label)label.textContent=looks.find(x=>x.id===id).name;
    const themeMeta=document.querySelector('meta[name="theme-color"]');if(themeMeta)themeMeta.content=looks.find(x=>x.id===id).color;
  }
  function mount(){
    const shell=document.querySelector('.game-shell,.hub');if(!shell||document.querySelector('.lookbar'))return;
    const hub=shell.classList.contains('hub'),header=shell.querySelector('header');
    const bar=document.createElement('nav');bar.className='lookbar';bar.setAttribute('aria-label','Darstellung und Navigation');
    const home=window.GAME_META?.hubPath||'index.html';
    bar.innerHTML=`<a class="brand" href="${home}"><span class="brand-mark" aria-hidden="true">${icon('geo')}</span><span>MATHE<span class="brand-sub">MISSIONEN</span></span></a><div class="lookbar-tools"><button id="lookBtn" type="button" aria-haspopup="dialog">${icon('theme')}<span>Look: <strong id="lookCurrent"></strong></span></button></div>`;
    shell.prepend(bar);
    const actions=header.querySelector('.header-actions');if(actions)bar.querySelector('.lookbar-tools').append(actions);
    const copy=document.createElement('div');copy.className='hero-copy';while(header.firstChild)copy.append(header.firstChild);header.append(copy);
    const meta=window.GAME_META||{};
    const extra=document.createElement('div');extra.className='hero-foot';extra.innerHTML=`<span class="hero-chip">${icon(meta.field||'star')}<span>${hub?'Dein Tempo. Dein Weg.':'Schritt für Schritt'}</span></span><span>${hub?'Klasse 5 bis Q2':meta.duration||'Eine Runde für dich'}</span>`;copy.append(extra);
    const art=document.createElement('div');art.className='hero-art';art.dataset.scene='';art.dataset.field=meta.field||'geo';art.setAttribute('aria-hidden','true');header.append(art);header.classList.add('scene-header');
    const modal=document.createElement('div');modal.id='lookDialog';modal.className='look-dialog';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','lookTitle');
    modal.innerHTML=`<div class="look-dialog-card"><div class="look-dialog-top"><div><p class="section-kicker">DEINE SPIELWELT</p><h2 id="lookTitle">Welcher Look passt zu dir?</h2></div><button class="look-close" type="button" aria-label="Look-Auswahl schließen">×</button></div><p>Für ${hub?'die Übersicht':'dieses Spiel'} ist <strong>${lookName(fallback)}</strong> ausgewählt. Du kannst den Look ändern; Aufgabe und Fortschritt bleiben erhalten.</p><div class="look-options">${looks.map(x=>`<button class="look-option" data-look-choice="${x.id}" type="button" aria-pressed="false"><span class="look-swatch look-swatch-${x.id}">${scene(x.id)}</span><span class="look-option-copy"><strong>${x.name}</strong>${x.id===fallback?'<span class="look-recommended">Für dieses Spiel gewählt</span>':''}<small>${x.description}</small><span class="look-check" aria-hidden="true">✓</span></span></button>`).join('')}</div><p class="look-note">Eine Änderung wird auf diesem Gerät nur für ${hub?'die Übersicht':'dieses Spiel'} gemerkt.</p><button class="look-reset soft-btn" type="button">Zugeordneten Look verwenden</button><button class="look-done primary-btn" type="button">So gefällt’s mir</button></div>`;
    document.body.append(modal);
    let previousFocus=null;
    const close=()=>{modal.hidden=true;document.body.classList.remove('look-open');previousFocus?.focus({preventScroll:true});};
    document.querySelector('#lookBtn').onclick=()=>{previousFocus=document.activeElement;modal.hidden=false;document.body.classList.add('look-open');modal.querySelector(`[data-look-choice="${chosen}"]`).focus({preventScroll:true});};
    modal.querySelectorAll('[data-look-choice]').forEach(b=>b.onclick=()=>applyLook(b.dataset.lookChoice));
    modal.querySelector('.look-reset').onclick=resetLook;
    modal.querySelector('.look-close').onclick=close;modal.querySelector('.look-done').onclick=close;modal.onclick=e=>{if(e.target===modal)close();};
    modal.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const nodes=[...modal.querySelectorAll('button')],first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
    applyLook(chosen,false);
  }
  window.GameLook={icon,scene,apply:applyLook,reset:resetLook,mount,looks,lookName,defaultLook:fallback};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

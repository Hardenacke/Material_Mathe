/* Mathematische Darstellung und Aufgabenformat. Keine externen Abhängigkeiten. */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=4)=>Number(n.toFixed(d)).toLocaleString('de-DE',{maximumFractionDigits:d,useGrouping:false});
const f=(a,b)=>`<span class="frac" aria-label="${esc(a)} durch ${esc(b)}"><span>${a}</span><span>${b}</span></span>`;
const pow=(a,b)=>`${a}<sup>${b}</sup>`;
const vec=a=>`<span class="vector" aria-label="Vektor ${a.join('; ')}">${a.map(x=>`<span>${fmt(x)}</span>`).join('')}</span>`;
const sign=n=>n<0?' − '+fmt(-n):' + '+fmt(n);
const table=(heads,rows)=>`<div class="tablewrap"><table><thead><tr>${heads.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>'<tr>'+r.map(x=>`<td>${x}</td>`).join('')+'</tr>').join('')}</tbody></table></div>`;
const H=(a,b,c)=>[a,b,c];
const task=(type,prompt,answer,solution,hints,more={})=>({type,prompt,answer,solution,hints,rep:'symbolisch',operator:type==='num'?'berechnen':'begründen',...more});
const N=(p,a,s,h,m={})=>task('num',p,Array.isArray(a)?a:[a],s,h,m);
const C=(p,a,d,s,h,m={})=>task('choice',p,a,s,h,{choices:[a,...d],...m});
const O=(p,a,s,h,m={})=>task('order',p,a,s,h,{rep:'sprachlich',...m});
const P=(p,total,selected,s,h,m={})=>task('paint',p,selected,s,h,{total,rep:'bildlich',...m});
const E=(p,steps,wrong,a,reason,d,s,h,m={})=>task('error',p,a,s,h,{steps,wrong,reason,reasons:[reason,...d],rep:'symbolisch',operator:'untersuchen',...m});
const L=(p,kind,target,s,h,m={})=>task('target',p,target,s,h,{lab:{kind,target},rep:'graphisch',operator:'bestimmen',...m});
const binom=(n,k)=>{let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r;};
const bp=(n,p,k)=>binom(n,k)*p**k*(1-p)**(n-k);
const svg=(body,label='Mathematische Darstellung',view='0 0 480 260')=>`<svg role="img" aria-label="${esc(label)}" viewBox="${view}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const tx=(x,y,t,extra='')=>`<text x="${x}" y="${y}" ${extra}>${t}</text>`;
const ln=(x,y,u,v,extra='')=>`<line x1="${x}" y1="${y}" x2="${u}" y2="${v}" ${extra}/>`;
function bars(values,labels=[],base=0){
 const top=Math.max(...values),step=(top-base)/4||1,w=360/values.length;
 let s='';for(let i=0;i<=4;i++){let v=base+step*i,y=215-i*43;s+=ln(60,y,440,y,'class="gridline"')+tx(52,y+5,fmt(v,1),'text-anchor="end"');}
 values.forEach((v,i)=>{let ht=(v-base)/(top-base||1)*172,x=70+i*w;s+=`<rect x="${x}" y="${215-ht}" width="${w*.7}" height="${ht}" class="bar"/>`+tx(x+w*.35,240,labels[i]??String(i+1),'text-anchor="middle"')+tx(x+w*.35,205-ht,fmt(v),'text-anchor="middle"');});
 if(base>0)s+=tx(65,25,'Achtung: Achse beginnt bei '+fmt(base));
 return svg(s,'Säulendiagramm: '+values.map((v,i)=>(labels[i]??i+1)+': '+v).join(', '));
}
function plot(curves,range=[-5,5,-5,7],points=[]){
 const [xmin,xmax,ymin,ymax]=range;const X=x=>48+(x-xmin)/(xmax-xmin)*390,Y=y=>222-(y-ymin)/(ymax-ymin)*195;
 let s='';const dx=(xmax-xmin)>20?Math.ceil((xmax-xmin)/10):1,dy=(ymax-ymin)>20?Math.ceil((ymax-ymin)/8):1;
 for(let x=Math.ceil(xmin/dx)*dx;x<=xmax;x+=dx)s+=ln(X(x),27,X(x),222,'class="gridline"')+tx(X(x),244,fmt(x,1),'text-anchor="middle"');
 for(let y=Math.ceil(ymin/dy)*dy;y<=ymax;y+=dy)s+=ln(48,Y(y),438,Y(y),'class="gridline"')+tx(40,Y(y)+4,fmt(y,1),'text-anchor="end"');
 if(xmin<=0&&xmax>=0)s+=ln(X(0),22,X(0),224,'class="axis"');
 if(ymin<=0&&ymax>=0)s+=ln(46,Y(0),443,Y(0),'class="axis"');
 s+=tx(454,244,'x')+tx(26,17,'y');
 curves.forEach((c,i)=>{let d='',on=false;for(let j=0;j<=360;j++){let x=xmin+(xmax-xmin)*j/360,y=c.fn(x);if(!Number.isFinite(y)||y<ymin||y>ymax){on=false;continue;}d+=(on?'L':'M')+X(x).toFixed(2)+' '+Y(y).toFixed(2);on=true;}s+=`<path d="${d}" fill="none" stroke="${c.color||'#245cad'}" stroke-width="3" ${c.dash?'stroke-dasharray="7 5"':''}/>`;});
 points.forEach(p=>s+=`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="5" fill="#a13a21"/>`+(p[2]?tx(X(p[0])+8,Y(p[1])-10,p[2]):''));
 return svg(s,'Koordinatensystem mit beschrifteten Achsen und Funktionsgraphen');
}
function rect(a,b,labels=true){const sc=Math.min(300/a,150/b),w=a*sc,h=b*sc;return svg(`<rect x="85" y="45" width="${w}" height="${h}" class="shape"/>`+(labels?tx(85+w/2,65+h,fmt(a)+' cm','text-anchor="middle"')+tx(73,50+h/2,fmt(b)+' cm','text-anchor="end"'):''),'Rechteck');}
function triangle(a,b,cLabel='c',aLabel=null,bLabel=null){const sc=Math.min(300/a,160/b),x=95,y=210,w=a*sc,h=b*sc;return svg(`<path d="M${x},${y}h${w}L${x},${y-h}Z" class="shape"/><path d="M${x+16},${y}v-16h-16" fill="none" stroke="#122f37"/>`+tx(x+w/2,y+25,aLabel??fmt(a)+' cm','text-anchor="middle"')+tx(x-12,y-h/2,bLabel??fmt(b)+' cm','text-anchor="end"')+tx(x+w/2+12,y-h/2-8,cLabel),'Rechtwinkliges Dreieck mit Maßangaben');}
function cuboid(a,b,c){const sc=Math.min(240/(a+.65*b),140/(c+.35*b)),x=100,y=210,w=a*sc,dx=.65*b*sc,dy=-.35*b*sc,h=c*sc;let s=`<path d="M${x},${y}h${w}v${-h}h${-w}Z" fill="#d9eeeb"/><path d="M${x},${y-h}l${dx},${dy}h${w}l${-dx},${-dy}Z" fill="#adcfcb"/><path d="M${x+w},${y}l${dx},${dy}v${-h}l${-dx},${-dy}Z" fill="#87b5b1"/>`;
 for(let i=0;i<=a;i++)s+=ln(x+i*sc,y,x+i*sc,y-h)+ln(x+i*sc,y-h,x+i*sc+dx,y-h+dy);
 for(let i=0;i<=c;i++)s+=ln(x,y-i*sc,x+w,y-i*sc)+ln(x+w,y-i*sc,x+w+dx,y-i*sc+dy);
 for(let i=0;i<=b;i++)s+=ln(x+.65*i*sc,y-h-.35*i*sc,x+w+.65*i*sc,y-h-.35*i*sc)+ln(x+w+.65*i*sc,y-.35*i*sc,x+w+.65*i*sc,y-h-.35*i*sc);
 return svg(`<g stroke="#286f69" stroke-width="1.3">${s}</g>`+tx(x+w/2,y+28,`${a} cm`,'text-anchor="middle"')+tx(x+w+dx+18,y+dy/2,`${b} cm`)+tx(x-15,y-h/2,`${c} cm`,'text-anchor="end"'),'Vollständig gefüllter Quader aus Einheitswürfeln von 1 cm Kantenlänge');}
function circle(r,angle=360){let a=angle*Math.PI/180,endx=240+90*Math.cos(-Math.PI/2+a),endy=130+90*Math.sin(-Math.PI/2+a);return svg(`<circle cx="240" cy="130" r="90" class="shape"/>`+(angle<360?`<path d="M240 130L240 40A90 90 0 ${angle>180?1:0} 1 ${endx} ${endy}Z" fill="#83c4b8" stroke="#08796e"/>`:'')+ln(240,130,330,130)+tx(248,120,`r = ${r}`)+(angle<360?tx(245,154,`${angle}°`):''),'Kreis mit Radius '+r+' und Winkel '+angle+' Grad');}
function tree(r,b,repl=true){let total=r+b,p=fmt(r/total,2),pr=repl?p:fmt((r-1)/(total-1),2);return svg(ln(60,130,190,65)+ln(60,130,190,200)+ln(190,65,370,30)+ln(190,65,370,110)+ln(190,200,370,170)+ln(190,200,370,245)+tx(85,72,`${r}/${total}`)+tx(85,197,`${b}/${total}`)+tx(180,56,'R')+tx(180,223,'B')+tx(280,33,repl?`${r}/${total}`:`${r-1}/${total-1}`)+tx(280,106,repl?`${b}/${total}`:`${b}/${total-1}`)+tx(280,164,repl?`${r}/${total}`:`${r}/${total-1}`)+tx(280,239,repl?`${b}/${total}`:`${b-1}/${total-1}`)+tx(393,35,'RR')+tx(393,113,'RB')+tx(393,174,'BR')+tx(393,250,'BB'),'Baumdiagramm mit beschrifteten Wahrscheinlichkeiten');}
function boxplot(v){let mi=v[0],ma=v[4],X=x=>60+(x-mi)/(ma-mi)*350;return svg(ln(X(mi),120,X(ma),120)+ln(X(mi),90,X(mi),150)+ln(X(ma),90,X(ma),150)+`<rect x="${X(v[1])}" y="75" width="${X(v[3])-X(v[1])}" height="90" class="shape"/>`+ln(X(v[2]),75,X(v[2]),165)+v.map((x,i)=>tx(X(x),195,fmt(x),'text-anchor="middle"')).join(''),'Boxplot mit Minimum, unterem Quartil, Median, oberem Quartil und Maximum');}
function net(){return svg([[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]].map(([x,y],i)=>`<rect x="${105+55*x}" y="${35+55*y}" width="55" height="55" class="shape"/>`+tx(132+55*x,69+55*y,String(i+1),'text-anchor="middle"')).join(''),'Gültiges Würfelnetz aus sechs Quadraten');}
function four(a,b,c,d){return table(['','B','nicht B','Summe'],[['A',a,b,a+b],['nicht A',c,d,c+d],['Summe',a+c,b+d,a+b+c+d]]);}
function numberLine(lo,hi){let s=ln(45,130,435,130,'class="axis"');for(let n=lo;n<=hi;n++){let x=45+(n-lo)/(hi-lo)*390;s+=ln(x,122,x,138)+tx(x,161,fmt(n),'text-anchor="middle"');}return svg(s,'Zahlengerade von '+lo+' bis '+hi);}
function parseNumber(raw){let s=String(raw).trim().replace(/\s/g,'').replace(/−/g,'-').replace(',','.');if(!s)return null;let m=s.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)(?:\/([+-]?(?:\d+(?:\.\d*)?|\.\d+)))?$/i);if(!m)return null;let v=Number(m[1])/(m[2]===undefined?1:Number(m[2]));return Number.isFinite(v)?v:null;}
function numericEqual(input,expected,tol=0.0001){let v=parseNumber(input);return v!==null&&Math.abs(v-expected)<=tol+1e-10;}

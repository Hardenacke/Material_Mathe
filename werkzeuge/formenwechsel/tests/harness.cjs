/* Node-Tests ohne Browser: Fachmodell, Lernverlauf und Transfervertrag. */
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const path=require('path');const root=path.resolve(__dirname,'..');
const katex=require('../vendor/katex.min.js');
let rendered=0;
class El{
  constructor(id=''){this.id=id;this.dataset={};this.style={};this.value='';this.hidden=false;this.disabled=false;this.handlers={};this.math=[];this.attrs={};this.textContent='';}
  set innerHTML(v){this.html=v;this.math=[...v.matchAll(/data-tex="([^"]*)"/g)].map(m=>{let e=new El();e.dataset.tex=m[1];return e;});}
  get innerHTML(){return this.html||'';}
  querySelectorAll(){return this.math;}
  get parentElement(){return{querySelectorAll:()=>[this]};}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(k,f){this.handlers[k]=f;}
  focus(){} select(){} showModal(){this.open=true;}close(){this.open=false;}
  replaceChildren(){this.math=[];this.textContent='';}append(n){if(n.dataset?.tex)this.math.push(n);else this.textContent+=n.textContent||'';}
}
function boot(seed,transport){
  const els=new Map();const get=s=>{if(!els.has(s))els.set(s,new El(s));return els.get(s);};
  const doc={querySelector:get,querySelectorAll:s=>s==='[data-sign]'?[0,1].map(i=>{const e=new El();e.dataset.sign=String(i);return e;}):[...els.values()].flatMap(e=>e.math),createElement:()=>new El(),createTextNode:t=>({textContent:t})};
  let saved=seed?JSON.stringify(seed):null;
  const box={createCoachTransport:transport?()=>transport:undefined,document:doc,window:{scrollTo(){}},localStorage:{getItem:()=>saved,setItem:(k,v)=>{saved=v;}},navigator:{},crypto:require('crypto').webcrypto,console,katex:{render:(s,e,o)=>{katex.renderToString(s,o);rendered++;}},Date,Math};
  vm.createContext(box);vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),box);
  const click=id=>{assert.equal(get(id).disabled,false,`${id} nicht verfügbar`);get(id).onclick();};
  const fill=(i,v)=>{const e=get('#v'+i);e.value=String(v);e.handlers.input();};
  const submit=()=>get('#answerForm').onsubmit({preventDefault(){}});
  const answer=(wrong=false)=>{for(let z=0;z<3;z++){const t=box.Formenwechsel.getState().current;if(t.solved)return;const expected=t.guided&&t.stage===0?[t.b/t.a,t.b/(2*t.a)]:t.guided&&t.stage===1?[(t.b/(2*t.a))**2,-t.a*(t.b/(2*t.a))**2]:t.skill==='expand'?[t.b,t.c]:[-t.b/(2*t.a),t.c-t.b*t.b/(4*t.a)];fill(0,wrong?999:expected[0]);fill(1,wrong?999:expected[1]);submit();if(wrong)return;}};
  return{api:box.Formenwechsel,get,click,fill,submit,answer,saved:()=>JSON.parse(saved)};
}

module.exports={boot};

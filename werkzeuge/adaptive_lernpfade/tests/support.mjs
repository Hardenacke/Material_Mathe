import assert from 'node:assert/strict';
import gateway,{School} from '../worker/index.mjs';
import {DEFAULT_COACH_CONFIG} from '../worker/coach.mjs';
export function setup(testAdapter){
  let map=new Map(),alarm=null,queue=Promise.resolve();
  const adapter=data=>({get:async k=>structuredClone(data.get(k)),put:async(k,v)=>{if(typeof k==='object'){for(const[a,b]of Object.entries(k))data.set(a,structuredClone(b));}else data.set(k,structuredClone(v));},delete:async k=>data.delete(k),list:async({prefix='',limit=128,startAfter=''})=>new Map([...data].filter(([k])=>k.startsWith(prefix)&&k>startAfter).sort(([a],[b])=>a.localeCompare(b)).slice(0,limit).map(([k,v])=>[k,structuredClone(v)]))});
  const storage={get:(...a)=>adapter(map).get(...a),put:(...a)=>adapter(map).put(...a),delete:(...a)=>adapter(map).delete(...a),list:(...a)=>adapter(map).list(...a),getAlarm:async()=>alarm,setAlarm:async t=>{alarm=t;},deleteAlarm:async()=>{alarm=null;},transaction:async fn=>{const copy=structuredClone(map);const result=await fn(adapter(copy));map=copy;return result;}};
  const ctx={storage,blockConcurrencyWhile:fn=>{const p=queue.then(fn);queue=p.catch(()=>{});return p;}};
  const env={ALLOWED_ORIGINS:'https://hardenacke.github.io',TEACHER_KEY:'teacher-test-key-only-12345678901234567890',CODE_PEPPER:'pepper-test-key-only-12345678901234567890',SCHOOL_ID:'school-test'};
  const school=new School(ctx,env,testAdapter);env.SCHOOL={idFromName:x=>x,get:()=>school};
  async function req(path,body,token,method,origin=env.ALLOWED_ORIGINS){return gateway.fetch(new Request('https://worker.test/api/'+path,{method:method||(body?'POST':'GET'),headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined}),env);}
  const requestId=()=>crypto.randomUUID();
  async function teacher(){const r=await req('admin/session',{key:env.TEACHER_KEY});assert.equal(r.status,201);return(await r.json()).token;}
  async function room(token,options={}){const body={requestId:requestId(),name:'EF Physik',count:2,retentionDays:90,fobizzUrl:'https://app.fobizz.com/test',coachConfig:{...DEFAULT_COACH_CONFIG,defaultLearningMode:'classroom'},...options};const r=await req('admin/rooms',body,token);assert.equal(r.status,201);return{...(await r.json()),body};}
  async function login(code){const r=await req('session',{code});assert.equal(r.status,201);return r.json();}
  return{req,env,school,data:()=>map,teacher,room,login,requestId};
}
export async function fixture(){const f=setup(),teacher=await f.teacher(),room=await f.room(teacher);return{...f,admin:teacher,created:room};}
export const answerBody=(f,login)=>{const l=[...f.data().values()].find(x=>x.state&&x.label===login.learnerLabel&&x.roomId===login.classroom.id);return{requestId:f.requestId(),revision:login.state.revision,taskId:login.state.task.id,value:l.state.task.answer,unit:l.state.task.unit};};

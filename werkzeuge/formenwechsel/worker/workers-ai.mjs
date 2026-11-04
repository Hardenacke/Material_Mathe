import { Problem } from './domain.mjs';

export const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
export const modelName = env => env.AI_MODEL || DEFAULT_MODEL;
export const providerProblems = env => typeof env.AI?.run === 'function' ? [] : ['AI'];

export function modelInput(packet) {
 const {instruction, ...observations} = packet;
 const ids = packet.candidates.map(candidate => candidate.id);
 return {
  messages: [
   {role:'system',content:instruction + ' Antworte ausschließlich mit dem verlangten JSON-Objekt. '
    + 'Du heißt Charles. Sprich die Schülerin oder den Schüler direkt mit du an. '
    + 'Lobe richtige Rechenschritte und ermutige freundlich zum Weiterrechnen. '
    + 'Sprich über die Aufgabe, nicht über Lernsteuerung, Daten, Systeme oder deine Rolle. '
    + 'Dein feedback ist ein kurzer deutscher Satz mit höchstens 180 Zeichen. '
    + 'Bei der Auswahl: Festige beobachtete Fehlerschritte; ohne Fehler wähle eine passende neue Herausforderung. '
    + 'Nenne im feedback einen konkreten Rechenschritt statt allgemeiner Sätze wie "Prüfe deine Rechnung". '
    + 'Wenn guidance vorliegt, übernimm diesen fachlich geprüften Hinweis unverändert als feedback. '
    + 'Bei expand: binomische Formel, äußeren Vorfaktor und Zusammenfassen beachten. '
    + 'Bei complete stage=0: nach dem Ausklammern halbieren; stage=1: quadrieren und mit dem Vorfaktor ausgleichen; '
    + 'stage=2: Vorzeichen der ersten Scheitelkoordinate und Scheitelhöhe beachten. '
    + 'Die erlaubten Aufgaben sind bereits mathematisch geprüft. Verwende genau eine angebotene Kennung. '
    + 'Bei result=start ermutigen, ohne eine bereits erbrachte Leistung zu behaupten. '
    + 'Gib bei einem Fehler keine falsche Bestätigung und verrate keine vollständige Lösung.'},
   {role:'user',content:JSON.stringify(observations)},
  ],
  response_format: {
   type:'json_schema',
   json_schema:{
    type:'object',
    properties:{feedback:packet.guidance?{type:'string',enum:[packet.guidance]}:{type:'string',maxLength:220},nextTaskId:{enum:ids.length?ids:[null]}},
    required:['feedback','nextTaskId'],additionalProperties:false,
   },
  },
  max_tokens:220,
  temperature:0.2,
 };
}

export async function callWorkersAI(packet, env, {timeoutMs=8000}={}) {
 const answer=await runModel(modelInput(packet),env,{timeoutMs});
 if(packet.guidance&&answer.feedback!==packet.guidance)throw new Problem('INVALID_PROVIDER_RESPONSE',502);
 return answer;
}

export async function runModel(input, env, {timeoutMs=8000}={}) {
 if(providerProblems(env).length)throw new Problem('AI_NOT_CONFIGURED',503);
 let timer;
 const deadline=new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(new Problem('AI_TIMEOUT',504)),timeoutMs);
 });
 try{
  const result=await Promise.race([env.AI.run(modelName(env),input),deadline]);
  let answer=result?.response;
  if(typeof answer==='string'){
   if(answer.length>4096)throw new Problem('PROVIDER_RESPONSE_TOO_LARGE',502);
   try{answer=JSON.parse(answer);}catch{throw new Problem('INVALID_PROVIDER_RESPONSE',502);}
  }
  if(!answer||typeof answer!=='object'||Array.isArray(answer)||JSON.stringify(answer).length>4096)
   throw new Problem('INVALID_PROVIDER_RESPONSE',502);
  return answer;
 }catch(error){
  if(error instanceof Problem)throw error;
  console.error('Workers AI failed:',String(error?.message||'Unknown error').slice(0,300));
  throw new Problem('AI_UNAVAILABLE',502);
 }finally{clearTimeout(timer);}
}

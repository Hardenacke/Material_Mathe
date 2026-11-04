import { Problem } from './domain.mjs';
import * as cloudflare from './workers-ai.mjs';
import * as fobizz from './fobizz-adapter.mjs';

// Ohne Providerangabe nur die frühere, ausdrücklich konfigurierte fobizz-Anbindung.
export const providerName = env => env.COACH_PROVIDER || 'fobizz';
export function providerProblems(env){
 switch(providerName(env)){
  case 'workers-ai': return cloudflare.providerProblems(env);
  case 'fobizz': return fobizz.providerProblems(env);
  default: return ['COACH_PROVIDER'];
 }
}
export const providerReady = env => providerProblems(env).length===0;
export function providerDetails(env){
 return {assistantId:providerName(env)==='fobizz'?fobizz.assistantId(env):null,
  model:providerName(env)==='workers-ai'?cloudflare.modelName(env):null};
}
export async function callCoach(packet,env){
 if(!providerReady(env))throw new Problem('COACH_NOT_CONFIGURED',503);
 return providerName(env)==='workers-ai'?cloudflare.callWorkersAI(packet,env):fobizz.callFobizz(packet,env);
}

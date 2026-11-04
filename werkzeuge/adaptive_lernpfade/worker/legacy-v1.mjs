import {createState, publicState, submitAnswer, useHint, nextTask, coachPacket, applyCoach} from '../src/domain.mjs';
import {callFobizz} from './fobizz-adapter.mjs';

const TTL = 2 * 60 * 60 * 1000;
const MAX_BYTES = 8192;
class HttpError extends Error {constructor(status, message) {super(message); this.status = status;}}
const json = (x, status = 200) => Response.json(x, {status, headers: {'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}});
async function sha(value) {return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(x => x.toString(16).padStart(2, '0')).join('');}
async function sameSecret(a, b) {
  const x = await sha(a), y = await sha(b); let different = 0;
  for (let i = 0; i < x.length; i++) different |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return different === 0;
}
async function readJson(request) {
  if (!(request.headers.get('content-type') || '').startsWith('application/json')) throw new HttpError(415, 'JSON erforderlich.');
  const reader = request.body?.getReader(); if (!reader) throw new HttpError(400, 'Anfrage fehlt.');
  let size = 0; const parts = [];
  while (true) {const {value, done} = await reader.read(); if (done) break; size += value.length; if (size > MAX_BYTES) {await reader.cancel(); throw new HttpError(413, 'Anfrage zu groß.');} parts.push(value);}
  const data = new Uint8Array(size); let offset = 0; for (const part of parts) {data.set(part, offset); offset += part.length;}
  try {const result = JSON.parse(new TextDecoder().decode(data)); if (!result || Array.isArray(result) || typeof result !== 'object') throw 0; return result;} catch {throw new HttpError(400, 'Ungültiges JSON.');}
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
    if (!origin || !allowed.includes(origin)) return json({error: 'Origin nicht erlaubt.'}, 403);
    const cors = {'Access-Control-Allow-Origin':origin, 'Vary':'Origin', 'Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers':'Content-Type, Authorization', 'Access-Control-Max-Age':'600'};
    let response;
    try {
      if (request.method === 'OPTIONS') response = new Response(null, {status:204});
      else if (new URL(request.url).pathname === '/api/health' && request.method === 'GET') response = json({status:'ok', coachMode:'fobizz-transfer', automaticFobizz:false});
      else if (!env.CLASSROOM_CODE || env.CLASSROOM_CODE.length < 16 || !env.ROOM_ID) response = json({error:'Worker noch nicht konfiguriert.'}, 503);
      else response = await env.ROOM.get(env.ROOM.idFromName(env.ROOM_ID)).fetch(request);
    } catch {response = json({error:'Dienst vorübergehend nicht verfügbar.'}, 503);}
    const headers = new Headers(response.headers); for (const [k,v] of Object.entries(cors)) headers.set(k,v);
    headers.set('Cache-Control','no-store'); headers.set('X-Content-Type-Options','nosniff');
    return new Response(response.body, {status:response.status, headers});
  }
};

export class LearningRoom {
  constructor(ctx, env) {this.ctx = ctx; this.env = env;}
  fetch(request) {
    return this.ctx.blockConcurrencyWhile(async () => {
      try {return await this.handle(request);} catch (e) {return json({error:e instanceof HttpError ? e.message : 'Anfrage konnte nicht verarbeitet werden.'}, e instanceof HttpError ? e.status : 500);}
    });
  }
  async handle(request) {
    const path = new URL(request.url).pathname;
    const validRoutes = ['/api/session','/api/state','/api/answer','/api/hint','/api/next','/api/coach/packet','/api/coach/apply','/api/coach/automatic'];
    if (!validRoutes.includes(path)) throw new HttpError(404,'Unbekannter Endpunkt.');
    if (path === '/api/session' && request.method === 'POST') {
      const now = Date.now(), minute = Math.floor(now/60000), day = Math.floor(now/86400000);
      const quota = await this.ctx.storage.get('quota') || {};
      if (quota.minute !== minute) {quota.minute = minute; quota.logins = 0;}
      if (quota.day !== day) {quota.day = day; quota.created = 0;}
      quota.logins++;
      await this.ctx.storage.put('quota', quota);
      if (!await this.ctx.storage.getAlarm()) await this.ctx.storage.setAlarm(now + 60*60*1000);
      if (quota.logins > 100 || quota.created >= 100) throw new HttpError(429,'Zugangslimit erreicht. Bitte die Lehrkraft informieren.');
      const body = await readJson(request);
      if (typeof body.code !== 'string' || body.code.length > 200 || !await sameSecret(body.code, this.env.CLASSROOM_CODE)) throw new HttpError(401,'Klassencode ungültig.');
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), x => x.toString(16).padStart(2,'0')).join('');
      const key = 's:' + await sha(token), state = createState();
      await this.ctx.storage.put(key, {state, expires:now+TTL, requests:0, transferCount:0, cache:[]});
      quota.created++; await this.ctx.storage.put('quota', quota);
      return json({token, expiresAt:now+TTL, state:publicState(state)}, 201);
    }
    const authorization = request.headers.get('Authorization') || '';
    if (!/^Bearer [a-f0-9]{64}$/.test(authorization)) throw new HttpError(401,'Neue Sitzung erforderlich.');
    const key = 's:' + await sha(authorization.slice(7));
    const session = await this.ctx.storage.get(key);
    if (!session || session.expires <= Date.now()) {await this.ctx.storage.delete(key); throw new HttpError(401,'Die Sitzung ist abgelaufen.');}
    if (path === '/api/session' && request.method === 'DELETE') {await this.ctx.storage.delete(key); return json({deleted:true});}
    if (path === '/api/state' && request.method === 'GET') return json({state:publicState(session.state)});
    if (request.method !== 'POST') throw new HttpError(405,'Methode nicht erlaubt.');
    const body = await readJson(request);
    if (typeof body.requestId !== 'string' || !/^[a-f0-9-]{36}$/.test(body.requestId)) throw new HttpError(400,'requestId erforderlich.');
    const signature = JSON.stringify({path, body}), cached = session.cache.find(x => x.id === body.requestId);
    if (cached) {if (cached.signature !== signature) throw new HttpError(409,'requestId bereits anders verwendet.'); return json(cached.response);}
    if (++session.requests > 240) throw new HttpError(429,'Sitzungslimit erreicht.');
    // Fehlgeschlagene Aktionen zählen ebenfalls gegen die Quote.
    await this.ctx.storage.put(key, session);
    let extra = {};
    try {
      if (path === '/api/answer') {
        if (body.taskId !== session.state.task.id) throw new HttpError(409,'Diese Aufgabe ist nicht mehr aktuell.');
        extra.result = submitAnswer(session.state, body.value, body.unit);
      } else if (path === '/api/hint') extra.hint = useHint(session.state);
      else if (path === '/api/next') nextTask(session.state);
      else if (path === '/api/coach/packet') {
        if (++session.transferCount > 12) throw new HttpError(429,'Transferlimit erreicht.');
        extra.packet = coachPacket(session.state);
      } else if (path === '/api/coach/apply') extra.coach = applyCoach(session.state, body.recommendation);
      else if (path === '/api/coach/automatic') {
        // Keine Netzwerkverbindung, solange keine bestätigte fobizz-Schnittstelle vorliegt.
        if (this.env.COACH_MODE !== 'fobizz-api') throw new HttpError(501,'Automatische fobizz-Anbindung ist noch nicht verfügbar. Nutze den Transfer.');
        try {extra.coach = applyCoach(session.state, await callFobizz(coachPacket(session.state), this.env));}
        catch {throw new HttpError(501,'fobizz-API noch nicht bestätigt oder implementiert.');}
      } else throw new HttpError(405,'Methode nicht erlaubt.');
    } catch (e) {if (e instanceof HttpError) throw e; throw new HttpError(400,e.message);}
    const response = {state:publicState(session.state), ...extra};
    session.cache.push({id:body.requestId, signature, response}); session.cache = session.cache.slice(-5);
    await this.ctx.storage.put(key, session);
    return json(response);
  }
  async alarm() {
    const entries = await this.ctx.storage.list({prefix:'s:', limit:1000}); const now = Date.now(); let remain = false;
    for (const [key,value] of entries) {if (value.expires <= now) await this.ctx.storage.delete(key); else remain = true;}
    if (remain) await this.ctx.storage.setAlarm(now+60*60*1000);
    else await this.ctx.storage.deleteAlarm();
  }
}

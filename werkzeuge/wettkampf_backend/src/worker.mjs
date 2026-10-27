import definitions from '../generated/definitions.mjs';
import {availability, periodFor} from './zeitraum.mjs';
import {definitionFingerprint, fingerprint} from './fingerabdruck.mjs';
import {HttpError, json, errorResponse, readJSON, exact, slug, bearer, sha256, equalSecret, call} from './http.mjs';
import {wurzelwerk} from './wurzelwerk.mjs';
export {QuizRoom} from './wurzelwerk.mjs';
export {GroupAccess} from './group-access.mjs';
export {RoomState} from './room-state.mjs';
export {ArchiveWriter} from './archive-writer.mjs';

const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const hashes = new Map();
async function fingerprints(config, bank) {
  const key = `${config.id}/v${config.version}`;
  if (!hashes.has(key)) hashes.set(key, Promise.all([definitionFingerprint(config), fingerprint(bank)]));
  const [configHash, bankHash] = await hashes.get(key); return {configHash, bankHash};
}
export function publicCompetition(config, bank, now) {
  return {id: config.id, version: config.version, subject: config.subject, title: config.title,
    grade: config.grade, rules: config.rules, selection: config.selection, attempts: config.attempts,
    schedule: config.schedule, season: config.season, ranking: config.ranking,
    availability: availability(config, now), period: periodFor(config, now), demo: bank.demo};
}
function getConfig(id, version = null) {
  const candidates = definitions.competitions.filter(c => c.id === id && c.status !== 'draft');
  const config = version === null ? candidates.sort((a, b) => b.version - a.version)[0] : candidates.find(c => c.version === version);
  if (!config) throw new HttpError(404, 'COMPETITION', 'Wettbewerb oder Version nicht gefunden.');
  return config;
}
function getBank(config) {
  const bank = definitions.banks.find(b => b.id === config.bank.id && b.version === config.bank.version);
  if (!bank) throw new HttpError(503, 'BANK', 'Die Aufgaben sind derzeit nicht verfügbar.');
  return bank;
}
async function authenticate(request, env, groupId) {
  const code = bearer(request);
  if (!code) throw new HttpError(401, 'CODE', 'Bitte persönlichen Zugang eingeben.');
  const response = await call(env.GROUP_ACCESS, 'mathematik/' + groupId, {
    op: 'authenticate', codeHash: await sha256(code),
    rateKey: await sha256(request.headers.get('CF-Connecting-IP') || 'local')
  });
  if (!response.ok) return {response};
  return {actor: await response.json()};
}
function checkMembership(actor, config) {
  if (!actor.memberships.includes(config.id)) throw new HttpError(403, 'MEMBERSHIP', 'Dieser Zugang ist für den Wettbewerb nicht freigegeben.');
}
async function admin(request, env, groupId) {
  if (!await equalSecret(bearer(request), env.ADMIN_TOKEN)) throw new HttpError(401, 'ADMIN', 'Verwaltungszugang ungültig.');
  const body = await readJSON(request); exact(body, ['participants']);
  if (!Array.isArray(body.participants) || body.participants.length < 1 || body.participants.length > 100)
    throw new HttpError(400, 'PARTICIPANTS', '1 bis 100 Zugänge pro Import erforderlich.');
  const ids = new Set(), codes = new Set();
  for (const person of body.participants) {
    exact(person, ['id', 'alias', 'codeHash', 'enabled', 'competitions']);
    if (!slug(person.id) || ids.has(person.id) || typeof person.alias !== 'string' ||
        person.alias.trim().length < 1 || person.alias.length > 40 || /[\x00-\x1f\x7f]/.test(person.alias) ||
        !/^[a-f0-9]{64}$/.test(person.codeHash) || codes.has(person.codeHash) || typeof person.enabled !== 'boolean' ||
        !Array.isArray(person.competitions) || person.competitions.length > 50 || new Set(person.competitions).size !== person.competitions.length ||
        person.competitions.some(id => !slug(id) || ![...definitions.competitions, wurzelwerk].some(c => c.id === id && c.groupId === groupId)))
      throw new HttpError(400, 'PARTICIPANT', 'Ungültiger oder doppelter Zugang.');
    ids.add(person.id); codes.add(person.codeHash);
  }
  return call(env.GROUP_ACCESS, 'mathematik/' + groupId, {op: 'import', participants: body.participants});
}
async function route(request, env) {
  const url = new URL(request.url), now = Date.now();
  if (url.pathname === '/health' && request.method === 'GET') return json({service: 'mathe-wettkampf-api', subject: 'mathematik'});
  const adminMatch = url.pathname.match(/^\/admin\/v1\/groups\/([a-z0-9-]+)\/participants$/);
  if (adminMatch && request.method === 'POST' && slug(adminMatch[1])) return admin(request, env, adminMatch[1]);
  if (!['GET', 'POST'].includes(request.method)) throw new HttpError(405, 'METHOD', 'Methode nicht erlaubt.');
  if (url.pathname.startsWith('/api/v1/quizzes/wurzelwerk')) {
    const room = value => call(env.QUIZ_ROOM,'mathematik/'+wurzelwerk.id+'/v'+wurzelwerk.version+'/gesamt',{...value,version:wurzelwerk.version});
    if (url.pathname === '/api/v1/quizzes/wurzelwerk/public' && request.method === 'GET') return room({op:'public'});
    if (url.pathname === '/api/v1/quizzes/wurzelwerk/join' && request.method === 'POST') {
      const payload=await readJSON(request);exact(payload,['token','alias']);
      if (typeof payload.token !== 'string' || !/^[A-Za-z0-9_-]{32,128}$/.test(payload.token) || typeof payload.alias !== 'string' ||
          payload.alias.trim().length>24 || /[\x00-\x1f\x7f]/.test(payload.alias))
        throw new HttpError(400,'GUEST','Bitte ein Pseudonym mit höchstens 24 Zeichen verwenden.');
      const response=await room({op:'guest-join',secretHash:await sha256(payload.token),alias:payload.alias.trim(),
        rateKey:await sha256(request.headers.get('CF-Connecting-IP') || 'local')});
      const result=await response.json();
      return json(result,result.error?429:200);
    }
    const match = url.pathname.match(/^\/api\/v1\/quizzes\/wurzelwerk(?:\/attempts(?:\/([a-f0-9-]{36})\/(answer|next))?)?$/);
    if (!match) throw new HttpError(404, 'ROUTE', 'Quizadresse nicht gefunden.');
    const token=bearer(request);
    let actor;
    if (token) {
      const response=await room({op:'guest-auth',secretHash:await sha256(token)}),result=await response.json();
      if (result.error) return json(result,429);
      actor=result.guest;
    }
    if (!actor) {
      const legacy=await authenticate(request,env,wurzelwerk.groupId);
      if (legacy.response) return legacy.response;
      actor=legacy.actor;
    }
    checkMembership(actor, wurzelwerk);
    const op = request.method === 'GET' && url.pathname === '/api/v1/quizzes/wurzelwerk' ? 'state' :
      request.method === 'POST' && url.pathname.endsWith('/attempts') ? 'start' :
      request.method === 'POST' && match[1] && uuid(match[1]) ? match[2] : null;
    if (!op) throw new HttpError(405, 'METHOD', 'Methode passt nicht zur Quizadresse.');
    let payload = {}, requestId = null;
    if (op !== 'state') {
      requestId = request.headers.get('Idempotency-Key');
      if (!uuid(requestId)) throw new HttpError(400, 'IDEMPOTENCY', 'UUID als Anfragekennung erforderlich.');
      payload = await readJSON(request);
      exact(payload, op === 'answer' ? ['questionId', 'answer'] : []);
      if (op === 'answer' && !uuid(payload.questionId)) throw new HttpError(400, 'QUESTION', 'Ungültige Aufgabenkennung.');
    }
    return room({
      op, actor, attemptId: match[1], payload, requestId,
      hash: await fingerprint({op, attemptId: match[1] || null, payload})
    });
  }
  if (url.pathname === '/api/v1/catalog' && request.method === 'GET') {
    const groupId = url.searchParams.get('groupId');
    if (!slug(groupId)) throw new HttpError(400, 'GROUP', 'Bitte eine gültige Lerngruppe angeben.');
    if (!definitions.competitions.some(c => c.groupId === groupId)) throw new HttpError(401, 'CODE', 'Zugang ungültig oder gesperrt.');
    const {response, actor} = await authenticate(request, env, groupId); if (response) return response;
    const newest = new Map();
    for (const config of definitions.competitions) if (config.groupId === groupId && ['published', 'closed'].includes(config.status) && actor.memberships.includes(config.id)) {
      if (!newest.has(config.id) || newest.get(config.id).version < config.version) newest.set(config.id, config);
    }
    return json({subject: 'mathematik', alias: actor.alias, serverNow: now,
      competitions: [...newest.values()].map(c => publicCompetition(c, getBank(c), now))});
  }
  const match = url.pathname.match(/^\/api\/v1\/competitions\/([a-z0-9-]+)(?:\/versions\/([1-9]\d{0,5})(?:\/periods\/(gesamt|\d{4}-(?:0[1-9]|1[0-2]))(?:\/(leaderboard|attempts)(?:\/(current|[a-f0-9-]{36})(?:\/(next|answer))?)?)?)?)?$/);
  if (!match || !slug(match[1])) throw new HttpError(404, 'ROUTE', 'Adresse nicht gefunden.');
  const [, id, version, periodId, section, attemptId, action] = match;
  const config = getConfig(id, version ? Number(version) : null), bank = getBank(config);
  const {response, actor} = await authenticate(request, env, config.groupId); if (response) return response;
  checkMembership(actor, config);
  if (!periodId) {
    if (request.method !== 'GET') throw new HttpError(405, 'METHOD', 'Methode nicht erlaubt.');
    return json({...publicCompetition(config, bank, now), serverNow: now});
  }
  if (!section) throw new HttpError(404, 'ROUTE', 'Adresse nicht gefunden.');
  const currentPeriod = periodFor(config, now);
  let period = currentPeriod;
  if (config.season.kind === 'continuous') {
    if (periodId !== 'gesamt') throw new HttpError(404, 'PERIOD', 'Wertung nicht gefunden.');
  } else {
    if (periodId === 'gesamt' || periodId > currentPeriod.id) throw new HttpError(404, 'PERIOD', 'Wertung nicht gefunden.');
    period = periodFor(config, Date.parse(periodId + '-15T12:00:00Z'));
    if (period.startsAt >= period.endsAt) throw new HttpError(404, 'PERIOD', 'Wertung liegt außerhalb des Wettbewerbs.');
  }
  let op;
  if (section === 'leaderboard' && !attemptId && !action && request.method === 'GET') op = 'leaderboard';
  if (section === 'attempts') {
    if (!attemptId && !action && request.method === 'POST') op = 'start';
    if (attemptId === 'current' && !action && request.method === 'GET') op = 'current';
    if (uuid(attemptId) && !action && request.method === 'GET') op = 'get';
    if (uuid(attemptId) && action && request.method === 'POST') op = action;
  }
  if (!op) throw new HttpError(405, 'METHOD', 'Methode passt nicht zur Adresse.');
  if (op === 'start' && periodId !== currentPeriod.id) throw new HttpError(409, 'PERIOD', 'Bitte die aktuelle Wertung wählen.');
  let payload = {}, requestId = null;
  if (request.method === 'POST') {
    requestId = request.headers.get('Idempotency-Key');
    if (!uuid(requestId)) throw new HttpError(400, 'IDEMPOTENCY', 'UUID als Anfragekennung erforderlich.');
    payload = await readJSON(request);
    exact(payload, op === 'answer' ? ['questionId', 'answerId'] : []);
    if (op === 'answer' && (!slug(payload.questionId) || !(payload.answerId === null || slug(payload.answerId))))
      throw new HttpError(400, 'ANSWER', 'Ungültige Antwortkennung.');
  }
  return call(env.ROOM_STATE, `mathematik/${config.id}/v${config.version}/${periodId}`, {
    op, actor, config, bank, period, attemptId, requestId, payload,
    payloadHash: await fingerprint(payload), ...await fingerprints(config, bank)
  });
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim());
    if (origin && origin !== new URL(request.url).origin && !allowed.includes(origin))
      return errorResponse(new HttpError(403, 'ORIGIN', 'Herkunft nicht freigegeben.'));
    let result;
    if (request.method === 'OPTIONS') result = new Response(null, {status: 204});
    else try { result = await route(request, env); } catch (error) { result = errorResponse(error); }
    const headers = new Headers(result.headers);
    headers.set('Cache-Control', 'no-store'); headers.set('X-Content-Type-Options', 'nosniff');
    if (origin) {
      headers.set('Access-Control-Allow-Origin', origin); headers.set('Vary', 'Origin');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Idempotency-Key');
      headers.set('Access-Control-Max-Age', '600');
    }
    if (result.status === 429) headers.set('Retry-After', '60');
    return new Response(result.body, {status: result.status, headers});
  }
};

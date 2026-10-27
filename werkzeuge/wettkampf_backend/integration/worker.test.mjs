import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes, randomUUID, createHash} from 'node:crypto';
import {build} from 'esbuild';
import {Miniflare, convertV4MiniflareOptions} from 'miniflare';

const root = new URL('../', import.meta.url), hash = text => createHash('sha256').update(text).digest('hex');
const adminCode = randomBytes(32).toString('base64url'), codes = Array.from({length: 12}, () => randomBytes(32).toString('base64url'));
const group = 'klasse-9-demo';
let mf, directory, source, config, bank, competitions, archiveFail = true;
const files = new Map();
async function github(request) {
  const url = new URL(request.url);
  if (archiveFail) return new Response('{}', {status: 503});
  if (!url.pathname.includes('/contents/')) return Response.json({private: true});
  const path = url.pathname.split('/contents/')[1];
  if (request.method === 'GET') return files.has(path) ? Response.json(files.get(path)) : Response.json({}, {status: 404});
  const body = await request.json(), previous = files.get(path);
  if (previous && body.sha !== previous.sha) return Response.json({}, {status: 409});
  const file = {sha: randomUUID(), content: body.content}; files.set(path, file);
  return Response.json({content: {sha: file.sha}}, {status: 201});
}
async function startRuntime(script = source) {
  mf = new Miniflare(convertV4MiniflareOptions({name: 'test-worker', modules: true, script,
    compatibilityDate: '2026-10-27', resourcePersistencePath: directory, unsafeInspectDurableObjects: true,
    bindings: {ADMIN_TOKEN: adminCode, ALLOWED_ORIGINS: 'http://localhost:8000',
      GITHUB_TOKEN: 'test-only', ARCHIVE_REPOSITORY: 'demo/private-results', ARCHIVE_PREFIX: 'architektur-v1', DETAIL_RETENTION_DAYS: '90'},
    durableObjects: Object.fromEntries(['GroupAccess', 'RoomState', 'ArchiveWriter'].map(className => [
      {GroupAccess: 'GROUP_ACCESS', RoomState: 'ROOM_STATE', ArchiveWriter: 'ARCHIVE_WRITER'}[className], {className, useSQLite: true}
    ])), outboundService: github
  }));
  await mf.ready;
}
async function compile(definitions) {
  const result = await build({entryPoints: [new URL('src/worker.mjs', root).pathname.replace(/^\/([A-Za-z]:)/, '$1')],
    bundle: true, write: false, format: 'esm', target: 'es2024', external: ['cloudflare:workers'], loader: {'.sql': 'text'},
    plugins: [{name: 'test-definitions', setup(builder) {
      builder.onLoad({filter: /generated[\\/]definitions\.mjs$/}, () => ({contents: 'export default ' + JSON.stringify(definitions), loader: 'js'}));
    }}]});
  return result.outputFiles[0].text;
}
async function send(path, {method = 'GET', body, code = codes[0], key = randomUUID(), headers = {}} = {}) {
  const response = await mf.dispatchFetch('https://worker.test' + path, {method,
    headers: {'Authorization': 'Bearer ' + code, ...(method === 'POST' ? {'Content-Type': 'application/json', 'Idempotency-Key': key} : {}), ...headers},
    ...(body !== undefined ? {body: typeof body === 'string' ? body : JSON.stringify(body)} : {})});
  return {status: response.status, headers: response.headers, data: response.status === 204 ? null : await response.json()};
}
function base(id = config.id, period = 'gesamt') { return `/api/v1/competitions/${id}/versions/1/periods/${period}`; }
async function begin(code = codes[0], id = config.id, period = 'gesamt') {
  const out = await send(base(id, period) + '/attempts', {method: 'POST', body: {}, code});
  assert.equal(out.status, 200, JSON.stringify(out.data)); return out.data.attempt;
}
async function next(a, code = codes[0]) {
  const out = await send(base(a.competitionId, a.periodId) + `/attempts/${a.id}/next`, {method: 'POST', body: {}, code});
  assert.equal(out.status, 200, JSON.stringify(out.data)); return out.data.attempt;
}
async function respond(a, answerId, code = codes[0], key = randomUUID()) {
  return send(base(a.competitionId, a.periodId) + `/attempts/${a.id}/answer`, {method: 'POST', body: {questionId: a.question.id, answerId}, code, key});
}
async function storage(competitionId = config.id, period = 'gesamt') {
  return mf.unsafeGetDurableObjectStorage('test-worker', 'RoomState', {name: `mathematik/${competitionId}/v1/${period}`});
}
async function expire(a, hard = false) {
  const sql = await storage(a.competitionId, a.periodId);
  const [row] = await sql.exec('SELECT state_json FROM attempts WHERE id=?', a.id), saved = JSON.parse(row.state_json);
  const past = Date.now() - 1000;
  if (saved.current) {saved.current.deadline = past; saved.current.startedAt = past - 60000;}
  if (hard) saved.hardEnd = past;
  await sql.exec('UPDATE attempts SET question_deadline=?,hard_end=?,state_json=? WHERE id=?', saved.current?.deadline ?? null, saved.hardEnd, JSON.stringify(saved), a.id);
}
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'mathe-worker-'));
  bank = JSON.parse(await readFile(new URL('fragenpools/quadratische-funktionen-9-demo.json', root), 'utf8'));
  config = JSON.parse(await readFile(new URL('wettkaempfe/mathematik-quadratische-funktionen-dauer.json', root), 'utf8'));
  config.status = 'published'; config.attempts.cooldownSeconds = 0;
  config.selection.counts = {basis: 1, aufbau: 1, knifflig: 1};
  const limited = structuredClone(config); limited.id = 'test-einmal'; limited.attempts.maxPerPeriod = 1;
  const monthly = structuredClone(config); monthly.id = 'test-monat'; monthly.season.kind = 'calendar-month';
  const draft = structuredClone(config); draft.id = 'test-entwurf'; draft.status = 'draft';
  const alarm = structuredClone(config); alarm.id = 'test-alarm'; alarm.rules.questionTimeSeconds = 10;
  alarm.selection.counts = {basis: 1, aufbau: 0, knifflig: 0};
  const closed = structuredClone(config); closed.id = 'test-geschlossen'; closed.status = 'closed';
  competitions = [config, limited, monthly, draft, alarm, closed]; source = await compile({banks: [bank], competitions});
  await startRuntime();
  const response = await send(`/admin/v1/groups/${group}/participants`, {method: 'POST', code: adminCode, body: {
    participants: codes.map((code, index) => ({id: 'p-' + index, alias: 'Test ' + index, codeHash: hash(code), enabled: true, competitions: competitions.map(c => c.id)}))
  }});
  assert.equal(response.status, 200, JSON.stringify(response.data));
});
after(async () => {if (mf) await mf.dispose(); if (directory) await rm(directory, {recursive: true, force: true});});

test('Zugänge, Mitgliedschaft, CORS und öffentliche Verträge', async () => {
  assert.equal((await send('/api/v1/catalog?groupId=' + group, {code: 'x'.repeat(43)})).status, 401);
  const catalog = await send('/api/v1/catalog?groupId=' + group);
  assert.equal(catalog.status, 200); assert.equal(catalog.data.competitions.length, 5);
  assert.ok(catalog.data.competitions.some(c => c.id === 'test-geschlossen' && c.availability === 'closed'));
  assert.equal((await send(base('test-geschlossen') + '/attempts', {method: 'POST', body: {}})).status, 409);
  assert.equal(JSON.stringify(catalog.data).includes('codeHash'), false);
  assert.equal(JSON.stringify(catalog.data).includes('"correct"'), false);
  assert.equal((await send('/api/v1/competitions/test-entwurf')).status, 404);
  assert.equal((await send('/health', {headers: {Origin: 'https://wrong.example'}})).status, 403);
  const preflight = await send('/api/v1/catalog', {method: 'OPTIONS', headers: {Origin: 'http://localhost:8000'}});
  assert.equal(preflight.status, 204); assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'http://localhost:8000');
  assert.equal(catalog.headers.get('Cache-Control'), 'no-store');
  assert.equal((await send(`/admin/v1/groups/${group}/participants`, {method: 'POST', body: {participants: []}})).status, 401);
});
test('Strikte Felder, JSON, Nachrichtengröße und UUID', async () => {
  const url = base() + '/attempts';
  assert.equal((await send(url, {method: 'POST', body: {}, key: 'bad'})).status, 400);
  assert.equal((await send(url, {method: 'POST', body: {score: 999}})).status, 400);
  assert.equal((await send(url, {method: 'POST', body: '{'})).status, 400);
  assert.equal((await send(url, {method: 'POST', body: ' '.repeat(16385)})).status, 413);
  assert.equal((await send(url, {method: 'POST', body: {}, headers: {'Content-Type': 'text/plain'}})).status, 415);
});
test('Ein aktiver Versuch, keine vorab übertragenen Lösungen und persistente Fristen', async () => {
  const a = await begin(); assert.equal(a.question, null);
  assert.equal((await begin()).id, a.id);
  const opened = await next(a); assert.ok(opened.question);
  assert.equal(Object.hasOwn(opened.question, 'correct'), false);
  assert.equal(Object.hasOwn(opened, 'questions'), false);
  assert.equal(Object.hasOwn(opened, 'participantId'), false);
  await mf.unsafeEvictDurableObject('test-worker', 'RoomState', {name: `mathematik/${config.id}/v1/gesamt`});
  const restored = await send(base() + '/attempts/current');
  assert.equal(restored.data.attempt.question.deadline, opened.question.deadline);
  assert.equal((await send(base() + '/attempts/' + a.id, {code: codes[1]})).status, 403);
});
test('Doppelte Antworten bleiben idempotent; geänderter Body und andere Operation liefern 409', async () => {
  const a = await next(await begin()), key = randomUUID(), correct = bank.questions.find(q => q.id === a.question.id).correct;
  const first = await respond(a, correct, codes[0], key), duplicate = await respond(a, correct, codes[0], key);
  assert.equal(first.status, 200); assert.deepEqual(duplicate.data, first.data);
  assert.ok(first.data.attempt.score > 0); assert.equal(first.data.attempt.answered, 1);
  assert.equal((await respond(a, null, codes[0], key)).status, 409);
  assert.equal((await send(base() + `/attempts/${a.id}/next`, {method: 'POST', body: {}, key})).status, 409);
  assert.equal((await respond(a, correct)).data.attempt.score, first.data.attempt.score);
});
test('Fällige Frist wird trotz ungültiger Folgeantwort dauerhaft gespeichert', async () => {
  const a = await next(await begin(codes[1]), codes[1]); await expire(a);
  const invalid = await send(base() + `/attempts/${a.id}/answer`, {method: 'POST', code: codes[1], body: {questionId: 'andere-frage', answerId: 'a'}});
  assert.equal(invalid.status, 409);
  const current = await send(base() + '/attempts/current', {code: codes[1]});
  assert.equal(current.data.attempt.lives, 2); assert.equal(current.data.attempt.answered, 1);
  const again = await send(base() + '/attempts/current', {code: codes[1]});
  assert.equal(again.data.attempt.lives, 2);
});
test('Bestwert statt Addition; Archivfehler unterbricht keinen Spielzug', async () => {
  let a = await begin(codes[2]);
  for (let i = 0; i < 3; i++) {
    a = await next(a, codes[2]);
    const correct = bank.questions.find(q => q.id === a.question.id).correct;
    a = (await respond(a, correct, codes[2])).data.attempt;
  }
  assert.equal(a.phase, 'finished'); const best = a.score;
  let worse = await begin(codes[2]);
  for (let i = 0; i < 3; i++) {worse = await next(worse, codes[2]); worse = (await respond(worse, null, codes[2])).data.attempt;}
  const board = await send(base() + '/leaderboard', {code: codes[2]});
  assert.equal(board.status, 200); assert.equal(board.data.ownBest.score, best);
  assert.equal(board.data.leaderboard.find(row => row.alias === 'Test 2').score, best);
  assert.equal(board.data.archiveState, 'pending');
  for (const row of board.data.leaderboard) assert.deepEqual(Object.keys(row).sort(), ['alias', 'endedAt', 'maxPoints', 'rank', 'score'].sort());
});
test('Versuchslimit und zwei gleichzeitige Tabs', async () => {
  const starts = await Promise.all([begin(codes[3], 'test-einmal'), begin(codes[3], 'test-einmal')]);
  assert.equal(starts[0].id, starts[1].id);
  let a = starts[0]; for (let i = 0; i < 3; i++) {a = await next(a, codes[3]); a = (await respond(a, null, codes[3])).data.attempt;}
  assert.equal((await send(base('test-einmal') + '/attempts', {method: 'POST', body: {}, code: codes[3]})).status, 409);
});
test('Sperre und fehlende Mitgliedschaft werden sofort auf jedem Pfad wirksam', async () => {
  const a = await begin(codes[4]);
  for (const [enabled, list, status] of [[true, ['test-einmal'], 403], [false, [config.id], 401]]) {
    const imported = await send(`/admin/v1/groups/${group}/participants`, {method: 'POST', code: adminCode, body: {participants: [{id: 'p-4', alias: 'Test 4', codeHash: hash(codes[4]), enabled, competitions: list}]}});
    assert.equal(imported.status, 200);
    assert.equal((await send(base() + '/attempts/' + a.id, {code: codes[4]})).status, status);
  }
});
test('Monatsräume bleiben getrennt; alte und zukünftige Monate lassen sich nicht starten', async () => {
  const metadata = await send('/api/v1/competitions/test-monat');
  const period = metadata.data.period.id;
  assert.ok(/^\d{4}-\d{2}$/.test(period)); await begin(codes[5], 'test-monat', period);
  assert.equal((await send(base('test-monat', '2000-01') + '/attempts', {method: 'POST', body: {}, code: codes[5]})).status, 409);
  assert.equal((await send(base('test-monat', '9999-12') + '/leaderboard', {code: codes[5]})).status, 404);
  const board = await send(base('test-monat', period) + '/leaderboard', {code: codes[5]}); assert.deepEqual(board.data.leaderboard, []);
});
test('Dauerhafter Alarm beendet eine unbeantwortete Frage ohne weiteren Browserrequest', async () => {
  const active = await next(await begin(codes[8], 'test-alarm'), codes[8]);
  const sql = await storage('test-alarm');
  const deadline = Date.now() + 14000; let saved;
  do {
    const [row] = await sql.exec('SELECT state_json FROM attempts WHERE id=?', active.id);
    saved = JSON.parse(row.state_json);
    if (saved.phase === 'finished') break;
    await new Promise(resolve => setTimeout(resolve, 150));
  } while (Date.now() < deadline);
  assert.equal(saved.phase, 'finished'); assert.equal(saved.lives, 2);
  assert.equal(saved.endedAt, active.question.deadline); assert.equal(saved.lastFeedback.timedOut, true);
  const best = await sql.exec('SELECT score FROM best_scores WHERE participant_id=?', 'p-8');
  assert.equal(best[0].score, 0);
});
test('Geänderte Definition derselben Version blockiert neue Starts und erhält aktive Schnappschüsse', async () => {
  const active = await next(await begin(codes[6]), codes[6]);
  const changed = structuredClone(competitions); changed[0].rules.basePoints++;
  const modified = await compile({banks: [bank], competitions: changed});
  await mf.dispose(); await startRuntime(modified);
  assert.equal((await send(base() + '/attempts', {method: 'POST', body: {}, code: codes[7]})).status, 409);
  const restored = await send(base() + '/attempts/' + active.id, {code: codes[6]});
  assert.equal(restored.status, 200); assert.equal(restored.data.rules.basePoints, config.rules.basePoints);
  assert.equal(restored.data.attempt.question.deadline, active.question.deadline);
  await mf.dispose(); await startRuntime();
});
test('Archivaufträge überstehen Neustart und werden nach GitHub-Ausfall geordnet nachgeholt', async () => {
  const namespace = await mf.getDurableObjectNamespace('ARCHIVE_WRITER');
  const writer = namespace.get(namespace.idFromName('mathematik'));
  const snapshot = {subject: 'mathematik', competitionId: 'test-archiv', version: 1, periodId: 'gesamt', instanceId: randomUUID(), revision: 1, final: false, generatedAt: Date.now(), leaderboard: [{rank: 1, alias: 'Test', score: 10, maxPoints: 1000, endedAt: Date.now()}]};
  const enqueue = async snap => (await writer.fetch('https://internal/action', {method: 'POST', body: JSON.stringify({op: 'enqueue', snapshot: snap})})).json();
  assert.equal((await enqueue(snapshot)).confirmed, false);
  archiveFail = false;
  const sql = await mf.unsafeGetDurableObjectStorage('test-worker', 'ArchiveWriter', {name: 'mathematik'});
  // Die fällige Warteschlange wird vom echten lokalen Durable-Object-Alarm verarbeitet.
  await sql.exec("UPDATE archive_jobs SET next_retry_at=0 WHERE status='pending'");
  await enqueue({...snapshot, revision: 2, final: true});
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const rows = await sql.exec("SELECT status FROM archive_jobs WHERE target_path LIKE '%test-archiv%' AND revision=2");
    if (rows.length === 2 && rows.every(row => row.status === 'written')) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const latest = [...files.entries()].find(([path]) => path.includes('test-archiv') && path.endsWith('latest.json'));
  const final = [...files.entries()].find(([path]) => path.includes('test-archiv') && path.endsWith('final.json'));
  assert.ok(latest); assert.ok(final);
  const decoded = file => JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
  assert.equal(decoded(latest[1]).revision, 2); assert.equal(decoded(final[1]).revision, 2);
  assert.equal((await enqueue({...snapshot, revision: 2, final: true})).confirmed, true);
});

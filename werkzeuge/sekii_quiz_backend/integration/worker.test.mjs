import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare, convertV4MiniflareOptions} from 'miniflare';

let mf, db, directory;
const root = new URL('../', import.meta.url);
const origin = 'http://localhost:8000';
const browserId = randomUUID();
const quizzes = [{"quizId": "ef-analysis", "className": "EF"}, {"quizId": "ef-geometrie", "className": "EF"}, {"quizId": "ef-stochastik", "className": "EF"}, {"quizId": "q1-analysis-gk", "className": "Q1 · GK"}, {"quizId": "q1-analysis-lk", "className": "Q1 · LK"}, {"quizId": "q1-geometrie-gk", "className": "Q1 · GK"}, {"quizId": "q1-geometrie-lk", "className": "Q1 · LK"}, {"quizId": "q1-stochastik-gk", "className": "Q1 · GK"}, {"quizId": "q1-stochastik-lk", "className": "Q1 · LK"}, {"quizId": "q2-analysis-gk", "className": "Q2 · GK"}, {"quizId": "q2-analysis-lk", "className": "Q2 · LK"}, {"quizId": "q2-geometrie-gk", "className": "Q2 · GK"}, {"quizId": "q2-geometrie-lk", "className": "Q2 · LK"}, {"quizId": "q2-stochastik-gk", "className": "Q2 · GK"}, {"quizId": "q2-stochastik-lk", "className": "Q2 · LK"}];

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'sekii-quiz-test-'));
  let script = `import worker, {CompetitionRound} from './src/index.js'; export {worker as default};`;
  // This inspection subclass exists only inside the test runtime.
  script += `\nexport class InspectedRound extends CompetitionRound {
    async fetch(request) {
      if (new URL(request.url).pathname === '/__test/state') {
        await this.ready;
        return Response.json(this.round);
      }
      if (new URL(request.url).pathname === '/__test/change') {
        await this.ready;
        const body = await request.json();
        if (body.legacy) {
          this.round.scoreVersion = 'sek2-v1';
          for (const task of this.round.tasks) delete task.timeLimitSeconds;
          this.currentTask().deadline = this.currentTask().openedAt + 60000;
        }
        if (body.elapsed) {
          this.currentTask().openedAt -= body.elapsed;
          this.currentTask().deadline -= body.elapsed;
        }
        await this.ctx.storage.setAlarm(this.currentTask().deadline);
        await this.persist();
        return Response.json({ok: true});
      }
      return super.fetch(request);
    }
  }`;
  const compiled = await build({stdin: {contents: script, resolveDir: fileURLToPath(root)},
    bundle: true, write: false, format: 'esm', target: 'es2024'});
  mf = new Miniflare(convertV4MiniflareOptions({name: 'sekii-test', modules: true, script: compiled.outputFiles[0].text,
    compatibilityDate: '2026-10-27', resourcePersistencePath: directory,
    bindings: {ALLOWED_ORIGINS: origin},
    durableObjects: {ROUNDS: {className: 'InspectedRound', useSQLite: true}},
    d1Databases: ['DB'],
  }));
  await mf.ready;
  db = await mf.getD1Database('DB');
  const schema = await readFile(new URL('migrations/0001_leaderboard.sql', root), 'utf8');
  for (const sql of schema.split(';').filter(value => value.trim())) await db.prepare(sql).run();
});
after(async () => {
  await mf?.dispose();
  if (directory && directory.startsWith(join(tmpdir(), 'sekii-quiz-test-')))
    await rm(directory, {recursive: true, force: true});
});
async function send(path, body) {
  const response = await mf.dispatchFetch('https://worker.test/api/v1/' + path, {
    method: body ? 'POST' : 'GET', headers: {Origin: origin, 'Content-Type': 'application/json'},
    ...(body ? {body: JSON.stringify(body)} : {}),
  });
  const data = await response.json();
  assert.equal(response.status, 200, JSON.stringify(data));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return data;
}
async function state(quizId, actorBrowserId = browserId) {
  const ns = await mf.getDurableObjectNamespace('ROUNDS');
  return (await ns.get(ns.idFromName(quizId + ':' + actorBrowserId)).fetch('https://internal.test/__test/state')).json();
}
function answer(task) {
  if (task.kind === 'choice') return task.correct;
  if (task.kind === 'match') return Object.fromEntries(task.pairs.map((pair, i) => [i, pair.correct]));
  if (task.kind === 'construct') return task.points;
  return task.answer;
}
function noSolutions(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(!['answer', 'correct', 'solution', 'tol', 'points'].includes(key), key);
    noSolutions(child);
  }
}

test('all 15 Sek II quizzes complete real SQLite rounds with isolated D1 leaderboards', async () => {
  for (const {quizId, className} of quizzes) {
    let current = await send('competition/start', {quizId, browserId, name: quizId});
    const roundId = current.roundId;
    for (let i = 0; i < 12; i++) {
      const raw = await state(quizId), task = raw.tasks[i];
      assert.equal(raw.index, i);
      assert.equal(current.question.id, task.id);
      assert.equal(Date.parse(current.question.expiresAt) - task.openedAt, task.timeLimitSeconds * 1000);
      assert.equal(current.question.timeLimitSeconds, task.timeLimitSeconds);
      assert.equal(raw.scoreVersion, 'sek2-v2');
      noSolutions(current.question);
      assert.ok(current.question.casGuidance.text.length > 30);
      assert.ok(['recommended', 'check', 'not-needed'].includes(current.question.casGuidance.mode));
      if (i === 0) {
        const other = quizzes.find(item => item.quizId !== quizId);
        const wrong = await mf.dispatchFetch('https://worker.test/api/v1/competition/answer', {
          method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'},
          body: JSON.stringify({quizId: other.quizId, browserId, roundId,
            questionId: task.id, answer: null, requestId: randomUUID()}),
        });
        assert.equal(wrong.status, 403);
        const wrongClass = await mf.dispatchFetch('https://worker.test/api/v1/leaderboard?quizId=' + quizId + '&class=wrong');
        assert.equal(wrongClass.status, 400);
      }
      const body = {quizId, browserId, roundId, questionId: task.id, answer: answer(task), requestId: randomUUID()};
      const [result, repeated] = await Promise.all([send('competition/answer', body), send('competition/answer', body)]);
      assert.deepEqual(result, repeated);
      assert.equal(result.isCorrect, true, quizId + '/' + i);
      assert.equal(result.basePointsTotal, 100 * (i + 1));
      if (i === 11) {assert.equal(result.finished, true); break;}
      const nextBody = {quizId, browserId, roundId, questionId: task.id};
      current = await send('competition/next', nextBody);
      assert.deepEqual(await send('competition/next', nextBody), current);
      if (i === 2) {
        await mf.unsafeEvictDurableObject('sekii-test', 'InspectedRound', {name: quizId + ':' + browserId});
        const resumed = await send(`competition/resume?quizId=${quizId}&browserId=${browserId}&roundId=${roundId}`);
        assert.deepEqual(resumed.question, current.question);
        assert.equal(resumed.totalPoints, result.totalPoints);
      }
    }
    const ranking = await send(`leaderboard?quizId=${quizId}&class=${encodeURIComponent(className)}`);
    assert.equal(ranking.entries.length, 1);
    assert.equal(ranking.entries[0].name, quizId);
    assert.ok(ranking.entries[0].points >= 1200 && ranking.entries[0].points <= 1800);
    assert.deepEqual(Object.keys(ranking.entries[0]).sort(), ['className', 'date', 'name', 'points', 'rank']);
  }
  const count = await db.prepare('SELECT COUNT(*) AS count FROM leaderboard').first();
  assert.equal(count.count, 15);
});

test('five-minute extrema keep their deadline after restart and are valid after 65 seconds', async () => {
  const quizId = 'q1-analysis-lk', actor = randomUUID();
  const started = await send('competition/start', {quizId, browserId: actor, name: 'Extended deadline'});
  assert.equal(started.question.timeLimitSeconds, 300);
  const ns = await mf.getDurableObjectNamespace('ROUNDS'), stub = ns.get(ns.idFromName(quizId + ':' + actor));
  await stub.fetch('https://internal.test/__test/change', {method: 'POST', body: JSON.stringify({elapsed: 65000})});
  const raw = await state(quizId, actor), task = raw.tasks[0];
  assert.equal(task.deadline - task.openedAt, 300000);
  await mf.unsafeEvictDurableObject('sekii-test', 'InspectedRound', {name: quizId + ':' + actor});
  const resumed = await send(`competition/resume?quizId=${quizId}&browserId=${actor}&roundId=${started.roundId}`);
  assert.equal(Date.parse(resumed.question.expiresAt), task.deadline);
  const result = await send('competition/answer', {quizId, browserId: actor, roundId: started.roundId,
    questionId: task.id, answer: answer(task), requestId: randomUUID()});
  assert.equal(result.basePoints, 100);
  assert.ok(result.timeBonus > 0 && result.timeBonus <= 39);
});

test('existing 60-second rounds stay in version 1 and remain separate from the new ranking', async () => {
  const quizId = 'ef-analysis', actor = randomUUID(), alias = 'Legacy 60 seconds';
  const started = await send('competition/start', {quizId, browserId: actor, name: alias});
  const ns = await mf.getDurableObjectNamespace('ROUNDS'), stub = ns.get(ns.idFromName(quizId + ':' + actor));
  await stub.fetch('https://internal.test/__test/change', {method: 'POST', body: JSON.stringify({legacy: true})});
  const restored = await send(`competition/resume?quizId=${quizId}&browserId=${actor}&roundId=${started.roundId}`);
  assert.equal(restored.scoreVersion, 'sek2-v1');
  assert.equal(restored.question.timeLimitSeconds, 60);
  for (let i = 0; i < 12; i++) {
    const raw = await state(quizId, actor), task = raw.tasks[i];
    assert.equal(task.deadline - task.openedAt, 60000);
    const result = await send('competition/answer', {quizId, browserId: actor, roundId: started.roundId,
      questionId: task.id, answer: answer(task), requestId: randomUUID()});
    assert.equal(result.scoreVersion, 'sek2-v1');
    if (i < 11) await send('competition/next', {quizId, browserId: actor, roundId: started.roundId, questionId: task.id});
  }
  const old = await send('leaderboard?quizId=ef-analysis&class=EF&scoreVersion=sek2-v1');
  assert.equal(old.scoreVersion, 'sek2-v1');
  assert.equal(old.entries.filter(entry => entry.name === alias).length, 1);
  const current = await send('leaderboard?quizId=ef-analysis&class=EF');
  assert.equal(current.scoreVersion, 'sek2-v2');
  assert.equal(current.entries.filter(entry => entry.name === alias).length, 0);
  const fresh = await send('competition/start', {quizId, browserId: actor, name: alias});
  assert.equal(fresh.scoreVersion, 'sek2-v2');
  assert.ok(fresh.question.timeLimitSeconds > 60);
  assert.deepEqual((await send('leaderboard?quizId=ef-analysis&class=EF&scoreVersion=sek2-v1')).entries, old.entries);
});

test('older score versions do not enter the current leaderboard', async () => {
  await db.prepare('INSERT INTO leaderboard VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind('ef-analysis', browserId, 'Older version', 'EF', 1800, '2026-01-01', 'v0').run();
  const ranking = await send('leaderboard?quizId=ef-analysis&class=EF');
  assert.equal(ranking.entries.length, 1);
  assert.equal(ranking.entries[0].name, 'ef-analysis');
});

test('repeated rounds update only the personal best of the matching quiz', async () => {
  const actor = randomUUID(), alias = 'Leaderboard-Isolation';
  const firstQuiz = 'ef-analysis', secondQuiz = 'q1-analysis-gk';
  const baseline = await db.prepare('SELECT * FROM leaderboard ORDER BY quiz_id, browser_id, score_version').all();
  async function complete(quizId, correctCount) {
    let current = await send('competition/start', {quizId, browserId: actor, name: alias});
    const roundId = current.roundId;
    for (let index = 0; index < 12; index++) {
      const raw = await state(quizId, actor), task = raw.tasks[index];
      const body = {quizId, browserId: actor, roundId, questionId: task.id,
        answer: index < correctCount ? answer(task) : null, requestId: randomUUID()};
      const result = await send('competition/answer', body);
      if (index === 11) {
        assert.equal(result.finished, true);
        assert.equal(result.basePointsTotal, correctCount * 100);
        return result.totalPoints;
      }
      current = await send('competition/next', {quizId, browserId: actor, roundId, questionId: task.id});
    }
  }
  async function ownScores() {
    const rows = await db.prepare('SELECT quiz_id, best_points FROM leaderboard WHERE browser_id = ? ORDER BY quiz_id').bind(actor).all();
    return Object.fromEntries(rows.results.map(row => [row.quiz_id, row.best_points]));
  }
  const first = await complete(firstQuiz, 3);
  assert.deepEqual(await ownScores(), {[firstQuiz]: first});
  const second = await complete(secondQuiz, 6);
  assert.ok(second > first);
  assert.deepEqual(await ownScores(), {[firstQuiz]: first, [secondQuiz]: second});
  const lower = await complete(firstQuiz, 1);
  assert.ok(lower < first);
  assert.deepEqual(await ownScores(), {[firstQuiz]: first, [secondQuiz]: second});
  const higher = await complete(firstQuiz, 9);
  assert.ok(higher > first);
  assert.deepEqual(await ownScores(), {[firstQuiz]: higher, [secondQuiz]: second});
  // Every previously stored result, including other participants and versions, is unchanged.
  const after = await db.prepare('SELECT * FROM leaderboard WHERE browser_id <> ? ORDER BY quiz_id, browser_id, score_version').bind(actor).all();
  assert.deepEqual(after.results, baseline.results);
  for (const [quizId, className, points] of [[firstQuiz, 'EF', higher], [secondQuiz, 'Q1 · GK', second]]) {
    const ranking = await send(`leaderboard?quizId=${quizId}&class=${encodeURIComponent(className)}`);
    const own = ranking.entries.filter(row => row.name === alias);
    assert.equal(own.length, 1);
    assert.equal(own[0].points, points);
    assert.equal(own[0].className, className);
  }
});

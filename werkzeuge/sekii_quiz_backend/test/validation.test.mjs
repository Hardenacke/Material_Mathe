import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker, {evaluateAnswer, makeTask, scoreAnswer} from '../src/index.js';

test('empty or structured values cannot answer numeric, choice or construction tasks', () => {
  for (const answer of [null, '', ' ', false, true, [], {}, [0]]) {
    assert.equal(evaluateAnswer({kind: 'number', answer: 0}, answer), 0);
    assert.equal(evaluateAnswer({kind: 'choice', correct: 0}, answer), 0);
    assert.equal(evaluateAnswer({kind: 'slider', min: 0, max: 1, answer: 0}, answer), 0);
  }
  assert.equal(evaluateAnswer({kind: 'construct', points: [[0, 0]]}, [[null, null]]), 0);
  assert.equal(evaluateAnswer({kind: 'number', answer: 1.5}, '1,5'), 1);
});

test('deadline and bonus have fixed bounds', () => {
  const task = {kind: 'number', answer: 1};
  assert.equal(scoreAnswer(task, 1, 60_000, 60_000).basePoints, 0);
  assert.equal(scoreAnswer(task, 1, -100_000, 60_000).timeBonus, 50);
});

test('vector components require three valid numeric values', () => {
  const task = {kind: 'vector', answer: [0, 0, 0]};
  assert.equal(evaluateAnswer(task, [null, null, null]), 0);
  assert.equal(evaluateAnswer(task, ['', ' ', false]), 0);
  assert.equal(evaluateAnswer(task, [0, 0]), 0);
  assert.equal(evaluateAnswer(task, [0, 0, 0]), 1);
  assert.equal(evaluateAnswer(task, [0, 5, 0]), 2 / 3);
});

test('foreign origins, malformed JSON and fabricated quiz IDs are rejected', async () => {
  const env = {ALLOWED_ORIGINS: 'https://hardenacke.github.io'};
  const send = (body, origin = 'https://hardenacke.github.io') => worker.fetch(new Request('https://worker.test/api/v1/competition/start', {
    method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'}, body,
  }), env);
  assert.equal((await send('{}', 'https://foreign.test')).status, 403);
  assert.equal((await send('null')).status, 400);
  assert.equal((await send('{')).status, 400);
  assert.equal((await send(JSON.stringify({quizId: 'ef-analysis', browserId: '-'.repeat(36)}))).status, 400);
  assert.equal((await send(JSON.stringify({quizId: 'ef-analysis-gk', browserId: crypto.randomUUID()}))).status, 400);
});

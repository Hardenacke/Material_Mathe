import assert from "node:assert/strict";
import worker, { CompetitionRound, evaluateAnswer, makeTask, parseQuizId, publicTask, scoreAnswer, SCORE_VERSION } from "./src/index.js";

assert.equal(SCORE_VERSION, "v1");
assert.equal(parseQuizId("9-arithmetik-algebra").grade, 9);
assert.equal(parseQuizId("11-funktionen"), null);

function correctAnswer(task) {
  if (task.kind === "choice") return task.correct;
  if (task.kind === "match") return Object.fromEntries(task.pairs.map((pair, i) => [i, pair.correct]));
  if (task.kind === "construct") return task.points;
  return task.answer;
}

function assertNoPrivateKeys(value, path = "question") {
  const forbidden = new Set(["answer", "correct", "solution", "tol", "points"]);
  if (Array.isArray(value)) return value.forEach((item, i) => assertNoPrivateKeys(item, `${path}[${i}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    assert.ok(!forbidden.has(key), `private field leaked at ${path}.${key}`);
    assertNoPrivateKeys(item, `${path}.${key}`);
  }
}

const kindCounts = {};
for (let grade = 5; grade <= 10; grade++) {
  for (const field of ["arithmetik-algebra", "funktionen", "geometrie", "stochastik"]) {
    const quizId = `${grade}-${field}`;
    for (let i = 0; i < 15; i++) {
      const task = makeTask(quizId, i);
      assert.ok(task.prompt && task.solution && task.kind, `${quizId}/${i} missing content`);
      const result = evaluateAnswer(task, correctAnswer(task));
      assert.equal(result, 1, `${quizId}/${i} answer key rejected for ${task.kind}`);
      if (task.kind === "choice") assert.equal(new Set(task.options).size, task.options.length, `${quizId}/${i} has duplicate choices`);
      if (task.kind === "match") for (const pair of task.pairs) assert.equal(new Set(pair.options).size, pair.options.length, `${quizId}/${i} has duplicate matching options`);
      const visible = publicTask({ ...task, id: `q-${i}` }, new Date(Date.now() + 60_000).toISOString());
      assertNoPrivateKeys(visible, `${quizId}/${i}`);
      assert.ok(visible.id && visible.expiresAt, `${quizId}/${i} missing public round fields`);
      if (task.kind === "construct") assert.equal(visible.requiredPoints, task.points.length);
      if (task.kind === "match") assert.ok(visible.pairs.every(pair => !Object.hasOwn(pair, "correct")));
      kindCounts[task.kind] = (kindCounts[task.kind] || 0) + 1;
    }
  }
}

assert.ok(kindCounts.construct >= 18, "construction tasks should appear across all six geometry grades");
assert.ok(kindCounts.match > 0, "matching tasks should appear in competition rounds");
assert.ok(kindCounts.order > 0, "ordering tasks should appear in competition rounds");

const timed = { kind: "number", answer: 12, tol: 0.001 };
assert.deepEqual(scoreAnswer(timed, 12, 0, 60_000), { quality: 1, isCorrect: true, basePoints: 100, timeBonus: 50, remainingSeconds: 60 });
assert.equal(scoreAnswer(timed, 12, 30_000, 60_000).timeBonus, 25);
assert.equal(scoreAnswer(timed, 12, 60_001, 60_000).basePoints, 0);
const approximate = { kind: "slider", min: 0, max: 1, answer: 0.5, step: 0.01, tol: 0 };
assert.ok(scoreAnswer(approximate, 0.55, 1_000, 60_000).basePoints > 0);
assert.equal(scoreAnswer(approximate, 0.55, 1_000, 60_000).timeBonus, 0);
const partialConstruct = { kind: "construct", points: [[1, 2], [3, 4]] };
assert.equal(evaluateAnswer(partialConstruct, [[1, 2]]), 0.5);
assert.equal(scoreAnswer(partialConstruct, [[1, 2]], 1_000, 60_000).timeBonus, 0);

const persisted = new Map();
let leaderboardWrites = 0;
const storage = {
  get: async key => persisted.get(key),
  put: async (key, value) => persisted.set(key, structuredClone(value)),
  setAlarm: async () => {},
  deleteAlarm: async () => {},
};
const ctx = { storage, blockConcurrencyWhile: callback => callback() };
const env = {
  DB: { prepare: () => ({ bind: () => ({ run: async () => { leaderboardWrites++; } }) }) },
};
const browserId = "11111111-2222-4333-8444-555555555555";
const quizId = "8-geometrie";
const doRequest = (round, path, body) => round.fetch(new Request(`https://round.test/${path}`, {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
}));
let round = new CompetitionRound(ctx, env);
let startResponse = await doRequest(round, "start", { quizId, browserId, name: "Quest-Test" });
let started = await startResponse.json();
assert.equal(startResponse.status, 200);
assert.equal(started.question.kind, "construct");
assertNoPrivateKeys(started.question, "started competition question");
let totalPoints = 0;
for (let i = 0; i < 12; i++) {
  const current = round.round.tasks[round.round.index];
  const requestId = `integration-${i}-request`;
  const answerBody = { quizId, browserId, roundId: started.roundId, questionId: current.id, answer: correctAnswer(current), requestId };
  const response = await doRequest(round, "answer", answerBody);
  const result = await response.json();
  assert.equal(response.status, 200, `competition answer ${i} failed`);
  assert.equal(result.isCorrect, true, `competition answer ${i} should be correct`);
  assert.ok(result.totalPoints >= totalPoints);
  totalPoints = result.totalPoints;
  const duplicate = await (await doRequest(round, "answer", answerBody)).json();
  assert.equal(duplicate.totalPoints, totalPoints, "retry must not award the same answer twice");
  if (i < 11) {
    const next = await (await doRequest(round, "next", { quizId, browserId, roundId: started.roundId })).json();
    assert.ok(next.question?.id);
    if (i === 1) {
      round = new CompetitionRound(ctx, env);
      const resumed = await (await doRequest(round, "resume", { quizId, browserId, roundId: started.roundId })).json();
      assert.equal(resumed.roundId, started.roundId);
      assert.equal(resumed.totalPoints, totalPoints);
      assert.equal(resumed.question.id, next.question.id);
    }
  } else {
    assert.equal(result.finished, true);
  }
}
assert.equal(leaderboardWrites, 1, "completed round should write one personal best");
round = new CompetitionRound(ctx, env);
const completedResume = await (await doRequest(round, "resume", { quizId, browserId, roundId: started.roundId })).json();
assert.equal(completedResume.finished, true, "completed rounds should resume to their result");
assert.equal(leaderboardWrites, 1, "completed resume must not duplicate leaderboard persistence");

const statusResponse = await worker.fetch(new Request("https://worker.test/api/v1/status", { headers: { Origin: "https://quiz.test" } }), {
  ROUNDS: {}, DB: { prepare: () => ({ all: async () => ({ results: [] }) }) }, ALLOWED_ORIGINS: "https://quiz.test",
});
assert.deepEqual(await statusResponse.json(), { ok: true, scoreVersion: "v1" });
assert.equal(statusResponse.headers.get("access-control-allow-origin"), "https://quiz.test");

console.log(`Worker checks passed: 24 quiz IDs, 360 generated tasks, secret-key filtering, ${JSON.stringify(kindCounts)}, round resume, duplicate-request handling, leaderboard persistence, CORS and scoring.`);

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeTask, evaluateAnswer, scoreAnswer, publicTask} from '../src/index.js';

const ids = ['ef-analysis', 'ef-geometrie', 'ef-stochastik', ...['q1', 'q2'].flatMap(phase =>
  ['analysis', 'geometrie', 'stochastik'].flatMap(field => ['gk', 'lk'].map(course => `${phase}-${field}-${course}`)))];
function expression(task) { return task.prompt.match(/f\(x\)=(.*?)\\\)/)[1]; }
function polynomialValue(source, x) {
  assert.match(source, /^[x\d+\-().^]+$/);
  const js = source.replace(/\^/g, '**').replace(/(\d)(x|\()/g, '$1*$2').replace(/\)\(/g, ')*(');
  return Function('x', 'return ' + js)(x);
}
function approx(actual, expected, epsilon = 1e-6) {
  assert.ok(Math.abs(actual - expected) < epsilon, `${actual} differs from ${expected}`);
}

test('all numeric families provide many distinct value variants and valid answer controls', () => {
  for (const id of ids) for (const slot of [0, 2, 4]) {
    const prompts = new Set();
    let numeric = false;
    for (let i = 0; i < 160; i++) {
      const task = makeTask(id, slot);
      if (['choice', 'match', 'order'].includes(task.kind)) continue;
      numeric = true;
      prompts.add(task.prompt);
      assert.ok([60, 90, 120, 180, 240, 300].includes(task.timeLimitSeconds));
      const answer = task.kind === 'construct' ? task.points : task.answer;
      assert.equal(evaluateAnswer(task, answer), 1, `${id}/${slot}`);
      if (task.kind === 'slider') assert.ok(task.answer >= task.min && task.answer <= task.max);
      if (task.kind === 'construct') for (const point of task.points) for (const value of point)
        assert.ok(Number.isInteger(value) && Math.abs(value) <= 5, `${id} outside construction grid`);
    }
    if (numeric) assert.ok(prompts.size >= 12, `${id}/${slot} only ${prompts.size} variants`);
  }
});

test('generated polynomial derivatives match a numerical derivative of the displayed function', () => {
  for (const level of ['einstieg', 'aufbau', 'challenge']) for (let i = 0; i < 80; i++) {
    const task = makeTask('ef-analysis', 0, {level});
    const x = Number(task.prompt.match(/f'\((-?\d+)\)/)[1]);
    const f = value => polynomialValue(expression(task), value), h = 0.00001;
    approx(task.answer, (f(x + h) - f(x - h)) / (2 * h), 0.0001);
  }
});

test('exponential extrema are actual maxima and receive five minutes', () => {
  for (const slot of [0, 2]) for (let i = 0; i < 100; i++) {
    const task = makeTask('q1-analysis-lk', slot);
    const [, scale, offset, power, decay] = task.prompt.match(/f\(x\)=(\d+)\(x([+-]\d+)\)\^\{(\d+)\}e\^\{-(\d+)/).map(Number);
    const f = x => scale * (x + offset) ** power * Math.exp(-decay * (x + offset));
    assert.ok(f(task.answer) > f(task.answer - 0.01));
    assert.ok(f(task.answer) > f(task.answer + 0.01));
    assert.equal(task.timeLimitSeconds, 300);
  }
});

test('displayed cubic extrema and roots lie on their displayed graphs', () => {
  for (let i = 0; i < 100; i++) for (const id of ['q1-analysis-lk', 'ef-analysis', 'q1-analysis-gk']) {
    const task = makeTask(id, 4), f = x => polynomialValue(expression(task), x);
    for (const [x, y] of task.points) {
      approx(f(x), y);
      if (id === 'q1-analysis-lk') approx((f(x + 0.00001) - f(x - 0.00001)) / 0.00002, 0, 0.00001);
    }
    if (id === 'q1-analysis-lk') assert.equal(task.timeLimitSeconds, 300);
  }
});

test('area values equal numerical integration of the displayed polynomial', () => {
  for (let i = 0; i < 100; i++) {
    const task = makeTask('q2-analysis-gk', 0), f = x => polynomialValue(expression(task), x);
    const [, a, b] = task.prompt.match(/Intervall \\\(\[(-?\d+),(-?\d+)\]/).map(Number);
    const n = 100, h = (b - a) / n;
    let sum = f(a) + f(b);
    for (let j = 1; j < n; j++) sum += (j % 2 ? 4 : 2) * f(a + j * h);
    approx(task.answer, sum * h / 3);
  }
});

test('binomial variants match a separate Bernoulli convolution calculation', () => {
  for (const id of ['q1-stochastik-gk', 'q1-stochastik-lk', 'q2-stochastik-gk']) for (let i = 0; i < 80; i++) {
    const task = makeTask(id, 0);
    const [, nText, pText] = task.prompt.match(/B\((\d+);([\d{},]+)\)/);
    const n = Number(nText), p = Number(pText.replace('{,}', '.'));
    const [, relation, threshold] = task.prompt.match(/P\(X(\\leq|=)(\d+)\)/), k = Number(threshold);
    let probabilities = [1];
    for (let trial = 0; trial < n; trial++) {
      const next = Array(trial + 2).fill(0);
      probabilities.forEach((value, j) => {next[j] += value * (1 - p); next[j + 1] += value * p;});
      probabilities = next;
    }
    approx(task.answer, relation === '=' ? probabilities[k] : probabilities.slice(0, k + 1).reduce((a, b) => a + b));
    assert.equal(task.timeLimitSeconds, 240);
  }
});

test('time bonuses use the proportion of the individual budget, with no solution in public data', () => {
  for (const seconds of [60, 90, 120, 180, 240, 300]) {
    const task = {kind: 'number', answer: 7, timeLimitSeconds: seconds};
    assert.equal(scoreAnswer(task, 7, 0, seconds * 1000).timeBonus, 50);
    assert.equal(scoreAnswer(task, 7, seconds * 500, seconds * 1000).timeBonus, 25);
    assert.equal(scoreAnswer(task, 7, seconds * 1000, seconds * 1000).basePoints, 0);
    const visible = publicTask({...task, id: 'public'}, '2026-01-01T00:00:00Z');
    assert.equal(visible.timeLimitSeconds, seconds);
    assert.ok(!Object.hasOwn(visible, 'answer'));
  }
});

test('CAS advice distinguishes demanding calculations, checks and basic method practice', () => {
  const guidance = task => publicTask(task, '2026-01-01T00:00:00Z').casGuidance;
  const complex = guidance(makeTask('q1-analysis-lk', 0));
  assert.equal(complex.mode, 'recommended');
  assert.match(complex.text, /Definitionsbereich/);
  assert.equal(guidance(makeTask('q1-analysis-lk', 4)).mode, 'check');
  assert.equal(guidance(makeTask('ef-analysis', 0)).mode, 'not-needed');
  assert.equal(guidance(makeTask('q1-stochastik-lk', 0)).mode, 'recommended');
  assert.match(guidance(makeTask('q2-geometrie-lk', 2)).text, /Gradmaß/);
  // Older stored rounds have no family metadata and still receive useful advice.
  assert.equal(guidance({kind: 'choice', options: ['A', 'B']}).mode, 'not-needed');
  assert.equal(guidance({kind: 'number', answer: 7}).mode, 'check');
  for (const id of ids) for (let slot = 0; slot < 5; slot++) {
    const info = guidance(makeTask(id, slot));
    assert.deepEqual(Object.keys(info).sort(), ['mode', 'text', 'title']);
    assert.ok(info.text.length > 30 && info.title.startsWith('CAS'));
  }
});

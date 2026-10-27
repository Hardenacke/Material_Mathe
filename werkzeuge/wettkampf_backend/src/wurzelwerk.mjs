import {DurableObject} from 'cloudflare:workers';
import {HttpError, json, errorResponse, call} from './http.mjs';
import {fingerprint} from './fingerabdruck.mjs';
import {makeTask, build, linePoints} from './wurzelwerk-rules.mjs';

export const wurzelwerk = Object.freeze({id: 'wurzelwerk-klasse-9', groupId: 'wurzelwerk-klasse-9', version: 1, grade: '9'});
const first = cursor => [...cursor][0];
export function publicTask(task) {
  const {answer, a, b, explanation, ...question} = task;
  return question;
}
export function gradeTask(task, answer) {
  const number = value => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 1000000;
  let points, correct;
  if (task.kind === 'extract') {
    if (!answer || Object.keys(answer).sort().join() !== 'a,b' || !number(answer.a) || !number(answer.b))
      throw new HttpError(400, 'ANSWER', 'Bitte beide Zahlen eingeben.');
    correct = answer.a === task.a && answer.b === task.b; points = correct ? 100 : 0;
  } else {
    if (!number(answer) || (task.type === 'line' && (answer < 0 || answer > task.max)))
      throw new HttpError(400, 'ANSWER', 'Ungültige Zahl.');
    points = task.type === 'line' ? linePoints(Math.abs(answer - task.answer), 0.19) : answer === task.answer ? 100 : 0;
    correct = points === 100;
  }
  return {points, correct, explanation: task.explanation || `\\sqrt{${task.n}}\\approx ${task.answer.toFixed(2).replace('.', '{,}')}`};
}
function view(attempt) {
  if (!attempt) return null;
  return {id: attempt.id, phase: attempt.phase, index: attempt.index, limit: 12, level: 3,
    score: attempt.score, correct: attempt.correct, attempted: attempt.attempted,
    answered: attempt.answered, question: publicTask(attempt.task), feedback: attempt.feedback};
}
export class QuizRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.ctx = ctx; this.env = env; this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS quiz_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS quiz_attempts(id TEXT PRIMARY KEY,person TEXT NOT NULL,phase TEXT NOT NULL,state TEXT NOT NULL);
      CREATE UNIQUE INDEX IF NOT EXISTS one_quiz_active ON quiz_attempts(person) WHERE phase='active';
      CREATE TABLE IF NOT EXISTS quiz_best(person TEXT PRIMARY KEY,alias TEXT NOT NULL,score INTEGER NOT NULL,ended INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS quiz_receipts(person TEXT NOT NULL,key TEXT NOT NULL,hash TEXT NOT NULL,reply TEXT NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(person,key));
      CREATE TABLE IF NOT EXISTS quiz_outbox(revision INTEGER PRIMARY KEY,snapshot TEXT NOT NULL,due INTEGER NOT NULL);`);
    this.sql.exec('INSERT OR IGNORE INTO quiz_meta VALUES (?,?)', 'instance', crypto.randomUUID());
    this.sql.exec('INSERT OR IGNORE INTO quiz_meta VALUES (?,?)', 'revision', '0');
  }
  board() {
    let rank = 0, previous;
    return [...this.sql.exec('SELECT alias,score,ended FROM quiz_best ORDER BY score DESC,ended,person')].map((row, index) => {
      if (previous !== row.score) rank = index + 1;
      previous = row.score;
      return {rank, alias: row.alias, score: row.score, maxPoints: 1200, endedAt: row.ended};
    });
  }
  execute(input) {
    const {op, actor, attemptId, payload, requestId, hash} = input;
    const active = () => {
      const row = first(this.sql.exec("SELECT state FROM quiz_attempts WHERE person=? AND phase='active'", actor.id));
      return row ? JSON.parse(row.state) : null;
    };
    if (op === 'state') return {alias: actor.alias, grade: '9', current: view(active()), leaderboard: this.board(),
      archiveState: first(this.sql.exec('SELECT COUNT(*) AS n FROM quiz_outbox')).n ? 'pending' : 'confirmed'};
    const receipt = first(this.sql.exec('SELECT * FROM quiz_receipts WHERE person=? AND key=?', actor.id, requestId));
    if (receipt) {
      if (receipt.hash !== hash) throw new HttpError(409, 'IDEMPOTENCY', 'Anfragekennung bereits anders verwendet.');
      return JSON.parse(receipt.reply);
    }
    let attempt;
    if (op === 'start') {
      attempt = active();
      if (!attempt) {
        const types = build('competition', 'mix', 3).types;
        attempt = {id: crypto.randomUUID(), person: actor.id, types, index: 0, score: 0, correct: 0, attempted: 0,
          phase: 'active', answered: false, feedback: null, task: {...makeTask(types[0], 3), id: crypto.randomUUID()}};
      }
    } else {
      const row = first(this.sql.exec('SELECT person,state FROM quiz_attempts WHERE id=?', attemptId));
      if (!row || row.person !== actor.id) throw new HttpError(403, 'ATTEMPT', 'Dieser Versuch gehört nicht zu deinem Zugang.');
      attempt = JSON.parse(row.state);
      if (op === 'answer') {
        if (payload.questionId !== attempt.task.id) throw new HttpError(409, 'QUESTION', 'Bitte den aktuellen Spielstand laden.');
        if (!attempt.answered) {
          const feedback = gradeTask(attempt.task, payload.answer);
          attempt.score += feedback.points; attempt.correct += feedback.correct ? 1 : 0;
          attempt.attempted++; attempt.answered = true; attempt.feedback = feedback;
          if (attempt.attempted === 12) {
            attempt.phase = 'finished';
            const old = first(this.sql.exec('SELECT score FROM quiz_best WHERE person=?', actor.id));
            if (!old || attempt.score > old.score) this.sql.exec(`INSERT INTO quiz_best VALUES (?,?,?,?)
              ON CONFLICT(person) DO UPDATE SET alias=excluded.alias,score=excluded.score,ended=excluded.ended`, actor.id, actor.alias, attempt.score, Date.now());
            const revision = Number(first(this.sql.exec("SELECT value FROM quiz_meta WHERE key='revision'")).value) + 1;
            this.sql.exec("UPDATE quiz_meta SET value=? WHERE key='revision'", String(revision));
            const snapshot = {subject: 'mathematik', competitionId: wurzelwerk.id, version: 1, periodId: 'gesamt',
              instanceId: first(this.sql.exec("SELECT value FROM quiz_meta WHERE key='instance'")).value,
              revision, final: false, generatedAt: Date.now(), leaderboard: this.board()};
            this.sql.exec('INSERT INTO quiz_outbox VALUES (?,?,?)', revision, JSON.stringify(snapshot), Date.now());
          }
        }
      } else if (op === 'next') {
        if (!attempt.answered || attempt.phase === 'finished') throw new HttpError(409, 'PHASE', 'Bitte zuerst die aktuelle Aufgabe beantworten.');
        attempt.index++; attempt.answered = false; attempt.feedback = null;
        attempt.task = {...makeTask(attempt.types[attempt.index], 3), id: crypto.randomUUID()};
      } else throw new HttpError(400, 'OP', 'Unbekannter Spielzug.');
    }
    this.sql.exec('INSERT OR REPLACE INTO quiz_attempts VALUES (?,?,?,?)', attempt.id, actor.id, attempt.phase, JSON.stringify(attempt));
    const reply = {attempt: view(attempt)};
    this.sql.exec('INSERT INTO quiz_receipts VALUES (?,?,?,?,?)', actor.id, requestId, hash, JSON.stringify(reply), Date.now() + 604800000);
    return reply;
  }
  async schedule() {
    const due = first(this.sql.exec('SELECT MIN(due) AS due FROM quiz_outbox')).due;
    const expiry = first(this.sql.exec('SELECT MIN(expires) AS due FROM quiz_receipts')).due;
    const times = [due, expiry].filter(value => value !== null);
    if (times.length) await this.ctx.storage.setAlarm(Math.max(Date.now() + 100, Math.min(...times)));
    else await this.ctx.storage.deleteAlarm();
  }
  async fetch(request) {
    try {
      const input = await request.json();
      const result = this.ctx.storage.transactionSync(() => this.execute(input));
      await this.schedule(); return json(result);
    } catch (error) {return errorResponse(error);}
  }
  async alarm() {
    this.sql.exec('DELETE FROM quiz_receipts WHERE expires<=?', Date.now());
    const jobs = [...this.sql.exec('SELECT * FROM quiz_outbox WHERE due<=? ORDER BY revision LIMIT 10', Date.now())];
    for (const job of jobs) {
      let confirmed = false;
      try {
        const response = await call(this.env.ARCHIVE_WRITER, 'mathematik', {snapshot: JSON.parse(job.snapshot)});
        if (response.ok) confirmed = (await response.json()).confirmed === true;
      } catch { /* Dauerhafter Auftrag bleibt bei einem Ausfall erhalten. */ }
      if (confirmed) this.sql.exec('DELETE FROM quiz_outbox WHERE revision=?', job.revision);
      else this.sql.exec('UPDATE quiz_outbox SET due=? WHERE revision=?', Date.now() + 30000, job.revision);
    }
    await this.schedule();
  }
}

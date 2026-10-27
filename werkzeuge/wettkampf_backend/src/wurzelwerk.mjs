import {DurableObject} from 'cloudflare:workers';
import {HttpError, json, errorResponse, call} from './http.mjs';
import {fingerprint} from './fingerabdruck.mjs';
import {build} from './wurzelwerk-rules.mjs';
import {competitionTask,timedPoints,lineGrade,QUESTION_MS,MAX_POINTS} from './wurzelwerk-competition.mjs';

export const wurzelwerk = Object.freeze({id: 'wurzelwerk-klasse-9', groupId: 'wurzelwerk-klasse-9', version: 2, grade: '9'});
const first = cursor => [...cursor][0];
export function publicTask(task) {
  const {answer, a, b, explanation, ...question} = task;
  return question;
}
export function gradeTask(task, answer,openedAt=Date.now(),now=Date.now()) {
  const number = value => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 1000000;
  let points, correct;
  if(now>=openedAt+QUESTION_MS){points=0;correct=false}
  else if (task.kind === 'extract') {
    if (!answer || Object.keys(answer).sort().join() !== 'a,b' || !number(answer.a) || !number(answer.b))
      throw new HttpError(400, 'ANSWER', 'Bitte beide Zahlen eingeben.');
    correct = answer.a === task.a && answer.b === task.b; points = correct ? 100 : 0;
  } else {
    if (!number(answer) || (task.type === 'line' && (answer < 0 || answer > task.max)))
      throw new HttpError(400, 'ANSWER', 'Ungültige Zahl.');
    points = task.type === 'line' ? lineGrade(Math.abs(answer - task.answer)) : answer === task.answer ? 100 : 0;
    correct = points === 100;
  }
  return {...timedPoints(points,openedAt,now),correct,explanation:task.explanation || `\\sqrt{${task.n}}\\approx ${task.answer.toFixed(2).replace('.', '{,}')}`};
}
function view(attempt) {
  if (!attempt) return null;
  return {id: attempt.id, phase: attempt.phase, index: attempt.index, limit: 12, level: 2,
    score: attempt.score, correct: attempt.correct, attempted: attempt.attempted,
    answered: attempt.answered, question: publicTask(attempt.task), feedback: attempt.feedback,
    openedAt:attempt.openedAt,deadline:attempt.deadline,startedAt:attempt.startedAt,endedAt:attempt.endedAt,
    basePoints:attempt.basePoints||0,timeBonus:attempt.timeBonus||0,maxPoints:MAX_POINTS};
}
export class QuizRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.ctx = ctx; this.env = env; this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS quiz_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS quiz_attempts(id TEXT PRIMARY KEY,person TEXT NOT NULL,phase TEXT NOT NULL,state TEXT NOT NULL);
      CREATE UNIQUE INDEX IF NOT EXISTS one_quiz_active ON quiz_attempts(person) WHERE phase='active';
      CREATE TABLE IF NOT EXISTS quiz_best(person TEXT PRIMARY KEY,alias TEXT NOT NULL,score INTEGER NOT NULL,ended INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS quiz_receipts(person TEXT NOT NULL,key TEXT NOT NULL,hash TEXT NOT NULL,reply TEXT NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(person,key));
      CREATE TABLE IF NOT EXISTS quiz_outbox(revision INTEGER PRIMARY KEY,snapshot TEXT NOT NULL,due INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS quiz_guests(id TEXT PRIMARY KEY,secret_hash TEXT NOT NULL UNIQUE,alias TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS quiz_rate(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);`);
    this.sql.exec('INSERT OR IGNORE INTO quiz_meta VALUES (?,?)', 'instance', crypto.randomUUID());
    this.sql.exec('INSERT OR IGNORE INTO quiz_meta VALUES (?,?)', 'revision', '0');
  }
  board() {
    let rank = 0, previous;
    return [...this.sql.exec('SELECT alias,score,ended FROM quiz_best ORDER BY score DESC,ended,person')].map((row, index) => {
      if (previous !== row.score) rank = index + 1;
      previous = row.score;
      return {rank, alias: row.alias, score: row.score, maxPoints:this.version()>=2?MAX_POINTS:1200, endedAt: row.ended};
    });
  }
  version(){return Number(first(this.sql.exec("SELECT value FROM quiz_meta WHERE key='version'"))?.value||1)}
  save(attempt){this.sql.exec('INSERT OR REPLACE INTO quiz_attempts VALUES (?,?,?,?)',attempt.id,attempt.person,attempt.phase,JSON.stringify(attempt))}
  open(attempt){
    const type=attempt.types[attempt.index],ordinal=attempt.types.slice(0,attempt.index).filter(value=>value==='laws').length;
    attempt.task=competitionTask(type,ordinal);attempt.openedAt=Date.now();attempt.deadline=attempt.openedAt+QUESTION_MS;
    attempt.answered=false;attempt.feedback=null;
  }
  answer(attempt,feedback,now){
    attempt.score+=feedback.points;attempt.correct+=feedback.correct?1:0;attempt.attempted++;
    attempt.basePoints=(attempt.basePoints||0)+feedback.basePoints;attempt.timeBonus=(attempt.timeBonus||0)+feedback.timeBonus;
    attempt.answered=true;attempt.feedback=feedback;
    if(attempt.attempted===12){
      attempt.phase='finished';attempt.endedAt=now;
      const old=first(this.sql.exec('SELECT score FROM quiz_best WHERE person=?',attempt.person));
      if(!old||attempt.score>old.score)this.sql.exec(`INSERT INTO quiz_best VALUES (?,?,?,?) ON CONFLICT(person)
        DO UPDATE SET alias=excluded.alias,score=excluded.score,ended=excluded.ended`,attempt.person,attempt.alias,attempt.score,now);
      this.queueSnapshot();
    }
    this.save(attempt);
  }
  settleDue(){
    for(const row of [...this.sql.exec("SELECT state FROM quiz_attempts WHERE phase='active' AND json_extract(state,'$.answered')=0 AND json_extract(state,'$.deadline')<=?",Date.now())]){
      const attempt=JSON.parse(row.state);this.answer(attempt,gradeTask(attempt.task,null,attempt.openedAt,attempt.deadline),attempt.deadline);
    }
  }
  rate(key, limit, duration) {
    this.sql.exec('DELETE FROM quiz_rate WHERE expires<=?', Date.now());
    this.sql.exec('INSERT INTO quiz_rate VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1', key, Date.now()+duration);
    return first(this.sql.exec('SELECT count FROM quiz_rate WHERE key=?',key)).count <= limit;
  }
  queueSnapshot() {
    const revision = Number(first(this.sql.exec("SELECT value FROM quiz_meta WHERE key='revision'")).value) + 1;
    this.sql.exec("UPDATE quiz_meta SET value=? WHERE key='revision'", String(revision));
    const snapshot = {subject:'mathematik',competitionId:wurzelwerk.id,version:this.version(),periodId:'gesamt',
      instanceId:first(this.sql.exec("SELECT value FROM quiz_meta WHERE key='instance'")).value,
      revision,final:false,generatedAt:Date.now(),leaderboard:this.board()};
    this.sql.exec('INSERT INTO quiz_outbox VALUES (?,?,?)',revision,JSON.stringify(snapshot),Date.now());
  }
  execute(input) {
    const {op, actor, attemptId, payload, requestId, hash} = input;
    if (op === 'public') return {leaderboard:this.board(),grade:'9',version:this.version(),maxPoints:MAX_POINTS};
    if (op === 'guest-join' || op === 'guest-auth') {
      let guest=first(this.sql.exec('SELECT id,alias FROM quiz_guests WHERE secret_hash=?',input.secretHash));
      if (op === 'guest-auth') {
        if (!guest) return {guest:null};
        if (!this.rate('person/'+guest.id,120,60000)) return {error:{code:'RATE',message:'Bitte kurz warten und erneut versuchen.'}};
        return {guest:{...guest,memberships:[wurzelwerk.id]}};
      }
      if (!guest) {
        if (!this.rate('join/'+input.rateKey,120,600000)) return {error:{code:'RATE',message:'Bitte kurz warten und erneut versuchen.'}};
        guest={id:'guest-'+crypto.randomUUID(),alias:input.alias || 'Wurzel '+crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(0,6)};
        this.sql.exec('INSERT INTO quiz_guests VALUES (?,?,?)',guest.id,input.secretHash,guest.alias);
      } else if (input.alias && input.alias !== guest.alias) {
        guest.alias=input.alias;
        this.sql.exec('UPDATE quiz_guests SET alias=? WHERE id=?',guest.alias,guest.id);
        if (first(this.sql.exec('SELECT person FROM quiz_best WHERE person=?',guest.id))) {
          this.sql.exec('UPDATE quiz_best SET alias=? WHERE person=?',guest.alias,guest.id);this.queueSnapshot();
        }
      }
      return {alias:guest.alias};
    }
    const active = () => {
      const row = first(this.sql.exec("SELECT state FROM quiz_attempts WHERE person=? AND phase='active'", actor.id));
      return row ? JSON.parse(row.state) : null;
    };
    if (op === 'state') return {alias: actor.alias, grade: '9', current: view(active()), leaderboard: this.board(),
      version:this.version(),maxPoints:MAX_POINTS,archiveState: first(this.sql.exec('SELECT COUNT(*) AS n FROM quiz_outbox')).n ? 'pending' : 'confirmed'};
    const receipt = first(this.sql.exec('SELECT * FROM quiz_receipts WHERE person=? AND key=?', actor.id, requestId));
    if (receipt) {
      if (receipt.hash !== hash) throw new HttpError(409, 'IDEMPOTENCY', 'Anfragekennung bereits anders verwendet.');
      return JSON.parse(receipt.reply);
    }
    let attempt;
    if (op === 'start') {
      attempt = active();
      if (!attempt) {
        const types = build('competition', 'mix', 2).types;
        attempt = {id: crypto.randomUUID(), person: actor.id, types, index: 0, score: 0, correct: 0, attempted: 0,
          phase:'active',alias:actor.alias,startedAt:Date.now(),basePoints:0,timeBonus:0};
        this.open(attempt);
      }
    } else {
      const row = first(this.sql.exec('SELECT person,state FROM quiz_attempts WHERE id=?', attemptId));
      if (!row || row.person !== actor.id) throw new HttpError(403, 'ATTEMPT', 'Dieser Versuch gehört nicht zu deinem Zugang.');
      attempt = JSON.parse(row.state);
      if (op === 'answer') {
        if (payload.questionId !== attempt.task.id) throw new HttpError(409, 'QUESTION', 'Bitte den aktuellen Spielstand laden.');
        if (!attempt.answered) {
          attempt.alias=actor.alias;this.answer(attempt,gradeTask(attempt.task,payload.answer,attempt.openedAt,Date.now()),Date.now());
        }
      } else if (op === 'next') {
        if (!attempt.answered || attempt.phase === 'finished') throw new HttpError(409, 'PHASE', 'Bitte zuerst die aktuelle Aufgabe beantworten.');
        attempt.index++;this.open(attempt);
      } else throw new HttpError(400, 'OP', 'Unbekannter Spielzug.');
    }
    this.save(attempt);
    const reply = {attempt: view(attempt)};
    this.sql.exec('INSERT INTO quiz_receipts VALUES (?,?,?,?,?)', actor.id, requestId, hash, JSON.stringify(reply), Date.now() + 604800000);
    return reply;
  }
  async schedule() {
    const due = first(this.sql.exec('SELECT MIN(due) AS due FROM quiz_outbox')).due;
    const expiry = first(this.sql.exec('SELECT MIN(expires) AS due FROM quiz_receipts')).due;
    const deadline=first(this.sql.exec("SELECT MIN(json_extract(state,'$.deadline')) AS due FROM quiz_attempts WHERE phase='active' AND json_extract(state,'$.answered')=0")).due;
    const times = [due, expiry,deadline].filter(value => value !== null);
    if (times.length) await this.ctx.storage.setAlarm(Math.max(Date.now() + 100, Math.min(...times)));
    else await this.ctx.storage.deleteAlarm();
  }
  async fetch(request) {
    try {
      const input = await request.json();
      const result = this.ctx.storage.transactionSync(() => {
        this.sql.exec('INSERT OR IGNORE INTO quiz_meta VALUES (?,?)','version',String(input.version||1));
        this.settleDue();
        try{return this.execute(input)}catch(error){if(error instanceof HttpError)return {failure:{status:error.status,code:error.code,message:error.message}};throw error}
      });
      await this.schedule();
      if(result.failure)throw new HttpError(result.failure.status,result.failure.code,result.failure.message);
      return json({...result,serverNow:Date.now()});
    } catch (error) {return errorResponse(error);}
  }
  async alarm() {
    this.ctx.storage.transactionSync(()=>this.settleDue());
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

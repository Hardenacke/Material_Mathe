import {DurableObject} from 'cloudflare:workers';
import schema from '../datenmodell/room-state.sql';
import {migrate, one, getMeta, setMeta} from './database.mjs';
import {createAttempt, openQuestion, answer, settle, summary, view, RuleError} from './spiel.mjs';
import {availability} from './zeitraum.mjs';
import {HttpError, json, errorResponse, call} from './http.mjs';

export class RoomState extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.ctx = ctx; this.env = env; this.sql = ctx.storage.sql;
    migrate(ctx, schema + `
      CREATE TABLE IF NOT EXISTS usage (participant_id TEXT PRIMARY KEY, count INTEGER NOT NULL, last_end INTEGER);
    `);
  }
  meta(key) { return getMeta(this.sql, key); }
  save(a) {
    this.sql.exec(`INSERT INTO attempts VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET
      phase=excluded.phase,ended_at=excluded.ended_at,hard_end=excluded.hard_end,
      question_deadline=excluded.question_deadline,score=excluded.score,state_json=excluded.state_json`,
      a.id, a.participantId, a.alias, a.phase, a.startedAt, a.endedAt, a.hardEnd,
      a.current?.deadline ?? null, a.score, JSON.stringify(a));
  }
  leaderboard() {
    const rows = [...this.sql.exec('SELECT alias,score,max_points,ended_at FROM best_scores ORDER BY score DESC,alias COLLATE NOCASE,participant_id')];
    let previous, rank = 0;
    return rows.map((row, index) => {
      if (row.score !== previous) rank = index + 1;
      previous = row.score;
      return {rank, alias: row.alias, score: row.score, maxPoints: row.max_points, endedAt: row.ended_at};
    });
  }
  queueSnapshot(now) {
    const revision = Number(this.meta('revision') || 0) + 1;
    setMeta(this.sql, 'revision', revision);
    const config = JSON.parse(this.meta('config')), period = JSON.parse(this.meta('period'));
    const snapshot = {subject: 'mathematik', competitionId: config.id, version: config.version,
      periodId: period.id, instanceId: this.meta('instanceId'), revision,
      final: this.meta('closed') === '1', generatedAt: now, leaderboard: this.leaderboard()};
    this.sql.exec('INSERT INTO archive_outbox VALUES (?,?,?,NULL)', revision, JSON.stringify(snapshot), now);
  }
  finish(a, now) {
    const s = summary(a), previous = one(this.sql.exec('SELECT score,ended_at FROM best_scores WHERE participant_id=?', a.participantId));
    if (!previous || a.score > previous.score || (a.score === previous.score && a.endedAt < previous.ended_at))
      this.sql.exec(`INSERT INTO best_scores VALUES (?,?,?,?,?,?,?) ON CONFLICT(participant_id) DO UPDATE SET
        alias=excluded.alias,attempt_id=excluded.attempt_id,score=excluded.score,max_points=excluded.max_points,
        ended_at=excluded.ended_at,summary_json=excluded.summary_json`,
        a.participantId, a.alias, a.id, a.score, s.maxPoints, a.endedAt, JSON.stringify(s));
    this.sql.exec('UPDATE usage SET last_end=? WHERE participant_id=?', a.endedAt, a.participantId);
    this.queueSnapshot(now);
  }
  settleDue(now) {
    const due = [...this.sql.exec(`SELECT state_json FROM attempts WHERE phase!='finished' AND
      (hard_end<=? OR question_deadline<=?)`, now, now)];
    for (const row of due) {
      const a = JSON.parse(row.state_json);
      if (settle(a, now)) { this.save(a); if (a.phase === 'finished') this.finish(a, now); }
    }
    const period = this.meta('period') && JSON.parse(this.meta('period'));
    if (period?.endsAt !== null && period?.endsAt <= now && this.meta('closed') !== '1') {
      setMeta(this.sql, 'closed', '1'); this.queueSnapshot(now);
    }
    this.sql.exec('DELETE FROM request_receipts WHERE expires_at<=?', now);
    const days = Math.max(1, Number(this.env.DETAIL_RETENTION_DAYS) || 90);
    this.sql.exec("DELETE FROM attempts WHERE phase='finished' AND ended_at<?", now - days * 86400000);
    this.sql.exec('DELETE FROM archive_outbox WHERE acknowledged_at IS NOT NULL AND acknowledged_at<?', now - 7 * 86400000);
  }
  bind(input) {
    if (!this.meta('config')) {
      setMeta(this.sql, 'config', JSON.stringify(input.config));
      setMeta(this.sql, 'period', JSON.stringify(input.period));
      setMeta(this.sql, 'configHash', input.configHash); setMeta(this.sql, 'bankHash', input.bankHash);
      setMeta(this.sql, 'instanceId', crypto.randomUUID());
    }
    const original = JSON.parse(this.meta('config'));
    if (original.groupId !== input.config.groupId)
      throw new HttpError(409, 'VERSION', 'Für eine geänderte Lerngruppe eine neue Version verwenden.');
  }
  execute(input, now) {
    // Fachfehler werden als Ergebnis behandelt: fällige Fristwirkungen bleiben committed.
    try {
      this.bind(input); this.settleDue(now);
      if (input.op === 'leaderboard') {
        const best = one(this.sql.exec('SELECT score,max_points,ended_at FROM best_scores WHERE participant_id=?', input.actor.id));
        return {leaderboard: this.leaderboard(), serverNow: now,
          ownBest: best ? {score: best.score, maxPoints: best.max_points, endedAt: best.ended_at} : null,
          period: JSON.parse(this.meta('period')), archiveState: this.archiveState()};
      }
      const own = [...this.sql.exec("SELECT state_json FROM attempts WHERE participant_id=? ORDER BY (phase='finished'),started_at DESC,id DESC", input.actor.id)]
        .map(row => JSON.parse(row.state_json));
      if (input.op === 'current') return own.length ? view(own[0], now) : {attempt: null, serverNow: now};
      const operation = `${input.op}/${input.attemptId || ''}`;
      if (input.requestId) {
        const receipt = one(this.sql.exec('SELECT * FROM request_receipts WHERE participant_id=? AND request_id=?', input.actor.id, input.requestId));
        if (receipt) {
          if (receipt.operation !== operation || receipt.payload_hash !== input.payloadHash)
            throw new HttpError(409, 'IDEMPOTENCY', 'Diese Anfragekennung wurde bereits anders verwendet.');
          return JSON.parse(receipt.response_json);
        }
      }
      let attempt;
      if (input.op === 'start') {
        if (this.meta('configHash') !== input.configHash || this.meta('bankHash') !== input.bankHash)
          throw new HttpError(409, 'VERSION', 'Die Definition wurde geändert. Eine neue Wettbewerbsversion ist erforderlich.');
        if (availability(input.config, now) !== 'open' || this.meta('closed') === '1')
          throw new HttpError(409, 'CLOSED', 'Dieser Wettbewerb ist derzeit geschlossen.');
        attempt = own.find(a => a.phase !== 'finished');
        if (!attempt) {
          const usage = one(this.sql.exec('SELECT * FROM usage WHERE participant_id=?', input.actor.id));
          if (input.config.attempts.maxPerPeriod !== null && (usage?.count || 0) >= input.config.attempts.maxPerPeriod)
            throw new HttpError(409, 'LIMIT', 'Die erlaubten Versuche sind ausgeschöpft.');
          if (usage?.last_end && now < usage.last_end + input.config.attempts.cooldownSeconds * 1000)
            throw new HttpError(409, 'COOLDOWN', 'Bitte vor dem nächsten Versuch kurz warten.');
          attempt = createAttempt(input.config, input.bank, input.actor.id, input.actor.alias, now);
          this.sql.exec(`INSERT INTO usage VALUES (?,1,NULL) ON CONFLICT(participant_id) DO UPDATE SET count=count+1`, input.actor.id);
        }
      } else {
        const row = one(this.sql.exec('SELECT state_json FROM attempts WHERE id=?', input.attemptId));
        if (!row) throw new HttpError(404, 'ATTEMPT', 'Versuch nicht gefunden.');
        attempt = JSON.parse(row.state_json);
        if (attempt.participantId !== input.actor.id) throw new HttpError(403, 'OWNER', 'Dieser Versuch gehört zu einem anderen Zugang.');
        if (input.op === 'next') openQuestion(attempt, now);
        if (input.op === 'answer') answer(attempt, input.payload.questionId, input.payload.answerId, now);
      }
      const savedPhase = one(this.sql.exec('SELECT phase FROM attempts WHERE id=?', attempt.id))?.phase;
      this.save(attempt);
      if (attempt.phase === 'finished' && savedPhase !== 'finished') this.finish(attempt, now);
      const result = {...view(attempt, now), archiveState: this.archiveState()};
      if (input.requestId) this.sql.exec('INSERT INTO request_receipts VALUES (?,?,?,?,?,?)',
        input.actor.id, input.requestId, operation, input.payloadHash, JSON.stringify(result), now + 7 * 86400000);
      return result;
    } catch (error) {
      if (error instanceof HttpError || error instanceof RuleError) return {failure: {
        status: error.status || (error.code === 'ANSWER' ? 400 : 409), code: error.code, message: error.message}};
      throw error;
    }
  }
  archiveState() {
    return Number(this.meta('revision') || 0) <= Number(this.meta('confirmedRevision') || 0) ? 'confirmed' : 'pending';
  }
  async schedule() {
    if (!this.meta('config')) return;
    const now = Date.now(), times = [];
    const deadline = one(this.sql.exec("SELECT MIN(MIN(hard_end,COALESCE(question_deadline,hard_end))) AS value FROM attempts WHERE phase!='finished'"))?.value;
    if (deadline) times.push(deadline);
    const period = JSON.parse(this.meta('period'));
    if (period.endsAt && this.meta('closed') !== '1') times.push(period.endsAt);
    const due = one(this.sql.exec('SELECT MIN(due_at) AS value FROM archive_outbox WHERE acknowledged_at IS NULL'))?.value;
    if (due) times.push(due);
    const cleanup = one(this.sql.exec("SELECT MIN(ended_at) AS value FROM attempts WHERE phase='finished'"))?.value;
    if (cleanup) times.push(cleanup + Math.max(1, Number(this.env.DETAIL_RETENTION_DAYS) || 90) * 86400000 + 1000);
    const receipts = one(this.sql.exec('SELECT MIN(expires_at) AS value FROM request_receipts'))?.value;
    if (receipts) times.push(receipts);
    if (times.length) await this.ctx.storage.setAlarm(Math.max(now + 100, Math.min(...times)));
    else await this.ctx.storage.deleteAlarm();
  }
  async flush() {
    const rows = [...this.sql.exec('SELECT * FROM archive_outbox WHERE acknowledged_at IS NULL AND due_at<=? ORDER BY revision LIMIT 20', Date.now())];
    for (const row of rows) {
      let confirmed = false;
      try {
        const response = await call(this.env.ARCHIVE_WRITER, 'mathematik', {op: 'enqueue', snapshot: JSON.parse(row.snapshot_json)});
        if (response.ok) confirmed = (await response.json()).confirmed === true;
      } catch { /* Dauerhafte Outbox bleibt bei Ausfall erhalten. */ }
      this.ctx.storage.transactionSync(() => {
        if (confirmed) {
          this.sql.exec('UPDATE archive_outbox SET acknowledged_at=? WHERE revision=?', Date.now(), row.revision);
          setMeta(this.sql, 'confirmedRevision', Math.max(Number(this.meta('confirmedRevision') || 0), row.revision));
        } else this.sql.exec('UPDATE archive_outbox SET due_at=? WHERE revision=?', Date.now() + 30000, row.revision);
      });
    }
  }
  async fetch(request) {
    try {
      const input = await request.json();
      const result = this.ctx.storage.transactionSync(() => this.execute(input, Date.now()));
      await this.schedule();
      if (result.failure) throw new HttpError(result.failure.status, result.failure.code, result.failure.message);
      return json(result);
    } catch (error) { return errorResponse(error); }
  }
  async alarm() {
    this.ctx.storage.transactionSync(() => this.settleDue(Date.now()));
    await this.flush(); await this.schedule();
  }
}

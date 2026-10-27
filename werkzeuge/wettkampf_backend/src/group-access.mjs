import {DurableObject} from 'cloudflare:workers';
import schema from '../datenmodell/group-access.sql';
import {migrate, one} from './database.mjs';
import {HttpError, json, errorResponse} from './http.mjs';

export class GroupAccess extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.ctx = ctx; this.sql = ctx.storage.sql;
    migrate(ctx, schema + '\nCREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);');
  }
  async fetch(request) {
    try {
      const input = await request.json(), now = Date.now();
      const result = this.ctx.storage.transactionSync(() => {
        if (input.op === 'import') {
          for (const person of input.participants) {
            this.sql.exec(`INSERT INTO participants(id,alias,code_hash,enabled,created_at) VALUES (?,?,?,?,?)
              ON CONFLICT(id) DO UPDATE SET alias=excluded.alias,code_hash=excluded.code_hash,enabled=excluded.enabled`,
              person.id, person.alias, person.codeHash, person.enabled ? 1 : 0, now);
            this.sql.exec('DELETE FROM memberships WHERE participant_id=?', person.id);
            for (const id of person.competitions)
              this.sql.exec('INSERT INTO memberships VALUES (?,?)', id, person.id);
          }
          return {imported: input.participants.length};
        }
        const person = one(this.sql.exec('SELECT id,alias FROM participants WHERE code_hash=? AND enabled=1', input.codeHash));
        const key = person ? 'person/' + person.id : 'invalid/' + input.rateKey;
        this.sql.exec('DELETE FROM rate_limits WHERE reset_at<=?', now);
        this.sql.exec(`INSERT INTO rate_limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1`, key, now + 60000);
        const rate = one(this.sql.exec('SELECT count FROM rate_limits WHERE key=?', key));
        if (rate.count > (person ? 120 : 30)) return {status: 429, code: 'RATE', message: 'Bitte kurz warten und erneut versuchen.'};
        if (!person) return {status: 401, code: 'CODE', message: 'Zugang ungültig oder gesperrt.'};
        const memberships = [...this.sql.exec('SELECT competition_id FROM memberships WHERE participant_id=?', person.id)].map(row => row.competition_id);
        return {...person, memberships};
      });
      if (result.status) throw new HttpError(result.status, result.code, result.message);
      return json(result);
    } catch (error) { return errorResponse(error); }
  }
}

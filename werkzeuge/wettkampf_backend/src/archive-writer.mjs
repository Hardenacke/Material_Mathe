import {DurableObject} from 'cloudflare:workers';
import schema from '../datenmodell/archive-writer.sql';
import {migrate, one} from './database.mjs';
import {json, errorResponse, HttpError} from './http.mjs';
import {fingerprint} from './fingerabdruck.mjs';
import {archivePaths, publicSnapshot, assertArchiveRequest} from './archive-policy.mjs';

function base64(text) {
  const bytes = new TextEncoder().encode(text); let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
export class ArchiveWriter extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.ctx = ctx; this.env = env; this.sql = ctx.storage.sql; migrate(ctx, schema); }
  async fetch(request) {
    try {
      const {snapshot} = await request.json(), targets = archivePaths(this.env, snapshot);
      publicSnapshot(snapshot);
      const hash = await fingerprint(snapshot);
      const confirmed = this.ctx.storage.transactionSync(() => {
        for (const target of targets) {
          this.sql.exec(`INSERT INTO archive_jobs(target_path,instance_id,revision,payload_hash,payload_json,status,next_retry_at)
            VALUES (?,?,?,?,?,'pending',?) ON CONFLICT DO NOTHING`, target, snapshot.instanceId, snapshot.revision, hash, JSON.stringify(snapshot), Date.now());
          const row = one(this.sql.exec('SELECT payload_hash FROM archive_jobs WHERE target_path=? AND instance_id=? AND revision=?', target, snapshot.instanceId, snapshot.revision));
          if (row.payload_hash !== hash) throw new HttpError(409, 'REVISION', 'Archivauftrag mit widersprüchlichem Inhalt.');
        }
        return targets.every(target => one(this.sql.exec('SELECT status FROM archive_jobs WHERE target_path=? AND instance_id=? AND revision=?', target, snapshot.instanceId, snapshot.revision)).status === 'written');
      });
      await this.schedule(); return json({confirmed});
    } catch (error) { return errorResponse(error); }
  }
  async github(path, options = {}) {
    assertArchiveRequest(path, options.method || 'GET');
    const repository = this.env.ARCHIVE_REPOSITORY;
    if (!this.env.GITHUB_TOKEN || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository || '')) throw new Error('CONFIG');
    const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {...options, signal: AbortSignal.timeout(15000), headers: {
      'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + this.env.GITHUB_TOKEN,
      'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'mathe-wettkampf-api', 'Content-Type': 'application/json'
    }});
    if (response.status === 429 || (response.status === 403 && response.headers.has('retry-after'))) {
      const error = new Error('RATE_LIMIT'), retry = response.headers.get('retry-after');
      error.retryAt = /^\d+$/.test(retry || '') ? Date.now() + Number(retry) * 1000 : Date.parse(retry);
      throw error;
    }
    return response;
  }
  async write(job) {
    const snapshot = publicSnapshot(JSON.parse(job.payload_json)), paths = archivePaths(this.env, snapshot);
    // Gespeicherte Aufträge mit altem Präfix wechseln ebenfalls nach ergebnisse/.
    const path = job.target_path.endsWith('/final.json') ? paths[1] :
      job.target_path.endsWith('/latest.json') ? paths[0] : null;
    if (!path || snapshot.instanceId !== job.instance_id || snapshot.revision !== job.revision) throw new Error('CONFIG');
    const repository = await this.github('');
    const info = repository.ok ? await repository.json() : null;
    if (typeof info?.private !== 'boolean') throw new Error('REPOSITORY_UNAVAILABLE');
    if (!info.private && this.env.ARCHIVE_ALLOW_PUBLIC !== 'true') throw new Error('PUBLIC_REPOSITORY_NOT_ALLOWED');
    const payloadHash = await fingerprint(snapshot);
    const branch = this.env.ARCHIVE_BRANCH || 'main', target = '/contents/' + path;
    for (let conflict = 0; conflict < 3; conflict++) {
      const existing = await this.github(target + '?ref=' + encodeURIComponent(branch)); let sha;
      if (existing.ok) {
        const file = await existing.json(); sha = file.sha;
        const previous = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g, '')), ch => ch.charCodeAt(0))));
        if (previous.instanceId !== job.instance_id) throw new Error('INSTANCE_CONFLICT');
        if (previous.revision >= job.revision) {
          if (previous.revision === job.revision && await fingerprint(previous) !== payloadHash) throw new Error('REVISION_CONFLICT');
          return sha;
        }
      } else if (existing.status !== 404) throw new Error('READ_' + existing.status);
      const response = await this.github(target, {method: 'PUT', body: JSON.stringify({
        message: `Mathematik: Wertung Revision ${job.revision}`, branch,
        content: base64(JSON.stringify(snapshot, null, 2) + '\n'), ...(sha ? {sha} : {})
      })});
      if ([409, 422].includes(response.status)) continue;
      if (!response.ok) throw new Error('WRITE_' + response.status);
      return (await response.json()).content.sha;
    }
    throw new Error('WRITE_409');
  }
  async schedule() {
    const row = one(this.sql.exec("SELECT MIN(next_retry_at) AS value FROM archive_jobs WHERE status IN ('pending','writing')"));
    if (row?.value !== null && row?.value !== undefined) await this.ctx.storage.setAlarm(Math.max(Date.now() + 100, row.value));
    else await this.ctx.storage.deleteAlarm();
  }
  async alarm() {
    // Ein Writer serialisiert alle GitHub-Zugriffe; kein paralleles Überschreiben.
    const job = one(this.sql.exec(`SELECT * FROM archive_jobs WHERE status IN ('pending','writing') AND next_retry_at<=?
      ORDER BY target_path,revision LIMIT 1`, Date.now()));
    if (job) {
      this.sql.exec("UPDATE archive_jobs SET status='writing' WHERE target_path=? AND instance_id=? AND revision=?", job.target_path, job.instance_id, job.revision);
      try {
        const sha = await this.write(job);
        this.sql.exec("UPDATE archive_jobs SET status='written',github_sha=?,last_error_code=NULL WHERE target_path=? AND instance_id=? AND revision=?", sha, job.target_path, job.instance_id, job.revision);
      } catch (error) {
        const code = error.code === 'ARCHIVE_CONFIG' ? 'CONFIG' :
          /^(CONFIG|REPOSITORY_UNAVAILABLE|PUBLIC_REPOSITORY_NOT_ALLOWED|INSTANCE_CONFLICT|REVISION_CONFLICT|RATE_LIMIT|READ_\d+|WRITE_\d+)$/.test(error.message) ? error.message : 'NETWORK';
        const blocked = ['INSTANCE_CONFLICT', 'REVISION_CONFLICT'].includes(code);
        this.sql.exec(`UPDATE archive_jobs SET status=?,attempts=attempts+1,next_retry_at=?,last_error_code=?
          WHERE target_path=? AND instance_id=? AND revision=?`, blocked ? 'blocked' : 'pending',
          Math.max(Date.now() + Math.min(3600000, 900000 * 2 ** Math.min(job.attempts, 2)), error.retryAt || 0),
          code, job.target_path, job.instance_id, job.revision);
      }
    }
    await this.schedule();
  }
}

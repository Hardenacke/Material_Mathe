import {HttpError, slug} from './http.mjs';

const resultPath = /^ergebnisse\/(snapshots|perioden)\/[a-z0-9]+(?:-[a-z0-9]+)*\/v[1-9]\d*\/(?:gesamt|\d{4}-(?:0[1-9]|1[0-2]))\/(latest|final)\.json$/;
const invalid = () => { throw new HttpError(503, 'ARCHIVE_CONFIG', 'Archivkonfiguration oder Ergebnisdaten prüfen.'); };
const positive = value => Number.isSafeInteger(value) && value > 0;
const timestamp = value => Number.isSafeInteger(value) && value >= 0;

export function archivePaths(env, snapshot) {
  if ((env.ARCHIVE_PREFIX || 'ergebnisse') !== 'ergebnisse' || !snapshot ||
      snapshot.subject !== 'mathematik' || !slug(snapshot.competitionId) || !positive(snapshot.version) ||
      typeof snapshot.periodId !== 'string' || !/^(gesamt|\d{4}-(?:0[1-9]|1[0-2]))$/.test(snapshot.periodId) ||
      typeof snapshot.final !== 'boolean') invalid();
  const stem = `${snapshot.competitionId}/v${snapshot.version}/${snapshot.periodId}`;
  return [`ergebnisse/snapshots/${stem}/latest.json`,
    ...(snapshot.final ? [`ergebnisse/perioden/${stem}/final.json`] : [])];
}

// Auch alte Warteschlangenaufträge werden unmittelbar vor dem Schreiben gefiltert.
export function publicSnapshot(value) {
  archivePaths({}, value);
  if (typeof value.instanceId !== 'string' || !value.instanceId || value.instanceId.length > 128 ||
      !positive(value.revision) || !timestamp(value.generatedAt) || !Array.isArray(value.leaderboard)) invalid();
  return {
    subject: value.subject, competitionId: value.competitionId, version: value.version,
    periodId: value.periodId, instanceId: value.instanceId, revision: value.revision,
    final: value.final, generatedAt: value.generatedAt,
    leaderboard: value.leaderboard.map(({rank, alias, score, maxPoints, endedAt}) => {
      if (!positive(rank) || typeof alias !== 'string' || !alias.trim() || alias.length > 80 ||
          !timestamp(score) || !positive(maxPoints) || score > maxPoints || !timestamp(endedAt)) invalid();
      return {rank, alias, score, maxPoints, endedAt};
    })
  };
}

export function assertArchiveRequest(path, method = 'GET') {
  // Einzige Ausnahme: Repository-Metadaten lesen, um die Sichtbarkeit zu prüfen.
  if (path === '' && method === 'GET') return;
  if (typeof path === 'string' && ['GET', 'PUT'].includes(method)) {
    const [target, query, extra] = path.split('?');
    const match = target.startsWith('/contents/') && resultPath.exec(target.slice('/contents/'.length));
    const params = new URLSearchParams(query);
    if (match && (match[1] === 'snapshots' ? match[2] === 'latest' : match[2] === 'final') &&
        extra === undefined && (query === undefined ||
          (method === 'GET' && params.size === 1 && params.has('ref') &&
            query === 'ref=' + encodeURIComponent(params.get('ref')) && params.get('ref')))) return;
  }
  throw new HttpError(403, 'ARCHIVE_PATH', 'GitHub-Zugriff außerhalb der Ergebnisdateien ist gesperrt.');
}

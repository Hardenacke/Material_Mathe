import {test} from 'node:test';
import assert from 'node:assert/strict';
import {archivePaths, publicSnapshot, assertArchiveRequest} from '../src/archive-policy.mjs';

const snapshot = {
  subject: 'mathematik', competitionId: 'quadratische-funktionen', version: 1,
  periodId: 'gesamt', instanceId: 'test-instance', revision: 1, final: false, generatedAt: 1793124000000,
  leaderboard: [{rank: 1, alias: 'Parabel 01', score: 1000, maxPoints: 12000, endedAt: 1793124000000}]
};

test('Gesamt- und Monatsarchive liegen ausschließlich unter ergebnisse/', () => {
  assert.deepEqual(archivePaths({}, snapshot), ['ergebnisse/snapshots/quadratische-funktionen/v1/gesamt/latest.json']);
  assert.deepEqual(archivePaths({ARCHIVE_PREFIX: 'ergebnisse'}, {...snapshot, version: 2, periodId: '2026-10', final: true}), [
    'ergebnisse/snapshots/quadratische-funktionen/v2/2026-10/latest.json',
    'ergebnisse/perioden/quadratische-funktionen/v2/2026-10/final.json'
  ]);
  for (const prefix of ['architektur-v1', 'klasse-9', '../ergebnisse', 'ergebnisse/../werkzeuge'])
    assert.throws(() => archivePaths({ARCHIVE_PREFIX: prefix}, snapshot), {code: 'ARCHIVE_CONFIG'});
});

test('Ungültige Kennungen und Pfadmanipulationen werden vor dem Einreihen abgewiesen', () => {
  for (const fields of [
    {subject: 'physik'}, {competitionId: '../index.html'}, {competitionId: '%2e%2e'}, {competitionId: 'test\\..\\x'},
    {version: '../main'}, {version: 0}, {version: 1.5}, {version: Number.MAX_SAFE_INTEGER + 1},
    {periodId: '../../main'}, {periodId: '2026-00'}, {periodId: '2026-13'}, {periodId: ['gesamt']}, {final: 'true'}
  ]) assert.throws(() => archivePaths({}, {...snapshot, ...fields}), {code: 'ARCHIVE_CONFIG'});
});

test('Öffentliche Daten enthalten nur Raumkennung und Ranglistenfelder', () => {
  const value = publicSnapshot({...snapshot, code: 'secret-code', configHash: 'private-hash', questions: ['solution'],
    leaderboard: [{...snapshot.leaderboard[0], participantId: 'internal-person', codeHash: 'secret-hash', answer: 'solution'}]});
  assert.deepEqual(value, snapshot);
  for (const fields of [{instanceId: {}}, {revision: 0}, {generatedAt: null},
    {leaderboard: [{...snapshot.leaderboard[0], alias: {code: 'secret'}}]},
    {leaderboard: [{...snapshot.leaderboard[0], score: 13000}]}])
    assert.throws(() => publicSnapshot({...snapshot, ...fields}), {code: 'ARCHIVE_CONFIG'});
});

test('GitHub-Zugriffe erlauben nur Metadatenlesen und GET/PUT auf gültige Ergebnisdateien', () => {
  assert.doesNotThrow(() => assertArchiveRequest(''));
  for (const path of archivePaths({}, {...snapshot, final: true})) {
    assert.doesNotThrow(() => assertArchiveRequest('/contents/' + path));
    assert.doesNotThrow(() => assertArchiveRequest('/contents/' + path, 'PUT'));
    assert.doesNotThrow(() => assertArchiveRequest('/contents/' + path + '?ref=archiv%2Fmain'));
    for (const method of ['DELETE', 'POST', 'PATCH'])
      assert.throws(() => assertArchiveRequest('/contents/' + path, method), {code: 'ARCHIVE_PATH'});
    assert.throws(() => assertArchiveRequest('/contents/' + path + '?ref=main', 'PUT'), {code: 'ARCHIVE_PATH'});
  }
  for (const path of [
    '/contents/README.md', '/contents/.github/workflows/pages.yml', '/contents/werkzeuge/wettkampf_backend/wrangler.jsonc',
    '/contents/klasse-9/lernmaterial.json', '/contents/ergebnisse/README.md',
    '/contents/ergebnisse/../index.html', '/contents/ergebnisse/%2e%2e/index.html', '/contents/ergebnisse\\..\\index.html',
    '/contents/ergebnisse/snapshots/test/v1/gesamt/../../../index.html',
    '/contents/ergebnisse/snapshots/test/v1/gesamt/final.json', '/contents/ergebnisse/perioden/test/v1/gesamt/latest.json',
    '/contents/ergebnisse/snapshots/test/v1/2026-13/latest.json',
    '/contents/ergebnisse/snapshots/test/v1/gesamt/latest.json?ref=main&path=README.md',
    '/contents/ergebnisse/snapshots/test/v1/gesamt/latest.json?ref=main#fragment'
  ]) for (const method of ['GET', 'PUT']) assert.throws(() => assertArchiveRequest(path, method), {code: 'ARCHIVE_PATH'});
  assert.throws(() => assertArchiveRequest('', 'PUT'), {code: 'ARCHIVE_PATH'});
});

// Isolierte Vorschau: veröffentlicht keine Definitionen und verwendet keine Cloud-Zugänge.
import {createServer} from 'node:http';
import {readFile, stat, mkdir, writeFile} from 'node:fs/promises';
import {resolve, sep, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes, createHash} from 'node:crypto';
import {parseArgs} from 'node:util';
import {build} from 'esbuild';
import {Miniflare, convertV4MiniflareOptions} from 'miniflare';
const {values} = parseArgs({options: {site: {type: 'string'}, port: {type: 'string', default: '8000'}}});
if (!values.site) throw new Error('--site PFAD zur gebauten Materialseite erforderlich.');
const site = resolve(values.site), root = new URL('../', import.meta.url);
await stat(resolve(site, 'wettkaempfe/index.html'));
let apiOrigin;
const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg'};
const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {response.writeHead(405); response.end(); return;}
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (path === '/wettkaempfe/config.js') {
      response.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store'});
      response.end('export const config = ' + JSON.stringify({subject: 'mathematik', apiBaseUrl: apiOrigin, storageNamespace: 'material-mathematik-vorschau', pollingSeconds: 5}) + ';'); return;
    }
    let file = resolve(site, '.' + path);
    if (!file.startsWith(site + sep) && file !== site) throw new Error();
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const bytes = await readFile(file);
    response.writeHead(200, {'Content-Type': (types[extname(file)] || 'application/octet-stream') + (['.html', '.js', '.css', '.json'].includes(extname(file)) ? '; charset=utf-8' : '')});
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch {response.writeHead(404); response.end('Nicht gefunden');}
});
await new Promise(resolve => server.listen(Number(values.port), '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const definitions = (await import('../generated/definitions.mjs')).default;
const banks = definitions.banks.filter(bank => bank.demo), competitions = structuredClone(definitions.competitions.filter(c => c.groupId === 'klasse-9-demo' && banks.some(b => b.id === c.bank.id)));
for (const c of competitions) {
  c.status = 'published'; c.title += ' · Proberunde'; c.attempts.cooldownSeconds = 0;
  if (c.schedule.startsAt || c.schedule.endsAt) c.schedule = {startsAt: new Date(Date.now() - 60000).toISOString(), endsAt: new Date(Date.now() + 3600000).toISOString()};
}
if (!competitions.length) throw new Error('Demo-Definitionen fehlen.');
const bundled = await build({entryPoints: [fileURLToPath(new URL('src/worker.mjs', root))], bundle: true, write: false, format: 'esm', target: 'es2024', external: ['cloudflare:workers'], loader: {'.sql': 'text'},
  plugins: [{name: 'preview-definitions', setup(builder) {
    builder.onLoad({filter: /generated[\\/]definitions\.mjs$/}, () => ({contents: 'export default ' + JSON.stringify({banks, competitions}), loader: 'js'}));
  }}]});
const admin = randomBytes(32).toString('base64url');
const mf = new Miniflare(convertV4MiniflareOptions({name: 'mathe-wettkampf-vorschau', host: '127.0.0.1', port: 0,
  modules: true, script: bundled.outputFiles[0].text, compatibilityDate: '2026-10-27',
  bindings: {ADMIN_TOKEN: admin, ALLOWED_ORIGINS: origin},
  durableObjects: Object.fromEntries(['GroupAccess', 'RoomState', 'ArchiveWriter'].map(className => [
    {GroupAccess: 'GROUP_ACCESS', RoomState: 'ROOM_STATE', ArchiveWriter: 'ARCHIVE_WRITER'}[className], {className, useSQLite: true}
  ]))
}));
apiOrigin = (await mf.ready).origin;
const participants = [], rows = ['Gruppe;Pseudonym;Code'];
for (let i = 1; i <= 2; i++) {
  const code = randomBytes(32).toString('base64url'), alias = 'Proberunde ' + i;
  participants.push({id: 'demo-' + i, alias, codeHash: createHash('sha256').update(code).digest('hex'), enabled: true, competitions: competitions.map(c => c.id)});
  rows.push(`klasse-9-demo;${alias};${code}`);
}
const imported = await mf.dispatchFetch(apiOrigin + '/admin/v1/groups/klasse-9-demo/participants', {method: 'POST',
  headers: {'Authorization': 'Bearer ' + admin, 'Content-Type': 'application/json'}, body: JSON.stringify({participants})});
if (!imported.ok) throw new Error('Demo-Zugänge konnten nicht angelegt werden.');
await mkdir(new URL('verwaltung/', root), {recursive: true});
const codesFile = fileURLToPath(new URL('verwaltung/vorschau-codes.csv', root));
await writeFile(codesFile, '\ufeff' + rows.join('\r\n'), {mode: 0o600});
console.log(JSON.stringify({portalUrl: origin + '/wettkaempfe/index.html', codesFile, isolated: true}));
let closing = false;
async function close() {if (closing) return; closing = true; server.close(); await mf.dispose(); process.exit(0);}
process.on('SIGINT', close); process.on('SIGTERM', close);

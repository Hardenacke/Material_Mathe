import {randomBytes, randomUUID, createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {parseArgs} from 'node:util';
import {slug} from '../src/http.mjs';
const {positionals, values} = parseArgs({allowPositionals: true, options: {
  gruppe: {type: 'string'}, anzahl: {type: 'string'}, wettkaempfe: {type: 'string'},
  datei: {type: 'string'}, api: {type: 'string'}, id: {type: 'string'}
}});
const root = new URL('../', import.meta.url), command = positionals[0];
function requireValue(condition, message) { if (!condition) throw new Error(message); }
if (command === 'erzeugen') {
  const count = Number(values.anzahl), group = values.gruppe, competitions = values.wettkaempfe?.split(',');
  requireValue(slug(group) && Number.isInteger(count) && count >= 1 && count <= 30 && competitions?.length && competitions.every(slug),
    '--gruppe, --anzahl (1–30), --wettkaempfe ID,ID erforderlich.');
  await mkdir(new URL('verwaltung/', root), {recursive: true});
  const people = [], rows = ['Gruppe;Pseudonym;Code'];
  for (let index = 1; index <= count; index++) {
    const code = randomBytes(32).toString('base64url'), alias = 'Mathe ' + String(index).padStart(2, '0');
    people.push({id: 'p-' + randomUUID(), alias, codeHash: createHash('sha256').update(code).digest('hex'), enabled: true, competitions});
    rows.push(`${group};${alias};${code}`);
  }
  const prefix = `verwaltung/${group}-${Date.now()}`;
  await writeFile(new URL(prefix + '.json', root), JSON.stringify({participants: people}, null, 2), {flag: 'wx', mode: 0o600});
  await writeFile(new URL(prefix + '-codes.csv', root), '\ufeff' + rows.join('\r\n'), {flag: 'wx', mode: 0o600});
  console.log(`Erzeugt: ${prefix}.json und ${prefix}-codes.csv. Klartextcodes bleiben ausschließlich in der privaten CSV.`);
} else if (['importieren', 'sperren', 'entsperren', 'codewechsel'].includes(command)) {
  requireValue(values.datei, '--datei mit privater Zugangsliste erforderlich.');
  const data = JSON.parse(await readFile(values.datei, 'utf8'));
  if (command !== 'importieren') {
    const person = data.participants.find(person => person.id === values.id);
    requireValue(person, '--id wurde nicht gefunden.');
    if (command === 'codewechsel') {
      const code = randomBytes(32).toString('base64url');
      person.codeHash = createHash('sha256').update(code).digest('hex');
      const file = `verwaltung/codewechsel-${Date.now()}.csv`;
      await writeFile(new URL(file, root), '\ufeffPseudonym;Code\r\n' + person.alias.replace(/[;\r\n]/g, ' ') + ';' + code, {flag: 'wx', mode: 0o600});
      console.log('Neuer Code in ' + file);
    } else person.enabled = command === 'entsperren';
    await writeFile(values.datei, JSON.stringify(data, null, 2), {mode: 0o600});
    console.log('Private Liste aktualisiert. Mit importieren auf dem Server anwenden.');
  } else {
    requireValue(slug(values.gruppe) && values.api && process.env.WETTKAMPF_ADMIN_TOKEN, '--gruppe, --api und Umgebungsvariable WETTKAMPF_ADMIN_TOKEN erforderlich.');
    const api = new URL(values.api);
    requireValue(api.protocol === 'https:' || (api.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(api.hostname)), 'HTTPS für den Verwaltungszugang erforderlich.');
    for (let index = 0; index < data.participants.length; index += 30) {
      const response = await fetch(new URL(`/admin/v1/groups/${values.gruppe}/participants`, api), {
        method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.WETTKAMPF_ADMIN_TOKEN},
        body: JSON.stringify({participants: data.participants.slice(index, index + 30)})
      });
      requireValue(response.ok, 'Import abgewiesen: HTTP ' + response.status);
    }
    console.log('Zugänge importiert: ' + data.participants.length);
  }
} else throw new Error('Befehl: erzeugen, importieren, sperren, entsperren oder codewechsel.');

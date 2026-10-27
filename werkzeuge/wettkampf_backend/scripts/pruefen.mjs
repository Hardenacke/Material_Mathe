import {readFile, readdir, access} from 'node:fs/promises';
import {validateConfig, validateBank} from '../src/vertrag.mjs';
const root = new URL('../', import.meta.url);
const load = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const banks = [], configs = [], seen = new Set();
for (const file of (await readdir(new URL('fragenpools/', root))).filter(file => file.endsWith('.json'))) {
  const bank = await load('fragenpools/' + file); validateBank(bank);
  const key = `${bank.id}/v${bank.version}`;
  if (seen.has(key)) throw new Error('Doppelter Fragenpool: ' + key);
  seen.add(key); banks.push(bank);
  for (const q of bank.questions) if (q.figure)
    await access(new URL('vorlage/public-vorlage/wettkaempfe/' + q.figure.src, root));
  if (bank.demo) console.log('Demo-Pool: ' + bank.id + ' – für regelmäßige Wertungen erweitern.');
}
seen.clear();
for (const file of (await readdir(new URL('wettkaempfe/', root))).filter(file => file.endsWith('.json'))) {
  const config = await load('wettkaempfe/' + file);
  validateConfig(config, banks.find(bank => bank.id === config.bank.id && bank.version === config.bank.version));
  const key = `${config.id}/v${config.version}`;
  if (seen.has(key)) throw new Error('Doppelte Wettbewerbsversion: ' + key);
  seen.add(key); configs.push(config);
  console.log(`${key}: ${config.status}`);
}
if (!configs.length) throw new Error('Keine Wettbewerbsdefinitionen vorhanden.');
console.log('Konfiguration und Bildpfade sind gültig.');

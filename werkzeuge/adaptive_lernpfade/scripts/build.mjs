import {readFile, writeFile, mkdir} from 'node:fs/promises';
const read = file => readFile(new URL('../'+file, import.meta.url),'utf8');
let html = await read('src/page.html');
const core = (await read('src/domain.mjs')).replace(/^export /gm, '');
const config = JSON.parse(await read('config.public.json'));
for (const key of Object.keys(config)) if (!['workerBase','title','allowLocalDemo'].includes(key)) throw new Error('Nicht erlaubtes öffentliches Konfigurationsfeld: '+key);
// Text innerhalb eines Script-Tags darf dessen Ende nicht einschleusen.
const configText = JSON.stringify(config).replaceAll('<', String.fromCharCode(92)+'u003c');
const appSource = await read('src/app.js');
html = html.replace('/*__DOMAIN__*/', () => core).replace('/*__CONFIG__*/', () => configText).replace('/*__APP__*/', () => appSource);
const output = new URL('../../../gemeinsam/adaptive-lernpfade/', import.meta.url);
await mkdir(output, {recursive:true});
await writeFile(new URL('index.html', output), html);
console.log('Erstellt: gemeinsam/adaptive-lernpfade/index.html');

const adminSource = await read('src/admin.js');
let admin = await read('src/admin.html');
admin = admin.replace('/*__CONFIG__*/', () => configText).replace('/*__ADMIN__*/', () => adminSource);
await writeFile(new URL('admin.html', output), admin);
console.log('Erstellt: gemeinsam/adaptive-lernpfade/admin.html');

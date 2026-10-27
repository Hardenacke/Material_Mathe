import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
await mkdir(new URL('generated/', root), {recursive: true});
const result = {};
for (const [key, directory] of [['banks', 'fragenpools'], ['competitions', 'wettkaempfe']]) {
  result[key] = [];
  for (const file of (await readdir(new URL(directory + '/', root))).filter(file => file.endsWith('.json')).sort())
    result[key].push(JSON.parse(await readFile(new URL(directory + '/' + file, root), 'utf8')));
}
await writeFile(new URL('generated/definitions.mjs', root), 'export default ' + JSON.stringify(result) + ';\n');
console.log('Private Worker-Definitionen gebündelt.');

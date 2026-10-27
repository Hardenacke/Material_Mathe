export class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export function json(value, status = 200) {
  return new Response(JSON.stringify(value), {status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'
  }});
}
export function errorResponse(error) {
  const known = error instanceof HttpError;
  return json({error: {code: known ? error.code : 'UNAVAILABLE',
    message: known ? error.message : 'Der Wettbewerb ist vorübergehend nicht erreichbar.'}}, known ? error.status : 503);
}
export function exact(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key)))
    throw new HttpError(400, 'FIELDS', 'Die übermittelten Felder sind ungültig.');
}
export const slug = value => typeof value === 'string' && value.length <= 64 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export async function readJSON(request) {
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json')
    throw new HttpError(415, 'CONTENT_TYPE', 'JSON erforderlich.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'JSON', 'JSON fehlt.');
  const chunks = []; let length = 0;
  while (true) {
    const {value, done} = await reader.read(); if (done) break;
    length += value.byteLength;
    if (length > 16384) { await reader.cancel(); throw new HttpError(413, 'SIZE', 'Nachricht zu groß.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes)); }
  catch { throw new HttpError(400, 'JSON', 'Ungültiges JSON.'); }
}
export async function sha256(value) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export async function equalSecret(a, b) {
  if (!a || !b) return false;
  const left = await sha256(a), right = await sha256(b); let different = 0;
  for (let i = 0; i < left.length; i++) different |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return different === 0;
}
export function bearer(request) {
  const value = request.headers.get('Authorization') || '';
  return /^Bearer [A-Za-z0-9_-]{32,128}$/.test(value) ? value.slice(7) : '';
}
export async function call(binding, name, value) {
  return binding.get(binding.idFromName(name)).fetch(new Request('https://internal/action', {
    method: 'POST', body: JSON.stringify(value), headers: {'Content-Type': 'application/json'}
  }));
}

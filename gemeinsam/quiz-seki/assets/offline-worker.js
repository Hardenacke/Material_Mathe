// Each registration is scoped to one quiz or to the shared overview.
const scope = self.registration.scope;
const CACHE_NAME = 'mathe-quest-seki-v1:' + scope;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll([
    new URL('index.html', scope).href,
    new URL('manifest.webmanifest', scope).href,
  ])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('message', event => {
  if (event.data?.type !== 'CACHE_URLS' || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.filter(raw => {
    try {
      const url = new URL(raw, scope);
      return url.origin === self.location.origin && !url.pathname.startsWith('/api/');
    } catch { return false; }
  });
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urls)));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  // Online competitions, status and leaderboards must never be cached.
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;
      return new Response('Diese Seite ist offline noch nicht verfügbar. Öffne sie einmal mit Internetverbindung.', {
        status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'},
      });
    }
  })());
});

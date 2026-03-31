// Versão v3 — não faz cache de JS/TS/HTML para evitar problemas com Vite HMR
const CACHE_NAME = 'getsales4now-v3';
const STATIC_ASSETS = [
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nunca fazer cache de: API, arquivos JS/TS (Vite HMR), HTML, raiz
  if (
    event.request.method !== 'GET' ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('/@') ||
    url.pathname.includes('/src/') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/'
  ) {
    return; // Deixa o browser buscar normalmente
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return response;
      }).catch(() => new Response('', { status: 404 }));
    })
  );
});

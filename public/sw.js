const CACHE_NAME = 'rock-wave-app-v3';
const APP_SHELL = [
  '/manifest.webmanifest',
  '/icons/rock-wave.svg',
  '/images/weblines-school.jpg',
  '/images/rockcbt-platform.png',
  '/images/harvest-field-mission.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const shellResponse = await fetch('/');
    if (!shellResponse.ok) {
      throw new Error(`Unable to cache the app shell: ${shellResponse.status}`);
    }

    const html = await shellResponse.clone().text();
    await cache.put('/', shellResponse);

    const stylesheetUrls = Array.from(
      html.matchAll(/<link[^>]+href=["']([^"']+\.css(?:\?[^"']*)?)["']/g),
      (match) => match[1],
    );
    const assets = [...APP_SHELL, ...stylesheetUrls];
    await Promise.all(assets.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Unable to cache app asset ${url}: ${response.status}`);
      }
      await cache.put(url, response);
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
        }
        return response;
      }).catch(() => caches.match('/')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});

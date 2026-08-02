/* Replyly — basic offline shell */
const CACHE = 'replyly-shell-v1';
const SHELL = [
  '/',
  '/index.html',
  '/app',
  '/app.html',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL).catch(function () {
        // Partial cache is fine if a path 404s during local file open
        return Promise.all(
          SHELL.map(function (url) {
            return cache.add(url).catch(function () {});
          })
        );
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(function (cached) {
      const network = fetch(req).then(function (res) {
        if (res && res.ok && (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '/app' || url.pathname.endsWith('.js') || url.pathname.endsWith('.webmanifest') || url.pathname.startsWith('/icons/'))) {
          const copy = res.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(req, copy);
          });
        }
        return res;
      }).catch(function () {
        return cached || caches.match('/app.html') || caches.match('/index.html');
      });
      return cached || network;
    })
  );
});

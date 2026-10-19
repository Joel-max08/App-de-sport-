const CACHE = 'kinetra-v48';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './badge-96.png', './firebase-config.js', './bonhomme.js', './programs.js', './i18n.js', './pickers.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Met en cache l'app et les scripts Firebase (gstatic) ; ne touche pas aux appels API (auth, firestore).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const ok = url.origin === self.location.origin || url.hostname === 'www.gstatic.com';
  if (!ok) return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => {
        if (r && r.ok) c.put(req, r.clone());
        return r;
      }).catch(() => null);
      return hit || (await net) || c.match('./index.html');
    })
  );
});

// Clic sur une notification : ouvre ou ramène l'app au premier plan
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow('./');
    })
  );
});

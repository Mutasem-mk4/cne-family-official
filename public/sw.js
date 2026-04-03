const CACHE_NAME = 'cne-family-v5'; // Final Elite Redesign & Visibility Logic
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/wow-styles.css',
  '/wow-scripts.js',
  '/manifest.json',
];

const DATA_ASSETS = [
  '/data/subjects.json',
  '/data/curriculum.json',
  '/data/activities.json',
];

const IMAGE_ASSETS = [
  '/computer-plan.webp',
  '/networking-plan.webp',
];

// Pre-cache everything on install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching assets');
      return cache.addAll([...STATIC_ASSETS, ...DATA_ASSETS, ...IMAGE_ASSETS]);
    })
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Data files: Network-first, fast cache fallback (< 2s timeout)
  if (DATA_ASSETS.some(p => url.pathname === p)) {
    e.respondWith(
      Promise.race([
        fetch(e.request).then(res => {
          if (res.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, res.clone()));
          }
          return res;
        }),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000)),
      ]).catch(() => caches.match(e.request))
    );
    return;
  }

  // Static assets + images: Stale-While-Revalidate
  e.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    )
  );
});

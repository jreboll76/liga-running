const CACHE_NAME = 'running-castello-v3';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './aRCHIVOS/logo-club.png',
    'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching Assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((res) => {
                // Make copy/clone of response
                const resClone = res.clone();
                // Open cache
                caches.open(CACHE_NAME).then((cache) => {
                    // Add response to cache
                    cache.put(event.request, resClone);
                });
                return res;
            })
            .catch(() => caches.match(event.request).then((res) => res))
    );
});

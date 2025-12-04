const CACHE_NAME = 'math-puzzle-v2.1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json'
];

// Install event - yeni cache oluştur
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching files...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // Eski cache'leri hemen temizle
                return self.skipWaiting();
            })
    );
});

// Activate event - eski cache'leri temizle
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Tüm client'lara kontrolü al
            return self.clients.claim();
        })
    );
});

// Fetch event - Network first stratejisi (güncel içerik için)
self.addEventListener('fetch', event => {
    // Sadece GET istekleri için cache kullan
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Başarılı fetch - cache'e kaydet
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                return response;
            })
            .catch(() => {
                // Network hatası - cache'den getir
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        // Cache'de de yoksa fallback
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

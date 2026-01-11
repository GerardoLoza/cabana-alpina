const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `cabana-alpina-${CACHE_VERSION}`;

const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/images/logo.svg',
    '/images/banner.avif',
    '/images/banner_mobile.avif',
    '/images/footer.avif',
    '/images/footer_mobile.avif'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando recursos críticos');
                return cache.addAll(CRITICAL_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('cabana-alpina-') && name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Eliminando cache antigua:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.origin !== location.origin) return;

    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clonedResponse));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then(response => {
                    if (response.status === 200) {
                        const clonedResponse = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clonedResponse));
                    }
                    return response;
                });
            })
    );
});

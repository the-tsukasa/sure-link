const CACHE_NAME = "surelink-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/css/style.css",
    "/js/app.js",
    "/manifest.json"
];

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(resp => resp || fetch(e.request))
    );
});

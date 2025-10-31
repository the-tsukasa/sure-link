// ========== sw.js ==========
const CACHE_NAME = "surelink-v3"; // ← 每次更新时改版本号

const URLS_TO_CACHE = [
    "/",
    "/index.html",
    "/css/style.css",
    "/css/pwa-guide.css",
    "/js/app.js",
    "/manifest.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png"
];

// ===== 安装阶段：缓存文件 =====
self.addEventListener("install", (event) => {
    console.log("[SW] install");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
    );
    self.skipWaiting(); // 立即启用新 SW
});

// ===== 激活阶段：清除旧缓存 =====
self.addEventListener("activate", (event) => {
    console.log("[SW] activate");
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim(); // 立即接管页面
});

// ===== 请求拦截：网络优先 =====
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

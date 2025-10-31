// ========== sw.js ==========
const CACHE_NAME = "surelink-v17"; // ← 每次更新时改版本号 (2.4.2 - 修复图标类名兼容性)

const URLS_TO_CACHE = [
    "/",
    "/index.html",
    "/welcome.html",
    "/nickname.html",
    "/loading.html",
    "/chat.html",
    "/map.html",
    "/profile.html",
    
    // CSS 文件
    "/css/style.css",
    "/css/welcome.css",
    "/css/chat.css",
    "/css/map.css",
    "/css/profile.css",
    "/css/pwa-guide.css",
    
    // JavaScript 文件
    "/js/app.js",
    "/js/welcome.js",
    "/js/chat.js",
    "/js/map.js",
    "/js/profile.js",
    
    // 图标和配置
    "/manifest.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/maskable-icon.png"
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

// ===== 请求拦截：智能缓存策略 =====
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 跳过非 HTTP(S) 请求
    if (!url.protocol.startsWith('http')) return;
    
    // Socket.io 请求不缓存
    if (url.pathname.includes('/socket.io/')) return;
    
    // 导航请求（页面加载）- 网络优先，失败时使用缓存
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // 缓存成功的页面响应
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => {
                    // 网络失败时使用缓存
                    return caches.match(request)
                        .then(cached => cached || caches.match('/index.html'));
                })
        );
        return;
    }
    
    // 静态资源 (CSS, JS, 图片) - 缓存优先
    if (request.destination === 'style' || 
        request.destination === 'script' || 
        request.destination === 'image') {
        event.respondWith(
            caches.match(request)
                .then(cached => {
                    if (cached) return cached;
                    
                    return fetch(request).then(response => {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                        return response;
                    });
                })
        );
        return;
    }
    
    // 其他请求 - 网络优先
    event.respondWith(
        fetch(request)
            .then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                return response;
            })
            .catch(() => caches.match(request))
    );
});

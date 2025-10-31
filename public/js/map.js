const socket = io();
let map, userMarker;
let others = {};
let labels = {}; // 储存昵称标签
let watchId = null;
let nickname = "あなた"; // 用户昵称

// ========== 初始化地图 ==========
function initMap(lat = 35.6812, lng = 139.7671) {
    map = L.map("map").setView([lat, lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
    }).addTo(map);

    userMarker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: "#007aff",
        color: "#007aff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.6,
    }).addTo(map);

    // 等待 socket 连接后使用 socket.id
    if (socket.connected) {
        addLabel(socket.id, nickname, [lat, lng]);
    } else {
        socket.on('connect', () => {
            addLabel(socket.id, nickname, [lat, lng]);
        });
    }
}

// ========== 添加昵称标签 ==========
function addLabel(id, name, position) {
    const label = L.divIcon({
        className: "name-label",
        html: `<div class="label-box">${name}</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, 30],
    });
    labels[id] = L.marker(position, { icon: label }).addTo(map);
}

// ========== 更新昵称标签位置 ==========
function updateLabel(id, position, name) {
    if (labels[id]) {
        labels[id].setLatLng(position);
    } else {
        addLabel(id, name, position);
    }
}

// ========== 删除昵称标签 ==========
function removeLabel(id) {
    if (labels[id]) {
        map.removeLayer(labels[id]);
        delete labels[id];
    }
}

// ========== 启动位置追踪 ==========
function startTracking() {
    if (!navigator.geolocation) {
        showToast("位置情報サービスが利用できません。");
        return;
    }

    watchId = navigator.geolocation.watchPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            socket.emit("updateLocation", { 
                lat: latitude, 
                lng: longitude,
                nickname: nickname  // 发送昵称到服务器
            });
            userMarker.setLatLng([latitude, longitude]);
            updateLabel(socket.id, [latitude, longitude], nickname);
            map.setView([latitude, longitude]);
        },
        () => showToast("現在地の取得に失敗しました。"),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
}

// ========== 手动刷新 ==========
function manualScan() {
    const btn = document.getElementById("scanBtn");
    btn.style.transform = "rotate(360deg)";
    btn.style.transition = "transform 0.6s ease";
    setTimeout(() => (btn.style.transform = "rotate(0deg)"), 600);

    showToast("周囲をスキャン中…");
    updateLocationOnce();
}

function updateLocationOnce() {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            socket.emit("updateLocation", { 
                lat: latitude, 
                lng: longitude,
                nickname: nickname  // 发送昵称
            });
            userMarker.setLatLng([latitude, longitude]);
            updateLabel(socket.id, [latitude, longitude], nickname);
            map.setView([latitude, longitude]);
        },
        () => showToast("位置を取得できません。"),
        { enableHighAccuracy: true }
    );
}

// ========== 接收服务器广播 ==========
socket.on("updateUsers", (users) => {
    for (const [id, u] of Object.entries(users)) {
        if (!u || id === socket.id) continue;

        const name = u.nickname || `User-${id.slice(0, 4)}`;
        if (!others[id]) {
            others[id] = L.circleMarker([u.lat, u.lng], {
                radius: 8,
                fillColor: "#34c759",
                color: "#34c759",
                weight: 2,
                fillOpacity: 0.5,
            }).addTo(map);
        } else {
            others[id].setLatLng([u.lat, u.lng]);
        }
        updateLabel(id, [u.lat, u.lng], name);
    }

    // 删除离线用户
    for (const id in others) {
        if (!users[id]) {
            map.removeLayer(others[id]);
            delete others[id];
            removeLabel(id);
        }
    }
});

// ========== すれ違い通知 ==========
socket.on("encounter", (data) => {
    showToast(`👋 ${data.user.slice(0, 5)} さんとすれ違いました`);
    navigator.vibrate?.(30);
});

// ========== Toast 通知 ==========
let toastTimer = null;
function showToast(text) {
    const toast = document.getElementById("toast");
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// ========== 初始化 ==========
document.addEventListener("DOMContentLoaded", () => {
    // 获取用户昵称
    nickname = localStorage.getItem("nickname") || "あなた";
    
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            initMap(latitude, longitude);
            startTracking();
        },
        () => {
            initMap();
            showToast("デフォルト位置（東京駅）で表示中");
            startTracking();
        }
    );

    document.getElementById("scanBtn").addEventListener("click", manualScan);
});

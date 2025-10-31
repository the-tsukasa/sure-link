// 使用全局配置
const config = window.SureLinkConfig || { serverUrl: 'http://localhost:3000' };
console.log('📡 Map connecting to:', config.serverUrl);
const socket = io(config.serverUrl);
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

// ========== Toast 通知 ==========
let toastTimer = null;
function showToast(text) {
    const toast = document.getElementById("toast");
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// ========== APP风格功能 ==========
let isTracking = false;
let nearbyUsers = [];
let todayEncountersCount = 0;

// 显示附近用户列表
window.showNearbyUsers = function() {
    const panel = document.getElementById('nearbyUsersPanel');
    panel.classList.add('show');
    updateNearbyUsersList();
};

// 隐藏附近用户列表
window.hideNearbyUsers = function() {
    const panel = document.getElementById('nearbyUsersPanel');
    panel.classList.remove('show');
};

// 更新附近用户列表
function updateNearbyUsersList() {
    const nearbyList = document.getElementById('nearbyList');
    
    if (Object.keys(others).length === 0) {
        nearbyList.innerHTML = `
            <div class="empty-nearby">
                <i class="fas fa-user-slash"></i>
                <p>付近にユーザーがいません</p>
            </div>
        `;
        return;
    }
    
    nearbyList.innerHTML = '';
    for (const [id, marker] of Object.entries(others)) {
        const name = labels[id] ? labels[id].options.icon.options.html.match(/>(.+)</)[1] : 'Unknown';
        const distance = Math.floor(Math.random() * 500) + 50; // 虚拟距离
        
        const item = document.createElement('div');
        item.className = 'nearby-user-item';
        item.innerHTML = `
            <div class="nearby-user-avatar">${name.charAt(0)}</div>
            <div class="nearby-user-info">
                <div class="nearby-user-name">${name}</div>
                <div class="nearby-user-distance">
                    <i class="fas fa-location-dot"></i>
                    ${distance}m
                </div>
            </div>
        `;
        nearbyList.appendChild(item);
    }
    
    // 更新徽章计数
    document.getElementById('nearbyCount').textContent = Object.keys(others).length;
}

// 切换地图设置面板
window.toggleMapSettings = function() {
    const panel = document.getElementById('mapSettingsPanel');
    if (panel.classList.contains('show')) {
        hideMapSettings();
    } else {
        panel.classList.add('show');
    }
};

// 隐藏地图设置面板
window.hideMapSettings = function() {
    const panel = document.getElementById('mapSettingsPanel');
    panel.classList.remove('show');
};

// 回到当前位置
window.centerMap = function() {
    if (userMarker) {
        const pos = userMarker.getLatLng();
        map.setView(pos, 15);
        showToast('現在地に移動しました');
    }
};

// 切换追踪模式
window.toggleTracking = function() {
    isTracking = !isTracking;
    const autoTrackingCheckbox = document.getElementById('autoTracking');
    if (autoTrackingCheckbox) {
        autoTrackingCheckbox.checked = isTracking;
    }
    
    if (isTracking) {
        startTracking();
        showToast('自動追跡を開始しました');
    } else {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        showToast('自動追跡を停止しました');
    }
};

// 查看遭遇历史
window.viewEncounterHistory = function() {
    window.location.href = 'profile.html';
};

// 关闭遭遇通知
window.closeEncounterNotification = function() {
    const notification = document.getElementById('encounterNotification');
    notification.style.display = 'none';
};

// 显示遭遇通知
function showEncounterNotification(userName, distance) {
    const notification = document.getElementById('encounterNotification');
    document.getElementById('encounterUserName').textContent = userName;
    document.getElementById('encounterDistance').textContent = `${Math.round(distance)}m`;
    
    notification.style.display = 'block';
    
    // 3秒后自动关闭
    setTimeout(() => {
        closeEncounterNotification();
    }, 3000);
}

// 前往详细统计页面
window.goToEncounterPage = function() {
    window.location.href = 'encounter.html';
};

// 更新位置状态
function updateLocationStatus(status, isGood = true) {
    const statusEl = document.getElementById('locationStatus');
    if (statusEl) {
        statusEl.textContent = status;
        const dot = statusEl.previousElementSibling;
        if (dot) {
            dot.style.color = isGood ? '#34c759' : '#ff9500';
        }
    }
}

// 更新统计数据
function updateStats() {
    // 更新在线用户数
    const onlineCount = Object.keys(others).length + 1;
    const onlineEl = document.getElementById('onlineUsersCount');
    if (onlineEl) onlineEl.textContent = onlineCount;
    
    // 更新今日遭遇数
    const todayEl = document.getElementById('todayEncounters');
    if (todayEl) todayEl.textContent = todayEncountersCount;
    
    // 更新精度等级
    const accuracyEl = document.getElementById('accuracyLevel');
    if (accuracyEl) accuracyEl.textContent = '高';
}

// 点击外部关闭面板
document.addEventListener('click', (e) => {
    const nearbyPanel = document.getElementById('nearbyUsersPanel');
    const settingsPanel = document.getElementById('mapSettingsPanel');
    
    if (nearbyPanel && nearbyPanel.classList.contains('show') && 
        !nearbyPanel.contains(e.target) && 
        !e.target.closest('.icon-btn')) {
        hideNearbyUsers();
    }
    
    if (settingsPanel && settingsPanel.classList.contains('show') && 
        !settingsPanel.contains(e.target) && 
        !e.target.closest('.icon-btn')) {
        hideMapSettings();
    }
});

// ========== 初始化 ==========
document.addEventListener("DOMContentLoaded", () => {
    // 获取用户昵称
    nickname = localStorage.getItem("nickname") || "あなた";
    
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            initMap(latitude, longitude);
            startTracking();
            updateLocationStatus('位置情報取得成功', true);
        },
        () => {
            initMap();
            showToast("デフォルト位置（東京駅）で表示中");
            startTracking();
            updateLocationStatus('デフォルト位置', false);
        }
    );

    document.getElementById("scanBtn").addEventListener("click", manualScan);
    
    // 定期更新统计数据
    setInterval(updateStats, 2000);
    updateStats();
});

// 更新socket事件处理
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
    
    // 更新附近用户列表
    updateNearbyUsersList();
});

// 更新遭遇通知处理
socket.on("encounter", (data) => {
    const userName = data.user || 'Unknown';
    const distance = data.distance || 50;
    
    todayEncountersCount++;
    showToast(`👋 ${userName.slice(0, 8)} さんとすれ違いました`);
    showEncounterNotification(userName, distance);
    navigator.vibrate?.(30);
    
    updateStats();
});

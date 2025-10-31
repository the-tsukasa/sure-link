// public/js/encounter-main.js
// Sure Link - 遭遇系统主逻辑

class EncounterSystem {
    constructor() {
        this.socket = io();
        this.nickname = localStorage.getItem('nickname') || 'ゲスト';
        this.encounters = this.loadEncounters() || [];
        this.achievements = this.loadAchievements();
        this.map = null;
        this.userMarker = null;
        this.watchId = null;
        this.heatmapLayer = null;
        this.encounterMarkers = [];
        
        this.init();
    }

    init() {
        console.log('🚀 遭遇系统初始化...');
        this.setupSocketListeners();
        this.setupUIListeners();
        this.initMap();
        this.updateUI();
        this.startLocationTracking();
    }

    // ===== Socket 事件监听 =====
    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('✅ 已连接到服务器');
            document.getElementById('scanStatus').textContent = 'スキャン中...';
        });

        this.socket.on('disconnect', () => {
            console.log('❌ 与服务器断开');
            document.getElementById('scanStatus').textContent = '接続切断';
        });

        // 遭遇通知
        this.socket.on('encounter', (data) => {
            console.log('👋 遭遇检测:', data);
            this.handleNewEncounter(data);
        });

        // 在线用户更新
        this.socket.on('onlineCount', (count) => {
            document.getElementById('nearbyCount').textContent = count;
        });

        // 用户位置更新
        this.socket.on('updateUsers', (users) => {
            this.updateMapMarkers(users);
        });
    }

    // ===== UI 事件监听 =====
    setupUIListeners() {
        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshScan();
        });

        // 回到中心
        document.getElementById('centerBtn').addEventListener('click', () => {
            if (this.userMarker && this.map) {
                this.map.setView(this.userMarker.getLatLng(), 15);
            }
        });

        // 热力图切换
        document.getElementById('heatmapBtn').addEventListener('click', () => {
            this.toggleHeatmap();
        });

        // 模态框关闭
        window.closeEncounterModal = () => {
            document.getElementById('encounterModal').classList.remove('show');
        };
    }

    // ===== 地图初始化 =====
    initMap() {
        this.map = L.map('encounterMap').setView([35.6812, 139.7671], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        // 用户标记
        this.userMarker = L.circleMarker([35.6812, 139.7671], {
            radius: 12,
            fillColor: '#667eea',
            color: '#667eea',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.7,
        }).addTo(this.map);

        this.userMarker.bindPopup(`<b>${this.nickname}</b><br>あなたの現在地`);
    }

    // ===== 位置追踪 =====
    startLocationTracking() {
        if (!navigator.geolocation) {
            console.error('位置情報サービスが利用できません');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.updateLocation(latitude, longitude);
            },
            (error) => {
                console.error('位置情報の取得に失敗:', error);
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
    }

    updateLocation(lat, lng) {
        // 更新地图标记
        this.userMarker.setLatLng([lat, lng]);
        this.map.setView([lat, lng]);

        // 发送到服务器
        this.socket.emit('updateLocation', {
            lat,
            lng,
            nickname: this.nickname
        });
    }

    // ===== 处理新遭遇 =====
    handleNewEncounter(data) {
        // 1. 添加到本地记录
        const encounter = {
            user: data.user,
            distance: data.distance,
            timestamp: Date.now(),
            location: data.location
        };
        
        this.encounters.unshift(encounter);
        this.saveEncounters();

        // 2. 播放音效（如果有）
        this.playEncounterSound();

        // 3. 震动
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }

        // 4. 显示模态框
        this.showEncounterModal(encounter);

        // 5. 在地图上标记
        this.markEncounterOnMap(encounter);

        // 6. 更新UI
        this.updateUI();

        // 7. 检查成就
        this.checkAchievements();
    }

    // ===== 显示遭遇模态框 =====
    showEncounterModal(encounter) {
        const modal = document.getElementById('encounterModal');
        const details = document.getElementById('encounterDetails');

        details.innerHTML = `
            <p><strong>${encounter.user}</strong> さんとすれ違いました！</p>
            <p>距離: <strong>${Math.round(encounter.distance)}m</strong></p>
            <p>時刻: ${new Date(encounter.timestamp).toLocaleTimeString('ja-JP')}</p>
        `;

        modal.classList.add('show');

        // 3秒后自动关闭
        setTimeout(() => {
            modal.classList.remove('show');
        }, 3000);
    }

    // ===== 在地图上标记遭遇 =====
    markEncounterOnMap(encounter) {
        if (!encounter.location) return;

        const marker = L.circleMarker([encounter.location.lat, encounter.location.lng], {
            radius: 15,
            fillColor: '#ef4444',
            color: '#ef4444',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.3,
        }).addTo(this.map);

        marker.bindPopup(`
            <div class="encounter-popup">
                <strong>👋 すれ違い</strong><br>
                ${encounter.user}<br>
                ${Math.round(encounter.distance)}m
            </div>
        `).openPopup();

        this.encounterMarkers.push(marker);

        // 10秒后移除标记
        setTimeout(() => {
            this.map.removeLayer(marker);
            this.encounterMarkers = this.encounterMarkers.filter(m => m !== marker);
        }, 10000);
    }

    // ===== 更新地图上的其他用户 =====
    updateMapMarkers(users) {
        // 这里可以显示其他用户的位置
        // 简化实现，只更新数量
        const userCount = Object.keys(users).length - 1; // 减去自己
        if (userCount >= 0) {
            document.getElementById('nearbyCount').textContent = userCount;
        }
    }

    // ===== 刷新扫描 =====
    refreshScan() {
        const btn = document.getElementById('refreshBtn');
        btn.classList.add('rotating');

        // 显示雷达动画
        const radar = document.getElementById('radarPulse');
        radar.classList.add('active');

        setTimeout(() => {
            btn.classList.remove('rotating');
            radar.classList.remove('active');
        }, 2000);

        // 请求当前位置
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    this.updateLocation(pos.coords.latitude, pos.coords.longitude);
                },
                (error) => console.error('位置情報の取得に失敗:', error)
            );
        }
    }

    // ===== 热力图切换 =====
    toggleHeatmap() {
        if (this.heatmapLayer) {
            this.map.removeLayer(this.heatmapLayer);
            this.heatmapLayer = null;
            return;
        }

        // 生成热力图数据
        const heatData = this.encounters
            .filter(e => e.location)
            .map(e => [e.location.lat, e.location.lng, 1]);

        if (heatData.length === 0) {
            alert('遭遇データが不足しています');
            return;
        }

        this.heatmapLayer = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {
                0.0: 'blue',
                0.5: 'lime',
                1.0: 'red'
            }
        }).addTo(this.map);
    }

    // ===== 更新UI =====
    updateUI() {
        // 更新统计
        document.getElementById('totalEncounters').textContent = this.encounters.length;

        // 今日遭遇
        const today = new Date().toDateString();
        const todayCount = this.encounters.filter(e =>
            new Date(e.timestamp).toDateString() === today
        ).length;
        document.getElementById('todayEncounters').textContent = todayCount;

        // 成就数量
        const unlockedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
        document.getElementById('achievementCount').textContent = unlockedCount;

        // 更新遭遇列表
        this.updateRecentList();

        // 更新成就网格
        this.updateAchievementGrid();
    }

    // ===== 更新最近遭遇列表 =====
    updateRecentList() {
        const listEl = document.getElementById('recentList');
        const recent = this.encounters.slice(0, 5);

        if (recent.length === 0) {
            listEl.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:20px;">まだすれ違いがありません</p>';
            return;
        }

        listEl.innerHTML = recent.map(e => `
            <div class="encounter-item">
                <div class="encounter-avatar">👤</div>
                <div class="encounter-info">
                    <h4>${e.user}</h4>
                    <p class="encounter-distance">${Math.round(e.distance)}m 付近</p>
                    <p class="encounter-time">${this.formatTime(e.timestamp)}</p>
                </div>
                <div class="encounter-badge">🎯</div>
            </div>
        `).join('');
    }

    // ===== 更新成就网格 =====
    updateAchievementGrid() {
        const gridEl = document.getElementById('achievementGrid');

        gridEl.innerHTML = Object.entries(this.achievements).map(([key, achievement]) => `
            <div class="achievement-badge ${achievement.unlocked ? '' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
            </div>
        `).join('');
    }

    // ===== 成就系统 =====
    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            return JSON.parse(saved);
        }

        return {
            first: { name: '初すれ違い', icon: '👋', unlocked: false, condition: 1 },
            social: { name: '社交家', icon: '🦋', unlocked: false, condition: 10 },
            explorer: { name: '探検家', icon: '🗺️', unlocked: false, condition: 25 },
            master: { name: 'マスター', icon: '🏆', unlocked: false, condition: 50 },
            legend: { name: '伝説', icon: '⭐', unlocked: false, condition: 100 }
        };
    }

    checkAchievements() {
        const count = this.encounters.length;
        let newUnlocks = 0;

        for (const [key, achievement] of Object.entries(this.achievements)) {
            if (!achievement.unlocked && count >= achievement.condition) {
                achievement.unlocked = true;
                newUnlocks++;
                this.showAchievementUnlock(achievement);
            }
        }

        if (newUnlocks > 0) {
            this.saveAchievements();
            this.updateAchievementGrid();
        }
    }

    showAchievementUnlock(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-unlock">
                <div class="unlock-icon">${achievement.icon}</div>
                <div class="unlock-text">
                    <h4>バッジ獲得！</h4>
                    <p>${achievement.name}</p>
                </div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    // ===== 数据持久化 =====
    loadEncounters() {
        const saved = localStorage.getItem('encounters');
        return saved ? JSON.parse(saved) : [];
    }

    saveEncounters() {
        // 只保存最近100个
        const toSave = this.encounters.slice(0, 100);
        localStorage.setItem('encounters', JSON.stringify(toSave));
    }

    // ===== 工具函数 =====
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'たった今';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}日前`;

        return date.toLocaleDateString('ja-JP');
    }

    playEncounterSound() {
        // 播放音效（如果有）
        try {
            const audio = new Audio('/sounds/encounter.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('音效播放失败:', e));
        } catch (e) {
            console.log('音效不可用');
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.encounterSystem = new EncounterSystem();
});


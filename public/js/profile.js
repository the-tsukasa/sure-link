// 获取元素
const nicknameEl = document.getElementById("nickname");
const avatarEl = document.getElementById("avatar");
const joinDateEl = document.getElementById("joinDate");
const editBtn = document.getElementById("editNameBtn");
const toast = createToast();

// ===== 初始化资料 =====
document.addEventListener("DOMContentLoaded", () => {
    let nickname = localStorage.getItem("nickname") || "User";
    nicknameEl.textContent = nickname;
    avatarEl.textContent = nickname[0].toUpperCase();

    // 注册日期（仅第一次）
    if (!localStorage.getItem("joinDate")) {
        const today = new Date().toLocaleDateString("ja-JP");
        localStorage.setItem("joinDate", today);
    }
    joinDateEl.textContent = localStorage.getItem("joinDate");
});

// ===== 修改昵称 =====
editBtn.addEventListener("click", async () => {
    const newName = await showPrompt("新しいニックネームを入力してください：", "User");
    if (!newName) return;

    localStorage.setItem("nickname", newName);
    nicknameEl.textContent = newName;
    avatarEl.textContent = newName[0].toUpperCase();
    showToast(`✨ ${newName} さんに更新しました`);
});

// ===== 一言メッセージ保存 =====
document.getElementById("saveStatus").addEventListener("click", () => {
    const msg = document.getElementById("statusInput").value.trim();
    localStorage.setItem("statusMsg", msg);
    showToast("💾 保存しました！");
});

// ===== データリセット =====
document.getElementById("resetBtn").addEventListener("click", async () => {
    const confirmed = await showConfirm(
        "ローカル保存データ（ニックネーム・メッセージ・登録日など）をすべて削除しますか？"
    );
    if (!confirmed) return;

    localStorage.removeItem("nickname");
    localStorage.removeItem("joinDate");
    localStorage.removeItem("statusMsg");

    nicknameEl.textContent = "User";
    avatarEl.textContent = "A";
    joinDateEl.textContent = "";
    document.getElementById("statusInput").value = "";

    showToast("🧹 データをリセットしました");
    setTimeout(() => location.reload(), 1200);
});

// ===== ログアウト処理 =====
document.getElementById("logoutBtn").addEventListener("click", async () => {
    const confirmed = await showConfirm("Sure-Link からログアウトしますか？");
    if (!confirmed) return;

    navigator.vibrate?.(20);

    const overlay = document.createElement("div");
    overlay.style = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:white;opacity:0;transition:opacity .6s ease;z-index:2000;
  `;
    document.body.appendChild(overlay);

    setTimeout(() => (overlay.style.opacity = "1"), 50);
    setTimeout(() => (window.location.href = "welcome.html"), 700);
});

// ====== iOS风 Toast ======
function createToast() {
    const t = document.createElement("div");
    t.id = "toast";
    t.style = `
    position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);
    background:rgba(255,255,255,0.9);
    -webkit-backdrop-filter:blur(12px);
    backdrop-filter:blur(12px);
    color:#111;padding:12px 22px;border-radius:20px;font-size:0.9rem;
    box-shadow:0 6px 20px rgba(0,0,0,0.15);
    opacity:0;transition:opacity .4s ease,transform .4s ease;z-index:9999;
  `;
    document.body.appendChild(t);
    return t;
}

function showToast(text) {
    toast.textContent = text;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(20px)";
    }, 2000);
}

// ====== 自定义 Confirm 模态框 ======
function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.createElement("div");
        modal.innerHTML = `
      <div style="
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.4);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);
        display:flex;align-items:center;justify-content:center;z-index:3000;
      ">
        <div style="
          background:white;padding:20px 24px;border-radius:16px;
          max-width:320px;text-align:center;font-size:0.95rem;
          box-shadow:0 6px 20px rgba(0,0,0,0.2);
        ">
          <p style="margin-bottom:16px;">${message}</p>
          <div style="display:flex;gap:10px;justify-content:center;">
            <button id="cancelBtn" style="flex:1;padding:10px;border:none;border-radius:10px;background:#ccc;">キャンセル</button>
            <button id="okBtn" style="flex:1;padding:10px;border:none;border-radius:10px;background:#007aff;color:white;">OK</button>
          </div>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
        modal.querySelector("#cancelBtn").onclick = () => {
            modal.remove();
            resolve(false);
        };
        modal.querySelector("#okBtn").onclick = () => {
            modal.remove();
            resolve(true);
        };
    });
}

// ====== 自定义 Prompt 模态框 ======
function showPrompt(message, placeholder = "") {
    return new Promise((resolve) => {
        const modal = document.createElement("div");
        modal.innerHTML = `
      <div style="
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.4);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);
        display:flex;align-items:center;justify-content:center;z-index:3000;
      ">
        <div style="
          background:white;padding:20px;border-radius:16px;
          max-width:320px;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,0.2);
        ">
          <p style="margin-bottom:12px;">${message}</p>
          <input id="promptInput" type="text" value="${placeholder}" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:16px;" />
          <div style="display:flex;gap:10px;justify-content:center;">
            <button id="cancelBtn" style="flex:1;padding:10px;border:none;border-radius:10px;background:#ccc;">キャンセル</button>
            <button id="okBtn" style="flex:1;padding:10px;border:none;border-radius:10px;background:#007aff;color:white;">OK</button>
          </div>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
        modal.querySelector("#cancelBtn").onclick = () => {
            modal.remove();
            resolve(null);
        };
        modal.querySelector("#okBtn").onclick = () => {
            const val = modal.querySelector("#promptInput").value.trim();
            modal.remove();
            resolve(val);
        };
    });
}

// ====== すれ違い履歴管理 ======
class EncounterHistory {
    constructor() {
        this.encounters = this.loadEncounters();
        this.displayLimit = 5;
        this.init();
    }

    // 从 localStorage 加载遭遇记录
    loadEncounters() {
        const saved = localStorage.getItem('encounters');
        return saved ? JSON.parse(saved) : [];
    }

    // 保存遭遇记录
    saveEncounters() {
        localStorage.setItem('encounters', JSON.stringify(this.encounters));
    }

    // 初始化
    init() {
        this.renderEncounters();
        this.updateStats();
        this.setupEventListeners();
        
        // 监听遭遇事件（从其他页面触发）
        window.addEventListener('storage', (e) => {
            if (e.key === 'encounters') {
                this.encounters = this.loadEncounters();
                this.renderEncounters();
                this.updateStats();
            }
        });
    }

    // 渲染遭遇卡片
    renderEncounters() {
        const container = document.getElementById('encounterCards');
        const viewMoreBtn = document.getElementById('viewMoreBtn');
        
        if (this.encounters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🌟</div>
                    <p>まだすれ違いがありません</p>
                    <p class="empty-hint">マップページで位置情報を共有すると、<br>近くの人とすれ違うことができます！</p>
                </div>
            `;
            viewMoreBtn.classList.add('hidden');
            return;
        }

        // 显示最近的遭遇
        const toDisplay = this.encounters.slice(0, this.displayLimit);
        container.innerHTML = toDisplay.map((enc, index) => this.createEncounterCard(enc, index)).join('');
        
        // 显示/隐藏"查看更多"按钮
        if (this.encounters.length > this.displayLimit) {
            viewMoreBtn.classList.remove('hidden');
        } else {
            viewMoreBtn.classList.add('hidden');
        }
    }

    // 创建遭遇卡片 HTML
    createEncounterCard(encounter, index) {
        const avatar = encounter.user ? encounter.user[0].toUpperCase() : '?';
        const time = this.formatTime(encounter.timestamp);
        const distance = Math.round(encounter.distance);
        const likes = encounter.likes || 0;
        const isLiked = encounter.liked || false;

        return `
            <div class="encounter-card" data-index="${index}">
                <div class="encounter-avatar">${avatar}</div>
                <div class="encounter-content">
                    <div class="encounter-header">
                        <h4 class="encounter-name">${encounter.user || 'Unknown'}</h4>
                        <span class="encounter-time">${time}</span>
                    </div>
                    <div class="encounter-info">
                        <div class="encounter-detail">
                            <i class="fas fa-location-dot"></i>
                            <span>${encounter.location || '不明な場所'}</span>
                        </div>
                        <div class="encounter-detail">
                            <i class="fas fa-ruler"></i>
                            <span class="encounter-distance">約 ${distance}m</span>
                        </div>
                    </div>
                    <div class="encounter-actions">
                        <button class="like-btn ${isLiked ? 'liked' : ''}" data-index="${index}">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                            <span class="like-count">${likes}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 设置事件监听器
    setupEventListeners() {
        // 点赞按钮
        document.addEventListener('click', (e) => {
            const likeBtn = e.target.closest('.like-btn');
            if (likeBtn) {
                const index = parseInt(likeBtn.dataset.index);
                this.toggleLike(index);
            }
        });

        // 查看更多按钮
        document.getElementById('viewMoreBtn').addEventListener('click', () => {
            this.displayLimit += 5;
            this.renderEncounters();
        });
    }

    // 切换点赞状态
    toggleLike(index) {
        const encounter = this.encounters[index];
        if (!encounter) return;

        if (encounter.liked) {
            encounter.liked = false;
            encounter.likes = (encounter.likes || 1) - 1;
        } else {
            encounter.liked = true;
            encounter.likes = (encounter.likes || 0) + 1;
        }

        this.saveEncounters();
        this.renderEncounters();
        this.updateStats();

        // 震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(encounter.liked ? [10, 10, 10] : 10);
        }
    }

    // 更新统计信息
    updateStats() {
        const totalEl = document.getElementById('totalEncounters');
        const favoriteEl = document.getElementById('favoriteCount');
        
        if (totalEl) {
            totalEl.textContent = this.encounters.length;
        }
        
        if (favoriteEl) {
            const favoriteCount = this.encounters.filter(e => e.liked).length;
            favoriteEl.textContent = favoriteCount;
        }

        // 更新今日遭遇数
        const encountCountEl = document.getElementById('encountCount');
        if (encountCountEl) {
            const today = new Date().toDateString();
            const todayCount = this.encounters.filter(e => 
                new Date(e.timestamp).toDateString() === today
            ).length;
            encountCountEl.textContent = todayCount;
        }
    }

    // 格式化时间
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // 少于1分钟
        if (diff < 60000) return 'たった今';
        
        // 少于1小时
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}分前`;
        }
        
        // 少于24小时
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}時間前`;
        }
        
        // 少于7天
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}日前`;
        }
        
        // 显示具体日期
        return date.toLocaleDateString('ja-JP', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // 添加新遭遇（供其他页面调用）
    addEncounter(user, distance, location) {
        const encounter = {
            user,
            distance,
            location,
            timestamp: Date.now(),
            likes: 0,
            liked: false
        };
        
        this.encounters.unshift(encounter);
        
        // 只保留最近100条
        if (this.encounters.length > 100) {
            this.encounters = this.encounters.slice(0, 100);
        }
        
        this.saveEncounters();
        this.renderEncounters();
        this.updateStats();
    }
}

// 初始化遭遇历史
const encounterHistory = new EncounterHistory();

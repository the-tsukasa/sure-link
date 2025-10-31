// ========== app.js ==========

document.addEventListener("DOMContentLoaded", () => {
    // 使用全局配置（config.js 已自动初始化）
    const config = window.SureLinkConfig;
    const serverUrl = config.serverUrl;
    
    console.log('📡 Connecting to:', serverUrl);
    const socket = io(serverUrl);

    const userCountEl = document.getElementById("userCount");
    const msgInput = document.getElementById("msgInput");
    const postBtn = document.getElementById("postBtn");
    const msgList = document.getElementById("msgList");
    const serverStateEl = document.getElementById("serverState");

    // ===== サーバー接続状態 =====
    socket.on("connect", () => {
        console.log("🟢 Connected to server");
        if (serverStateEl) serverStateEl.textContent = "サーバー：🟢 接続中";
    });
    socket.on("disconnect", () => {
        console.log("🔴 Disconnected");
        if (serverStateEl) serverStateEl.textContent = "サーバー：🔴 切断";
    });

    // ===== オンライン人数更新 =====
    socket.on("onlineCount", (count) => {
        if (userCountEl) {
            userCountEl.textContent = `現在オンライン人数：${count}人`;
            console.log("👥 Online:", count);
        }
    });

    // ===== 過去のチャット履歴を受信 =====
    socket.on("chatHistory", (messages) => {
        console.log("📜 Chat history loaded:", messages.length);
        msgList.innerHTML = ""; // 一旦クリア
        messages.forEach((m) => {
            const li = createSafeMessageElement(m.username, m.text, new Date(m.created_at));
            msgList.appendChild(li);
        });
        msgList.scrollTop = msgList.scrollHeight;
    });

    // ===== 新しいチャットメッセージを受信 =====
    socket.on("chatMessage", (msgData) => {
        const li = createSafeMessageElement(msgData.user, msgData.text, new Date());
        msgList.appendChild(li);
        msgList.scrollTop = msgList.scrollHeight; // 自動スクロール
    });

    // ===== 投稿ボタン =====
    postBtn.addEventListener("click", sendMessage);
    msgInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // ===== 创建安全的消息元素（防止XSS） =====
    function createSafeMessageElement(username, text, timestamp) {
        const li = document.createElement("li");
        
        // 时间标签
        const timeSpan = document.createElement("span");
        timeSpan.style.color = "#777";
        const time = timestamp.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
        });
        timeSpan.textContent = `[${time}]`;
        
        // 用户名
        const nameStrong = document.createElement("strong");
        nameStrong.textContent = username;
        
        // 消息文本
        const textNode = document.createTextNode(`：${text}`);
        
        li.appendChild(timeSpan);
        li.appendChild(document.createTextNode(" "));
        li.appendChild(nameStrong);
        li.appendChild(textNode);
        
        return li;
    }

    function sendMessage() {
        const msg = msgInput.value.trim();
        if (!msg) return;
        
        // 输入验证
        if (msg.length > 500) {
            showToast("⚠️ メッセージは500文字以内にしてください");
            return;
        }
        
        const msgData = {
            user: localStorage.getItem("nickname") || "匿名",
            text: msg
        };
        socket.emit("chatMessage", msgData);
        msgInput.value = "";
    }
    
    // ===== Toast 提示函数 =====
    function showToast(message) {
        const toast = document.createElement("div");
        toast.style = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            font-size: 0.9rem;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transition = "opacity 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ===== ページタイトルにニックネーム反映 =====
    const name = localStorage.getItem("nickname");
    if (name) document.title = `Sure Link - ようこそ ${name}さん`;
    
    // ===== 离线/在线检测 =====
    window.addEventListener('online', () => {
        showToast('✅ オンラインに戻りました');
        if (serverStateEl) serverStateEl.textContent = "サーバー：🟢 接続中";
    });
    
    window.addEventListener('offline', () => {
        showToast('⚠️ オフラインモードです');
        if (serverStateEl) serverStateEl.textContent = "サーバー：🔴 オフライン";
    });
    
    // ===== Socket 错误处理 =====
    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        showToast('⚠️ サーバーに接続できません');
    });
    
    socket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected after', attemptNumber, 'attempts');
        showToast('✅ 再接続しました');
    });
});


// ========== PWA: Service Worker & 自動更新検出 ==========
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("✅ Service Worker registered");

        // 新しいバージョンを検出したら更新確認
        reg.onupdatefound = () => {
            const newWorker = reg.installing;
            newWorker.onstatechange = () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    const refresh = confirm("🔄 新しいバージョンがあります。更新しますか？");
                    if (refresh) window.location.reload();
                }
            };
        };
    }).catch((err) => console.error("SW registration failed:", err));
}

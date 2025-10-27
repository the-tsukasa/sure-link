// ========== app.js ==========

document.addEventListener("DOMContentLoaded", () => {
    const socket = io("https://sure-link.onrender.com"); // Render環境用

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
            const li = document.createElement("li");
            const time = new Date(m.created_at).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
            });
            li.innerHTML = `<span style="color:#777;">[${time}]</span> <strong>${m.username}</strong>：${m.text}`;
            msgList.appendChild(li);
        });
        msgList.scrollTop = msgList.scrollHeight;
    });

    // ===== 新しいチャットメッセージを受信 =====
    socket.on("chatMessage", (msgData) => {
        const li = document.createElement("li");
        const time = new Date().toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
        });
        li.innerHTML = `<span style="color:#777;">[${time}]</span> <strong>${msgData.user}</strong>：${msgData.text}`;
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

    function sendMessage() {
        const msg = msgInput.value.trim();
        if (!msg) return;
        const msgData = {
            user: localStorage.getItem("nickname") || "匿名",
            text: msg
        };
        socket.emit("chatMessage", msgData);
        msgInput.value = "";
    }

    // ===== ページタイトルにニックネーム反映 =====
    const name = localStorage.getItem("nickname");
    if (name) document.title = `Sure Link - ようこそ ${name}さん`;
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

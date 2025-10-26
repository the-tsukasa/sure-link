document.addEventListener("DOMContentLoaded", () => {
    const socket = io("https://sure-link.onrender.com"); // Render環境用

    const userCountEl = document.getElementById("userCount");
    const msgInput = document.getElementById("msgInput");
    const postBtn = document.getElementById("postBtn");
    const msgList = document.getElementById("msgList");

    // ===== オンライン人数更新 =====
    socket.on("onlineCount", (count) => {
        if (userCountEl) {
            userCountEl.textContent = `現在オンライン人数：${count}人`;
            console.log("👥 Online:", count);
        }
    });

    // ===== チャット送信 =====
    postBtn.addEventListener("click", () => {
        const msg = msgInput.value.trim();
        if (!msg) return;
        const msgData = { user: localStorage.getItem("nickname") || "匿名", text: msg };
        socket.emit("chatMessage", msgData);
        msgInput.value = "";
    });

    // ===== チャット受信 =====
    socket.on("chatMessage", (msgData) => {
        const li = document.createElement("li");
        const time = new Date().toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
        });
        li.innerHTML = `<span style="color:#777;">[${time}]</span> <strong>${msgData.user}</strong>：${msgData.text}`;
        msgList.appendChild(li);
    });
});

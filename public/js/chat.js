// 使用全局配置
const config = window.SureLinkConfig || { serverUrl: 'http://localhost:3000' };
console.log('📡 Chat connecting to:', config.serverUrl);
const socket = io(config.serverUrl);

const msgList = document.getElementById("messages");
const input = document.getElementById("messageInput");
const btn = document.getElementById("sendBtn");

const nickname = localStorage.getItem("nickname") || "匿名";

// ====== 发送消息 ======
btn.addEventListener("click", sendMsg);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMsg();
    }
});

function sendMsg() {
    const text = input.value.trim();
    if (!text) return;

    const msgData = {
        id: socket.id,
        user: nickname,
        text,
    };

    renderMessage(msgData, true);
    socket.emit("chatMessage", msgData);
    input.value = "";
}

// ====== 颜色生成 ======
function getColorFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

// ====== 创建头像 ======
function createAvatar(user) {
    const div = document.createElement("div");
    div.className = "avatar";
    div.style.background = getColorFromName(user);
    div.textContent = user[0] ? user[0].toUpperCase() : "?";
    return div;
}

// ====== 渲染消息 ======
function renderMessage(data, isLocal = false) {
    if (!data.text) return;

    const li = document.createElement("li");
    li.classList.add("message");
    if (data.id === socket.id || isLocal) li.classList.add("me");

    const timeText = new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const avatarEl = createAvatar(data.user);
    const wrapper = document.createElement("div");
    wrapper.classList.add("bubble-wrapper");

    const nameRow = document.createElement("div");
    nameRow.classList.add("user-row");
    nameRow.textContent = data.user;
    nameRow.style.color = getColorFromName(data.user);

    const bubbleLine = document.createElement("div");
    bubbleLine.classList.add("bubble-line");

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.textContent = data.text;

    const timeEl = document.createElement("div");
    timeEl.classList.add("time");
    timeEl.textContent = timeText;

    bubbleLine.appendChild(bubble);
    bubbleLine.appendChild(timeEl);
    wrapper.appendChild(nameRow);
    wrapper.appendChild(bubbleLine);

    li.appendChild(avatarEl);
    li.appendChild(wrapper);
    msgList.appendChild(li);

    msgList.scrollTo({ top: msgList.scrollHeight, behavior: "smooth" });
}

// ====== 接收消息 ======
socket.on("chatMessage", (data) => {
    if (data.id === socket.id) return;
    renderMessage(data);
    navigator.vibrate?.(20);
});

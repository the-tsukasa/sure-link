const socket = io();

const msgList = document.getElementById("messages");
const input = document.getElementById("messageInput");
const btn = document.getElementById("sendBtn");

const nickname = localStorage.getItem("nickname") || "匿名";

// ====== 发送消息 ======
btn.addEventListener("click", sendMsg);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); // 避免换行
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

    // 本地立即显示（不等服务器回传）
    renderMessage(msgData, true);
    socket.emit("chatMessage", msgData);
    input.value = "";
}

// ====== 颜色生成器 ======
function getColorFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

// ====== 头像节点 ======
function createAvatar(user) {
    const div = document.createElement("div");
    div.className = "avatar";
    div.style.background = getColorFromName(user);
    div.textContent = user[0] ? user[0].toUpperCase() : "?";
    return div;
}

// ====== 渲染消息 ======
function renderMessage(data, isLocal = false) {
    const li = document.createElement("li");
    li.classList.add("message");

    // 区分是否为自己
    const isMe = data.id === socket.id || isLocal;
    if (isMe) li.classList.add("me");

    // 时间戳
    const timeText = new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
    });

    // 头像
    const avatarEl = createAvatar(data.user);

    // 外层容器
    const wrapper = document.createElement("div");
    wrapper.classList.add("bubble-wrapper");

    // 昵称
    const nameRow = document.createElement("div");
    nameRow.classList.add("user-row");
    nameRow.textContent = data.user;
    nameRow.style.color = getColorFromName(data.user);

    // 气泡 + 时间行
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

    // 平滑滚动到底部
    msgList.scrollTo({
        top: msgList.scrollHeight,
        behavior: "smooth",
    });
}

// ====== 接收消息 ======
socket.on("chatMessage", (data) => {
    // 如果是自己发的消息（本地已显示），不重复
    if (data.id === socket.id) return;
    renderMessage(data, false);
});
socket.on("chatMessage", (data) => {
    if (data.id !== socket.id) {
        renderMessage(data);
        navigator.vibrate?.(20);
    }
});

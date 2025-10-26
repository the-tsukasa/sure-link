const socket = io();

const msgList = document.getElementById("messages");
const input = document.getElementById("messageInput");
const btn = document.getElementById("sendBtn");

btn.addEventListener("click", sendMsg);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMsg();
});

function sendMsg() {
    const text = input.value.trim();
    if (!text) return;
    socket.emit("chatMessage", text);
    input.value = "";
}

// 稳定生成颜色
function getColorFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

// 生成头像节点
function createAvatar(user) {
    const div = document.createElement("div");
    div.className = "avatar";
    div.style.background = getColorFromName(user);
    div.textContent = user[0] ? user[0].toUpperCase() : "?";
    return div;
}

// 渲染一条消息
socket.on("chatMessage", (data) => {
    const li = document.createElement("li");
    li.classList.add("message");

    const myId = socket.id;
    const isMe = data.id === myId || data.user === "匿名";
    if (isMe) li.classList.add("me");

    // 时间戳
    const timeText = new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
    });

    // avatar
    const avatarEl = createAvatar(data.user);

    // 外层容器（昵称 + 气泡行）
    const bubbleWrapper = document.createElement("div");
    bubbleWrapper.classList.add("bubble-wrapper");

    // 昵称
    const userRow = document.createElement("div");
    userRow.classList.add("user-row");
    userRow.style.color = getColorFromName(data.user);
    userRow.textContent = data.user;

    // 气泡行（气泡 + 时间）
    const bubbleLine = document.createElement("div");
    bubbleLine.classList.add("bubble-line");

    const bubbleEl = document.createElement("div");
    bubbleEl.classList.add("bubble");
    bubbleEl.textContent = data.text;

    const timeEl = document.createElement("div");
    timeEl.classList.add("time");
    timeEl.textContent = timeText;

    // 气泡行拼装
    // 注意：CSS 会用 row-reverse 翻转顺序，所以我们在 DOM 顺序上固定成 bubble -> time
    bubbleLine.appendChild(bubbleEl);
    bubbleLine.appendChild(timeEl);

    // 包装所有
    bubbleWrapper.appendChild(userRow);
    bubbleWrapper.appendChild(bubbleLine);

    // 最后挂到 li
    li.appendChild(avatarEl);
    li.appendChild(bubbleWrapper);

    // 插入到消息列表
    msgList.appendChild(li);
    msgList.scrollTop = msgList.scrollHeight;
});

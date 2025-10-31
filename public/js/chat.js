// 使用全局配置
const config = window.SureLinkConfig || { serverUrl: 'http://localhost:3000' };
console.log('📡 Chat connecting to:', config.serverUrl);
const socket = io(config.serverUrl);

const msgList = document.getElementById("messages");
const input = document.getElementById("messageInput");
const btn = document.getElementById("sendBtn");

const nickname = localStorage.getItem("nickname") || "匿名";

// 历史消息存储键
const CHAT_HISTORY_KEY = 'chatHistory';
const MAX_HISTORY_SIZE = 100; // 最多保存100条消息

// ====== 初始化：加载历史消息 ======
document.addEventListener("DOMContentLoaded", () => {
    loadChatHistory();
});

// 加载历史消息
function loadChatHistory() {
    const history = getChatHistory();
    if (history.length > 0) {
        msgList.innerHTML = ''; // 清空
        history.forEach(msg => {
            renderMessage(msg, msg.user === nickname, false); // 最后参数false表示不保存
        });
        console.log(`📜 Loaded ${history.length} chat messages from history`);
    }
}

// 获取聊天历史
function getChatHistory() {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 保存消息到历史
function saveChatMessage(msgData) {
    let history = getChatHistory();
    
    // 添加时间戳
    const messageWithTime = {
        ...msgData,
        timestamp: Date.now()
    };
    
    history.push(messageWithTime);
    
    // 限制历史消息数量
    if (history.length > MAX_HISTORY_SIZE) {
        history = history.slice(-MAX_HISTORY_SIZE); // 保留最新的100条
    }
    
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}

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
function renderMessage(data, isLocal = false, saveToHistory = true) {
    if (!data.text) return;

    const li = document.createElement("li");
    li.classList.add("message");
    if (data.id === socket.id || isLocal) li.classList.add("me");

    // 使用消息的时间戳或当前时间
    const messageTime = data.timestamp ? new Date(data.timestamp) : new Date();
    const timeText = messageTime.toLocaleTimeString("ja-JP", {
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
    
    // 保存到localStorage（仅保存新消息，不保存历史记录）
    if (saveToHistory) {
        saveChatMessage(data);
    }
}

// ====== 接收消息 ======
socket.on("chatMessage", (data) => {
    if (data.id === socket.id) return;
    renderMessage(data, false, true); // 保存接收到的消息
    navigator.vibrate?.(20);
});

// ====== 清除历史记录功能（可选） ======
function clearChatHistory() {
    if (confirm('すべてのチャット履歴を削除しますか？')) {
        localStorage.removeItem(CHAT_HISTORY_KEY);
        msgList.innerHTML = '';
        console.log('✅ Chat history cleared');
        showToast('チャット履歴を削除しました');
    }
}

// 导出到全局（方便在控制台调用）
window.clearChatHistory = clearChatHistory;

// Toast提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(28, 28, 30, 0.95);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        color: white;
        padding: 12px 24px;
        border-radius: 20px;
        font-size: 0.9rem;
        z-index: 10000;
        animation: fadeInUp 0.3s ease;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOutDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ====== APP功能 ======

// 快速回复
function sendQuickReply(text) {
    input.value = text;
    sendMsg();
}

// 表情选择（虚拟功能）
function selectEmoji() {
    showToast('😊 絵文字パネルは開発中です');
}

// 附加图片（虚拟功能）
function attachPhoto() {
    showToast('📸 画像送信機能は開発中です');
}

// 语音消息（虚拟功能）
function voiceMessage() {
    showToast('🎤 音声メッセージ機能は開発中です');
}

// 更多选项（虚拟功能）
function moreOptions() {
    showToast('➕ その他のオプションは開発中です');
}

// 显示在线用户侧边栏
function showOnlineUsers() {
    const panel = document.getElementById('onlineUsersPanel');
    const settings = document.getElementById('settingsPanel');
    settings.classList.remove('show');
    panel.classList.add('show');
}

// 隐藏在线用户侧边栏
function hideOnlineUsers() {
    const panel = document.getElementById('onlineUsersPanel');
    panel.classList.remove('show');
}

// 显示/隐藏设置面板
function toggleChatSettings() {
    const panel = document.getElementById('settingsPanel');
    const users = document.getElementById('onlineUsersPanel');
    users.classList.remove('show');
    
    if (panel.classList.contains('show')) {
        panel.classList.remove('show');
    } else {
        panel.classList.add('show');
    }
}

// 隐藏设置面板
function hideChatSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.remove('show');
}

// 更新在线人数
socket.on('userCount', (count) => {
    const countEl = document.getElementById('onlineCount');
    if (countEl) {
        countEl.textContent = `${count}人`;
    }
});

// 点击背景关闭侧边栏
document.addEventListener('click', (e) => {
    const usersPanel = document.getElementById('onlineUsersPanel');
    const settingsPanel = document.getElementById('settingsPanel');
    
    if (!e.target.closest('.online-users-panel') && 
        !e.target.closest('.settings-panel') &&
        !e.target.closest('.icon-btn')) {
        usersPanel.classList.remove('show');
        settingsPanel.classList.remove('show');
    }
});

// 导出到全局
window.sendQuickReply = sendQuickReply;
window.selectEmoji = selectEmoji;
window.attachPhoto = attachPhoto;
window.voiceMessage = voiceMessage;
window.moreOptions = moreOptions;
window.showOnlineUsers = showOnlineUsers;
window.hideOnlineUsers = hideOnlineUsers;
window.toggleChatSettings = toggleChatSettings;
window.hideChatSettings = hideChatSettings;

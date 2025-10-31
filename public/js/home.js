// Sure Link - APP Home Page JavaScript

// 初始化
document.addEventListener("DOMContentLoaded", () => {
    initHomePage();
    loadStats();
    updateActivity();
});

// 初始化主页
function initHomePage() {
    const name = localStorage.getItem("nickname") || "ゲスト";
    
    // 更新欢迎标题
    document.getElementById("welcomeTitle").textContent = `ようこそ、${name} さん`;
    
    // 更新页面标题
    document.title = `Sure Link - ${name}`;
}

// 加载统计数据
function loadStats() {
    // 从localStorage加载本地数据
    const encounters = JSON.parse(localStorage.getItem('encounters') || '[]');
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    // 更新统计卡片
    document.getElementById('totalEncounters').textContent = encounters.length;
    document.getElementById('totalMessages').textContent = chatHistory.length;
    
    // 今日遭遇数
    const today = new Date().toDateString();
    const todayEncounters = encounters.filter(e => 
        new Date(e.timestamp).toDateString() === today
    ).length;
    document.getElementById('todayEncounters').textContent = todayEncounters;
    
    // 模拟总用户数（实际应从服务器获取）
    document.getElementById('totalUsers').textContent = '128';
}

// 更新最近活动
function updateActivity() {
    const encounters = JSON.parse(localStorage.getItem('encounters') || '[]');
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    // 最后一次遭遇
    if (encounters.length > 0) {
        const lastEncounter = encounters[0];
        const timeAgo = formatTimeAgo(lastEncounter.timestamp);
        document.getElementById('lastEncounter').textContent = `${lastEncounter.user} さん · ${timeAgo}`;
    }
    
    // 最后一条消息
    if (chatHistory.length > 0) {
        const lastMsg = chatHistory[chatHistory.length - 1];
        const timeAgo = formatTimeAgo(lastMsg.timestamp);
        document.getElementById('lastMessage').textContent = `${lastMsg.username}: ${lastMsg.text.substring(0, 15)}... · ${timeAgo}`;
    }
}

// 格式化时间
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'たった今';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
    return `${Math.floor(diff / 86400000)}日前`;
}

// Socket.io连接（用于实时更新在线人数）
const config = window.SureLinkConfig || { serverUrl: 'http://localhost:3000' };
const socket = io(config.serverUrl);

socket.on('userCount', (count) => {
    document.getElementById('userCountMini').textContent = `${count}人オンライン`;
    document.getElementById('onlineUsers').textContent = count;
});

socket.on('connect', () => {
    console.log('📡 Connected to server');
});

// 快捷功能
function shareLocation() {
    showToast('位置共有機能は開発中です');
    // 实际功能可以跳转到地图页面
    // window.location.href = 'map.html';
}

function viewNotifications() {
    showToast('通知機能は開発中です');
}

function openSettings() {
    showToast('設定機能は開発中です');
}

function openHelp() {
    showToast('ヘルプページは開発中です');
}

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

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes fadeOutDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(style);

// 每30秒更新一次活动和统计
setInterval(() => {
    loadStats();
    updateActivity();
}, 30000);


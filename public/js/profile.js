const socket = io();

// 模拟昵称（使用服务器分配的名字或本地保存）
let nickname = localStorage.getItem("nickname");
if (!nickname) {
    nickname = ["Yuki", "Aoi", "Ren", "Kazu", "Mika", "Sora", "Haru"][
        Math.floor(Math.random() * 7)
        ];
    localStorage.setItem("nickname", nickname);
}

// 生成颜色
function getColorFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

// 设置资料卡
document.getElementById("nickname").textContent = nickname;
document.getElementById("avatar").textContent = nickname[0].toUpperCase();

const color = getColorFromName(nickname);
document.getElementById("avatar").style.background = color;
document.getElementById("colorPreview").style.background = color;
document.getElementById("colorCode").textContent = color;

// 加入时间
const joinDate = localStorage.getItem("joinDate") || new Date().toLocaleDateString();
localStorage.setItem("joinDate", joinDate);
document.getElementById("joinDate").textContent = joinDate;

// 随机演示すれ違い数
document.getElementById("encountCount").textContent = Math.floor(Math.random() * 10);

// 一言保存/读取
const statusInput = document.getElementById("statusInput");
const savedStatus = localStorage.getItem("statusMsg") || "";
statusInput.value = savedStatus;

document.getElementById("saveStatus").addEventListener("click", () => {
    localStorage.setItem("statusMsg", statusInput.value.trim());
    alert("一言を保存しました！");
});

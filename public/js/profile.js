// 获取元素
const nicknameEl = document.getElementById("nickname");
const avatarEl = document.getElementById("avatar");
const joinDateEl = document.getElementById("joinDate");
const colorPreview = document.getElementById("colorPreview");
const colorCode = document.getElementById("colorCode");
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

    // 显示颜色
    const color = getColorFromName(nickname);
    colorPreview.style.background = color;
    colorCode.textContent = color;
});

// ===== 修改昵称 =====
editBtn.addEventListener("click", async () => {
    const newName = await showPrompt("新しいニックネームを入力してください：", "User");
    if (!newName) return;

    localStorage.setItem("nickname", newName);
    nicknameEl.textContent = newName;
    avatarEl.textContent = newName[0].toUpperCase();

    const color = getColorFromName(newName);
    colorPreview.style.background = color;
    colorCode.textContent = color;
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
    colorPreview.style.background = "#ccc";
    colorCode.textContent = "";
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

// ===== 颜色生成算法 =====
function getColorFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

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

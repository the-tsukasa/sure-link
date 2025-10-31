// ========== Welcome Page JavaScript ==========

const btn = document.getElementById("startBtn");
const toast = document.getElementById("toast");

btn.addEventListener("click", () => {
    toast.textContent = "位置情報を取得中...";
    toast.classList.add("show");

    // 请求位置信息
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                toast.textContent = "✓ 位置情報が許可されました";
                setTimeout(() => {
                    document.body.classList.add("fade-out");
                    setTimeout(() => location.href = "nickname.html", 600);
                }, 1000);
            },
            (err) => {
                toast.textContent = "⚠ 位置情報の許可が必要です";
                setTimeout(() => toast.classList.remove("show"), 2500);
            }
        );
    } else {
        toast.textContent = "⚠ 位置情報がサポートされていません";
        setTimeout(() => toast.classList.remove("show"), 2500);
    }
});

// Service Worker 注册
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then(() => console.log("✅ Service Worker registered"))
        .catch(console.error);
}


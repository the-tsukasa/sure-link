const socket = io();
const map = L.map("map").setView([35.6812, 139.7671], 15); // 东京站中心

// 加载地图
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

// 自己的红点
let myMarker = L.marker([35.6812, 139.7671], { title: "あなた" }).addTo(map);
let otherMarkers = [];

// 获取位置
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            myMarker.setLatLng([lat, lng]);
            map.setView([lat, lng]);

            // 向服务器发送自己的位置
            socket.emit("updateLocation", { lat, lng });
        },
        (err) => {
            document.getElementById("status").textContent = "位置情報を取得できませんでした。";
        },
        { enableHighAccuracy: true }
    );
}

// 从服务器接收其他用户位置
socket.on("updateUsers", (users) => {
    otherMarkers.forEach(m => map.removeLayer(m)); // 清空旧标记
    otherMarkers = [];

    for (const id in users) {
        const u = users[id];
        if (u && u.lat && u.lng) {
            const marker = L.circleMarker([u.lat, u.lng], {
                color: "#0078ff",
                radius: 8
            }).addTo(map);
            otherMarkers.push(marker);
        }
    }
});

// すれ違い提示
socket.on("encounter", (data) => {
    const msg = `💫 ${data.user} さんとすれ違いました！（${Math.round(data.distance)}m）`;
    document.getElementById("status").textContent = msg;
    console.log(msg);
});
// すれ違い提示
socket.on("encounter", (data) => {
    const msg = `💫 ${data.user} さんとすれ違いました！（距離 ${Math.round(data.distance)}m）`;
    document.getElementById("status").textContent = msg;

    // 新增：記録を履歴リストに追加
    const li = document.createElement("li");
    li.textContent = `${new Date().toLocaleTimeString()} - ${msg}`;
    document.getElementById("encounterList").prepend(li);
});

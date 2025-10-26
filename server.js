import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let onlineUsers = 0;
let users = {}; // 存储在线用户及其位置

// ✅ 添加昵称池
const nicknames = [
    "Yuki", "Taro", "Mika", "Ken", "Sora",
    "Hana", "Riku", "Aoi", "Kazu", "Mio",
    "Ren", "Yuna", "Sho", "Haru", "Rio"
];

io.on("connection", (socket) => {
    onlineUsers++;
    io.emit("onlineCount", onlineUsers);

    // 每个连接随机分配一个昵称
    const name = nicknames[Math.floor(Math.random() * nicknames.length)];
    users[socket.id] = { name, lat: null, lng: null };

    console.log(`🟢 ${name} さんが接続しました。現在オンライン: ${onlineUsers}人`);

    // 📍 位置更新事件
    socket.on("updateLocation", (loc) => {
        users[socket.id].lat = loc.lat;
        users[socket.id].lng = loc.lng;
        io.emit("updateUsers", users);

        // 检查距离，50m内则触发 encounter
        for (const id in users) {
            if (id !== socket.id && users[id].lat) {
                const dist = getDistance(loc, users[id]);
                if (dist < 50) {
                    io.to(socket.id).emit("encounter", {
                        user: users[id].name,
                        distance: dist
                    });
                    io.to(id).emit("encounter", {
                        user: users[socket.id].name,
                        distance: dist
                    });
                }
            }
        }
    });

    // 💬 聊天消息事件
    socket.on("chatMessage", (text) => {
        const user = users[socket.id]?.name || "匿名";
        io.emit("chatMessage", { user, text, id: socket.id });
    });



    // ❌ 用户断开连接
    socket.on("disconnect", () => {
        console.log(`🔴 ${users[socket.id]?.name || "Unknown"} さんが退出しました。`);
        onlineUsers--;
        delete users[socket.id];
        io.emit("updateUsers", users);
        io.emit("onlineCount", onlineUsers);
    });
});

// 📏 Haversine公式で距離を計算（メートル）
function getDistance(a, b) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const val =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(val), Math.sqrt(1 - val));
}

const PORT = 3000;
server.listen(PORT, () =>
    console.log(`✅ Sure Link running on http://localhost:${PORT}`)
);

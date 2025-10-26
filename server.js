// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// CORS允许GitHub Pages访问
app.use(cors());
app.use(express.json());



// 根路径 → 返回 welcome.html（初始页面）
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "welcome.html"));
});

// 静态文件目录（让 public 文件夹可访问）
app.use(express.static(path.join(__dirname, "public")));

// 启动 socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // 可改成具体前端域名
    },
});

// 保存所有用户的位置信息
const users = {};

function calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// socket.io 逻辑
io.on("connection", (socket) => {
    console.log(`🟢 ${socket.id} connected`);
    users[socket.id] = null;

    socket.on("updateLocation", (pos) => {
        users[socket.id] = pos;
        io.emit("updateUsers", users);

        for (const [id, u] of Object.entries(users)) {
            if (id !== socket.id && u) {
                const d = calcDistance(pos.lat, pos.lng, u.lat, u.lng);
                if (d < 50) {
                    io.to(id).emit("encounter", { user: socket.id, distance: d });
                    io.to(socket.id).emit("encounter", { user: id, distance: d });
                }
            }
        }
    });

    socket.on("disconnect", () => {
        console.log(`🔴 ${socket.id} disconnected`);
        delete users[socket.id];
        io.emit("updateUsers", users);
    });
});

// 测试用API
app.get("/api/test", (req, res) => {
    res.json({ message: "Sure-Link backend is running ✅" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🌍 Server running on port ${PORT}`);
});

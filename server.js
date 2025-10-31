// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg"; // PostgreSQL 用
import dotenv from "dotenv";

dotenv.config(); // 读取 .env 文件中的 DATABASE_URL

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== 静的ファイル =====
app.use(express.static(path.join(__dirname, "public")));

// ===== PostgreSQL 接続 =====
const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.connect()
    .then(() => console.log("✅ PostgreSQL connected"))
    .catch((err) => console.error("❌ DB connection error:", err.message));

// ===== Root Path =====
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "welcome.html"));
});

// ===== Socket.io 設定 =====
const io = new Server(server, {
    cors: { origin: "*" },
});

// ===== User Locations =====
const users = {};

function calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const dPhi = ((lat2 - lat1) * Math.PI) / 180;
    const dLambda = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(dPhi / 2) ** 2 +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ===== Socket.io ロジック =====
io.on("connection", async (socket) => {
    console.log(`🟢 ${socket.id} connected`);
    users[socket.id] = null;

    // === オンライン人数更新 ===
    io.emit("onlineCount", io.engine.clientsCount);

    // === 既存メッセージ履歴を送信 ===
    try {
        const result = await pool.query(
            "SELECT username, text, created_at FROM messages ORDER BY created_at ASC LIMIT 50"
        );
        socket.emit("chatHistory", result.rows);
    } catch (err) {
        console.error("❌ Failed to load chat history:", err.message);
    }

    // === 位置情報更新 ===
    socket.on("updateLocation", (pos) => {
        // 存储位置和昵称信息
        users[socket.id] = {
            lat: pos.lat,
            lng: pos.lng,
            nickname: pos.nickname || socket.id.slice(0, 5)
        };
        io.emit("updateUsers", users);

        for (const [id, u] of Object.entries(users)) {
            if (id !== socket.id && u) {
                const d = calcDistance(pos.lat, pos.lng, u.lat, u.lng);
                if (d < 50) {
                    const userName = u.nickname || id.slice(0, 5);
                    const myName = users[socket.id].nickname || socket.id.slice(0, 5);
                    io.to(id).emit("encounter", { user: myName, distance: d });
                    io.to(socket.id).emit("encounter", { user: userName, distance: d });
                }
            }
        }
    });

    // === チャット送信 ===
    socket.on("chatMessage", async (msgData) => {
        io.emit("chatMessage", msgData);
        try {
            await pool.query(
                "INSERT INTO messages (username, text) VALUES ($1, $2)",
                [msgData.user, msgData.text]
            );
        } catch (err) {
            console.error("❌ Failed to save message:", err.message);
        }
    });

    // === 切断処理 ===
    socket.on("disconnect", () => {
        console.log(`🔴 ${socket.id} disconnected`);
        delete users[socket.id];
        io.emit("updateUsers", users);
        io.emit("onlineCount", io.engine.clientsCount);
    });
});

// ===== API テスト =====
app.get("/api/test", (req, res) => {
    res.json({ message: "Sure-Link backend is running ✅" });
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🌍 Server running on port ${PORT}`);
});

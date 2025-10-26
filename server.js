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

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Static Files =====
app.use(express.static(path.join(__dirname, "public")));

// Root Path → welcome.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "welcome.html"));
});

// ===== Start Socket.io =====
const io = new Server(server, {
    cors: { origin: "*" },
});

// ===== User Locations =====
const users = {};

function calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth radius in meters
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


// ===== Socket.io Logic =====
io.on("connection", (socket) => {
    console.log(`🟢 ${socket.id} connected`);
    users[socket.id] = null;

    // === Update Online Count ===
    io.emit("onlineCount", io.engine.clientsCount);

    // === Handle Location Update ===
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

    // === Handle Chat Messages ===
    socket.on("chatMessage", (msgData) => {
        io.emit("chatMessage", msgData);
    });

    // === Handle Disconnect ===
    socket.on("disconnect", () => {
        console.log(`🔴 ${socket.id} disconnected`);
        delete users[socket.id];
        io.emit("updateUsers", users);
        io.emit("onlineCount", io.engine.clientsCount);
    });
});

// ===== Test API =====
app.get("/api/test", (req, res) => {
    res.json({ message: "Sure-Link backend is running ✅" });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🌍 Server running on port ${PORT}`);
});

const socket = io();

socket.on("onlineCount", (count) => {
    document.getElementById("onlineCount").textContent = count;
});

document.getElementById("postBtn").addEventListener("click", () => {
    const input = document.getElementById("msgInput");
    const msg = input.value.trim();
    if (msg) {
        socket.emit("chatMessage", msg);
        input.value = "";
    }
});

socket.on("chatMessage", (data) => {
    const li = document.createElement("li");
    if (typeof data === "object") {
        const time = new Date().toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
        });
        li.innerHTML = `<span style="color:#777;">[${time}]</span> <strong>${data.user}</strong>：${data.text}`;
    } else {
        li.textContent = data;
    }
    document.getElementById("msgList").appendChild(li);
});

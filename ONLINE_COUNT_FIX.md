# 🔧 在线人数显示修复 - v3.1.2

**日期**: 2024-11-01  
**版本**: v3.1.1 → v3.1.2

---

## 🐛 问题描述

### 用户报告的问题
- `index.html` 和 `chat.html` 的在线人数显示模块不工作
- 即使有两个用户连接，也显示 **"0人オンライン"**

### 根本原因
**Socket.io 事件名不匹配**

| 位置 | 使用的事件名 | 状态 |
|------|-------------|------|
| **服务器端** | `onlineCount` ❌ | 错误 |
| **客户端** | `userCount` ✅ | 正确 |

由于事件名不一致，客户端无法接收到服务器广播的在线人数更新。

---

## ✅ 修复内容

### 1. 服务器端修复

**文件**: `src/controllers/socketController.js`

```javascript
// ❌ 修复前
broadcastOnlineCount() {
    const count = this.io.engine.clientsCount;
    this.io.emit('onlineCount', count); // 错误的事件名
    
    logger.debug('Online count broadcasted', { count });
}

// ✅ 修复后
broadcastOnlineCount() {
    const count = this.io.engine.clientsCount;
    this.io.emit('userCount', count); // 修复：与客户端匹配
    
    logger.debug('Online count broadcasted', { count });
}
```

**触发时机**:
- ✅ 客户端连接时 (`connection` 事件)
- ✅ 客户端断开时 (`disconnect` 事件)

---

### 2. 客户端修复

#### ✅ `public/js/encounter-main.js`

```javascript
// ❌ 修复前
this.socket.on('onlineCount', (count) => {
    document.getElementById('nearbyCount').textContent = count;
});

// ✅ 修复后
this.socket.on('userCount', (count) => {
    document.getElementById('nearbyCount').textContent = count;
});
```

#### ✅ `public/js/app.js`

```javascript
// ❌ 修复前
socket.on("onlineCount", (count) => {
    if (userCountEl) {
        userCountEl.textContent = `現在オンライン人数：${count}人`;
    }
});

// ✅ 修复后
socket.on("userCount", (count) => {
    if (userCountEl) {
        userCountEl.textContent = `現在オンライン人数：${count}人`;
    }
});
```

#### ✅ `public/js/home.js` - 已正确
```javascript
// ✅ 无需修改（已经正确）
socket.on('userCount', (count) => {
    document.getElementById('userCountMini').textContent = `${count}人オンライン`;
    document.getElementById('onlineUsers').textContent = count;
});
```

#### ✅ `public/js/chat.js` - 已正确
```javascript
// ✅ 无需修改（已经正确）
socket.on('userCount', (count) => {
    const countEl = document.getElementById('onlineCount');
    if (countEl) {
        countEl.textContent = `${count}人`;
    }
});
```

---

## 📊 修复统计

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `src/controllers/socketController.js` | `onlineCount` → `userCount` | ✅ 已修复 |
| `public/js/encounter-main.js` | `onlineCount` → `userCount` | ✅ 已修复 |
| `public/js/app.js` | `onlineCount` → `userCount` | ✅ 已修复 |
| `public/js/home.js` | 已使用 `userCount` | ✅ 无需修改 |
| `public/js/chat.js` | 已使用 `userCount` | ✅ 无需修改 |

**总计**: 3个文件修复 + 2个文件已正确

---

## 🎯 影响的页面

### 1. **主页** (`index.html`)

**显示位置**:
- 顶部服务器状态栏：`<span id="userCountMini">0人オンライン</span>`
- 统计卡片：`<div id="onlineUsers">0</div>`

**预期行为**:
```
修复前: "0人オンライン" | "0"
修复后: "2人オンライン" | "2" ✅
```

---

### 2. **聊天页面** (`chat.html`)

**显示位置**:
- 聊天室头部：`<span id="onlineCount">0人</span> オンライン`

**预期行为**:
```
修复前: "0人 オンライン"
修复后: "2人 オンライン" ✅
```

---

### 3. **遭遇页面** (`encounter.html`)

**显示位置**:
- 附近用户数量：`<span id="nearbyCount">0</span>`

**预期行为**:
```
修复前: "0"
修复后: "2" ✅
```

---

## 🧪 测试步骤

### 本地测试

1. **启动服务器**
   ```bash
   npm start
   ```

2. **打开第一个浏览器标签页**
   - 访问 `http://localhost:3000/index.html`
   - 观察在线人数应显示 **"1人オンライン"**

3. **打开第二个浏览器标签页**
   - 访问 `http://localhost:3000/chat.html`
   - 观察两个页面的在线人数都应更新为 **"2人オンライン"**

4. **关闭一个标签页**
   - 观察剩余页面在线人数应减少为 **"1人オンライン"**

---

## 🔍 技术细节

### Socket.io 事件流程

```
服务器 (socketController.js)
    ↓ 
    io.emit('userCount', count)
    ↓
客户端监听器
    ├─ home.js: socket.on('userCount', ...)
    ├─ chat.js: socket.on('userCount', ...)
    ├─ app.js: socket.on('userCount', ...)
    └─ encounter-main.js: socket.on('userCount', ...)
```

### 广播触发条件

1. **新用户连接**:
   ```javascript
   io.on('connection', (socket) => {
       this.broadcastOnlineCount(); // 广播更新后的人数
   });
   ```

2. **用户断开**:
   ```javascript
   socket.on('disconnect', () => {
       this.broadcastOnlineCount(); // 广播更新后的人数
   });
   ```

### 在线人数计算

```javascript
const count = this.io.engine.clientsCount;
```

使用 Socket.io 内部的 `engine.clientsCount` 获取当前连接的客户端总数。

---

## ✅ 预期效果

### 修复前 ❌
```
用户A连接 → 显示 "0人オンライン"
用户B连接 → 显示 "0人オンライン"
```
**原因**: 客户端监听 `userCount`，但服务器发送 `onlineCount`

### 修复后 ✅
```
用户A连接 → 显示 "1人オンライン"
用户B连接 → 两人都显示 "2人オンライン"
用户A断开 → 用户B显示 "1人オンライン"
```
**原因**: 事件名统一为 `userCount`，客户端能正确接收更新

---

## 📝 注意事项

### 1. 实时更新
在线人数是**实时广播**的，所有连接的客户端都会立即收到更新。

### 2. 页面刷新
刷新页面会触发：
1. 旧 Socket 断开 (`disconnect`)
2. 新 Socket 连接 (`connection`)
3. 在线人数保持不变（因为是同一用户）

### 3. 多标签页
同一浏览器打开多个标签页会被计为**多个连接**，每个标签页有独立的 Socket 连接。

### 4. 服务器重启
服务器重启后，所有客户端需要重新连接，在线人数从0开始重新计算。

---

## 🚀 部署建议

### 开发环境
```bash
# 重启服务器以应用修复
npm run dev
```

### 生产环境
```bash
# 推送到 Git 仓库
git add src/controllers/socketController.js public/js/*.js
git commit -m "fix: 修复在线人数显示问题 - 统一事件名为userCount"
git push origin main

# Render 会自动部署
# 等待部署完成后，清除浏览器缓存测试
```

---

## 🎉 总结

### 问题
- ❌ 在线人数始终显示为 **0人**

### 原因
- ❌ 服务器发送 `onlineCount`，客户端监听 `userCount`

### 解决
- ✅ 统一事件名为 `userCount`
- ✅ 修复3个文件（服务器1个 + 客户端2个）

### 结果
- ✅ 在线人数实时正确显示
- ✅ 所有页面同步更新
- ✅ 连接/断开立即生效

---

**🎊 v3.1.2 完成！在线人数显示功能已修复！**


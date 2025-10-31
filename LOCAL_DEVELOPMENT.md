# 🛠️ Sure Link - 本地开发指南

## 🎯 目标

让你可以在 VS Code 中使用 Live Server 实时预览修改效果，同时连接到 Render 的远程数据库。

---

## ⚡ 快速开始（5分钟）

### 步骤 1: 配置环境变量

1. **在项目根目录创建 `.env` 文件**

```bash
# Windows PowerShell
New-Item .env -ItemType File

# Mac/Linux
touch .env
```

2. **复制以下内容到 `.env` 文件**

```env
# 开发模式
NODE_ENV=development
PORT=3000

# Render 数据库 URL（从 Render Dashboard 复制）
DATABASE_URL=postgresql://your_user:your_password@your-host.oregon-postgres.render.com/your_db

# 使用远程数据库
USE_REMOTE_DB=true

# 允许所有本地来源（开发时更方便）
ALLOW_ALL_LOCAL=true

# 详细日志
VERBOSE_LOGGING=true
```

3. **获取 Render 数据库 URL**

- 登录 [Render Dashboard](https://dashboard.render.com/)
- 选择你的 PostgreSQL 数据库
- 复制 **External Database URL**
- 粘贴到 `.env` 文件的 `DATABASE_URL`

---

### 步骤 2: 启动本地服务器

```bash
# 安装依赖（如果还没有）
npm install

# 启动服务器
npm start
```

你应该看到类似的输出：

```
✅ PostgreSQL connected successfully
  environment: development
  database: surelink_db
  isRemote: true
  
✅ Socket.io initialized
  environment: development
  allowedOrigins: 12
  
💡 Local development tips:
   - VS Code Live Server usually runs on http://localhost:5500
   - If CORS issues occur, check ALLOWED_ORIGINS in .env
   - Or set ALLOW_ALL_LOCAL=true for easier development

🚀 Server running on port 3000
```

---

### 步骤 3: 使用 VS Code Live Server

1. **打开 VS Code**
2. **打开项目的 `public` 文件夹**
3. **右键点击 `index.html` → Open with Live Server**
4. **浏览器会自动打开** `http://localhost:5500`

✅ 现在你可以：
- 修改 HTML/CSS/JS 文件
- 保存后自动刷新
- 实时连接到 Render 数据库
- 完整的聊天、地图、遭遇功能

---

## 🔧 工作原理

### 自动环境检测

`public/js/config.js` 会自动检测你的环境：

```javascript
// VS Code Live Server (端口 5500-5599)
if (port >= 5500 && port <= 5599) {
    serverUrl = 'http://localhost:3000';  // 连接本地 Node.js 服务器
}

// 本地开发 (端口 3000)
if (hostname === 'localhost') {
    serverUrl = 'http://localhost:3000';
}

// 生产环境 (Render)
if (hostname.includes('onrender.com')) {
    serverUrl = 'https://sure-link.onrender.com';
}
```

### 数据流

```
VS Code Live Server (5500)
    ↓ HTTP
浏览器
    ↓ WebSocket
本地 Node.js 服务器 (3000)
    ↓ PostgreSQL
Render 数据库（远程）
```

---

## 📁 项目结构

```
sure-link/
├── .env                    # 🔐 本地环境配置（不提交到 Git）
├── ENV_TEMPLATE.md        # 环境配置模板
├── LOCAL_DEVELOPMENT.md   # 本指南
│
├── public/                # 前端文件（Live Server 访问这里）
│   ├── index.html
│   ├── js/
│   │   ├── config.js      # 🆕 自动环境检测
│   │   ├── app.js         # 主页逻辑
│   │   ├── map.js         # 地图逻辑
│   │   ├── chat.js        # 聊天逻辑
│   │   └── encounter-main.js  # 遭遇系统
│   └── css/
│
└── src/                   # 后端文件（Node.js 服务器）
    ├── server.js          # 入口
    ├── config/
    │   ├── database.js    # 🔄 多环境数据库配置
    │   └── socket.js      # 🔄 CORS 配置
    ├── controllers/
    ├── services/
    └── utils/
```

---

## 🐛 常见问题

### Q1: CORS 错误 - "Access-Control-Allow-Origin"

**症状**：浏览器控制台显示：
```
Access to XMLHttpRequest at 'http://localhost:3000' from origin 'http://localhost:5500' 
has been blocked by CORS policy
```

**解决方案**：

1. **检查 Node.js 服务器是否运行**
   ```bash
   # 应该有输出
   npm start
   ```

2. **确认 `.env` 中有 `ALLOW_ALL_LOCAL=true`**
   ```env
   ALLOW_ALL_LOCAL=true
   ```

3. **重启 Node.js 服务器**
   ```bash
   Ctrl+C (停止)
   npm start (重启)
   ```

---

### Q2: 数据库连接失败

**症状**：控制台显示：
```
❌ PostgreSQL connection failed
💡 DATABASE_URL not found!
```

**解决方案**：

1. **检查 `.env` 文件是否存在**
2. **确认 `DATABASE_URL` 正确**
   - 登录 Render Dashboard
   - 复制 **External Database URL**（不是 Internal）
   - 格式：`postgresql://user:pass@host/db`
3. **重启服务器**

---

### Q3: Live Server 端口不是 5500

**症状**：浏览器显示 `http://localhost:5501` 或其他端口

**解决方案**：

**方法1**: 使用 `ALLOW_ALL_LOCAL=true`（推荐）
```env
# .env 文件
ALLOW_ALL_LOCAL=true
```

**方法2**: 添加到白名单
```env
# .env 文件
ALLOWED_ORIGINS=http://localhost:5501,http://127.0.0.1:5501
```

重启 Node.js 服务器生效。

---

### Q4: 修改前端代码后没有更新

**可能原因**：
1. **浏览器缓存** - 按 `Ctrl+F5` 强制刷新
2. **Live Server 未启动** - 重新 Open with Live Server
3. **JavaScript 语法错误** - 检查浏览器控制台

---

### Q5: Socket.io 连接不上

**检查清单**：

1. **打开浏览器控制台**（F12）
2. **查找连接信息**：
   ```
   🔧 Sure Link Configuration:
     Environment: development-live-server
     Server URL: http://localhost:3000
   📡 Connecting to: http://localhost:3000
   ```

3. **如果显示错误**：
   - 确认 Node.js 服务器运行在 3000 端口
   - 检查防火墙设置
   - 尝试 `http://127.0.0.1:3000`

---

## 🚀 高级配置

### 选项 1: 使用本地数据库

如果你想使用本地 PostgreSQL 而不是 Render 数据库：

```env
# .env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/surelink_local
USE_REMOTE_DB=false
```

然后运行迁移：
```bash
npm run migrate
```

---

### 选项 2: 多个开发者同时工作

每个开发者：
1. 创建自己的 `.env` 文件
2. 使用相同的 Render 数据库 URL
3. 使用不同的本地端口（如 3001, 3002）

```env
# 开发者 A
PORT=3000
DATABASE_URL=shared_render_url

# 开发者 B
PORT=3001
DATABASE_URL=shared_render_url
```

---

### 选项 3: 调试模式

在 `.env` 中启用详细日志：

```env
VERBOSE_LOGGING=true
NODE_ENV=development
```

查看更多调试信息：
```javascript
// 浏览器控制台
console.log(window.SureLinkConfig);
```

---

## 📝 开发工作流

### 典型的开发流程

1. **启动后端服务器**
   ```bash
   npm start
   ```

2. **打开 VS Code**
   - 右键 `index.html` → Open with Live Server

3. **修改代码**
   - 编辑 HTML/CSS/JS
   - 保存文件
   - Live Server 自动刷新

4. **查看效果**
   - 浏览器自动更新
   - 检查控制台没有错误

5. **测试功能**
   - 聊天、地图、遭遇系统
   - 所有数据保存到 Render 数据库

6. **提交代码**
   ```bash
   git add .
   git commit -m "feature: xxx"
   git push
   ```

---

## 🎯 最佳实践

### ✅ 推荐

- ✅ 使用 `ALLOW_ALL_LOCAL=true` 简化开发
- ✅ 定期备份数据库
- ✅ 使用 Git 分支开发新功能
- ✅ 在提交前测试所有页面
- ✅ 检查浏览器控制台没有错误

### ❌ 避免

- ❌ 提交 `.env` 文件到 Git
- ❌ 在生产环境使用 `ALLOW_ALL_LOCAL=true`
- ❌ 直接修改 Render 的环境变量
- ❌ 在多个终端重复启动服务器
- ❌ 忘记重启服务器（修改 `.env` 后）

---

## 🔍 调试技巧

### 浏览器控制台

打开控制台（F12），查看：

```javascript
// 环境配置
window.SureLinkConfig
// { environment: "development-live-server", serverUrl: "http://localhost:3000", ... }

// Socket.io 状态
socket.connected
// true 或 false
```

### 服务器日志

Node.js 终端会显示：
- 数据库连接状态
- Socket.io 连接/断开
- CORS 请求
- 错误信息

彩色日志：
- ✅ 绿色：成功
- ⚠️  黄色：警告
- ❌ 红色：错误
- 💡 蓝色：提示

---

## 📚 相关文档

- [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) - 环境配置详解
- [ENCOUNTER_SYSTEM_2.0.md](./ENCOUNTER_SYSTEM_2.0.md) - 遭遇系统文档
- [ENCOUNTER_QUICKSTART.md](./ENCOUNTER_QUICKSTART.md) - 遭遇系统快速开始
- [README.md](./README.md) - 项目总览

---

## 🆘 获取帮助

### 遇到问题？

1. **检查控制台** - 浏览器和 Node.js 终端
2. **查看日志** - 详细的错误信息
3. **重启服务** - 重启 Node.js 和 Live Server
4. **清除缓存** - `Ctrl+F5` 强制刷新

### 还是不行？

- 📖 阅读 [ENV_TEMPLATE.md](./ENV_TEMPLATE.md)
- 🔍 搜索错误信息
- 💬 联系开发团队

---

## ✨ 总结

现在你已经配置好本地开发环境！你可以：

✅ 使用 VS Code Live Server 实时预览  
✅ 连接到 Render 远程数据库  
✅ 完整功能测试（聊天、地图、遭遇）  
✅ 自动环境检测  
✅ 无需手动配置 CORS  

**开始编码吧！** 🚀

---

**Happy Coding!** 💻✨


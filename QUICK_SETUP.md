# ⚡ Sure Link - 本地开发快速设置

## 🎯 3步完成设置

### 第 1 步: 创建配置文件

在项目根目录创建 `.env` 文件：

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=你的Render数据库URL
USE_REMOTE_DB=true
ALLOW_ALL_LOCAL=true
VERBOSE_LOGGING=true
```

### 第 2 步: 启动服务器

```bash
npm start
```

### 第 3 步: 打开 Live Server

在 VS Code 中：
1. 右键 `public/index.html`
2. 点击 **Open with Live Server**

✅ **完成！** 浏览器会自动打开并连接到数据库。

---

## 📍 获取数据库 URL

1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 选择你的 PostgreSQL 数据库
3. 复制 **External Database URL**
4. 粘贴到 `.env` 文件

示例格式：
```
postgresql://user:password@host.oregon-postgres.render.com/database_name
```

---

## 🐛 遇到问题？

### CORS 错误
```env
# 确保 .env 中有这行
ALLOW_ALL_LOCAL=true
```

### 数据库连接失败
```env
# 检查 DATABASE_URL 是否正确
# 必须是 External URL，不是 Internal URL
DATABASE_URL=postgresql://...
```

### 端口冲突
```bash
# 如果 3000 端口被占用，换个端口
PORT=3001
```

---

## 📚 详细文档

- [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) - 完整开发指南
- [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) - 配置详解
- [ENCOUNTER_SYSTEM_2.0.md](./ENCOUNTER_SYSTEM_2.0.md) - 功能文档

---

**就是这么简单！** 🚀


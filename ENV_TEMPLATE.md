# 🔐 环境配置模板

## 快速设置

### 步骤 1: 创建 `.env` 文件

在项目根目录创建 `.env` 文件，复制以下内容：

```env
# ========================================
# Sure Link - 环境配置
# ========================================

# ===== 服务器配置 =====
NODE_ENV=development
PORT=3000

# ===== 数据库配置 =====
# 从 Render 控制台复制你的数据库 External URL
DATABASE_URL=postgresql://username:password@host.region.render.com/database_name

# ===== 开发模式配置 =====
USE_REMOTE_DB=true
VERBOSE_LOGGING=true

# ===== CORS 配置 =====
# VS Code Live Server 默认端口是 5500
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5500,http://127.0.0.1:5500,http://localhost:5501,http://127.0.0.1:5501
```

### 步骤 2: 获取 Render 数据库 URL

1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 进入你的 PostgreSQL 数据库
3. 找到 **External Database URL**
4. 复制完整的连接字符串（格式：`postgresql://user:pass@host/db`）
5. 粘贴到 `.env` 文件的 `DATABASE_URL` 中

### 步骤 3: 配置 `.gitignore`

确保 `.env` 文件不会被提交到 Git：

```
# Environment variables
.env
.env.local
.env.production
```

---

## 🎯 配置说明

### NODE_ENV
- `development` - 本地开发
- `production` - 生产环境（Render 会自动设置）

### PORT
- 本地服务器端口，默认 3000

### DATABASE_URL
- Render PostgreSQL 的外部连接 URL
- 格式：`postgresql://username:password@host:port/database`

### ALLOWED_ORIGINS
- 允许连接的前端域名
- VS Code Live Server 通常使用 `http://localhost:5500`
- 如果运行多个 Live Server，可能是 5501, 5502 等

---

## 🔍 如何找到 VS Code Live Server 端口

1. 在 VS Code 中打开项目
2. 右键点击 `index.html` → **Open with Live Server**
3. 查看浏览器地址栏，通常是：
   - `http://127.0.0.1:5500`
   - `http://localhost:5500`

如果是其他端口（如 5501），添加到 `ALLOWED_ORIGINS` 中。

---

## 📝 完整示例

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://surelink_user:abc123xyz@dpg-xyz123-oregon-postgres.render.com/surelink_db
USE_REMOTE_DB=true
VERBOSE_LOGGING=true
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5500,http://127.0.0.1:5500
```

---

## ⚠️ 安全提醒

- ❌ **不要** 将 `.env` 文件提交到 Git
- ❌ **不要** 在公开场合分享数据库 URL
- ✅ **务必** 确保 `.env` 在 `.gitignore` 中
- ✅ **定期** 更换数据库密码


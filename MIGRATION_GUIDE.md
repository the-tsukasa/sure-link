# 🚀 Sure Link 2.0 迁移指南

## 📋 概述

Sure Link 已从单文件架构升级到 MVC 架构。本指南将帮助您平滑迁移到新版本。

---

## 🔄 主要变化

### 架构变化

**之前（v1.0）**:
```
sure-link/
├── server.js          # 单文件（195行）
└── public/            # 前端文件
```

**现在（v2.0）**:
```
sure-link/
├── src/
│   ├── server.js      # 主入口
│   ├── config/        # 配置
│   ├── controllers/   # 控制器
│   ├── services/      # 业务逻辑
│   ├── middleware/    # 中间件
│   ├── routes/        # API路由
│   └── utils/         # 工具函数
├── migrations/        # 数据库迁移
└── public/            # 前端文件（保持不变）
```

---

## 📦 依赖变化

### 新增依赖

在 `package.json` 中新增了：
- `winston@^3.11.0` - 日志系统

### 安装新依赖

```bash
npm install
```

---

## 🗄️ 数据库迁移

### 1. 备份现有数据

```bash
# 使用 pg_dump 备份数据库
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 2. 运行迁移脚本

```bash
npm run migrate
```

这将创建以下新表：
- `users` - 用户信息表
- `location_history` - 位置历史表
- `encounters` - 遭遇记录表
- `messages` - 消息表（添加索引）

### 3. 验证迁移

访问健康检查端点：
```bash
curl http://localhost:3000/api/health
```

应该看到所有表都已创建。

---

## ⚙️ 环境变量配置

### 1. 创建 .env 文件

```bash
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# 必需
DATABASE_URL=your_postgresql_connection_string
PORT=3000

# 可选
NODE_ENV=production
LOG_LEVEL=info
ALLOWED_ORIGINS=https://your-domain.com
ADMIN_SECRET=your_secret_key
```

---

## 🚀 启动新版本

### 开发环境

```bash
npm run dev
```

### 生产环境

```bash
npm start
```

---

## 🔍 功能对比

### 新增功能

| 功能 | v1.0 | v2.0 |
|------|------|------|
| **速率限制** | ❌ | ✅ |
| **日志系统** | 基础 console.log | ✅ Winston |
| **错误处理** | 基础 | ✅ 统一错误处理 |
| **数据库索引** | ❌ | ✅ |
| **位置历史** | 仅内存 | ✅ 持久化 |
| **遭遇记录** | 仅实时 | ✅ 持久化 |
| **监控统计** | ❌ | ✅ |
| **健康检查** | 简单 | ✅ 详细 |
| **API文档** | ❌ | ✅ |

### 保持不变

- ✅ 前端代码（HTML/CSS/JS）完全兼容
- ✅ Socket.io 事件名称不变
- ✅ API 端点保持向后兼容
- ✅ 用户体验无变化

---

## 🔐 安全性增强

### 1. CORS 限制

新版本默认限制跨域请求。在 `.env` 中配置：

```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

### 2. 速率限制

自动应用以下限制：
- 聊天消息：每分钟最多 10 条
- 位置更新：每分钟最多 60 次
- 一般操作：每分钟最多 30 次

### 3. XSS 防护

所有用户输入都经过清理，移除 HTML 标签。

---

## 📊 监控和日志

### 查看日志

日志文件位于 `logs/` 目录：
- `error.log` - 错误日志
- `combined.log` - 所有日志

### 监控端点

**健康检查**:
```
GET /api/health
```

**Socket 统计**:
```
GET /api/socket-stats
```

**应用统计**:
```
GET /api/stats
```

---

## 🐛 常见问题

### Q1: 数据库连接失败

**A**: 检查 `.env` 中的 `DATABASE_URL` 是否正确。

```bash
# 测试连接
psql $DATABASE_URL -c "SELECT 1"
```

### Q2: Socket.io 连接被拒绝

**A**: 检查 CORS 配置，确保您的域名在允许列表中。

### Q3: 旧消息不见了

**A**: 如果您没有备份，旧的 `messages` 表数据应该仍在。检查表是否存在：

```sql
SELECT COUNT(*) FROM messages;
```

### Q4: 性能下降

**A**: 检查数据库索引是否正确创建：

```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'messages';
```

---

## 🔄 回滚到 v1.0

如果遇到问题，可以回滚：

### 1. 恢复旧代码

```bash
git checkout v1.0
npm install
```

### 2. 恢复数据库

```bash
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

### 3. 启动旧版本

```bash
npm start
```

---

## 📝 测试清单

迁移后，请测试以下功能：

- [ ] 用户可以连接到服务器
- [ ] 聊天消息正常发送和接收
- [ ] 位置更新正常工作
- [ ] 遭遇检测正常触发
- [ ] 健康检查端点可访问
- [ ] 日志文件正确创建
- [ ] PWA 离线功能正常
- [ ] Service Worker 正常运行

---

## 🆘 获取帮助

如果遇到问题：

1. 检查日志文件 `logs/error.log`
2. 访问 `/api/health` 查看系统状态
3. 查看 GitHub Issues
4. 联系开发团队

---

## 📚 相关文档

- [架构优化建议](ARCHITECTURE_OPTIMIZATION.md)
- [设计系统文档](DESIGN_SYSTEM.md)
- [API 文档](API_DOCUMENTATION.md)

---

**迁移完成后，建议在生产环境部署前进行充分测试！** 🎉


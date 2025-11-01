# 🌐 Sure Link - Real-time Location-based SNS

<div align="center">

![Version](https://img.shields.io/badge/version-3.1.2-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

**A Progressive Web App for real-time chatting and location-based encounters**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API](#-api) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 💬 Real-time Chat
- Instant messaging with Socket.io
- **Message history persistence** (localStorage, up to 100 messages)
- Automatic history loading on page refresh
- XSS protection and rate limiting

### 📍 Location-based Features
- Real-time location sharing
- **Encounter detection** (within 50m)
- Interactive map with Leaflet
- **Encounter history & collection** with like function
- Location history tracking

### 📱 Progressive Web App
- **APP-style home screen** with feature cards and quick actions
- Installable on mobile and desktop
- Offline support with Service Worker
- **Dark mode Apple-style UI** (blue + purple theme)
- Fully responsive layout

### 🔐 Security
- CORS restrictions
- Input validation and sanitization
- Rate limiting on all Socket events
- Secure database connections

### 📊 Monitoring
- Winston logging system
- Performance monitoring
- Health check endpoints
- Real-time statistics

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sure-link.git
cd sure-link

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migration
npm run migrate

# Start the server
npm start
```

The application will be available at `http://localhost:3000`

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express
- Socket.io (WebSocket)
- PostgreSQL
- Winston (Logging)

**Frontend:**
- Vanilla JavaScript (ES6+)
- HTML5 + CSS3
- Service Worker
- Leaflet (Maps)

### Project Structure

```
sure-link/
├── src/
│   ├── server.js           # Main entry point
│   ├── config/             # Configuration
│   │   ├── database.js     # Database connection
│   │   └── socket.js       # Socket.io config
│   ├── controllers/        # Request handlers
│   │   ├── chatController.js
│   │   ├── locationController.js
│   │   └── socketController.js
│   ├── services/           # Business logic
│   │   ├── chatService.js
│   │   ├── locationService.js
│   │   └── validationService.js
│   ├── middleware/         # Middleware
│   │   ├── rateLimit.js
│   │   ├── errorHandler.js
│   │   └── monitoring.js
│   ├── routes/             # API routes
│   │   └── api.js
│   └── utils/              # Utilities
│       ├── logger.js
│       └── distance.js
├── migrations/             # Database migrations
│   ├── 001_initial_schema.sql
│   └── migrate.js
├── public/                 # Frontend files
│   ├── index.html         # APP home screen
│   ├── chat.html          # Chat with history
│   ├── map.html           # Location sharing
│   ├── profile.html       # Profile + encounters
│   ├── encounter.html     # Encounter system
│   ├── welcome.html       # Welcome screen
│   ├── css/               # Stylesheets (v2.3.0)
│   ├── js/                # JavaScript modules
│   └── sw.js              # Service Worker (v8)
└── logs/                   # Log files (auto-generated)
```

---

## 📡 API

### REST Endpoints

#### Health Check
```
GET /api/health
```
Returns server and database status.

#### Statistics
```
GET /api/socket-stats
GET /api/stats
```
Returns application statistics.

### Socket.io Events

#### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `chatMessage` | `{ user, text, id }` | Send chat message |
| `updateLocation` | `{ lat, lng, nickname }` | Update user location |
| `getNearbyUsers` | `{ radius }` | Query nearby users |

#### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `onlineCount` | `number` | Online users count |
| `chatHistory` | `Array` | Historical messages |
| `chatMessage` | `Object` | New message |
| `updateUsers` | `Object` | All user locations |
| `encounter` | `{ user, distance }` | Encounter notification |

---

## 🔧 Configuration

### Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=3000

# Optional
NODE_ENV=production
LOG_LEVEL=info
ALLOWED_ORIGINS=https://your-domain.com
ADMIN_SECRET=your_secret_key
```

### Rate Limits

- Chat messages: 10/minute
- Location updates: 60/minute
- General operations: 30/minute

---

## 📚 Documentation

### Available Docs
- [🛠️ Local Development Guide](LOCAL_DEVELOPMENT.md) - Complete setup guide for local development
- [🔧 Troubleshooting Guide](TROUBLESHOOTING.md) - Fix icon display issues, cache problems, and more
- [🎨 CSS Refactoring v3.0](CSS_REFACTORING_V3.md) - CSS architecture refactoring documentation ⭐ NEW
- [🚨 CDN Fix Summary](CDN_FIX_SUMMARY.md) - Font Awesome 403 error fix documentation
- [🧪 Diagnostic Tool](/diagnostic.html) - Online tool to check Font Awesome and CSS status

### Latest Updates

**v3.1.2** (2024-11-01) 🐛 **Online User Count Fix**
- 🔧 **修复在线人数显示问题**
  - 统一Socket.io事件名：`onlineCount` → `userCount`
  - 修复服务器端广播事件名 (`socketController.js`)
  - 修复客户端监听事件名 (`encounter-main.js`, `app.js`)
- ✅ **影响页面**
  - 主页 (`index.html`): 顶部状态栏 + 统计卡片
  - 聊天页 (`chat.html`): 聊天室头部
  - 遭遇页 (`encounter.html`): 附近用户数
- 🎯 **预期效果**: 在线人数实时正确显示，多用户连接时同步更新
- 📖 **完整文档** - [ONLINE_COUNT_FIX.md](ONLINE_COUNT_FIX.md)

**v3.1.1** (2024-11-01) 🔧 **Linter Warnings Fix**
- 🛠️ **修复所有Linter警告（18个 → 0个）**
  - 删除过时的 `-webkit-overflow-scrolling` 属性（3处）
  - 移除HTML内联样式，创建CSS类（13处）
  - 新增通用工具类：`.hidden`、`.empty-state`
  - 创建 `diagnostic.css` 管理诊断页面样式
- ✅ **代码质量提升**
  - 样式与结构完全分离
  - 提高可维护性和复用性
  - 优化Service Worker缓存策略
- 📖 **完整文档** - [LINT_FIXES_V3.1.md](LINT_FIXES_V3.1.md)

**v3.1.0** (2024-11-01) 💬 **Chat Layout Optimization**
- 🎨 **聊天页面布局重构**
  - ✅ 修复对方消息气泡白底白字问题（改为深色文字）
  - ✅ 优化消息布局：昵称+头像垂直堆叠在一侧，气泡在另一侧
  - ✅ 本人消息完全靠右对齐
  - ✅ 采用CSS Grid布局：2列x2行结构
- 🎯 **布局特点**
  - **对方消息**：左上"昵称" + 左下"头像" | 右侧"气泡"
  - **本人消息**：左侧"气泡" | 右上"昵称" + 右下"头像"
  - 头像尺寸增大至40px，提升可见性
  - 昵称和头像颜色区分（对方：蓝色，本人：紫色）
- 🔄 **Service Worker v3.1.0** - 更新缓存策略

**v3.0.0** (2024-10-31) 🎉 **Major Refactoring**
- 🎨 **CSS轻量拆分架构重构**
  - 新增 `core.css` (134行) - CSS变量、重置、基础样式
  - 新增 `layout.css` (82行) - 导航栏、容器布局
  - 新增 `components.css` (117行) - 按钮、表单、通用组件
  - 页面CSS移至 `pages/` 文件夹（chat, map, profile, encounter等）
- ✅ **架构优势**
  - 职责清晰分离（核心、布局、组件、页面）
  - 易于维护和扩展
  - 提高代码复用性
  - 为HTML组件化打基础
- 📖 **完整文档** - [CSS_REFACTORING_V3.md](CSS_REFACTORING_V3.md)
- 🔄 **Service Worker v3.0.0** - 更新缓存策略

**v2.4.6** (2024-10-31)
- 📱 **桌面端响应式布局优化**
  - 修复 `index.html` 和 `profile.html` 在桌面浏览器上显示为手机大小的问题
  - 新增桌面端媒体查询：768px（平板）、1024px（桌面）、1440px（大屏）
  - `profile.css` - `.glass-card` 桌面端最大宽度：1000px
  - `style.css` - `.app-home` 桌面端最大宽度：1400px
- ✅ **Service Worker v21** - 更新缓存策略
- 🎯 **与 chat/map 页面布局统一** - 所有页面现在都能在桌面端正常平铺

**v2.4.5** (2024-10-31) ⭐ **Critical Fix**
- 🚨 **解决 Font Awesome 403 错误**
  - 从 `kit.fontawesome.com` 切换到 `cdnjs.cloudflare.com` 公共CDN
  - 使用 Font Awesome 6.5.1 CSS版本（更稳定）
  - 添加 SRI 完整性校验
  - 所有6个HTML文件已更新
- ✅ **公共CDN优势**
  - 无需API Key，无配额限制
  - Cloudflare全球加速
  - 防篡改安全保护
- 📊 **Service Worker v20** - 更新缓存策略

**v2.4.4** (2024-10-31)
- 🔧 **Fixed icon display issues** in chat and map headers
  - Added explicit font-size and line-height for all icon buttons
  - Fixed `.close-panel` button icon rendering
  - Improved `.icon-btn` CSS specificity
- 🧪 **New diagnostic tool** (`/diagnostic.html`)
  - Visual Font Awesome icon test
  - Real-time browser environment detection
  - Troubleshooting guidance
- 📖 **Comprehensive troubleshooting guide** ([TROUBLESHOOTING.md](TROUBLESHOOTING.md))
  - Decision tree for icon display issues
  - PWA cache management strategies
  - Network connectivity debugging
- ✅ **Service Worker v19** with improved caching

**v2.3.0** (2024-10-31)
- 💬 **APP-style chat interface** with rich features
  - Chat room header with online users
  - Quick reply buttons
  - Input toolbar (emoji, photo, voice, more)
  - Online users sidebar & chat settings panel
- 🗺️ **APP-style map interface** with enhanced controls
  - Modern map header with GPS status
  - Floating control buttons (scan, center, track, history)
  - Nearby users panel with real-time list
  - Map settings panel with toggles
  - Encounter notification cards with animations
  - Real-time statistics (online users, encounters, accuracy)

**v2.2.0** (2024-10-31)
- 🏠 APP-style home screen with feature cards
- 💬 Chat history persistence (100 messages)
- 📊 Real-time statistics and activity feed
- 🚀 Quick action buttons

**v2.1.0** (2024-10-31)
- 👋 Encounter history & collection feature
- 🌙 Dark mode as default theme
- 🎨 Unified blue + purple color scheme

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 📦 Database Schema

### Tables

- **users** - User profiles and status
- **messages** - Chat message history
- **location_history** - Location tracking
- **encounters** - Encounter records

### Indexes

Optimized indexes on:
- User socket IDs and nicknames
- Message timestamps
- Location timestamps
- Encounter participants

---

## 🔒 Security

### Implemented

- ✅ CORS restrictions
- ✅ Rate limiting
- ✅ XSS protection
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ Secure database connections

### Best Practices

- Regular dependency updates
- Environment variable management
- Secure password handling (when implemented)
- HTTPS in production

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure database connection
- [ ] Set up HTTPS
- [ ] Configure CORS whitelist
- [ ] Set admin secret
- [ ] Enable log rotation
- [ ] Set up monitoring
- [ ] Test all endpoints

### Recommended Platforms

- **Backend**: Render, Heroku, Railway
- **Database**: Render PostgreSQL, Supabase, Neon
- **Static Assets**: CDN (optional)

---

## 📊 Monitoring

### Logs

Logs are stored in `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs

### Health Check

```bash
curl http://localhost:3000/api/health
```

Returns:
- Database connection status
- Server uptime
- Memory usage
- Connection pool stats

---

## 🎯 Features Overview

### Home Screen (index.html)
- Personalized welcome banner
- 4 feature cards (Chat, Map, Encounters, Profile)
- Quick action buttons (Location, Notifications, Settings, Help)
- Recent activity feed
- Real-time statistics

### Chat (chat.html)
- Real-time messaging
- **Persistent history** (localStorage)
- Auto-load on refresh
- Clear history function: `clearChatHistory()`

### Profile (profile.html)
- User information
- **Encounter history cards** with avatars
- Like function with animation
- Statistics display

### Map (map.html)
- Real-time user locations
- Encounter detection (50m radius)
- Interactive Leaflet map

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update CSS/JS versions (see [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md))
5. Submit a pull request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👥 Authors

- **Sure Link Team** - Initial work

---

## 🙏 Acknowledgments

- Socket.io for real-time communication
- Leaflet for mapping
- PostgreSQL for reliable data storage
- Winston for excellent logging
- The open-source community

---

## 🔧 Quick Commands

### View Chat History
```javascript
// Browser console
const history = JSON.parse(localStorage.getItem('chatHistory'));
console.log(history);
```

### Clear Chat History
```javascript
clearChatHistory(); // or
localStorage.removeItem('chatHistory');
```

### Check Version
```javascript
// Check Service Worker cache version
caches.keys().then(keys => console.log(keys)); // Should show: surelink-v6
```

---

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/sure-link/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/sure-link/discussions)
- 📖 Docs: See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for detailed guides

---

<div align="center">

**Made with ❤️ by Sure Link Team**

⭐ Star us on GitHub if you find this project useful!

</div>

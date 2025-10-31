# 🌐 Sure Link - Real-time Location-based SNS

<div align="center">

![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)
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
│   ├── css/               # Stylesheets (v2.2.0)
│   ├── js/                # JavaScript modules
│   └── sw.js              # Service Worker (v6)
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

### Latest Updates

**v2.2.0** (2024-10-31)
- 🏠 APP-style home screen with feature cards
- 💬 Chat history persistence (100 messages)
- 📊 Real-time statistics and activity feed
- 🚀 Quick action buttons

**v2.1.0** (2024-10-31)
- 👋 Encounter history & collection feature
- 🌙 Dark mode as default theme
- 🎨 Unified blue + purple color scheme

**v2.0.0** (2024-10-30)
- 🏗️ MVC architecture refactoring
- 🔐 Enhanced security (CORS, rate limiting)
- 📊 PostgreSQL database with migrations

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

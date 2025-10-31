// src/server.js - 重构后的主服务器文件
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 配置
import { pool, testConnection } from './config/database.js';
import { initializeSocket } from './config/socket.js';

// 控制器
import { SocketController } from './controllers/socketController.js';

// 中间件
import { errorHandler, notFoundHandler, setupGlobalErrorHandlers } from './middleware/errorHandler.js';
import { performanceMonitoring, requestLogger } from './middleware/monitoring.js';

// 路由
import apiRoutes from './routes/api.js';

// 工具
import { logger } from './utils/logger.js';

// 加载环境变量
dotenv.config();

// 设置 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== 初始化 Express =====
const app = express();
const server = http.createServer(app);

// ===== 中间件 =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志和性能监控
if (process.env.NODE_ENV !== 'production') {
    app.use(requestLogger);
}
app.use(performanceMonitoring);

// ===== 静态文件 =====
app.use(express.static(path.join(__dirname, '..', 'public')));

// ===== API 路由 =====
app.use('/api', apiRoutes);

// ===== 根路径 =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'welcome.html'));
});

// ===== Socket.io 初始化 =====
const io = initializeSocket(server);
const socketController = new SocketController(io, pool);

// ===== 额外的 API 端点（需要 Socket 控制器） =====
app.get('/api/socket-stats', async (req, res) => {
    try {
        const stats = await socketController.getStatistics();
        res.json(stats);
    } catch (err) {
        logger.error('Failed to get socket stats:', err.message);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// ===== 错误处理 =====
app.use(notFoundHandler);
app.use(errorHandler);

// 设置全局错误处理器
setupGlobalErrorHandlers();

// ===== 启动服务器 =====
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // 测试数据库连接
        const dbConnected = await testConnection();
        if (!dbConnected) {
            throw new Error('Database connection failed');
        }

        // 启动服务器
        server.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🌍 Access at: http://localhost:${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start server:', {
            error: err.message,
            stack: err.stack
        });
        process.exit(1);
    }
}

// 优雅关闭
async function gracefulShutdown(signal) {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    
    server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
            await pool.end();
            logger.info('Database connections closed');
            process.exit(0);
        } catch (err) {
            logger.error('Error during shutdown:', err.message);
            process.exit(1);
        }
    });
    
    // 强制退出（如果10秒后还未关闭）
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 启动服务器
startServer();

export { app, server, io };


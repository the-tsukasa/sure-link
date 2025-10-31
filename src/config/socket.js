// src/config/socket.js
import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

/**
 * 允许的来源列表
 */
const allowedOrigins = [
    // Node.js 服务器
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // VS Code Live Server 常用端口
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5501',
    'http://127.0.0.1:5501',
    'http://localhost:5502',
    'http://127.0.0.1:5502',
    // 生产环境
    'https://sure-link.onrender.com'
];

// 从环境变量添加额外的域名
if (process.env.ALLOWED_ORIGINS) {
    const extraOrigins = process.env.ALLOWED_ORIGINS
        .split(',')
        .map(origin => origin.trim())
        .filter(origin => origin.length > 0);
    allowedOrigins.push(...extraOrigins);
}

// 开发模式：允许所有 localhost 和 127.0.0.1
const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment && process.env.ALLOW_ALL_LOCAL === 'true') {
    logger.warn('⚠️  ALLOW_ALL_LOCAL enabled - All localhost origins allowed');
}

/**
 * Socket.io 配置
 */
export const socketConfig = {
    cors: {
        origin: (origin, callback) => {
            // 允许没有 origin 的请求（如移动应用、Postman）
            if (!origin) {
                return callback(null, true);
            }
            
            // 开发模式且启用 ALLOW_ALL_LOCAL：允许所有本地来源
            if (isDevelopment && process.env.ALLOW_ALL_LOCAL === 'true') {
                if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
                    return callback(null, true);
                }
            }
            
            // 检查白名单
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                logger.warn('❌ CORS blocked:', {
                    origin,
                    allowed: allowedOrigins.slice(0, 5),
                    hint: isDevelopment ? 'Add to ALLOWED_ORIGINS in .env' : 'Update production whitelist'
                });
                callback(new Error('CORS policy violation'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST']
    },
    // 连接超时设置
    pingTimeout: 60000,
    pingInterval: 25000,
    // 传输方式
    transports: ['websocket', 'polling']
};

/**
 * 初始化 Socket.io
 */
export function initializeSocket(server) {
    const io = new Server(server, socketConfig);
    
    logger.info('✅ Socket.io initialized', {
        environment: isDevelopment ? 'development' : 'production',
        allowedOrigins: allowedOrigins.length,
        sampleOrigins: allowedOrigins.slice(0, 3),
        allowAllLocal: process.env.ALLOW_ALL_LOCAL === 'true'
    });
    
    if (isDevelopment) {
        logger.info('💡 Local development tips:');
        logger.info('   - VS Code Live Server usually runs on http://localhost:5500');
        logger.info('   - If CORS issues occur, check ALLOWED_ORIGINS in .env');
        logger.info('   - Or set ALLOW_ALL_LOCAL=true for easier development');
    }
    
    return io;
}


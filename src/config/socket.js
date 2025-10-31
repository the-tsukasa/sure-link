// src/config/socket.js
import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

/**
 * 允许的来源列表
 */
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://sure-link.onrender.com'
];

// 从环境变量添加额外的域名
if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
}

/**
 * Socket.io 配置
 */
export const socketConfig = {
    cors: {
        origin: (origin, callback) => {
            // 允许没有 origin 的请求（如移动应用）
            if (!origin) {
                return callback(null, true);
            }
            
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                logger.warn('CORS blocked:', origin);
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
    
    logger.info('Socket.io initialized with CORS:', {
        allowedOrigins
    });
    
    return io;
}


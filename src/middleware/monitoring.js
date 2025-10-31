// src/middleware/monitoring.js
import { logger } from '../utils/logger.js';

/**
 * 性能监控中间件
 */
export function performanceMonitoring(req, res, next) {
    const start = Date.now();
    
    // 监听响应完成
    res.on('finish', () => {
        const duration = Date.now() - start;
        
        logger.info('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent')
        });
        
        // 警告慢请求
        if (duration > 1000) {
            logger.warn('Slow request detected', {
                method: req.method,
                url: req.url,
                duration: `${duration}ms`
            });
        }
    });
    
    next();
}

/**
 * 请求日志中间件
 */
export function requestLogger(req, res, next) {
    logger.debug('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    
    next();
}

/**
 * Socket.io 连接监控
 */
export class SocketMonitor {
    constructor() {
        this.connections = new Map(); // { socketId: { connectedAt, events: [] } }
    }

    /**
     * 记录新连接
     */
    onConnect(socket) {
        this.connections.set(socket.id, {
            connectedAt: Date.now(),
            events: [],
            lastActivity: Date.now()
        });

        logger.info('Socket connected', {
            socketId: socket.id.slice(0, 8),
            totalConnections: this.connections.size
        });
    }

    /**
     * 记录事件
     */
    onEvent(socket, eventName) {
        const connection = this.connections.get(socket.id);
        if (connection) {
            connection.events.push({
                name: eventName,
                timestamp: Date.now()
            });
            connection.lastActivity = Date.now();
            
            // 限制事件记录数量
            if (connection.events.length > 100) {
                connection.events = connection.events.slice(-100);
            }
        }
    }

    /**
     * 记录断开连接
     */
    onDisconnect(socket) {
        const connection = this.connections.get(socket.id);
        if (connection) {
            const duration = Date.now() - connection.connectedAt;
            
            logger.info('Socket disconnected', {
                socketId: socket.id.slice(0, 8),
                duration: `${Math.round(duration / 1000)}s`,
                totalEvents: connection.events.length,
                totalConnections: this.connections.size - 1
            });
            
            this.connections.delete(socket.id);
        }
    }

    /**
     * 获取连接统计
     */
    getStatistics() {
        const now = Date.now();
        const connections = Array.from(this.connections.values());
        
        return {
            total: connections.length,
            averageDuration: connections.reduce((sum, conn) => 
                sum + (now - conn.connectedAt), 0) / connections.length || 0,
            totalEvents: connections.reduce((sum, conn) => 
                sum + conn.events.length, 0)
        };
    }
}

export const socketMonitor = new SocketMonitor();


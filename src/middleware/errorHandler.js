// src/middleware/errorHandler.js
import { logger } from '../utils/logger.js';

/**
 * Express 错误处理中间件
 */
export function errorHandler(err, req, res, next) {
    logger.error('Express error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // 默认错误响应
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message;

    res.status(status).json({
        error: {
            message,
            status
        }
    });
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(req, res) {
    logger.warn('404 Not Found:', {
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    res.status(404).json({
        error: {
            message: 'Not Found',
            status: 404
        }
    });
}

/**
 * Socket.io 错误处理器
 */
export class SocketErrorHandler {
    /**
     * 处理 Socket 事件中的错误
     * @param {Object} socket - Socket 实例
     * @param {Error} error - 错误对象
     * @param {string} event - 事件名称
     */
    static handleError(socket, error, event) {
        logger.error('Socket error:', {
            socketId: socket.id.slice(0, 8),
            event,
            error: error.message,
            stack: error.stack
        });

        // 向客户端发送错误消息
        socket.emit('error', {
            message: error.message || 'エラーが発生しました',
            event,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 包装 Socket 事件处理器，自动捕获错误
     * @param {Function} handler - 事件处理函数
     * @param {string} eventName - 事件名称
     * @returns {Function} 包装后的处理函数
     */
    static wrap(handler, eventName) {
        return async function(socket, ...args) {
            try {
                await handler(socket, ...args);
            } catch (error) {
                SocketErrorHandler.handleError(socket, error, eventName);
            }
        };
    }
}

/**
 * 未捕获异常处理
 */
export function setupGlobalErrorHandlers() {
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', {
            error: error.message,
            stack: error.stack
        });
        
        // 给予时间记录日志后退出
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection:', {
            reason: reason instanceof Error ? reason.message : reason,
            stack: reason instanceof Error ? reason.stack : undefined
        });
    });
}


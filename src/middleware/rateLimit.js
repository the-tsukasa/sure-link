// src/middleware/rateLimit.js
import { logger } from '../utils/logger.js';

/**
 * Socket.io 速率限制器
 */
export class SocketRateLimiter {
    constructor(maxRequests = 10, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map(); // { socketId: [timestamp1, timestamp2, ...] }
        
        // 定期清理过期数据
        this.startCleanup();
    }

    /**
     * 检查请求是否超过限制
     * @param {string} socketId - Socket ID
     * @param {string} event - 事件名称
     * @returns {boolean} true 表示允许，false 表示超限
     */
    check(socketId, event = 'default') {
        const key = `${socketId}:${event}`;
        const now = Date.now();
        
        // 获取该 socket 的请求记录
        const userRequests = this.requests.get(key) || [];
        
        // 清理过期的请求记录
        const validRequests = userRequests.filter(
            time => now - time < this.windowMs
        );
        
        // 检查是否超过限制
        if (validRequests.length >= this.maxRequests) {
            logger.warn('Rate limit exceeded', {
                socketId: socketId.slice(0, 8),
                event,
                requests: validRequests.length
            });
            return false;
        }
        
        // 添加当前请求
        validRequests.push(now);
        this.requests.set(key, validRequests);
        
        return true;
    }

    /**
     * 重置某个 socket 的限制
     * @param {string} socketId 
     */
    reset(socketId) {
        // 删除所有该 socket 相关的记录
        for (const key of this.requests.keys()) {
            if (key.startsWith(socketId)) {
                this.requests.delete(key);
            }
        }
    }

    /**
     * 定期清理过期数据
     */
    startCleanup() {
        setInterval(() => {
            const now = Date.now();
            let cleaned = 0;
            
            for (const [key, requests] of this.requests.entries()) {
                const validRequests = requests.filter(
                    time => now - time < this.windowMs
                );
                
                if (validRequests.length === 0) {
                    this.requests.delete(key);
                    cleaned++;
                } else if (validRequests.length < requests.length) {
                    this.requests.set(key, validRequests);
                }
            }
            
            if (cleaned > 0) {
                logger.debug(`Cleaned ${cleaned} expired rate limit records`);
            }
        }, this.windowMs);
    }

    /**
     * 获取剩余请求次数
     * @param {string} socketId 
     * @param {string} event 
     * @returns {number} 剩余次数
     */
    getRemaining(socketId, event = 'default') {
        const key = `${socketId}:${event}`;
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];
        
        const validRequests = userRequests.filter(
            time => now - time < this.windowMs
        );
        
        return Math.max(0, this.maxRequests - validRequests.length);
    }
}

/**
 * 创建速率限制中间件工厂
 * @param {number} maxRequests - 最大请求数
 * @param {number} windowMs - 时间窗口（毫秒）
 * @returns {SocketRateLimiter} 限制器实例
 */
export function createSocketRateLimiter(maxRequests = 10, windowMs = 60000) {
    return new SocketRateLimiter(maxRequests, windowMs);
}

/**
 * 预设的速率限制器
 */
export const rateLimiters = {
    // 聊天消息：每分钟最多 10 条
    chat: new SocketRateLimiter(10, 60000),
    
    // 位置更新：每分钟最多 60 次（即每秒1次）
    location: new SocketRateLimiter(60, 60000),
    
    // 一般操作：每分钟最多 30 次
    general: new SocketRateLimiter(30, 60000)
};


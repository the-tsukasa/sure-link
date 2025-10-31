// src/services/chatService.js
import { logger } from '../utils/logger.js';
import { ValidationService } from './validationService.js';

/**
 * 聊天服务 - 处理聊天相关的业务逻辑
 */
export class ChatService {
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * 获取聊天历史
     * @param {number} limit - 消息数量限制
     * @returns {Promise<Array>} 消息列表
     */
    async getHistory(limit = 50) {
        try {
            const result = await this.pool.query(
                'SELECT username, text, created_at FROM messages ORDER BY created_at DESC LIMIT $1',
                [limit]
            );
            
            // 按时间正序返回
            return result.rows.reverse();
        } catch (err) {
            logger.error('Failed to load chat history:', {
                error: err.message,
                stack: err.stack
            });
            throw err;
        }
    }

    /**
     * 保存消息到数据库
     * @param {string} username - 用户名
     * @param {string} text - 消息文本
     * @returns {Promise<Object>} 保存的消息对象
     */
    async saveMessage(username, text) {
        try {
            const result = await this.pool.query(
                'INSERT INTO messages (username, text) VALUES ($1, $2) RETURNING id, created_at',
                [username, text]
            );
            
            logger.info('Message saved', { 
                username, 
                messageId: result.rows[0].id 
            });
            
            return result.rows[0];
        } catch (err) {
            logger.error('Failed to save message:', {
                error: err.message,
                username,
                stack: err.stack
            });
            throw err;
        }
    }

    /**
     * 处理新消息（验证 + 清理 + 保存）
     * @param {Object} msgData - 原始消息数据
     * @returns {Promise<Object>} 处理后的消息对象
     */
    async processMessage(msgData) {
        // 验证
        const validation = ValidationService.validateMessage(msgData);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // 清理数据
        const cleanData = ValidationService.sanitizeMessage(msgData);
        
        // 保存到数据库
        await this.saveMessage(cleanData.user, cleanData.text);
        
        return cleanData;
    }

    /**
     * 删除旧消息（数据清理）
     * @param {number} days - 保留天数
     * @returns {Promise<number>} 删除的消息数量
     */
    async deleteOldMessages(days = 30) {
        try {
            const result = await this.pool.query(
                'DELETE FROM messages WHERE created_at < NOW() - INTERVAL \'$1 days\' RETURNING id',
                [days]
            );
            
            const count = result.rowCount;
            logger.info(`Deleted ${count} old messages (older than ${days} days)`);
            
            return count;
        } catch (err) {
            logger.error('Failed to delete old messages:', err.message);
            throw err;
        }
    }

    /**
     * 获取消息统计
     * @returns {Promise<Object>} 统计信息
     */
    async getStatistics() {
        try {
            const totalResult = await this.pool.query(
                'SELECT COUNT(*) as total FROM messages'
            );
            
            const todayResult = await this.pool.query(
                'SELECT COUNT(*) as today FROM messages WHERE created_at >= CURRENT_DATE'
            );
            
            return {
                total: parseInt(totalResult.rows[0].total),
                today: parseInt(todayResult.rows[0].today)
            };
        } catch (err) {
            logger.error('Failed to get chat statistics:', err.message);
            throw err;
        }
    }
}


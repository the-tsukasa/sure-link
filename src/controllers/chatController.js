// src/controllers/chatController.js
import { ChatService } from '../services/chatService.js';
import { logger } from '../utils/logger.js';
import { SocketErrorHandler } from '../middleware/errorHandler.js';
import { rateLimiters } from '../middleware/rateLimit.js';

/**
 * 聊天控制器 - 处理聊天相关的 Socket 事件
 */
export class ChatController {
    constructor(io, pool) {
        this.io = io;
        this.chatService = new ChatService(pool);
    }

    /**
     * 初始化聊天事件监听
     * @param {Object} socket - Socket 实例
     */
    initializeEvents(socket) {
        // 发送聊天历史
        this.sendHistory(socket);

        // 监听新消息
        socket.on('chatMessage', async (msgData) => {
            await this.handleMessage(socket, msgData);
        });
    }

    /**
     * 发送聊天历史给新连接的用户
     * @param {Object} socket - Socket 实例
     */
    async sendHistory(socket) {
        try {
            const history = await this.chatService.getHistory(50);
            socket.emit('chatHistory', history);
            
            logger.debug('Chat history sent', {
                socketId: socket.id.slice(0, 8),
                messageCount: history.length
            });
        } catch (error) {
            SocketErrorHandler.handleError(socket, error, 'chatHistory');
        }
    }

    /**
     * 处理新聊天消息
     * @param {Object} socket - Socket 实例
     * @param {Object} msgData - 消息数据
     */
    async handleMessage(socket, msgData) {
        try {
            // 速率限制检查
            if (!rateLimiters.chat.check(socket.id, 'chatMessage')) {
                socket.emit('error', {
                    message: 'メッセージ送信が速すぎます。少しお待ちください。'
                });
                return;
            }

            // 处理消息（验证 + 清理 + 保存）
            const cleanData = await this.chatService.processMessage(msgData);
            
            // 广播给所有客户端
            this.io.emit('chatMessage', cleanData);
            
            logger.info('Message broadcasted', {
                user: cleanData.user,
                socketId: socket.id.slice(0, 8)
            });
        } catch (error) {
            SocketErrorHandler.handleError(socket, error, 'chatMessage');
        }
    }

    /**
     * 获取聊天统计
     * @returns {Promise<Object>} 统计信息
     */
    async getStatistics() {
        try {
            return await this.chatService.getStatistics();
        } catch (error) {
            logger.error('Failed to get chat statistics:', error.message);
            return { total: 0, today: 0 };
        }
    }
}


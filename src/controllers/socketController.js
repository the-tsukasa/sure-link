// src/controllers/socketController.js
import { ChatController } from './chatController.js';
import { LocationController } from './locationController.js';
import { EncounterController } from './encounterController.js';
import { logger } from '../utils/logger.js';
import { socketMonitor } from '../middleware/monitoring.js';

/**
 * Socket 主控制器 - 协调所有 Socket 相关的控制器
 */
export class SocketController {
    constructor(io, pool) {
        this.io = io;
        this.pool = pool;
        
        // 初始化子控制器
        this.chatController = new ChatController(io, pool);
        this.encounterController = new EncounterController(io, pool);
        
        // LocationController 需要 encounterService
        const encounterService = this.encounterController.getService();
        this.locationController = new LocationController(io, encounterService);
        
        // 绑定 Socket.io 事件
        this.initializeSocketEvents();
    }

    /**
     * 初始化 Socket.io 事件监听
     */
    initializeSocketEvents() {
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });
    }

    /**
     * 处理新连接
     * @param {Object} socket - Socket 实例
     */
    handleConnection(socket) {
        logger.info('Client connected', {
            socketId: socket.id.slice(0, 8),
            totalClients: this.io.engine.clientsCount
        });

        // 监控连接
        socketMonitor.onConnect(socket);

        // 发送在线人数
        this.broadcastOnlineCount();

        // 初始化各个控制器的事件
        this.chatController.initializeEvents(socket);
        this.encounterController.initializeEvents(socket);
        this.locationController.initializeEvents(socket);

        // 监听断开连接
        socket.on('disconnect', () => {
            this.handleDisconnect(socket);
        });

        // 监听错误
        socket.on('error', (error) => {
            logger.error('Socket error', {
                socketId: socket.id.slice(0, 8),
                error: error.message
            });
        });
    }

    /**
     * 处理断开连接
     * @param {Object} socket - Socket 实例
     */
    handleDisconnect(socket) {
        logger.info('Client disconnected', {
            socketId: socket.id.slice(0, 8),
            totalClients: this.io.engine.clientsCount
        });

        // 监控断开
        socketMonitor.onDisconnect(socket);

        // 清理位置数据
        this.locationController.handleDisconnect(socket.id);

        // 广播更新后的在线人数
        this.broadcastOnlineCount();
    }

    /**
     * 广播在线人数
     */
    broadcastOnlineCount() {
        const count = this.io.engine.clientsCount;
        this.io.emit('onlineCount', count);
        
        logger.debug('Online count broadcasted', { count });
    }

    /**
     * 获取统计信息
     * @returns {Promise<Object>} 统计信息
     */
    async getStatistics() {
        const chatStats = await this.chatController.getStatistics();
        const socketStats = socketMonitor.getStatistics();
        
        return {
            online: this.io.engine.clientsCount,
            chat: chatStats,
            socket: socketStats,
            location: {
                usersWithLocation: this.locationController.getOnlineCount()
            }
        };
    }
}


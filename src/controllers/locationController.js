// src/controllers/locationController.js
import { LocationService } from '../services/locationService.js';
import { logger } from '../utils/logger.js';
import { SocketErrorHandler } from '../middleware/errorHandler.js';
import { rateLimiters } from '../middleware/rateLimit.js';

/**
 * 位置控制器 - 处理位置更新和遭遇检测
 */
export class LocationController {
    constructor(io) {
        this.io = io;
        this.locationService = new LocationService();

        // 定期清理不活跃用户（每5分钟）
        setInterval(() => {
            this.locationService.cleanupInactiveUsers(300000);
        }, 300000);
    }

    /**
     * 初始化位置事件监听
     * @param {Object} socket - Socket 实例
     */
    initializeEvents(socket) {
        // 监听位置更新
        socket.on('updateLocation', (position) => {
            this.handleLocationUpdate(socket, position);
        });

        // 监听附近用户查询
        socket.on('getNearbyUsers', (data) => {
            this.handleGetNearbyUsers(socket, data);
        });
    }

    /**
     * 处理位置更新
     * @param {Object} socket - Socket 实例
     * @param {Object} position - 位置数据 { lat, lng, nickname }
     */
    handleLocationUpdate(socket, position) {
        try {
            // 速率限制检查
            if (!rateLimiters.location.check(socket.id, 'updateLocation')) {
                logger.warn('Location update rate limit exceeded', {
                    socketId: socket.id.slice(0, 8)
                });
                return;
            }

            // 更新用户位置
            this.locationService.updateUserLocation(socket.id, position);
            
            // 广播所有用户位置
            const allUsers = this.locationService.getAllUsers();
            this.io.emit('updateUsers', allUsers);
            
            // 检测遭遇
            const encounters = this.locationService.checkEncounters(socket.id);
            
            // 通知遭遇
            encounters.forEach(encounter => {
                // 通知当前用户
                socket.emit('encounter', {
                    user: encounter.nickname,
                    distance: encounter.distance
                });
                
                // 通知被遭遇的用户
                this.io.to(encounter.userId).emit('encounter', {
                    user: position.nickname || socket.id.slice(0, 5),
                    distance: encounter.distance
                });
            });
            
        } catch (error) {
            SocketErrorHandler.handleError(socket, error, 'updateLocation');
        }
    }

    /**
     * 获取附近用户
     * @param {Object} socket - Socket 实例
     * @param {Object} data - { radius }
     */
    handleGetNearbyUsers(socket, data) {
        try {
            const radius = data?.radius || 1000;
            const nearbyUsers = this.locationService.getNearbyUsers(socket.id, radius);
            
            socket.emit('nearbyUsers', nearbyUsers);
            
            logger.debug('Nearby users sent', {
                socketId: socket.id.slice(0, 8),
                count: nearbyUsers.length,
                radius
            });
        } catch (error) {
            SocketErrorHandler.handleError(socket, error, 'getNearbyUsers');
        }
    }

    /**
     * 处理用户断开连接
     * @param {string} socketId - Socket ID
     */
    handleDisconnect(socketId) {
        this.locationService.removeUser(socketId);
        
        // 广播更新后的用户列表
        const allUsers = this.locationService.getAllUsers();
        this.io.emit('updateUsers', allUsers);
    }

    /**
     * 获取在线用户数
     * @returns {number} 在线用户数
     */
    getOnlineCount() {
        return this.locationService.getOnlineCount();
    }
}


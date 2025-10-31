// src/services/locationService.js
import { calculateDistance, isWithinDistance } from '../utils/distance.js';
import { logger } from '../utils/logger.js';
import { ValidationService } from './validationService.js';

/**
 * 位置服务 - 处理位置更新和遭遇检测
 */
export class LocationService {
    constructor() {
        this.users = {}; // 内存中的用户位置 { socketId: { lat, lng, nickname } }
        this.encounterThreshold = 50; // 遭遇距离阈值（米）
    }

    /**
     * 更新用户位置
     * @param {string} socketId - Socket ID
     * @param {Object} location - 位置数据 { lat, lng, nickname }
     * @returns {Object} 更新后的用户信息
     */
    updateUserLocation(socketId, location) {
        // 验证位置数据
        const validation = ValidationService.validateLocation(location);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // 存储位置信息
        this.users[socketId] = {
            lat: location.lat,
            lng: location.lng,
            nickname: location.nickname || socketId.slice(0, 5),
            lastUpdate: Date.now()
        };

        logger.debug('User location updated', {
            socketId: socketId.slice(0, 8),
            nickname: this.users[socketId].nickname
        });

        return this.users[socketId];
    }

    /**
     * 检测遭遇
     * @param {string} currentSocketId - 当前用户的 Socket ID
     * @returns {Array} 遭遇列表 [{ userId, nickname, distance }]
     */
    checkEncounters(currentSocketId) {
        const currentUser = this.users[currentSocketId];
        if (!currentUser) {
            return [];
        }

        const encounters = [];

        for (const [socketId, user] of Object.entries(this.users)) {
            // 跳过自己
            if (socketId === currentSocketId) {
                continue;
            }

            // 跳过无效用户
            if (!user || !user.lat || !user.lng) {
                continue;
            }

            // 计算距离
            const distance = calculateDistance(
                currentUser.lat,
                currentUser.lng,
                user.lat,
                user.lng
            );

            // 检查是否在遭遇范围内
            if (distance < this.encounterThreshold) {
                encounters.push({
                    userId: socketId,
                    nickname: user.nickname,
                    distance: distance,
                    location: {
                        lat: user.lat,
                        lng: user.lng
                    }
                });

                logger.info('Encounter detected', {
                    user1: currentUser.nickname,
                    user2: user.nickname,
                    distance: Math.round(distance)
                });
            }
        }

        return encounters;
    }

    /**
     * 移除用户
     * @param {string} socketId - Socket ID
     */
    removeUser(socketId) {
        if (this.users[socketId]) {
            logger.debug('User removed', {
                socketId: socketId.slice(0, 8),
                nickname: this.users[socketId].nickname
            });
            delete this.users[socketId];
        }
    }

    /**
     * 获取所有在线用户
     * @returns {Object} 用户位置对象
     */
    getAllUsers() {
        return { ...this.users };
    }

    /**
     * 获取在线用户数量
     * @returns {number} 用户数量
     */
    getOnlineCount() {
        return Object.keys(this.users).length;
    }

    /**
     * 清理长时间未更新的用户（可选）
     * @param {number} timeoutMs - 超时时间（毫秒）
     */
    cleanupInactiveUsers(timeoutMs = 300000) {
        const now = Date.now();
        let cleaned = 0;

        for (const [socketId, user] of Object.entries(this.users)) {
            if (user.lastUpdate && now - user.lastUpdate > timeoutMs) {
                delete this.users[socketId];
                cleaned++;
            }
        }

        if (cleaned > 0) {
            logger.info(`Cleaned up ${cleaned} inactive users`);
        }

        return cleaned;
    }

    /**
     * 获取附近的用户
     * @param {string} socketId - 当前用户 Socket ID
     * @param {number} radius - 半径（米）
     * @returns {Array} 附近用户列表
     */
    getNearbyUsers(socketId, radius = 1000) {
        const currentUser = this.users[socketId];
        if (!currentUser) {
            return [];
        }

        const nearby = [];

        for (const [id, user] of Object.entries(this.users)) {
            if (id === socketId || !user) continue;

            const distance = calculateDistance(
                currentUser.lat,
                currentUser.lng,
                user.lat,
                user.lng
            );

            if (distance <= radius) {
                nearby.push({
                    userId: id,
                    nickname: user.nickname,
                    distance: distance
                });
            }
        }

        // 按距离排序
        nearby.sort((a, b) => a.distance - b.distance);

        return nearby;
    }
}


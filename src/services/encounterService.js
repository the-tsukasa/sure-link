// src/services/encounterService.js
import { logger } from '../utils/logger.js';
import { calculateDistance } from '../utils/distance.js';

/**
 * 遭遇服务 - 处理遭遇检测和记录
 */
export class EncounterService {
    constructor(pool) {
        this.pool = pool;
        this.encounters = new Map(); // { "user1:user2": timestamp }
        this.cooldownPeriod = 300000; // 5分钟冷却期
        
        // 定期清理过期的遭遇记录
        setInterval(() => this.cleanupOldEncounters(), 60000);
    }

    /**
     * 检测并记录遭遇
     * @param {Object} user1 - 用户1 { socketId, nickname, lat, lng }
     * @param {Object} user2 - 用户2
     * @param {number} distance - 距离（米）
     * @returns {Object|null} 遭遇信息或null
     */
    async detectEncounter(user1, user2, distance) {
        const key = this.getEncounterKey(user1.socketId, user2.socketId);
        const now = Date.now();
        
        // 检查冷却期
        const lastEncounter = this.encounters.get(key);
        if (lastEncounter && now - lastEncounter < this.cooldownPeriod) {
            return null; // 在冷却期内，不触发
        }
        
        // 记录遭遇
        this.encounters.set(key, now);
        
        // 保存到数据库
        try {
            await this.pool.query(`
                INSERT INTO encounters 
                (user1_socket_id, user1_nickname, user2_socket_id, user2_nickname, distance, latitude, longitude)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                user1.socketId,
                user1.nickname,
                user2.socketId,
                user2.nickname,
                distance,
                user1.lat,
                user1.lng
            ]);
            
            logger.info('Encounter saved', {
                user1: user1.nickname,
                user2: user2.nickname,
                distance: Math.round(distance)
            });
            
            return {
                user1: user1.nickname,
                user2: user2.nickname,
                distance,
                location: {
                    lat: user1.lat,
                    lng: user1.lng
                },
                timestamp: now
            };
        } catch (err) {
            logger.error('Failed to save encounter:', err.message);
            return null;
        }
    }

    /**
     * 生成唯一的遭遇键（确保A-B和B-A是同一个遭遇）
     */
    getEncounterKey(id1, id2) {
        return [id1, id2].sort().join(':');
    }

    /**
     * 清理过期的遭遇记录
     */
    cleanupOldEncounters() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, timestamp] of this.encounters.entries()) {
            if (now - timestamp > this.cooldownPeriod) {
                this.encounters.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            logger.debug(`Cleaned ${cleaned} old encounter records`);
        }
    }

    /**
     * 获取遭遇历史
     * @param {string} socketId - Socket ID
     * @param {number} limit - 数量限制
     * @returns {Promise<Array>} 遭遇列表
     */
    async getHistory(socketId, limit = 50) {
        try {
            const result = await this.pool.query(`
                SELECT 
                    CASE 
                        WHEN user1_socket_id = $1 THEN user2_nickname
                        ELSE user1_nickname
                    END as user,
                    distance,
                    latitude,
                    longitude,
                    encountered_at as timestamp
                FROM encounters
                WHERE user1_socket_id = $1 OR user2_socket_id = $1
                ORDER BY encountered_at DESC
                LIMIT $2
            `, [socketId, limit]);
            
            return result.rows.map(row => ({
                user: row.user,
                distance: parseFloat(row.distance),
                location: row.latitude && row.longitude ? {
                    lat: parseFloat(row.latitude),
                    lng: parseFloat(row.longitude)
                } : null,
                timestamp: new Date(row.timestamp).getTime()
            }));
        } catch (err) {
            logger.error('Failed to get encounter history:', err.message);
            return [];
        }
    }

    /**
     * 获取遭遇热力图数据
     * @param {string} socketId - Socket ID
     * @returns {Promise<Array>} 热力图数据
     */
    async getHeatmapData(socketId) {
        try {
            const result = await this.pool.query(`
                SELECT latitude, longitude, COUNT(*) as intensity
                FROM encounters
                WHERE (user1_socket_id = $1 OR user2_socket_id = $1)
                  AND latitude IS NOT NULL 
                  AND longitude IS NOT NULL
                GROUP BY latitude, longitude
            `, [socketId]);
            
            return result.rows.map(row => ({
                lat: parseFloat(row.latitude),
                lng: parseFloat(row.longitude),
                intensity: parseInt(row.intensity)
            }));
        } catch (err) {
            logger.error('Failed to get heatmap data:', err.message);
            return [];
        }
    }

    /**
     * 获取遭遇统计
     * @param {string} socketId - Socket ID
     * @returns {Promise<Object>} 统计信息
     */
    async getStats(socketId) {
        try {
            // 总遭遇数
            const totalResult = await this.pool.query(`
                SELECT COUNT(*) as total
                FROM encounters
                WHERE user1_socket_id = $1 OR user2_socket_id = $1
            `, [socketId]);

            // 今日遭遇
            const todayResult = await this.pool.query(`
                SELECT COUNT(*) as today
                FROM encounters
                WHERE (user1_socket_id = $1 OR user2_socket_id = $1)
                  AND encountered_at >= CURRENT_DATE
            `, [socketId]);

            // 本周遭遇
            const weekResult = await this.pool.query(`
                SELECT COUNT(*) as week
                FROM encounters
                WHERE (user1_socket_id = $1 OR user2_socket_id = $1)
                  AND encountered_at >= CURRENT_DATE - INTERVAL '7 days'
            `, [socketId]);

            // 不同用户数
            const uniqueResult = await this.pool.query(`
                SELECT COUNT(DISTINCT 
                    CASE 
                        WHEN user1_socket_id = $1 THEN user2_nickname
                        ELSE user1_nickname
                    END
                ) as unique_users
                FROM encounters
                WHERE user1_socket_id = $1 OR user2_socket_id = $1
            `, [socketId]);

            return {
                total: parseInt(totalResult.rows[0].total),
                today: parseInt(todayResult.rows[0].today),
                week: parseInt(weekResult.rows[0].week),
                uniqueUsers: parseInt(uniqueResult.rows[0].unique_users)
            };
        } catch (err) {
            logger.error('Failed to get encounter stats:', err.message);
            return { total: 0, today: 0, week: 0, uniqueUsers: 0 };
        }
    }

    /**
     * 获取每日统计（用于图表）
     * @param {string} socketId - Socket ID
     * @param {number} days - 天数
     * @returns {Promise<Array>} 每日数据
     */
    async getDailyStats(socketId, days = 30) {
        try {
            const result = await this.pool.query(`
                SELECT 
                    DATE(encountered_at) as date,
                    COUNT(*) as count
                FROM encounters
                WHERE (user1_socket_id = $1 OR user2_socket_id = $1)
                  AND encountered_at >= NOW() - INTERVAL '${days} days'
                GROUP BY DATE(encountered_at)
                ORDER BY date DESC
            `, [socketId]);
            
            return result.rows.map(row => ({
                date: row.date,
                count: parseInt(row.count)
            }));
        } catch (err) {
            logger.error('Failed to get daily stats:', err.message);
            return [];
        }
    }
}


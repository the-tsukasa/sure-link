// src/controllers/encounterController.js
import { EncounterService } from '../services/encounterService.js';
import { logger } from '../utils/logger.js';

/**
 * 遭遇控制器 - 处理遭遇相关的 Socket 事件
 */
export class EncounterController {
    constructor(io, pool) {
        this.io = io;
        this.encounterService = new EncounterService(pool);
    }

    /**
     * 初始化遭遇事件监听
     * @param {Object} socket - Socket 实例
     */
    initializeEvents(socket) {
        // 获取遭遇历史
        socket.on('getEncounterHistory', async (data) => {
            await this.handleGetHistory(socket, data);
        });

        // 获取遭遇统计
        socket.on('getEncounterStats', async () => {
            await this.handleGetStats(socket);
        });

        // 获取热力图数据
        socket.on('getHeatmapData', async () => {
            await this.handleGetHeatmap(socket);
        });

        // 获取每日统计
        socket.on('getDailyStats', async (data) => {
            await this.handleGetDailyStats(socket, data);
        });
    }

    /**
     * 处理遭遇历史请求
     */
    async handleGetHistory(socket, data) {
        try {
            const limit = data?.limit || 50;
            const history = await this.encounterService.getHistory(socket.id, limit);
            
            socket.emit('encounterHistory', history);
            
            logger.debug('Encounter history sent', {
                socketId: socket.id.slice(0, 8),
                count: history.length
            });
        } catch (error) {
            logger.error('Failed to get encounter history:', error.message);
            socket.emit('error', { message: '遭遇履歴の取得に失敗しました' });
        }
    }

    /**
     * 处理遭遇统计请求
     */
    async handleGetStats(socket) {
        try {
            const stats = await this.encounterService.getStats(socket.id);
            socket.emit('encounterStats', stats);
            
            logger.debug('Encounter stats sent', {
                socketId: socket.id.slice(0, 8),
                stats
            });
        } catch (error) {
            logger.error('Failed to get encounter stats:', error.message);
            socket.emit('error', { message: '統計の取得に失敗しました' });
        }
    }

    /**
     * 处理热力图数据请求
     */
    async handleGetHeatmap(socket) {
        try {
            const heatmapData = await this.encounterService.getHeatmapData(socket.id);
            socket.emit('heatmapData', heatmapData);
            
            logger.debug('Heatmap data sent', {
                socketId: socket.id.slice(0, 8),
                points: heatmapData.length
            });
        } catch (error) {
            logger.error('Failed to get heatmap data:', error.message);
            socket.emit('error', { message: 'ヒートマップの取得に失敗しました' });
        }
    }

    /**
     * 处理每日统计请求
     */
    async handleGetDailyStats(socket, data) {
        try {
            const days = data?.days || 30;
            const dailyStats = await this.encounterService.getDailyStats(socket.id, days);
            socket.emit('dailyStats', dailyStats);
            
            logger.debug('Daily stats sent', {
                socketId: socket.id.slice(0, 8),
                days: dailyStats.length
            });
        } catch (error) {
            logger.error('Failed to get daily stats:', error.message);
            socket.emit('error', { message: '日別統計の取得に失敗しました' });
        }
    }

    /**
     * 获取遭遇服务实例（供其他控制器使用）
     */
    getService() {
        return this.encounterService;
    }
}


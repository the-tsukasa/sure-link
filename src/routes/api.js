// src/routes/api.js
import express from 'express';
import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/test
 * 测试接口
 */
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Sure-Link API is running ✅',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

/**
 * GET /api/health
 * 健康检查接口
 */
router.get('/health', async (req, res) => {
    try {
        // 检查数据库连接
        const dbResult = await pool.query('SELECT NOW() as time, version() as version');
        
        // 检查数据库表
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        res.json({ 
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                time: dbResult.rows[0].time,
                version: dbResult.rows[0].version.split(' ')[0],
                tables: tablesResult.rows.map(r => r.table_name),
                poolSize: {
                    total: pool.totalCount,
                    idle: pool.idleCount,
                    waiting: pool.waitingCount
                }
            },
            memory: {
                rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
            },
            uptime: `${Math.round(process.uptime())}s`
        });
    } catch (err) {
        logger.error('Health check failed:', err.message);
        
        res.status(500).json({ 
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: err.message 
        });
    }
});

/**
 * GET /api/stats
 * 获取应用统计信息
 */
router.get('/stats', async (req, res) => {
    try {
        // 获取消息统计
        const messageStats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today,
                COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week
            FROM messages
        `);
        
        res.json({
            messages: {
                total: parseInt(messageStats.rows[0].total),
                today: parseInt(messageStats.rows[0].today),
                week: parseInt(messageStats.rows[0].week)
            },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        logger.error('Failed to get stats:', err.message);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

/**
 * POST /api/cleanup
 * 手动触发数据清理（需要认证）
 */
router.post('/cleanup', async (req, res) => {
    try {
        // 简单的认证（实际应用中应使用更安全的方式）
        const { secret } = req.body;
        if (secret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // 删除30天前的消息
        const result = await pool.query(
            "DELETE FROM messages WHERE created_at < NOW() - INTERVAL '30 days' RETURNING id"
        );
        
        const count = result.rowCount;
        logger.info(`Manual cleanup: deleted ${count} old messages`);
        
        res.json({ 
            success: true,
            deleted: count,
            message: `${count}件の古いメッセージを削除しました`
        });
    } catch (err) {
        logger.error('Cleanup failed:', err.message);
        res.status(500).json({ error: 'Cleanup failed' });
    }
});

export default router;


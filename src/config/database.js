// src/config/database.js
import pkg from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const { Pool } = pkg;

/**
 * PostgreSQL 连接池配置
 */
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
    max: 20,                        // 最大连接数
    idleTimeoutMillis: 30000,       // 空闲连接超时 (30秒)
    connectionTimeoutMillis: 2000,  // 连接超时 (2秒)
});

/**
 * 测试数据库连接
 */
export async function testConnection() {
    try {
        const client = await pool.connect();
        logger.info('✅ PostgreSQL connected successfully');
        
        const result = await client.query('SELECT NOW()');
        logger.info('Database time:', result.rows[0].now);
        
        client.release();
        return true;
    } catch (err) {
        logger.error('❌ PostgreSQL connection failed:', err.message);
        return false;
    }
}

/**
 * 错误处理
 */
pool.on('error', (err) => {
    logger.error('❌ Unexpected database error:', {
        error: err.message,
        stack: err.stack
    });
});

/**
 * 优雅关闭
 */
export async function closePool() {
    try {
        await pool.end();
        logger.info('Database pool closed');
    } catch (err) {
        logger.error('Error closing database pool:', err.message);
    }
}

// 进程退出时关闭连接池
process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);


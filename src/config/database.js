// src/config/database.js
import pkg from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const { Pool } = pkg;

/**
 * 检测环境并返回配置
 */
function getEnvironmentConfig() {
    const isProduction = process.env.NODE_ENV === 'production';
    const isRender = process.env.RENDER === 'true';
    const isDevelopment = !isProduction;
    
    return {
        env: isProduction ? 'production' : 'development',
        isRender,
        isDevelopment,
        useRemoteDB: process.env.USE_REMOTE_DB === 'true' || isProduction
    };
}

const envConfig = getEnvironmentConfig();

/**
 * PostgreSQL 连接池配置
 */
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // SSL 配置：生产环境或使用远程数据库时启用
    ssl: (envConfig.isRender || envConfig.useRemoteDB) 
        ? { rejectUnauthorized: false } 
        : false,
    max: envConfig.isDevelopment ? 10 : 20,           // 开发环境减少连接数
    idleTimeoutMillis: 30000,                         // 空闲连接超时 (30秒)
    connectionTimeoutMillis: envConfig.isDevelopment ? 5000 : 2000,  // 开发环境延长超时
});

/**
 * 测试数据库连接
 */
export async function testConnection() {
    try {
        const client = await pool.connect();
        
        // 获取数据库信息
        const result = await client.query('SELECT NOW(), current_database() as db, version()');
        const dbInfo = result.rows[0];
        
        logger.info('✅ PostgreSQL connected successfully', {
            environment: envConfig.env,
            database: dbInfo.db,
            time: dbInfo.now,
            isRemote: envConfig.useRemoteDB,
            isRender: envConfig.isRender
        });
        
        if (envConfig.isDevelopment && envConfig.useRemoteDB) {
            logger.warn('⚠️  Development mode using REMOTE database (Render)');
            logger.info('💡 Make sure DATABASE_URL is set in your .env file');
        }
        
        client.release();
        return true;
    } catch (err) {
        logger.error('❌ PostgreSQL connection failed:', {
            error: err.message,
            environment: envConfig.env,
            hasUrl: !!process.env.DATABASE_URL
        });
        
        if (!process.env.DATABASE_URL) {
            logger.error('💡 DATABASE_URL not found! Please check your .env file');
            logger.error('📖 See ENV_TEMPLATE.md for configuration guide');
        }
        
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


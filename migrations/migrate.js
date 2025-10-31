// migrations/migrate.js
// 数据库迁移脚本
import { pool } from '../src/config/database.js';
import { logger } from '../src/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 运行迁移脚本
 */
async function runMigration() {
    try {
        logger.info('Starting database migration...');

        // 读取 SQL 文件
        const sqlPath = path.join(__dirname, '001_initial_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        // 执行 SQL
        await pool.query(sql);

        logger.info('✅ Migration completed successfully');
        
        // 验证表是否创建
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        logger.info('Tables created:', result.rows.map(r => r.table_name));

        process.exit(0);
    } catch (err) {
        logger.error('❌ Migration failed:', {
            error: err.message,
            stack: err.stack
        });
        process.exit(1);
    }
}

// 运行迁移
runMigration();


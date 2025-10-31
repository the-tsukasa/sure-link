-- migrations/001_initial_schema.sql
-- Sure Link 数据库初始 Schema

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    socket_id VARCHAR(50) UNIQUE,
    nickname VARCHAR(50) NOT NULL,
    avatar_color VARCHAR(7) DEFAULT '#007AFF',
    status_message TEXT,
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT nickname_length CHECK (LENGTH(nickname) >= 1 AND LENGTH(nickname) <= 50)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_socket_id ON users(socket_id);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen DESC);

-- 消息表（增强版）
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT text_length CHECK (LENGTH(text) >= 1 AND LENGTH(text) <= 500)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_username ON messages(username);

-- 位置历史表
CREATE TABLE IF NOT EXISTS location_history (
    id SERIAL PRIMARY KEY,
    socket_id VARCHAR(50) NOT NULL,
    nickname VARCHAR(50),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy FLOAT,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_location_socket_id ON location_history(socket_id);
CREATE INDEX IF NOT EXISTS idx_location_recorded_at ON location_history(recorded_at DESC);

-- 遭遇记录表
CREATE TABLE IF NOT EXISTS encounters (
    id SERIAL PRIMARY KEY,
    user1_socket_id VARCHAR(50) NOT NULL,
    user1_nickname VARCHAR(50),
    user2_socket_id VARCHAR(50) NOT NULL,
    user2_nickname VARCHAR(50),
    distance FLOAT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    encountered_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT different_users CHECK (user1_socket_id != user2_socket_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_encounters_user1 ON encounters(user1_socket_id);
CREATE INDEX IF NOT EXISTS idx_encounters_user2 ON encounters(user2_socket_id);
CREATE INDEX IF NOT EXISTS idx_encounters_time ON encounters(encountered_at DESC);

-- 数据清理函数
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- 删除30天前的消息
    DELETE FROM messages WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- 删除7天前的位置历史
    DELETE FROM location_history WHERE recorded_at < NOW() - INTERVAL '7 days';
    
    -- 删除90天前的遭遇记录
    DELETE FROM encounters WHERE encountered_at < NOW() - INTERVAL '90 days';
    
    -- 删除30天未活跃的用户
    DELETE FROM users WHERE last_seen < NOW() - INTERVAL '30 days';
    
    -- 记录清理日志
    RAISE NOTICE 'Data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- 插入测试数据（可选）
-- INSERT INTO messages (username, text) VALUES 
-- ('System', 'Welcome to Sure Link!'),
-- ('Admin', 'サーバーが起動しました');

-- 创建视图：最近的活跃用户
CREATE OR REPLACE VIEW recent_active_users AS
SELECT DISTINCT ON (nickname)
    nickname,
    last_seen,
    status_message
FROM users
WHERE last_seen > NOW() - INTERVAL '24 hours'
ORDER BY nickname, last_seen DESC;

-- 创建视图：今日遭遇统计
CREATE OR REPLACE VIEW today_encounters_stats AS
SELECT 
    COUNT(*) as total_encounters,
    COUNT(DISTINCT user1_socket_id) as unique_users
FROM encounters
WHERE encountered_at >= CURRENT_DATE;


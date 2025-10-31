// public/js/config.js
// Sure Link - 前端环境配置

/**
 * 自动检测环境并返回正确的服务器 URL
 */
export function getServerConfig() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // 检测是否在 Render 生产环境
    if (hostname.includes('onrender.com')) {
        return {
            serverUrl: 'https://sure-link.onrender.com',
            environment: 'production',
            isLocal: false
        };
    }
    
    // 检测是否在 VS Code Live Server（通常是 5500-5502 端口）
    if (port >= 5500 && port <= 5599) {
        return {
            serverUrl: 'http://localhost:3000',  // 连接到本地 Node.js 服务器
            environment: 'development-live-server',
            isLocal: true,
            liveServerPort: port
        };
    }
    
    // 本地开发（localhost:3000）
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return {
            serverUrl: `${protocol}//${hostname}:${port || 3000}`,
            environment: 'development',
            isLocal: true
        };
    }
    
    // 默认配置
    return {
        serverUrl: 'http://localhost:3000',
        environment: 'unknown',
        isLocal: true
    };
}

/**
 * 获取当前配置并打印调试信息
 */
export function initializeConfig() {
    const config = getServerConfig();
    
    console.log('🔧 Sure Link Configuration:');
    console.log('  Environment:', config.environment);
    console.log('  Server URL:', config.serverUrl);
    console.log('  Is Local:', config.isLocal);
    
    if (config.liveServerPort) {
        console.log('  Live Server Port:', config.liveServerPort);
        console.log('💡 VS Code Live Server detected');
        console.log('   Make sure your Node.js server is running on port 3000');
    }
    
    return config;
}

// 自动初始化并暴露到全局
window.SureLinkConfig = initializeConfig();


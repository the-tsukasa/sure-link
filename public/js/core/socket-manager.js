// public/js/core/socket-manager.js
/**
 * Socket 管理器 - 统一管理 Socket.io 连接
 */
export class SocketManager {
    constructor() {
        this.socket = null;
        this.serverUrl = this.getServerUrl();
        this.listeners = new Map();
        this.connected = false;
    }

    /**
     * 获取服务器 URL
     */
    getServerUrl() {
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://sure-link.onrender.com';
    }

    /**
     * 连接到服务器
     */
    connect() {
        if (this.socket) {
            console.warn('Socket already connected');
            return this.socket;
        }

        this.socket = io(this.serverUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        this.setupDefaultHandlers();
        return this.socket;
    }

    /**
     * 设置默认事件处理
     */
    setupDefaultHandlers() {
        this.socket.on('connect', () => {
            console.log('✅ Connected to server');
            this.connected = true;
            this.emit('status', { connected: true });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected:', reason);
            this.connected = false;
            this.emit('status', { connected: false, reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.emit('connectionError', error);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.showError(error.message || 'エラーが発生しました');
        });
    }

    /**
     * 监听事件
     */
    on(event, callback) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return;
        }
        this.socket.on(event, callback);
    }

    /**
     * 发送事件
     */
    emit(event, data) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return;
        }
        this.socket.emit(event, data);
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    /**
     * 显示错误消息
     */
    showError(message) {
        // 可以使用 Toast 组件
        console.error(message);
        if (window.showToast) {
            window.showToast(message, 'error');
        }
    }

    /**
     * 检查连接状态
     */
    isConnected() {
        return this.connected && this.socket && this.socket.connected;
    }
}

// 导出单例
export const socketManager = new SocketManager();


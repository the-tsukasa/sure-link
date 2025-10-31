// src/services/validationService.js

/**
 * 验证服务 - 处理所有输入验证
 */
export class ValidationService {
    /**
     * 验证消息数据
     */
    static validateMessage(msgData) {
        if (!msgData || typeof msgData !== 'object') {
            return { 
                valid: false, 
                error: '無効なメッセージ形式です' 
            };
        }

        if (!msgData.user || typeof msgData.user !== 'string' || msgData.user.trim() === '') {
            return { 
                valid: false, 
                error: 'ニックネームが必要です' 
            };
        }

        if (!msgData.text || typeof msgData.text !== 'string' || msgData.text.trim() === '') {
            return { 
                valid: false, 
                error: 'メッセージが必要です' 
            };
        }

        if (msgData.text.length > 500) {
            return { 
                valid: false, 
                error: 'メッセージは500文字以内にしてください' 
            };
        }

        if (msgData.user.length > 50) {
            return { 
                valid: false, 
                error: 'ニックネームは50文字以内にしてください' 
            };
        }

        // 禁止词检查（示例）
        const bannedWords = ['spam', 'abuse', 'hack'];
        const lowerText = msgData.text.toLowerCase();
        for (const word of bannedWords) {
            if (lowerText.includes(word)) {
                return { 
                    valid: false, 
                    error: '不適切な内容が含まれています' 
                };
            }
        }

        return { valid: true };
    }

    /**
     * 清理消息数据（XSS 防护）
     */
    static sanitizeMessage(msgData) {
        return {
            user: this.sanitizeString(msgData.user),
            text: this.sanitizeString(msgData.text),
            id: msgData.id
        };
    }

    /**
     * 清理字符串，移除HTML标签
     */
    static sanitizeString(str) {
        if (typeof str !== 'string') return '';
        
        return String(str)
            .replace(/<[^>]*>/g, '')  // 移除HTML标签
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .trim();
    }

    /**
     * 验证位置数据
     */
    static validateLocation(location) {
        if (!location || typeof location !== 'object') {
            return { 
                valid: false, 
                error: '無効な位置情報です' 
            };
        }

        const { lat, lng } = location;

        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return { 
                valid: false, 
                error: '緯度経度は数値である必要があります' 
            };
        }

        if (lat < -90 || lat > 90) {
            return { 
                valid: false, 
                error: '緯度は-90から90の範囲である必要があります' 
            };
        }

        if (lng < -180 || lng > 180) {
            return { 
                valid: false, 
                error: '経度は-180から180の範囲である必要があります' 
            };
        }

        return { valid: true };
    }

    /**
     * 验证昵称
     */
    static validateNickname(nickname) {
        if (!nickname || typeof nickname !== 'string') {
            return { 
                valid: false, 
                error: 'ニックネームが必要です' 
            };
        }

        const cleaned = nickname.trim();

        if (cleaned.length < 1 || cleaned.length > 50) {
            return { 
                valid: false, 
                error: 'ニックネームは1文字以上50文字以内にしてください' 
            };
        }

        // 禁止特殊字符（可选）
        if (!/^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFFa-zA-Z0-9\s_-]+$/.test(cleaned)) {
            return { 
                valid: false, 
                error: 'ニックネームに使用できない文字が含まれています' 
            };
        }

        return { valid: true, cleaned };
    }
}


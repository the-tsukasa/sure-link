# 🚀 遭遇系统 2.0 - 快速启动指南

## ⚡ 5分钟快速启动

### 1️⃣ 确认数据库表存在

```sql
-- 检查 encounters 表
SELECT * FROM encounters LIMIT 1;
```

如果表不存在，运行：
```bash
node migrations/migrate.js
```

### 2️⃣ 启动服务器

```bash
# 安装依赖（如果还没有）
npm install

# 启动服务器
npm start
```

### 3️⃣ 访问页面

打开浏览器访问：
```
http://localhost:3000/encounter.html
```

### 4️⃣ 授权位置权限

浏览器会提示位置权限，点击"允许"。

---

## 🎮 使用指南

### 查看实时统计
- **总遭遇数** - 显示所有遭遇
- **今日遭遇** - 显示今天的遭遇
- **获得徽章** - 显示解锁的成就

### 地图操作
- 🎯 **中心按钮** - 回到你的位置
- 🔥 **热力图按钮** - 显示遭遇热力图
- 🔄 **刷新按钮** - 手动扫描周围

### 遭遇发生时
1. 屏幕弹出精美模态框
2. 手机震动提醒（移动端）
3. 音效播放（可选）
4. 地图上显示遭遇点

### 成就系统
- 👋 **初すれ違い** - 1次遭遇
- 🦋 **社交家** - 10次遭遇
- 🗺️ **探検家** - 25次遭遇
- 🏆 **マスター** - 50次遭遇
- ⭐ **伝説** - 100次遭遇

---

## 🧪 测试方法

### 方法1: 双设备测试
1. 在两台设备上打开 `encounter.html`
2. 确保两个设备距离 < 50米
3. 刷新位置，等待遭遇通知

### 方法2: 模拟位置（开发）
在 `encounter-main.js` 中修改：
```javascript
// 测试时固定位置
updateLocation(lat, lng) {
    // 测试：使用固定位置
    // const testLat = 35.6812;
    // const testLng = 139.7671;
    
    this.userMarker.setLatLng([lat, lng]);
    // ...
}
```

### 方法3: 浏览器模拟
Chrome DevTools → 传感器 → 覆盖地理位置

---

## 🐛 常见问题

### Q: 遭遇没有通知？
**A**: 检查：
- 两个用户是否在 50米 以内
- 是否在 5分钟 冷却期内
- Socket.io 是否连接成功
- 浏览器控制台有无错误

### Q: 地图不显示？
**A**: 检查：
- 网络连接（Leaflet CDN）
- 浏览器控制台错误
- 位置权限是否授权

### Q: 热力图空白？
**A**: 至少需要3个遭遇点才能生成热力图

### Q: 成就没有解锁？
**A**: 成就数据保存在 localStorage，清除浏览器数据会重置

---

## 📊 数据流程

```
用户移动
  ↓
updateLocation (前端)
  ↓
Socket.emit('updateLocation')
  ↓
locationController.handleLocationUpdate() (后端)
  ↓
locationService.checkEncounters()
  ↓
encounterService.detectEncounter()
  ↓
保存到数据库
  ↓
Socket.emit('encounter')
  ↓
前端显示通知 + 地图标记
  ↓
检查成就解锁
```

---

## 🔧 配置选项

### 遭遇距离阈值
在 `src/services/locationService.js` 修改：
```javascript
this.encounterThreshold = 50; // 米
```

### 冷却时间
在 `src/services/encounterService.js` 修改：
```javascript
this.cooldownPeriod = 300000; // 毫秒 (5分钟)
```

### 成就条件
在 `public/js/encounter-main.js` 修改：
```javascript
loadAchievements() {
    return {
        first: { name: '初すれ違い', icon: '👋', unlocked: false, condition: 1 },
        social: { name: '社交家', icon: '🦋', unlocked: false, condition: 10 },
        // ... 修改 condition 值
    };
}
```

---

## 📱 移动端优化

### PWA 安装
1. 点击浏览器"添加到主屏幕"
2. 像原生APP一样使用

### 性能优化
- 自动休眠位置追踪（页面隐藏时）
- 限制地图更新频率
- 懒加载遭遇历史

---

## 🎨 自定义主题

### 修改主色调
在 `public/css/encounter.css` 修改：
```css
:root {
    --encounter-primary: #667eea;    /* 主色 */
    --encounter-secondary: #764ba2;  /* 辅色 */
    --encounter-success: #10b981;    /* 成功色 */
    --encounter-warning: #f59e0b;    /* 警告色 */
    --encounter-danger: #ef4444;     /* 危险色 */
}
```

---

## 🔐 安全建议

1. **位置隐私**
   - 不要精确显示用户位置
   - 模糊化显示（50米范围）

2. **速率限制**
   - 已实现位置更新速率限制
   - 防止恶意刷新

3. **数据清理**
   - 定期清理旧遭遇记录
   - 设置数据保留期限

---

## 📈 性能指标

### 前端
- 首次加载: < 2秒
- 地图初始化: < 1秒
- Socket连接: < 500ms
- 遭遇通知延迟: < 200ms

### 后端
- 遭遇检测: < 50ms
- 数据库查询: < 100ms
- 统计计算: < 200ms

---

## 🎯 下一步

### 建议完成的功能
1. ✅ 遭遇历史页面（`encounter-history.html`）
2. ✅ 图表可视化（Chart.js）
3. ✅ 好友系统
4. ✅ Push 通知

### 可选增强
- 遭遇动画更丰富
- 音效文件替换
- 地图样式自定义
- 多语言支持

---

## 💡 提示

### 最佳实践
- ✅ 保持位置权限开启
- ✅ 在人群密集区测试
- ✅ 定期备份遭遇数据
- ✅ 监控服务器日志

### 调试技巧
```javascript
// 在浏览器控制台
window.encounterSystem.encounters // 查看所有遭遇
window.encounterSystem.achievements // 查看成就状态
```

---

**享受全新的遭遇系统吧！** 🎉✨

有问题？查看 `ENCOUNTER_SYSTEM_2.0.md` 获取完整文档。


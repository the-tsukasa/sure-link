# 📖 すれ違い履歴 × コレクション - 使用指南

## 🚀 快速开始

### 方法 1: 查看实际遭遇

1. **打开地图页面**
   ```
   http://localhost:3000/map.html
   ```

2. **允许位置权限**
   - 浏览器会请求位置权限
   - 点击"允许"

3. **等待遭遇发生**
   - 当其他用户在50米内时
   - 会自动记录遭遇

4. **查看遭遇历史**
   - 进入个人页面（Profile）
   - 滚动到"すれ違い履歴"部分
   - 查看记录

---

### 方法 2: 使用测试数据（推荐）

#### 步骤 1: 打开个人页面
```
http://localhost:3000/profile.html
```

#### 步骤 2: 打开浏览器控制台
- **Chrome/Edge**: 按 `F12` 或 `Ctrl+Shift+I`
- **Mac**: `Cmd+Option+I`

#### 步骤 3: 加载测试工具
```javascript
// 复制粘贴到控制台
const script = document.createElement('script');
script.src = '/js/test-encounters.js';
document.head.appendChild(script);
```

#### 步骤 4: 生成测试数据
```javascript
// 生成 10 条测试遭遇记录
generateTestEncounters();
```

#### 步骤 5: 刷新页面
按 `F5` 或 `Ctrl+R`

---

## 🎮 测试命令

### 生成测试数据
```javascript
generateTestEncounters()
```
**效果**: 生成 10 条遭遇记录
- Taro @ 新宿駅 (50m)
- Hanako @ 渋谷スクランブル交差点 (120m)
- Yuki @ 原宿駅 (85m)
- ... 等

### 添加单条遭遇
```javascript
addTestEncounter()
```
**效果**: 添加 1 条随机遭遇
- 随机用户名
- 随机地点
- 随机距离 (20-220m)

### 清除测试数据
```javascript
clearTestEncounters()
```
**效果**: 清除所有遭遇记录

---

## 💡 功能演示

### 1️⃣ 查看遭遇卡片

每张卡片显示：
```
┌─────────────────────────────────────┐
│  T    Taro                3時間前   │
│       📍 新宿駅                     │
│       📏 約 50m                     │
│       ❤️ 5                          │
└─────────────────────────────────────┘
```

### 2️⃣ 点赞功能

**操作**:
- 点击 ❤️ 按钮

**效果**:
- 未点赞 → 已点赞（红色心形）
- 点赞数 +1
- 震动反馈（移动端）
- 心跳动画

**再次点击**:
- 已点赞 → 取消点赞
- 点赞数 -1

### 3️⃣ 查看更多

**操作**:
- 点击"もっと見る"按钮

**效果**:
- 每次加载 5 条记录
- 没有更多时按钮消失

### 4️⃣ 统计信息

顶部显示：
- **総数**: 所有遭遇总数
- **お気に入り**: 已点赞的遭遇数

---

## 🎨 视觉效果

### 悬停效果
- 鼠标悬停在卡片上
- 卡片上移 2px
- 显示蓝紫渐变叠加
- 边框颜色变化

### 点赞动画
- 点击点赞按钮
- 心形图标放大 1.3 倍
- 然后缩小到 1.1 倍
- 最后回到正常大小
- 三段震动反馈

### 空状态
- 没有遭遇时显示星星 🌟
- 星星上下浮动
- 友好提示文字

---

## 📱 响应式测试

### 桌面端测试
1. 浏览器窗口 > 768px
2. 查看完整布局
3. 测试悬停效果

### 移动端测试
1. 按 `F12` 打开开发者工具
2. 点击"设备切换"图标
3. 选择 iPhone 或 Android
4. 查看紧凑布局
5. 测试触控效果

---

## 🔍 调试技巧

### 查看存储数据
```javascript
// 查看所有遭遇记录
const encounters = JSON.parse(localStorage.getItem('encounters'));
console.log(encounters);
```

### 查看单条记录
```javascript
const encounters = JSON.parse(localStorage.getItem('encounters'));
console.log(encounters[0]); // 第一条记录
```

### 修改记录
```javascript
const encounters = JSON.parse(localStorage.getItem('encounters'));
encounters[0].likes = 99;  // 修改点赞数
encounters[0].liked = true; // 标记为已点赞
localStorage.setItem('encounters', JSON.stringify(encounters));
location.reload(); // 刷新页面
```

### 查看统计
```javascript
const encounters = JSON.parse(localStorage.getItem('encounters'));
console.log('总数:', encounters.length);
console.log('已点赞:', encounters.filter(e => e.liked).length);
```

---

## 🐛 常见问题

### Q1: 看不到遭遇记录？

**A**: 检查以下几点：
1. 是否生成了测试数据？
   ```javascript
   localStorage.getItem('encounters')
   ```
2. 刷新页面 (`F5`)
3. 检查浏览器控制台是否有错误

---

### Q2: 点赞没有反应？

**A**: 
1. 检查是否点击的是 ❤️ 按钮
2. 查看控制台是否有错误
3. 确认 `profile.js` 已加载
4. 刷新页面重试

---

### Q3: 时间显示不正确？

**A**: 
时间是相对显示，基于：
- `timestamp` 字段（毫秒时间戳）
- 当前时间

如果时间不对，检查：
```javascript
const encounters = JSON.parse(localStorage.getItem('encounters'));
console.log(new Date(encounters[0].timestamp));
```

---

### Q4: 如何重置数据？

**A**: 
```javascript
// 方法 1: 使用测试工具
clearTestEncounters();

// 方法 2: 直接删除
localStorage.removeItem('encounters');
location.reload();

// 方法 3: 使用个人页面的"データをリセット"按钮
```

---

### Q5: 移动端震动不工作？

**A**: 
1. 确认浏览器支持震动 API
2. 确认设备有震动功能
3. 某些浏览器需要用户交互才能触发震动

---

## 📊 数据格式

### 单条记录结构
```javascript
{
    user: 'Taro',           // 用户名 (string)
    distance: 50,           // 距离-米 (number)
    location: '新宿駅',     // 地点 (string)
    timestamp: 1234567890,  // 时间戳-毫秒 (number)
    likes: 5,               // 点赞数 (number)
    liked: true             // 是否已点赞 (boolean)
}
```

### 完整数组
```javascript
[
    {
        user: 'Taro',
        distance: 50,
        location: '新宿駅',
        timestamp: 1698765432100,
        likes: 5,
        liked: true
    },
    {
        user: 'Hanako',
        distance: 120,
        location: '渋谷駅',
        timestamp: 1698761832100,
        likes: 3,
        liked: false
    }
    // ... 最多 100 条
]
```

---

## 🎯 测试场景

### 场景 1: 空状态
```javascript
clearTestEncounters();
// 刷新页面，应该看到星星和提示文字
```

### 场景 2: 少量数据
```javascript
clearTestEncounters();
addTestEncounter();
addTestEncounter();
addTestEncounter();
// 刷新页面，应该看到 3 张卡片，没有"查看更多"按钮
```

### 场景 3: 大量数据
```javascript
generateTestEncounters();
// 刷新页面，应该看到 5 张卡片 + "もっと見る"按钮
```

### 场景 4: 点赞功能
```javascript
generateTestEncounters();
// 刷新页面，点击几个❤️按钮
// 观察统计数字变化
```

---

## 🔧 高级用法

### 自定义遭遇
```javascript
const encounters = JSON.parse(localStorage.getItem('encounters') || '[]');
encounters.unshift({
    user: '自定义用户',
    distance: 30,
    location: '你的位置',
    timestamp: Date.now(),
    likes: 10,
    liked: true
});
localStorage.setItem('encounters', JSON.stringify(encounters));
location.reload();
```

### 批量修改点赞
```javascript
const encounters = JSON.parse(localStorage.getItem('encounters'));
encounters.forEach(e => {
    e.liked = true;
    e.likes = Math.floor(Math.random() * 20);
});
localStorage.setItem('encounters', JSON.stringify(encounters));
location.reload();
```

### 导出数据
```javascript
const encounters = JSON.parse(localStorage.getItem('encounters'));
const dataStr = JSON.stringify(encounters, null, 2);
const blob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'encounters.json';
a.click();
```

---

## 🎉 完整测试流程

### 1️⃣ 初始化
```javascript
// 加载测试工具
const script = document.createElement('script');
script.src = '/js/test-encounters.js';
document.head.appendChild(script);
```

### 2️⃣ 生成数据
```javascript
generateTestEncounters();
```

### 3️⃣ 刷新页面
按 `F5`

### 4️⃣ 测试功能
- ✅ 查看卡片显示
- ✅ 悬停效果
- ✅ 点赞/取消点赞
- ✅ 统计数字变化
- ✅ 查看更多加载
- ✅ 移动端响应式

### 5️⃣ 清理数据
```javascript
clearTestEncounters();
```

---

## 📸 效果预览

### 桌面端
```
┌─────────────────────────────────────────────┐
│  すれ違い履歴                                │
│  これまでの出会いを振り返りましょう。         │
├─────────────────────────────────────────────┤
│  👥 総数: 10    ❤️ お気に入り: 5           │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │  T  Taro              3時間前       │   │
│  │     📍 新宿駅                       │   │
│  │     📏 約 50m                       │   │
│  │     ❤️ 5                            │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  H  Hanako            5時間前       │   │
│  │     📍 渋谷駅                       │   │
│  │     📏 約 120m                      │   │
│  │     ❤️ 3                            │   │
│  └─────────────────────────────────────┘   │
│  ...                                        │
│  [ もっと見る ▼ ]                          │
└─────────────────────────────────────────────┘
```

---

**开始探索遭遇历史功能吧！** 👋✨

---

*文档版本: 1.0*  
*最后更新: 2024-10-31*  
*测试工具: test-encounters.js*


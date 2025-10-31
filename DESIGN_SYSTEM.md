# Sure Link - Apple 风格设计系统

## 📱 设计理念
Sure Link 采用统一的 Apple 风格设计系统，提供类原生 APP 的视觉体验。

---

## 🎨 颜色系统

### 主题色
```css
--primary: #007aff           /* iOS 蓝色 */
--primary-dark: #005fd1      /* 深蓝（悬停/激活状态） */
--primary-light: #4da3ff     /* 浅蓝（辅助） */
```

### 辅助色
```css
--green: #34c759            /* 成功/在线状态 */
--red: #ff3b30              /* 错误/删除操作 */
--orange: #ff9500           /* 警告 */
--purple: #af52de           /* 特殊标记 */
```

### 背景色
```css
--bg: #f8f8f8               /* 主背景 */
--bg-light: #ffffff         /* 卡片背景 */
--bg-card: rgba(255, 255, 255, 0.9)  /* 毛玻璃卡片 */
```

### 文字色
```css
--text-primary: #1d1d1f     /* 主要文字 */
--text-secondary: #6e6e73   /* 次要文字 */
--text-tertiary: #999       /* 辅助文字 */
```

---

## 📐 间距系统
```css
--spacing-xs: 8px
--spacing-sm: 12px
--spacing: 16px
--spacing-lg: 24px
--spacing-xl: 32px
```

---

## 🔲 圆角系统
```css
--radius-sm: 12px           /* 小元素 */
--radius: 16px              /* 标准卡片 */
--radius-lg: 20px           /* 大卡片/按钮 */
```

---

## ✨ 阴影系统
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05)      /* 轻微阴影 */
--shadow: 0 4px 12px rgba(0, 0, 0, 0.08)        /* 标准阴影 */
--shadow-lg: 0 10px 30px rgba(15, 35, 95, 0.12) /* 强阴影 */
```

---

## 📱 安全区域
```css
--safe-bottom: env(safe-area-inset-bottom)  /* 底部刘海适配 */
--safe-top: env(safe-area-inset-top)        /* 顶部刘海适配 */
```

---

## 🎭 毛玻璃效果
所有使用 `backdrop-filter` 的地方必须加 Safari 前缀：
```css
-webkit-backdrop-filter: blur(12px);
backdrop-filter: blur(12px);
```

---

## 📄 页面结构

### 1. Welcome 页面 (welcome.html)
- **风格**：现代启动页，渐变背景
- **特色**：动画 Logo、平滑过渡
- **配色**：浅色渐变背景 (#eef2ff → #ffffff)

### 2. Home 页面 (index.html)
- **风格**：信息展示页
- **特色**：服务器状态卡片、留言板
- **组件**：毛玻璃卡片、PWA 安装指南

### 3. Chat 页面 (chat.html)
- **风格**：聊天界面
- **特色**：气泡消息、实时通信
- **配色**：蓝色（自己）、白色（他人）

### 4. Map 页面 (map.html)
- **风格**：地图展示
- **特色**：交互式地图、扫描按钮
- **组件**：浮动按钮、Toast 提示

### 5. Profile 页面 (profile.html)
- **风格**：个人资料卡片
- **特色**：玻璃质感、统计数据网格
- **配色**：柔和渐变背景

---

## 🧩 通用组件

### 导航栏 (nav)
- 固定底部
- 毛玻璃效果
- 激活态放大动画
- 安全区域适配

### 顶部栏 (header)
- 固定顶部
- 毛玻璃效果
- 安全区域适配

### 按钮
- 标准圆角：12-20px
- 悬停效果：向上平移 + 阴影增强
- 激活效果：缩小 scale(0.95-0.98)

### 输入框
- 聚焦态：蓝色边框 + 外发光
- 过渡动画：0.2s ease

---

## 📱 响应式断点

### 650px 以下（手机）
- 减小字体和间距
- 优化触摸目标（最小 44px）
- 调整卡片内边距

### 420px 以下（小屏手机）
- 进一步优化布局
- 减小图标和按钮尺寸

---

## 🌙 Dark Mode
支持系统深色模式自动切换：
```css
@media (prefers-color-scheme: dark) {
    /* 深色模式样式 */
}
```

---

## ✅ 浏览器兼容性
- ✅ iOS Safari 9+
- ✅ Chrome/Edge (现代版本)
- ✅ Firefox (现代版本)
- ✅ 所有主流移动浏览器

---

## 📦 文件结构
```
public/css/
├── style.css        # 全局样式 + 导航 + 首页
├── welcome.css      # 启动页样式
├── chat.css         # 聊天页样式
├── map.css          # 地图页样式
├── profile.css      # 个人页样式
└── pwa-guide.css    # PWA 指南样式
```

---

## 🎯 设计原则
1. **统一性**：所有页面使用相同的设计语言
2. **流畅性**：所有交互带有平滑过渡动画
3. **响应式**：完美适配各种屏幕尺寸
4. **可访问性**：良好的对比度和触摸目标
5. **性能优先**：优化动画和渲染性能

---

最后更新：2025-10-31


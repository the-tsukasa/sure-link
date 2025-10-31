# 📋 Sure Link 版本管理指南

## 🎯 目标
确保 PWA 用户始终看到最新的 CSS 和 JS 更新。

---

## 📦 版本管理系统

### 当前版本
- **CSS/JS 版本**: `2.1.0`
- **Service Worker 版本**: `surelink-v5`
- **发布日期**: 2024-10-31

---

## 🔄 更新流程

### 场景 1: CSS 样式更新 🎨

#### 步骤

1️⃣ **修改 CSS 文件**
```css
/* public/css/profile.css */
.encounter-card {
    background: linear-gradient(...);
    /* 新样式 */
}
```

2️⃣ **升级版本号**
- **小改动**（颜色、间距）：`2.1.0` → `2.1.1` (patch)
- **中等改动**（布局、新组件）：`2.1.0` → `2.2.0` (minor)
- **大改动**（完全重构）：`2.1.0` → `3.0.0` (major)

3️⃣ **更新所有 HTML 文件的 CSS 链接**

```html
<!-- 需要更新的文件 -->
- public/index.html
- public/chat.html
- public/map.html
- public/profile.html
- public/welcome.html
- public/nickname.html
- public/encounter.html

<!-- 示例 -->
<link rel="stylesheet" href="css/style.css?v=2.1.1" />
<link rel="stylesheet" href="css/profile.css?v=2.1.1" />
```

4️⃣ **更新 Service Worker**

```javascript
// public/sw.js
const CACHE_NAME = "surelink-v6"; // v5 → v6
```

5️⃣ **提交代码**
```bash
git add .
git commit -m "Update: CSS v2.1.1 - 修复遭遇卡片样式"
git push
```

6️⃣ **Render 自动部署** ✅

---

### 场景 2: JavaScript 逻辑更新 💻

#### 步骤

1️⃣ **修改 JS 文件**
```javascript
// public/js/profile.js
class EncounterHistory {
    // 修复 bug 或新增功能
}
```

2️⃣ **升级版本号**
- **Bug 修复**：`2.1.0` → `2.1.1`
- **新功能**：`2.1.0` → `2.2.0`

3️⃣ **更新 HTML 中的 JS 引用**（可选）

如果需要强制重新加载 JS：
```html
<script defer src="js/profile.js?v=2.1.1"></script>
```

4️⃣ **更新 Service Worker**
```javascript
const CACHE_NAME = "surelink-v6";
```

5️⃣ **提交代码**
```bash
git add .
git commit -m "Fix: 修复点赞功能 bug (v2.1.1)"
git push
```

---

### 场景 3: HTML 结构更新 📄

#### 步骤

1️⃣ **修改 HTML 文件**
```html
<!-- public/profile.html -->
<section class="new-feature">
    <!-- 新功能 -->
</section>
```

2️⃣ **升级版本号**
- **新页面**：`2.1.0` → `2.2.0`
- **删除功能**：`2.1.0` → `3.0.0`（破坏性）

3️⃣ **更新相关 CSS**
```html
<link rel="stylesheet" href="css/profile.css?v=2.2.0" />
```

4️⃣ **更新 Service Worker**
```javascript
const CACHE_NAME = "surelink-v6";
```

5️⃣ **提交代码**
```bash
git add .
git commit -m "Feature: 添加新功能模块 (v2.2.0)"
git push
```

---

## 📊 版本号规则

### 格式：`MAJOR.MINOR.PATCH`

```
2.1.0
│ │ │
│ │ └─ Patch:  Bug 修复、小调整
│ └─── Minor:  新功能、布局改动
└───── Major:  重大更新、破坏性变更
```

### 升级时机

#### Patch (x.x.X)
- 修复样式 bug
- 调整颜色、间距
- 性能优化
- 文本修改

**示例**：
- `2.1.0` → `2.1.1`：修复按钮颜色
- `2.1.1` → `2.1.2`：优化动画性能

#### Minor (x.X.x)
- 新增功能模块
- 布局重构
- 新页面
- 删除小功能

**示例**：
- `2.1.0` → `2.2.0`：添加遭遇历史
- `2.2.0` → `2.3.0`：添加设置页面

#### Major (X.x.x)
- UI 完全重构
- 移除主要功能
- 架构变更
- 不兼容旧版本

**示例**：
- `2.9.0` → `3.0.0`：深色主题重构
- `3.9.0` → `4.0.0`：迁移到新框架

---

## 🔢 Service Worker 版本管理

### 命名规则

```javascript
const CACHE_NAME = "surelink-vX";
//                          │
//                          └─ 整数版本号
```

### 升级时机

**每次 CSS/JS 有任何更改时，都必须升级！**

```javascript
// 之前
const CACHE_NAME = "surelink-v5";

// 任何更新后
const CACHE_NAME = "surelink-v6";

// 再次更新
const CACHE_NAME = "surelink-v7";
```

### 版本号对应

| CSS/JS 版本 | SW 版本 | 说明 |
|------------|---------|------|
| 2.0.0      | v4      | 深色主题 |
| 2.1.0      | v5      | 移除颜色功能 |
| 2.1.1      | v6      | 修复样式 bug |
| 2.2.0      | v7      | 新增设置页面 |
| 3.0.0      | v8      | 重大更新 |

---

## 📝 提交消息规范

### 格式

```
<type>: <description> (vX.X.X)

示例：
Feature: 添加遭遇历史功能 (v2.1.0)
Fix: 修复点赞按钮样式 (v2.1.1)
Update: 优化个人页面布局 (v2.2.0)
```

### Type 类型

- `Feature:` - 新功能
- `Fix:` - Bug 修复
- `Update:` - 更新优化
- `Refactor:` - 重构
- `Style:` - 样式调整
- `Docs:` - 文档更新
- `Perf:` - 性能优化

### 示例

```bash
# 新功能
git commit -m "Feature: 添加遭遇历史功能 (v2.1.0)"

# Bug 修复
git commit -m "Fix: 修复点赞按钮样式错误 (v2.1.1)"

# 样式更新
git commit -m "Style: 优化卡片圆角和阴影 (v2.1.2)"

# 布局重构
git commit -m "Update: 重构个人页面布局 (v2.2.0)"

# 重大更新
git commit -m "Refactor: 迁移到暗色主题 (v3.0.0)"
```

---

## ✅ 更新检查清单

### 发布前

```markdown
- [ ] 修改了 CSS/JS 文件
- [ ] 决定了新版本号（patch/minor/major）
- [ ] 更新了所有 HTML 中的 CSS 链接版本号
- [ ] 更新了 Service Worker 的 CACHE_NAME
- [ ] 本地测试通过
- [ ] 无 Linter 错误
- [ ] 提交消息符合规范
```

### 发布后

```markdown
- [ ] Render 部署成功
- [ ] 打开应用，检查新样式
- [ ] 清除浏览器缓存，重新测试
- [ ] 手机端测试
- [ ] Service Worker 已更新
- [ ] 缓存已刷新
```

---

## 🛠️ 快速命令

### 一键更新所有 CSS 版本号

使用以下脚本（保存为 `update-version.sh`）：

```bash
#!/bin/bash

# 使用方法: ./update-version.sh 2.2.0 v7

NEW_CSS_VERSION=$1
NEW_SW_VERSION=$2

if [ -z "$NEW_CSS_VERSION" ] || [ -z "$NEW_SW_VERSION" ]; then
    echo "使用方法: ./update-version.sh <CSS版本> <SW版本>"
    echo "示例: ./update-version.sh 2.2.0 v7"
    exit 1
fi

echo "🔄 更新版本号..."
echo "   CSS/JS: $NEW_CSS_VERSION"
echo "   Service Worker: surelink-$NEW_SW_VERSION"

# 更新所有 HTML 文件的 CSS 版本号
find public -name "*.html" -exec sed -i.bak "s/\\.css?v=[0-9.]*/.css?v=$NEW_CSS_VERSION/g" {} \;

# 更新 Service Worker
sed -i.bak "s/surelink-v[0-9]*/surelink-$NEW_SW_VERSION/" public/sw.js

echo "✅ 版本号更新完成！"
echo "📝 别忘了提交代码"
```

使用：
```bash
chmod +x update-version.sh
./update-version.sh 2.2.0 v7
```

---

## 🐛 常见问题

### Q1: 更新后用户看不到新样式？

**原因**: Service Worker 缓存未更新

**解决**:
1. 检查 `sw.js` 的 `CACHE_NAME` 是否已更新
2. 检查 HTML 中的 CSS 版本号是否已更新
3. 等待几分钟（Service Worker 自动更新）
4. 或手动清除缓存：
   ```javascript
   caches.keys().then(keys => {
       keys.forEach(key => caches.delete(key));
   });
   ```

---

### Q2: 如何强制用户立即更新？

**方法 1: 提示用户刷新**

在 `sw.js` 添加：
```javascript
self.addEventListener('install', (event) => {
    self.skipWaiting(); // 跳过等待，立即激活
});

self.addEventListener('activate', (event) => {
    clients.claim(); // 立即控制所有页面
});
```

**方法 2: 自动刷新**

在主页面添加：
```javascript
navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
});
```

---

### Q3: 开发时如何禁用缓存？

**Chrome DevTools**:
1. 按 `F12` 打开开发者工具
2. 进入 **Application** > **Service Workers**
3. 勾选 **Bypass for network**
4. 或点击 **Unregister** 注销 Service Worker

---

## 📊 版本历史

### v2.1.0 (2024-10-31)
- ✅ 移除"あなたのカラー"功能
- ✅ 优化个人页面布局
- ✅ 添加遭遇历史功能
- ✅ 实现 PWA 缓存自动更新

### v2.0.0 (2024-10-30)
- ✅ 深色主题重构
- ✅ 移除顶部 banner
- ✅ 统一蓝紫配色
- ✅ MVC 架构重构

### v1.0.0 (2024-10-15)
- ✅ 初始版本
- ✅ 基础聊天功能
- ✅ 地图定位
- ✅ 遭遇检测

---

## 🎯 最佳实践

### DO ✅
- ✅ 每次更新 CSS/JS 都升级版本号
- ✅ 保持版本号一致（所有 HTML 使用相同版本）
- ✅ 及时更新 Service Worker
- ✅ 提交消息清晰明确
- ✅ 本地测试后再部署

### DON'T ❌
- ❌ 修改 CSS 但不升级版本号
- ❌ 忘记更新 Service Worker
- ❌ 不同页面使用不同版本号
- ❌ 跳过测试直接部署
- ❌ 提交消息不清晰

---

## 🚀 未来改进

### 自动化版本管理
- 使用 npm scripts 自动更新版本号
- CI/CD 自动检查版本号一致性
- 自动生成 CHANGELOG

### 示例 `package.json`:
```json
{
  "scripts": {
    "version:patch": "node scripts/bump-version.js patch",
    "version:minor": "node scripts/bump-version.js minor",
    "version:major": "node scripts/bump-version.js major"
  }
}
```

---

**遵循这个指南，确保用户始终看到最新版本！** 🎉✨

---

*文档版本: 1.0*  
*最后更新: 2024-10-31*  
*维护者: Sure Link Team*


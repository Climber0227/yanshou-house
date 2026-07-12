# iOS 高级感动效改造 — 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 subagent-driven-development（推荐）或 executing-plans 逐任务实现此计划。步骤使用 `- [ ]` 语法来跟踪进度。

**目标：** 为分户验收小程序注入 iOS 级别动效质感，包括页面转场、卡片弹性淡入、微交互反馈、骨架屏 shimmer，以及毛玻璃卡片视觉升级。

**架构：** 所有动效通过 CSS/SCSS 层实现（`transform`/`opacity` GPU 合成），骨架屏通过新建通用组件 `Skeleton.vue` 替换现有文字 loading。不动业务逻辑和数据流。

**技术栈：** uni-app (Vue 3) + SCSS + WeChat mini-program

**设计规格：** `dev-docs/specs/2026-07-12-ios-animation-spec.md`

---

### 任务 1：全局动画系统升级 — uni.scss

**文件：** 修改 `miniprogram/src/uni.scss`

核心变更：新增 keyframes、升级 spring 弹性曲线、增强微交互、新增 shimmer 动画、毛玻璃卡片样式。

- [ ] **步骤 1：替换现有 keyframes 为 iOS 弹性曲线**

将现有的 `fadeInUp` keyframe 替换为 spring 弹性版本：

```scss
// === iOS Spring 弹性动画曲线 ===
// cubic-bezier(0.16, 1, 0.3, 1) ≈ iOS spring(response: 0.4, damping: 0.8)

@keyframes cardAppear {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

// 保留现有 pulse（通知呼吸）、slideInRight、countUp
// 但 countUp 加入弹性曲线
```

- [ ] **步骤 2：升级卡片和列表项动画为 spring 曲线**

找到现有卡片动画规则（第 54 行附近），替换为：

```scss
// 所有卡片添加弹性淡入动效
.card, .card-accent, .m-card, .check-card, [class*="card-"],
.i-row, .issue-row, .tl-item, .recent-item, .select-row {
  animation: cardAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

// 按钮点击反馈 — 增强为弹性回弹
.btn-primary, .btn-outline, [class*="btn-"], [class*="action-card"] {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.2s ease,
              box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-primary:active, .btn-outline:active,
[class*="btn-"]:active, [class*="action-card"]:active {
  transform: scale(0.96);
  opacity: 0.85;
}
```

- [ ] **步骤 3：新增 iOS 分段控件样式**

在 `uni.scss` 末尾添加 iOS 风格分段控件：

```scss
// === iOS 风格分段控件 ===
.seg {
  display: flex;
  background: rgba(118, 118, 128, 0.12);
  border-radius: 9px;
  padding: 2px;
  margin-bottom: 16px;
  animation: cardAppear 0.5s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.seg-item {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 13px;
  font-weight: 500;
  color: #8E8E93;
  border-radius: 7px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.seg-item.active {
  background: #fff;
  color: #007AFF;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
```

- [ ] **步骤 4：新增毛玻璃卡片样式**

```scss
// === iOS 毛玻璃卡片 ===
.card, .card-accent, .m-card, [class*="card-"] {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid rgba(255,255,255,0.7);
}
```

> 注意：`.card` 样式已在多个位置定义，需确保 override 顺序正确。建议将 `.card` 基础样式集中到 `uni.scss`，各页面 scoped 样式只做定制覆盖。

- [ ] **步骤 5：新增 skeleton shimmer 关键帧**

```scss
// === Skeleton Shimmer ===
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

- [ ] **步骤 6：新增 Toast 顶部滑入样式（可选）**

```scss
// === iOS 风格 Toast（从顶部滑入） ===
@keyframes toastDrop {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **步骤 7：提交**

```bash
git add miniprogram/src/uni.scss
git commit -m "feat: upgrade global animations to iOS spring curves + glass cards"
```

---

### 任务 2：视觉 Token 微调 — tokens.scss

**文件：** 修改 `miniprogram/src/styles/tokens.scss`

- [ ] **步骤 1：调整圆角变量为 iOS 标准值**

```scss
// 圆角 — iOS 化
$radius-sm: 8px;      // 6px → 8px
$radius-md: 14px;     // 10px → 14px（iOS 卡片标准）
$radius-lg: 20px;     // 16px → 20px
```

- [ ] **步骤 2：调整阴影变量更轻盈**

```scss
// 阴影 — iOS 轻盈感
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
```

- [ ] **步骤 3：提交**

```bash
git add miniprogram/src/styles/tokens.scss
git commit -m "style: iOS-standard rounded corners and soft shadows"
```

---

### 任务 3：页面转场配置 — pages.json

**文件：** 修改 `miniprogram/src/pages.json`

- [ ] **步骤 1：在 globalStyle 中添加页面转场动画配置**

```json
{
  "globalStyle": {
    "navigationBarTextStyle": "white",
    "navigationBarTitleText": "分户验收",
    "navigationBarBackgroundColor": "#006FFD",
    "backgroundColor": "#F8F9FE",
    "animationType": "slide-in-right",
    "animationDuration": 300
  }
}
```

- [ ] **步骤 2：提交**

```bash
git add miniprogram/src/pages.json
git commit -m "feat: add iOS slide-in page transition"
```

---

### 任务 4：创建 Skeleton 骨架屏组件

**文件：** 创建 `miniprogram/src/components/Skeleton.vue`

- [ ] **步骤 1：编写骨架屏组件**

```vue
<template>
  <view class="skt" :class="[type]" :style="wrapStyle">
    <!-- 统计卡片骨架 -->
    <template v-if="type === 'stat'">
      <view class="skt-grid">
        <view v-for="i in count || 4" :key="i" class="skt-block">
          <view class="skt-shape skt-line skt-w-40" />
          <view class="skt-shape skt-rect skt-h-28 skt-mt-8" />
        </view>
      </view>
    </template>

    <!-- 列表卡片骨架 -->
    <template v-else-if="type === 'card'">
      <view v-for="i in count || 3" :key="i" class="skt-row" :style="{ animationDelay: (i - 1) * 0.08 + 's' }">
        <view class="skt-dot" />
        <view class="skt-body">
          <view class="skt-shape skt-rect skt-h-16 skt-w-70" />
          <view class="skt-shape skt-rect skt-h-12 skt-w-40 skt-mt-8" />
        </view>
      </view>
    </template>

    <!-- 详情骨架 -->
    <template v-else-if="type === 'detail'">
      <view class="skt-shape skt-rect skt-h-20 skt-w-60 skt-mb-16" />
      <view class="skt-shape skt-rect skt-h-80 skt-w-100 skt-mb-12" />
      <view class="skt-shape skt-rect skt-h-12 skt-w-90 skt-mb-8" />
      <view class="skt-shape skt-rect skt-h-12 skt-w-70" />
    </template>

    <!-- 默认：单个方框 -->
    <template v-else>
      <view class="skt-shape skt-rect" :style="{ height: height || '40px', width: width || '100%' }" />
    </template>
  </view>
</template>

<script setup>
const props = defineProps({
  type: { type: String, default: 'card' },   // 'stat' | 'card' | 'detail'
  count: { type: Number, default: 0 },
  height: { type: String, default: '' },
  width: { type: String, default: '' },
})
</script>

<style lang="scss" scoped>
.skt {
  width: 100%;
}

// 网格容器（统计用）
.skt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.skt-block {
  background: rgba(255,255,255,0.85);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

// 列表卡片骨架行
.skt-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.85);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  animation: cardAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.skt-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E5E5EA;
  flex-shrink: 0;
}

.skt-body {
  flex: 1;
  min-width: 0;
}

// 通用形状 — 带 shimmer
.skt-shape {
  background: linear-gradient(90deg, #E5E5EA 25%, #F2F2F7 50%, #E5E5EA 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 6px;
}

.skt-rect { border-radius: 6px; }
.skt-line  { height: 12px; border-radius: 6px; }
.skt-h-12 { height: 12px; }
.skt-h-16 { height: 16px; }
.skt-h-20 { height: 20px; }
.skt-h-28 { height: 28px; }
.skt-h-80 { height: 80px; }
.skt-w-40 { width: 40%; }
.skt-w-60 { width: 60%; }
.skt-w-70 { width: 70%; }
.skt-w-90 { width: 90%; }
.skt-w-100 { width: 100%; }
.skt-mt-8 { margin-top: 8px; }
.skt-mb-8 { margin-bottom: 8px; }
.skt-mb-12 { margin-bottom: 12px; }
.skt-mb-16 { margin-bottom: 16px; }
</style>
```

- [ ] **步骤 2：提交**

```bash
git add miniprogram/src/components/Skeleton.vue
git commit -m "feat: add Skeleton component with shimmer animation"
```

---

### 任务 5：微交互增强 — 按钮/分段控件/TAB 指示条

**文件：** 修改 `uni.scss` + 各页面 `.vue` 文件

- [ ] **步骤 1：在 uni.scss 中统一按钮、状态标签过渡**

在 uni.scss 现有 `.tag-*` 规则中添加过渡：

```scss
// 状态标签增加颜色过渡
.tag, .tag-pending, .tag-progress, .tag-review, .tag-closed, .tag-rejected {
  transition: all 0.3s ease;
}
```

- [ ] **步骤 2：替换 task-list.vue 分段控件为 iOS 样式**

修改 `pages/task-list/task-list.vue`：
- 移除 scoped 中的 `.seg` `.seg-item` 样式（由全局 uni.scss 接管）
- 确保 class 名称与全局 `.seg` `.seg-item` 匹配

- [ ] **步骤 3：替换 batch-report.vue 分段控件**

类似 task-list.vue，确保 `<view class="seg-lg">` 和 `<view class="seg-item-lg">` 兼容 iOS 样式，或改为使用 `.seg`/`.seg-item`

- [ ] **步骤 4：检查 inspect.vue TAB 切换添加平滑指示条动画**

检查 `pages/inspect/inspect.vue` 的 TAB 切换（检查页的"观感/实测/公区"切换），添加平滑指示条过渡。

- [ ] **步骤 5：提交**

```bash
git add miniprogram/src/uni.scss
git add miniprogram/src/pages/task-list/task-list.vue
git add miniprogram/src/pages/batch-report/batch-report.vue
git add miniprogram/src/pages/inspect/inspect.vue
git commit -m "feat: iOS segmented controls and micro-interactions"
```

---

### 任务 6：骨架屏接入各页面

**文件：** 修改以下页面文件，将 `v-if="loading"` 文字提示替换为 `<Skeleton>` 组件

- [ ] **步骤 1：替换 task-list.vue 加载状态**

```vue
// 替换第 12 行：
// <view v-if="loading" class="empty"><text>加载中...</text></view>
// 改为：
<Skeleton v-if="loading" type="card" :count="4" />
```

- [ ] **步骤 2：替换 index.vue 统计加载**

首页统计区域，加载时显示 `<Skeleton type="stat" :count="4" />`

- [ ] **步骤 3：替换 household-center.vue 加载**

```vue
<Skeleton v-if="loading" type="card" :count="4" />
```

- [ ] **步骤 4：替换 issue-detail.vue 加载**

```vue
<Skeleton v-if="loading" type="detail" />
```

- [ ] **步骤 5：替换 problem-library.vue 加载**

```vue
<Skeleton v-if="loading" type="card" :count="4" />
```

- [ ] **步骤 6：替换 qrcode.vue 加载**

```vue
<Skeleton v-if="loading" type="card" />
```

- [ ] **步骤 7：提交**

```bash
git add miniprogram/src/pages/task-list/task-list.vue
git add miniprogram/src/pages/index/index.vue
git add miniprogram/src/pages/household-center/household-center.vue
git add miniprogram/src/pages/issue-detail/issue-detail.vue
git add miniprogram/src/pages/problem-library/problem-library.vue
git add miniprogram/src/pages/qrcode/qrcode.vue
git commit -m "feat: replace loading text with Skeleton components"
```

---

### 任务 7：毛玻璃卡片应用与验证

**文件：** 验证各页面卡片样式一致性

- [ ] **步骤 1：检查各页面自定义卡片样式是否与全局毛玻璃冲突**

全局 `.card` 在 uni.scss 中统一为毛玻璃背景。各页面 scoped 样式中的 `.card` 定义（如 `task-list.vue`、`issue-detail.vue`、`household-center.vue` 等）可能覆盖全局样式。逐一检查并移除冲突定义。

查找所有 scoped 中的 `.card` 样式：

```bash
grep -rn "\.card[^-]" miniprogram/src/pages/*/*.vue --include="*.vue" | grep -v node_modules
```

如果存在冲突，移除 scoped 中的重复定义，只保留定制化部分（如宽度、边距）。

- [ ] **步骤 2：构建验证**

```bash
cd miniprogram && npm run dev:mp-weixin
```

确认构建无错误。

- [ ] **步骤 3：提交**

```bash
git add -A
git commit -m "feat: apply glass card style across all pages"
```

---

### 任务 8：全面验证

**文件：** 无代码变更

- [ ] **步骤 1：确认构建成功**

```bash
cd miniprogram && npm run dev:mp-weixin
```

预期：构建无错误，dist 目录生成完整。

- [ ] **步骤 2：验证关键页面渲染**

打开微信开发者工具，确认以下页面在开发者工具中正常渲染：
- 首页（统计毛玻璃卡片 + 弹性动画）
- 任务列表（分段控件 iOS 化 + 骨架屏加载）
- 户操作中心（问题列表 + 骨架屏）
- 检查页（TAB 切换）
- 问题详情（骨架屏 + 时间线动画）

- [ ] **步骤 3：最终提交**

```bash
git add .gitignore dev-docs/
git commit -m "docs: add iOS animation spec and implementation plan"
```

---

## 执行交接

计划已完成并保存到 `dev-docs/specs/2026-07-12-ios-animation-plan.md`。

两种执行方式：

**1. 子代理驱动（推荐）** — 每个任务调度一个新的子代理，任务间进行审查，快速迭代

**2. 内联执行** — 在当前会话中逐任务执行，完成一个再做一个

**选哪种方式？**

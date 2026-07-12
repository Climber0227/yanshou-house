# iOS 高级感动效改造规格说明

> 日期：2026-07-12
> 状态：设计已批准，待实现

---

## 一、改造目标

在保留现有蓝白配色和整体布局的基础上，为分户验收小程序注入 iOS 级别的动效质感。核心改动全部在 CSS/SCSS 层和少量组件层，不动业务逻辑和数据流。

---

## 二、动效分类

### 1. 页面转场（原生推入感）

| 项 | 方案 |
|---|------|
| 效果 | 页面切换时从右向左滑入（iOS 标准 push），返回时反向 |
| 实现 | uni-app 原生 `animationType` 配置 |
| 代码位置 | `pages.json` → `globalStyle` |
| 补充 | 导航栏标题配合渐变动画 |

**配置方案：**
```json
{
  "globalStyle": {
    "animationType": "slide-in-right",
    "animationDuration": 300
  }
}
```

> ⚠️ 微信小程序对自定义页面转场支持有限。如果原生配置效果不理想，降级方案为：在 `uni.scss` 中定义全局进出过渡，通过 Vue `<transition>` 包裹路由视图。

---

### 2. 列表逐条弹性淡入（Stagger Animation）

| 项 | 方案 |
|---|------|
| 效果 | 卡片/列表项从下方弹入，带 iOS spring 弹性曲线，逐条递增延迟 |
| 曲线 | `cubic-bezier(0.16, 1, 0.3, 1)` — 模拟 iOS spring( response=0.4, damping=0.8) |
| 延迟 | 首项 0.02s，后续每项递增 0.04-0.06s |

**代码变更：`uni.scss`**
```scss
// 替换现有的 fadeInUp
@keyframes cardAppear {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.card, .i-row, .issue-row, .tl-item, .recent-item, .select-row {
  animation: cardAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
// nth-child 延迟链保持不变
```

**涉及页面：**
- 首页统计卡片（4 项）
- 任务列表（所有分段）
- 户操作中心问题列表
- 问题详情时间线
- 通知列表
- 问题库列表
- 所有带 `.card` 类名的元素

---

### 3. 微交互反馈（Micro-interactions）

| 交互 | 效果 | 实现 |
|------|------|------|
| 按钮按压 | 缩小至 0.96 + 背景加深 | `:active` 伪类，`transform: scale(0.96)` + `opacity: 0.9`，已有但增强弹性 |
| 按钮释放回弹 | 从按压态弹性恢复 | `transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)` |
| 分段控件 | 选中项平滑滑动切换 | iOS 风格 `.segment` + `.segment-item.active` 过渡 |
| Toast | 从顶部滑入，带毛玻璃背景 | 替换 `uni.showToast` 为自定义组件（可选） |
| 状态标签 | 颜色过渡动画 | 所有 `.tag-*` 类加 `transition: all 0.3s ease` |
| 通知徽章 | 呼吸动画 | 已有 `pulse` keyframe，保留 |
| TAB 切换（检查页） | 底部指示条平滑滑动 | CSS `transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)` |

**代码位置：** `uni.scss` + 各页面 scoped 样式

---

### 4. 骨架屏 Shimmer 光效（Skeleton Screen）

| 项 | 方案 |
|---|------|
| 效果 | 加载时显示灰白渐变矩形块，从左到右光影扫过 |
| 动画 | `@keyframes shimmer` — 背景位置循环平移 |
| 组件 | 新建 `Skeleton.vue` 通用组件 |

**Skeleton 组件设计：**
```vue
<template>
  <view class="skeleton" :style="skeletonStyle">
    <!-- 根据 type 渲染不同骨架形状 -->
    <view v-if="type === 'card'" class="s-card">
      <view class="s-line s-line-title" />
      <view class="s-line s-line-body" />
      <view class="s-line s-line-body short" />
    </view>
    <view v-if="type === 'stat'" class="s-stat">
      <view class="s-block" />
      <view class="s-line" />
    </view>
  </view>
</template>
```

**Shimmer 动画（`uni.scss`）：**
```scss
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #E5E5EA 25%, #F2F2F7 50%, #E5E5EA 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 8px;
}
```

**替换场景：**
- 首页统计加载（4 个方块骨架）
- 任务列表加载（3-5 条卡片骨架）
- 问题详情加载（标题 + 内容骨架）
- 户中心加载（信息 + 列表骨架）
- 移除现有文字提示式 loading

---

## 三、iOS 风格视觉微调

动画之外，配合以下视觉微调强化 iOS 感（不动配色）：

| 调整 | 说明 | 位置 |
|------|------|------|
| 毛玻璃卡片 | 卡片背景改为 `rgba(255,255,255,0.85)` + `backdrop-filter: blur(20px)` | `.card` 类统一修改 |
| 卡片阴影 | 从 `border: 1px solid #E8E9F1` 改为 `box-shadow: 0 1px 3px rgba(0,0,0,0.04)` + 细边框 | `uni.scss` |
| 圆角统一 | 所有圆角统一为 14px（iOS 卡片标准） | `tokens.scss` → `$radius-md: 14px` |
| 分段控件 | iOS 原生样式：浅灰背景 + 白底滑块 + 蓝色激活文字 | 新建 `.segment` 样式 |
| 标题加粗 | 页面标题使用 28px/700w 大标题风格 | 各页面导航栏 |
| 状态栏 | 配合导航栏背景色一致 | 各页面 |

---

## 四、实现顺序

1. **`uni.scss` — 全局动画升级**（cardAppear keyframe、spring 曲线、微交互增强）
2. **`tokens.scss` — 微调圆角和阴影变量**
3. **页面转场配置** — `pages.json` 加 animationType
4. **微交互** — 各页面按钮 `:active` 统一、分段控件 iOS 化、TAB 指示条动画
5. **`Skeleton.vue` 组件** — 创建骨架屏通用组件
6. **骨架屏接入** — 逐个页面替换 loading 状态
7. **毛玻璃卡片** — 全局 `.card` 样式升级

---

## 五、文件变更清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `miniprogram/src/uni.scss` | 修改 | 新增 keyframes、升级 spring 曲线、微交互、shimmer、毛玻璃卡片 |
| `miniprogram/src/styles/tokens.scss` | 修改 | 微调圆角/阴影 token |
| `miniprogram/src/pages.json` | 修改 | 加 animationType 配置 |
| `miniprogram/src/components/Skeleton.vue` | 新增 | 骨架屏通用组件 |
| 各页面 `.vue` 文件 | 修改 | 骨架屏接入、按钮 :active 统一、分段控件替换 |

---

## 六、兼容性与性能注意

- **`backdrop-filter`** — iOS WKWebView 完全支持；Android XWeb（Chromium 内核）较新版本支持。无需 polyfill，设置 `background: rgba(255,255,255,0.85)` 作为降级底色
- **`box-shadow` 性能** — 大量带阴影的卡片在滚动列表中可能造成低端 Android 掉帧。卡片阴影统一使用浅阴影 `0 1px 3px`，减少渲染压力
- **动效能耗** — `transform`/`opacity` 动画由 GPU 合成，不影响主线程。`backdrop-filter` 会触发 GPU 合成，建议仅在可见区域卡片上使用

## 七、不修改的内容

- 业务逻辑和数据流
- Mock 数据和 API 层
- 页面路由和参数传递
- 配色方案（保持蓝白基调）
- 现有组件接口

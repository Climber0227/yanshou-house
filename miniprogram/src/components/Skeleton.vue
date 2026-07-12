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
.skt { width: 100%; }

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
  width: 8px; height: 8px; border-radius: 50%;
  background: #E5E5EA; flex-shrink: 0;
}

.skt-body { flex: 1; min-width: 0; }

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

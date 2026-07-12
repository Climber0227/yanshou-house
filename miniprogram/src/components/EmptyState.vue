<template>
  <view class="empty-state">
    <text class="empty-text">{{ text }}</text>
    <text v-if="subtext" class="empty-subtext">{{ subtext }}</text>
  </view>
</template>

<script setup>
defineProps({
  text: { type: String, default: '暂无数据' },
  subtext: { type: String, default: '' }
})
</script>

<style scoped>
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; }
.empty-text { font-size: 14px; color: #64748b; }
.empty-subtext { font-size: 12px; color: #94a3b8; margin-top: 4px; }
</style>

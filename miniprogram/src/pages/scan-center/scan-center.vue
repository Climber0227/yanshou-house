<template>
<view class="page">
  <view class="hero">
    <view class="hero-box">
      <view class="hero-icon">
        <view class="hero-frame"></view>
      </view>
    </view>
    <text class="hero-title">扫码验房</text>
    <text class="hero-hint">扫描入户门二维码，进入户操作</text>
    <view class="btn-primary" @click="scan">开始扫码</view>
    <view class="btn-text" @click="goManual">手动选择楼栋</view>
  </view>

  <view v-if="recent.length > 0" class="recent-section">
    <text class="recent-title">最近访问</text>
    <view v-for="h in recent" :key="h.id" class="recent-item" @click="goHub(h.id)">
      <view>
        <text class="recent-name">{{ h.name }}</text>
        <text class="recent-time">上次 {{ h.lastTime }}</text>
      </view>
    </view>
  </view>
</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onUnload, onShareAppMessage } from '@dcloudio/uni-app'

const recent = ref([])

function loadRecent() {
  try {
    const raw = uni.getStorageSync('recent_visits')
    recent.value = raw ? JSON.parse(raw) : []
  } catch(e) { recent.value = [] }
}

function saveRecent(hId, hName) {
  let list = recent.value.filter(h => h.id !== hId)
  list.unshift({ id: hId, name: hName, lastTime: new Date().toLocaleDateString('zh-CN', {month:'numeric',day:'numeric'}) })
  list = list.slice(0, 10)
  recent.value = list
  uni.setStorageSync('recent_visits', JSON.stringify(list))
}

function scan() {
  uni.scanCode({
    success: (res) => {
      uni.navigateTo({ url: '/pages/household-center/household-center?code=' + encodeURIComponent(res.result || '') })
    },
    fail: () => { uni.showToast({ title: '扫码取消', icon: 'none' }) }
  })
}

function goManual() {
  uni.navigateTo({ url: '/pages/household-center/household-center?select=1' })
}

function goHub(id) { uni.navigateTo({ url: '/pages/household-center/household-center?householdId=' + id }) }

function onVisit(h) { saveRecent(h.id, h.name) }

onShow(() => {
  loadRecent()
  uni.$on('visit', onVisit)
})

onUnload(() => {
  uni.$off('visit', onVisit)
})

onShareAppMessage(() => ({ title: '扫码验房 - 分户验收', path: '/pages/scan-center/scan-center' }))
</script>

<style scoped>
.page { padding: 0 $sp-lg 20px; }
.hero { display: flex; flex-direction: column; align-items: center; padding: 40px 0 20px; text-align: center; }
.hero-box { margin-bottom: 16px; }
.hero-icon { width: 72px; height: 72px; border: 3px solid $primary; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
.hero-frame { width: 32px; height: 32px; border: 2px solid $primary; border-radius: 4px; }
.hero-title { font-size: 18px; font-weight: 700; color: $text-primary; margin-bottom: 6px; }
.hero-hint { font-size: 12px; color: $text-secondary; line-height: 1.6; margin-bottom: 20px; }
.btn-primary { background: $primary; color: #fff; border-radius: $radius-sm; padding: 12px 48px; font-size: $fs-md; font-weight: 600; }
.btn-primary:active { opacity: 0.85; }
.btn-text { margin-top: 12px; font-size: 13px; color: $primary; padding: 8px 16px; }
.btn-text:active { opacity: 0.7; }

.recent-section { margin-top: 20px; }
.recent-title { font-size: 13px; font-weight: 600; color: $text-hint; margin-bottom: 8px; }
.recent-item { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid $border; border-radius: $radius-sm; padding: 12px 14px; margin-bottom: 6px; }
.recent-item:active { border-color: $primary; }
.recent-name { font-size: $fs-md; font-weight: 500; color: $text-primary; display: block; }
.recent-time { font-size: 10px; color: $text-hint; margin-top: 1px; }

</style>

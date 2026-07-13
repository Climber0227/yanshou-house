<template>
<view class="page">
  <view class="hero">
    <view class="hero-icon">
      <view class="scan-frame"></view>
    </view>
    <text class="hero-title">扫码验房</text>
    <text class="hero-hint">扫描入户门二维码，进入户操作</text>
    <view class="btn" @click="scan">开始扫码</view>
    <text class="manual" @click="goManual">手动选择楼栋 →</text>
  </view>

  <view v-if="recent.length > 0" class="sec">
    <text class="sec-title">最近访问</text>
    <view v-for="h in recent" :key="h.id" class="recent-item" @click="goHub(h.id)">
      <view class="recent-info">
        <text class="recent-name">{{ h.name }}</text>
        <text class="recent-meta">上次：{{ h.lastTime }}</text>
      </view>
      <text class="recent-arrow">›</text>
    </view>
  </view>
</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'

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

// 监听来自户操作中心的回传
uni.$on('visit', (h) => saveRecent(h.id, h.name))

onShow(() => loadRecent())

onShareAppMessage(() => ({ title: '扫码验房 - 分户验收', path: '/pages/scan-center/scan-center' }))
</script>

<style scoped>
.page { padding: 0 16px 20px; }
.hero { display: flex; flex-direction: column; align-items: center; padding: 40px 0 20px; text-align: center; }
.hero-icon { width: 80px; height: 80px; border: 3px solid #006FFD; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.scan-frame { width: 36px; height: 36px; border: 2.5px solid #006FFD; border-radius: 5px; }
.hero-title { font-size: 18px; font-weight: 700; color: #1F2024; margin-bottom: 6px; display: block; }
.hero-hint { font-size: 12px; color: #71727A; line-height: 1.6; margin-bottom: 20px; display: block; }
.btn { background: #006FFD; color: #fff; border-radius: 10px; padding: 12px 48px; font-size: 14px; font-weight: 600; display: inline-block; }
.manual { margin-top: 12px; font-size: 13px; color: #006FFD; }

.sec { margin-top: 20px; }
.sec-title { font-size: 13px; font-weight: 600; color: #8F9098; margin-bottom: 8px; display: block; }
.recent-item { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #E8E9F1; border-radius: 10px; padding: 12px 14px; margin-bottom: 6px; }
.recent-name { font-size: 14px; font-weight: 500; color: #1F2024; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-right: 8px; }
.recent-meta { font-size: 10px; color: #8F9098; }
.recent-arrow { color: #C5C6CC; font-size: 16px; }
</style>

<template>
  <view class="app-root">
    <view class="bg-deco-1"></view>
    <view class="bg-deco-2"></view>
    <router-view />
  </view>
</template>

<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getQueue, updateQueueItem, removeQueueItem } from '@/utils/storage'
import { reportIssue } from '@/api'

let networkWatcher = null

async function flushUploadQueue() {
  const queue = getQueue()
  const pending = queue.filter(item => item.status === 'pending')
  if (pending.length === 0) return

  for (const item of pending) {
    try {
      updateQueueItem(item.id, { status: 'uploading' })
      if (item.issues && item.issues.length > 0) {
        await Promise.all(item.issues.map(issue => reportIssue(issue)))
      }
      removeQueueItem(item.id)
    } catch (e) {
      updateQueueItem(item.id, { status: 'failed', error: e.message })
    }
  }
}

onLaunch(() => {
  const app = getApp()
  app.globalData = {}
  const userStore = useUserStore()
  userStore.initFromStorage()
})

onShow(() => {
  // 联网后自动消费上传队列
  uni.getNetworkType({
    success: (res) => {
      if (res.networkType !== 'none') flushUploadQueue()
    }
  })
  // 监听网络变化
  if (!networkWatcher) {
    networkWatcher = true
    uni.onNetworkStatusChange((res) => {
      if (res.isConnected) flushUploadQueue()
    })
  }
})

onHide(() => {
  // App 隐藏时不做特殊处理，保持 watcher 存活
})
</script>

<style lang="scss">
@import 'uview-plus/index.scss';
@import '@/styles/tokens.scss';

.app-root { position: relative; min-height: 100vh; overflow: hidden; }
.bg-deco-1, .bg-deco-2, .bg-deco-3 { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
.bg-deco-1 { width: 320px; height: 320px; background: radial-gradient(circle, rgba(0,111,253,0.07) 0%, transparent 70%); top: -100px; right: -80px; }
.bg-deco-2 { width: 220px; height: 220px; background: radial-gradient(circle, rgba(0,168,107,0.05) 0%, transparent 70%); bottom: 15%; left: -70px; }
.bg-deco-3 { width: 160px; height: 160px; background: radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%); top: 40%; right: -40px; }
</style>

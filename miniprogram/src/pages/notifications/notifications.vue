<template>
  <view class="page">
    <view v-for="n in notifications" :key="n.id"
      class="notif-item" :class="{ unread: !n.isRead }"
      @click="readNotif(n)">
      <view class="notif-dot" v-if="!n.isRead"></view>
      <view class="notif-body">
        <view class="notif-header">
          <text class="notif-title">{{ n.title }}</text>
          <text class="notif-time">{{ formatTime(n.createdAt) }}</text>
        </view>
        <text class="notif-content">{{ n.content }}</text>
      </view>
    </view>
    <EmptyState v-if="notifications.length === 0" text="暂无通知" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNotifications, markNotificationRead } from '@/api'
import EmptyState from '@/components/EmptyState.vue'

const notifications = ref([])

async function load() {
  const res = await getNotifications()
  if (res.code === 0) notifications.value = res.data.list || []
}

async function readNotif(n) {
  if (!n.isRead) {
    await markNotificationRead(n.id)
    n.isRead = true
  }
  // 跳转相关工单详情
  if (n.issueId) {
    uni.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + n.issueId })
  }
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

onMounted(() => { load() })
</script>

<style scoped>
.page { padding: 0 16px 20px; }
.notif-item { display: flex; align-items: flex-start; gap: 10px; padding: 14px 0; border-bottom: 1px solid #eee; }
.notif-item.unread { background: #f8f9fc; margin: 0 -16px; padding: 14px 16px; }
.notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #0D3B66; margin-top: 6px; flex-shrink: 0; }
.notif-body { flex: 1; }
.notif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.notif-title { font-size: 13px; font-weight: 600; color: #333; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notif-time { font-size: 10px; color: #999; flex-shrink: 0; margin-left: 8px; }
.notif-content { font-size: 12px; color: #666; line-height: 1.5; }
</style>

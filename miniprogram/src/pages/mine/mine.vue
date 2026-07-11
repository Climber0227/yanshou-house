<template>
  <view class="page">
    <view class="profile-card">
      <view class="profile-avatar">{{ (user?.nickname || '?').charAt(0) }}</view>
      <view class="profile-info">
        <text class="profile-name">{{ user?.nickname || '未登录' }}</text>
        <text class="profile-role">{{ user?.roleName || '' }}</text>
        <text class="profile-phone">{{ user?.phone || '' }}</text>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-item" @click="goPage('task-list')">
        <text class="menu-icon">📋</text>
        <text class="menu-label">我的任务</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('batch-report')">
        <text class="menu-icon">📦</text>
        <text class="menu-label">批量上报</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('household')">
        <text class="menu-icon">📁</text>
        <text class="menu-label">一户一档</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('notifications')">
        <text class="menu-icon">🔔</text>
        <text class="menu-label">通知消息</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="version-info">
      <text>分户验收 v1.0.0</text>
      <text>数据模式：Mock</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const user = computed(() => userStore.user)

function goPage(page) {
  const map = {
    'task-list': '/pages/task-list/task-list',
    'batch-report': '/pages/batch-report/batch-report',
    'household': '/pages/household/household',
    'notifications': '/pages/notifications/notifications'
  }
  uni.navigateTo({ url: map[page] })
}
</script>

<style scoped>
.page { padding: 0 16px 20px; }

.profile-card { display: flex; align-items: center; gap: 14px; padding: 20px 16px; margin: 12px 0; background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; }
.profile-avatar { width: 48px; height: 48px; border-radius: 10px; background: #1A56DB; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; }
.profile-info { flex: 1; }
.profile-name { font-size: 16px; font-weight: 600; color: #1e293b; display: block; }
.profile-role { font-size: 12px; color: #64748b; display: block; }
.profile-phone { font-size: 11px; color: #94a3b8; display: block; margin-top: 2px; }

.menu-group { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; }
.menu-item { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid #F1F5F9; }
.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 18px; margin-right: 10px; }
.menu-label { flex: 1; font-size: 14px; color: #1e293b; }
.menu-arrow { font-size: 18px; color: #CBD5E1; }

.version-info { text-align: center; padding: 24px 0; font-size: 11px; color: #94a3b8; display: flex; flex-direction: column; gap: 4px; }
</style>

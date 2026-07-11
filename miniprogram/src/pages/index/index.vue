<template>
  <view class="page">
    <!-- 用户信息栏 -->
    <view class="user-bar">
      <view class="user-info">
        <view class="user-avatar">{{ (user?.nickname || '?').charAt(0) }}</view>
        <view>
          <text class="user-name">{{ user?.nickname || '未登录' }}</text>
          <text class="user-role">{{ user?.roleName || '' }}</text>
        </view>
      </view>
      <view class="notif-badge" @click="goNotifications">
        <text class="notif-icon">🔔</text>
        <view v-if="unreadCount > 0" class="badge-dot">{{ unreadCount }}</view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="action-grid">
      <view class="action-item" @click="scanCode">
        <view class="action-icon scan">📷</view>
        <text class="action-label">扫码验房</text>
      </view>
      <view class="action-item" @click="goPage('task-list')">
        <view class="action-icon task">📋</view>
        <text class="action-label">我的任务</text>
      </view>
      <view class="action-item" @click="goPage('batch-report')">
        <view class="action-icon batch">📦</view>
        <text class="action-label">批量上报</text>
      </view>
      <view class="action-item" @click="goPage('household')">
        <view class="action-icon archive">📁</view>
        <text class="action-label">一户一档</text>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="section">
      <text class="section-title">统计概览</text>
      <view class="stat-grid">
        <view class="stat-item">
          <text class="stat-num primary">{{ stats.totalIssues }}</text>
          <text class="stat-label">问题总数</text>
        </view>
        <view class="stat-item">
          <text class="stat-num warning">{{ stats.pendingCount }}</text>
          <text class="stat-label">待整改</text>
        </view>
        <view class="stat-item">
          <text class="stat-num info">{{ stats.rectifyingCount }}</text>
          <text class="stat-label">整改中</text>
        </view>
        <view class="stat-item">
          <text class="stat-num success">{{ stats.closedCount }}</text>
          <text class="stat-label">已闭环</text>
        </view>
      </view>
    </view>

    <!-- 待办问题 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">待办问题</text>
        <text class="section-more" @click="goPage('task-list')">查看全部</text>
      </view>
      <view v-if="pendingIssues.length === 0" class="empty-section">
        <text>暂无待办问题</text>
      </view>
      <IssueCard
        v-for="issue in pendingIssues"
        :key="issue.id"
        :issue="issue"
        :showDeadline="true"
        @tap="goIssueDetail"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { getStatistics, getRectifyTasks, getNotifications } from '@/api'
import IssueCard from '@/components/IssueCard.vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)

const stats = ref({
  totalIssues: 0, pendingCount: 0, rectifyingCount: 0, pendingReviewCount: 0, closedCount: 0
})
const pendingIssues = ref([])
const unreadCount = ref(0)

async function loadData() {
  const [statRes, taskRes, notifRes] = await Promise.all([
    getStatistics(),
    getRectifyTasks('pending,rectifying'),
    getNotifications()
  ])
  if (statRes.code === 0) stats.value = statRes.data
  if (taskRes.code === 0) pendingIssues.value = taskRes.data.list || []
  if (notifRes.code === 0) {
    unreadCount.value = (notifRes.data.list || []).filter(n => !n.isRead).length
  }
}

function scanCode() {
  uni.scanCode({
    success: (res) => {
      uni.navigateTo({ url: '/pages/scan-result/scan-result?code=' + encodeURIComponent(res.result) })
    },
    fail: () => {
      uni.showToast({ title: '扫码失败', icon: 'none' })
    }
  })
}

function goPage(page) {
  const map = {
    'task-list': '/pages/task-list/task-list',
    'batch-report': '/pages/batch-report/batch-report',
    'household': '/pages/household/household'
  }
  uni.navigateTo({ url: map[page] })
}

function goIssueDetail(issue) {
  uni.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + issue.id })
}

function goNotifications() {
  uni.navigateTo({ url: '/pages/notifications/notifications' })
}

onMounted(() => { loadData() })
</script>

<style scoped>
.page { padding: 0 16px 20px; }

.user-bar { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 36px; height: 36px; border-radius: 8px; background: #1A56DB; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; }
.user-name { font-size: 15px; font-weight: 600; color: #1e293b; display: block; }
.user-role { font-size: 11px; color: #64748b; }
.notif-badge { position: relative; padding: 4px; }
.notif-icon { font-size: 20px; }
.badge-dot { position: absolute; top: 0; right: 0; background: #DC2626; color: #fff; font-size: 9px; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }

.action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
.action-item { background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 4px; text-align: center; }
.action-icon { font-size: 22px; margin-bottom: 4px; }
.action-label { font-size: 11px; color: #475569; }

.section { margin-bottom: 16px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.section-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px; display: block; }
.section-more { font-size: 11px; color: #1A56DB; }

.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.stat-item { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 4px; text-align: center; }
.stat-num { font-size: 20px; font-weight: 700; display: block; line-height: 1.2; }
.stat-num.primary { color: #1A56DB; }
.stat-num.warning { color: #B45309; }
.stat-num.info { color: #1A56DB; }
.stat-num.success { color: #0D9488; }
.stat-label { font-size: 10px; color: #64748b; margin-top: 2px; }

.empty-section { padding: 40px 0; text-align: center; color: #94a3b8; font-size: 13px; }
</style>

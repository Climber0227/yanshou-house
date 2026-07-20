<template>
<view class="page">
  <!-- 顶部：用户信息（紧凑）+ 通知 -->
  <view class="top-row">
    <view class="user-pill">
      <view class="avatar">{{ (user?.nickname || '?').charAt(0) }}</view>
      <view class="user-info">
        <text class="user-name">{{ user?.nickname || '未登录' }}</text>
        <text class="user-role">{{ user?.roleName || '' }}</text>
      </view>
    </view>
    <view class="notif" @click="goNotif">
      <text>通知</text>
      <text v-if="unread > 0">({{ unread }})</text>
    </view>
  </view>

  <!-- 大标题 -->
  <view class="hero">
    <text class="hero-title">工作台</text>
  </view>

  <!-- 统计卡片 -->
  <view v-if="loading" class="page-loading"><text>加载中...</text></view>
  <view v-else class="stats-grid">
    <view class="stat-card" @click="switchTabTask">
      <text class="stat-lbl">总户数</text>
      <text class="stat-val">{{ stats.totalHouseholds }}</text>
    </view>
    <view class="stat-card" @click="switchTabTask">
      <text class="stat-lbl">已排查</text>
      <text class="stat-val blue">{{ stats.checkedHouseholds }}</text>
      <text class="stat-sub" v-if="stats.totalHouseholds">完成率 {{ (stats.checkedHouseholds / stats.totalHouseholds * 100).toFixed(1) }}%</text>
    </view>
    <view class="stat-card" @click="goLibrary">
      <text class="stat-lbl">问题总数</text>
      <text class="stat-val">{{ stats.totalIssues }}</text>
    </view>
    <view class="stat-card" @click="switchTabTask">
      <text class="stat-lbl">已闭环</text>
      <text class="stat-val green">{{ stats.closedCount }}</text>
    </view>
  </view>

  <!-- 进度条 -->
  <view v-if="stats.totalHouseholds" class="progress-bar-bg">
    <view class="progress-bar-fill" :style="{ width: (stats.checkedHouseholds / stats.totalHouseholds * 100) + '%' }"></view>
  </view>

  <!-- 快速入口 -->
  <view class="quick-acts">
    <view class="qa-item" @click="goLibrary">
      <text class="qa-lbl">问题库</text>
    </view>
    <view class="qa-item" @click="switchTabTask">
      <text class="qa-lbl">全部任务</text>
    </view>
  </view>

  <!-- 我的待办 -->
  <view class="sec">
    <text class="sec-title">我的待办</text>
    <text class="sec-more" @click="switchTabTask">全部</text>
  </view>

  <template v-if="!loading">
    <view v-for="i in myIssues" :key="i.id" class="card" @click="goDetail(i)">
      <view class="card-row">
        <view class="dot" :class="dotMap[i.status]"></view>
        <view class="card-body">
          <text class="card-title">{{ i.description }}</text>
          <text class="card-meta">{{ i.householdName }}</text>
        </view>
        <text class="tag" :class="tagMap[i.status]">{{ i.statusName }}</text>
      </view>
    </view>
    <view v-if="myIssues.length === 0" class="empty"><text>暂无待办</text></view>
  </template>
</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getStatistics, getRectifyTasks, getPendingReviews, getNotifications } from '@/api'

const store = useUserStore()
const user = computed(() => store.user)
const role = computed(() => store.user?.role || '')

const stats = ref({ totalHouseholds: 0, pendingCount: 0, rectifyingCount: 0, closedCount: 0, checkedHouseholds: 0 })
const myIssues = ref([])
const unread = ref(0)
const loading = ref(false)

const dotMap = { pending:'dot-warn', rectifying:'dot-blue', pending_review:'dot-purple', closed:'dot-green' }
const tagMap = { pending:'tag-pending', rectifying:'tag-progress', pending_review:'tag-review', closed:'tag-closed' }

async function load() {
  loading.value = true
  const [s, t, r, n] = await Promise.all([
    getStatistics(), getRectifyTasks('pending,rectifying'), getPendingReviews(), getNotifications()
  ])
  if (s.code === 0) stats.value = s.data
  let list = []
  if (role.value === 'inspector' || role.value === 'admin' || role.value === 'supervisor') {
    if (r.code === 0) list = list.concat(r.data.list || [])
    if (t.code === 0) list = list.concat((t.data.list || []).filter(i => i.status !== 'pending'))
  }
  if (role.value === 'rectifier' && t.code === 0) list = (t.data.list || [])
  if (!role.value && t.code === 0) list = (t.data.list || [])
  myIssues.value = list.slice(0, 10)
  if (n.code === 0) unread.value = (n.data.list || []).filter(x => !x.isRead).length
  loading.value = false
}

function goDetail(i) { uni.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + i.id }) }
function goNotif() { uni.navigateTo({ url: '/pages/notifications/notifications' }) }
function switchTabTask() { uni.switchTab({ url: '/pages/task-list/task-list' }) }
function goLibrary() { uni.navigateTo({ url: '/pages/problem-library/problem-library' }) }

onMounted(() => load())
onShow(() => load())
onShareAppMessage(() => ({ title: '分户验收 - 工作台', path: '/pages/index/index' }))
</script>

<style scoped>
.page { padding: 0 12px 20px; }
.page-loading { padding: 60px 0; text-align: center; color: #999; font-size: 13px; }

.top-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
.user-pill { display: flex; align-items: center; gap: 8px; }
.avatar { width: 30px; height: 30px; background: #0D3B66; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; border-radius: 4px; }
.user-name { font-size: 13px; font-weight: 600; color: #333; display: block; }
.user-role { font-size: 10px; color: #999; }
.notif { font-size: 13px; color: #0D3B66; }

.hero { padding: 4px 0 12px; }
.hero-title { font-size: 22px; font-weight: 700; color: #333; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
.stat-card { padding: 12px; border: 1px solid #e0e0e0; border-radius: 6px; }
.stat-lbl { font-size: 11px; color: #999; display: block; margin-bottom: 2px; }
.stat-val { font-size: 22px; font-weight: 700; color: #333; }
.stat-val.blue { color: #0D3B66; }
.stat-val.green { color: #2E7D32; }
.stat-sub { font-size: 10px; color: #999; margin-top: 2px; display: block; }

.progress-bar-bg { height: 3px; background: #eee; margin: 4px 0 12px; border-radius: 2px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: #0D3B66; }

.quick-acts { display: flex; gap: 8px; margin-bottom: 16px; }
.qa-item { flex: 1; text-align: center; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; }
.qa-item:active { border-color: #0D3B66; }
.qa-lbl { font-size: 13px; font-weight: 500; color: #0D3B66; }

.sec { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.sec-title { font-size: 14px; font-weight: 600; color: #333; }
.sec-more { font-size: 13px; color: #0D3B66; }

.card-row { display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-warn { background: #CC7B00; }
.dot-blue { background: #0D3B66; }
.dot-purple { background: #7C3AED; }
.dot-green { background: #2E7D32; }
.card-body { flex: 1; }
.card-title { font-size: 13px; font-weight: 500; color: #333; display: block; }
.card-meta { font-size: 11px; color: #999; display: block; margin-top: 2px; }

.empty { padding: 40px 0; text-align: center; color: #999; font-size: 13px; }
</style>

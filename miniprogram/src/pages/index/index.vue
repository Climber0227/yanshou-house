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
      <text class="notif-icon">🔔</text>
      <view v-if="unread > 0" class="badge">{{ unread }}</view>
    </view>
  </view>

  <!-- 大标题 -->
  <view class="hero">
    <text class="hero-title">工作台</text>
  </view>

  <!-- 统计卡片：2x2 毛玻璃网格 -->
  <Skeleton v-if="loading" type="stat" :count="4" />
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
      <text class="qa-icon">📋</text>
      <text class="qa-lbl">问题库</text>
    </view>
    <view class="qa-item" @click="switchTabTask">
      <text class="qa-icon">📝</text>
      <text class="qa-lbl">全部任务</text>
    </view>
  </view>

  <!-- 我的待办 -->
  <view class="sec">
    <text class="sec-title">我的待办</text>
    <text class="sec-more" @click="switchTabTask">全部 ›</text>
  </view>

  <Skeleton v-if="loading" type="card" :count="3" />
  <template v-else>
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
import Skeleton from '@/components/Skeleton.vue'

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
.page { padding: 0 16px 20px; }

/* 顶部 */
.top-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0 0; }
.user-pill { display: flex; align-items: center; gap: 8px; }
.avatar { width: 30px; height: 30px; border-radius: 8px; background: #006FFD; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
.user-name { font-size: 13px; font-weight: 600; color: #1F2024; display: block; line-height: 1.3; }
.user-role { font-size: 10px; color: #8E8E93; }
.notif { position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.notif-icon { font-size: 18px; }
.badge { position: absolute; top: -2px; right: -2px; background: #FF3B30; color: #fff; font-size: 9px; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-weight: 600; }

/* 大标题 */
.hero { padding: 4px 0 16px; }
.hero-title { font-size: 28px; font-weight: 700; color: #000; letter-spacing: -0.3px; }

/* 统计卡片 2x2 */
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px; }
.stat-card { background: rgba(255,255,255,0.88); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 14px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid rgba(255,255,255,0.7); animation: cardAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
.stat-card:active { transform: scale(0.97); transition: transform 0.15s; }
.stat-card:nth-child(1) { animation-delay: 0.05s; }
.stat-card:nth-child(2) { animation-delay: 0.1s; }
.stat-card:nth-child(3) { animation-delay: 0.15s; }
.stat-card:nth-child(4) { animation-delay: 0.2s; }
.stat-lbl { font-size: 12px; color: #8E8E93; font-weight: 500; margin-bottom: 4px; letter-spacing: 0.2px; }
.stat-val { font-size: 26px; font-weight: 700; color: #000; letter-spacing: -0.5px; line-height: 1.1; }
.stat-val.blue { color: #007AFF; }
.stat-val.green { color: #34C759; }
.stat-sub { font-size: 11px; color: #8E8E93; margin-top: 2px; }

/* 进度条 */
.progress-bar-bg { height: 3px; background: rgba(118,118,128,0.12); border-radius: 2px; margin: 4px 0 16px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: #007AFF; border-radius: 2px; transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1); }

/* 快速入口 */
.quick-acts { display: flex; gap: 10px; margin-bottom: 20px; }
.qa-item { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: rgba(255,255,255,0.88); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid rgba(255,255,255,0.7); }
.qa-item:active { transform: scale(0.97); transition: transform 0.15s; }
.qa-icon { font-size: 18px; }
.qa-lbl { font-size: 13px; font-weight: 600; color: #007AFF; }

/* 待办列表 */
.sec { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.sec-title { font-size: 17px; font-weight: 600; color: #000; letter-spacing: -0.2px; }
.sec-more { font-size: 13px; color: #007AFF; font-weight: 500; }

.card-row { display: flex; align-items: center; gap: 10px; }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
.dot-warn { background: #FF9500; }
.dot-blue { background: #007AFF; }
.dot-purple { background: #AF52DE; }
.dot-green { background: #34C759; }
.card-body { flex: 1; min-width: 0; }
.card-title { font-size: 14px; font-weight: 600; color: #000; display: block; line-height: 1.3; }
.card-meta { font-size: 12px; color: #8E8E93; margin-top: 2px; display: block; }

.empty { padding: 40px 0; text-align: center; color: #8E8E93; font-size: 13px; }
</style>

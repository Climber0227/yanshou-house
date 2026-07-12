<template>
<view class="page">
  <!-- 顶部 -->
  <view class="top-row">
    <view class="user-left">
      <view class="avatar">{{ (user?.nickname || '?').charAt(0) }}</view>
      <view>
        <text class="user-name">{{ user?.nickname || '未登录' }}</text>
        <text class="user-role">{{ user?.roleName || '' }}</text>
      </view>
    </view>
    <view class="notif" @click="goNotif">
      <text class="notif-icon">&#9993;</text>
      <view v-if="unread > 0" class="badge">{{ unread }}</view>
    </view>
  </view>

  <!-- 统计 -->
  <view class="stat-row">
    <view class="stat-cell"><text class="stat-num">{{ stats.totalHouseholds }}</text><text class="stat-lbl">总户数</text></view>
    <view class="stat-cell"><text class="stat-num blue">{{ stats.checkedHouseholds }}</text><text class="stat-lbl">已排查</text></view>
    <view class="stat-cell"><text class="stat-num">{{ stats.totalIssues }}</text><text class="stat-lbl">问题总数</text></view>
    <view class="stat-cell"><text class="stat-num green">{{ stats.closedCount }}</text><text class="stat-lbl">已闭环</text></view>
  </view>
  <view class="stat-row">
    <view class="stat-cell"><text class="stat-num warn">{{ stats.pendingCount }}</text><text class="stat-lbl">待整改</text></view>
    <view class="stat-cell"><text class="stat-num blue">{{ stats.rectifyingCount }}</text><text class="stat-lbl">整改中</text></view>
    <view class="stat-cell"><text class="stat-num purple">{{ stats.pendingReviewCount }}</text><text class="stat-lbl">待复查</text></view>
    <view class="stat-cell"><text class="stat-num" :class="stats.rectifyRate >= 0.8 ? 'green' : 'warn'">{{ (stats.rectifyRate * 100).toFixed(0) }}%</text><text class="stat-lbl">完成率</text></view>
  </view>

  <!-- 快速入口 -->
  <view class="quick-acts">
    <view class="qa-item" @click="goLibrary">问题库</view>
  </view>

  <!-- 我的待办 -->
  <view class="sec">
    <text class="sec-title">我的待办</text>
    <text class="sec-more" @click="switchTabTask">全部 ›</text>
  </view>
  <view v-if="myIssues.length === 0" class="empty"><text>暂无待办</text></view>
  <view v-for="i in myIssues" :key="i.id" class="issue-row" @click="goDetail(i)">
    <view class="issue-l">
      <view class="dot" :class="dotMap[i.status]"></view>
      <view>
        <text class="i-title">{{ i.description }}</text>
        <text class="i-meta">{{ i.householdName }}</text>
      </view>
    </view>
    <text class="tag" :class="tagMap[i.status]">{{ i.statusName }}</text>
  </view>
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

const stats = ref({ totalHouseholds: 0, pendingCount: 0, rectifyingCount: 0, closedCount: 0 })
const myIssues = ref([])
const unread = ref(0)

const dotMap = { pending:'dot-warn', rectifying:'dot-blue', pending_review:'dot-purple', closed:'dot-green' }
const tagMap = { pending:'tag-pending', rectifying:'tag-progress', pending_review:'tag-review', closed:'tag-closed' }

async function load() {
  const [s, t, r, n] = await Promise.all([
    getStatistics(), getRectifyTasks('pending,rectifying'), getPendingReviews(), getNotifications()
  ])
  if (s.code === 0) stats.value = s.data
  // 按角色合并待办
  let list = []
  if (role.value === 'inspector' || role.value === 'admin' || role.value === 'supervisor') {
    if (r.code === 0) list = list.concat(r.data.list || [])
    if (t.code === 0) list = list.concat((t.data.list || []).filter(i => i.status !== 'pending'))
  }
  if (role.value === 'rectifier' && t.code === 0) list = (t.data.list || [])
  if (!role.value && t.code === 0) list = (t.data.list || [])
  myIssues.value = list.slice(0, 10)
  if (n.code === 0) unread.value = (n.data.list || []).filter(x => !x.isRead).length
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
.top-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
.user-left { display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 10px; background: #006FFD; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; }
.user-name { font-size: 15px; font-weight: 600; color: #1F2024; display: block; }
.user-role { font-size: 11px; color: #8F9098; }
.notif { position: relative; }
.notif-icon { font-size: 20px; color: #71727A; }
.badge { position: absolute; top: -4px; right: -6px; background: #ED3241; color: #fff; font-size: 9px; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }

.stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin-bottom: 16px; }
.stat-cell { background: #fff; border: 1px solid #E8E9F1; border-radius: 10px; padding: 12px 4px; text-align: center; }
.stat-num { font-size: 20px; font-weight: 700; color: #1F2024; display: block; line-height: 1.2; }
.stat-num.warn { color: #FF9500; }
.stat-num.blue { color: #006FFD; }
.stat-num.green { color: #00A86B; }
.stat-num.purple { color: #7C3AED; }
.stat-lbl { font-size: 10px; color: #8F9098; margin-top: 2px; }

.quick-acts { display: flex; gap: 8px; margin-bottom: 12px; }
.qa-item { padding: 8px 20px; background: #fff; border: 1.5px solid #006FFD; border-radius: 8px; font-size: 13px; font-weight: 600; color: #006FFD; }

.sec { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.sec-title { font-size: 14px; font-weight: 600; color: #1F2024; }
.sec-more { font-size: 12px; color: #006FFD; }

.issue-row { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #E8E9F1; border-radius: 10px; padding: 12px; margin-bottom: 6px; }
.issue-l { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-warn { background: #FF9500; }
.dot-blue { background: #006FFD; }
.dot-purple { background: #7C3AED; }
.dot-green { background: #00A86B; }
.i-title { font-size: 13px; font-weight: 600; color: #1F2024; display: block; }
.i-meta { font-size: 10px; color: #8F9098; margin-top: 2px; display: block; }

.tag { padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.tag-pending { background: #FFF3E0; color: #E65100; }
.tag-progress { background: #EAF2FF; color: #006FFD; }
.tag-review { background: #F3E8FF; color: #7C3AED; }
.tag-closed { background: #E8F5E9; color: #2E7D32; }
.empty { padding: 40px 0; text-align: center; color: #8F9098; font-size: 13px; }
</style>

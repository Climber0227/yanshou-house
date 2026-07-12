<template>
  <view class="page">
    <Skeleton v-if="loading" type="detail" />
    <template v-else-if="issue">
      <!-- 问题基本信息 -->
      <view class="card-accent">
        <view class="id-top">
          <text class="id-title">{{ issue.description }}</text>
          <text class="tag" :class="tagCls">{{ issue.statusName }}</text>
        </view>
        <view class="id-grid">
          <view class="id-g-item"><text class="id-g-lbl">所属户</text><text class="id-g-val">{{ issue.householdName }}</text></view>
          <view class="id-g-item"><text class="id-g-lbl">验收类型</text><text class="id-g-val">{{ issue.typeName }}</text></view>
          <view class="id-g-item"><text class="id-g-lbl">问题分类</text><text class="id-g-val">{{ issue.category }}</text></view>
          <view class="id-g-item"><text class="id-g-lbl">上报人</text><text class="id-g-val">{{ issue.reporter }}</text></view>
          <view class="id-g-item"><text class="id-g-lbl">整改人</text><text class="id-g-val">{{ issue.rectifier || '未指派' }}<text v-if="issue.rectifierPhone" style="color:#8F9098;font-size:10px;margin-left:4px;">{{ issue.rectifierPhone }}</text></text></view>
          <view class="id-g-item" v-if="issue.deadline">
            <text class="id-g-lbl">整改期限</text>
            <text class="id-g-val" :class="{ over: issue.isOverdue }">{{ fmt(issue.deadline) }} {{ issue.isOverdue ? '(已超期)' : '' }}</text>
          </view>
        </view>
      </view>

      <!-- 状态操作按钮 — 按角色权限显示 -->
      <view v-if="issue.status === 'pending' && (userRole === 'rectifier' || userRole === 'admin')" class="action-card" @click="startRectify">
        <text class="action-card-text">接收整改任务</text>
      </view>
      <view v-if="issue.status === 'rectifying' && (userId === issue.rectifierId || userRole === 'admin')" class="action-card" @click="goRectify">
        <text class="action-card-text">提交整改结果</text>
      </view>
      <view v-if="issue.status === 'pending_review' && (userRole === 'inspector' || userRole === 'supervisor' || userRole === 'admin')" class="action-card review" @click="goReview">
        <text class="action-card-text">复查确认</text>
      </view>

      <!-- 操作时间线 -->
      <view class="sec">
        <text class="sec-title">操作记录</text>
      </view>
      <view v-if="timeline.length === 0" class="empty"><text>暂无记录</text></view>
      <view v-for="(item, i) in timeline" :key="i" class="tl-item">
        <view class="tl-dot" :class="i === 0 ? 'tl-active' : ''"></view>
        <view class="tl-body">
          <text class="tl-action">{{ item.actionName }}</text>
          <text class="tl-meta">{{ item.operatorName }} · {{ item.operatorRole || '' }}</text>
          <text class="tl-time">{{ fmtTime(item.createdAt) }}</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getIssueDetail, getIssueTimeline, startRectify as startApi } from '@/api'
import Skeleton from '@/components/Skeleton.vue'

const store = useUserStore()
const userRole = computed(() => store.user?.role || '')
const userId = computed(() => store.user?.id || '')

const loading = ref(true)
const issue = ref(null)
const timeline = ref([])
let currentId = ''

const tagCls = computed(() => {
  const m = { pending:'tag-pending', rectifying:'tag-progress', pending_review:'tag-review', closed:'tag-closed' }
  return m[issue.value?.status] || 'tag-pending'
})

async function loadData(id) {
  loading.value = true
  const [r, tr] = await Promise.all([getIssueDetail(id), getIssueTimeline(id)])
  if (r.code === 0) issue.value = r.data
  if (tr.code === 0) timeline.value = tr.data.list || []
  loading.value = false
}

async function startRectify() {
  if (!issue.value) return
  const r = await startApi(issue.value.id)
  if (r.code === 0) { uni.showToast({ title: '已接收任务', icon: 'success' }); setTimeout(() => uni.navigateBack(), 800) }
}

function goRectify() { uni.navigateTo({ url: '/pages/rectify/rectify?id=' + issue.value.id }) }
function goReview() { uni.navigateTo({ url: '/pages/review/review?id=' + issue.value.id }) }

// 从整改/复查页返回后刷新数据
onShow(() => {
  if (currentId) loadData(currentId)
})
function fmt(d) { return d ? new Date(d).toLocaleDateString('zh-CN', {month:'numeric',day:'numeric'}) : '' }
function fmtTime(d) { return d ? new Date(d).toLocaleString('zh-CN', {month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '' }

onLoad((options) => {
  if (options?.id) { currentId = options.id; loadData(options.id) }
})

onShareAppMessage(() => {
  const desc = issue.value?.description || '问题详情'
  const hh = issue.value?.householdName || ''
  return { title: `${hh} - ${desc}`, path: '/pages/task-list/task-list' }
})
</script>

<style lang="scss" scoped>
.page { padding: 0 $sp-lg 20px; }

.card-accent { background: $bg-card; border: 1px solid $border; border-radius: $radius-md; padding: $sp-lg; position: relative; }
.card-accent::before { content: ''; position: absolute; left: 0; top: 14px; bottom: 14px; width: 3px; border-radius: 2px; background: $primary; }

.id-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: $sp-md; }
.id-title { font-size: $fs-lg; font-weight: 600; color: $text-primary; flex: 1; margin-right: $sp-sm; }

.id-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
.id-g-item { padding: 6px 0; border-bottom: 1px solid $border-light; display: flex; justify-content: space-between; }
.id-g-item:nth-last-child(-n+2) { border-bottom: none; }
.id-g-lbl { font-size: $fs-xs; color: $text-secondary; }
.id-g-val { font-size: $fs-xs; color: $text-primary; font-weight: 500; }
.id-g-val.over { color: $danger; font-weight: 600; }

.tag { padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.tag-pending { background: #FFF3E0; color: #E65100; }
.tag-progress { background: #EAF2FF; color: $primary; }
.tag-review { background: #F3E8FF; color: #7C3AED; }
.tag-closed { background: #E8F5E9; color: #2E7D32; }

.action-card { background: $primary-light; border: 1px solid $primary; border-radius: $radius-md; padding: 14px; text-align: center; margin: $sp-md 0; }
.action-card.review { background: #F0FDF4; border-color: $success; }
.action-card-text { font-size: $fs-md; font-weight: 600; color: $primary; }

.sec { display: flex; justify-content: space-between; align-items: center; margin: $sp-lg 0 $sp-sm; }
.sec-title { font-size: $fs-md; font-weight: 600; color: $text-primary; }

.tl-item { display: flex; gap: 10px; padding-bottom: 14px; position: relative; }
.tl-dot { width: 8px; height: 8px; border-radius: 50%; background: $border; margin-top: 4px; flex-shrink: 0; }
.tl-active { background: $primary; width: 10px; height: 10px; margin-top: 3px; }
.tl-body { flex: 1; }
.tl-action { font-size: $fs-sm; font-weight: 500; color: $text-primary; display: block; }
.tl-meta { font-size: $fs-xs; color: $text-secondary; }
.tl-time { font-size: 10px; color: $text-hint; }

.empty { padding: 60px 0; text-align: center; color: $text-hint; font-size: $fs-sm; }
</style>

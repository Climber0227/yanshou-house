<template>
  <view class="page">
    <view v-if="loading" class="loading-state"><text>加载中...</text></view>
    <template v-else-if="issue">
      <view class="card">
        <view class="detail-header">
          <text class="detail-title">{{ issue.description }}</text>
          <StatusTag :status="issue.status" />
        </view>
        <view class="detail-info">
          <view class="info-row"><text class="info-label">所属户</text><text>{{ issue.householdName }}</text></view>
          <view class="info-row"><text class="info-label">验收类型</text><text>{{ issue.typeName }}</text></view>
          <view class="info-row"><text class="info-label">问题分类</text><text>{{ issue.category }}</text></view>
          <view class="info-row"><text class="info-label">上报人</text><text>{{ issue.reporter }}</text></view>
          <view class="info-row"><text class="info-label">整改人</text><text>{{ issue.rectifier || '未指派' }}</text></view>
          <view class="info-row" v-if="issue.deadline">
            <text class="info-label">整改期限</text>
            <text :class="{ 'text-warning': issue.isOverdue }">{{ issue.deadline }} {{ issue.isOverdue ? '(已超期)' : '' }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view v-if="issue.status === 'pending'" class="card action-card" @click="startRectify">
        <text class="action-btn-text">📋 接收整改任务</text>
      </view>
      <view v-if="issue.status === 'rectifying'" class="card action-card" @click="goRectify">
        <text class="action-btn-text">📷 提交整改结果</text>
      </view>
      <view v-if="issue.status === 'pending_review'" class="card action-card" @click="goReview">
        <text class="action-btn-text">✅ 复查确认</text>
      </view>

      <!-- 操作记录 -->
      <view class="section">
        <text class="section-title">操作记录</text>
        <view v-if="timeline.length === 0" class="empty-section"><text>暂无记录</text></view>
        <view v-for="(item, i) in timeline" :key="i" class="timeline-item">
          <view class="timeline-dot" :class="i === 0 ? 'active' : ''"></view>
          <view class="timeline-body">
            <text class="timeline-action">{{ item.actionName }}</text>
            <text class="timeline-operator">{{ item.operatorName }} · {{ item.operatorRole }}</text>
            <text class="timeline-time">{{ item.createdAt }}</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getIssueDetail, getIssueTimeline, startRectify as startRectifyApi } from '@/api'
import StatusTag from '@/components/StatusTag.vue'

const loading = ref(true)
const issue = ref(null)
const timeline = ref([])

async function loadData(id) {
  loading.value = true
  const [res, timeRes] = await Promise.all([
    getIssueDetail(id),
    getIssueTimeline(id)
  ])
  if (res.code === 0) issue.value = res.data
  if (timeRes.code === 0) timeline.value = timeRes.data.list || []
  loading.value = false
}

async function startRectify() {
  if (!issue.value) return
  const res = await startRectifyApi(issue.value.id)
  if (res.code === 0) {
    uni.showToast({ title: '已接收任务' })
    issue.value.status = 'rectifying'
    issue.value.statusName = '整改中'
  }
}

function goRectify() {
  uni.navigateTo({ url: '/pages/rectify/rectify?id=' + issue.value.id })
}

function goReview() {
  uni.navigateTo({ url: '/pages/review/review?id=' + issue.value.id })
}

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  const id = page.$page?.options?.id || ''
  if (id) loadData(id)
})
</script>

<style scoped>
.page { padding: 0 16px 20px; }
.loading-state { padding: 80px 20px; text-align: center; color: #64748b; }

.detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.detail-title { font-size: 16px; font-weight: 600; color: #1e293b; flex: 1; margin-right: 8px; }

.detail-info { }
.info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #1e293b; border-bottom: 1px solid #F1F5F9; }
.info-label { color: #64748b; }
.text-warning { color: #B45309; font-weight: 500; }

.action-card { margin: 12px 0; padding: 14px; text-align: center; background: #EFF6FF; border-color: #1A56DB; }
.action-btn-text { font-size: 14px; font-weight: 600; color: #1A56DB; }

.section { margin-top: 16px; }
.section-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px; display: block; }

.timeline-item { display: flex; gap: 10px; padding-bottom: 12px; position: relative; }
.timeline-dot { width: 8px; height: 8px; border-radius: 50%; background: #CBD5E1; margin-top: 4px; flex-shrink: 0; }
.timeline-dot.active { background: #1A56DB; width: 10px; height: 10px; }
.timeline-body { flex: 1; }
.timeline-action { font-size: 13px; font-weight: 500; color: #1e293b; display: block; }
.timeline-operator { font-size: 11px; color: #64748b; }
.timeline-time { font-size: 10px; color: #94a3b8; }
.empty-section { padding: 30px; text-align: center; color: #94a3b8; font-size: 13px; }
</style>

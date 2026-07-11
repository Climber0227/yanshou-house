<template>
  <view class="page">
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <template v-else-if="household">
      <view class="household-hero">
        <text class="hero-building">{{ household.buildingName }}</text>
        <text class="hero-unit">{{ household.unitName }} · {{ household.floor }}层 · {{ household.room }}</text>
        <view class="hero-stats">
          <view class="hero-stat"><text class="hero-num">{{ household.issueCount || 0 }}</text><text>总问题</text></view>
          <view class="hero-stat"><text class="hero-num warning">{{ household.pendingCount || 0 }}</text><text>待处理</text></view>
          <view class="hero-stat"><text class="hero-num success">{{ household.closedCount || 0 }}</text><text>已闭环</text></view>
        </view>
      </view>

      <view class="action-list">
        <view class="action-btn" @click="goReport">
          <text class="action-btn-icon">📷</text>
          <view><text class="action-btn-title">问题上报</text><text class="action-btn-desc">拍照上传质量问题</text></view>
        </view>
        <view class="action-btn" @click="goHousehold">
          <text class="action-btn-icon">📋</text>
          <view><text class="action-btn-title">一户一档</text><text class="action-btn-desc">查看该户所有问题记录</text></view>
        </view>
        <view class="action-btn" @click="goBatch">
          <text class="action-btn-icon">📦</text>
          <view><text class="action-btn-title">批量上报</text><text class="action-btn-desc">同类问题复制到多户</text></view>
        </view>
        <view v-if="canAccept" class="action-btn" @click="acceptHousehold">
          <text class="action-btn-icon">✅</text>
          <view><text class="action-btn-title">标记无问题</text><text class="action-btn-desc">该户各项验收合格通过</text></view>
        </view>
      </view>

      <!-- 该户近期问题 -->
      <view class="section">
        <text class="section-title">近期问题</text>
        <IssueCard v-for="issue in issues" :key="issue.id" :issue="issue" @tap="goIssueDetail" />
        <view v-if="issues.length === 0" class="empty-section"><text>暂无问题记录</text></view>
      </view>
    </template>

    <view v-else-if="error" class="error-state">
      <text>{{ error }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHouseholdByQr, getHouseholdIssues, acceptHousehold as acceptHouseholdApi } from '@/api'
import IssueCard from '@/components/IssueCard.vue'

const loading = ref(true)
const household = ref(null)
const issues = ref([])
const error = ref('')
const canAccept = ref(false)

async function loadData(code) {
  loading.value = true
  try {
    const res = await getHouseholdByQr(code)
    if (res.code !== 0) { error.value = res.message; return }
    household.value = res.data
    const issueRes = await getHouseholdIssues(res.data.id, { pageSize: 5 })
    if (issueRes.code === 0) issues.value = issueRes.data.list || []
    canAccept.value = true
  } catch (e) {
    error.value = '扫码解析失败'
  } finally {
    loading.value = false
  }
}

function goReport() {
  uni.navigateTo({ url: '/pages/report/report?householdId=' + household.value.id })
}
function goHousehold() {
  uni.navigateTo({ url: '/pages/household/household?id=' + household.value.id })
}
function goBatch() {
  uni.navigateTo({ url: '/pages/batch-report/batch-report?householdId=' + household.value.id })
}
function goIssueDetail(issue) {
  uni.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + issue.id })
}
async function acceptHousehold() {
  uni.showModal({ title: '确认', content: '确认该户验收无问题？', success: async (res) => {
    if (res.confirm) {
      const result = await acceptHouseholdApi(household.value.id, 'visual')
      if (result.code === 0) uni.showToast({ title: '已确认' })
    }
  }})
}

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  const code = page.$page?.options?.code || ''
  loadData(code || 'h_001')
})
</script>

<style scoped>
.page { padding: 0 16px 20px; }
.loading-state, .error-state { padding: 80px 20px; text-align: center; color: #64748b; font-size: 14px; }

.household-hero { background: #1E3A5F; border-radius: 12px; padding: 20px; color: #fff; margin: 12px 0; text-align: center; }
.hero-building { font-size: 20px; font-weight: 700; display: block; }
.hero-unit { font-size: 13px; opacity: .7; margin-top: 4px; display: block; }
.hero-stats { display: flex; justify-content: center; gap: 24px; margin-top: 14px; }
.hero-stat { text-align: center; }
.hero-num { font-size: 22px; font-weight: 700; display: block; line-height: 1.2; }
.hero-num.warning { color: #FBBF24; }
.hero-num.success { color: #34D399; }
.hero-stat text:last-child { font-size: 11px; opacity: .65; }

.action-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.action-btn { background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; align-items: center; gap: 12px; }
.action-btn-icon { font-size: 24px; }
.action-btn-title { font-size: 14px; font-weight: 600; color: #1e293b; display: block; }
.action-btn-desc { font-size: 11px; color: #64748b; }

.section { margin-bottom: 16px; }
.section-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px; display: block; }
.empty-section { padding: 30px; text-align: center; color: #94a3b8; font-size: 13px; }
</style>

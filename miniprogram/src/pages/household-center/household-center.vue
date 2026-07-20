<template>
<view class="page">
  <view v-if="loading" class="page-loading"><text>加载中...</text></view>

  <template v-else-if="showSelector">
    <view class="sel-path">
      <text class="sel-path-item" :class="{ active: !selB }">楼栋</text>
      <text class="sel-path-item" :class="{ active: selB && !selU }">单元</text>
      <text class="sel-path-item" :class="{ active: selU && !selF }">楼层</text>
      <text class="sel-path-item" :class="{ active: selF }">户</text>
    </view>

    <view v-if="!selB">
      <text class="sel-hint">选择楼栋</text>
      <view class="sel-grid">
        <view v-for="b in buildings" :key="b.id"
          class="sel-btn" @click="pickB(b)">
          <text class="sel-btn-name">{{ b.name }}</text>
          <text class="sel-btn-cnt">{{ b.totalHouseholds }}户</text>
        </view>
      </view>
    </view>

    <template v-if="selB && !selU">
      <text class="sel-hint">选择 {{ buildingName(selB) }} 的单元</text>
      <view v-for="u in units" :key="u.id"
        class="sel-btn-row" @click="pickU(u)">
        <text class="sel-btn-row-text">{{ u.name }}</text>
        <text class="sel-btn-row-arrow">></text>
      </view>
    </template>

    <template v-if="selU && !selF">
      <text class="sel-hint">选择 {{ unitName(selU) }} 的楼层</text>
      <view class="sel-floor-row">
        <view v-for="f in 12" :key="f"
          class="sel-floor-btn" :class="{ active: selF === f }"
          @click="selF = f">
          <text>{{ f }}层</text>
        </view>
      </view>
    </template>

    <template v-if="selF">
      <text class="sel-hint">{{ selF }}层 选择户</text>
      <view v-for="h in filteredHhs" :key="h.id"
        class="sel-btn-row" @click="enterHousehold(h.id)">
        <view class="sel-btn-row-left">
          <view class="sel-room-tag">{{ h.room }}</view>
          <text class="sel-room-detail" v-if="h.issueCount > 0">{{ h.issueCount }}项问题</text>
          <text class="sel-room-detail" v-else>暂无问题</text>
        </view>
        <text class="sel-btn-row-arrow">></text>
      </view>
    </template>
  </template>

  <template v-else-if="household">
    <view class="hh-card">
      <view class="hh-top">
        <view class="hh-info">
          <text class="hh-name">{{ household.buildingName }}</text>
          <text class="hh-addr">{{ household.unitName }} {{ household.floor }}层 {{ household.room }}</text>
        </view>
        <view class="hh-tag" :class="household.acceptanceStatus === 'completed' ? 'hh-tag-done' : 'hh-tag-ing'">
          {{ household.acceptanceStatusName || '验收中' }}
        </view>
      </view>
      <view class="hh-stats">
        <view class="hh-stat-item"><text class="hh-stat-num">{{ issues.length }}</text><text class="hh-stat-lbl">总问题</text></view>
        <view class="hh-stat-item"><text class="hh-stat-num hh-stat-warn">{{ pendingN }}</text><text class="hh-stat-lbl">待处理</text></view>
        <view class="hh-stat-item"><text class="hh-stat-num hh-stat-done">{{ closedN }}</text><text class="hh-stat-lbl">已闭环</text></view>
      </view>
    </view>

    <view class="action-bar">
      <view class="action-btn" @click="goNextAction">
        <view class="action-btn-box" :class="overallStatus.class">
          <text class="action-btn-label">{{ overallStatus.label }}</text>
        </view>
      </view>
      <view class="action-btn" @click="goBatch">
        <view class="action-btn-box"><text class="action-btn-label">批量上报</text></view>
      </view>
      <view class="action-btn" @click="goQr">
        <view class="action-btn-box"><text class="action-btn-label">二维码</text></view>
      </view>
      <view class="action-btn" @click="goRecords">
        <view class="action-btn-box"><text class="action-btn-label">验收记录</text></view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">检查进度</text>
      <view class="tab-strip">
        <view v-for="tab in tabs" :key="tab.key"
          class="tab-item" :class="'tab-' + tabStatus(tab.key)"
          @click="goInspect(tab.key)">
          <text class="tab-state">{{ tabIcon(tabStatus(tab.key)) }}</text>
          <view>
            <text class="tab-name">{{ tab.label }}</text>
            <text class="tab-desc">{{ tabStateText(tabStatus(tab.key)) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="conclusion.show" class="conclusion" :class="'conclusion-' + conclusion.type">
      <text class="conclusion-text">{{ conclusion.title }}</text>
      <text class="conclusion-desc">{{ conclusion.desc }}</text>
    </view>

    <view class="section">
      <view class="section-hd">
        <text class="section-title">问题列表</text>
        <text class="section-count">{{ issues.length }}项</text>
      </view>
      <view v-if="issues.length === 0" class="empty">暂无问题</view>
      <view v-for="i in issues" :key="i.id" class="issue-row" @click="goDetail(i)">
        <view class="issue-dot" :class="'dot-' + i.status"></view>
        <view class="issue-body">
          <text class="issue-title">{{ i.description }}</text>
          <text class="issue-meta">{{ i.typeName }} {{ i.category }} {{ i.reporter }}</text>
        </view>
        <text class="tag" :class="'tag-' + i.status">{{ i.statusName }}</text>
      </view>
    </view>
  </template>

  <view v-else-if="err" class="page-error"><text>{{ err }}</text><text class="page-error-retry" @click="loadHousehold(currentHId)">重试</text></view>
</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getHouseholdByQr, getHouseholdDetail, getBuildings, getUnits, getHouseholds, acceptHousehold } from '@/api'

const store = useUserStore()
const userRole = computed(() => store.user?.role || '')
const userId = computed(() => store.user?.id || '')

const showSelector = ref(false)
const loading = ref(false)
const household = ref(null)
const issues = ref([])
const err = ref('')
const currentHId = ref('')
const checkStatus = ref({ visual: 'pending', measure: 'pending', public: 'pending' })

const tabs = [
  { key: 'visual', label: '观感检查' },
  { key: 'measure', label: '实测检查' },
  { key: 'public', label: '公区检查' }
]

const buildings = ref([])
const units = ref([])
const households = ref([])
const selB = ref('')
const selU = ref('')
const selF = ref(null)
const filteredHhs = computed(() => households.value.filter(h => h.floor === selF.value))

const pendingN = computed(() => issues.value.filter(i => i.status !== 'closed').length)
const closedN = computed(() => issues.value.filter(i => i.status === 'closed').length)
const allClosed = computed(() => issues.value.length > 0 && issues.value.every(i => i.status === 'closed'))
const householdAccepted = computed(() => household.value?.acceptanceStatus === 'completed')

const canAcceptHousehold = computed(() => {
  if (!allClosed.value || householdAccepted.value) return false
  if (userRole.value === 'admin') return true
  const reporterIds = [...new Set(issues.value.map(i => i.reporterId || '').filter(Boolean))]
  return reporterIds.includes(userId.value)
})

const allPassed = computed(() => {
  const s = checkStatus.value
  return s.visual === 'passed' && s.measure === 'passed' && s.public === 'passed'
})

const hasIssuesTab = computed(() => {
  const s = checkStatus.value
  return s.visual === 'has_issues' || s.measure === 'has_issues' || s.public === 'has_issues'
})

function tabStatus(key) { return checkStatus.value[key] || 'pending' }
function tabIcon(s) {
  if (s === 'passed') return '合格'
  if (s === 'has_issues') return '问题'
  return '待检'
}
function tabStateText(s) {
  if (s === 'passed') return '全部合格'
  if (s === 'has_issues') return '已检查有问题'
  return '未检查'
}

const overallStatus = computed(() => {
  if (allPassed.value) return { label: '验收完成', class: 'act-done' }
  if (householdAccepted.value) return { label: '已验收', class: 'act-done' }
  if (hasIssuesTab.value && canAcceptHousehold.value) return { label: '整户审核', class: 'act-review' }
  if (hasIssuesTab.value) return { label: '检查完成', class: 'act-ok' }
  return { label: '开始检查', class: '' }
})

const conclusion = computed(() => {
  if (allPassed.value) {
    return { show: true, type: 'success', title: '验收完成（全部合格）', desc: '该户三项检查全部通过，无需整改' }
  }
  if (householdAccepted.value) {
    return { show: true, type: 'success', title: '该户已验收完成', desc: '所有问题已整改闭环' }
  }
  if (canAcceptHousehold.value) {
    return { show: true, type: 'review', title: '全部问题已整改完成', desc: '点击整户审核确认验房结束' }
  }
  return { show: false, type: '', title: '', desc: '' }
})

function goInspect(type) {
  uni.navigateTo({ url: '/pages/inspect/inspect?householdId=' + household.value.id + '&tab=' + type })
}
function goBatch() { uni.navigateTo({ url: '/pages/batch-report/batch-report?householdId=' + household.value.id }) }
function goQr() { uni.navigateTo({ url: '/pages/qrcode/qrcode?id=' + household.value.id }) }
function goDetail(i) { uni.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + i.id }) }
function goRecords() { uni.navigateTo({ url: '/pages/form-records/form-records?householdId=' + household.value.id }) }

function goNextAction() {
  if (allPassed.value || householdAccepted.value) return
  if (hasIssuesTab.value && canAcceptHousehold.value) {
    acceptFullHousehold(); return
  }
  const first = tabs.find(t => tabStatus(t.key) !== 'passed')
  goInspect(first?.key || 'visual')
}

async function acceptFullHousehold() {
  uni.showModal({
    title: '验房确认',
    content: '该户所有问题均已完成整改，确认验收通过？',
    success: async (res) => {
      if (!res.confirm) return
      const r = await acceptHousehold(household.value.id, 'all')
      if (r.code === 0) {
        household.value.acceptanceStatus = 'completed'
        household.value.acceptanceStatusName = '已完成'
        uni.showToast({ title: '验房完成', icon: 'success' })
      }
    }
  })
}

function buildingName(id) { return buildings.value.find(b => b.id === id)?.name || '' }
function unitName(id) { return units.value.find(u => u.id === id)?.name || '' }

async function pickB(b) {
  selB.value = b.id; selU.value = ''; selF.value = null
  const r = await getUnits(b.id)
  if (r.code === 0) units.value = r.data.list || []
}
async function pickU(u) {
  selU.value = u.id; selF.value = null
  const r = await getHouseholds(selB.value, u.id)
  if (r.code === 0) households.value = r.data.list || []
}

async function enterHousehold(hId) {
  loading.value = true
  showSelector.value = false
  await loadHousehold(hId)
  try { uni.$emit('visit', { id: hId, name: household.value?.name || '' }) } catch {}
}

async function loadHousehold(id) {
  currentHId.value = id
  loading.value = true
  err.value = ''
  try {
    const r = await getHouseholdDetail(id)
    if (r.code === 0) {
      household.value = r.data
      issues.value = r.data.issues || []
      checkStatus.value = r.data.inspectionStatus || { visual: 'pending', measure: 'pending', public: 'pending' }
    } else {
      err.value = r.message
    }
  } catch (e) {
    err.value = '加载失败，请重试'
  }
  loading.value = false
}

onLoad((options) => {
  if (options?.select) {
    showSelector.value = true
    getBuildings().then(r => { if (r.code === 0) buildings.value = r.data.list || [] })
  } else if (options?.code) {
    getHouseholdByQr(options.code).then(qRes => {
      if (qRes.code === 0) loadHousehold(qRes.data.id)
    })
  } else if (options?.householdId) {
    loadHousehold(options.householdId)
  } else {
    showSelector.value = true
    getBuildings().then(r => { if (r.code === 0) buildings.value = r.data.list || [] })
  }
})

onShow(() => {
  if (currentHId.value) {
    getHouseholdDetail(currentHId.value).then(r => {
      if (r.code === 0) {
        issues.value = r.data.issues || []
        checkStatus.value = r.data.inspectionStatus || { visual: 'pending', measure: 'pending', public: 'pending' }
      }
    })
  }
})

onShareAppMessage(() => {
  const name = household.value ? `${household.value.buildingName} ${household.value.unitName} ${household.value.floor}层 ${household.value.room}` : '分户验收'
  return { title: `${name} - 分户验收`, path: '/pages/scan-center/scan-center' }
})
</script>

<style scoped>
.page { padding: 0 12px 20px; font-size: 13px; color: #333; }
.page-loading, .page-error { padding: 80px 0; text-align: center; color: #999; }
.page-error-retry { display: inline-block; margin-top: 12px; color: #0D3B66; padding: 8px 24px; border: 1px solid #0D3B66; border-radius: 4px; }

.sel-path { display: flex; align-items: center; justify-content: center; padding: 16px 0 12px; }
.sel-path-item { font-size: 12px; color: #999; padding: 4px 10px; border-radius: 4px; }
.sel-path-item.active { color: #fff; background: #0D3B66; }
.sel-hint { font-size: 13px; font-weight: 600; color: #666; margin: 12px 0 8px; }

.sel-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.sel-btn { padding: 14px; border: 1px solid #ddd; border-radius: 6px; text-align: center; }
.sel-btn:active { border-color: #0D3B66; }
.sel-btn-name { font-size: 15px; font-weight: 700; color: #333; display: block; }
.sel-btn-cnt { font-size: 11px; color: #999; display: block; margin-top: 4px; }

.sel-btn-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 6px; }
.sel-btn-row:active { border-color: #0D3B66; background: #f5f7fa; }
.sel-btn-row-text { font-size: 13px; color: #333; }
.sel-btn-row-arrow { color: #ccc; font-size: 14px; }
.sel-btn-row-left { display: flex; align-items: center; gap: 8px; flex: 1; }
.sel-room-tag { font-size: 13px; font-weight: 600; color: #333; }
.sel-room-detail { font-size: 11px; color: #999; }

.sel-floor-row { display: flex; flex-wrap: wrap; gap: 6px; }
.sel-floor-btn { padding: 8px 14px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; color: #666; min-width: 48px; text-align: center; }
.sel-floor-btn:active { border-color: #0D3B66; }
.sel-floor-btn.active { border-color: #0D3B66; background: #E8EDF3; color: #0D3B66; font-weight: 600; }

.hh-card { padding: 14px; margin-bottom: 10px; border: 1px solid #e0e0e0; border-radius: 6px; }
.hh-top { display: flex; justify-content: space-between; align-items: flex-start; }
.hh-name { font-size: 16px; font-weight: 700; color: #333; display: block; }
.hh-addr { font-size: 12px; color: #666; margin-top: 2px; display: block; }
.hh-tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.hh-tag-done { color: #2E7D32; background: #E8F5E9; }
.hh-tag-ing { color: #CC7B00; background: #FFF3E0; }
.hh-stats { display: flex; gap: 24px; margin-top: 12px; }
.hh-stat-num { font-size: 18px; font-weight: 700; color: #333; display: block; }
.hh-stat-warn { color: #CC7B00; }
.hh-stat-done { color: #2E7D32; }
.hh-stat-lbl { font-size: 10px; color: #999; display: block; margin-top: 2px; }

.action-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 12px 0; }
.action-btn-box { padding: 10px 4px; border: 1px solid #ddd; border-radius: 6px; text-align: center; }
.action-btn-box:active { border-color: #0D3B66; }
.action-btn-label { font-size: 11px; color: #333; font-weight: 500; }
.act-done { border-color: #2E7D32; }
.act-review { border-color: #0D3B66; }

.section { margin: 14px 0; }
.section-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.section-title { font-size: 14px; font-weight: 600; color: #333; }
.section-count { font-size: 11px; color: #999; }

.tab-strip { display: flex; gap: 6px; }
.tab-item { flex: 1; display: flex; align-items: center; gap: 6px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
.tab-item:active { border-color: #0D3B66; }
.tab-state { font-size: 10px; color: #999; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
.tab-passed .tab-state { color: #2E7D32; }
.tab-has_issues .tab-state { color: #CC7B00; }
.tab-name { font-size: 11px; font-weight: 600; color: #333; display: block; }
.tab-desc { font-size: 10px; color: #999; display: block; margin-top: 2px; }
.tab-passed { border-color: #2E7D32; }
.tab-has_issues { border-color: #CC7B00; }

.conclusion { padding: 10px 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; }
.conclusion-success { border-color: #2E7D32; }
.conclusion-review { border-color: #0D3B66; }
.conclusion-text { font-size: 13px; font-weight: 600; color: #333; display: block; }
.conclusion-desc { font-size: 11px; color: #999; margin-top: 2px; display: block; }

.issue-row { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid #eee; }
.issue-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-pending { background: #CC7B00; }
.dot-rectifying { background: #0D3B66; }
.dot-pending_review { background: #7C3AED; }
.dot-closed { background: #2E7D32; }
.issue-body { flex: 1; }
.issue-title { font-size: 13px; font-weight: 500; color: #333; display: block; }
.issue-meta { font-size: 10px; color: #999; display: block; margin-top: 2px; }
.tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; }
.tag-pending { color: #CC7B00; background: #FFF3E0; }
.tag-progress { color: #0D3B66; background: #E8EDF3; }
.tag-review { color: #7C3AED; background: #F3E8FF; }
.tag-closed { color: #2E7D32; background: #E8F5E9; }
.empty { padding: 40px 0; text-align: center; color: #999; }
</style>

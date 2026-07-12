<template>
<view class="page">
  <!-- 数据加载中 -->
  <Skeleton v-if="loading" type="card" :count="4" />

  <!-- 选择器模式 -->
  <template v-else-if="showSelector">
    <text class="s-label">选择楼栋</text>
    <scroll-view scroll-x class="b-scroll">
      <view v-for="b in buildings" :key="b.id"
        class="b-chip" :class="{ active: selB === b.id }"
        @click="pickB(b)">
        <text class="b-name">{{ b.name }}</text><text class="b-cnt">{{ b.totalHouseholds }}户</text>
      </view>
    </scroll-view>

    <template v-if="selB">
      <text class="s-label">单元</text>
      <view class="chip-r">
        <view v-for="u in units" :key="u.id"
          class="chip" :class="{ active: selU === u.id }"
          @click="pickU(u)"><text>{{ u.name }}</text></view>
      </view>
    </template>

    <template v-if="selU">
      <text class="s-label">楼层</text>
      <view class="chip-r">
        <view v-for="f in 12" :key="f"
          class="chip" :class="{ active: selF === f }"
          @click="selF = f; selH = ''"><text>{{ f }}层</text></view>
      </view>
    </template>

    <template v-if="selF">
      <text class="s-label">户</text>
      <view v-for="h in filteredHhs" :key="h.id"
        class="select-row" @click="enterHousehold(h.id)">
        <view><text class="sr-name">{{ h.room }}</text><text class="sr-meta">问题 {{ h.issueCount }} 项</text></view>
        <text class="sr-arrow">→</text>
      </view>
    </template>
  </template>

  <!-- 户操作 -->
  <template v-else-if="household">
    <!-- 户信息卡 -->
    <view class="card-accent">
      <view class="hh-top">
        <view>
          <text class="hh-name">{{ household.buildingName }}</text>
          <text class="hh-addr">{{ household.unitName }} · {{ household.floor }}层 · {{ household.room }}</text>
        </view>
        <text class="hh-tag" :class="household.acceptanceStatus === 'completed' ? 'ht-done' : 'ht-ing'">
          {{ household.acceptanceStatusName || '验收中' }}
        </text>
      </view>
      <view class="hh-stats">
        <view class="hh-s"><text class="n">{{ issues.length }}</text><text class="l">总问题</text></view>
        <view class="hh-s"><text class="n w">{{ pendingN }}</text><text class="l">待处理</text></view>
        <view class="hh-s"><text class="n g">{{ closedN }}</text><text class="l">已闭环</text></view>
      </view>
    </view>

    <!-- 操作 -->
    <view class="act-grid">
      <view class="act-item" @click="goReport">
        <image class="act-icon" src="/static/icons/问题上报.png" mode="aspectFit"></image>
        <text class="act-lbl">问题上报</text>
      </view>
      <view class="act-item" @click="goBatch">
        <image class="act-icon" src="/static/icons/批量上报.png" mode="aspectFit"></image>
        <text class="act-lbl">批量上报</text>
      </view>
      <view class="act-item" @click="goQr">
        <image class="act-icon" src="/static/icons/二维码.png" mode="aspectFit"></image>
        <text class="act-lbl">二维码</text>
      </view>
      <view class="act-item" @click="markNone">
        <image class="act-icon" src="/static/icons/完成.png" mode="aspectFit"></image>
        <text class="act-lbl">无问题</text>
      </view>
    </view>

    <!-- 整户审核：仅上报人可确认验收 -->
    <view v-if="canAcceptHousehold" class="accept-full-card" @click="acceptFullHousehold">
      <text class="accept-full-title">全部问题已整改完成</text>
      <text class="accept-full-desc">点击确认，该户验房结束</text>
    </view>
    <view v-else-if="householdAccepted" class="accepted-badge">
      <text>该户已验收完成</text>
    </view>

    <!-- 问题列表 -->
    <view class="sec">
      <text class="sec-t">问题列表</text>
      <text class="sec-c">{{ issues.length }} 项</text>
    </view>
    <view v-if="issues.length === 0" class="empty"><text>暂无问题</text></view>
    <view v-for="i in issues" :key="i.id" class="i-row" @click="goDetail(i)">
      <view class="i-l">
        <view class="dot" :class="dotMap[i.status]"></view>
        <view>
          <text class="i-title">{{ i.description }}</text>
          <text class="i-meta">{{ i.typeName }} · {{ i.category }} · {{ i.reporter }}</text>
        </view>
      </view>
      <text class="tag" :class="tagMap[i.status]">{{ i.statusName }}</text>
    </view>
  </template>

  <view v-else-if="err" class="empty"><text>{{ err }}</text></view>
</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getHouseholdByQr, getHouseholdDetail, getBuildings, getUnits, getHouseholds, acceptHousehold } from '@/api'
import Skeleton from '@/components/Skeleton.vue'

const store = useUserStore()
const userRole = computed(() => store.user?.role || '')
const userId = computed(() => store.user?.id || '')

const showSelector = ref(false)
const loading = ref(false)
const household = ref(null)
const issues = ref([])
const err = ref('')
const currentHId = ref('')

// 选择器
const buildings = ref([])
const units = ref([])
const households = ref([])
const selB = ref('')
const selU = ref('')
const selF = ref(null)
const selH = ref('')
const filteredHhs = computed(() => households.value.filter(h => h.floor === selF.value))

const pendingN = computed(() => issues.value.filter(i => i.status !== 'closed').length)
const closedN = computed(() => issues.value.filter(i => i.status === 'closed').length)
const allClosed = computed(() => issues.value.length > 0 && issues.value.every(i => i.status === 'closed'))
const householdAccepted = computed(() => household.value?.acceptanceStatus === 'completed')
// 整户审核：只有问题的上报人（或管理员）可以确认验收
const canAcceptHousehold = computed(() => {
  if (!allClosed.value || householdAccepted.value) return false
  if (userRole.value === 'admin') return true
  const reporterIds = [...new Set(issues.value.map(i => i.reporterId || '').filter(Boolean))]
  return reporterIds.length === 1 && reporterIds[0] === userId.value
})
const dotMap = { pending:'dot-warn', rectifying:'dot-blue', pending_review:'dot-purple', closed:'dot-green' }
const tagMap = { pending:'tag-pending', rectifying:'tag-progress', pending_review:'tag-review', closed:'tag-closed' }

async function pickB(b) { selB.value = b.id; selU.value = ''; selF.value = null; const r = await getUnits(b.id); if (r.code === 0) units.value = r.data.list || [] }
async function pickU(u) { selU.value = u.id; selF.value = null; const r = await getHouseholds(selB.value, u.id); if (r.code === 0) households.value = r.data.list || [] }

async function enterHousehold(hId) {
  showSelector.value = false
  await loadHousehold(hId)
  try { uni.$emit('visit', { id: hId, name: household.value?.name || '' }) } catch {}
}

async function loadHousehold(id) {
  currentHId.value = id
  loading.value = true
  const r = await getHouseholdDetail(id)
  if (r.code === 0) {
    household.value = r.data
    const issueData = r.data.issues || []
    issues.value = issueData
  } else {
    err.value = r.message
  }
  loading.value = false
}

function goReport() {
  uni.navigateTo({ url: '/pages/inspect/inspect?householdId=' + household.value.id })
}
function goBatch() { uni.navigateTo({ url: '/pages/batch-report/batch-report?householdId=' + household.value.id }) }
function goQr() { uni.navigateTo({ url: '/pages/qrcode/qrcode?id=' + household.value.id }) }
function goDetail(i) { uni.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + i.id }) }
async function markNone() {
  const r = await acceptHousehold(household.value.id, 'visual')
  if (r.code === 0) uni.showToast({ title: '已确认' })
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

// 页面加载参数
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

// 从子页面返回时刷新问题列表
onShow(() => {
  if (currentHId.value) {
    getHouseholdDetail(currentHId.value).then(r => {
      if (r.code === 0) issues.value = r.data.issues || []
    })
  }
})

onShareAppMessage(() => {
  const name = household.value ? `${household.value.buildingName} ${household.value.unitName} ${household.value.floor}层 ${household.value.room}` : '分户验收'
  return { title: `${name} - 分户验收`, path: '/pages/scan-center/scan-center' }
})
</script>

<style scoped>
.page { padding: 0 16px 20px; }

/* 选择器 */
.s-label { font-size: 14px; font-weight: 600; color: #1F2024; display: block; margin: 16px 0 8px; }
.b-scroll { white-space: nowrap; padding-bottom: 4px; }
.b-scroll::-webkit-scrollbar { display: none; }
.b-chip { display: inline-flex; flex-direction: column; align-items: center; padding: 12px 20px; border: 1px solid #E8E9F1; border-radius: 12px; margin-right: 8px; background: #fff; }
.b-chip.active { border-color: #006FFD; background: #EAF2FF; }
.b-chip.active .b-name { color: #006FFD; }
.b-name { font-size: 15px; font-weight: 600; color: #1F2024; display: block; }
.b-cnt { font-size: 10px; color: #8F9098; margin-top: 2px; }
.chip-r { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.chip { padding: 8px 16px; border: 1px solid #E8E9F1; border-radius: 8px; font-size: 13px; color: #71727A; }
.chip.active { border-color: #006FFD; background: #EAF2FF; color: #006FFD; font-weight: 600; }
.select-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 12px; background: #fff; border: 1px solid #E8E9F1; border-radius: 10px; margin-top: 6px; }
.sr-name { font-size: 14px; font-weight: 500; color: #1F2024; display: block; }
.sr-meta { font-size: 11px; color: #8F9098; }
.sr-arrow { color: #C5C6CC; font-size: 16px; }

/* 户信息卡 */
.card-accent { background: #fff; border-radius: 12px; border: 1px solid #E8E9F1; padding: 16px; position: relative; margin-bottom: 12px; }
.card-accent::before { content: ''; position: absolute; left: 0; top: 16px; bottom: 16px; width: 3px; border-radius: 2px; background: #006FFD; }
.hh-top { display: flex; justify-content: space-between; align-items: flex-start; }
.hh-name { font-size: 18px; font-weight: 700; color: #1F2024; display: block; }
.hh-addr { font-size: 12px; color: #71727A; margin-top: 3px; display: block; }
.hh-tag { font-size: 11px; padding: 3px 10px; border-radius: 10px; font-weight: 600; }
.ht-done { background: #E8F5E9; color: #2E7D32; }
.ht-ing { background: #FFF3E0; color: #E65100; }
.hh-stats { display: flex; gap: 24px; margin-top: 14px; }
.hh-s .n { font-size: 20px; font-weight: 700; color: #1F2024; display: block; }
.hh-s .n.w { color: #FF9500; }
.hh-s .n.g { color: #00A86B; }
.hh-s .l { font-size: 10px; color: #8F9098; }

/* 操作按钮 */
.act-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin: 16px 0; }
.act-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.act-icon { width: 44px; height: 44px; border-radius: 12px; border: 1px solid #E8E9F1; background: #F8F9FE; padding: 6px; box-sizing: border-box; }
.act-lbl { font-size: 11px; color: #71727A; }

/* 问题列表 */
.sec { display: flex; justify-content: space-between; align-items: center; margin: 12px 0 8px; }
.sec-t { font-size: 14px; font-weight: 600; color: #1F2024; }
.sec-c { font-size: 11px; color: #8F9098; }
.i-row { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #E8E9F1; border-radius: 10px; padding: 12px; margin-bottom: 6px; }
.i-l { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
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
.empty { padding: 60px 0; text-align: center; color: #8F9098; font-size: 13px; }

.accept-full-card { display: flex; align-items: center; gap: 12px; background: #F0FDF4; border: 1.5px solid #00A86B; border-radius: 12px; padding: 14px; margin: 12px 0; }
.accept-full-title { font-size: 14px; font-weight: 600; color: #065F46; display: block; }
.accept-full-desc { font-size: 11px; color: #6B7280; margin-top: 2px; display: block; }
.accepted-badge { text-align: center; padding: 10px; background: #F0FDF4; border-radius: 8px; font-size: 13px; font-weight: 600; color: #065F46; margin: 12px 0; }
</style>

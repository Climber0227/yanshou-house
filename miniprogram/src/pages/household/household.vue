<template>
  <view class="page">
    <view v-if="!selectedHousehold" class="search-section">
      <view class="card">
        <text class="form-label">选择楼栋</text>
        <view class="building-grid">
          <view v-for="b in buildings" :key="b.id"
            class="building-item" :class="{ active: selectedBuilding?.id === b.id }"
            @click="selectBuilding(b)">
            <text class="building-name">{{ b.name }}</text>
            <text class="building-count">{{ b.totalHouseholds }}户</text>
          </view>
        </view>
      </view>
      <view v-if="selectedBuilding" class="card">
        <text class="form-label">选择单元</text>
        <view class="unit-row">
          <view v-for="u in units" :key="u.id"
            class="unit-item" :class="{ active: selectedUnit?.id === u.id }"
            @click="selectedUnit = u; loadHouseholds()">
            <text>{{ u.name }}</text>
          </view>
        </view>
      </view>
      <view v-if="households.length > 0" class="card">
        <text class="form-label">选择户</text>
        <view class="household-list">
          <view v-for="h in households" :key="h.id"
            class="household-item" @click="selectedHousehold = h">
            <text class="h-name">{{ h.floor }}层 {{ h.room }}</text>
            <view class="h-tags">
              <text class="h-tag total">{{ h.issueCount }}个问题</text>
              <text v-if="h.acceptanceStatus === 'completed'" class="h-tag done">已完成</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 一户一档详情 -->
    <template v-else>
      <view class="household-hero">
        <text class="hero-title">{{ selectedHousehold.name }}</text>
        <view class="hero-status">
          <text :class="selectedHousehold.acceptanceStatus === 'completed' ? 'status-done' : 'status-ing'">
            {{ selectedHousehold.acceptanceStatusName || '验收中' }}
          </text>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">问题列表</text>
          <text class="section-count">共 {{ issues.length }} 项</text>
        </view>
        <IssueCard v-for="issue in issues" :key="issue.id" :issue="issue" showDeadline @tap="goIssueDetail" />
        <view v-if="issues.length === 0" class="empty-section"><text>暂无问题记录</text></view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBuildings, getUnits, getHouseholds, getHouseholdDetail } from '@/api'
import IssueCard from '@/components/IssueCard.vue'

const buildings = ref([])
const units = ref([])
const households = ref([])
const issues = ref([])
const selectedBuilding = ref(null)
const selectedUnit = ref(null)
const selectedHousehold = ref(null)

async function loadBuildings() {
  const res = await getBuildings()
  if (res.code === 0) buildings.value = res.data.list || []
}
async function selectBuilding(b) {
  selectedBuilding.value = b
  selectedUnit.value = null
  households.value = []
  const res = await getUnits(b.id)
  if (res.code === 0) units.value = res.data.list || []
}
async function loadHouseholds() {
  if (!selectedBuilding.value || !selectedUnit.value) return
  const res = await getHouseholds(selectedBuilding.value.id, selectedUnit.value.id)
  if (res.code === 0) households.value = res.data.list || []
}
async function loadHouseholdDetail(id) {
  const res = await getHouseholdDetail(id)
  if (res.code === 0) {
    issues.value = res.data.issues || []
  }
}
function goIssueDetail(issue) {
  uni.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + issue.id })
}

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  const id = page.$page?.options?.id || ''
  if (id) {
    selectedHousehold.value = { id, name: '' }
    loadHouseholdDetail(id)
  }
  loadBuildings()
})
</script>

<style scoped>
.page { padding: 0 16px 20px; }
.card { margin: 12px 0; padding: 14px; background: #fff; border-radius: 8px; border: 1px solid #E2E8F0; }
.form-label { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 8px; display: block; }

.building-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.building-item { padding: 12px 8px; border: 1px solid #E2E8F0; border-radius: 8px; text-align: center; }
.building-item.active { border-color: #1A56DB; background: #EFF6FF; }
.building-name { font-size: 14px; font-weight: 600; color: #1e293b; display: block; }
.building-count { font-size: 11px; color: #64748b; }

.unit-row { display: flex; gap: 8px; }
.unit-item { flex: 1; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; text-align: center; font-size: 13px; }
.unit-item.active { border-color: #1A56DB; background: #EFF6FF; color: #1A56DB; }

.household-list { display: flex; flex-direction: column; gap: 4px; }
.household-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #F1F5F9; }
.h-name { font-size: 14px; font-weight: 500; }
.h-tags { display: flex; gap: 6px; }
.h-tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; }
.h-tag.total { background: #F1F5F9; color: #64748b; }
.h-tag.done { background: #F0FDFA; color: #0D9488; }

.household-hero { background: #1E3A5F; border-radius: 12px; padding: 20px; color: #fff; margin: 12px 0; display: flex; justify-content: space-between; align-items: center; }
.hero-title { font-size: 17px; font-weight: 700; }
.status-done { background: #0D9488; padding: 4px 10px; border-radius: 4px; font-size: 11px; }
.status-ing { background: #B45309; padding: 4px 10px; border-radius: 4px; font-size: 11px; }

.section { margin: 12px 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.section-title { font-size: 14px; font-weight: 600; color: #1e293b; }
.section-count { font-size: 11px; color: #64748b; }
.empty-section { padding: 30px; text-align: center; color: #94a3b8; font-size: 13px; }
</style>

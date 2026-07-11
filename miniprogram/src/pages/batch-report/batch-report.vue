<template>
  <view class="page">
    <view class="card">
      <text class="form-label">选择户型 <text class="required">*</text></text>
      <view class="section-header">
        <picker mode="selector" :range="buildingNames" @change="onBuildingChange">
          <view class="picker-value">{{ selectedBuildingName || '选楼栋' }}</view>
        </picker>
      </view>
      <view v-if="households.length > 0" class="household-check-list">
        <view v-for="h in households" :key="h.id"
          class="check-item" :class="{ checked: checkedIds.includes(h.id) }"
          @click="toggleCheck(h.id)">
          <view class="check-box">{{ checkedIds.includes(h.id) ? '✓' : '' }}</view>
          <text>{{ h.floor }}层 {{ h.room }}</text>
        </view>
      </view>
      <text class="selected-count">已选 {{ checkedIds.length }} 户</text>
    </view>

    <view class="card">
      <text class="form-label">验收类型</text>
      <view class="type-tabs">
        <view v-for="t in types" :key="t.value"
          class="type-tab" :class="{ active: form.type === t.value }"
          @click="form.type = t.value; loadPresets()">
          <text>{{ t.label }}</text>
        </view>
      </view>
    </view>

    <view class="card">
      <text class="form-label">问题描述</text>
      <view class="preset-list">
        <view v-for="p in filteredPresets" :key="p.id"
          class="preset-item" :class="{ selected: form.description === p.description }"
          @click="form.description = p.description; form.category = p.category">
          <text>{{ p.description }}</text>
        </view>
      </view>
      <input class="input" v-model="form.description" placeholder="或输入自定义描述" />
    </view>

    <view class="card">
      <text class="form-label">照片</text>
      <view class="photo-grid">
        <view v-for="(p, i) in photos" :key="i" class="photo-item">
          <image :src="p" mode="aspectFill" />
          <text class="photo-del" @click="photos.splice(i, 1)">✕</text>
        </view>
        <view v-if="photos.length < 9" class="photo-add" @click="takePhoto">
          <text class="photo-add-icon">+</text>
          <text class="photo-add-text">拍照</text>
        </view>
      </view>
    </view>

    <view class="submit-bar">
      <view class="btn-primary submit-btn" @click="submitBatch">批量提交（{{ checkedIds.length }}户）</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getBuildings, getHouseholds, getIssuePresets, batchReportIssues } from '@/api'

const types = [
  { value: 'visual', label: '观感' },
  { value: 'measure', label: '实测' },
  { value: 'public', label: '公区' }
]

const buildings = ref([])
const households = ref([])
const checkedIds = ref([])
const buildingNames = computed(() => buildings.value.map(b => b.name))
const selectedBuildingName = ref('')
const selectedBuildingId = ref('')
const presets = ref([])
const photos = ref([])

const form = ref({
  type: 'visual',
  description: '',
  category: '',
  remark: ''
})

const filteredPresets = computed(() => presets.value)

function toggleCheck(id) {
  const idx = checkedIds.value.indexOf(id)
  if (idx >= 0) checkedIds.value.splice(idx, 1)
  else checkedIds.value.push(id)
}

async function onBuildingChange(e) {
  const b = buildings.value[e.detail.value]
  if (!b) return
  selectedBuildingName.value = b.name
  selectedBuildingId.value = b.id
  const res = await getHouseholds(b.id)
  if (res.code === 0) households.value = res.data.list || []
}

async function loadPresets() {
  const res = await getIssuePresets(form.value.type)
  if (res.code === 0) presets.value = res.data.list || []
}

function takePhoto() {
  uni.chooseImage({ count: 9 - photos.value.length, success: (res) => { photos.value.push(...res.tempFilePaths) } })
}

async function submitBatch() {
  if (checkedIds.value.length === 0) { uni.showToast({ title: '请选择至少一户', icon: 'none' }); return }
  if (!form.value.description) { uni.showToast({ title: '请选择问题描述', icon: 'none' }); return }
  const res = await batchReportIssues({
    householdIds: checkedIds.value,
    type: form.value.type,
    category: form.value.category,
    description: form.value.description,
    photos: photos.value,
    remark: form.value.remark
  })
  if (res.code === 0) {
    uni.showToast({ title: `已上报 ${checkedIds.value.length} 户` })
    setTimeout(() => uni.navigateBack(), 1000)
  }
}

onMounted(async () => {
  const res = await getBuildings()
  if (res.code === 0) buildings.value = res.data.list || []
  loadPresets()
})
</script>

<style scoped>
.page { padding: 0 16px 100px; }
.card { margin: 10px 0; padding: 14px; background: #fff; border-radius: 8px; border: 1px solid #E2E8F0; }
.form-label { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 8px; display: block; }
.required { color: #DC2626; }

.section-header { margin-bottom: 8px; }
.picker-value { padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; color: #1e293b; background: #fff; }

.household-check-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; max-height: 200px; overflow-y: auto; }
.check-item { display: flex; align-items: center; gap: 6px; padding: 8px 6px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 12px; }
.check-item.checked { border-color: #1A56DB; background: #EFF6FF; }
.check-box { width: 16px; height: 16px; border: 1.5px solid #CBD5E1; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
.check-item.checked .check-box { background: #1A56DB; border-color: #1A56DB; color: #fff; }
.selected-count { font-size: 11px; color: #1A56DB; margin-top: 6px; display: block; }

.type-tabs { display: flex; gap: 6px; }
.type-tab { flex: 1; text-align: center; padding: 8px; border-radius: 6px; border: 1px solid #E2E8F0; font-size: 13px; color: #64748b; }
.type-tab.active { background: #1A56DB; color: #fff; border-color: #1A56DB; }

.preset-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
.preset-item { padding: 6px 12px; border-radius: 4px; border: 1px solid #E2E8F0; font-size: 12px; color: #475569; }
.preset-item.selected { background: #EFF6FF; border-color: #1A56DB; color: #1A56DB; }
.input { width: 100%; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; box-sizing: border-box; }

.photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.photo-item { position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: #F1F5F9; }
.photo-item image { width: 100%; height: 100%; }
.photo-del { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,.5); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.photo-add { aspect-ratio: 1; border: 1px dashed #CBD5E1; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.photo-add-icon { font-size: 24px; color: #94A3B8; }
.photo-add-text { font-size: 10px; color: #94A3B8; }

.submit-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: #fff; border-top: 1px solid #E2E8F0; }
.submit-btn { width: 100%; text-align: center; padding: 12px; }
</style>

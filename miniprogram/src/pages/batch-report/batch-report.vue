<template>
  <scroll-view class="page" scroll-y style="padding-bottom:130px;">
    <!-- 选择楼栋 -->
    <view class="form-group">
      <text class="form-label">选择楼栋 <text class="req">*</text></text>
      <view class="b-grid">
        <view v-for="b in buildings" :key="b.id"
          class="b-card" :class="{ active: selB === b.id }"
          @click="pickBuilding(b)">
          <view class="b-card-top">
            <text class="b-card-name">{{ b.name }}</text>
            <text class="b-card-icon">楼</text>
          </view>
          <text class="b-card-cnt">{{ b.totalHouseholds }} 户</text>
        </view>
      </view>
      <view v-if="buildings.length === 0" class="empty"><text>暂无楼栋数据</text></view>
    </view>

    <!-- 选户 -->
    <view v-if="selB && households.length === 0" class="empty"><text>该楼栋暂无户数据</text></view>
    <view v-if="households.length > 0" class="form-group">
      <view class="form-label-row">
        <text class="form-label">选择户 <text class="req">*</text></text>
        <text class="form-hint">已选 {{ checkedIds.length }} 户</text>
      </view>
      <view class="hh-g">
        <view v-for="h in households" :key="h.id"
          class="hh-check" :class="{ checked: checkedIds.includes(h.id) }"
          @click="toggleCheck(h.id)">
          <view class="check-b">{{ checkedIds.includes(h.id) ? '✓' : '' }}</view>
          <text class="hh-info">{{ h.floor }}层 {{ h.room }}</text>
        </view>
      </view>
    </view>

    <!-- 验收类型 -->
    <view class="form-group">
      <text class="form-label">验收类型</text>
      <view class="seg">
        <view v-for="t in types" :key="t.value"
          class="seg-item" :class="{ active: form.type === t.value }"
          @click="form.type = t.value; form.description = ''; loadPresets()">
          <text>{{ t.label }}</text>
        </view>
      </view>
    </view>

    <!-- 问题描述 -->
    <view class="form-group">
      <text class="form-label">问题描述 <text class="req">*</text></text>
      <view class="preset-r">
        <view v-for="p in filteredPresets" :key="p.id"
          class="preset-item" :class="{ selected: form.description === p.description }"
          @click="form.description = p.description; form.category = p.category">
          <text>{{ p.description }}</text>
        </view>
      </view>
      <textarea class="textarea" v-model="form.description" placeholder="或输入自定义描述" style="min-height:44px;" />
    </view>

    <!-- 拍照 -->
    <view class="form-group">
      <view class="form-label-row">
        <text class="form-label">照片</text>
        <text class="form-hint">{{ photos.length }}/9</text>
      </view>
      <view class="photo-g">
        <view v-for="(p, i) in photos" :key="i" class="photo-i">
          <image :src="p" mode="aspectFill" />
          <text class="photo-d" @click="photos.splice(i, 1)">✕</text>
        </view>
        <view v-if="photos.length < 9" class="photo-a" @click="takePhoto">
          <text class="photo-a-icon">+</text>
          <text class="photo-a-t">拍照</text>
        </view>
      </view>
    </view>

    <!-- 指定整改人 -->
    <view class="form-group">
      <text class="form-label">指定整改人 <text class="req">*</text></text>
      <RectifierPicker v-model="rectifier" />
    </view>

    <!-- 提交 -->
    <view class="submit-bar">
      <view class="btn-primary" @click="submitBatch" style="width:100%;text-align:center;padding:12px;">
        批量提交（{{ checkedIds.length }} 户）
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getBuildings, getHouseholds, getIssuePresets, batchReportIssues } from '@/api'
import RectifierPicker from '@/components/RectifierPicker.vue'

const types = [
  { value: 'visual', label: '观感' },
  { value: 'measure', label: '实测' },
  { value: 'public', label: '公区' }
]

const buildings = ref([])
const households = ref([])
const checkedIds = ref([])
const presets = ref([])
const photos = ref([])
const selB = ref('')
const submitting = ref(false)
const rectifier = ref({ name: '', phone: '' })

const form = ref({ type: 'visual', description: '', category: '' })

const filteredPresets = computed(() => presets.value)

async function loadBuildings() {
  const r = await getBuildings()
  if (r.code === 0) buildings.value = r.data.list || []
}

async function pickBuilding(b) {
  selB.value = b.id
  checkedIds.value = []
  const r = await getHouseholds(b.id)
  if (r.code === 0) households.value = r.data.list || []
}

function toggleCheck(id) {
  const idx = checkedIds.value.indexOf(id)
  if (idx >= 0) checkedIds.value.splice(idx, 1)
  else checkedIds.value.push(id)
}

async function loadPresets() {
  const r = await getIssuePresets(form.value.type)
  if (r.code === 0) presets.value = r.data.list || []
}

function takePhoto() {
  uni.chooseImage({
    count: 9 - photos.value.length,
    success: (res) => { photos.value.push(...res.tempFilePaths) }
  })
}

async function submitBatch() {
  if (checkedIds.value.length === 0) {
    uni.showToast({ title: '请选择至少一户', icon: 'none' })
    return
  }
  if (!form.value.description) {
    uni.showToast({ title: '请选择问题描述', icon: 'none' })
    return
  }
  if (!rectifier.value.name) { uni.showToast({ title: '请选择整改人', icon: 'none' }); return }
  submitting.value = true
  const r = await batchReportIssues({
    householdIds: checkedIds.value,
    type: form.value.type,
    category: form.value.category,
    description: form.value.description,
    photos: photos.value,
    remark: '',
    rectifierName: rectifier.value.name,
    rectifierPhone: rectifier.value.phone
  })
  submitting.value = false
  if (r.code === 0) {
    uni.showToast({ title: '已上报 ' + checkedIds.value.length + ' 户', icon: 'success' })
    // 上报完成后回退
    setTimeout(() => uni.navigateBack(), 1200)
  } else {
    uni.showToast({ title: r.message || '提交失败', icon: 'none' })
  }
}

onMounted(() => { loadBuildings(); loadPresets() })
</script>

<style lang="scss" scoped>
.form-group { margin-bottom: $sp-lg; }
.form-label { font-size: $fs-sm; font-weight: 600; color: $text-primary; margin-bottom: $sp-sm; display: block; }
.form-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: $sp-sm; }
.form-label-row .form-label { margin-bottom: 0; }
.form-hint { font-size: $fs-xs; color: $text-hint; }
.req { color: $danger; }

/* 楼栋网格 */
.b-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.b-card { display: flex; flex-direction: column; padding: $sp-lg; background: $bg-card; border: 1px solid $border; border-radius: $radius-md; gap: 6px; }
.b-card:active { transform: scale(0.97); transition: transform 0.15s; }
.b-card.active { border-color: $primary; background: $primary-light; }
.b-card.active .b-card-name { color: $primary; }
.b-card-top { display: flex; justify-content: space-between; align-items: center; }
.b-card-name { font-size: 17px; font-weight: 700; color: $text-primary; }
.b-card-icon { font-size: 20px; }
.b-card-cnt { font-size: 11px; color: $text-hint; }

/* 户勾选 */
.hh-g { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.hh-check { display: flex; align-items: center; gap: 4px; padding: 8px 6px; border: 1px solid $border; border-radius: $radius-sm; font-size: $fs-xs; overflow: hidden; }
.hh-check.checked { border-color: $primary; background: $primary-light; }
.check-b { width: 16px; height: 16px; border: 1.5px solid $text-placeholder; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
.hh-check.checked .check-b { background: $primary; border-color: $primary; color: #fff; }
.hh-info { color: $text-primary; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 类型 */
/* 预设 */
.preset-r { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: $sp-sm; }
.preset-item { padding: 6px 12px; border: 1px solid $border; border-radius: 4px; font-size: $fs-xs; color: $text-secondary; }
.preset-item.selected { background: $primary-light; border-color: $primary; color: $primary; }

.input { width: 100%; padding-left: $sp-md; padding-right: $sp-md; padding-top: 0; padding-bottom: 0; height: 44px; line-height: 44px; border: 1px solid $border; border-radius: $radius-sm; font-size: $fs-sm; box-sizing: border-box; }



.submit-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: $bg-card; border-top: 1px solid $border; }
</style>

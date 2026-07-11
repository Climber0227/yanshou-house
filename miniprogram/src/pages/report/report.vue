<template>
  <view class="page">
    <view class="report-card">
      <!-- 验收类型 -->
      <view class="form-group">
        <text class="form-label">验收类型</text>
        <view class="type-tabs">
          <view v-for="t in types" :key="t.value"
            class="type-tab" :class="{ active: form.type === t.value }"
            @click="form.type = t.value; loadPresets()">
            <text>{{ t.label }}</text>
          </view>
        </view>
      </view>

      <!-- 问题分类 -->
      <view class="form-group">
        <text class="form-label">问题分类</text>
        <picker mode="selector" :range="categories" @change="onCategoryChange">
          <view class="picker-value">{{ form.category || '请选择分类' }}</view>
        </picker>
      </view>

      <!-- 问题描述 -->
      <view class="form-group">
        <text class="form-label">问题描述</text>
        <view class="preset-list">
          <view v-for="p in filteredPresets" :key="p.id"
            class="preset-item" :class="{ selected: form.description === p.description }"
            @click="form.description = p.description">
            <text>{{ p.description }}</text>
          </view>
        </view>
        <input class="input-custom" v-model="form.description" placeholder="或输入自定义描述" />
      </view>

      <!-- 拍照 -->
      <view class="form-group">
        <text class="form-label">现场照片 <text class="required">*</text></text>
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

      <!-- 整改期限 -->
      <view class="form-group">
        <text class="form-label">整改期限</text>
        <picker mode="date" :value="form.deadline" @change="e => form.deadline = e.detail.value">
          <view class="picker-value">{{ form.deadline || '请选择日期（可选）' }}</view>
        </picker>
      </view>

      <!-- 备注 -->
      <view class="form-group">
        <text class="form-label">备注</text>
        <textarea class="textarea" v-model="form.remark" placeholder="可选填写备注" />
      </view>

      <!-- 提交 -->
      <view class="submit-bar">
        <view class="btn-primary submit-btn" @click="submitReport">提交上报</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getIssuePresets, reportIssue } from '@/api'

const types = [
  { value: 'visual', label: '观感' },
  { value: 'measure', label: '实测' },
  { value: 'public', label: '公区' }
]

const form = ref({
  type: 'visual',
  householdId: '',
  category: '',
  description: '',
  deadline: '',
  remark: ''
})

const presets = ref([])
const photos = ref([])
const categories = computed(() => {
  const cats = [...new Set(presets.value.map(p => p.category))]
  return cats
})

const filteredPresets = computed(() => {
  return presets.value.filter(p => !form.value.category || p.category === form.value.category)
})

function onCategoryChange(e) {
  form.value.category = categories.value[e.detail.value]
}

async function loadPresets() {
  const res = await getIssuePresets(form.value.type)
  if (res.code === 0) presets.value = res.data.list || []
}

function takePhoto() {
  uni.chooseImage({
    count: 9 - photos.value.length,
    success: (res) => {
      photos.value.push(...res.tempFilePaths)
    }
  })
}

async function submitReport() {
  if (!form.value.description) {
    uni.showToast({ title: '请选择或输入问题描述', icon: 'none' })
    return
  }
  if (photos.value.length === 0) {
    uni.showToast({ title: '请拍摄现场照片', icon: 'none' })
    return
  }
  const res = await reportIssue({ ...form.value, photos: photos.value })
  if (res.code === 0) {
    uni.showToast({ title: '上报成功' })
    setTimeout(() => uni.navigateBack(), 1000)
  } else {
    uni.showToast({ title: res.message || '上报失败', icon: 'none' })
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  form.value.householdId = page.$page?.options?.householdId || 'h_001'
  loadPresets()
})
</script>

<style scoped>
.page { padding: 0 16px 100px; }
.report-card { margin: 12px 0; }

.form-group { margin-bottom: 16px; }
.form-label { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 6px; display: block; }
.required { color: #DC2626; }

.type-tabs { display: flex; gap: 6px; }
.type-tab { flex: 1; text-align: center; padding: 8px; border-radius: 6px; border: 1px solid #E2E8F0; font-size: 13px; color: #64748b; }
.type-tab.active { background: #1A56DB; color: #fff; border-color: #1A56DB; }

.picker-value { padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; color: #1e293b; background: #fff; }

.preset-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
.preset-item { padding: 6px 12px; border-radius: 4px; border: 1px solid #E2E8F0; font-size: 12px; color: #475569; }
.preset-item.selected { background: #EFF6FF; border-color: #1A56DB; color: #1A56DB; }

.input-custom { width: 100%; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; box-sizing: border-box; }

.photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.photo-item { position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: #F1F5F9; }
.photo-item image { width: 100%; height: 100%; }
.photo-del { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,.5); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.photo-add { aspect-ratio: 1; border: 1px dashed #CBD5E1; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.photo-add-icon { font-size: 24px; color: #94A3B8; }
.photo-add-text { font-size: 10px; color: #94A3B8; }

.textarea { width: 100%; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; min-height: 60px; box-sizing: border-box; }

.submit-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: #fff; border-top: 1px solid #E2E8F0; }
.submit-btn { width: 100%; text-align: center; padding: 12px; border-radius: 8px; font-size: 15px; }
</style>

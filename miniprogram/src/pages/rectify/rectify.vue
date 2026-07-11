<template>
  <view class="page">
    <view class="card">
      <text class="form-label">整改措施 <text class="required">*</text></text>
      <textarea class="textarea" v-model="measure" placeholder="请填写整改措施" />
    </view>
    <view class="card">
      <text class="form-label">整改后照片 <text class="required">*</text></text>
      <view class="photo-grid">
        <view v-for="(p, i) in photos" :key="i" class="photo-item">
          <image :src="p" mode="aspectFill" />
          <text class="photo-del" @click="photos.splice(i, 1)">✕</text>
        </view>
        <view v-if="photos.length < 9" class="photo-add" @click="takePhoto">
          <text class="photo-add-icon">+</text>
        </view>
      </view>
    </view>
    <view class="card">
      <text class="form-label">备注</text>
      <textarea class="textarea" v-model="remark" placeholder="可选" />
    </view>
    <view class="submit-bar">
      <view class="btn-primary submit-btn" @click="submitRectify">提交整改结果</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { submitRectify as submitApi } from '@/api'

const issueId = ref('')
const measure = ref('')
const photos = ref([])
const remark = ref('')

function takePhoto() {
  uni.chooseImage({ count: 9 - photos.value.length, success: (res) => { photos.value.push(...res.tempFilePaths) } })
}

async function submitRectify() {
  if (!measure.value) { uni.showToast({ title: '请填写整改措施', icon: 'none' }); return }
  if (photos.value.length === 0) { uni.showToast({ title: '请上传整改后照片', icon: 'none' }); return }
  const res = await submitApi(issueId.value, { measure: measure.value, photos: photos.value, remark: remark.value })
  if (res.code === 0) {
    uni.showToast({ title: '提交成功，待复查' })
    setTimeout(() => uni.navigateBack(), 1000)
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  issueId.value = page.$page?.options?.id || ''
})
</script>

<style scoped>
.page { padding: 0 16px 100px; }
.card { margin: 12px 0; padding: 14px; background: #fff; border-radius: 8px; border: 1px solid #E2E8F0; }
.form-label { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 6px; display: block; }
.required { color: #DC2626; }
.textarea { width: 100%; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; min-height: 80px; box-sizing: border-box; }
.photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.photo-item { position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: #F1F5F9; }
.photo-item image { width: 100%; height: 100%; }
.photo-del { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,.5); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.photo-add { aspect-ratio: 1; border: 1px dashed #CBD5E1; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.photo-add-icon { font-size: 24px; color: #94A3B8; }
.submit-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: #fff; border-top: 1px solid #E2E8F0; }
.submit-btn { width: 100%; text-align: center; padding: 12px; }
</style>

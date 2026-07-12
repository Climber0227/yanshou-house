<template>
  <view class="page" style="padding-bottom:100px;">
    <view class="form-group">
      <text class="form-label">整改措施 <text class="req">*</text></text>
      <textarea class="textarea" v-model="measure" placeholder="请填写整改措施" />
    </view>
    <view class="form-group">
      <view class="form-label-row">
        <text class="form-label">整改后照片 <text class="req">*</text></text>
        <text class="form-hint">{{ photos.length }}/9</text>
      </view>
      <view class="photo-g">
        <view v-for="(p, i) in photos" :key="i" class="photo-i">
          <image :src="p" mode="aspectFill" />
          <text class="photo-d" @click="photos.splice(i, 1)">✕</text>
        </view>
        <view v-if="photos.length < 9" class="photo-a" @click="takePhoto">
          <text class="photo-a-icon">+</text>
        </view>
      </view>
    </view>
    <view class="form-group">
      <text class="form-label">备注</text>
      <textarea class="textarea" v-model="remark" placeholder="可选" />
    </view>
    <view class="submit-bar">
      <view class="btn-primary" @click="submitRectify" style="width:100%;text-align:center;padding:12px;">提交整改结果</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { submitRectify as submitApi } from '@/api'

const issueId = ref('')
const measure = ref('')
const photos = ref([])
const remark = ref('')

function takePhoto() { uni.chooseImage({ count: 9 - photos.value.length, success: (r) => { photos.value.push(...r.tempFilePaths) } }) }

async function submitRectify() {
  if (!measure.value) { uni.showToast({ title: '请填写整改措施', icon: 'none' }); return }
  if (photos.value.length === 0) { uni.showToast({ title: '请上传整改后照片', icon: 'none' }); return }
  const res = await submitApi(issueId.value, { measure: measure.value, photos: photos.value, remark: remark.value })
  if (res.code === 0) { uni.showToast({ title: '提交成功，待复查', icon: 'success' }); setTimeout(() => uni.switchTab({ url: '/pages/task-list/task-list' }), 1000) }
}

onLoad((options) => {
  issueId.value = options?.id || ''
})
</script>

<style lang="scss" scoped>
.form-group { margin-bottom: $sp-lg; }
.form-label { font-size: $fs-sm; font-weight: 600; color: $text-primary; margin-bottom: $sp-sm; display: block; }
.form-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: $sp-sm; }
.form-label-row .form-label { margin-bottom: 0; }
.form-hint { font-size: $fs-xs; color: $text-hint; }
.req { color: $danger; }

.textarea { width: 100%; padding-left: $sp-md; padding-right: $sp-md; padding-top: 0; padding-bottom: 0; border: 1px solid $border; border-radius: $radius-sm; font-size: $fs-sm; min-height: 80px; line-height: 1.5; box-sizing: border-box; }

.photo-g { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.photo-i { position: relative; aspect-ratio: 1; border-radius: $radius-sm; overflow: hidden; background: $bg-tag; }
.photo-i image { width: 100%; height: 100%; }
.photo-d { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,.5); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.photo-a { aspect-ratio: 1; border: 1px dashed $text-placeholder; border-radius: $radius-sm; display: flex; align-items: center; justify-content: center; }
.photo-a-icon { font-size: 22px; color: $text-hint; }

.submit-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: $bg-card; border-top: 1px solid $border; }
</style>

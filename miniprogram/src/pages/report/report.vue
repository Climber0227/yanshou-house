<template>
  <scroll-view class="page" scroll-y style="padding-bottom:130px;">
    <!-- 户信息（顶部摘要） -->
    <view class="card-accent" v-if="householdName">
      <view class="hh-top">
        <text class="hh-name">{{ householdName }}</text>
        <text class="hh-tag ht-ing">验收中</text>
      </view>
    </view>

    <!-- 验收类型 -->
    <view class="form-group">
      <text class="form-label">验收类型 <text class="req">*</text></text>
      <view class="seg-lg">
        <view v-for="t in types" :key="t.value"
          class="seg-item-lg" :class="{ active: form.type === t.value }"
          @click="switchType(t.value)">
          <text>{{ t.label }}</text>
        </view>
      </view>
    </view>

    <!-- 问题分类 -->
    <view class="form-group">
      <text class="form-label">问题分类</text>
      <view class="chip-r">
        <view v-for="c in categories" :key="c"
          class="chip" :class="{ active: form.category === c }"
          @click="form.category = c">
          <text>{{ c }}</text>
        </view>
        <view v-if="categories.length > 0" class="chip" :class="{ active: form.category === '' }" @click="form.category = ''">
          <text>全部</text>
        </view>
      </view>
    </view>

    <!-- 问题描述 -->
    <view class="form-group">
      <text class="form-label">问题描述 <text class="req">*</text></text>
      <view class="preset-r">
        <view v-for="p in filteredPresets" :key="p.id"
          class="preset-item" :class="{ selected: form.description === p.description }"
          @click="form.description = p.description">
          <text>{{ p.description }}</text>
        </view>
      </view>
      <textarea class="textarea" v-model="form.description" placeholder="或输入自定义描述" style="min-height:44px;" />
    </view>

    <!-- 拍照 -->
    <view class="form-group">
      <view class="form-label-row">
        <text class="form-label">现场照片 <text class="req">*</text></text>
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
      <!-- 视频和语音 -->
      <view class="media-row">
        <view class="media-btn" @click="takeVideo">
          <text>{{ video ? '已录视频' : '录视频（可选）' }}</text>
          <text v-if="video" class="media-del" @click.stop="video = ''">×</text>
        </view>
        <view class="media-btn" @click="recordVoice">
          <text>{{ voiceStatus || '语音备注（可选）' }}</text>
          <text v-if="voicePath" class="media-del" @click.stop="voicePath = ''; voiceStatus = '语音备注（可选）'">×</text>
        </view>
      </view>
    </view>

    <!-- 整改期限 -->
    <view class="form-group">
      <text class="form-label">整改期限</text>
      <picker mode="date" :value="form.deadline" @change="e => form.deadline = e.detail.value">
        <view class="picker">{{ form.deadline || '选择日期（可选）' }}</view>
      </picker>
    </view>

    <!-- 指定整改人 -->
    <view class="form-group">
      <text class="form-label">指定整改人 <text class="req">*</text></text>
      <view class="row-2col">
        <input class="input" v-model="form.rectifierName" placeholder="整改人姓名" />
        <input class="input" v-model="form.rectifierPhone" type="number" placeholder="整改人手机号" />
      </view>
    </view>

    <!-- 备注 -->
    <view class="form-group">
      <text class="form-label">备注</text>
      <textarea class="textarea" v-model="form.remark" placeholder="可选" />
    </view>

    <!-- 提交 -->
    <view class="submit-bar">
      <view class="btn-primary" @click="submitReport" style="width:100%;text-align:center;padding:12px;">提交上报</view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getIssuePresets, reportIssue } from '@/api'

const types = [
  { value: 'visual', label: '观感' },
  { value: 'measure', label: '实测' },
  { value: 'public', label: '公区' }
]

const form = ref({
  type: 'visual', householdId: '',
  category: '', description: '',
  deadline: '', remark: '',
  rectifierName: '', rectifierPhone: ''
})
const presets = ref([])
const photos = ref([])
const video = ref('')
const voicePath = ref('')
const voiceStatus = ref('语音备注（可选）')
const isRecording = ref(false)
const householdName = ref('')

const categories = computed(() => [...new Set(presets.value.map(p => p.category))])
const filteredPresets = computed(() => {
  let list = presets.value
  if (form.value.category) list = list.filter(p => p.category === form.value.category)
  return list
})

function switchType(val) {
  form.value.type = val
  form.value.category = ''
  form.value.description = ''
  photos.value = []
  video.value = ''
  voicePath.value = ''
  voiceStatus.value = '语音备注（可选）'
  loadPresets()
}

async function loadPresets() {
  const r = await getIssuePresets(form.value.type)
  if (r.code === 0) presets.value = r.data.list || []
}

function takePhoto() {
  uni.chooseImage({ count: 9 - photos.value.length, success: (r) => { photos.value.push(...r.tempFilePaths) } })
}

function takeVideo() {
  uni.chooseVideo({
    sourceType: ['camera', 'album'],
    success: (r) => { video.value = r.tempFilePath }
  })
}

function recordVoice() {
  if (isRecording.value) return
  const recorder = uni.getRecorderManager()
  recorder.onStart(() => { isRecording.value = true; voiceStatus.value = '录音中...点击停止' })
  recorder.onStop((r) => {
    isRecording.value = false
    if (r.tempFilePath) {
      voicePath.value = r.tempFilePath
      voiceStatus.value = '已录音 ✓'
    } else {
      voiceStatus.value = '语音备注（可选）'
    }
  })
  recorder.onError(() => { isRecording.value = false; voiceStatus.value = '录音失败'; setTimeout(() => { voiceStatus.value = '语音备注（可选）' }, 1500) })
  // 点击时开始录音
  uni.showModal({
    title: '语音备注',
    content: '点击确定开始录音，再次点击停止',
    success: (res) => {
      if (res.confirm) {
        recorder.start({ format: 'mp3' })
        // 5秒后自动停止（演示用，生产环境改为手动控制）
        setTimeout(() => { if (isRecording.value) recorder.stop() }, 5000)
      }
    }
  })
}

async function submitReport() {
  if (!form.value.description) { uni.showToast({ title: '请选择问题描述', icon: 'none' }); return }
  if (photos.value.length === 0) { uni.showToast({ title: '请拍摄现场照片', icon: 'none' }); return }
  if (!form.value.rectifierName) { uni.showToast({ title: '请指定整改人姓名', icon: 'none' }); return }
  if (!form.value.rectifierPhone) { uni.showToast({ title: '请填写整改人手机号', icon: 'none' }); return }
  const r = await reportIssue({ ...form.value, photos: photos.value })
  if (r.code === 0) { uni.showToast({ title: '上报成功', icon: 'success' }); setTimeout(() => uni.navigateBack(), 1200) }
  else { uni.showToast({ title: r.message || '上报失败', icon: 'none' }) }
}

onLoad((options) => {
  form.value.householdId = options?.householdId || 'h_1010'
  if (options?.name) householdName.value = decodeURIComponent(options.name)
  loadPresets()
})
</script>

<style lang="scss" scoped>
.form-group { margin-bottom: $sp-lg; }
.form-label { font-size: $fs-sm; font-weight: 600; color: $text-primary; margin-bottom: $sp-sm; display: block; }
.form-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: $sp-sm; }
.form-label-row .form-label { margin-bottom: 0; }
.form-hint { font-size: $fs-xs; color: $text-hint; }
.req { color: $danger; }

.seg-lg { display: flex; gap: 6px; }
.seg-item-lg { flex: 1; text-align: center; padding: 10px; border-radius: $radius-sm; border: 1px solid $border; font-size: $fs-sm; color: $text-secondary; }
.seg-item-lg.active { background: $primary-light; color: $primary; border-color: $primary; font-weight: 600; }

.chip-r { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { padding: 6px 14px; border: 1px solid $border; border-radius: 6px; font-size: $fs-xs; color: $text-secondary; }
.chip.active { border-color: $primary; background: $primary-light; color: $primary; font-weight: 600; }

.preset-r { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: $sp-sm; }
.preset-item { padding: 6px 12px; border: 1px solid $border; border-radius: 4px; font-size: $fs-xs; color: $text-secondary; }
.preset-item.selected { background: $primary-light; border-color: $primary; color: $primary; }

.row-2col { display: flex; gap: 8px; }
.row-2col .input { flex: 1; }
.input { width: 100%; padding-left: $sp-md; padding-right: $sp-md; padding-top: 0; padding-bottom: 0; height: 44px; line-height: 44px; border: 1px solid $border; border-radius: $radius-sm; font-size: $fs-sm; box-sizing: border-box; }

.photo-g { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.photo-i { position: relative; aspect-ratio: 1; border-radius: $radius-sm; overflow: hidden; background: $bg-tag; }
.photo-i image { width: 100%; height: 100%; }
.photo-d { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,.5); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.photo-a { aspect-ratio: 1; border: 1px dashed $text-placeholder; border-radius: $radius-sm; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.photo-a-icon { font-size: 22px; color: $text-hint; line-height: 1; }
.photo-a-t { font-size: 10px; color: $text-hint; margin-top: 2px; }

.media-row { display: flex; gap: 8px; margin-top: 8px; }
.media-btn { flex: 1; display: flex; align-items: center; gap: 6px; padding: 10px; border: 1px solid $border; border-radius: $radius-sm; font-size: $fs-xs; color: $text-secondary; position: relative; }
.media-del { position: absolute; top: -6px; right: -6px; width: 16px; height: 16px; background: $danger; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; }

.textarea { width: 100%; padding-left: $sp-md; padding-right: $sp-md; padding-top: 0; padding-bottom: 0; border: 1px solid $border; border-radius: $radius-sm; font-size: $fs-sm; min-height: 60px; line-height: 1.5; box-sizing: border-box; }
.picker { padding: $sp-sm $sp-md; border: 1px solid $border; border-radius: $radius-sm; font-size: $fs-sm; color: $text-primary; background: $bg-card; }

.submit-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: $bg-card; border-top: 1px solid $border; }

.card-accent { background: $bg-card; border: 1px solid $border; border-radius: $radius-md; padding: $sp-lg; margin-bottom: $sp-lg; position: relative; }
.card-accent::before { content: ''; position: absolute; left: 0; top: 14px; bottom: 14px; width: 3px; border-radius: 2px; background: $primary; }
.hh-top { display: flex; justify-content: space-between; align-items: center; }
.hh-name { font-size: $fs-lg; font-weight: 700; color: $text-primary; }
.hh-tag { font-size: 11px; padding: 3px 10px; border-radius: 10px; font-weight: 600; }
.ht-ing { background: #FFF3E0; color: #E65100; }
</style>

<template>
  <view class="check-card">
    <!-- 头部：序号 + 名称 + 合格/不合格切换 -->
    <view class="check-hd" @click="locked ? null : toggle()">
      <view class="check-num">{{ index }}</view>
      <view class="check-info">
        <text class="check-name">{{ item.name }}</text>
        <text v-if="item.desc" class="check-desc">{{ item.desc }}</text>
      </view>
      <view v-if="locked" class="check-toggle pass locked-tag">
        <text>已添加</text>
      </view>
      <view v-else class="check-toggle" :class="{ pass: !item._hasIssue }">
        <text>{{ item._hasIssue ? '不合格' : '合格' }}</text>
      </view>
    </view>

    <!-- 不合格展开区（未锁定） -->
    <view v-if="item._hasIssue && !locked">
      <!-- 预设问题 -->
      <view class="preset-r" v-if="presets.length">
        <view v-for="p in presets" :key="p"
          class="preset-item" :class="{ selected: item._desc === p }"
          @click="item._desc = item._desc === p ? '' : p">
          <text>{{ p }}</text>
        </view>
      </view>
      <textarea class="textarea" v-model="item._desc" placeholder="或输入自定义问题描述" />

      <!-- 照片（强制至少1张） -->
      <view class="photo-g">
        <view v-for="(p, pi) in (item._photos||[])" :key="pi" class="photo-i">
          <image :src="p" mode="aspectFill" />
          <text class="photo-d" @click="item._photos.splice(pi,1)">X</text>
        </view>
        <view v-if="(item._photos||[]).length < 9" class="photo-a" @click="addPhoto">
          <text class="photo-a-icon">+</text>
          <text class="photo-a-t">拍照</text>
        </view>
      </view>

      <!-- 视频/语音 -->
      <view class="media-row">
        <view class="media-btn" @click="recordVideo">
          <text>{{ item._video ? '已录视频' : '录视频（可选）' }}</text>
          <text v-if="item._video" class="media-del" @click.stop="item._video = ''">X</text>
        </view>
        <view class="media-btn" @click="recordVoiceItem">
          <text>{{ voiceStatus || (item._voice ? '已录音' : '语音备注（可选）') }}</text>
          <text v-if="item._voice && !isRecording" class="media-del" @click.stop="item._voice = ''; voiceStatus = ''">X</text>
        </view>
      </view>

      <!-- 整改人选择 -->
      <view class="rectifier-row">
        <text class="rectifier-label">指定整改人 <text class="req">*</text></text>
        <RectifierPicker v-model="rectifier" />
      </view>

      <!-- 确认添加按钮 -->
      <view class="confirm-btn" @click="doConfirm">
        <text>确认添加到问题列表</text>
      </view>

      <!-- 校验提示 -->
      <text v-if="confirmErr" class="confirm-err">{{ confirmErr }}</text>
    </view>

    <!-- 已锁定状态 -->
    <view v-if="item._hasIssue && locked" class="locked-info">
      <text class="locked-desc">{{ item._desc }}</text>
      <view class="locked-meta">
        <text>整改人：{{ rectifier.name }} {{ rectifier.phone }}</text>
      </view>
      <text class="locked-action" @click="unlock">修改</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import RectifierPicker from '@/components/RectifierPicker.vue'

const props = defineProps({ item: Object, index: Number, locked: Boolean })
const emit = defineEmits(['addPhoto', 'confirm', 'unlock'])

const presets = computed(() => props.item._presets || [])
const isRecording = ref(false)
const voiceStatus = ref('')
const rectifier = ref({ name: props.item._rectifierName || '', phone: props.item._rectifierPhone || '' })
const confirmErr = ref('')

function toggle() {
  props.item._hasIssue = !props.item._hasIssue
  if (!props.item._hasIssue) {
    props.item._desc = ''; props.item._photos = []; props.item._video = ''; props.item._voice = ''
    rectifier.value = { name: '', phone: '' }; confirmErr.value = ''
  }
}

function addPhoto() { emit('addPhoto', props.item) }

function recordVideo() {
  uni.chooseVideo({ sourceType: ['camera', 'album'], maxDuration: 30, success: (r) => { props.item._video = r.tempFilePath }, fail: () => {} })
}

let voiceRecorder = null
function recordVoiceItem() {
  if (isRecording.value) {
    if (voiceRecorder) { voiceRecorder.stop(); voiceRecorder = null }
    return
  }
  if (props.item._voice) {
    props.item._voice = ''; voiceStatus.value = ''; return
  }
  const recorder = uni.getRecorderManager()
  voiceRecorder = recorder
  recorder.onStart(() => { isRecording.value = true; voiceStatus.value = '录音中...点击停止' })
  recorder.onStop((r) => {
    isRecording.value = false; voiceRecorder = null
    if (r.tempFilePath) { props.item._voice = r.tempFilePath; voiceStatus.value = '已录音' }
    else { voiceStatus.value = '录音失败'; setTimeout(() => { voiceStatus.value = '' }, 1500) }
  })
  recorder.onError(() => { isRecording.value = false; voiceRecorder = null; voiceStatus.value = '录音失败'; setTimeout(() => { voiceStatus.value = '' }, 1500) })
  uni.showModal({
    title: '语音备注', content: '点击确定开始录音，再次点击停止（最长30秒）',
    success: (res) => {
      if (res.confirm) { recorder.start({ format: 'mp3' }); setTimeout(() => { if (isRecording.value) recorder.stop() }, 30000) }
      else { voiceRecorder = null }
    }
  })
}

function doConfirm() {
  confirmErr.value = ''
  if (!props.item._desc || !props.item._desc.trim()) {
    confirmErr.value = '请填写问题描述'; return
  }
  if (!(props.item._photos || []).length) {
    confirmErr.value = '请至少拍摄一张照片'; return
  }
  if (!rectifier.value.name) {
    confirmErr.value = '请选择整改人'; return
  }
  emit('confirm', { ...props.item, rectifierName: rectifier.value.name, rectifierPhone: rectifier.value.phone, rectifierId: rectifier.value.id })
}

function unlock() {
  emit('unlock', props.item)
}
</script>

<style lang="scss" scoped>
.check-card { padding: 12px; margin-bottom: 6px; box-sizing: border-box; max-width: 100%; }
.check-hd { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
.check-num { width: 22px; height: 22px; border-radius: 50%; background: $primary-light; color: $primary; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.check-info { flex: 1; min-width: 0; }
.check-name { font-size: 13px; font-weight: 600; color: $text-primary; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
.check-desc { font-size: 10px; color: $text-secondary; margin-top: 2px; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; }
.check-toggle { padding: 3px 12px; border-radius: 14px; font-size: 10px; font-weight: 600; background: #FEF2F2; color: $danger; flex-shrink: 0; white-space: nowrap; display: inline-flex; align-items: center; min-width: 48px; justify-content: center; }
.check-toggle.pass { background: #F0FDF4; color: $success; }
.check-toggle.locked-tag { background: $primary-light; color: $primary; }
.preset-r { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.preset-item { padding: 3px 8px; border: 1px solid $border; border-radius: 4px; font-size: 10px; color: $text-secondary; }
.preset-item.selected { background: $primary-light; border-color: $primary; color: $primary; }
.textarea { width: 100%; max-width: 100%; padding-left: 10px; padding-right: 10px; padding-top: 0; padding-bottom: 0; border: 1px solid $border; border-radius: 6px; font-size: 12px; min-height: 40px; line-height: 20px; margin-top: 6px; box-sizing: border-box; }
.media-row { display: flex; gap: 6px; margin-top: 6px; }
.media-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 2px; padding: 4px 0; border: 1px solid $border; border-radius: 4px; font-size: 10px; color: $text-secondary; position: relative; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.media-del { position: absolute; top: -6px; right: -6px; width: 16px; height: 16px; background: $danger; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; }

/* 整改人 */
.rectifier-row { margin-top: 8px; display: flex; align-items: center; gap: 6px; }
.rectifier-label { font-size: 11px; font-weight: 600; color: $text-primary; flex-shrink: 0; white-space: nowrap; }
.req { color: $danger; }

/* 确认按钮 */
.confirm-btn { margin-top: 8px; padding: 8px; background: $primary; border-radius: 6px; text-align: center; color: #fff; font-size: 12px; font-weight: 600; }
.confirm-btn:active { opacity: 0.8; }
.confirm-err { font-size: 10px; color: $danger; margin-top: 4px; display: block; }

/* 已锁定状态 */
.locked-info { margin-top: 8px; padding: 8px; background: $primary-light; border-radius: 6px; position: relative; }
.locked-desc { font-size: 12px; color: $text-primary; font-weight: 500; display: block; }
.locked-meta { font-size: 10px; color: $text-secondary; margin-top: 4px; display: block; }
.locked-action { position: absolute; right: 8px; top: 8px; font-size: 11px; color: $primary; font-weight: 500; }
</style>

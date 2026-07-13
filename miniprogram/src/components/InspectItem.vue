<template>
  <view class="check-card">
    <view class="check-hd" @click="toggle">
      <view class="check-num">{{ index }}</view>
      <view class="check-info">
        <text class="check-name">{{ item.name }}</text>
        <text class="check-desc">{{ item.desc }}</text>
      </view>
      <view class="check-toggle" :class="{ pass: !item._hasIssue }">
        <text>{{ item._hasIssue ? '不合格' : '合格' }}</text>
      </view>
    </view>
    <view v-if="item._hasIssue">
      <view class="preset-r" v-if="presets.length">
        <view v-for="p in presets" :key="p"
          class="preset-item" :class="{ selected: item._desc === p }"
          @click="item._desc = item._desc === p ? '' : p">
          <text>{{ p }}</text>
        </view>
      </view>
      <textarea class="textarea" v-model="item._desc" placeholder="或输入自定义问题描述" />
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
          <text>{{ voiceStatus || (item._voice ? '已录音 ✓' : '语音备注（可选）') }}</text>
          <text v-if="item._voice && !isRecording" class="media-del" @click.stop="item._voice = ''; voiceStatus = ''">X</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ item: Object, index: Number })
const emit = defineEmits(['addPhoto'])

const presets = computed(() => props.item._presets || [])
const isRecording = ref(false)
const voiceStatus = ref('')

function toggle() { props.item._hasIssue = !props.item._hasIssue; if (!props.item._hasIssue) { props.item._desc = ''; props.item._photos = []; props.item._video = ''; props.item._voice = '' } }
function addPhoto() { emit('addPhoto', props.item) }
function recordVideo() {
  uni.chooseVideo({ sourceType: ['camera', 'album'], maxDuration: 30, success: (r) => { props.item._video = r.tempFilePath }, fail: () => {} })
}
let voiceRecorder = null

function recordVoiceItem() {
  if (isRecording.value) {
    // 正在录音 → 点击停止
    if (voiceRecorder) { voiceRecorder.stop(); voiceRecorder = null }
    return
  }
  // 已有录音 → 点击清除
  if (props.item._voice) {
    props.item._voice = ''
    voiceStatus.value = ''
    return
  }
  // 开始录音
  const recorder = uni.getRecorderManager()
  voiceRecorder = recorder
  recorder.onStart(() => { isRecording.value = true; voiceStatus.value = '录音中...点击停止' })
  recorder.onStop((r) => {
    isRecording.value = false
    voiceRecorder = null
    if (r.tempFilePath) {
      props.item._voice = r.tempFilePath
      voiceStatus.value = '已录音 ✓'
    } else {
      voiceStatus.value = '录音失败'
      setTimeout(() => { voiceStatus.value = '' }, 1500)
    }
  })
  recorder.onError(() => {
    isRecording.value = false
    voiceRecorder = null
    voiceStatus.value = '录音失败'
    setTimeout(() => { voiceStatus.value = '' }, 1500)
  })
  uni.showModal({
    title: '语音备注',
    content: '点击确定开始录音，再次点击停止（最长30秒）',
    success: (res) => {
      if (res.confirm) {
        recorder.start({ format: 'mp3' })
        setTimeout(() => { if (isRecording.value) recorder.stop() }, 30000)
      } else {
        voiceRecorder = null
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.check-card { padding: 12px; margin-bottom: 6px; box-sizing: border-box; max-width: 100%; }
.check-hd { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
.check-num { width: 22px; height: 22px; border-radius: 50%; background: $primary-light; color: $primary; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.check-info { flex: 1; min-width: 0; }
.check-name { font-size: 13px; font-weight: 600; color: $text-primary; }
.check-desc { font-size: 10px; color: $text-secondary; margin-top: 2px; line-height: 1.4; }
.check-toggle { padding: 3px 12px; border-radius: 14px; font-size: 10px; font-weight: 600; background: #FEF2F2; color: $danger; flex-shrink: 0; white-space: nowrap; display: inline-flex; align-items: center; min-width: 48px; justify-content: center; }
.check-toggle.pass { background: #F0FDF4; color: $success; }
.preset-r { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.preset-item { padding: 3px 8px; border: 1px solid $border; border-radius: 4px; font-size: 10px; color: $text-secondary; }
.preset-item.selected { background: $primary-light; border-color: $primary; color: $primary; }
.textarea { width: 100%; max-width: 100%; padding-left: 10px; padding-right: 10px; padding-top: 0; padding-bottom: 0; border: 1px solid $border; border-radius: 6px; font-size: 12px; min-height: 40px; line-height: 20px; margin-top: 6px; box-sizing: border-box; }
.photo-g { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 6px; }
.photo-i { position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: $border-light; }
.photo-i image { width: 100%; height: 100%; }
.photo-d { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,.5); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.photo-a { aspect-ratio: 1; border: 1px dashed $text-placeholder; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.photo-a-icon { font-size: 22px; color: $text-hint; line-height: 1; }
.photo-a-t { font-size: 10px; color: $text-hint; margin-top: 2px; }
.media-row { display: flex; gap: 6px; margin-top: 6px; }
.media-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 2px; padding: 4px 0; border: 1px solid $border; border-radius: 4px; font-size: 10px; color: $text-secondary; position: relative; }
.media-del { position: absolute; top: -6px; right: -6px; width: 16px; height: 16px; background: $danger; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; }
</style>

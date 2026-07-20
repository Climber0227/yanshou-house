<template>
  <view class="page" style="padding-bottom:100px;">
    <view class="form-group">
      <text class="form-label">复查结论 <text class="req">*</text></text>
      <view class="review-opts">
        <view class="review-opt" :class="{ active: result === 'pass' }" @click="result = 'pass'">
          <view class="ro-icon pass">✓</view>
          <view>
            <text class="ro-title">合格，同意闭环</text>
            <text class="ro-desc">该问题已整改到位</text>
          </view>
        </view>
        <view class="review-opt" :class="{ active: result === 'reject' }" @click="result = 'reject'">
          <view class="ro-icon reject">✕</view>
          <view>
            <text class="ro-title">不合格，退回整改</text>
            <text class="ro-desc">整改未通过，需重新处理</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 电子签名 - 始终渲染，通过隐藏控制 -->
    <view class="form-group" :style="result !== 'pass' ? 'display:none;' : ''">
      <view class="form-label-row">
        <text class="form-label">电子签名 <text class="req">*</text></text>
        <text class="form-hint" @click="clearSignature">清除重签</text>
      </view>
      <view class="signature-box">
        <canvas
          canvas-id="signatureCanvas"
          class="signature-canvas"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        />
        <text v-if="!hasDrawn" class="signature-hint">请在上方手写签名</text>
        <image v-else :src="signaturePath" mode="aspectFit" class="signature-preview" />
      </view>
    </view>

    <view class="form-group">
      <text class="form-label">复查意见</text>
      <textarea class="textarea" v-model="opinion" placeholder="可选，填写复查意见" />
    </view>

    <view class="submit-bar">
      <view class="btn-primary" @click="submitReview" style="width:100%;text-align:center;padding:12px;">
        确认复查结果
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { reviewIssue } from '@/api'

const issueId = ref('')
const result = ref('pass')
const opinion = ref('')

const hasDrawn = ref(false)
const signaturePath = ref('')
let canvasCtx = null
let isDrawing = false

function initCanvas() {
  nextTick(() => {
    canvasCtx = uni.createCanvasContext('signatureCanvas')
    canvasCtx.setStrokeStyle('#333')
    canvasCtx.setLineWidth(3)
    canvasCtx.setLineCap('round')
    canvasCtx.setLineJoin('round')
  })
}

function getCanvasPos(e) {
  const touch = e.touches[0]
  const query = uni.createSelectorQuery()
  return new Promise((resolve) => {
    query.select('.signature-canvas').boundingClientRect(rect => {
      if (!rect) { resolve({ x: 0, y: 0 }); return }
      resolve({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      })
    }).exec()
  })
}

async function onTouchStart(e) {
  if (!canvasCtx) return
  isDrawing = true
  const pos = await getCanvasPos(e)
  canvasCtx.beginPath()
  canvasCtx.moveTo(pos.x, pos.y)
}

async function onTouchMove(e) {
  if (!isDrawing || !canvasCtx) return
  const pos = await getCanvasPos(e)
  canvasCtx.lineTo(pos.x, pos.y)
  canvasCtx.stroke()
  canvasCtx.draw(true)
}

function onTouchEnd() {
  if (!isDrawing) return
  isDrawing = false
  hasDrawn.value = true
  setTimeout(() => {
    uni.canvasToTempFilePath({
      canvasId: 'signatureCanvas',
      success: (res) => { signaturePath.value = res.tempFilePath },
      fail: () => {}
    })
  }, 100)
}

function clearSignature() {
  hasDrawn.value = false
  signaturePath.value = ''
  if (canvasCtx) {
    canvasCtx.clearRect(0, 0, 300, 150)
    canvasCtx.draw()
  }
}

async function submitReview() {
  if (result.value === 'pass' && !hasDrawn.value) {
    uni.showToast({ title: '请手写签名确认', icon: 'none' })
    return
  }
  const sig = result.value === 'pass' ? signaturePath.value : ''
  const res = await reviewIssue(issueId.value, result.value, opinion.value, sig)
  if (res.code === 0) {
    uni.showToast({ title: result.value === 'pass' ? '复查通过，已闭环' : '已退回整改', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  }
}

onLoad((options) => {
  issueId.value = options?.id || ''
  initCanvas()
})
</script>

<style lang="scss" scoped>
.form-group { margin-bottom: $sp-lg; }
.form-label { font-size: $fs-sm; font-weight: 600; color: $text-primary; margin-bottom: $sp-sm; display: block; }
.form-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: $sp-sm; }
.form-label-row .form-label { margin-bottom: 0; }
.form-hint { font-size: $fs-xs; color: $primary; }
.req { color: $danger; }

.review-opts { display: flex; flex-direction: column; gap: 10px; }
.review-opt { display: flex; align-items: center; gap: 12px; padding: $sp-lg; border: 1.5px solid $border; border-radius: $radius-md; }
.review-opt.active { border-color: $primary; }
.review-opt:first-child.active { border-color: $success; background: #F0FDF4; }
.review-opt:last-child.active { border-color: $danger; background: #FEF2F2; }
.ro-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
.ro-icon.pass { background: #DCFCE7; color: $success; }
.ro-icon.reject { background: #FEE2E2; color: $danger; }
.ro-title { font-size: $fs-md; font-weight: 600; color: $text-primary; display: block; }
.ro-desc { font-size: $fs-xs; color: $text-secondary; margin-top: 2px; display: block; }

/* 签名区域 */
.signature-box { position: relative; border: 1px solid $border; border-radius: $radius-sm; overflow: hidden; background: #FAFAFA; }
.signature-canvas { width: 100%; height: 150px; }
.signature-hint { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: $fs-xs; color: $text-hint; pointer-events: none; }
.signature-preview { width: 100%; height: 150px; }

.textarea { width: 100%; padding-left: $sp-md; padding-right: $sp-md; padding-top: 0; padding-bottom: 0; border: 1px solid $border; border-radius: $radius-sm; font-size: $fs-sm; min-height: 60px; line-height: 1.5; box-sizing: border-box; }

.submit-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: $bg-card; border-top: 1px solid $border; }
</style>

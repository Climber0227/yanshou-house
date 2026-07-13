<template>
  <view class="page">
    <Skeleton v-if="loading" type="card" />
    <template v-else-if="household">
      <view class="qr-card">
        <text class="qr-title">{{ household.buildingName }} {{ household.unitName }} {{ household.floor }}层 {{ household.room }}</text>
        <view class="qr-code-area">
          <canvas canvas-id="qrCanvas" class="qr-canvas"></canvas>
        </view>
        <text class="qr-subtext">{{ household.buildingName }}{{ household.unitName }}{{ household.floor }}层{{ household.room }}</text>
        <text class="qr-hint">请将此二维码张贴于入户门处</text>
      </view>

      <view class="info-card">
        <view class="info-row">
          <text class="info-lbl">楼栋</text>
          <text class="info-val">{{ household.buildingName }}</text>
        </view>
        <view class="info-row">
          <text class="info-lbl">单元</text>
          <text class="info-val">{{ household.unitName }}</text>
        </view>
        <view class="info-row">
          <text class="info-lbl">楼层</text>
          <text class="info-val">{{ household.floor }}层</text>
        </view>
        <view class="info-row">
          <text class="info-lbl">房号</text>
          <text class="info-val">{{ household.room }}</text>
        </view>
        <view class="info-row">
          <text class="info-lbl">问题数</text>
          <text class="info-val" :class="(household.issueCount || 0) > 0 ? 'has-issue' : 'no-issue'">{{ household.issueCount || 0 }} 项</text>
        </view>
      </view>

      <view class="btn-row">
        <view class="btn-primary" @click="goReport">问题上报</view>
        <view class="btn-outline" @click="goBack">返回</view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getHouseholdDetail } from '@/api'
import Skeleton from '@/components/Skeleton.vue'

const loading = ref(true)
const household = ref(null)

function drawQrCode(text) {
  const ctx = uni.createCanvasContext('qrCanvas')
  const size = 200
  const cellSize = 4
  const padding = 10
  const primaryColor = '#006FFD'

  ctx.setFillStyle('#ffffff')
  ctx.fillRect(0, 0, size + padding * 2, size + padding * 2)

  // 基于文本的 hash 生成图案
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash |= 0
  }

  const cells = Math.floor(size / cellSize)

  // 三个角的定位图案
  const drawPos = (sx, sy) => {
    ctx.setFillStyle(primaryColor)
    ctx.fillRect(sx, sy, 28, 28)
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(sx + 4, sy + 4, 20, 20)
    ctx.setFillStyle(primaryColor)
    ctx.fillRect(sx + 8, sy + 8, 12, 12)
  }
  drawPos(padding, padding)
  drawPos(padding + size - 28, padding)
  drawPos(padding, padding + size - 28)

  ctx.setFillStyle(primaryColor)
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if ((r < 7 && c < 7) || (r < 7 && c > cells - 8) || (r > cells - 8 && c < 7)) continue
      if ((hash * (r + 1) * (c + 1) * 7) % 3 !== 0) {
        ctx.fillRect(padding + c * cellSize, padding + r * cellSize, cellSize, cellSize)
      }
    }
  }

  ctx.draw()
}

async function loadData(id) {
  loading.value = true
  const res = await getHouseholdDetail(id)
  if (res.code === 0) {
    household.value = res.data
    await nextTick()
    drawQrCode(res.data.id + '_' + res.data.name)
  }
  loading.value = false
}

function goReport() { uni.navigateTo({ url: '/pages/inspect/inspect?householdId=' + household.value.id }) }
function goBack() { uni.navigateBack() }

onLoad((options) => {
  loadData(options?.id || 'h_1010')
})
</script>

<style lang="scss" scoped>
.page { padding: 0 $sp-lg 20px; display: flex; flex-direction: column; align-items: center; }
.loading-state { padding: 80px 20px; text-align: center; }

.qr-card { background: $bg-card; border: 1px solid $border; border-radius: $radius-md; padding: 24px; margin: 16px 0; width: 100%; display: flex; flex-direction: column; align-items: center; }
.qr-title { font-size: $fs-lg; font-weight: 700; color: $text-primary; margin-bottom: 16px; text-align: center; }
.qr-code-area { width: 220px; height: 220px; display: flex; align-items: center; justify-content: center; background: $bg-card; border: 1px solid $border; border-radius: $radius-sm; }
.qr-canvas { width: 220px; height: 220px; }
.qr-subtext { font-size: $fs-md; font-weight: 600; color: $text-primary; margin-top: $sp-md; text-align: center; }
.qr-hint { font-size: $fs-xs; color: $text-hint; margin-top: $sp-xs; text-align: center; }

.info-card { background: $bg-card; border: 1px solid $border; border-radius: $radius-md; padding: $sp-lg; width: 100%; margin-bottom: $sp-lg; }
.info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid $border-light; font-size: $fs-md; }
.info-row:last-child { border-bottom: none; }
.info-lbl { color: $text-secondary; }
.info-val { color: $text-primary; }
.has-issue { color: $warning; font-weight: 500; }
.no-issue { color: $success; font-weight: 500; }

.btn-row { display: flex; gap: 10px; width: 100%; }
.btn-row .btn-primary { flex: 2; text-align: center; padding: $sp-md; }
.btn-row .btn-outline { flex: 1; text-align: center; padding: 10px; }
</style>

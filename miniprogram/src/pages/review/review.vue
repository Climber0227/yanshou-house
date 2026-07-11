<template>
  <view class="page">
    <view class="card">
      <text class="form-label">复查意见 <text class="required">*</text></text>
      <view class="opinion-tabs">
        <view class="opinion-tab" :class="{ active: result === 'pass' }" @click="result = 'pass'">
          <text>✅ 合格，同意闭环</text>
        </view>
        <view class="opinion-tab reject" :class="{ active: result === 'reject' }" @click="result = 'reject'">
          <text>❌ 不合格，退回整改</text>
        </view>
      </view>
    </view>
    <view class="card">
      <text class="form-label">复查说明</text>
      <textarea class="textarea" v-model="opinion" placeholder="可选填写复查意见" />
    </view>
    <view class="submit-bar">
      <view class="btn-primary submit-btn" @click="submitReview">提交复查结果</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reviewIssue } from '@/api'

const issueId = ref('')
const result = ref('pass')
const opinion = ref('')

async function submitReview() {
  const res = await reviewIssue(issueId.value, result.value, opinion.value)
  if (res.code === 0) {
    const msg = result.value === 'pass' ? '复查通过，已闭环' : '已退回整改'
    uni.showToast({ title: msg })
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
.form-label { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 8px; display: block; }
.required { color: #DC2626; }
.opinion-tabs { display: flex; flex-direction: column; gap: 8px; }
.opinion-tab { padding: 14px; border-radius: 8px; border: 1.5px solid #E2E8F0; text-align: center; font-size: 14px; font-weight: 600; color: #475569; }
.opinion-tab.active { border-color: #0D9488; background: #F0FDFA; color: #0D9488; }
.opinion-tab.reject.active { border-color: #DC2626; background: #FEF2F2; color: #DC2626; }
.textarea { width: 100%; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; min-height: 60px; box-sizing: border-box; }
.submit-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: #fff; border-top: 1px solid #E2E8F0; }
.submit-btn { width: 100%; text-align: center; padding: 12px; }
</style>

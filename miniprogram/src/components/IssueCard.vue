<template>
  <view class="card issue-card" @click="$emit('tap', issue)">
    <view class="issue-row">
      <view class="issue-left">
        <text class="issue-title">{{ issue.description }}</text>
        <text class="issue-meta">{{ issue.householdName }} · {{ issue.reporter }}</text>
      </view>
      <StatusTag :status="issue.status" />
    </view>
    <view v-if="showDeadline && issue.deadline" class="issue-footer">
      <text class="deadline" :class="{ overdue: issue.isOverdue }">
        {{ issue.isOverdue ? '已超期' : '截止' }}：{{ formatDate(issue.deadline) }}
      </text>
    </view>
  </view>
</template>

<script setup>
import StatusTag from './StatusTag.vue'

const props = defineProps({
  issue: { type: Object, required: true },
  showDeadline: { type: Boolean, default: false }
})

const emit = defineEmits(['tap'])

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.issue-card { padding: 12px; cursor: pointer; }
.issue-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.issue-left { flex: 1; min-width: 0; }
.issue-title { font-size: 14px; font-weight: 600; color: #1e293b; display: block; }
.issue-meta { font-size: 11px; color: #64748b; margin-top: 3px; display: block; }
.issue-footer { margin-top: 6px; }
.deadline { font-size: 10px; color: #64748b; }
.deadline.overdue { color: #DC2626; font-weight: 500; }
</style>

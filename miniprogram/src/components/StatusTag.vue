<template>
  <text class="tag" :class="tagClass">{{ statusName }}</text>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' }
})

const statusMap = {
  pending: 'tag-pending',
  rectifying: 'tag-progress',
  pending_review: 'tag-review',
  closed: 'tag-closed',
  rejected: 'tag-rejected'
}

const nameMap = {
  pending: '待整改',
  rectifying: '整改中',
  pending_review: '待复查',
  closed: '已闭环',
  rejected: '不合格'
}

const tagClass = computed(() => statusMap[props.status] || 'tag-pending')
const statusName = computed(() => nameMap[props.status] || props.status)
</script>

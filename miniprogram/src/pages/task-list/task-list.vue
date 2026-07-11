<template>
  <view class="page">
    <view class="tab-bar">
      <view v-for="t in tabs" :key="t.key"
        class="tab" :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key; loadTasks()">
        <text>{{ t.label }}</text>
      </view>
    </view>

    <view v-if="loading" class="loading-state"><text>加载中...</text></view>
    <template v-else>
      <IssueCard v-for="issue in tasks" :key="issue.id" :issue="issue" :showDeadline="true" @tap="goDetail" />
      <view v-if="tasks.length === 0" class="empty-section"><text>暂无任务</text></view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getRectifyTasks, getPendingReviews } from '@/api'
import IssueCard from '@/components/IssueCard.vue'

const tabs = [
  { key: 'pending', label: '待整改' },
  { key: 'rectifying', label: '整改中' },
  { key: 'pending_review', label: '待复查' },
  { key: 'closed', label: '已闭环' }
]
const activeTab = ref('pending')
const tasks = ref([])
const loading = ref(false)

async function loadTasks() {
  loading.value = true
  if (activeTab.value === 'pending_review') {
    const res = await getPendingReviews()
    if (res.code === 0) tasks.value = res.data.list || []
  } else {
    const res = await getRectifyTasks(activeTab.value)
    if (res.code === 0) tasks.value = res.data.list || []
  }
  loading.value = false
}

function goDetail(issue) {
  uni.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + issue.id })
}

onMounted(() => { loadTasks() })
</script>

<style scoped>
.page { padding: 0 16px 20px; }
.tab-bar { display: flex; gap: 4px; background: #F1F5F9; border-radius: 8px; padding: 3px; margin: 12px 0; }
.tab { flex: 1; text-align: center; padding: 6px 0; border-radius: 6px; font-size: 12px; color: #64748b; }
.tab.active { background: #fff; color: #1A56DB; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.loading-state { padding: 60px 20px; text-align: center; color: #64748b; }
.empty-section { padding: 60px 20px; text-align: center; color: #94a3b8; font-size: 13px; }
</style>

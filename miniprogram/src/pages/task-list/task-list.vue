<template>
<view class="page">
  <!-- 分段 -->
  <view class="seg">
    <view v-for="t in tabs" :key="t.key"
      class="seg-item" :class="{ active: active === t.key }"
      @click="active = t.key; load()">
      <text>{{ t.label }}</text>
    </view>
  </view>

  <Skeleton v-if="loading" type="card" :count="4" />
  <template v-else>
    <view v-for="i in list" :key="i.id" class="card" @click="goDetail(i)">
      <view class="card-top">
        <view class="card-info">
          <text class="card-title">{{ i.description }}</text>
          <text class="card-meta">{{ i.householdName }}</text>
        </view>
        <text class="tag" :class="tagMap[i.status]">{{ i.statusName }}</text>
      </view>
      <view class="card-foot">
        <text class="card-foot-text">{{ i.reporter }} 上报</text>
        <text v-if="i.deadline" class="card-foot-text" :class="{ over: i.isOverdue }">
          {{ i.isOverdue ? '已超期 ' : '截止 ' }}{{ fmt(i.deadline) }}
        </text>
      </view>
    </view>
    <view v-if="list.length === 0" class="empty"><text>暂无任务</text></view>
  </template>
</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getRectifyTasks, getPendingReviews } from '@/api'
import Skeleton from '@/components/Skeleton.vue'

const store = useUserStore()
const role = computed(() => store.user?.role || '')

const tabs = [
  { key: 'pending', label: '待整改' },
  { key: 'rectifying', label: '整改中' },
  { key: 'pending_review', label: '待复查' },
  { key: 'closed', label: '已闭环' }
]
const active = ref('pending')
const list = ref([])
const loading = ref(false)

const tagMap = { pending:'tag-pending', rectifying:'tag-progress', pending_review:'tag-review', closed:'tag-closed' }

// 按角色调整默认选中
const roleDefaults = { inspector: 'pending_review', supervisor: 'pending_review', rectifier: 'pending', admin: 'pending' }

async function load() {
  loading.value = true
  if (active.value === 'pending_review') {
    const r = await getPendingReviews()
    list.value = r.code === 0 ? (r.data.list || []) : []
  } else {
    const r = await getRectifyTasks(active.value)
    list.value = r.code === 0 ? (r.data.list || []) : []
  }
  loading.value = false
}

function goDetail(i) { uni.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + i.id }) }
function fmt(d) { return d ? new Date(d).toLocaleDateString('zh-CN', {month:'numeric',day:'numeric'}) : '' }

onMounted(() => {
  if (roleDefaults[role.value]) active.value = roleDefaults[role.value]
  load()
})
onShow(() => {
  load()
})
</script>

<style scoped>
.page { padding: 0 16px 20px; }
.card { background: #fff; border: 1px solid #E8E9F1; border-radius: 10px; padding: 14px; margin-bottom: 8px; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.card-info { flex: 1; min-width: 0; }
.card-title { font-size: 14px; font-weight: 600; color: #1F2024; display: block; }
.card-meta { font-size: 11px; color: #8F9098; margin-top: 3px; display: block; }
.card-foot { display: flex; gap: 16px; margin-top: 8px; }
.card-foot-text { font-size: 10px; color: #8F9098; }
.card-foot-text.over { color: #ED3241; font-weight: 500; }
.empty { padding: 60px 0; text-align: center; color: #8F9098; font-size: 13px; }
</style>

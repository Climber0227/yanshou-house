<template>
  <view class="page">
    <!-- 楼栋筛选 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="b-scroll">
        <view class="b-chip" :class="{ active: !selB }" @click="selB = ''; load()">
          <text class="b-name">全部</text>
        </view>
        <view v-for="b in buildings" :key="b.id"
          class="b-chip" :class="{ active: selB === b.id }"
          @click="selB = b.id; load()">
          <text class="b-name">{{ b.name }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="stat-bar">
      <text>共 {{ total }} 项问题</text>
    </view>

    <view v-if="loading" class="empty"><text>加载中...</text></view>
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
          <text class="card-foot-text">{{ i.typeName }} · {{ i.category }} · {{ i.reporter }}</text>
          <text v-if="i.deadline" class="card-foot-text" :class="{ over: i.isOverdue }">
            {{ i.isOverdue ? '已超期' : '截止' }} {{ fmt(i.deadline) }}
          </text>
        </view>
      </view>
      <view v-if="list.length === 0" class="empty"><text>暂无问题</text></view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBuildings, getAllIssues } from '@/api'

const buildings = ref([])
const list = ref([])
const loading = ref(false)
const selB = ref('')
const total = ref(0)

const tagMap = { pending:'tag-pending', rectifying:'tag-progress', pending_review:'tag-review', closed:'tag-closed' }

async function load() {
  loading.value = true
  const r = await getAllIssues(selB.value)
  if (r.code === 0) {
    list.value = r.data.list || []
    total.value = r.data.total || 0
  }
  loading.value = false
}

function goDetail(i) { uni.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + i.id }) }
function fmt(d) { return d ? new Date(d).toLocaleDateString('zh-CN', {month:'numeric',day:'numeric'}) : '' }

onMounted(async () => {
  const b = await getBuildings()
  if (b.code === 0) buildings.value = b.data.list || []
  load()
})
</script>

<style scoped>
.page { padding: 0 16px 20px; }
.filter-bar { padding: 8px 0; }
.b-scroll { white-space: nowrap; padding-bottom: 4px; }
.b-scroll::-webkit-scrollbar { display: none; }
.b-chip { display: inline-flex; flex-direction: column; align-items: center; padding: 8px 16px; border: 1px solid #E8E9F1; border-radius: 10px; margin-right: 8px; background: #fff; }
.b-chip.active { border-color: #006FFD; background: #EAF2FF; }
.b-chip.active .b-name { color: #006FFD; }
.b-name { font-size: 14px; font-weight: 600; color: #1F2024; }

.stat-bar { font-size: 12px; color: #8F9098; padding: 8px 0 12px; }

.card { background: #fff; border: 1px solid #E8E9F1; border-radius: 10px; padding: 14px; margin-bottom: 8px; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.card-info { flex: 1; min-width: 0; }
.card-title { font-size: 14px; font-weight: 600; color: #1F2024; display: block; }
.card-meta { font-size: 11px; color: #8F9098; margin-top: 3px; display: block; }
.card-foot { display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; }
.card-foot-text { font-size: 10px; color: #8F9098; }
.card-foot-text.over { color: #ED3241; font-weight: 500; }

.tag { padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.tag-pending { background: #FFF3E0; color: #E65100; }
.tag-progress { background: #EAF2FF; color: #006FFD; }
.tag-review { background: #F3E8FF; color: #7C3AED; }
.tag-closed { background: #E8F5E9; color: #2E7D32; }
.empty { padding: 60px 0; text-align: center; color: #8F9098; font-size: 13px; }
</style>

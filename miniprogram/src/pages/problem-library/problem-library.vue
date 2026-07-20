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
          <text class="b-chip-icon">楼</text>
          <text class="b-name">{{ b.name }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="stat-bar">
      <text>共 {{ total }} 项问题</text>
    </view>

    <view v-if="loading" class="page-loading"><text>加载中...</text></view>
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
.page { padding: 0 $sp-lg 20px; }
.filter-bar { padding: $sp-sm 0; }
.b-scroll { white-space: nowrap; padding-bottom: 4px; }
.b-scroll::-webkit-scrollbar { display: none; }
.page-loading { padding: 60px 0; text-align: center; color: $text-hint; font-size: $fs-sm; }
.b-chip { display: inline-flex; align-items: center; gap: 4px; padding: $sp-sm $sp-lg; border: 1px solid $border; border-radius: $radius-sm; margin-right: $sp-sm; background: #fff; }
.b-chip:active { border-color: $primary; }
.b-chip.active { border-color: $primary; background: $primary-light; }
.b-chip.active .b-name { color: $primary; }
.b-chip-icon { font-size: 12px; font-weight: 600; }
.b-name { font-size: $fs-md; font-weight: 600; color: $text-primary; white-space: nowrap; }

.stat-bar { font-size: $fs-xs; color: $text-hint; padding: $sp-sm 0 $sp-md; }

.card { padding: $sp-lg; margin-bottom: $sp-sm; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.card-info { flex: 1; min-width: 0; }
.card-title { font-size: $fs-md; font-weight: 600; color: $text-primary; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-meta { font-size: 11px; color: $text-hint; margin-top: 3px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-foot { display: flex; gap: $sp-lg; margin-top: $sp-sm; flex-wrap: wrap; }
.card-foot-text { font-size: 10px; color: $text-hint; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.card-foot-text.over { color: $danger; font-weight: 500; }

.tag { padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.tag-pending { background: #FFF3E0; color: #E65100; }
.tag-progress { background: $primary-light; color: $primary; }
.tag-review { background: #F3E8FF; color: #7C3AED; }
.tag-closed { background: #E8F5E9; color: #2E7D32; }
.empty { padding: 60px 0; text-align: center; color: $text-hint; font-size: 13px; }
</style>

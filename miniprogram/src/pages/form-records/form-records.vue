<template>
<view class="p">
  <view v-if="loading">加载中...</view>

  <template v-else-if="household">
    <view style="margin-bottom:12px;">
      <text style="font-size:16px;font-weight:700;">{{ household.buildingName }} {{ household.unitName }} {{ household.floor }}层 {{ household.room }}</text>
      <text style="display:block;font-size:12px;color:#666;">{{ household.acceptanceStatusName || '验收中' }}</text>
    </view>

    <view style="display:flex;gap:4px;margin-bottom:12px;">
      <view v-for="ft in formTypes" :key="ft.key"
        style="flex:1;text-align:center;padding:6px;border:1px solid #ccc;font-size:13px;"
        :style="activeForm === ft.key ? 'background:#0D3B66;color:#fff;border-color:#0D3B66;' : ''"
        @click="activeForm = ft.key">
        <text>{{ ft.label }}</text>
      </view>
    </view>

    <!-- 观感表 -->
    <view v-if="activeForm === 'visual'">
      <view style="font-size:14px;font-weight:700;margin-bottom:8px;">住宅工程质量分户验收记录表（观感）</view>
      <view v-for="(item, idx) in visualItems" :key="item.id"
        style="padding:8px 0;border-bottom:1px solid #eee;">
        <view style="display:flex;justify-content:space-between;">
          <text>{{ idx+1 }}. {{ item.name }}</text>
          <text v-if="tabPassed('visual')" style="color:#2E7D32;">合格</text>
          <text v-else-if="getItemIssue(item, 'visual')" style="color:#D32F2F;">{{ getItemIssue(item, 'visual') }}</text>
          <text v-else style="color:#999;">未检查</text>
        </view>
        <text style="font-size:11px;color:#999;display:block;margin-top:2px;">{{ item.desc }}</text>
      </view>
    </view>

    <!-- 实测表 -->
    <view v-if="activeForm === 'measure'">
      <view style="font-size:14px;font-weight:700;margin-bottom:8px;">住宅工程质量分户验收记录表（实测）</view>
      <view v-for="(item, idx) in measureItems" :key="item.id"
        style="padding:8px 0;border-bottom:1px solid #eee;">
        <text>{{ idx+1 }}. {{ item.name }}</text>
        <text v-if="tabPassed('measure')" style="display:block;color:#2E7D32;font-size:12px;">在规范允许偏差范围内</text>
        <text v-else-if="getItemIssue(item, 'measure')" style="display:block;color:#D32F2F;font-size:12px;">{{ getItemIssue(item, 'measure') }}</text>
        <text v-else style="display:block;color:#999;font-size:12px;">未测量</text>
      </view>
    </view>

    <!-- 公区表 -->
    <view v-if="activeForm === 'public'">
      <view style="font-size:14px;font-weight:700;margin-bottom:8px;">住宅工程质量验收记录表（公区）</view>
      <view v-for="(item, idx) in publicItems" :key="item.id"
        style="padding:8px 0;border-bottom:1px solid #eee;">
        <view style="display:flex;justify-content:space-between;">
          <text>{{ idx+1 }}. {{ item.name }}</text>
          <text v-if="tabPassed('public')" style="color:#2E7D32;">合格</text>
          <text v-else-if="getItemIssue(item, 'public')" style="color:#D32F2F;font-size:12px;text-align:right;max-width:50%;">{{ getItemIssue(item, 'public') }}</text>
          <text v-else style="color:#999;">未检查</text>
        </view>
      </view>
    </view>
  </template>

  <view v-else-if="err">{{ err }}</view>
</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getHouseholdDetail } from '@/api'
import { INSPECTION_FORMS } from '@/config/inspection-forms'

const loading = ref(true)
const err = ref('')
const household = ref(null)
const issues = ref([])
const checkStatus = ref({})
const activeForm = ref('visual')

const formTypes = [
  { key: 'visual', label: '观感表' },
  { key: 'measure', label: '实测表' },
  { key: 'public', label: '公区表' }
]

const visualItems = computed(() => INSPECTION_FORMS.visual?.items || [])
const measureItems = computed(() => INSPECTION_FORMS.measure?.items || [])
const publicItems = computed(() => INSPECTION_FORMS.public?.items || [])

function tabStatus(key) { return checkStatus.value[key] || 'pending' }
function tabPassed(key) { return tabStatus(key) === 'passed' }

function getItemIssue(item, type) {
  const matched = issues.value.filter(i => i.type === type && (
    i.category === item.name ||
    i.description.includes(item.name) ||
    (item.category && i.category === item.category)
  ))
  if (matched.length > 0) return matched.map(i => i.description).join('; ')
  return ''
}

onLoad(async (options) => {
  const hId = options?.householdId || ''
  if (!hId) { err.value = '缺少户参数'; loading.value = false; return }
  loading.value = true
  try {
    const r = await getHouseholdDetail(hId)
    if (r.code === 0) {
      household.value = r.data
      issues.value = r.data.issues || []
      checkStatus.value = r.data.inspectionStatus || {}
    } else {
      err.value = r.message
    }
  } catch (e) {
    err.value = '加载失败'
  }
  loading.value = false
})
</script>

<style scoped>
.p { padding: 12px; font-size: 13px; color: #333; }
</style>

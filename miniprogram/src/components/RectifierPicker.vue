<template>
  <view>
    <!-- 触发按钮：显示当前选中的整改人 -->
    <view class="rp-trigger" @click="openPicker">
      <text v-if="selected" class="rp-selected">{{ selectedName }}</text>
      <text v-else class="rp-placeholder">点击选择整改人</text>
      <text v-if="selected" class="rp-clear" @click.stop="clear">✕</text>
      <text class="rp-arrow">›</text>
    </view>

    <!-- 弹窗遮罩 -->
    <view v-if="visible" class="rp-overlay" @click="closePicker">
      <view class="rp-popup" @click.stop>
        <!-- 弹窗头部 -->
        <view class="rp-header">
          <text class="rp-title">选择整改人</text>
          <text class="rp-close" @click="closePicker">关闭</text>
        </view>

        <!-- 搜索栏 -->
        <view class="rp-search-row">
          <input class="rp-search-input" v-model="query" @input="onSearchInput"
            placeholder="搜索姓名或手机号" focus confirm-type="search" />
          <text v-if="query" class="rp-search-clear" @click="query = ''; results = []">✕</text>
        </view>

        <!-- 搜索结果 -->
        <scroll-view class="rp-list" scroll-y>
          <view v-if="loading" class="rp-status">搜索中...</view>
          <view v-else-if="query && results.length === 0" class="rp-status">未找到匹配的整改员</view>
          <view v-for="u in results" :key="u.id" class="rp-item" @click="select(u)">
            <view class="rp-avatar">{{ u.nickname.charAt(0) }}</view>
            <view class="rp-info">
              <text class="rp-name">{{ u.nickname }}</text>
              <text class="rp-phone">{{ u.phone }}</text>
              <text v-if="u.team" class="rp-team">{{ u.team }}</text>
            </view>
            <text class="rp-check" v-if="selectedId === u.id">✓</text>
          </view>
          <!-- 首次打开、未搜索时的提示 -->
          <view v-if="!query && results.length === 0" class="rp-status rp-hint">
            <text>输入姓名或手机号搜索整改员</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { searchRectifiers } from '@/api'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ name: '', phone: '' }) }
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const query = ref('')
const results = ref([])
const loading = ref(false)
const selectedId = ref('')

const selectedName = computed(() => {
  if (props.modelValue.name && props.modelValue.phone) {
    return props.modelValue.name + ' · ' + props.modelValue.phone
  }
  return props.modelValue.name || ''
})
const selected = computed(() => !!(props.modelValue.name))

let debounceTimer = null

function openPicker() {
  visible.value = true
  query.value = ''
  results.value = []
  // 初始加载全部
  if (!query.value) {
    loading.value = true
    searchRectifiers('').then(r => {
      loading.value = false
      if (r.code === 0) results.value = r.data.list || []
    })
  }
}

function closePicker() {
  visible.value = false
}

function onSearchInput(e) {
  clearTimeout(debounceTimer)
  const val = e.detail?.value || ''
  query.value = val
  if (!val.trim()) {
    results.value = []
    return
  }
  debounceTimer = setTimeout(doSearch, 200)
}

async function doSearch() {
  loading.value = true
  const res = await searchRectifiers(query.value)
  loading.value = false
  if (res.code === 0) results.value = res.data.list || []
}

function select(u) {
  selectedId.value = u.id
  emit('update:modelValue', { name: u.nickname, phone: u.phone, id: u.id })
  closePicker()
}

function clear() {
  selectedId.value = ''
  emit('update:modelValue', { name: '', phone: '' })
}
</script>

<style lang="scss" scoped>
/* 触发按钮 */
.rp-trigger {
  display: flex; align-items: center; gap: 4px;
  padding-left: 10px; padding-right: 10px; padding-top: 0; padding-bottom: 0;
  height: 36px; line-height: 36px;
  border: 1px solid $border; border-radius: 6px;
  font-size: 12px; box-sizing: border-box; background: $bg-card;
  flex: 1; overflow: hidden;
}
.rp-selected { flex: 1; font-weight: 500; color: $text-primary; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rp-placeholder { flex: 1; color: $text-placeholder; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rp-clear { width: 18px; height: 18px; border-radius: 50%; background: $text-placeholder; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
.rp-arrow { color: $text-placeholder; font-size: 16px; flex-shrink: 0; }

/* 遮罩 */
.rp-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4); z-index: 1000;
  display: flex; align-items: flex-end;
}

/* 弹窗 */
.rp-popup {
  width: 100%; max-height: 70vh;
  background: $bg-card; border-radius: 16px 16px 0 0;
  display: flex; flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.rp-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 16px 12px; border-bottom: 1px solid $border-light;
}
.rp-title { font-size: 17px; font-weight: 700; color: $text-primary; }
.rp-close { font-size: 14px; color: $primary; font-weight: 500; padding: 4px; }

/* 搜索 */
.rp-search-row {
  position: relative; padding: 12px 16px;
}
.rp-search-input {
  width: 100%; height: 40px; line-height: 40px;
  padding-left: 12px; padding-right: 32px; padding-top: 0; padding-bottom: 0;
  border: 1px solid $border; border-radius: 10px;
  font-size: 14px; box-sizing: border-box; background: $bg-page;
}
.rp-search-clear {
  position: absolute; right: 24px; top: 50%; transform: translateY(-50%);
  width: 20px; height: 20px; border-radius: 50%;
  background: $text-placeholder; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
}

/* 列表 */
.rp-list { flex: 1; overflow-y: auto; padding: 0 16px 24px; max-height: 50vh; }
.rp-status { padding: 40px 0; text-align: center; color: $text-hint; font-size: 13px; }
.rp-hint { padding: 30px 0; }

.rp-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 0; border-bottom: 1px solid $border-light;
}
.rp-item:active { opacity: 0.7; }
.rp-item:last-child { border-bottom: none; }

.rp-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: $primary-light; color: $primary;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; flex-shrink: 0;
}
.rp-info { flex: 1; min-width: 0; }
.rp-name { font-size: 15px; font-weight: 600; color: $text-primary; display: block; }
.rp-phone { font-size: 12px; color: $text-secondary; margin-top: 2px; display: block; }
.rp-team { font-size: 11px; color: $text-hint; margin-top: 1px; display: block; }
.rp-check { font-size: 18px; color: $primary; font-weight: 700; }
</style>

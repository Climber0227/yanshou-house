<template>
  <view class="rp">
    <!-- 输入框 -->
    <view class="rp-input-row">
      <input class="rp-input" :value="displayText" @input="onInput" @focus="onFocus" @blur="onBlur"
        placeholder="搜索整改人姓名或手机号" />
      <view v-if="selected" class="rp-clear" @click="clear">✕</view>
    </view>

    <!-- 下拉列表 -->
    <view v-if="showList && results.length > 0" class="rp-dropdown">
      <view v-for="u in results" :key="u.id" class="rp-item" @mousedown="select(u)" @touchstart="select(u)">
        <view class="rp-avatar">{{ u.nickname.charAt(0) }}</view>
        <view class="rp-info">
          <text class="rp-name">{{ u.nickname }}</text>
          <text class="rp-phone">{{ u.phone }}</text>
        </view>
      </view>
    </view>
    <view v-else-if="showList && query && results.length === 0" class="rp-empty">
      <text>未找到匹配的整改员</text>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { searchRectifiers } from '@/api'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ name: '', phone: '' }) }
})
const emit = defineEmits(['update:modelValue'])

const query = ref('')
const results = ref([])
const showList = ref(false)
const selected = ref(false)
const displayText = ref('')

let debounceTimer = null

function onInput(e) {
  const val = e.detail?.value || ''
  query.value = val
  selected.value = false
  emit('update:modelValue', { name: val, phone: '' })
  clearTimeout(debounceTimer)
  if (!val.trim()) {
    results.value = []
    showList.value = false
    return
  }
  debounceTimer = setTimeout(doSearch, 200)
}

async function doSearch() {
  const res = await searchRectifiers(query.value)
  if (res.code === 0) {
    results.value = res.data.list || []
    showList.value = true
  }
}

function select(u) {
  selected.value = true
  showList.value = false
  displayText.value = u.nickname + ' · ' + u.phone
  emit('update:modelValue', { name: u.nickname, phone: u.phone, id: u.id })
}

function clear() {
  selected.value = false
  displayText.value = ''
  query.value = ''
  results.value = []
  emit('update:modelValue', { name: '', phone: '' })
}

function onFocus() {
  if (query.value.trim()) {
    doSearch()
    showList.value = true
  }
}

function onBlur() {
  // 延迟隐藏下拉，让点击事件先触发
  setTimeout(() => { showList.value = false }, 200)
}

// 外部重置
watch(() => props.modelValue, (nv) => {
  if (!nv.name && !nv.phone) {
    selected.value = false
    displayText.value = ''
    query.value = ''
    results.value = []
  }
}, { deep: true })
</script>

<style lang="scss" scoped>
.rp { position: relative; flex: 1; }
.rp-input-row { display: flex; align-items: center; gap: 4px; }

.rp-input {
  flex: 1;
  padding-left: 8px; padding-right: 8px; padding-top: 0; padding-bottom: 0;
  height: 36px; line-height: 36px;
  border: 1px solid $border; border-radius: 6px;
  font-size: 12px; box-sizing: border-box; background: $bg-card;
}

.rp-clear {
  width: 20px; height: 20px; border-radius: 50%;
  background: $text-placeholder; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; flex-shrink: 0;
}

.rp-dropdown {
  position: absolute; top: 100%; left: 0; right: 0;
  background: #fff; border: 1px solid $border; border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  z-index: 100; max-height: 220px; overflow-y: auto;
  margin-top: 4px;
}

.rp-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-bottom: 1px solid $border-light;
}
.rp-item:last-child { border-bottom: none; }
.rp-item:active { background: $primary-light; }

.rp-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: $primary-light; color: $primary;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
}

.rp-info { flex: 1; min-width: 0; }
.rp-name { font-size: 13px; font-weight: 600; color: $text-primary; display: block; }
.rp-phone { font-size: 11px; color: $text-secondary; margin-top: 2px; display: block; }

.rp-empty { padding: 20px; text-align: center; color: $text-hint; font-size: 12px; }
</style>

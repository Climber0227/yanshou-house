// 离线暂存 — 表单数据 + 多媒体文件管理

const QUEUE_KEY = 'upload_queue'
const DRAFT_KEY_PREFIX = 'draft_'

// 保存草稿
export function saveDraft(householdId, type, data) {
  try {
    uni.setStorageSync(DRAFT_KEY_PREFIX + householdId + '_' + type, JSON.stringify(data))
  } catch (e) { console.warn('saveDraft failed', e) }
}

// 读取草稿
export function loadDraft(householdId, type) {
  try {
    const raw = uni.getStorageSync(DRAFT_KEY_PREFIX + householdId + '_' + type)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// 删除草稿
export function removeDraft(householdId, type) {
  try { uni.removeStorageSync(DRAFT_KEY_PREFIX + householdId + '_' + type) } catch {}
}

// 加入上传队列
export function enqueue(payload) {
  const queue = getQueue()
  queue.push({ ...payload, id: Date.now() + '_' + Math.random().toString(36).slice(2, 8), status: 'pending', createdAt: new Date().toISOString() })
  uni.setStorageSync(QUEUE_KEY, JSON.stringify(queue))
}

// 获取队列
export function getQueue() {
  try {
    const raw = uni.getStorageSync(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

// 更新队列项状态
export function updateQueueItem(id, updates) {
  const queue = getQueue()
  const idx = queue.findIndex(item => item.id === id)
  if (idx >= 0) {
    queue[idx] = { ...queue[idx], ...updates }
    uni.setStorageSync(QUEUE_KEY, JSON.stringify(queue))
  }
}

// 移除队列项
export function removeQueueItem(id) {
  const queue = getQueue().filter(item => item.id !== id)
  uni.setStorageSync(QUEUE_KEY, JSON.stringify(queue))
}

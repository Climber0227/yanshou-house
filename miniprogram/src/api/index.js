// API 层 — 通过 .env 的 VITE_USE_MOCK 切换 Mock / 真实后端
// 注意：不使用 import config from '@/config'，防止 Vite tree-shaking 移除
import * as mock from '@/mock'
import { useUserStore } from '@/store/user'

// 编译期常量，Vite 会在构建时替换
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dev-api.example.com'
const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || 'https://dev-api.example.com/upload'

/**
 * 请求包装器（等后端就绪后启用）
 * - 自动注入 auth token
 * - 401 时清除登录状态
 * - 网络异常时返回友好提示
 */
async function request(options) {
  let token = ''
  try {
    const store = useUserStore()
    token = store.token || ''
  } catch {}

  const header = { 'Content-Type': 'application/json' }
  if (token) header['Authorization'] = 'Bearer ' + token

  try {
    const res = await uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: { ...header, ...options.header },
      timeout: options.timeout || 15000
    })

    if (res.statusCode === 401) {
      try { useUserStore().logout() } catch {}
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      return { code: 401, message: '未授权，请重新登录' }
    }

    if (res.statusCode >= 500) {
      return { code: res.statusCode, message: '服务器错误，请稍后重试' }
    }

    return res.data
  } catch (err) {
    console.error('[API] 请求失败:', err)
    uni.showToast({ title: '网络异常，请检查网络连接', icon: 'none' })
    return { code: -1, message: '网络异常，请检查网络连接' }
  }
}

/**
 * 文件上传包装器（等后端就绪后启用）
 */
async function uploadRequest(filePath, options = {}) {
  let token = ''
  try {
    const store = useUserStore()
    token = store.token || ''
  } catch {}

  const header = {}
  if (token) header['Authorization'] = 'Bearer ' + token

  try {
    const res = await uni.uploadFile({
      url: UPLOAD_URL + (options.url || '/upload'),
      filePath,
      name: options.name || 'file',
      formData: options.formData || {},
      header: { ...header, ...options.header },
    })

    if (res.statusCode === 401) {
      try { useUserStore().logout() } catch {}
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      return { code: 401, message: '未授权' }
    }

    return typeof res.data === 'string' ? JSON.parse(res.data) : res.data
  } catch (err) {
    console.error('[API] 上传失败:', err)
    uni.showToast({ title: '上传失败，请检查网络', icon: 'none' })
    return { code: -1, message: '上传失败' }
  }
}

// 每个 API 函数：VITE_USE_MOCK=true 走 Mock，否则发真实请求
export async function login(code) {
  if (USE_MOCK) return mock.mockLogin(code)
  return request({ url: '/api/login', method: 'POST', data: { code } })
}
export async function getProfile() {
  if (USE_MOCK) return mock.mockGetProfile()
  return request({ url: '/api/user/profile' })
}
export async function getBuildings() {
  if (USE_MOCK) return mock.mockGetBuildings()
  return request({ url: '/api/buildings' })
}
export async function getUnits(buildingId) {
  if (USE_MOCK) return mock.mockGetUnits(buildingId)
  return request({ url: '/api/buildings/' + buildingId + '/units' })
}
export async function getHouseholds(buildingId, unitId, floor) {
  if (USE_MOCK) return mock.mockGetHouseholds(buildingId, unitId, floor)
  return request({ url: '/api/households', data: { buildingId, unitId, floor } })
}
export async function getHouseholdByQr(token) {
  if (USE_MOCK) return mock.mockGetHouseholdByQr(token)
  return request({ url: '/api/households/qr/' + encodeURIComponent(token) })
}
export async function getHouseholdDetail(id) {
  if (USE_MOCK) return mock.mockGetHouseholdDetail(id)
  return request({ url: '/api/households/' + id })
}
export async function getHouseholdQrcode(id) {
  if (USE_MOCK) return mock.mockGetHouseholdQrcode(id)
  return request({ url: '/api/households/' + id + '/qrcode' })
}
export async function getIssuePresets(type) {
  if (USE_MOCK) return mock.mockGetIssuePresets(type)
  return request({ url: '/api/issues/presets', data: { type } })
}
export async function getFormItems(type) {
  if (USE_MOCK) return mock.mockGetFormItems(type)
  return request({ url: '/api/inspection/forms', data: { type } })
}
export async function reportIssue(form) {
  if (USE_MOCK) return mock.mockReportIssue(form)
  return request({ url: '/api/issues', method: 'POST', data: form })
}
export async function batchReportIssues(form) {
  if (USE_MOCK) return mock.mockBatchReportIssues(form)
  return request({ url: '/api/issues/batch', method: 'POST', data: form })
}
export async function acceptHousehold(householdId, type, result) {
  if (USE_MOCK) return mock.mockAcceptHousehold(householdId, type, result)
  return request({ url: '/api/households/' + householdId + '/accept', method: 'POST', data: { type, result } })
}
export async function getHouseholdIssues(householdId, params) {
  if (USE_MOCK) return mock.mockGetHouseholdIssues(householdId, params)
  return request({ url: '/api/households/' + householdId + '/issues', data: params })
}
export async function getIssueDetail(issueId) {
  if (USE_MOCK) return mock.mockGetIssueDetail(issueId)
  return request({ url: '/api/issues/' + issueId })
}
export async function getRectifyTasks(status) {
  if (USE_MOCK) return mock.mockGetRectifyTasks(status)
  return request({ url: '/api/issues/rectify-tasks', data: { status } })
}
export async function startRectify(issueId) {
  if (USE_MOCK) return mock.mockStartRectify(issueId)
  return request({ url: '/api/issues/' + issueId + '/rectify', method: 'POST' })
}
export async function submitRectify(issueId, form) {
  if (USE_MOCK) return mock.mockSubmitRectify(issueId, form)
  return request({ url: '/api/issues/' + issueId + '/rectify/submit', method: 'POST', data: form })
}
export async function getPendingReviews() {
  if (USE_MOCK) return mock.mockGetPendingReviews()
  return request({ url: '/api/issues/pending-reviews' })
}
export async function reviewIssue(issueId, result, opinion, signature) {
  if (USE_MOCK) return mock.mockReviewIssue(issueId, result, opinion, signature)
  return request({ url: '/api/issues/' + issueId + '/review', method: 'POST', data: { result, opinion, signature } })
}
export async function getIssueTimeline(issueId) {
  if (USE_MOCK) return mock.mockGetIssueTimeline(issueId)
  return request({ url: '/api/issues/' + issueId + '/timeline' })
}
export async function getNotifications() {
  if (USE_MOCK) return mock.mockGetNotifications()
  return request({ url: '/api/notifications' })
}
export async function markNotificationRead(id) {
  if (USE_MOCK) return mock.mockMarkNotificationRead(id)
  return request({ url: '/api/notifications/' + id + '/read', method: 'POST' })
}
export async function getStatistics() {
  if (USE_MOCK) return mock.mockGetStatistics()
  return request({ url: '/api/statistics' })
}
export async function getAllIssues(buildingId) {
  if (USE_MOCK) return mock.mockGetAllIssues(buildingId)
  return request({ url: '/api/issues/all', data: { buildingId } })
}
export async function getEstimatedValues() {
  if (USE_MOCK) return mock.mockGetEstimatedValues()
  return request({ url: '/api/issues/estimated-values' })
}
export async function checkOverdue() {
  if (USE_MOCK) return mock.mockCheckOverdue()
  return request({ url: '/api/issues/overdue' })
}
export async function searchRectifiers(query) {
  if (USE_MOCK) return mock.mockSearchRectifiers(query)
  return request({ url: '/api/users/rectifiers', data: { query } })
}

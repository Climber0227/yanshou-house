// API 层
// 统一请求入口，调用时自动判断使用 mock 还是真实后端

import config from '@/config'
import * as mock from '@/mock'

// 是否使用 mock
const useMock = config.useMock

// 真实后端请求
function request(options) {
  const token = uni.getStorageSync('token')
  return new Promise((resolve, reject) => {
    uni.request({
      url: config.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Authorization': token ? 'Bearer ' + token : '',
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.data.code === 401) {
          uni.removeStorageSync('token')
          uni.reLaunch({ url: '/pages/index/index' })
        }
        resolve(res.data)
      },
      fail: (err) => {
        reject({ code: -1, message: '网络异常，请检查网络连接', data: null })
      }
    })
  })
}

// ========== 导出 API ==========
// 调用时优先使用 mock，关闭 mock 后走真实后端

export async function login(code) {
  return useMock ? mock.mockLogin(code) : request({ url: '/api/auth/login', method: 'POST', data: { code } })
}

export async function getProfile() {
  return useMock ? mock.mockGetProfile() : request({ url: '/api/auth/profile' })
}

export async function getBuildings() {
  return useMock ? mock.mockGetBuildings() : request({ url: '/api/buildings' })
}

export async function getUnits(buildingId) {
  return useMock ? mock.mockGetUnits(buildingId) : request({ url: `/api/buildings/${buildingId}/units` })
}

export async function getHouseholds(buildingId, unitId, floor) {
  return useMock ? mock.mockGetHouseholds(buildingId, unitId, floor) : request({ url: '/api/households', data: { buildingId, unitId, floor } })
}

export async function getHouseholdByQr(token) {
  return useMock ? mock.mockGetHouseholdByQr(token) : request({ url: `/api/households/qr/${token}` })
}

export async function getHouseholdDetail(id) {
  return useMock ? mock.mockGetHouseholdDetail(id) : request({ url: `/api/households/${id}` })
}

export async function getHouseholdQrcode(id) {
  return useMock ? mock.mockGetHouseholdQrcode(id) : request({ url: `/api/households/${id}/qrcode` })
}

export async function getIssuePresets(type) {
  return useMock ? mock.mockGetIssuePresets(type) : request({ url: `/api/issues/presets?type=${type}` })
}

export async function reportIssue(form) {
  return useMock ? mock.mockReportIssue(form) : request({ url: '/api/issues', method: 'POST', data: form })
}

export async function batchReportIssues(form) {
  return useMock ? mock.mockBatchReportIssues(form) : request({ url: '/api/issues/batch', method: 'POST', data: form })
}

export async function acceptHousehold(householdId, type) {
  return useMock ? mock.mockAcceptHousehold(householdId, type) : request({ url: `/api/households/${householdId}/accept`, method: 'POST', data: { type, noIssue: true } })
}

export async function getHouseholdIssues(householdId, params) {
  return useMock ? mock.mockGetHouseholdIssues(householdId, params) : request({ url: `/api/households/${householdId}/issues`, data: params })
}

export async function getIssueDetail(issueId) {
  return useMock ? mock.mockGetIssueDetail(issueId) : request({ url: `/api/issues/${issueId}` })
}

export async function getRectifyTasks(status) {
  return useMock ? mock.mockGetRectifyTasks(status) : request({ url: '/api/rectify/tasks', data: { status } })
}

export async function startRectify(issueId) {
  return useMock ? mock.mockStartRectify(issueId) : request({ url: `/api/issues/${issueId}/rectify/start`, method: 'PUT' })
}

export async function submitRectify(issueId, form) {
  return useMock ? mock.mockSubmitRectify(issueId, form) : request({ url: `/api/issues/${issueId}/rectify/submit`, method: 'POST', data: form })
}

export async function getPendingReviews() {
  return useMock ? mock.mockGetPendingReviews() : request({ url: '/api/review/pending' })
}

export async function reviewIssue(issueId, result, opinion) {
  return useMock ? mock.mockReviewIssue(issueId, result, opinion) : request({ url: `/api/issues/${issueId}/review`, method: 'POST', data: { result, opinion } })
}

export async function getIssueTimeline(issueId) {
  return useMock ? mock.mockGetIssueTimeline(issueId) : request({ url: `/api/issues/${issueId}/timeline` })
}

export async function getNotifications() {
  return useMock ? mock.mockGetNotifications() : request({ url: '/api/notifications' })
}

export async function markNotificationRead(id) {
  return useMock ? mock.mockMarkNotificationRead(id) : request({ url: `/api/notifications/${id}/read`, method: 'PUT' })
}

export async function getStatistics() {
  return useMock ? mock.mockGetStatistics() : request({ url: '/api/admin/statistics' })
}

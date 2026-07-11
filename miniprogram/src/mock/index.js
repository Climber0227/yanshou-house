// Mock 服务层
// 模拟后端 API 响应，返回与 API 合同一致的格式

import data from './data'

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))
const ok = (res) => ({ code: 0, message: 'success', data: res })
const fail = (code, message) => ({ code, message, data: null })

// 从 localStorage 获取 token
function getToken() {
  try { return uni.getStorageSync('token') } catch { return '' }
}

// ========== 认证模块 ==========
export async function mockLogin(code) {
  await delay(300)
  const user = data.mockUsers['u_001']
  return ok({
    token: 'mock_token_' + user.id,
    userInfo: { ...user }
  })
}

export async function mockGetProfile() {
  await delay(150)
  const token = getToken()
  if (!token) return fail(401, '未登录')
  const userId = token.replace('mock_token_', '')
  const user = data.mockUsers[userId] || data.mockUsers['u_001']
  return ok({ ...user })
}

// ========== 楼栋模块 ==========
export async function mockGetBuildings() {
  await delay(200)
  return ok({ list: data.mockBuildings })
}

export async function mockGetUnits(buildingId) {
  await delay(150)
  return ok({ list: data.mockUnits[buildingId] || [] })
}

export async function mockGetHouseholds(buildingId, unitId, floor) {
  await delay(200)
  let list = [...data.mockHouseholds]
  if (buildingId) list = list.filter(h => h.buildingId === buildingId)
  return ok({ list })
}

export async function mockGetHouseholdByQr(token) {
  await delay(250)
  const h = data.mockHouseholds.find(h => h.id === token) || data.mockHouseholds[0]
  return ok({
    ...h,
    closedCount: data.mockIssues.filter(i => i.householdId === h.id && i.status === 'closed').length,
    pendingCount: data.mockIssues.filter(i => i.householdId === h.id && i.status !== 'closed').length
  })
}

export async function mockGetHouseholdDetail(id) {
  await delay(200)
  const h = data.mockHouseholds.find(h => h.id === id)
  if (!h) return fail(404, '户不存在')
  const issues = data.mockIssues.filter(i => i.householdId === id)
  return ok({ ...h, issues })
}

export async function mockGetHouseholdQrcode(id) {
  await delay(300)
  return ok({ qrUrl: '', text: data.mockHouseholds.find(h => h.id === id)?.name || '' })
}

// ========== 问题上报 ==========
export async function mockGetIssuePresets(type) {
  await delay(150)
  const presets = data.issuePresets[type] || []
  return ok({ list: presets })
}

export async function mockReportIssue(form) {
  await delay(300)
  return ok({ id: 'iss_new_' + Date.now(), status: 'pending', statusName: '待整改' })
}

export async function mockBatchReportIssues(form) {
  await delay(400)
  return ok({
    importedCount: form.householdIds.length,
    failedCount: 0,
    errors: []
  })
}

export async function mockAcceptHousehold(householdId, type) {
  await delay(200)
  return ok({
    acceptanceProgress: { visual: 'passed', measure: 'pending', public: 'pending' }
  })
}

export async function mockGetHouseholdIssues(householdId, params) {
  await delay(200)
  let list = data.mockIssues.filter(i => i.householdId === householdId)
  if (params?.status) list = list.filter(i => i.status === params.status)
  if (params?.type) list = list.filter(i => i.type === params.type)
  return ok({ list, total: list.length, page: 1, pageSize: 20 })
}

export async function mockGetIssueDetail(issueId) {
  await delay(150)
  const issue = data.mockIssues.find(i => i.id === issueId)
  if (!issue) return fail(404, '问题不存在')
  return ok(issue)
}

// ========== 整改流程 ==========
export async function mockGetRectifyTasks(status) {
  await delay(200)
  let list = data.mockIssues.filter(i => i.rectifierId === 'u_002')
  if (status) {
    const statuses = status.split(',')
    list = list.filter(i => statuses.includes(i.status))
  }
  return ok({ list, total: list.length, page: 1, pageSize: 20 })
}

export async function mockStartRectify(issueId) {
  await delay(200)
  const issue = data.mockIssues.find(i => i.id === issueId)
  if (issue) issue.status = 'rectifying', issue.statusName = '整改中'
  return ok({ status: 'rectifying', statusName: '整改中' })
}

export async function mockSubmitRectify(issueId, form) {
  await delay(300)
  const issue = data.mockIssues.find(i => i.id === issueId)
  if (issue) issue.status = 'pending_review', issue.statusName = '待复查'
  return ok({ status: 'pending_review', statusName: '待复查' })
}

export async function mockGetPendingReviews() {
  await delay(200)
  const list = data.mockIssues.filter(i => i.status === 'pending_review')
  return ok({ list, total: list.length, page: 1, pageSize: 20 })
}

export async function mockReviewIssue(issueId, result, opinion) {
  await delay(250)
  const issue = data.mockIssues.find(i => i.id === issueId)
  if (result === 'pass') {
    if (issue) issue.status = 'closed', issue.statusName = '已闭环'
    return ok({ status: 'closed', statusName: '已闭环' })
  } else {
    if (issue) issue.status = 'rectifying', issue.statusName = '整改中'
    return ok({ status: 'rectifying', statusName: '整改中' })
  }
}

export async function mockGetIssueTimeline(issueId) {
  await delay(150)
  return ok({
    list: [
      { action: 'reported', actionName: '上报问题', operatorName: '张查验', operatorRole: '查验员', createdAt: new Date(Date.now() - 86400000).toISOString(), detail: {} },
      { action: 'assigned', actionName: '派单', operatorName: '系统', operatorRole: '', createdAt: new Date(Date.now() - 82800000).toISOString(), detail: { assignee: '李整改' } },
      { action: 'rectify_started', actionName: '开始整改', operatorName: '李整改', operatorRole: '整改员', createdAt: new Date(Date.now() - 43200000).toISOString(), detail: {} }
    ]
  })
}

// ========== 通知 ==========
export async function mockGetNotifications() {
  await delay(200)
  return ok({ list: data.mockNotifications, total: data.mockNotifications.length, page: 1, pageSize: 20 })
}

export async function mockMarkNotificationRead(id) {
  await delay(100)
  const notif = data.mockNotifications.find(n => n.id === id)
  if (notif) notif.isRead = true
  return ok({})
}

// ========== 统计 ==========
export async function mockGetStatistics() {
  await delay(250)
  return ok(data.mockStatistics)
}

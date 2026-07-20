// Mock 服务层
// 模拟后端 API 响应，返回与 API 合同一致的格式

import data from './data'
import { INSPECTION_FORMS } from '@/config/inspection-forms'

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))
const ok = (res) => ({ code: 0, message: 'success', data: res })
const fail = (code, message) => ({ code, message, data: null })

// 从缓存获取当前用户
function getCurrentUser() {
  try {
    const raw = uni.getStorageSync('user')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { id: 'u_001', nickname: '张查验', role: 'inspector', roleName: '查验员' }
}

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
  if (unitId) list = list.filter(h => h.unitId === unitId)
  if (floor) list = list.filter(h => h.floor === floor)
  // 计算真实问题数
  list = list.map(h => ({
    ...h,
    issueCount: data.mockIssues.filter(i => i.householdId === h.id).length
  }))
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
  const inspectionStatus = h.inspectionStatus || { visual: 'pending', measure: 'pending', public: 'pending' }
  return ok({ ...h, issues, inspectionStatus })
}

export async function mockGetHouseholdQrcode(id) {
  await delay(300)
  return ok({ qrUrl: '', text: data.mockHouseholds.find(h => h.id === id)?.name || '' })
}

// ========== 问题上报 ==========
export async function mockGetFormItems(type) {
  await delay(100)
  const form = INSPECTION_FORMS[type]
  if (!form) return fail(400, '无效的检查类型')
  if (type === 'visual') return ok({ items: form.items, rooms: [] })
  if (type === 'measure') return ok({ items: form.items, rooms: form.rooms || [] })
  if (type === 'public') return ok({ items: form.items, rooms: [] })
  return ok(form)
}

export async function mockGetIssuePresets(type) {
  await delay(150)
  const presets = data.issuePresets[type] || []
  return ok({ list: presets })
}

function addNotification(type, title, content, issueId) {
  data.mockNotifications.unshift({
    id: 'not_auto_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    type,
    title,
    content,
    issueId,
    isRead: false,
    createdAt: new Date().toISOString()
  })
}

function getHouseholdName(id) {
  const h = data.mockHouseholds.find(x => x.id === id)
  return h ? h.name : ''
}

export async function mockReportIssue(form) {
  await delay(300)
  const cur = getCurrentUser()
  const newIssue = {
    id: 'iss_new_' + Date.now(),
    householdId: form.householdId,
    householdName: getHouseholdName(form.householdId),
    type: form.type,
    typeName: form.type === 'visual' ? '观感' : form.type === 'measure' ? '实测' : '公区',
    category: form.category || '',
    description: form.description,
    status: 'pending', statusName: '待整改',
    photos: form.photos || [],
    reporter: cur.nickname, reporterId: cur.id,
    rectifier: form.rectifierName || '', rectifierId: '',
    rectifierPhone: form.rectifierPhone || '',
    deadline: form.deadline || '',
    isOverdue: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    remark: form.remark || '',
    _transitions: []
  }
  data.mockIssues.push(newIssue)
  // 自动生成派单通知
  const hName = getHouseholdName(form.householdId)
  addNotification('assign', '新整改任务', `${hName} - ${form.description} 已上报，待整改`, newIssue.id)
  return ok({ id: newIssue.id, status: 'pending', statusName: '待整改' })
}

export async function mockBatchReportIssues(form) {
  await delay(400)
  const cur = getCurrentUser()
  const count = form.householdIds.length
  for (const hId of form.householdIds) {
    const newId = 'iss_batch_' + Date.now() + '_' + hId
    data.mockIssues.push({
      id: newId,
      householdId: hId,
      householdName: getHouseholdName(hId),
      type: form.type,
      typeName: form.type === 'visual' ? '观感' : form.type === 'measure' ? '实测' : '公区',
      category: form.category || '',
      description: form.description,
      status: 'pending', statusName: '待整改',
      photos: form.photos || [],
      reporter: cur.nickname, reporterId: cur.id,
      rectifierPhone: form.rectifierPhone || '',
      rectifier: form.rectifierName || '', rectifierId: '',
      deadline: '',
      isOverdue: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      remark: '',
      _transitions: []
    })
    // 自动生成派单通知
    const hName = getHouseholdName(hId)
    addNotification('assign', '新整改任务', `${hName} - ${form.description} 已上报，待整改`, newId)
  }
  return ok({ importedCount: count, failedCount: 0, errors: [] })
}

export async function mockAcceptHousehold(householdId, type, result) {
  await delay(200)
  const hh = data.mockHouseholds.find(h => h.id === householdId)
  if (hh) {
    if (!hh.inspectionStatus) hh.inspectionStatus = { visual: 'pending', measure: 'pending', public: 'pending' }
    // type='all' 表示整户审核（问题都已闭环后的最终确认）
    if (type === 'all') {
      hh.acceptanceStatus = 'completed'
      hh.acceptanceStatusName = '已完成'
    } else {
      // 更新对应 TAB 状态：passed（全部合格）或 has_issues（有问题）
      hh.inspectionStatus[type] = result || 'passed'
      // 三 TAB 全 passed → 无问题验收完成
      const allPassed = hh.inspectionStatus.visual === 'passed' && hh.inspectionStatus.measure === 'passed' && hh.inspectionStatus.public === 'passed'
      if (allPassed) {
        hh.acceptanceStatus = 'completed'
        hh.acceptanceStatusName = '已完成（无问题）'
      }
    }
  }
  return ok({
    inspectionStatus: hh?.inspectionStatus || { visual: 'pending', measure: 'pending', public: 'pending' },
    acceptanceStatus: hh?.acceptanceStatus || 'pending',
    acceptanceStatusName: hh?.acceptanceStatusName || '验收中'
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
  const cur = getCurrentUser()
  // 管理员看全部，其他角色只看指派给自己的任务
  // 整改人按姓名匹配（上报时指定的姓名）
  let list = cur.role === 'admin'
    ? [...data.mockIssues]
    : data.mockIssues.filter(i => i.rectifier === cur.nickname || i.reporterId === cur.id)
  if (status) {
    const statuses = status.split(',')
    list = list.filter(i => statuses.includes(i.status))
  }
  return ok({ list, total: list.length, page: 1, pageSize: 20 })
}

function pushTransition(issue, action, actionName, operatorName, operatorRole, detail) {
  issue._transitions = issue._transitions || []
  issue._transitions.push({ action, actionName, operatorName, operatorRole, detail: detail || {}, createdAt: new Date().toISOString() })
}

export async function mockStartRectify(issueId) {
  await delay(200)
  const cur = getCurrentUser()
  const issue = data.mockIssues.find(i => i.id === issueId)
  if (issue) {
    pushTransition(issue, 'rectify_started', '开始整改', cur.nickname, '整改员')
    issue.status = 'rectifying'
    issue.statusName = '整改中'
    issue.rectifier = cur.nickname
    issue.rectifierId = cur.id
    issue.updatedAt = new Date().toISOString()
  }
  return ok({ status: 'rectifying', statusName: '整改中' })
}

export async function mockSubmitRectify(issueId, form) {
  await delay(300)
  const cur = getCurrentUser()
  const issue = data.mockIssues.find(i => i.id === issueId)
  if (issue) {
    pushTransition(issue, 'rectify_submitted', '提交整改结果', cur.nickname, '整改员')
    issue.status = 'pending_review'
    issue.statusName = '待复查'
    issue.updatedAt = new Date().toISOString()
  }
  return ok({ status: 'pending_review', statusName: '待复查' })
}

export async function mockGetPendingReviews() {
  await delay(200)
  const list = data.mockIssues.filter(i => i.status === 'pending_review')
  return ok({ list, total: list.length, page: 1, pageSize: 20 })
}

export async function mockReviewIssue(issueId, result, opinion, signature) {
  await delay(250)
  const cur = getCurrentUser()
  const issue = data.mockIssues.find(i => i.id === issueId)
  if (result === 'pass') {
    if (issue) {
      pushTransition(issue, 'review_passed', '复查通过', cur.nickname, cur.roleName || '监理', { result: '合格', opinion, hasSignature: !!signature })
      issue.status = 'closed'
      issue.statusName = '已闭环'
      issue.signature = signature || ''
      issue.updatedAt = new Date().toISOString()
    }
    return ok({ status: 'closed', statusName: '已闭环' })
  } else {
    if (issue) {
      pushTransition(issue, 'review_rejected', '退回整改', cur.nickname, cur.roleName || '监理', { result: '不合格', opinion })
      issue.status = 'rectifying'
      issue.statusName = '整改中'
      issue.updatedAt = new Date().toISOString()
    }
    return ok({ status: 'rectifying', statusName: '整改中' })
  }
}

export async function mockGetIssueTimeline(issueId) {
  await delay(150)
  const issue = data.mockIssues.find(i => i.id === issueId)
  if (!issue) return ok({ list: [] })

  // 合并初始事件 + _transitions 记录
  const list = []
  // 上报事件
  list.push({ action: 'reported', actionName: '上报问题', operatorName: issue.reporter || '查验员', operatorRole: '查验员', createdAt: issue.createdAt, detail: {} })
  list.push({ action: 'assigned', actionName: '派单', operatorName: '系统', operatorRole: '', createdAt: issue.createdAt, detail: { assignee: issue.rectifier || '待指派' } })

  // 后续流转事件
  if (issue._transitions) {
    for (const t of issue._transitions) {
      list.push({ ...t })
    }
  }

  // 按时间正序排列
  list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  return ok({ list: list.reverse() })
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

// ========== 问题库（全量问题，按楼栋筛选） ==========
export async function mockGetAllIssues(buildingId) {
  await delay(200)
  let list = [...data.mockIssues]
  if (buildingId) {
    const hIds = data.mockHouseholds.filter(h => h.buildingId === buildingId).map(h => h.id)
    list = list.filter(i => hIds.includes(i.householdId))
  }
  // 补全楼栋名
  list = list.map(i => {
    const h = data.mockHouseholds.find(x => x.id === i.householdId)
    return { ...i, householdName: h ? h.name : i.householdName, buildingName: h ? h.buildingName : '' }
  })
  return ok({ list, total: list.length })
}

// ========== 搜索整改人 ==========
export async function mockSearchRectifiers(query) {
  await delay(150)
  const rectifiers = Object.values(data.mockUsers).filter(u => u.role === 'rectifier')
  if (!query) return ok({ list: rectifiers })
  const q = query.trim().toLowerCase()
  const matched = rectifiers.filter(u =>
    u.nickname.includes(q) || u.phone.includes(q)
  )
  return ok({ list: matched })
}

// ========== 超期提醒 ==========
export async function mockCheckOverdue() {
  await delay(100)
  const now = Date.now()
  const overdue = []
  for (const issue of data.mockIssues) {
    // 超整改期限
    if (issue.deadline && (issue.status === 'pending' || issue.status === 'rectifying')) {
      if (now > new Date(issue.deadline).getTime()) {
        overdue.push({ id: issue.id, description: issue.description, householdName: issue.householdName, type: 'deadline', msg: '已超整改期限' })
      }
    }
    // 待复查超过24小时未处理
    if (issue.status === 'pending_review' && issue.updatedAt) {
      if (now - new Date(issue.updatedAt).getTime() > 24 * 60 * 60 * 1000) {
        overdue.push({ id: issue.id, description: issue.description, householdName: issue.householdName, type: 'review_delay', msg: '待复查超24小时未处理' })
      }
    }
  }
  return ok({ list: overdue })
}

// ========== 推算值 ==========
export async function mockGetEstimatedValues() {
  await delay(100)
  return ok(data.mockEstimatedValues || {})
}

// ========== 统计 ==========
export async function mockGetStatistics() {
  await delay(250)
  const totalHouseholds = data.mockHouseholds.length
  const allIssues = data.mockIssues || []
  const totalIssues = allIssues.length
  const pendingCount = allIssues.filter(i => i.status === 'pending').length
  const rectifyingCount = allIssues.filter(i => i.status === 'rectifying').length
  const pendingReviewCount = allIssues.filter(i => i.status === 'pending_review').length
  const closedCount = allIssues.filter(i => i.status === 'closed').length
  const checkedHouseholdIds = new Set(allIssues.map(i => i.householdId))
  const checkedHouseholds = checkedHouseholdIds.size
  const rectifyRate = totalIssues > 0 ? (closedCount / totalIssues) : 0
  return ok({
    totalHouseholds,
    checkedHouseholds,
    totalIssues,
    pendingCount,
    rectifyingCount,
    pendingReviewCount,
    closedCount,
    rectifyRate
  })
}

// API 层 — 开发阶段直接使用 Mock，等后端就绪后恢复 config 切换
import * as mock from '@/mock'

function mockCall(fn) {
  return fn()
}

export async function login(code) { return mock.mockLogin(code) }
export async function getProfile() { return mock.mockGetProfile() }
export async function getBuildings() { return mock.mockGetBuildings() }
export async function getUnits(buildingId) { return mock.mockGetUnits(buildingId) }
export async function getHouseholds(buildingId, unitId, floor) { return mock.mockGetHouseholds(buildingId, unitId, floor) }
export async function getHouseholdByQr(token) { return mock.mockGetHouseholdByQr(token) }
export async function getHouseholdDetail(id) { return mock.mockGetHouseholdDetail(id) }
export async function getHouseholdQrcode(id) { return mock.mockGetHouseholdQrcode(id) }
export async function getIssuePresets(type) { return mock.mockGetIssuePresets(type) }
export async function reportIssue(form) { return mock.mockReportIssue(form) }
export async function batchReportIssues(form) { return mock.mockBatchReportIssues(form) }
export async function acceptHousehold(householdId, type) { return mock.mockAcceptHousehold(householdId, type) }
export async function getHouseholdIssues(householdId, params) { return mock.mockGetHouseholdIssues(householdId, params) }
export async function getIssueDetail(issueId) { return mock.mockGetIssueDetail(issueId) }
export async function getRectifyTasks(status) { return mock.mockGetRectifyTasks(status) }
export async function startRectify(issueId) { return mock.mockStartRectify(issueId) }
export async function submitRectify(issueId, form) { return mock.mockSubmitRectify(issueId, form) }
export async function getPendingReviews() { return mock.mockGetPendingReviews() }
export async function reviewIssue(issueId, result, opinion, signature) { return mock.mockReviewIssue(issueId, result, opinion, signature) }
export async function getIssueTimeline(issueId) { return mock.mockGetIssueTimeline(issueId) }
export async function getNotifications() { return mock.mockGetNotifications() }
export async function markNotificationRead(id) { return mock.mockMarkNotificationRead(id) }
export async function getStatistics() { return mock.mockGetStatistics() }
export async function getAllIssues(buildingId) { return mock.mockGetAllIssues(buildingId) }
export async function getEstimatedValues() { return mock.mockGetEstimatedValues() }
export async function checkOverdue() { return mock.mockCheckOverdue() }
export async function searchRectifiers(query) { return mock.mockSearchRectifiers(query) }

# Mock API 数据映射 — 分户验收小程序

> 用途：记录每个 API 的数据流向，明确哪些数据目前已 mock、未来后端需提供什么

---

## 用户认证

### `login(code)`
- **Mock 返回**：`{ token, userInfo: { id, nickname, avatar, role, roleName, phone, buildingIds } }`
- **页面消费**：store/user.js 存储 userInfo
- **后端需提供**：微信 code → openid → token + 用户信息
- **Mock 覆盖**：✅

### `getProfile()`
- **Mock 返回**：`{ id, nickname, avatar, role, roleName, phone, buildingIds }`
- **页面消费**：store/user.js → 各页面取 role/roleName
- **后端需提供**：token → 用户详情
- **Mock 覆盖**：✅

## 楼栋户数据

### `getBuildings()`
- **Mock 返回**：`{ list: [{ id, name, unitCount, totalHouseholds, floorCount }] }`
- **页面消费**：首页筛选、选户、问题库
- **后端需提供**：从楼栋表查询
- **Mock 覆盖**：✅ 11 栋

### `getUnits(buildingId)`
- **Mock 返回**：`{ list: [{ id, name, floorCount, buildingId }] }`
- **页面消费**：选户
- **Mock 覆盖**：✅

### `getHouseholds(buildingId, unitId, floor)`
- **Mock 返回**：`{ list: [{ id, name, buildingId, buildingName, unitName, floor, room, qrCode, issueCount, pendingCount, closedCount, acceptanceStatus, acceptanceStatusName }] }`
- **页面消费**：选户列表（展示 room + issueCount）
- **后端需提供**：从户表查询，关联问题统计
- **Mock 覆盖**：✅ 528 户，issueCount 动态计算

### `getHouseholdByQr(token)`
- **Mock 返回**：`{ id, name, ..., closedCount, pendingCount }`
- **页面消费**：扫码后跳转户操作中心
- **Mock 覆盖**：✅

### `getHouseholdDetail(id)`
- **Mock 返回**：`{ ...household, issues: [issue, ...] }`
- **页面消费**：household-center 展示户信息 + 问题列表
- **后端需提供**：户信息 + 关联问题列表
- **Mock 覆盖**：✅

### `getHouseholdQrcode(id)`
- **Mock 返回**：`{ qrUrl, text }`
- **页面消费**：qrcode.vue 展示二维码
- **后端需提供**：二维码图片 URL
- **Mock 覆盖**：⚠️ `qrUrl` 为空字符串，文本信息正常

## 问题上报

### `getIssuePresets(type)`
- **Mock 返回**：`{ list: [{ id, category, description }] }`
- **页面消费**：inspect.vue、report.vue、batch-report.vue
- **后端需提供**：从预设表按 type 查询
- **Mock 覆盖**：✅ 观感 21 + 实测 6 + 公区 41 = 68 项

### `reportIssue(form)`
- **Mock 入参**：`{ householdId, type, category, description, photos, deadline, remark }`
- **Mock 返回**：`{ id, status, statusName }`
- **Mock 行为**：创建 issue → 自动生成通知
- **后端需提供**：写入问题表 + 通知表，返回 id
- **Mock 覆盖**：✅

### `batchReportIssues(form)`
- **Mock 入参**：`{ householdIds, type, category, description, photos, remark }`
- **Mock 返回**：`{ importedCount, failedCount, errors }`
- **Mock 行为**：遍历 householdIds 创建 issues + 通知
- **后端需提供**：批量写入，事务保证
- **Mock 覆盖**：✅

### `acceptHousehold(householdId, type)`
- **Mock 返回**：`{ acceptanceProgress: { visual, measure, public } }`
- **页面消费**：household-center markNone 按钮
- **后端需提供**：更新户的验收进度
- **Mock 覆盖**：✅

## 问题查询

### `getHouseholdIssues(householdId, params)`
- **Mock 返回**：`{ list, total, page, pageSize }`
- **页面消费**：间接通过 getHouseholdDetail
- **Mock 覆盖**：✅

### `getIssueDetail(issueId)`
- **Mock 返回**：单条 issue 全字段：`{ id, householdId, householdName, type, typeName, category, description, status, statusName, photos, reporter, reporterId, rectifier, rectifierId, deadline, isOverdue, createdAt, updatedAt, remark }`
- **页面消费**：issue-detail.vue
- **后端需提供**：从问题表按 id 查询
- **Mock 覆盖**：✅

### `getIssueTimeline(issueId)`
- **Mock 返回**：`{ list: [{ action, actionName, operatorName, operatorRole, createdAt, detail }] }`
- **页面消费**：issue-detail.vue 时间线
- **后端需提供**：从操作日志表查询
- **Mock 覆盖**：✅ 基于 `_transitions` 数组

### `getAllIssues(buildingId)` — 新增
- **Mock 返回**：`{ list, total }`
- **页面消费**：problem-library.vue
- **后端需提供**：全量问题查询，支持 buildingId 过滤
- **Mock 覆盖**：✅

## 整改流程

### `getRectifyTasks(status)`
- **Mock 返回**：`{ list, total, page, pageSize }`
- **页面消费**：task-list.vue、index.vue
- **过滤逻辑**：管理员看全部，其他角色看指派给自己的
- **后端需提供**：按 rectifierId + status 过滤
- **Mock 覆盖**：✅

### `startRectify(issueId)`
- **Mock 行为**：status → rectifying，rectifier → 当前用户
- **Mock 返回**：`{ status, statusName }`
- **Mock 副作用**：记录 `_transitions`
- **后端需提供**：更新问题状态 + 记录操作日志
- **Mock 覆盖**：✅

### `submitRectify(issueId, form)`
- **Mock 入参**：`{ measure, photos, remark }`
- **Mock 行为**：status → pending_review
- **Mock 返回**：`{ status, statusName }`
- **Mock 副作用**：记录 `_transitions`
- **后端需提供**：更新问题 + 保存整改记录
- **Mock 覆盖**：✅

### `getPendingReviews()`
- **Mock 返回**：`{ list, total, page, pageSize }`
- **页面消费**：task-list.vue、index.vue
- **Mock 覆盖**：✅

### `reviewIssue(issueId, result, opinion, signature?)`
- **Mock 入参**：`result = 'pass'|'reject'` + `opinion` + `signature`（base64）
- **Mock 行为**：pass → closed；reject → rectifying
- **Mock 返回**：`{ status, statusName }`
- **Mock 副作用**：记录 `_transitions`
- **后端需提供**：更新问题状态 + 保存签名图片 + 记录日志
- **Mock 覆盖**：✅

## 通知

### `getNotifications()`
- **Mock 返回**：`{ list: [{ id, type, title, content, issueId, isRead, createdAt }], total, page, pageSize }`
- **页面消费**：notifications.vue、index.vue 未读数
- **后端需提供**：从通知表查询
- **Mock 覆盖**：✅ 含自动生成的派单通知

### `markNotificationRead(id)`
- **Mock 行为**：isRead = true
- **Mock 覆盖**：✅

## 统计与推算值

### `getStatistics()`
- **Mock 返回**：`{ totalHouseholds, checkedHouseholds, totalIssues, pendingCount, rectifyingCount, pendingReviewCount, closedCount, rectifyRate }`
- **页面消费**：index.vue 统计展示
- **Mock 行为**：实时计算
- **后端需提供**：聚合统计查询
- **Mock 覆盖**：✅

### `getEstimatedValues()`
- **Mock 返回**：完整推算值对象（含室内各房间 + 公区）
- **页面消费**：inspect.vue 推算值参考 + 差值判定
- **后端需提供**：按工程配置查询
- **Mock 覆盖**：✅ 26 项

### `checkOverdue()` — 新增
- **Mock 返回**：`{ list: [{ id, description, householdName, type, msg }] }`
- **页面消费**：index.vue 超期弹窗
- **Mock 行为**：遍历 issues 检测超期
- **后端需提供**：按条件查询超期数据
- **Mock 覆盖**：✅

---

## 汇总

| 类别 | API 数 | ✅ Mock 完整 | ⚠️ 部分覆盖 | ❌ 缺失 |
|------|--------|-------------|-------------|--------|
| 用户认证 | 2 | 2 | 0 | 0 |
| 楼栋户 | 6 | 5 | 1 (qrcode url) | 0 |
| 问题上报 | 4 | 4 | 0 | 0 |
| 问题查询 | 5 | 5 | 0 | 0 |
| 整改流程 | 5 | 5 | 0 | 0 |
| 通知 | 2 | 2 | 0 | 0 |
| 统计 | 3 | 3 | 0 | 0 |
| **合计** | **27** | **26** | **1** | **0** |

**结论：所有前端消费的 API 数据均已 Mock 覆盖，无缺失。**

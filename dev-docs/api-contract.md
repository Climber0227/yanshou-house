# API Contract — 分户验收小程序

前后端接口约定文档。前端（小程序/管理后台）和后端开发基于此文档并行开发。

## 基础规范

- 协议：HTTPS
- 接口风格：RESTful JSON
- 统一响应格式：
  ```json
  {
    "code": 0,
    "message": "success",
    "data": { }
  }
  ```
- 错误响应：
  ```json
  {
    "code": 1001,
    "message": "错误描述（中文，让现场人员能看懂）",
    "data": null
  }
  ```
- 鉴权方式：微信登录后后端返回 token，后续请求在 Header 中携带 `Authorization: Bearer <token>`
- 分页请求参数：`?page=1&pageSize=20`
- 分页响应格式：
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "list": [],
      "total": 100,
      "page": 1,
      "pageSize": 20
    }
  }
  ```

## 错误码约定

| code | 含义 |
|------|------|
| 0 | 成功 |
| 401 | 未登录/token 过期 |
| 403 | 无权限（角色不匹配或数据权限不足） |
| 404 | 资源不存在 |
| 400 | 参数错误 |
| 1001+ | 业务错误（具体 message 说明） |

## 状态枚举

问题状态流转：
```
pending (待整改) → rectifying (整改中) → pending_review (待复查) → closed (已闭环)
                                                                   → rectifying (退回整改)
```

| 状态值 | 中文含义 |
|--------|---------|
| pending | 待整改 |
| rectifying | 整改中 |
| pending_review | 待复查 |
| closed | 已闭环 |

验收类型：
| 类型值 | 中文含义 |
|--------|---------|
| visual | 观感 |
| measure | 实测 |
| public | 公区 |

---

## 一、认证模块

### 1.1 微信登录

```
POST /api/auth/login
```

请求：
```json
{
  "code": "wx.login() 返回的 code"
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOi...",
    "userInfo": {
      "id": "u_001",
      "nickname": "张三",
      "avatar": "https://...",
      "role": "inspector",
      "roleName": "查验员"
    }
  }
}
```

### 1.2 获取当前用户信息

```
GET /api/auth/profile
```

响应：
```json
{
  "code": 0,
  "data": {
    "id": "u_001",
    "nickname": "张三",
    "avatar": "https://...",
    "role": "inspector",
    "roleName": "查验员",
    "phone": "138****1234"
  }
}
```

---

## 二、楼栋与户码管理

### 2.1 获取楼栋列表

```
GET /api/buildings
```

响应：
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "b_001",
        "name": "2#楼",
        "unitCount": 2,
        "totalHouseholds": 48
      }
    ]
  }
}
```

### 2.2 获取某楼栋下的单元列表

```
GET /api/buildings/:buildingId/units
```

响应：
```json
{
  "code": 0,
  "data": {
    "list": [
      { "id": "unit_001", "name": "西单元", "floorCount": 12 },
      { "id": "unit_002", "name": "东单元", "floorCount": 12 }
    ]
  }
}
```

### 2.3 获取某单元下的楼层列表

```
GET /api/units/:unitId/floors
```

响应：
```json
{
  "code": 0,
  "data": {
    "list": [
      { "floor": 1, "householdCount": 2 },
      { "floor": 2, "householdCount": 2 }
    ]
  }
}
```

### 2.4 获取某楼层下的户列表

```
GET /api/floors/:floorId/households
```

参数：`buildingId`, `unitId`, `floor`

响应：
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "h_001",
        "name": "2#楼西单元1层西户",
        "buildingName": "2#楼",
        "unitName": "西单元",
        "floor": 1,
        "room": "西户",
        "qrCode": "https://.../qr/h_001.png",
        "issueCount": 3,
        "pendingCount": 1
      }
    ]
  }
}
```

### 2.5 扫码获取户信息

```
GET /api/households/qr/:qrCodeToken
```

响应：
```json
{
  "code": 0,
  "data": {
    "id": "h_001",
    "name": "2#楼西单元1层西户",
    "buildingName": "2#楼",
    "unitName": "西单元",
    "floor": 1,
    "room": "西户",
    "issueCount": 3,
    "pendingCount": 1,
    "closedCount": 2
  }
}
```

### 2.6 获取户详情（一户一档）

```
GET /api/households/:householdId
```

响应：
```json
{
  "code": 0,
  "data": {
    "id": "h_001",
    "name": "2#楼西单元1层西户",
    "buildingName": "2#楼",
    "unitName": "西单元",
    "floor": 1,
    "room": "西户",
    "issues": [
      {
        "id": "iss_001",
        "type": "visual",
        "typeName": "观感",
        "category": "墙面",
        "description": "东墙墙面空鼓",
        "status": "pending",
        "statusName": "待整改",
        "photos": ["https://..."],
        "reporter": "张三",
        "createdAt": "2026-07-11T10:00:00Z"
      }
    ],
    "acceptanceStatus": "pending",
    "acceptanceStatusName": "验收中"
  }
}
```

### 2.7 获取户的二维码（带文字信息）

```
GET /api/households/:householdId/qrcode
```

响应：返回二维码图片（PNG），图片下方包含楼号、单元号、房号等文字信息。

### 2.8 批量导入楼栋数据（管理后台）

```
POST /api/admin/buildings/import
```

Content-Type: multipart/form-data

请求：上传 Excel 文件

响应：
```json
{
  "code": 0,
  "message": "导入成功",
  "data": {
    "importedCount": 528,
    "failedCount": 0,
    "errors": []
  }
}
```

---

## 三、问题上报

### 3.1 获取问题预设列表

```
GET /api/issues/presets?type=visual
```

参数：type = visual | measure | public

响应：
```json
{
  "code": 0,
  "data": {
    "list": [
      { "id": "pre_001", "category": "墙面", "description": "墙面空鼓" },
      { "id": "pre_002", "category": "墙面", "description": "墙面开裂" },
      { "id": "pre_003", "category": "地面", "description": "地面起砂" }
    ]
  }
}
```

### 3.2 上报问题

```
POST /api/issues
```

Content-Type: multipart/form-data

请求：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| householdId | string | 是 | 户 ID |
| type | string | 是 | visual / measure / public |
| category | string | 是 | 问题分类（墙面、地面、顶棚等） |
| description | string | 是 | 问题描述 |
| photos | file[] | 是 | 照片（至少1张，最多9张） |
| video | file | 否 | 视频 |
| voiceNote | file | 否 | 语音备注 |
| remark | string | 否 | 文字备注 |
| rectifyDeadline | string | 否 | 整改期限（ISO 日期） |

响应：
```json
{
  "code": 0,
  "message": "上报成功",
  "data": {
    "id": "iss_001",
    "status": "pending",
    "statusName": "待整改"
  }
}
```

### 3.3 批量上报（同类问题多户复选）

```
POST /api/issues/batch
```

请求：
```json
{
  "householdIds": ["h_001", "h_002", "h_003"],
  "type": "visual",
  "category": "墙面",
  "description": "地面开裂",
  "photos": ["已上传的照片 ID 列表"],
  "remark": ""
}
```

### 3.4 无问题上报（该户验收通过）

```
POST /api/households/:householdId/accept
```

请求：
```json
{
  "type": "visual",
  "noIssue": true
}
```

响应：
```json
{
  "code": 0,
  "message": "该户此项验收通过",
  "data": {
    "acceptanceProgress": {
      "visual": "passed",
      "measure": "pending",
      "public": "pending"
    }
  }
}
```

### 3.5 获取某户的问题列表

```
GET /api/households/:householdId/issues?status=pending&type=visual&page=1&pageSize=20
```

### 3.6 获取问题详情

```
GET /api/issues/:issueId
```

响应包含问题基本信息 + 整改记录 + 复查记录。

---

## 四、整改流程

### 4.1 获取我的整改任务列表（整改员视角）

```
GET /api/rectify/tasks?status=pending,rectifying&page=1&pageSize=20
```

响应：
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "iss_001",
        "householdName": "2#楼西单元1层西户",
        "typeName": "观感",
        "category": "墙面",
        "description": "东墙墙面空鼓",
        "status": "pending",
        "statusName": "待整改",
        "reporterName": "张三",
        "createdAt": "2026-07-11T10:00:00Z",
        "deadline": "2026-07-13T10:00:00Z",
        "isOverdue": false
      }
    ]
  }
}
```

### 4.2 开始整改（接收任务）

```
PUT /api/issues/:issueId/rectify/start
```

响应：
```json
{
  "code": 0,
  "message": "已开始整改",
  "data": {
    "status": "rectifying",
    "statusName": "整改中"
  }
}
```

### 4.3 提交整改结果

```
POST /api/issues/:issueId/rectify/submit
```

Content-Type: multipart/form-data

请求：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| photos | file[] | 是 | 整改后照片（至少1张） |
| measure | string | 是 | 整改措施描述 |
| remark | string | 否 | 备注 |

响应：
```json
{
  "code": 0,
  "message": "整改结果已提交，等待复查",
  "data": {
    "status": "pending_review",
    "statusName": "待复查"
  }
}
```

### 4.4 获取待复查列表（查验员/监理视角）

```
GET /api/review/pending?page=1&pageSize=20
```

### 4.5 复查确认

```
POST /api/issues/:issueId/review
```

请求：
```json
{
  "result": "pass",
  "opinion": "整改合格，同意闭环",
  "signature": "电子签名图片 ID（可选）"
}
```

result 取值：`pass`（合格） / `reject`（不合格，退回整改）

响应（合格时）：
```json
{
  "code": 0,
  "message": "复查通过，已闭环",
  "data": {
    "status": "closed",
    "statusName": "已闭环"
  }
}
```

响应（不合格时）：
```json
{
  "code": 0,
  "message": "复查不通过，已退回整改",
  "data": {
    "status": "rectifying",
    "statusName": "整改中"
  }
}
```

### 4.6 获取问题操作记录

```
GET /api/issues/:issueId/timeline
```

响应：
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "action": "reported",
        "actionName": "上报问题",
        "operatorName": "张三",
        "operatorRole": "查验员",
        "createdAt": "2026-07-11T10:00:00Z",
        "detail": {}
      },
      {
        "action": "rectify_started",
        "actionName": "开始整改",
        "operatorName": "李四",
        "operatorRole": "整改员",
        "createdAt": "2026-07-11T11:00:00Z",
        "detail": {}
      }
    ]
  }
}
```

---

## 五、通知

### 5.1 获取我的通知列表

```
GET /api/notifications?page=1&pageSize=20
```

### 5.2 标记通知已读

```
PUT /api/notifications/:notificationId/read
```

---

## 六、管理后台（管理员权限）

### 6.1 人员管理列表

```
GET /api/admin/users?role=inspector&buildingId=b_001&page=1&pageSize=20
```

### 6.2 添加/编辑人员

```
POST /api/admin/users
PUT /api/admin/users/:userId
```

请求：
```json
{
  "nickname": "张三",
  "phone": "13800000000",
  "role": "inspector",
  "buildingIds": ["b_001", "b_002"],
  "remark": ""
}
```

### 6.3 问题总览列表

```
GET /api/admin/issues?buildingId=b_001&status=pending&type=visual&page=1&pageSize=20
```

### 6.4 数据导出

```
GET /api/admin/export/visual?buildingId=b_001
GET /api/admin/export/measure?buildingId=b_001
GET /api/admin/export/public?buildingId=b_001
GET /api/admin/export/summary?buildingId=b_001
```

响应：返回 Excel 或 Word 文件（格式严格按照需求文档附件1-5）。

### 6.5 统计概览

```
GET /api/admin/statistics
```

响应：
```json
{
  "code": 0,
  "data": {
    "totalHouseholds": 528,
    "checkedHouseholds": 120,
    "totalIssues": 345,
    "rectifiedCount": 200,
    "rectifyRate": 0.58,
    "closedCount": 150
  }
}
```

---

## 七、角色权限矩阵

| 接口 | 管理员 | 查验员 | 整改员 | 业主（未来） |
|------|--------|--------|--------|-------------|
| 楼栋数据管理 | ✅ | ❌ | ❌ | ❌ |
| 扫码查户 | ✅ | ✅ | ✅ | ✅(未来) |
| 问题上报 | ✅ | ✅ | ❌ | ❌ |
| 查看问题列表 | ✅(全部) | ✅(自己上报的) | ❌ | ❌ |
| 整改任务 | ✅(全部) | ❌ | ✅(分配给自己) | ❌ |
| 复查确认 | ✅ | ✅(自己上报的) | ❌ | ❌ |
| 人员管理 | ✅ | ❌ | ❌ | ❌ |
| 数据导出 | ✅ | ❌ | ❌ | ❌ |
| 一户一档查看 | ✅ | ✅ | ✅(自己整改的) | ✅(自己的房) |

---

## 未确认事项（需与后端老师对齐）

- [ ] 图片/视频存储方案（OSS 类型和上传方式）
- [ ] 微信小程序 AppID 和 AppSecret 配置
- [ ] 通知推送方式（小程序订阅消息 or 短信）
- [ ] 二维码生成方案（后端生成 or 使用第三方服务）
- [ ] 离线暂存的数据同步策略
- [ ] 电子签名的技术方案
- [ ] Excel/Word 导出模板格式（需严格匹配附件）

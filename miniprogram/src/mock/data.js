// Mock 数据源
// 所有数据与 API 合同一致，覆盖正常、空列表、错误三种场景

// ========== 用户 ==========
const mockUsers = {
  'u_001': { id: 'u_001', nickname: '张查验', avatar: '', role: 'inspector', roleName: '查验员', phone: '13800001001', buildingIds: ['b_001', 'b_002'] },
  'u_002': { id: 'u_002', nickname: '李整改', avatar: '', role: 'rectifier', roleName: '整改员', phone: '13800001002', buildingIds: ['b_001'] },
  'u_003': { id: 'u_003', nickname: '王监理', avatar: '', role: 'supervisor', roleName: '监理', phone: '13800001003', buildingIds: ['b_001', 'b_002', 'b_003'] },
  'u_004': { id: 'u_004', nickname: '赵管理', avatar: '', role: 'admin', roleName: '管理员', phone: '13800001004', buildingIds: ['b_001', 'b_002', 'b_003', 'b_004'] },
  'u_005': { id: 'u_005', nickname: '陈建工', avatar: '', role: 'rectifier', roleName: '整改员', phone: '13800001005', buildingIds: ['b_002', 'b_003'] },
  'u_006': { id: 'u_006', nickname: '刘施工', avatar: '', role: 'rectifier', roleName: '整改员', phone: '13800001006', buildingIds: ['b_004', 'b_005'] },
  'u_007': { id: 'u_007', nickname: '吴装饰', avatar: '', role: 'rectifier', roleName: '整改员', phone: '13800001007', buildingIds: ['b_001', 'b_004'] },
  'u_008': { id: 'u_008', nickname: '周安装', avatar: '', role: 'rectifier', roleName: '整改员', phone: '13800001008', buildingIds: ['b_003', 'b_005'] }
}

// ========== 楼栋 ==========
const mockBuildings = [
  { id: 'b_001', name: '1#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_002', name: '2#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_003', name: '3#楼', unitCount: 3, totalHouseholds: 72, floorCount: 12 },
  { id: 'b_004', name: '4#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_005', name: '5#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_006', name: '6#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_007', name: '7#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_008', name: '8#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_009', name: '9#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_010', name: '10#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_011', name: '11#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 }
]

const mockUnits = {
  'b_001': [
    { id: 'unit_b001_01', name: '西单元', floorCount: 12, buildingId: 'b_001' },
    { id: 'unit_b001_02', name: '东单元', floorCount: 12, buildingId: 'b_001' }
  ],
  'b_002': [
    { id: 'unit_b002_01', name: '西单元', floorCount: 12, buildingId: 'b_002' },
    { id: 'unit_b002_02', name: '东单元', floorCount: 12, buildingId: 'b_002' }
  ],
  'b_003': [
    { id: 'unit_b003_01', name: '一单元', floorCount: 12, buildingId: 'b_003' },
    { id: 'unit_b003_02', name: '二单元', floorCount: 12, buildingId: 'b_003' },
    { id: 'unit_b003_03', name: '三单元', floorCount: 12, buildingId: 'b_003' }
  ],
  'b_004': [
    { id: 'unit_b004_01', name: '西单元', floorCount: 12, buildingId: 'b_004' },
    { id: 'unit_b004_02', name: '东单元', floorCount: 12, buildingId: 'b_004' }
  ],
  'b_005': [
    { id: 'unit_b005_01', name: '西单元', floorCount: 12, buildingId: 'b_005' },
    { id: 'unit_b005_02', name: '东单元', floorCount: 12, buildingId: 'b_005' }
  ],
  'b_006': [
    { id: 'unit_b006_01', name: '西单元', floorCount: 12, buildingId: 'b_006' },
    { id: 'unit_b006_02', name: '东单元', floorCount: 12, buildingId: 'b_006' }
  ],
  'b_007': [
    { id: 'unit_b007_01', name: '西单元', floorCount: 12, buildingId: 'b_007' },
    { id: 'unit_b007_02', name: '东单元', floorCount: 12, buildingId: 'b_007' }
  ],
  'b_008': [
    { id: 'unit_b008_01', name: '西单元', floorCount: 12, buildingId: 'b_008' },
    { id: 'unit_b008_02', name: '东单元', floorCount: 12, buildingId: 'b_008' }
  ],
  'b_009': [
    { id: 'unit_b009_01', name: '西单元', floorCount: 12, buildingId: 'b_009' },
    { id: 'unit_b009_02', name: '东单元', floorCount: 12, buildingId: 'b_009' }
  ],
  'b_010': [
    { id: 'unit_b010_01', name: '西单元', floorCount: 12, buildingId: 'b_010' },
    { id: 'unit_b010_02', name: '东单元', floorCount: 12, buildingId: 'b_010' }
  ],
  'b_011': [
    { id: 'unit_b011_01', name: '西单元', floorCount: 12, buildingId: 'b_011' },
    { id: 'unit_b011_02', name: '东单元', floorCount: 12, buildingId: 'b_011' }
  ]
}

const padB = (n) => String(n).padStart(3, '0')

// 楼栋单元标签映射
const unitLabels = {
  'b_001': ['西', '东'],
  'b_002': ['西', '东'],
  'b_003': ['一', '二', '三'],
  'b_004': ['西', '东'],
  'b_005': ['西', '东'],
  'b_006': ['西', '东'],
  'b_007': ['西', '东'],
  'b_008': ['西', '东'],
  'b_009': ['西', '东'],
  'b_010': ['西', '东'],
  'b_011': ['西', '东']
}

const mockHouseholds = []
for (let b = 1; b <= 11; b++) {
  const bId = `b_${padB(b)}`
  const labels = unitLabels[bId] || ['西', '东']
  const uCount = labels.length
  for (let u = 0; u < uCount; u++) {
    const unitId = `unit_b${padB(b)}_0${u + 1}`
    for (let f = 1; f <= 12; f++) {
      for (let r = 0; r < 2; r++) {
        const roomNum = f * 100 + r + 1
        const unitLabel = labels[u]
        const id = `h_${b}${u}${f}${r}`
        mockHouseholds.push({
          id,
          name: `${b}#楼${unitLabel}单元${f}层${roomNum}室`,
          buildingId: bId,
          buildingName: `${b}#楼`,
          unitId,
          unitName: `${unitLabel}单元`,
          floor: f,
          room: `${roomNum}室`,
          qrCode: '',
          issueCount: 0,
          pendingCount: 0,
          closedCount: 0,
          acceptanceStatus: 'pending',
          acceptanceStatusName: '验收中',
          inspectionStatus: { visual: 'pending', measure: 'pending', public: 'pending' }
        })
      }
    }
  }
}

// ========== 问题预设 ==========
const issuePresets = {
  visual: [
    { id: 'pre_v_001', category: '墙面', description: '墙面空鼓' },
    { id: 'pre_v_002', category: '墙面', description: '墙面开裂' },
    { id: 'pre_v_003', category: '墙面', description: '墙面起砂' },
    { id: 'pre_v_004', category: '墙面', description: '阴阳角不顺直' },
    { id: 'pre_v_005', category: '地面', description: '地面起砂' },
    { id: 'pre_v_006', category: '地面', description: '地面空鼓' },
    { id: 'pre_v_007', category: '地面', description: '地面裂缝' },
    { id: 'pre_v_008', category: '顶棚', description: '顶棚爆灰' },
    { id: 'pre_v_009', category: '顶棚', description: '顶棚不平整' },
    { id: 'pre_v_010', category: '门窗', description: '门窗开启不灵活' },
    { id: 'pre_v_011', category: '门窗', description: '框边封堵不密实' },
    { id: 'pre_v_012', category: '门窗', description: '玻璃划痕破损' },
    { id: 'pre_v_013', category: '门窗', description: '入户门安装不牢固' },
    { id: 'pre_v_014', category: '防水', description: '厨卫渗漏' },
    { id: 'pre_v_015', category: '防水', description: '阳台防水不到位' },
    { id: 'pre_v_016', category: '给排水', description: '水管接口渗漏' },
    { id: 'pre_v_017', category: '给排水', description: '地漏预留不准' },
    { id: 'pre_v_018', category: '电气', description: '开关插座预留不准' },
    { id: 'pre_v_019', category: '电气', description: '强弱电箱不规范' },
    { id: 'pre_v_020', category: '防护', description: '栏杆高度不达标' },
    { id: 'pre_v_021', category: '防护', description: '竖杆间距过大' }
  ],
  measure: [
    { id: 'pre_m_001', category: '净高', description: '室内净高不足' },
    { id: 'pre_m_002', category: '净高', description: '净高偏差超规范' },
    { id: 'pre_m_003', category: '开间', description: '净开间偏差超规范' },
    { id: 'pre_m_004', category: '进深', description: '净进深偏差超规范' },
    { id: 'pre_m_005', category: '洞口', description: '门窗洞口尺寸偏差' },
    { id: 'pre_m_006', category: '洞口', description: '入户门洞口偏差' }
  ],
  public: [
    { id: 'pre_p_001', category: '楼梯', description: '梯段宽度不足' },
    { id: 'pre_p_002', category: '楼梯', description: '踏步破损' },
    { id: 'pre_p_003', category: '楼梯', description: '扶手松动' },
    { id: 'pre_p_004', category: '楼梯', description: '防滑不到位' },
    { id: 'pre_p_005', category: '电梯', description: '洞口宽度不足' },
    { id: 'pre_p_006', category: '走廊', description: '走廊宽度不足' },
    { id: 'pre_p_007', category: '走廊', description: '走廊高度不足' },
    { id: 'pre_p_008', category: '垂直平整', description: '垂直度偏差' },
    { id: 'pre_p_009', category: '垂直平整', description: '平整度偏差' },
    { id: 'pre_p_010', category: '墙面', description: '公区墙面空鼓' },
    { id: 'pre_p_011', category: '墙面', description: '墙面开裂' },
    { id: 'pre_p_012', category: '墙面', description: '涂料脱落' },
    { id: 'pre_p_013', category: '墙面', description: '瓷砖空鼓' },
    { id: 'pre_p_014', category: '墙面', description: '阴阳角不方正' },
    { id: 'pre_p_015', category: '地面', description: '公区地面破损' },
    { id: 'pre_p_016', category: '地面', description: '地面空鼓' },
    { id: 'pre_p_017', category: '地面', description: '水泥起砂' },
    { id: 'pre_p_018', category: '地面', description: '缝隙不均' },
    { id: 'pre_p_019', category: '顶棚', description: '吊顶不平整' },
    { id: 'pre_p_020', category: '顶棚', description: '吊顶变形' },
    { id: 'pre_p_021', category: '顶棚', description: '顶棚开裂' },
    { id: 'pre_p_022', category: '门窗', description: '门窗不灵活' },
    { id: 'pre_p_023', category: '门窗', description: '密封不严' },
    { id: 'pre_p_024', category: '门窗', description: '门窗渗漏' },
    { id: 'pre_p_025', category: '机电照明', description: '灯具不全' },
    { id: 'pre_p_026', category: '机电照明', description: '开关故障' },
    { id: 'pre_p_027', category: '机电照明', description: '应急照明不亮' },
    { id: 'pre_p_028', category: '消防设施', description: '消火栓缺失' },
    { id: 'pre_p_029', category: '消防设施', description: '灭火器缺失' },
    { id: 'pre_p_030', category: '消防设施', description: '消防标识不全' },
    { id: 'pre_p_031', category: '标识', description: '楼层牌缺失' },
    { id: 'pre_p_032', category: '标识', description: '疏散标识不全' },
    { id: 'pre_p_033', category: '观感', description: '成品保护破损' },
    { id: 'pre_p_034', category: '观感', description: '墙面污染' },
    { id: 'pre_p_035', category: '屋面', description: '屋面防水破坏' },
    { id: 'pre_p_036', category: '屋面', description: '排水不畅' },
    { id: 'pre_p_037', category: '屋面', description: '屋面渗漏' },
    { id: 'pre_p_038', category: '屋面', description: '避雷设施破损' },
    { id: 'pre_p_039', category: '地下室', description: '地下室渗漏' },
    { id: 'pre_p_040', category: '地下室', description: '返潮' },
    { id: 'pre_p_041', category: '地下室', description: '桥架管线不规整' }
  ]
}

// ========== 问题实例 ==========
const now = new Date()
const mockIssues = [
  {
    id: 'iss_001',
    householdId: 'h_1010',
    householdName: '1#楼西单元1层101室',
    type: 'visual', typeName: '观感',
    category: '墙面',
    description: '东墙墙面空鼓',
    status: 'pending', statusName: '待整改',
    photos: [],
    reporter: '张查验', reporterId: 'u_001',
    rectifier: '李整改', rectifierId: 'u_002', rectifierPhone: '13800001002',
    deadline: new Date(now.getTime() - 86400000).toISOString(),
    isOverdue: true,
    createdAt: new Date(now.getTime() - 172800000).toISOString(),
    updatedAt: new Date(now.getTime() - 86400000).toISOString(),
    remark: ''
  },
  {
    id: 'iss_002',
    householdId: 'h_1020',
    householdName: '1#楼西单元2层201室',
    type: 'measure', typeName: '实测',
    category: '净高',
    description: '客厅净高偏差8mm',
    status: 'rectifying', statusName: '整改中',
    photos: [],
    reporter: '张查验', reporterId: 'u_001',
    rectifier: '李整改', rectifierId: 'u_002',
    deadline: new Date(now.getTime() + 86400000).toISOString(),
    isOverdue: false,
    createdAt: new Date(now.getTime() - 259200000).toISOString(),
    updatedAt: new Date(now.getTime() - 43200000).toISOString(),
    remark: ''
  },
  {
    id: 'iss_003',
    householdId: 'h_1030',
    householdName: '1#楼西单元3层301室',
    type: 'public', typeName: '公区',
    category: '消防',
    description: '灭火器缺失',
    status: 'pending_review', statusName: '待复查',
    photos: [],
    reporter: '张查验', reporterId: 'u_001',
    rectifier: '李整改', rectifierId: 'u_002',
    deadline: new Date(now.getTime() - 43200000).toISOString(),
    isOverdue: true,
    createdAt: new Date(now.getTime() - 345600000).toISOString(),
    updatedAt: new Date(now.getTime() - 21600000).toISOString(),
    remark: '已更换灭火器'
  },
  {
    id: 'iss_004',
    householdId: 'h_1010',
    householdName: '1#楼西单元1层101室',
    type: 'visual', typeName: '观感',
    category: '门窗',
    description: '主卧窗玻璃划痕',
    status: 'closed', statusName: '已闭环',
    photos: [],
    reporter: '张查验', reporterId: 'u_001',
    rectifier: '李整改', rectifierId: 'u_002',
    deadline: new Date(now.getTime() - 604800000).toISOString(),
    isOverdue: false,
    createdAt: new Date(now.getTime() - 864000000).toISOString(),
    updatedAt: new Date(now.getTime() - 432000000).toISOString(),
    remark: '已更换玻璃'
  },
  {
    id: 'iss_005',
    householdId: 'h_1011',
    householdName: '1#楼西单元1层102室',
    type: 'visual', typeName: '观感',
    category: '地面',
    description: '客厅地面开裂',
    status: 'pending', statusName: '待整改',
    photos: [],
    reporter: '王监理', reporterId: 'u_003',
    rectifier: '',
    deadline: new Date(now.getTime() + 172800000).toISOString(),
    isOverdue: false,
    createdAt: new Date(now.getTime() - 3600000).toISOString(),
    updatedAt: new Date(now.getTime() - 3600000).toISOString(),
    remark: ''
  },
  {
    id: 'iss_006',
    householdId: 'h_1030',
    householdName: '1#楼西单元3层301室',
    type: 'visual', typeName: '观感',
    category: '墙面',
    description: '北墙墙面开裂',
    status: 'rectifying', statusName: '整改中',
    photos: [],
    reporter: '张查验', reporterId: 'u_001',
    rectifier: '李整改', rectifierId: 'u_002',
    deadline: new Date(now.getTime() - 43200000).toISOString(),
    isOverdue: true,
    createdAt: new Date(now.getTime() - 432000000).toISOString(),
    updatedAt: new Date(now.getTime() - 86400000).toISOString(),
    remark: ''
  }
]

// ========== 通知 ==========
const mockNotifications = [
  { id: 'not_001', type: 'assign', title: '新整改任务', content: '1#楼西单元1层101室 - 墙面空鼓已指派给你', issueId: 'iss_001', isRead: false, createdAt: new Date(now.getTime() - 3600000).toISOString() },
  { id: 'not_002', type: 'review', title: '待复查提醒', content: '1#楼西单元3层301室 - 灭火器缺失已整改完成，请复查', issueId: 'iss_003', isRead: false, createdAt: new Date(now.getTime() - 7200000).toISOString() },
  { id: 'not_003', type: 'overdue', title: '超期提醒', content: '1#楼西单元1层101室 - 墙面空鼓已超期2天', issueId: 'iss_001', isRead: true, createdAt: new Date(now.getTime() - 86400000).toISOString() },
  { id: 'not_004', type: 'closed', title: '问题已闭环', content: '1#楼西单元1层101室 - 主卧窗玻璃划痕已完成闭环', issueId: 'iss_004', isRead: true, createdAt: new Date(now.getTime() - 432000000).toISOString() }
]

// ========== 推算值（公区实测基准值 + 户内实测推算值，后端预设） ==========
const mockEstimatedValues = {
  // 楼梯
  stair_width: 1200,
  platform_width: 1270,
  platform_height: 2800,
  // 电梯
  elevator_door_width: 1100,
  // 走道
  elevator_lobby_width: 2300,
  elevator_lobby_height: 2790,
  corridor_width: 2500,
  corridor_height: 2790,
  // 垂直度/平整度（无固定推算值，由验收规范判定）
  verticality_1: null,
  verticality_2: null,
  flatness_1: null,
  flatness_2: null,
  // ===== 室内部位推算值（按附件2实测表） =====
  // 净高度（mm）
  living_height: 2850,
  master_bedroom_height: 2850,
  master_bath_height: 2800,
  bathroom_height: 2800,
  kitchen_height: 2800,
  west_bedroom_height: 2850,
  east_bedroom_height: 2850,
  south_bedroom_height: 2850,
  // 开间（mm）
  living_width: 4200,
  master_bedroom_width: 3600,
  master_bath_width: 1800,
  bathroom_width: 1800,
  kitchen_width: 2400,
  west_bedroom_width: 3300,
  east_bedroom_width: 3300,
  south_bedroom_width: 3300,
  // 进深（mm）
  living_depth: 6000,
  master_bedroom_depth: 4800,
  master_bath_depth: 2400,
  bathroom_depth: 2400,
  kitchen_depth: 3600,
  west_bedroom_depth: 4200,
  east_bedroom_depth: 4200,
  south_bedroom_depth: 4200,
  // 门窗洞口（mm）
  door_entrance: 1000,
  window_living: 1800,
  door_master_bedroom: 900,
  window_master_bedroom: 1500,
  door_master_bath: 800,
  window_master_bath: 600
}

// ========== 统计 ==========
const mockStatistics = {
  totalHouseholds: 528,
  checkedHouseholds: 127,
  totalIssues: 345,
  pendingCount: 18,
  rectifyingCount: 25,
  pendingReviewCount: 7,
  closedCount: 150,
  rectifyRate: 0.58
}

export default {
  mockUsers,
  mockBuildings,
  mockUnits,
  mockHouseholds,
  issuePresets,
  mockIssues,
  mockNotifications,
  mockStatistics,
  mockEstimatedValues
}

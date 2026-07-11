// Mock 数据源
// 所有数据与 API 合同一致，覆盖正常、空列表、错误三种场景

// ========== 用户 ==========
const mockUsers = {
  'u_001': { id: 'u_001', nickname: '张查验', avatar: '', role: 'inspector', roleName: '查验员', phone: '13800001001', buildingIds: ['b_001', 'b_002'] },
  'u_002': { id: 'u_002', nickname: '李整改', avatar: '', role: 'rectifier', roleName: '整改员', phone: '13800001002', buildingIds: ['b_001'] },
  'u_003': { id: 'u_003', nickname: '王监理', avatar: '', role: 'supervisor', roleName: '监理', phone: '13800001003', buildingIds: ['b_001', 'b_002', 'b_003'] },
  'u_004': { id: 'u_004', nickname: '赵管理', avatar: '', role: 'admin', roleName: '管理员', phone: '13800001004', buildingIds: ['b_001', 'b_002', 'b_003', 'b_004'] }
}

// ========== 楼栋 ==========
const mockBuildings = [
  { id: 'b_001', name: '1#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_002', name: '2#楼', unitCount: 2, totalHouseholds: 48, floorCount: 12 },
  { id: 'b_003', name: '3#楼', unitCount: 3, totalHouseholds: 72, floorCount: 12 }
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
  ]
}

const mockHouseholds = []
for (let b = 1; b <= 2; b++) {
  for (let u = 0; u < 2; u++) {
    for (let f = 1; f <= 6; f++) {
      for (let r = 0; r < 2; r++) {
        const id = `h_${b}${u}${f}${r}`
        mockHouseholds.push({
          id,
          name: `${b}#楼${u === 0 ? '西' : '东'}单元${f}层${r === 0 ? '西' : '东'}户`,
          buildingId: `b_00${b}`,
          buildingName: `${b}#楼`,
          unitName: `${u === 0 ? '西' : '东'}单元`,
          floor: f,
          room: r === 0 ? '西户' : '东户',
          qrCode: '',
          issueCount: Math.floor(Math.random() * 8),
          pendingCount: 0,
          closedCount: 0,
          acceptanceStatus: Math.random() > 0.6 ? 'completed' : 'pending',
          acceptanceStatusName: Math.random() > 0.6 ? '已完成' : '验收中'
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
    { id: 'pre_p_004', category: '走廊', description: '走廊宽度不足' },
    { id: 'pre_p_005', category: '墙面', description: '公区墙面空鼓' },
    { id: 'pre_p_006', category: '地面', description: '公区地面破损' },
    { id: 'pre_p_007', category: '顶棚', description: '吊顶变形' },
    { id: 'pre_p_008', category: '消防', description: '消防设施缺失' },
    { id: 'pre_p_009', category: '照明', description: '应急照明不亮' },
    { id: 'pre_p_010', category: '标识', description: '疏散标识缺失' }
  ]
}

// ========== 问题实例 ==========
const now = new Date()
const mockIssues = [
  {
    id: 'iss_001',
    householdId: 'h_001',
    householdName: '1#楼西单元1层西户',
    type: 'visual', typeName: '观感',
    category: '墙面',
    description: '东墙墙面空鼓',
    status: 'pending', statusName: '待整改',
    photos: [],
    reporter: '张查验', reporterId: 'u_001',
    rectifier: '李整改', rectifierId: 'u_002',
    deadline: new Date(now.getTime() - 86400000).toISOString(),
    isOverdue: true,
    createdAt: new Date(now.getTime() - 172800000).toISOString(),
    updatedAt: new Date(now.getTime() - 86400000).toISOString(),
    remark: ''
  },
  {
    id: 'iss_002',
    householdId: 'h_003',
    householdName: '1#楼西单元2层西户',
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
    householdId: 'h_005',
    householdName: '1#楼西单元3层西户',
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
    householdId: 'h_001',
    householdName: '1#楼西单元1层西户',
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
    householdId: 'h_002',
    householdName: '1#楼西单元1层东户',
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
    householdId: 'h_005',
    householdName: '1#楼西单元3层西户',
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
  { id: 'not_001', type: 'assign', title: '新整改任务', content: '1#楼西单元1层西户 - 墙面空鼓已指派给你', issueId: 'iss_001', isRead: false, createdAt: new Date(now.getTime() - 3600000).toISOString() },
  { id: 'not_002', type: 'review', title: '待复查提醒', content: '1#楼西单元3层西户 - 灭火器缺失已整改完成，请复查', issueId: 'iss_003', isRead: false, createdAt: new Date(now.getTime() - 7200000).toISOString() },
  { id: 'not_003', type: 'overdue', title: '超期提醒', content: '1#楼西单元1层西户 - 墙面空鼓已超期2天', issueId: 'iss_001', isRead: true, createdAt: new Date(now.getTime() - 86400000).toISOString() },
  { id: 'not_004', type: 'closed', title: '问题已闭环', content: '1#楼西单元1层西户 - 主卧窗玻璃划痕已完成闭环', issueId: 'iss_004', isRead: true, createdAt: new Date(now.getTime() - 432000000).toISOString() }
]

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
  mockStatistics
}

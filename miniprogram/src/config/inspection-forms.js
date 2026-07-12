// 三张附表 JSON 配置 — 驱动检查表单动态渲染
// 附件1《观感表》/ 附件2《实测表》/ 附件3《公区表》

export const INSPECTION_FORMS = {
  // ==================== 附件1：观感表 ====================
  visual: {
    title: '住宅工程质量分户验收记录表（观感）',
    type: 'visual',
    items: [
      { id: 'v_01', name: '墙面', desc: '墙面平整、无大面积空鼓、开裂、起砂；阴阳角顺直。',
        presets: ['墙面空鼓', '墙面开裂', '墙面起砂', '阴阳角不顺直'] },
      { id: 'v_02', name: '地面', desc: '地面基层坚实、无起砂、裂缝、空鼓；厨卫找坡合理、无积水隐患。',
        presets: ['地面起砂', '地面空鼓', '地面裂缝', '地面积水'] },
      { id: 'v_03', name: '顶棚', desc: '顶棚平整、洁净、无爆灰。',
        presets: ['顶棚爆灰', '顶棚不平整', '顶棚开裂'] },
      { id: 'v_04', name: '门窗工程', desc: '外窗、入户门安装牢固，开启灵活；框边封堵密实、完整，无渗水，玻璃无划痕破损。',
        presets: ['门窗开启不灵活', '框边封堵不密实', '玻璃划痕破损', '渗水', '安装不牢固'] },
      { id: 'v_05', name: '防水工程', desc: '厨卫、阳台防水施工完整；24h闭水试验无渗漏；管根、阴角加强到位。',
        presets: ['厨卫渗漏', '阳台防水不到位', '管根防水不到位'] },
      { id: 'v_06', name: '给水系统', desc: '水管预埋到位，打压合格；接口无渗漏，预留点位准确。',
        presets: ['水管接口渗漏', '打压不合格', '预留点位不准'] },
      { id: 'v_07', name: '排水系统', desc: '排水立管、地漏预留准确；管道固定牢固，无破损、堵塞，通球试验合格。',
        presets: ['地漏预留不准', '管道破损', '管道堵塞', '通球不合格'] },
      { id: 'v_08', name: '强电工程', desc: '强弱电箱安装规范、回路标识清晰；插座、开关底盒预留位置准确，接地可靠。',
        presets: ['电箱安装不规范', '回路标识不清', '插座位置不准', '接地不可靠'] },
      { id: 'v_09', name: '弱电工程', desc: '网络、电视、对讲等管线预埋齐全，箱体预留到位。',
        presets: ['管线预埋不全', '箱体预留不到位'] },
      { id: 'v_10', name: '阳台防护', desc: '栏杆安装牢固，高度、竖杆间距满足规范，无安全隐患。',
        presets: ['栏杆高度不达标', '竖杆间距过大', '栏杆安装不牢固'] },
      { id: 'v_11', name: '细部构造', desc: '空调洞、排烟洞预留准确，外墙无渗水、返潮。',
        presets: ['空调洞不准', '排烟洞不准', '外墙渗水', '外墙返潮'] },
      { id: 'v_12', name: '现场整洁', desc: '套内建筑垃圾清理完毕，无遗留安全隐患。',
        presets: ['建筑垃圾未清', '遗留安全隐患'] }
    ],
    fields: {
      buildingUnit: true,      // 建设单位
      constructionUnit: true,  // 施工单位
      supervisionUnit: true,   // 监理单位
      initialResult: true,     // 初验结果
      reviewResult: true       // 复查结论
    }
  },

  // ==================== 附件2：实测表 ====================
  measure: {
    title: '住宅工程质量分户验收记录表（实测）',
    type: 'measure',
    // 实测表按房间分组
    rooms: [
      { key: 'living', label: '客厅+餐厅' },
      { key: 'master_bedroom', label: '主卧室' },
      { key: 'master_bath', label: '主卫' },
      { key: 'bathroom', label: '卫生间' },
      { key: 'kitchen', label: '厨房（避难间）' },
      { key: 'west_bedroom', label: '西卧室' },
      { key: 'east_bedroom', label: '东卧室' },
      { key: 'south_bedroom', label: '南卧室' }
    ],
    items: [
      {
        id: 'm_01', name: '室内净高度', unit: 'mm',
        desc: '实测楼板底至楼板面垂直距离',
        perRoom: true,
        rooms: ['living', 'master_bedroom', 'master_bath', 'bathroom', 'kitchen', 'west_bedroom', 'east_bedroom', 'south_bedroom']
      },
      {
        id: 'm_02', name: '室内净开间、进深', unit: 'mm',
        desc: '实测墙皮至墙皮水平距离',
        perRoom: true,
        rooms: ['living', 'master_bedroom', 'master_bath', 'bathroom', 'kitchen', 'west_bedroom', 'east_bedroom', 'south_bedroom']
      },
      {
        id: 'm_03', name: '门窗洞口尺寸', unit: 'mm',
        desc: '实测门洞/窗洞宽度',
        perRoom: false,
        subItems: ['入户门', '客厅窗', '主卧门', '主卧窗', '主卫门', '主卫窗']
      }
    ],
    fields: {
      // 初验结果/复查结论由系统判定（实测值是否在偏差范围内）
      deviationLimit: 5  // 允许偏差范围 mm（示例值，实际依据规范）
    }
  },

  // ==================== 附件3：公区表 ====================
  public: {
    title: '住宅工程质量验收记录表（公区）',
    type: 'public',
    items: [
      {
        id: 'p_01', name: '楼梯梯段、平台宽，平台通道高', category: 'mixed',
        desc: '梯段宽、平台净宽、平台通道高',
        measures: [
          { key: 'stair_width', label: '楼梯梯段宽', unit: 'mm' },
          { key: 'platform_width', label: '平台净宽', unit: 'mm' },
          { key: 'platform_height', label: '平台通道高', unit: 'mm' }
        ],
        visualChecks: [
          { label: '踏步高低宽窄一致，踏步完好无破损', key: 'stair_step' },
          { label: '防滑到位', key: 'stair_anti_slip' },
          { label: '扶手/栏杆安装牢固，高度合规，无毛刺、松动、破损', key: 'stair_rail' }
        ],
        presets: ['踏步破损', '防滑不到位', '扶手松动', '栏杆破损', '梯段宽度不足']
      },
      {
        id: 'p_02', name: '电梯门洞口宽', category: 'measure',
        measures: [{ key: 'elevator_door_width', label: '电梯门洞口宽', unit: 'mm' }],
        presets: ['洞口宽度不足']
      },
      {
        id: 'p_03', name: '公用走道宽、高', category: 'measure',
        measures: [
          { key: 'elevator_lobby_width', label: '电梯前室宽', unit: 'mm' },
          { key: 'elevator_lobby_height', label: '电梯前室高', unit: 'mm' },
          { key: 'corridor_width', label: '走廊宽', unit: 'mm' },
          { key: 'corridor_height', label: '走廊高', unit: 'mm' }
        ],
        presets: ['走道宽度不足', '走道高度不足']
      },
      {
        id: 'p_04', name: '墙面垂直度、平整度', category: 'measure',
        measures: [
          { key: 'verticality_1', label: '垂直度测点1', unit: 'mm' },
          { key: 'verticality_2', label: '垂直度测点2', unit: 'mm' },
          { key: 'flatness_1', label: '平整度测点1', unit: 'mm' },
          { key: 'flatness_2', label: '平整度测点2', unit: 'mm' }
        ],
        presets: []
      },
      { id: 'p_05', name: '墙面', category: 'visual', desc: '墙面涂料/瓷砖平整、无色差、空鼓、开裂、脱落；阴阳角方正。',
        presets: ['墙面空鼓', '墙面开裂', '涂料脱落', '瓷砖空鼓', '阴阳角不方正'] },
      { id: 'p_06', name: '地面', category: 'visual', desc: '地砖/地坪平整牢固，缝隙均匀，无破损、空鼓；水泥地坪无起砂。',
        presets: ['地砖破损', '地面空鼓', '水泥起砂', '缝隙不均'] },
      { id: 'p_07', name: '顶棚', category: 'visual', desc: '吊顶安装牢固、平整，无变形开裂，收口顺直；顶棚腻子平整、洁净、无爆灰。',
        presets: ['吊顶不平整', '吊顶变形', '顶棚开裂'] },
      { id: 'p_08', name: '门窗', category: 'visual', desc: '门窗开启灵活，关闭严密，密封完好，无渗漏。',
        presets: ['门窗不灵活', '密封不严', '门窗渗漏'] },
      { id: 'p_09', name: '机电照明', category: 'visual', desc: '灯具、开关、应急照明安装齐全，运行正常。',
        presets: ['灯具不全', '开关故障', '应急照明不亮'] },
      { id: 'p_10', name: '消防设施', category: 'visual', desc: '消火栓、灭火器、消防标识齐全完好，安装规范。',
        presets: ['消火栓缺失', '灭火器缺失', '消防标识不全'] },
      { id: 'p_11', name: '标识', category: 'visual', desc: '楼层牌、安全出口、疏散标识安装齐全、清晰规范。',
        presets: ['楼层牌缺失', '疏散标识不全'] },
      { id: 'p_12', name: '观感', category: 'visual', desc: '整体美观，成品保护完好，无污染、划痕、破损。',
        presets: ['成品保护破损', '墙面污染'] },
      { id: 'p_13', name: '屋面', category: 'visual', desc: '防水无破坏，排水通畅，无积水、渗漏；避雷设施完好；栏杆安装到位。',
        presets: ['屋面防水破坏', '排水不畅', '屋面渗漏', '避雷设施破损'] },
      { id: 'p_14', name: '地下室', category: 'visual', desc: '墙面地面无返潮渗漏，通风、排水、桥架管线安装规整。',
        presets: ['地下室渗漏', '返潮', '桥架管线不规整'] }
    ]
  }
}

// 各类型对应的检查项数量
export const FORM_SUMMARY = {
  visual: { itemCount: 12, category: '观感' },
  measure: { itemCount: 3, category: '实测', roomCount: 8 },
  public: { itemCount: 14, category: '公区' }
}

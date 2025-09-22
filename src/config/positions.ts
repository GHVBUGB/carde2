// 名片模块位置配置文件
// 你可以在这里手动调整各个模块的位置

export const MODULE_POSITIONS = {
  // 文字模块位置 (x, y 坐标，单位：像素)
  textPositions: {
    companyName: { x: 16, y: 16 },      // 公司名
    name: { x: 160, y: 246 },           // 姓名 - Lycan
    title: { x: 129, y: 274 },          // 职位/头衔 - 根据图片显示的正确初始位置
    positiveRating: { x: 200, y: 325 }, // 好评率 - 根据第二张图坐标设置
    phone: { x: 182, y: 431 },          // 电话号码 - هاتف: 030-۸۸۸۸-۸AAD
    teacherSelectionLabel: { x: 95, y: 402 },    // 教师筛选标签 - اختيار المعلم
    progressFeedbackLabel: { x: 142, y: 402 },   // 进度反馈标签 - تعليقات التقدم
    planningLabel: { x: 190, y: 402 },           // 规划标签 - خطة الدراسة
    resourceSharingLabel: { x: 241, y: 402 }     // 资源共享标签 - موارد التعلم
  },

  // 头像配置
  avatarConfig: {
    size: 200,                          // 头像大小（像素）
    position: { x: 73, y: 27 }          // 头像位置 (x, y) - 恢复原来的位置
  },

  // Logo配置 - 可拖拽移动
  logoConfig: {
    enabled: true,                      // 是否启用Logo
    src: '/logo.png',                   // Logo图片路径
    size: { width: 50, height: 25 },    // Logo大小 (宽, 高) - 固定大小
    position: { x: 52, y: 45 }          // Logo位置 (x, y) - 51Talk绿色Logo位置
  }
}

// 文字样式配置
export const TEXT_STYLES = {
  companyName: { fontSize: 14, color: '#ffffff', fontWeight: 'bold' },
  name: { fontSize: 20, color: '#000000', fontWeight: 'bold' },
  title: { fontSize: 14, color: '#666666', fontWeight: 'normal', textAlign: 'center' },
  positiveRating: { fontSize: 12, color: '#ffffff', fontWeight: 'bold' },
  phone: { fontSize: 14, color: '#000000', fontWeight: 'bold' },
  teacherSelectionLabel: { fontSize: 8, color: '#000000', fontWeight: 'normal' },
  progressFeedbackLabel: { fontSize: 8, color: '#000000', fontWeight: 'normal' },
  planningLabel: { fontSize: 8, color: '#000000', fontWeight: 'normal' },
  resourceSharingLabel: { fontSize: 8, color: '#000000', fontWeight: 'normal' }
}

// 文字内容配置 - 优化默认值
export const TEXT_MODULES = {
  companyName: '51Talk',
  name: 'أحمد',                    // 默认显示的姓名
  title: 'شريك النمو الرئيسي',      // 默认显示的职位
  positiveRating: 98,              // 默认显示的好评率
  positiveRatingLabel: 'تقييم إيجابي', // 默认显示的好评率标签
  phone: 'هاتف: 050-XXXX-XXAB',    // 默认显示的电话号码 - 使用阿拉伯文
  teacherSelectionLabel: 'اختيار\nالمعلم',
  progressFeedbackLabel: 'تعليقات\nالتقدم',
  planningLabel: 'خطة\nالدراسة',
  resourceSharingLabel: 'موارد\nالتعلم'
}

// 名片画布尺寸
export const CANVAS_SIZE = {
  width: 350,
  height: 500
}

// 使用说明：
// 1. 修改位置：调整 textPositions、avatarConfig.position 的 x、y 值
// 2. 修改大小：调整 avatarConfig.size 的值
// 3. Logo配置：Logo位置和大小已固定，仅可修改 logoConfig.enabled 启用/禁用
// 4. 更换Logo图片：修改 logoConfig.src 路径
// 5. 坐标系说明：(0,0) 是左上角，x向右增加，y向下增加
// 6. 保存文件后，刷新浏览器查看效果
// 
// 当前配置（已调整为最佳位置）：
// - 名字：Lycan
// - 头衔：شريك الزمن الرئيسي (阿拉伯文)
// - Logo位置：(52, 45) - 51Talk绿色Logo
// - 姓名位置：(160, 246) - 已调整
// - 头衔位置：(132, 270) - 已调整
// - 服务人数：(110, 320) - 调整后的默认位置
// - 服务人数标签：(110, 326) - 数字下方6px
// - 好评率：(210, 320) - 调整后的默认位置，与服务人数对称
// - 电话号码：هاتف: 030-۸۸۸۸-۸AAD (182, 431)
// - 功能标签：(95, 402), (142, 402), (190, 402), (241, 402)
// 
// 注意：所有位置已调整为最佳显示效果，Logo可拖拽移动

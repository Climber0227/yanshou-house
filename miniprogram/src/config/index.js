// 环境配置 — 通过 .env 文件控制
// 开发环境: VITE_USE_MOCK=true（使用 Mock 数据）
// 生产构建: VITE_USE_MOCK=false（使用真实后端）

const config = {
  // 是否使用 Mock 数据（编译时从 .env 注入）
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  // 后端 API 基础地址
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://dev-api.example.com',
  // 文件上传地址
  uploadUrl: import.meta.env.VITE_UPLOAD_URL || 'https://dev-api.example.com/upload',
}

// 页面打开时输出的调试信息（微信开发者工具 console 可见）
console.log('[config] useMock =', config.useMock, 'baseUrl =', config.baseUrl)

export default config

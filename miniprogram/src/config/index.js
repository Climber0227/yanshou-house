// 环境配置
const ENV = {
  development: {
    useMock: true,
    baseUrl: 'https://dev-api.example.com',
    uploadUrl: 'https://dev-api.example.com/upload'
  },
  production: {
    useMock: false,
    baseUrl: 'https://api.example.com',
    uploadUrl: 'https://api.example.com/upload'
  }
}

// 强制使用 Mock 数据（开发阶段）
// 等后端接口就绪后，将 useMock 改为 false 并填写真实 baseUrl
const config = {
  useMock: true,
  baseUrl: 'https://dev-api.example.com',
  uploadUrl: 'https://dev-api.example.com/upload'
}

// 页面打开时输出的调试信息（微信开发者工具 console 可见）
console.log('[config] useMock =', config.useMock)

export default config

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

const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const config = ENV[currentEnv]

export default config

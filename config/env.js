// 多环境域名配置
const envConfig = {
  development: {
    baseUrl: 'https://api.zksjyk.cn'
  },
  test: {
    baseUrl: 'https://api.zksjyk.cn'
  },
  production: {
    baseUrl: 'https://api.xxx.com'
  }
}

// 自动识别当前环境
const mode = import.meta.env.MODE
console.log(mode)
export const { baseUrl } = envConfig[mode]
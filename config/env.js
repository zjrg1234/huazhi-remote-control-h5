// 多环境域名配置
const envConfig = {
  development: {
    baseUrl: 'https://htzksj.zksjyk.cn'
  },
  test: {
    baseUrl: 'https://htzksj.zksjyk.cn'
  },
  production: {
    baseUrl: 'https://htzksj.zksjyk.cn'
  }
}

// 自动识别当前环境
const mode = import.meta.env.MODE
console.log(mode,"mode")
export const { baseUrl } = envConfig[mode]
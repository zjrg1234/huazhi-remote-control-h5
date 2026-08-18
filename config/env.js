// 多环境域名配置
const envConfig = {
  development: {
    baseUrl: 'https://api.fzbkapp.com'
  },
  test: {
    baseUrl: 'https://htzksj.zksjyk.cn' // 掌中 正式
  },
  production: {
    baseUrl: 'https://api.fzbkapp.com' // 八方
  }
}

// 自动识别当前环境
const mode = import.meta.env.MODE
console.log(mode,"mode")
export const { baseUrl } = envConfig[mode]
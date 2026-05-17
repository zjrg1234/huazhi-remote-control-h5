import { get, post } from '@/utils/request'

// 登录
export function Login(data) {
  // return post('/api/login/loginIn', data, { noLoading: true })
  return post('/api/login/loginIn', data)
}


// 首页列表
export function getHomeListApi(params) {
  return get('/api/home/list', params)
}

// 获取用户信息
export function GetUserInfo(data) {
  return post('/api/user/mine',data)
}

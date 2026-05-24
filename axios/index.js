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


// 修改用户密码
export function UserChangePwd(data) {
  return post('/api/user/change/password',data)
}

// 获取手机验证码
export function GetPhoneCode(data) {
  return post('/api/get/login/code',data)
}


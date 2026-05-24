import { get, post } from '@/utils/request'

// 登录
export function loginApi(data) {
  return post('/api/login', data, { noLoading: true })
}

// 首页列表
export function getHomeListApi(params) {
  return get('/api/home/list', params)
}

// 获取用户信息
export function getUserInfoApi() {
  return get('/api/user/info')
}


// 获取我的
export function GetMine() {
  return post('/api/user/mine')
}

// 获取专区列表
export function GetSpecialList() {
  return post('/api/user/special/list')
}

// 变更专区
export function ChangeSpecialList(data) {
  return post('/api/user/change/special', data)
}


// 申诉记录
export function GetAppealList(data) {
  return get('/api/user/complain/list',data)
}

// 驾驶记录
export function GetDrivingRecordlList(data) {
  return get('/api/user/driving/record', data)
}

// 修改密码
export function ChangePwd(data) {
  return get('/api/user/change/password',data)
}

// 修改手机号
export function ChangePhone(data) {
  return get('/api/user/change/phone',data)
}


export function logoutAccount(data) {
  return get('/api/user/account/cancel', data)
}

export function  GetUserWalletLog(data) {
	return post('/api/user/wallet/list', data)
}

export function  getDepositList() {
	return post('/api/deposit/list')
}
import { get, post } from '@/utils/request'

// 登录
export function Login(data) {
  // return post('/api/login/loginIn', data, { loadingFlag: true })
  return post('/api/login/loginIn', data)
}

//获取banner
export function GetHomeBanner(params) {
  return post('/api/user/banner', params)
}

//获取首页Tab
export function GetHomeTabTitle(params) {
  return post('/api/user/get/title', params)
}

//获取场地数据
export function GetHomeDataList(params) {
  return post('/api/user/index', params)
}

//获取场地数据
export function GetVenueDetail(params) {
  return post('/api/user/venue/detail', params)
}

// 预约驾驶
export function OrderCar(params) {
  return post('/api/user/reservation', params)
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


// 注册
export function Register(data) {
  return post('/api/login/save',data)
}

export function StartDrive(data) {
  return post('/api/user/start/driving',data)
}

// 获取车辆详情
export function GetCarDetails(data) {
  return post('/api/vehicle/detail',data)
}


// 车辆上报
export function CarReport(data) {
  return post('/api/user/processing/alarm/create',data)
}


export function CheckCar(data) {
  return post('/api/user/chack/start/driving',data)
}


export function CheckCar(data) {
  return post('/api/user/chack/start/driving',data)
}


export function LockCar(data) {
  return post('/api/user/lock/driving',data)
}
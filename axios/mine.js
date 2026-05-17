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
export function getMine() {
  return get('/user/mine')
}

// 获取专区列表
export function GetSpecialList() {
  return get('/user/special/list')
}

// 变更专区
export function ChangeSpecialList(obj) {
	console.log(obj)
  return get('/user/change/special')
}


// 申诉记录
export function GetAppealList(obj) {
	console.log(obj)
  return get('/user/complain/list')
}

// 驾驶记录
export function GetDrivingRecordlList(obj) {
	console.log(obj)
  return get('/user/driving/record')
}


// 修改密码
export function ChangePwd(obj) {
	console.log(obj)
  return get('/user/change/password')
}

// 修改手机号
export function ChangePhone(obj) {
	console.log(obj)
  return get('/user/change/phone')
}


export function logoutAccount(obj) {
	console.log(obj)
  return get('/api/user/account/cancel')
}


// https://api.zksjyk.cn/api/user/wallet/list
// request：
// uid
// type 1充值（收入） 2驾驶（消费） 3 退还（收入）

// {
//     "code": 200,
//     "msg": "",
//     "data": {
//         "page": 1,
//         "size": 1,
//         "total": 136,
//         "isLast": 136,
//         "content": [
//             {
//                 "id": 166,
//                 "type": 3,
//                 "time": "2026-04-16 22:02:22",
//                 "amount": 1, //金额
//                 "type_name": "提前结束驾驶退还" //类型
//             }
//         ]
//     },
//     "traceId": "6a06ddfe26c58"
// }
export function  getUserWalletLog() {
	return post('/api/user/wallet/list')
}


// /deposit/list 充值列表
// request：
// uid

// resp：
// {
//     "code": 200,
//     "msg": "成功",
//     "data": [
//         {
//             "amount": 10
//         },
//         {
//             "amount": 20
//         },
//         {
//             "amount": 50
//         },
//         {
//             "amount": 100
//         },
//         {
//             "amount": 200
//         },
//         {
//             "amount": 500
//         }
//     ],
//     "traceId": "6a0993dfc6278"
// } 

export function  getDepositList() {
	return post('/api/deposit/list')
}
// /user/deposit/activity/list充值活动列表

// request 

// uid

// resp：{
//     "code": 200,
//     "msg": "成功",
//     "data": [
//         {
//             "activity_id": "10023121111", //活动id
//             "payment_amount": 1000, //金额
//             "send_energy": 50 //赠送能量
//         },
//         {
//             "activity_id": "335819286",
//             "payment_amount": 1,
//             "send_energy": 2
//         }
//     ],
//     "traceId": "6a0994094c7f7"
// }



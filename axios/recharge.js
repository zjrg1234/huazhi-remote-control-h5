import { get, post } from '@/utils/request'

//  充值列表
export function GetDepositList(data) {
  return post('/api/user/deposit/list',data)
}

//  充值列表
export function GetFirstDepositList(data) {
  return post('/api/user/deposit/activity/list',data)
}

//  充值列表
export function AlipayDeposit(data) {
  return post('/api/user/alipay/deposit',data)
}

//  充值列表
export function WechatDeposit(data) {
  return post('/api/user/wechat/deposit',data)
}

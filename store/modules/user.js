import {
	defineStore
} from 'pinia'

export const useUserStore = defineStore('user', {
	state: () => ({
		token: uni.getStorageSync('token') || '',
		id: uni.getStorageSync('id') || '',
		userInfo: uni.getStorageSync('userInfo') || {},
		areaId: uni.getStorageSync('areaId') || ''
	}),

	actions: {
		// 登录保存信息
		setUser(data) {
			this.userInfo = data
			this.id = data.id
			uni.setStorageSync('userInfo', data)
			uni.setStorageSync('id', data.id)
		},
		setToken(token) {
			this.token = token
			uni.setStorageSync('token', token)
		},
		setAreaId(areaId) {
			this.areaId = areaId
			uni.setStorageSync('areaId', areaId)
		},
		setId(id) {
			this.id = id
			uni.setStorageSync('id', id)
		},
		// 退出登录
		logout() {
			this.id = ''
			this.token = ''
			this.userInfo = {}
			uni.clearStorageSync()
			uni.reLaunch({
				url: '/pages/login/index'
			})
		},

		getLoginId() {
			// 有可能是用户，代理
			return uni.getStorageSync('id')
		},		
		getUserInfo() {
			return uni.getStorageSync('userInfo')
		}
	}
})
import {
	defineStore
} from 'pinia'

export const useUserStore = defineStore('user', {
	state: () => ({
		token: uni.getStorageSync('token') || '',
		userInfo: uni.getStorageSync('userInfo') || {}
	}),

	actions: {
		// 登录保存信息
		setUser(data) {
			this.userInfo = data
			uni.setStorageSync('userInfo', data)
		},
		setToken(token) {
			console.log(token)
			this.token = token
			uni.setStorageSync('token', token)
		},
		// 退出登录
		logout() {
			this.token = ''
			this.userInfo = {}
			uni.clearStorageSync()
			uni.reLaunch({
				url: '/pages/login/login'
			})
		},
		
		
		getUserInfo() {
			return uni.getStorageSync('userInfo')
		}
	}
})
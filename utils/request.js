import {
	baseUrl
} from '@/config/env'
import {
	useUserStore
} from '@/store/modules/user'

// 超时时间
const TIME_OUT = 10000

// 接口白名单：无需登录
const whiteList = ['/api/login']

const request = (options) => {
	return new Promise((resolve, reject) => {
		const {
			url,
			method = 'GET',
			data = {},
			header = {},
			noLoading = false
		} = options

		const token = data?.token || undefined

		// 白名单判断
		const isWhite = whiteList.some(item => url.includes(item))
		if (!isWhite && !token) {
			uni.reLaunch({
				url: '/pages/login/login'
			})
			return reject('未登录')
		}

		// 加载弹窗
		if (noLoading) {
			uni.showLoading({
				title: '加载中...',
				mask: true
			})
		}

		uni.request({
			url: baseUrl + url,
			method,
			data,
			timeout: TIME_OUT,
			header: {
				'Content-Type': 'application/json;charset=UTF-8',
				...(token ? {
					Authorization: `${token}`
				} : {}),
				...header
			},
			success: (res) => {
				if (!noLoading) uni.hideLoading()
				const data = res.data

				if (data.code === 200) {
					resolve(data)
				} else if (data.code === 401) {
					uni.showToast({
						title: '登录已过期，请重新登录',
						icon: 'none'
					})
					// userStore.logout()
					const timer = setTimeout(() => {
						uni.reLaunch({
							url: '/pages/login/login'
						})
					}, 2000);
					reject(data)
				} else {
					uni.showToast({
						title: data.msg || '请求失败',
						icon: 'none'
					})
					reject(data)
				}
			},
			fail: (err) => {
				if (!noLoading) uni.hideLoading()
				uni.showToast({
					title: '网络异常，请稍后重试',
					icon: 'none'
				})
				reject(err)
			}
		})
	})
}

// 导出请求方法
export const get = (url, data = {}, opts = {}) => request({
	url,
	method: 'GET',
	data: {
		...data,
		...getParam()
	},
	...opts
})
export const post = (url, data = {}, opts = {}) => request({
	url,
	method: 'POST',
	data: {
		...data,
		...getParam()
	},
	...opts
});
export const put = (url, data = {}, opts = {}) => request({
	url,
	method: 'PUT',
	data: {
		...data,
		...getParam()
	},
	...opts
})
export const del = (url, data = {}, opts = {}) => request({
	url,
	method: 'DELETE',
	data: {
		...data,
		...getParam()
	},
	...opts
})

const getParam = () => {
	const userStore = useUserStore()
	const id = userStore.id
	const token = userStore.token
	return {
		uid: id,
		token
	}
}
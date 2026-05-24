import { useUserStore } from '@/store/modules/user'

// 需要登录才能访问的页面
const needLoginPages = [
  ''
]

let userStore = null
const getUserStore = () => {
  if (!userStore) {
    userStore = useUserStore()
  }
  return userStore
}

// 拦截 navigateTo
uni.addInterceptor('navigateTo', {
  invoke(e) {
    const userStore = getUserStore()
    const pagePath = e.url.split('?')[0]
    if (needLoginPages.includes(pagePath) && !userStore.token) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return false
    }
  }
})

// 拦截 switchTab
uni.addInterceptor('switchTab', {
  invoke(e) {
    const userStore = getUserStore()
    const pagePath = e.url.split('?')[0]
    if (needLoginPages.includes(pagePath) && !userStore.token) {
      uni.reLaunch({ url: '/pages/login/login' })
      return false
    }
  }
})
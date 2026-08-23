import { useUserStore } from '@/store/modules/user'

// 需要登录才能访问的页面
const needLoginPages = [
  '/pages/mine/set',
  '/subpkg_mine/pages/mine/changeArea',
  '/subpkg_mine/pages/mine/driveRecord',
  '/subpkg_mine/pages/mine/appeal',
  '/subpkg_mine/pages/mine/reservation',
  '/subpkg_mine/pages/user/modifyPwd',
  '/subpkg_mine/pages/user/modifyPhone',
  "/subpkg_mine/pages/mine/set",
  "/subpkg_mine/pages/mine/battery"
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
      uni.reLaunch({ url: '/subpkg_login/pages/login/login' })
      return false
    }
  }
})
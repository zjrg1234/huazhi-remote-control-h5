<template>
  <view class="content">
    <text class="title">首页</text>
    <button @click="testReq">测试接口请求</button>
		<navigator url="/pages/login/login">登录</navigator>
    <button style="margin-top: 20rpx" @click="logout">退出登录</button>
  </view>
</template>

<script setup>
import { getHomeListApi } from '@/axios/index'
//import { useUserStore } from '@/store/modules/user'

// const userStore = useUserStore()

// 测试请求
const testReq = async () => {
	console.log(123)
	uni.navigateTo({
		url: '/pages/login/login'
	})
  // try {
  //   const res = await getHomeListApi({ page: 1 })
  //   console.log('请求成功：', res)
  // } catch (err) {
  //   console.log('请求失败：', err)
  // }
}

// 退出登录
const logout = () => {
  //userStore.logout()
}
</script>

<style scoped>
.content {
  padding: 30rpx;
}
.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  display: block;
}
</style>
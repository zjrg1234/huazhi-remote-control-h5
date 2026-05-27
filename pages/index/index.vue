<template>
  <view class="content">
    <text class="title">首页</text>
    <button @click="testReq">车辆详情</button>
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

	uni.navigateTo({
		url: '/pages/car/details?carid=123'
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
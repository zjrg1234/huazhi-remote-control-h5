<template>
	<view class="page">

		<view class="avatar-wrap">
			<image class="avatar" src="/static/logo.png" mode="aspectFill" />
		</view>


		<view class="form">





			<!-- #ifdef MP-WEIXIN -->
			<!-- 必须使用原生 button 组件才能触发手机号授权 -->
			<button class="login-btn" open-type="getPhoneNumber" @getphonenumber="handleGetPhoneNumber">
				手机号一键登录
			</button>
			<!-- #endif -->


			<view class="login-btn" @click="handleLogin">手机号码登录/注册</view>


		</view>


		<view class="agreement">
			<view class="checkbox" :class="{ checked: agree }" @click="agree = !agree">
				<image class="check-icon" src="/static/images/login/checked@2x.png" mode="aspectFill" v-if="agree" />
				<image class="un-check-icon" src="/static/images/login/circle@2x.png" mode="aspectFill" v-if="!agree" />
			</view>
			<text class="text">
				我已同意<text class="highlight" @click="goto('/pages/set/userPolicy')">用户协议</text> 和
				<text @click="goto('/pages/set/privacy')" class="highlight">隐私条款</text>
			</text>
		</view>

	</view>
</template>

<script setup>
import {
	ref
} from 'vue'
import { Login, GetUserInfo } from "@/axios/index.js"
import {
	useUserStore
} from '@/store/modules/user'
const form = ref({
	phone: '',
	password: ''
})

const agree = ref(true)
const userStore = useUserStore()
// 登录
const handleLogin = () => {
	uni.navigateTo({
		url: '/pages/login/login'
	})
}

// 跳转
const goForgetPwd = () => {
	uni.navigateTo({
		url: '/pages/login/forgetPwd'
	})
}

const goCodeLogin = () => {
	uni.navigateTo({
		url: '/pages/login/loginCode'
	})
}

const goRegister = () => {
	uni.navigateTo({
		url: '/pages/register/register'
	})
}

const goto = (url) => {
	uni.navigateTo({
		url
	})
}

const handleGetPhoneNumber = async (e) => {
	// 1. 判断用户是否同意授权
	if (e.detail.errMsg !== "getPhoneNumber:ok") {
		uni.showToast({ title: '已取消授权', icon: 'none' });
		return;
	}
	console.log(e.detail, '===')
	// 有手机的
	// 2. 获取微信登录的临时凭证 code
	const loginRes = await new Promise((resolve, reject) => {
		uni.login({
			provider: 'weixin',
			success: res => resolve(res),
			fail: err => reject(err)
		});
	});

	console.log(loginRes, "loginRes")

}
</script>

<style lang="scss" scoped>
page {
	background-color: #fff;
}

.page {
	padding: 138rpx 32rpx 40rpx;
	box-sizing: border-box;
	position: relative;
	height: 100vh;
	background-color: #fff;
}

/* 头像 */
.avatar-wrap {
	text-align: center;
	margin-bottom: 60rpx;
	margin-top: 100rpx;

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 16rpx;
	}
}

/* 表单 */
.form {
	width: 100%;
	margin-top: 100rpx;

}

.input-item {
	display: flex;
	align-items: center;
	background-color: #f7f7f7;
	border-radius: 12rpx;
	padding: 0 24rpx;
	height: 96rpx;
	margin-bottom: 24rpx;

	.prefix {
		font-size: 28rpx;
		color: #333;
		margin-right: 16rpx;
	}

	.input {
		flex: 1;
		height: 96rpx;

		font-size: 28rpx;
		background: transparent;
	}
}

.row-link {
	display: flex;
	justify-content: space-between;
	margin-bottom: 50rpx;

	.link {
		font-size: 26rpx;
		color: #999;
	}
}

.login-btn {
	background: linear-gradient(90deg, #FFC838 0%, #FFC838 100%);
	border-radius: 24rpx;
	font-family: PingFangSC, PingFang SC;
	font-weight: 400;
	font-size: 32rpx;
	color: #1A1A1A;
	text-align: center;
	margin-bottom: 50rpx;
	padding: 25rpx 0;
}

.register-link {
	text-align: center;
	font-size: 28rpx;
	color: #999;
	margin-bottom: 60rpx;
}

.other-login {
	display: flex;
	align-items: center;
	margin-bottom: 40rpx;

	.line {
		flex: 1;
		height: 1rpx;
		background-color: #eee;
	}

	.text {
		font-size: 26rpx;
		color: #999;
		margin: 0 20rpx;
	}
}

.third-list {
	display: flex;
	justify-content: center;
	gap: 60rpx;
	margin-bottom: 80rpx;

	.third-item {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		overflow: hidden;

		.icon {
			width: 100%;
			height: 100%;
		}
	}
}

.agreement {
	position: absolute;
	bottom: env(safe-area-inset-bottom);
	left: 50%;
	width: 100%;
	transform: translatex(-50%);
	display: flex;
	align-items: center;
	justify-content: center;

	.checkbox {
		width: 46rpx;
		height: 46rpx;
		border-radius: 4rpx;
		margin-right: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.check-icon {
			width: 40rpx;
			height: 40rpx;
		}

		.un-check-icon {
			width: 46rpx;
			height: 46rpx;
		}
	}

	.text {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 24rpx;
		color: #29220A;

		.highlight {
			color: #FFC838;
		}
	}
}

.login-btn {
	/* 1. 清除原生 button 默认样式 */
	padding: 0;
	margin: 0;
	border: 0;
	line-height: normal;
	background: transparent;
	/* 重置默认背景 */

	/* 清除 button 点击后的边框伪元素 */
	&::after {
		border: none;
	}

	/* 2. 应用你原本的设计样式 */
	background: linear-gradient(90deg, #FFC838 0%, #FFC838 100%);
	border-radius: 24rpx;
	font-family: PingFangSC,
	PingFang SC;
	font-weight: 400;
	font-size: 32rpx;
	color: #1A1A1A;
	text-align: center;
	margin-bottom: 50rpx;
	padding: 25rpx 0;
}
</style>
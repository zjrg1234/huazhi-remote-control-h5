<template>
	<view class="page">

		<!-- 表单 -->
		<view class="form">
			<!-- 手机号 -->
			<view class="input-item">
				<text class="prefix">+86</text>
				<input class="input" type="number" maxlength="11" placeholder="请输入手机号" v-model="form.phone" />
			</view>
			<VerifyCodeInput v-model="form.code" :phone="form.phone" />
			<!-- 密码 -->
			<view class="input-item">
				<input class="input" type="password" maxlength="6" placeholder="请输入密码" v-model="form.password" />
			</view>
			<view class="input-item">
				<input class="input" type="password" maxlength="6" placeholder="请再次输入密码" v-model="form.passwordAgain" />
			</view>


			<view class="login-btn" @click="handleLogin">完成</view>


		</view>


	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		UserChangePwd
	} from "@/axios/index.js"
	import {
		useUserStore
	} from '@/store/modules/user'
	import VerifyCodeInput from '@/components/verify-code/verify-code.vue';
	const form = ref({
		phone: '',
		password: '',
		code: '',
		passwordAgain: ''
	})

	const agree = ref(true)
	const userStore = useUserStore()
	// 登录
	const handleLogin = () => {

		if (!form.value.phone || form.value.phone.length !== 11) {
			uni.showToast({
				title: '请输入手机号',
				icon: 'none'
			});
			return;
		}
		if (!form.value.code) {
			uni.showToast({
				title: '请输入验证码',
				icon: 'none'
			});
			return;
		}
		if (!form.value.password || form.value.password.length < 6) {
			uni.showToast({
				title: '密码至少6位',
				icon: 'none'
			});
			return;
		}
		if (form.value.password !== form.value.passwordAgain) {
			uni.showToast({
				title: '两次密码输入不一致',
				icon: 'none'
			});
			return;
		}

		UserChangePwd({
			...form.value,
		}).then(res => {
			console.log(res)
			if (res.code == 200) {
			
					uni.switchTab({
						url: "/pages/login/login"
					})
		
			}
		}).catch()

	}

	// 跳转
	const goForgetPwd = () => {
		uni.navigateTo({
			url: '/pages/login/forget-pwd'
		})
	}

	const goCodeLogin = () => {
		uni.navigateTo({
			url: '/pages/login/code-login'
		})
	}

	const goRegister = () => {
		uni.navigateTo({
			url: '/pages/login/register'
		})
	}

	const goto = (url) => {
		uni.navigateTo({
			url
		})
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: #fff;
	}

	.page {
		padding: 10rpx 32rpx 40rpx;
		box-sizing: border-box;
		position: relative;
		height: 100vh;
		background-color: #fff;
	}

	/* 头像 */
	.avatar-wrap {
		text-align: center;
		margin-bottom: 60rpx;

		.avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 16rpx;
		}
	}

	/* 表单 */
	.form {
		width: 100%;
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
</style>
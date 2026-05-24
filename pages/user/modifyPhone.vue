<template>
	<view class="container">

		<view class="form-wrapper">

			<view class="input-item">
				<span>+86</span>
				<input class="input" maxlength="11" placeholder="请输入旧手机号" v-model="formData.phone" />

			</view>
		</view>
		<VerifyCodeInput v-model="formData.code" phone="188888888" />
		<view class="input-item">
			<input class="input" maxlength="11" placeholder="请输入新手机号" v-model="formData.new_phone_number" />
		</view>
		
		
		<view class="btn-area">
			<button class="submit-btn" @click="handleSubmit">确定</button>
		</view>
	</view>


</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue';
	import VerifyCodeInput from '@/components/verify-code/verify-code.vue';
	import {
		ChangePhone
	} from "@/axios/mine.js"
	// --- 数据定义 ---
	const formData = reactive({
		code: '',
		new_phone_number: '',
		phone: ''
	});



	// 提交表单
	const handleSubmit = () => {
		if (!formData.phone) return uni.showToast({ title: '请输入旧手机号', icon: 'none' });
		if (!formData.code) return uni.showToast({ title: '请输入验证码', icon: 'none' });
		if (!formData.new_phone_number) return uni.showToast({ title: '请输入新手机号', icon: 'none' });
		
		console.log(formData)
		ChangePhone({
			...formData
		}).then(res => {
			// 这里执行提交逻辑
			uni.showToast({
				title: '密码重置成功',
				icon: 'success'
			});
		}).catch()

	};
</script>

<style lang="scss" scoped>
	.container {
		padding: 60rpx;
		background-color: #fff;
		min-height: 100vh;
	}


	.input-item {
		height: 88rpx;
		background-color: #f7f7f7;
		border-radius: 12rpx;
		margin-bottom: 25rpx;
		padding: 0 30rpx;
		display: flex;
		align-items: center;
		position: relative;

		&.phone-box {
			color: #333;
			font-size: 28rpx;
			font-weight: 500;
		}
	}


	.input {
		flex: 1;
		height: 100%;
		font-size: 28rpx;
		padding-left: 20rpx;
		color: #333;
	}

	/* 手机号文本 */
	.phone-text {
		margin-left: 20rpx;
		font-size: 28rpx;
		color: #333;
	}

	/* 验证码按钮 */
	.code-btn {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 28rpx;
		color: #FF8500;
		position: absolute;
		right: 20rpx;
		padding: 10rpx 20rpx;
	}

	/* 按钮区域 */
	.btn-area {
		margin-top: 200rpx;
	
	}

	/* 提交按钮 */
	.submit-btn {
		background-color: #f7ba2a;
		/* 黄色背景 */
		color: #333;
		/* 黑色文字 */
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 12rpx;
		height: 90rpx;
		line-height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		/* 去除按钮默认样式 */
		&::after {
			border: none;
		}
	}
</style>
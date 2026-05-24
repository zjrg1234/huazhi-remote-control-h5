<template>
	<view class="page">

		<!-- 自定义导航栏（H5不显示） -->
		<!-- #ifndef H5 -->
		<custom-nav-bar title="我的电池"></custom-nav-bar>
		<!-- #endif -->
		<view class="wrap-content">
			<!-- #ifdef H5 -->

			<NavBar title="我的电池" url="/pages/mine/index"></NavBar>

			<view class="bg-image">
				<image class="image" src="/static/images/mine/bg2@2x.png" mode="widthFix"></image>
			</view>
			<!-- #endif -->
			<!-- #ifndef H5 -->
			<!-- 顶部背景图 小程序-->
			<view class="bg-image" :style="{top: '-' + getNavBarHeight() + 'px'}">
				<image class="image" src="/static/images/mine/bg2@2x.png" mode="widthFix"></image>
			</view>
			<!-- #endif -->


			<!-- 电池卡片 -->
			<view class="card">
				<view class="card-bg">
					<image class="card-bg-img" src="/static/images/mine/bg_battery@2x.png" mode="widthFix"></image>
				</view>
				<view class="card-content">
					<view class="card-left">
						<view class="label">
							<view class="label-text">
								我的电池
							</view>
							<image class="battery" src="/static/images/mine/icon_battery@2x.png" mode="widthFix">
							</image>
						</view>
						<view class="num">{{ balance }}</view>
					</view>

				</view>
			</view>
		</view>
		<!-- 标签切换 -->
		<!-- <view class="tabs">
			<text class="tab" :class="{ active: tab === 'normal' }" @click="handleSelect('normal')">普通充值</text>
			<text class="tab" :class="{ active: tab === 'first' }" @click="handleSelect('first')">首充优惠</text>
		</view> -->

		<view class="tabs">
			<view v-for="item in tabs" :key="item.id" class="tab-item" :class="{ active: tab === item.id }"
				@click="handleSelect(item.id)">
				<text>{{ item.name }}</text>
				<!-- 底部激活横线 -->
				<view v-if="tab === item.id" class="line"></view>
			</view>
		</view>

		<!-- 充值套餐 -->
		<view class="section">
			<text class="section-title">充值套餐</text>
			<view class="package-list" v-if="tab == 'normal'">
				<view class="package-item" :class="{ active: selectedPackage === item.amount }" v-for="item in packageList"
					:key="item.amount" @click="selectedPackageIndex(1, item.amount)">
					<view class="num">
						<text> {{ item.amount }} </text>
						<image class="icon" src="/static/images/common/icon_battery@2x.png" />
					</view>
					<view class="price">¥{{ item.amount.toFixed(2) }}</view>
				</view>
			</view>
			<view class="package-list" v-if="tab == 'first'">
				<view class="package-item" :class="{ active: selectedPackage === item.payment_amount }"
					v-for="item in packageFirstList" :key="item.payment_amount"
					@click="selectedPackageIndex(2, item)">
					<view class="num">
						<text> {{ item.payment_amount }} </text>
						<image class="icon" src="/static/images/common/icon_battery@2x.png" />
					</view>
					<view class="energy">送{{item.send_energy}}能量</view>
					<view class="price">¥{{ item.payment_amount.toFixed(2) }}</view>
				</view>
			</view>

		</view>

		<!-- 自定义充值 -->
		<view class="section">
			<text class="section-title">自定义数量充值</text>
			<input class="custom-input" type="number" placeholder="请输入电池数量（不低于3个）" v-model.number="customNum" />
		</view>

		<!-- 支付方式 -->
		<view class="section">
			<text class="section-title">支付方式</text>
			<view class="pay-list">
				<view class="pay-item" :class="{ active: payType === 'alipay' }" @click="payType = 'alipay'">
					<image class="pay-icon" src="/static/images/common/icon_zfb@2x.png" />
					<text>支付宝支付</text>
				</view>
				<view class="pay-item" :class="{ active: payType === 'wechat' }" @click="payType = 'wechat'">
					<image class="pay-icon" src="/static/images/common/icon_wx@2x.png" />
					<text>微信支付</text>
				</view>
			</view>
		</view>

		<!-- 说明文字 -->
		<view class="desc">
			<text class="desc-title">充值说明：</text>
			<view class="desc-item">1. 如您未满18岁，请在监护人陪同下操作；</view>
			<view class="desc-item">2. 如对充值有其它疑问，请联系客服。</view>
		</view>

		<!-- 确定按钮 -->
		<button class="submit-btn" @click="handleSubmit">确定</button>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed,
		watch
	} from 'vue'
	import {
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app'

	import NavBar from "@/components/nav-bar/nav-bar.vue"
	import {
		GetUserWalletLog
	} from "@/axios/mine.js"
	import {
		GetDepositList,
		GetFirstDepositList,
		AlipayDeposit,
		WechatDeposit
	} from "@/axios/recharge.js"
	import {
		formatTime
	} from "@/utils/date.js"
	import {
		getNavBarHeight
	} from "@/utils/system.js"

	import {
		useUserStore
	} from '@/store/modules/user'

	const userStore = useUserStore();

	const balance = computed(() => {
		return userStore.getUserInfo().wallet.balance
	})
		// 当前选中标签
	const tab = ref('normal')

	// 选中的套餐
	const selectedPackage = ref(null)

	const packageFirstList = ref(null)

	const activityId = ref(null)

	const tabs = [{
			id: 'normal',
			name: '普通充值'
		},
		{
			id: 'first',
			name: '首充优惠'
		}
	];

	onMounted(() => {
		getDepositList()
		getFirstDepositList()
	})

	const getDepositList = () => {
		GetDepositList({
			uid: userStore.getUserInfo().id
		}).then(res => {
			console.log(res)
			packageList.value = res.data
		}).catch()
	}


	const getFirstDepositList = () => {
		GetFirstDepositList({
			uid: userStore.getUserInfo().id
		}).then(res => {
			console.log(res)
			packageFirstList.value = res.data
		}).catch()
	}

	// 自定义充值数量
	const customNum = ref(null)

	watch(customNum, (newValue, oldValue) => {
		if (newValue) {
			selectedPackage.value = -1;
		}
	});

	// 支付方式
	const payType = ref('alipay')

	// 套餐列表
	const packageList = ref()

	const selectedPackageIndex = (type, item) => {
		selectedPackage.value = item
		customNum.value = ""
		activityId.value = undefined
		// 首充
		if (type == 2) {
			selectedPackage.value = item.payment_amount
			activityId.value = item.activity_id
		}
	}
	const handleSelect = (val) => {
		tab.value = val
		customNum.value = ""
	}
	// 返回
	const goBack = () => {
		uni.navigateBack()
	}

	// 提交
	const handleSubmit = async () => {

		let amount = 0
		if (selectedPackage.value && selectedPackage.value != -1) {
			amount = selectedPackage.value
		} else if (customNum.value && customNum.value >= 3) {
			amount = customNum.value
		} else {
			uni.showToast({
				title: '请选择或输入充值数量',
				icon: 'none'
			})
			return
		}
		let res;
		let obj = {
			uid: userStore.getUserInfo().id,
			amount: selectedPackage.value || customNum.value,
			activity_id: activityId.value || undefined
		}
		if (payType.value == 'alipay') {
			const {
				code,
				data: {
					order_str
				}
			} = await AlipayDeposit(obj)
			const payUrl = "https://mapi.alipay.com/gateway.do?" + order_str;
			window.location.href = payUrl;

			const rawPayUrl = "https://mapi.alipay.com/gateway.do?" + order_str;
			const encodedUrl = encodeURIComponent(rawPayUrl);
			const scheme = `alipays://platformapi/startapp?appId=20000067&url=${encodedUrl}`;

			// 尝试唤起App
			window.location.href = scheme;

			// 若未安装，3秒后跳转H5收银台
			setTimeout(() => {
				window.location.href = rawPayUrl;
			}, 3000);

		} else {
			res = await WechatDeposit(obj)
		}

		console.log(res)


	}
</script>

<style lang="scss" scoped>
	page {
		background: #f5f6f8;
	}

	.page {
		min-height: 100vh;
		padding-bottom: 80rpx;
		position: relative;
	}

	/* 顶部导航 */
	.header {
		background: #ffc832;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;

		.back {
			position: absolute;
			left: 30rpx;
			font-size: 32rpx;
		}

		.title {
			font-size: 34rpx;
			font-weight: 500;
		}
	}

	/* 余额卡片 */
	.balance-card {
		background: linear-gradient(to right, #fff9e6, #fff);
		margin: 20rpx 30rpx;
		border-radius: 16rpx;
		padding: 30rpx;

		.label {
			font-size: 30rpx;
			display: flex;
			align-items: center;

			.icon {
				width: 32rpx;
				height: 32rpx;
				margin-left: 8rpx;
			}
		}

		.num {
			font-size: 48rpx;
			font-weight: bold;
			margin-top: 10rpx;
		}
	}

	/* 标签切换 */

	.tabs {
		display: flex;
		justify-content: space-around;
		background-color: #ffffff;
		padding: 20rpx 0 10rpx 0;
		margin-bottom: 20rpx;
		position: sticky;
		top: 0;
		z-index: 10;

		.tab-item {
			margin: 0 40rpx;
			position: relative;
			padding-bottom: 10rpx;

			text {
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 28rpx;
				color: #777777;
			}

			/* 激活状态样式 */
			&.active text {

				font-weight: 500;
				font-size: 30rpx;
				color: #1A1A1A;
			}

			.line {
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 40rpx;
				height: 4rpx;

				background: #1A1A1A;
				border-radius: 2rpx;
			}
		}
	}


	/* 通用 section */
	.section {
		background: #fff;
		margin: 20rpx 10rpx 0;
		border-radius: 16rpx;
		padding: 20rpx;

		.section-title {
			font-size: 30rpx;
			font-weight: 500;
			margin-bottom: 20rpx;
			display: block;
		}
	}

	/* 套餐列表 */
	.package-list {
		display: grid;
		grid-template-columns: repeat(3, auto);
		/* 3行，高度自适应 */
		gap: 20rpx;
		/* 间距 */
		height: 100%;

		.package-item {
			// width: calc((100% - 40rpx) / 3);
			border: 1rpx solid #eee;
			border-radius: 12rpx;
			padding: 24rpx 10rpx;
			text-align: center;

			.num {
				font-size: 40rpx;
				font-weight: bold;
				color: #333;
				display: flex;

				align-items: baseline;
				justify-content: center;

				.icon {
					width: 28rpx;
					height: 28rpx;
					margin-left: 6rpx;
				}
			}

			.price {
				font-size: 26rpx;
				color: #999;
				margin-top: 10rpx;
			}

			.energy {
				font-size: 26rpx;
				color: #999;
			}

			&.active {
				border-color: #ffc832;
				background: #fff9e6;

				.num {
					color: #FF8500;
				}

				.price {
					color: #FF8500;
				}
			}
		}
	}

	/* 自定义输入框 */
	.custom-input {

		height: 80rpx;
		background: #f8f8f8;
		border-radius: 12rpx;
		padding: 0 10rpx;
		font-size: 28rpx;
	}

	/* 支付方式 */
	.pay-list {
		display: flex;
		gap: 20rpx;

		.pay-item {
			flex: 1;
			border: 1rpx solid #eee;
			border-radius: 12rpx;
			padding: 24rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;
			font-size: 28rpx;

			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 30rpx;
			color: #1A1A1A;

			.pay-icon {
				width: 40rpx;
				height: 40rpx;
			}

			&.active {
				background: #FFC838;
				border-radius: 12rpx;
				border: 1rpx solid #FFC838;
				color: #1A1A1A;
			}
		}
	}

	/* 说明文字 */
	.desc {
		margin: 20rpx 30rpx;
		font-family: PingFangSC, PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #999999;
	}

	/* 提交按钮 */
	.submit-btn {
		position: fixed;
		bottom: env(safe-area-inset-bottom);
		margin: 20rpx;
		padding: 10rpx 320rpx;
		background: #ffc832;
		border: none;
		border-radius: 16rpx;
		font-family: PingFangSC, PingFang SC;
		font-weight: 500;
		font-size: 32rpx;
		color: #1A1A1A;

	}

	/* 电池卡片 */
	.card {
		position: relative;
		z-index: 1;
		padding: 20rpx;
		padding-bottom: 0;
		overflow: hidden;
		padding-left: 30rpx;
		height: 196rpx;
	}

	.card-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 0;

		.card-bg-img {
			width: 100%;
			height: 196rpx;

		}
	}

	.card-content {
		position: relative;
		z-index: 1;
		padding: 0 0;
		display: flex;
		justify-content: space-between;
		align-items: end;
	}

	.label {

		padding-top: 10rpx;

		display: flex;
		justify-content: left;
		align-items: center;

		.label-text {
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 28rpx;
			color: #222222;
		}

		.battery {
			width: 38rpx;
			height: 38rpx;
		}
	}

	.num {
		font-family: PingFangSC, PingFang SC;
		font-weight: 600;
		font-size: 40rpx;
		color: #222222;
		padding-top: 6rpx;
		padding-left: 10rpx;
	}

	page {
		background: #F8F8F8;
		padding: 0 !important;
		margin: 0 !important;
		box-sizing: border-box;
	}

	.page {
		min-height: 100vh;
		box-sizing: border-box;
	}

	.wrap-content {
		position: relative;
		width: 100%;
		background: #FFFFFF;
	}

	/* H5 导航栏 */
	.header {
		position: relative;
		z-index: 99;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		font-family: PingFangSC, PingFang SC;
		font-weight: 500;
		font-size: 32rpx;
		color: #333333;

		.back-image {
			position: absolute;
			left: 30rpx;
			color: #fff;
			transform: rotate(180deg);
			width: 32rpx;
		}
	}

	/* 顶部背景图 */
	.bg-image {
		position: absolute;
		top: -97rpx;
		left: 0;
		width: 100%;
		height: 170rpx;
		z-index: 0;

		.image {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
			height: 170rpx;
		}
	}


	.label {
		padding-top: 10rpx;
		display: flex;
		justify-content: left;
		align-items: center;

		.label-text {
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 28rpx;
			color: #222222;
		}

		.battery {
			width: 38rpx;
			height: 38rpx;
		}
	}

	.num {
		font-family: PingFangSC, PingFang SC;
		font-weight: 600;
		font-size: 40rpx;
		color: #222222;
		padding-top: 6rpx;
		padding-left: 10rpx;
	}

	.recharge-btn {
		background: #FFC838;
		border-radius: 12rpx;
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 24rpx;
		color: #1A1A1A;
		padding: 10rpx 40rpx;

	}

	/* 说明 */
	.desc {
		padding: 0 20rpx;
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 24rpx;
		color: #999999;
	}

	.tabs {
		display: flex;
		justify-content: space-around;
		background-color: #ffffff;
		padding: 20rpx 0 10rpx 0;
		margin-bottom: 20rpx;
		position: sticky;
		top: 0;
		z-index: 10;

		.tab-item {
			margin: 0 40rpx;
			position: relative;
			padding-bottom: 10rpx;

			text {
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 28rpx;
				color: #777777;
			}

			/* 激活状态样式 */
			&.active text {

				font-weight: 500;
				font-size: 30rpx;
				color: #1A1A1A;
			}

			.line {
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 40rpx;
				height: 4rpx;

				background: #1A1A1A;
				border-radius: 2rpx;
			}
		}
	}

	/* 列表 */
	.list {
		padding: 0 20rpx 20rpx;
	}

	.item {
		background: #fff;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
	}

	.common-text {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 24rpx;
		color: #666666;
	}

	.type {
		font-family: PingFangSC, PingFang SC;
		font-weight: 500;
		font-size: 28rpx;
		color: #333333;
	}


	.middle {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		color: #999;

		.amount {
			font-family: DINAlternate, DINAlternate;
			font-weight: bold;
			font-size: 40rpx;
		}

		.red {
			color: #EE4040;
		}

		.green {
			color: #07C160;
		}
	}


	.load-tip {
		text-align: center;
		padding: 20rpx;
		color: #999;
		font-size: 24rpx;
	}
</style>
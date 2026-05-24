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
							<image class="battery" src="/static/images/mine/icon_battery@2x.png" mode="widthFix"></image>
						</view>
						<view class="num">{{ balance }}</view>
					</view>
					<view class="recharge-btn" @click="handleRecharge">充值</view>
				</view>
			</view>

			<!-- 说明 -->
			<view class="desc">
				电池说明：没用完的电池会直接放在这里，下次可以直接使用。电池不能提现，只能消费。
			</view>
		</view>

		<!-- 标签栏 -->


		<view class="tabs">
			<view v-for="item in tabs" :key="item.id" class="tab-item" :class="{ active: currentTab === item.id }"
				@click="handleTab(item.id)">
				<text>{{ item.name }}</text>
				<!-- 底部激活横线 -->
				<view v-if="currentTab === item.id" class="line"></view>
			</view>
		</view>

		<!-- 列表 -->
		<view class="list">
			<view class="item" v-for="(item, index) in list" :key="index">
				<text class="type">{{ item.type == 1 ? '收入' : '消费' }}</text>
				<view class="middle">
					<text class="common-text">{{ item.type == 1 ? '提前结束驾驶退还' : '驾驶扣款' }}</text>
					<text class="amount" :class="item.type == 1 ? 'green': 'red'">
						{{item.type == 1 ? "+" : ''}}{{ item.amount }}
					</text>
				</view>
				<text class="common-text time">{{ formatTime(item.time) }}</text>
			</view>
			<view class="load-tip" v-if="loading">加载中...</view>
			<view class="load-tip" v-if="noMore && list.length > 0">没有更多了</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import {
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app'

	import NavBar from "@/components/nav-bar/nav-bar.vue"
	import {getUserWalletLog} from "@/axios/mine.js"
	import {formatTime} from "@/utils/date.js"
	import {getNavBarHeight} from "@/utils/system.js"
	// ==================== 数据 ====================
	const balance = ref('13123.00')

	const list = ref([])
	const page = ref(1)
	const pageSize = ref(10)
	const loading = ref(false)
	const noMore = ref(false)
	const tabs = [{
			id: 'all',
			name: '全部'
		},
		{
			id: 'recharge',
			name: '充值'
		},
		{
			id: 'consume',
			name: '消费'
		}
	];
	const currentTab = ref('all');
	// ==================== 防抖切换TAB ====================
	let tabTimer = null
	const handleTab = (tab) => {
		if (tab === currentTab.value) return
		clearTimeout(tabTimer)
		tabTimer = setTimeout(() => {
			currentTab.value = tab
			resetAndLoad()
		}, 300)
	}

	// ==================== 重置并加载 ====================
	const resetAndLoad = () => {
		page.value = 1
		list.value = []
		noMore.value = false
		getList()
	}

	// ==================== 获取列表 ====================
	const getList = async () => {
		if (loading.value || noMore.value) return
		loading.value = true

		try {
			await new Promise(r => setTimeout(r, 500))
			const res = Array(10).fill(0).map(() => ({
				  "agent_id": 6,
				                "type": 2,
				                "type_name": "收入",
				                "amount": -2,
				                "time": 1778831525 //时间
			}))

			if (page.value === 1) list.value = res
			else list.value.push(...res)

			if (res.length < pageSize.value) noMore.value = true
			page.value++
		} finally {
			loading.value = false
			uni.stopPullDownRefresh()
		}
	}

	// ==================== 生命周期 ====================
	onReachBottom(() => getList())
	onPullDownRefresh(() => resetAndLoad())
	onMounted(() => getList())

	// ==================== 事件 ====================
	const goBack = () => uni.navigateBack()
	const handleRecharge = () => uni.navigateTo({
		url: "/pages/mine/recharge"
	})
</script>

<style lang="scss" scoped>
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

	/* 电池卡片 */
	.card {
		position: relative;
		z-index: 1;
		padding: 20rpx;
		padding-bottom: 0;
		overflow: hidden;

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
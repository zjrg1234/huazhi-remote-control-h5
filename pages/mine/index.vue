<template>
	<view class="container">
		<!-- #ifndef H5 -->
		<custom-nav-bar></custom-nav-bar>
		<!-- #endif -->

		<view class="bg-image">
			<image class="image" src="/static/images/mine/bg@2x.png" mode="widthFix"></image>
		</view>
		<!-- 顶部用户信息区域 -->
		<view class="header">
			<view class="user-info">
				<view class="avatar-image">
					<image class="avatar" :src="userInfo.head_shot" mode="aspectFill" />
					<image class="arrow-edit" src="/static/images/mine/icon_edit@2x.png" mode="aspectFit" />
				</view>
				<view class="user-text">
					<text class="username">{{userInfo.username}}</text>
					<text class="user-id">ID: {{userInfo.show_id}}</text>
				</view>
			</view>

		</view>

		<!-- 我的资产卡片 -->
		<view class="asset-card">
			<view class="card-title">我的资产</view>
			<view class="card-content">
				<view class="asset-item">
					<text class="asset-num">{{userInfo.wallet.balance}}</text>
					<view class="asset-label" @click="goPage">
						<text>我的电池</text>
						<image class="arrow-icon" src="/static/images/common/icon_arrows@2x.png" mode="aspectFit" />
					</view>
				</view>
				<view class="asset-item">
					<text class="asset-num">{{userInfo.wallet.energy}}</text>
					<text class="asset-label">我的能量</text>
				</view>
			</view>
		</view>


		<!-- 功能列表 -->
		<view class="menu-list">
			<view class="menu-item" v-for="(item, index) in menuList" :key="index" @click="handleClick(item.key, item.url)">
				<view class="menu-left">
					<image class="menu-icon" :src="item.icon" mode="aspectFit" />
					<text class="menu-text">{{ item.name }}</text>
				</view>
				<image class="menu-icon" src="/static/images/common/icon_arrows_gray@2x.png" mode="aspectFit" />
			</view>
		</view>
	</view>

	<BusinessModal v-model:visible="showModal" />

	<CustomModal v-model:visible="serviceModal" title="在线客服" :content="serviceTip" cancelText="拒绝" confirmText="允许"
		@confirm="handleConfirm" @cancel="handleCancel" />
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import BusinessModal from '@/components/business-modal/business-modal.vue'
	import CustomModal from '@/components/common-modal/common-modal.vue'

	import {
		useUserStore
	} from '@/store/modules/user'
	const userStore = useUserStore()

	const userInfo = computed(() => {
		return userStore.getUserInfo()
	})
	const showModal = ref(false)
	const serviceTip = ref("")
	const serviceModal = ref(false)

	const menuList = ref([{
			name: '变更专区',
			icon: '/static/images/mine/icon_change@2x.png',
			key: 'area',
			url: "/pages/mine/changeArea"
		},
		{
			name: '我的预约',
			icon: '/static/images/mine/icon_book@2x.png',
			key: 'order',
			url: '/pages/mine/reservation'
		},
		{
			name: '我的申诉',
			icon: '/static/images/mine/icon_appeal@2x.png',
			key: 'appeal',
			url: '/pages/mine/appeal'
		},
		{
			name: '驾驶记录',
			icon: '/static/images/mine/icon_record@2x.png',
			key: "record",
			url: "/pages/mine/driveRecord"
		},
		{
			name: '在线客服',
			icon: '/static/images/mine/icon_service@2x.png',
			key: 'service',
			url: ''
		},
		{
			name: '商务合作',
			icon: '/static/images/mine/icon_cooperation@2x.png',
			key: 'cooperation',
			url: ''
		},
		{
			name: '设置',
			icon: '/static/images/mine/icon_set@2x.png',
			key: 'set',
			url: '/pages/mine/set'
		}
	])

	const goPage = () => {
		uni.navigateTo({
			url: "/pages/mine/battery"
		})
	}
	const handleClick = (key, url) => {
		if (["area", "order", 'appeal', "record", "set"].includes(key)) {
			uni.navigateTo({
				url
			})
			return
		}

		if (key == 'cooperation') {
			showModal.value = true
			return
		}

		if (key == 'service') {
			// #ifdef MP-TOUTIAO
			serviceTip.value = '是否打开抖音在线客服'
			// #endif

			// #ifdef MP-WEIXIN || H5
			serviceTip.value = '是否打开微信，联系在线客服'
			// #endif

			serviceModal.value = true
		}
	}
	const handleConfirm = () => {
		openService()
	}

	const handleCancel = () => {

	}

	const openService = () => {
		// ======================================
		// 1. 微信小程序 → 官方客服（最稳定）
		// ======================================
		// #ifdef MP-WEIXIN
		uni.openCustomerServiceSession({
			success: () => {},
			fail: () => {
				uni.showToast({
					title: '客服暂时不可用',
					icon: 'none'
				})
			}
		})
		// #endif

		// ======================================
		// 2. 抖音小程序 → 官方IM客服
		// ======================================
		// #ifdef MP-TOUTIAO
		tt.openCustomerServiceConversation({
			success: () => {},
			fail: () => {
				uni.showToast({
					title: '客服暂时不可用',
					icon: 'none'
				})
			}
		})
		// #endif

		// ======================================
		// 3. H5 / App → 打开微信客服链接
		// ======================================
		// #ifndef MP-WEIXIN || MP-TOUTIAO
		uni.showModal({
			title: '联系客服',
			content: '微信：we1731747901',
			confirmText: '复制微信',
			success: (res) => {
				if (res.confirm) {
					uni.setClipboardData({
						data: 'we1731747901',
						success: () => {
							uni.showToast({
								title: '复制成功'
							})
						}
					})
				}
			}
		})
		// #endif
	}
</script>

<style lang="scss" scoped>
	.container {
		position: relative;
		background-color: #fff;
		min-height: 100vh;
		//background: linear-gradient(to bottom, #F9F4E9 0%, #FFFFFF 100%);
	}

	.bg-image {
		position: absolute;
		z-index: 0;
		height: 400rpx;
		width: 100%;

		.image {
			width: 100%;
			height: 100%;
			display: block;
		}
	}

	/* 顶部区域 */
	.header {
		position: relative;
		z-index: 1;
		top: 48rpx;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 20rpx 30rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
		height: 100rpx;
	}

	.avatar-image {
		position: relative;
		z-index: 1;

		.arrow-edit {
			position: absolute;
			bottom: 16rpx;
			right: 16rpx;
			width: 32rpx;
			height: 32rpx;
			display: block;
		}
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		background-color: red;
	}

	.user-text {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.username {
		font-family: PingFangSC, PingFang SC;
		font-weight: 500;
		font-size: 30rpx;
		color: #333;
		line-height: 42rpx;
		margin-bottom: 8rpx;
	}

	.user-id {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 24rpx;
		color: #666666;
	}

	.switch-btn {
		background-color: #fff;
		padding: 10rpx 20rpx;
		border-radius: 20rpx;
		font-size: 26rpx;
		color: #333;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}


	/* 资产卡片 */
	.asset-card {
		position: relative;
		z-index: 1;
		top: 48rpx;
		background-image: url('data:image/png;base64,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');
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
		margin: 20rpx 30rpx;
		border-radius: 24rpx;
		padding: 20rpx 20rpx 30rpx 20rpx;
	}

	.card-title {
		font-family: PingFangSC, PingFang SC;
		font-weight: 500;
		font-size: 28rpx;
		color: $uni-color-2;

	}

	.card-content {
		display: flex;
		justify-content: space-around;
	}

	.asset-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 20rpx;
	}

	.asset-num {
		font-size: 40rpx;
		font-weight: bold;
		color: $uni-color-2;
	}

	.asset-label {
		display: flex;
		//align-items: center;
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 24rpx;
		color: #333;
	}

	.arrow-icon {
		width: 24rpx;
		height: 24rpx;
		margin-top: 7rpx;
		display: block;
	}

	.arrow {
		margin-left: 10rpx;
		font-size: 28rpx;
		color: #666;
	}

	/* 菜单列表 */
	.menu-list {
		background-color: #fff;
		overflow: hidden;
		margin-top: 80rpx;
	}

	.menu-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 34rpx 24rpx;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-left {
		display: flex;
		align-items: center;
	}

	.menu-icon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 5rpx;
	}

	.menu-text {
		font-size: 28rpx;
		color: $uni-color-2;
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
	}
</style>
<template>
	<view class="page">
		<!-- 预约列表 -->
		<view class="list">
			<view class="item" v-for="(item, index) in list" :key="index"
				:class="{ active: item.reservation_status === 'done' }">
				<!-- 状态角标 -->
				<view class="corner-tag" :class="item.reservation_status">
					<image class="image" :src="statusMap[item.reservation_status]" mode="aspectFill"></image>

				</view>

				<!-- 标题 -->
				<view class="title">
					<text class="name">{{ item.vehicle_name }}</text>
				</view>

				<!-- 信息行 -->
				<view class="info-line">
					<text class="label">预约编号：</text>
					<text class="value">{{ item.order_no }}</text>
					<image class="copy-icon" src="/static/images/common/icon_copy@2x.png" mode="aspectFill"
						@click="copyOrderNo(item.order_no)" />
				</view>
				<view class="info-line">
					<text class="label">预约类型：</text>
					<text class="value">{{ payFillText(item.billing_method) }}</text>
				</view>
				<view class="info-line">
					<text class="label">预约场地：</text>
					<text class="value">{{ item.venue_name }}</text>
				</view>
				<view class="info-line">
					<text class="label">预约时间：</text>
					<text class="value">{{ formatTime(item.order_time) }}</text>
				</view>

				<!-- 右侧按钮 -->
				<view class="btn-wrap" v-if="item.reservation_status == 2">
					<button class="btn" @click="handleBtnClick(item)">
						开始驾驶
					</button>
				</view>

				<view class="btn-wrap" v-if="item.reservation_status == 4 && item.is_reservation == 1">
					<button class="btn btn-info" @click="handleBtnClick(item)">
						申诉
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		onLoad,
		onPullDownRefresh
	} from '@dcloudio/uni-app'
	import {
		formatTime
	} from '@/utils/date.js'
	// 状态映射
	// 预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
	const statusMap = {
		2: "/static/images/reservation/icon_waiting@2x.png",
		5: "/static/images/reservation/icon_canceled@2x.png",
		3: "/static/images/reservation/icon_driving@2x.png",
		4: "/static/images/reservation/icon_completed@2x.png"
	}

	// 模拟数据
	const list = ref([])
	const loading = ref(false)

	// 初始化加载
	onLoad(() => {
		fetchData()
	})

	// 下拉刷新触发
	onPullDownRefresh(() => {
		fetchData(true)
	})

	// 获取列表数据
	const fetchData = async (isRefresh = false) => {
		if (loading.value) return
		loading.value = true

		if (isRefresh) {
			list.value = []
		}

		// 模拟接口请求
		await new Promise(resolve => setTimeout(resolve, 800))

		// 生成模拟数据
		list.value = [{
				"id": 1,
				"vehicle_name": "飞车21111", //车辆名称
				"vehicle_id": 12,
				"order_no": "aaacasd13213121", //预约号
				"billing_method": 0, //计费方式 0按时间 1按次
				"venue_id": 1,
				"venue_name": "测试", //场地名称
				"appeal_status": 0, //申诉状态 0未申请 1待处理 2已处理
				"reservation_status": 4, //预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
				"is_reservation": 1,
				"order_time": 1766671601 //订单时间戳
			},
			{
				"id": 1,
				"vehicle_name": "飞车21111", //车辆名称
				"vehicle_id": 12,
				"order_no": "aaacasd13213121", //预约号
				"billing_method": 0, //计费方式 0按时间 1按次
				"venue_id": 1,
				"venue_name": "测试", //场地名称
				"appeal_status": 0, //申诉状态 0未申请 1待处理 2已处理
				"reservation_status": 2, //预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
				"order_time": 1766671601 //订单时间戳
			},
			{
				"id": 1,
				"vehicle_name": "飞车21111", //车辆名称
				"vehicle_id": 12,
				"order_no": "aaacasd13213121", //预约号
				"billing_method": 0, //计费方式 0按时间 1按次
				"venue_id": 1,
				"venue_name": "测试", //场地名称
				"appeal_status": 0, //申诉状态 0未申请 1待处理 2已处理
				"reservation_status": 3, //预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
				"order_time": 1766671601 //订单时间戳
			},
			{
				"id": 1,
				"vehicle_name": "飞车21111", //车辆名称
				"vehicle_id": 12,
				"order_no": "aaacasd13213121", //预约号
				"billing_method": 0, //计费方式 0按时间 1按次
				"venue_id": 1,
				"venue_name": "测试", //场地名称
				"appeal_status": 0, //申诉状态 0未申请 1待处理 2已处理
				"reservation_status": 4, //预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
				"order_time": 1766671601 //订单时间戳
			},
			{
				"id": 1,
				"vehicle_name": "飞车21111", //车辆名称
				"vehicle_id": 12,
				"order_no": "aaacasd13213121", //预约号
				"billing_method": 0, //计费方式 0按时间 1按次
				"venue_id": 1,
				"venue_name": "测试", //场地名称
				"appeal_status": 0, //申诉状态 0未申请 1待处理 2已处理
				"reservation_status": 5, //预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
				"order_time": 1766671601 //订单时间戳
			}
		]

		loading.value = false
		uni.stopPullDownRefresh() // 结束下拉刷新动画
	}

	// 复制预约编号
	const copyOrderNo = (text) => {
		uni.setClipboardData({
			data: text,
			success: () => {
				uni.showToast({
					title: '已复制',
					icon: 'success'
				})
			}
		})
	}

	// 按钮点击事件
	const handleBtnClick = (item) => {

		// 申诉
		if (item.reservation_status == 4 && item.is_reservation == 1) {
			uni.navigateTo({
				url: "/pages/mine/orderAppeal?order_no="+item.order_no
			})
		}	
	}

	const payFillText = (type) => {
		return {
			0: "按时间计费",
			1: "按次计费"
		} [type]
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: #f2f4f7;
	}

	.page {
		padding: 20rpx;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.item {
		background: #fff;
		border-radius: 16rpx;
		padding: 20rpx;
		position: relative;
		overflow: hidden;

		&.active {
			border: 2rpx solid #409eff;
		}

		.corner-tag {
			position: absolute;
			top: 0;
			right: 0;
			width: 84rpx;
			height: 84rpx;
			overflow: hidden;
			z-index: 1;

			.image {
				width: 100%;
				height: 100%;
				display: block;
			}
		}

		.title {
			margin-bottom: 20rpx;

			.name {
				font-family: PingFangSC, PingFang SC;
				font-weight: 500;
				font-size: 28rpx;
				color: $uni-color-1;
			}
		}

		.info-line {
			display: flex;
			align-items: center;
			margin: 10rpx 0;


			.label {
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 24rpx;
				color: #777777;
			}

			.value {
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 24rpx;
				color: $uni-color-1;
				margin-left: 8rpx;
			}

			.copy-icon {
				width: 32rpx;
				height: 32rpx;
				margin-left: 10rpx;
			}
		}

		.btn-wrap {
			position: absolute;
			right: 20rpx;
			top: 50%;
			transform: translateY(-50%);
			min-width: 140rpx;
			.btn {
				text-align: center;
				background: #FFC838;
				border-radius: 12rpx;
				border: none;
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 24rpx;
				color: #1A1A1A;

			}
			.btn-info {
				border: 1rpx solid #FFC838;
				background: none;
			}
		}
	}
</style>
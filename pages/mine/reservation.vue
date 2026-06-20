<template>
	<view class="page">
		<!-- 预约列表 -->
		<view class="list">
			<view 
				class="item" 
				v-for="(item, index) in list" 
				:key="item.order_no || index"
				:class="{ active: item.reservation_status === 4 }"
			>
				<!-- 状态角标 -->
				<view class="corner-tag" :class="item.reservation_status">
					<image 
						class="image" 
						:src="statusMap[item.reservation_status]" 
						mode="aspectFill"
					></image>
				</view>

				<!-- 标题 -->
				<view class="title">
					<text class="name">{{ item.vehicle_name }}</text>
				</view>

				<!-- 信息行 -->
				<view class="info-line">
					<text class="label">预约编号：</text>
					<text class="value">{{ item.order_no }}</text>
					<image 
						class="copy-icon" 
						src="/static/images/common/icon_copy@2x.png" 
						mode="aspectFill"
						@click="copyOrderNo(item.order_no)" 
					/>
				</view>
				<view class="info-line">
					<text class="label">预约类型：</text>
					<text class="value">{{ billingMethod(item.billing_method) }}</text>
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
				<view class="btn-wrap" v-if="item.reservation_status == 1 || item.reservation_status == 2">
					<button class="btn" @click="handleAction(item)">
						开始驾驶
					</button>
				</view>

				<view class="btn-wrap" v-if="item.reservation_status == 4 && item.is_reservation == 1">
					<button class="btn btn-info" @click="handleAppeal(item)">
						申诉
					</button>
				</view>
			</view>

			<!-- 加载状态提示 -->
			<view class="loading-tips" v-if="loadingMore">
				<text>加载中...</text>
			</view>
			<view class="loading-tips" v-if="!hasMore && list.length > 0">
				<text>没有更多了</text>
			</view>
			<view class="loading-tips" v-if="!loading && list.length === 0">
				<text>暂无预约记录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { formatTime } from '@/utils/date.js'
import { GetReservationList } from "@/axios/mine"
import { billingMethod } from "@/utils/filter.js"

// 状态映射：预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
const statusMap = {
	2: "/static/images/reservation/icon_waiting@2x.png",
	5: "/static/images/reservation/icon_canceled@2x.png",
	3: "/static/images/reservation/icon_driving@2x.png",
	4: "/static/images/reservation/icon_completed@2x.png"
}

// 列表数据
const list = ref([])

// 分页参数
const page = ref(1)
const pageSize = 10
const hasMore = ref(true)

// 加载状态
const loading = ref(false)
const loadingMore = ref(false)

// 初始化加载
onLoad(() => {
	fetchData()
})

// 下拉刷新
onPullDownRefresh(() => {
	refreshData()
})

// 上拉触底加载更多
onReachBottom(() => {
	if (hasMore.value && !loading.value && !loadingMore.value) {
		loadMore()
	}
})

// 刷新数据（下拉刷新调用）
const refreshData = async () => {
	page.value = 1
	hasMore.value = true
	list.value = []
	await fetchData()
	uni.stopPullDownRefresh()
}

// 加载更多（上拉触底调用）
const loadMore = async () => {
	if (!hasMore.value) return
	page.value++
	await fetchData()
}

// 获取列表数据
const fetchData = async () => {
	// 判断是首次加载还是加载更多
	const isLoadMore = page.value > 1
	if (isLoadMore) {
		loadingMore.value = true
	} else {
		loading.value = true
	}

	try {
		const params = {
			page: page.value,
			pageSize: pageSize
		}
		const { data } = await GetReservationList(params)
		const content = data?.content || []

		if (isLoadMore) {
			// 追加数据
			list.value = list.value.concat(content)
		} else {
			// 覆盖数据
			list.value = content
		}

		// 判断是否还有更多数据
		hasMore.value = content.length >= pageSize

	} catch (error) {
		console.error('获取预约列表失败:', error)
		// 加载失败时页码回退
		if (page.value > 1) {
			page.value--
		}
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
		loadingMore.value = false
	}
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
const handleAction = (item) => {

}
// 按钮点击事件
const handleAppeal = (item) => {
	// 申诉
	if (item.reservation_status == 4 && item.is_reservation == 1) {
		uni.navigateTo({
			url: "/pages/mine/orderAppeal?order_no=" + item.order_no
		})
	}
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
		top: 60%;
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

// 加载提示样式
.loading-tips {
	text-align: center;
	padding: 20rpx;
	font-size: 24rpx;
	color: #999;
}
</style>
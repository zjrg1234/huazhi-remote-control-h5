<template>
  <view class="container">
    <!-- 1. 顶部 Tab 切换 -->
    <view class="tabs">
      <view
        v-for="item in tabs"
        :key="item.id"
        class="tab-item"
        :class="{ active: currentTab === item.id }"
        @click="switchTab(item.id)"
      >
        <text>{{ item.name }}</text>
        <!-- 底部激活横线 -->
        <view v-if="currentTab === item.id" class="line"></view>
      </view>
    </view>

    <!-- 2. 账单列表 -->
    <scroll-view class="list" scroll-y>
      <view
        v-for="(item, index) in filteredList"
        :key="index"
        class="card"
      >
        <!-- 第一行：标题 + 金额 -->
        <view class="row header">
          <text class="title">{{ item.title }}</text>
          <text
            class="amount"
            :class="item.amount >= 0 ? 'income' : 'expense'"
          >
            {{ item.amount >= 0 ? '+' : '' }}{{ item.amount.toFixed(2) }}
          </text>
        </view>

        <!-- 第二行：子标题 -->
        <view class="row sub-header">
          <text class="sub-title">{{ item.subTitle }}</text>
        </view>

        <!-- 第三行：时间 -->
        <view class="row time">
          <text class="time-text">{{ item.time }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredList.length === 0" class="empty">
        <text>暂无数据</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

// 当前选中的 Tab
const currentTab = ref('all');

// Tab 数据
const tabs = [
  { id: 'all', name: '全部' },
  { id: 'recharge', name: '充值' },
  { id: 'consume', name: '消费' }
];

// 模拟账单数据
const billList = ref([
  {
    id: 1,
    title: '收入',
    subTitle: '充值',
    amount: 39.80,
    time: '2025-06-01 12:32:34',
    type: 'recharge'
  },
  {
    id: 2,
    title: '消费',
    subTitle: '消费',
    amount: -14.00,
    time: '2025-06-01 12:32:34',
    type: 'consume'
  },
  {
    id: 3,
    title: '收入',
    subTitle: '充值',
    amount: 100.00,
    time: '2025-05-20 09:15:00',
    type: 'recharge'
  }
]);

// 切换 Tab
const switchTab = (id) => {
  currentTab.value = id;
};

// 计算属性：根据 Tab 过滤列表
const filteredList = computed(() => {
  if (currentTab.value === 'all') {
    return billList.value;
  }
  return billList.value.filter(item => item.type === currentTab.value);
});
</script>

<style lang="scss" scoped>
.container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 20rpx 30rpx;
}

/* Tab 样式 */
.tabs {
  display: flex;
  justify-content: space-around;
  background: #ffffff;
  padding: 20rpx 0;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .tab-item {
    position: relative;
    font-size: 32rpx;
    color: #666;
    padding: 10rpx 40rpx;

    &.active {
      font-weight: bold;
      color: #000;
    }

    .line {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 6rpx;
      background-color: #000;
      border-radius: 4rpx;
    }
  }
}

/* 列表样式 */
.list {
  height: calc(100vh - 200rpx); /* 简单的高度计算，实际项目中可根据需要调整 */
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
}

.row {
  margin-bottom: 15rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    margin-bottom: 0;
  }
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.sub-title {
  font-size: 28rpx;
  color: #666;
}

.time-text {
  font-size: 24rpx;
  color: #999;
}

.amount {
  font-size: 36rpx;
  font-weight: bold;
  font-family: 'Courier New', Courier, monospace; /* 数字字体 */
}

.income {
  color: #07c160; /* 微信绿 */
}

.expense {
  color: #ff5a5f; /* 警示红 */
}

.empty {
  text-align: center;
  margin-top: 100rpx;
  color: #999;
}
</style>

<template>
	<view class="page">
		<!-- 自定义导航栏（H5不显示） -->
		<!-- #ifndef H5 -->
		<custom-nav-bar title="我的电池"></custom-nav-bar>
		<!-- #endif -->

		<view class="wrap-content">
			<!-- #ifdef H5 -->

			<NavBar title="我的电池" url="/pages/mine/index"></NavBar>
			<!-- #endif -->

			<!-- 顶部背景图 -->
			<view class="bg-image">
				<image class="image" src="/static/images/mine/bg2@2x.png" mode="widthFix"></image>
			</view>

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
				<view class="top">
					<text class="type">{{ item.type === 'in' ? '收入' : '消费' }}</text>
					<text class="amount" :class="item.type">
						{{ item.type === 'in' ? '+' : '-' }}{{ item.amount }}
					</text>
				</view>
				<view class="bottom">
					<text class="name">{{ item.desc }}</text>
					<text class="time">{{ item.createTime }}</text>
				</view>
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
				type: Math.random() > 0.5 ? 'in' : 'out',
				desc: Math.random() > 0.5 ? '电池充值' : '驾驶消费',
				amount: (Math.random() * 100).toFixed(2),
				createTime: '2025-06-16 12:00:00'
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
	const handleRecharge = () => uni.showToast({
		title: '去充值',
		icon: 'none'
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
		top: -88rpx;
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
		margin-top: 30rpx;
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
		padding: 32rpx;
		margin-bottom: 16rpx;
	}

	.top {
		display: flex;
		justify-content: space-between;
		margin-bottom: 16rpx;

		.type {
			font-size: 30rpx;
			color: #333;
			font-weight: 500;
		}

		.amount {
			font-size: 32rpx;
			font-weight: bold;

			&.in {
				color: #07C160;
			}

			&.out {
				color: #F53F3F;
			}
		}
	}

	.bottom {
		display: flex;
		justify-content: space-between;
		color: #999;
		font-size: 24rpx;
	}

	.load-tip {
		text-align: center;
		padding: 20rpx;
		color: #999;
		font-size: 24rpx;
	}
</style>
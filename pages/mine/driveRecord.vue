<template>
  <view class="page">
    <!-- 列表 -->
    <view class="list">
      <view
        class="item"
        v-for="(item, index) in list"
        :key="index"
      >
        <!-- 头像 + 用户名 -->
        <view class="header">
          <image class="avatar" :src="item.head_shot" mode="aspectFill" />
          <text class="username">{{ item.user_name }}</text>
        </view>

        <!-- 信息列表 -->
        <view class="info-list">
          <view class="info-item">
            <text class="label">预约编号：</text>
            <text class="value">{{ item.order_no }}</text>
          </view>
          <view class="info-item">
            <text class="label">驾驶场地：</text>
            <text class="value">{{ item.venue_name }}</text>
          </view>
          <view class="info-item">
            <text class="label">驾驶车辆：</text>
            <text class="value">{{ item.vehicle_name }}</text>
          </view>
          <view class="info-item">
            <text class="label">预约类型：</text>
            <text class="value">{{ billingMethod(item.billing_method) }}</text>
          </view>
          <view class="info-item">
            <text class="label">预约时间：</text>
            <text class="value">{{ formatTime(item.order_time) }}</text>
          </view>
          <view class="info-item">
            <text class="label">驾驶时长：</text>
            <text class="value">{{ compareTimestamp(item.start_time, item.end_time).text }}</text>
          </view>
          <view class="info-item">
            <text class="label">消费电池：</text>
            <text class="value">{{ paymentType(item.payment_type) }} {{item.payment_amount}}</text>
          </view>
          <view class="info-item">
            <text class="label">开始时间：</text>
            <text class="value">{{ formatTime(item.start_time)  }}</text>
          </view>
          <view class="info-item">
            <text class="label">结束时间：</text>
            <text class="value">{{ formatTime(item.end_time) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom, } from "@dcloudio/uni-app"
import {GetDrivingRecordlList} from "@/axios/mine.js"
import {reservationStatus, billingMethod, paymentType} from "@/utils/filter.js"
import {formatTime, compareTimestamp} from "@/utils/date.js"
// ==================== 核心变量 ====================
const list = ref([])        // 列表数据
const page = ref(1)         // 当前页码
const pageSize = ref(10)    // 每页条数
const loading = ref(false)  // 加载锁（节流，防止重复触发）
const noMore = ref(false)    // 是否没有更多数据

// ==================== 模拟接口请求 ====================
const getList = async () => {
  // 节流：正在加载 或 没有更多 → 直接return
  if (loading.value || noMore.value) return

  loading.value = true

  // 模拟请求
  setTimeout(() => {
    // 模拟后端返回数据
    const res = Array(10).fill(0).map((_, i) => ({
      head_shot: "/static/logo.png",
       "id": 1,
				"user_name": "大笆斗", //用户名称
				"vehicle_name": "飞车21111",//车辆名称
				"vehicle_id": 12,
				"order_no": "aaacasd13213121", //预约号
				"billing_method": 0, //计费方式 0按时间 1按次
				"venue_id": 1,
				payment_type: 2,
				"venue_name": "测试", //场地名称
				"payment_amount": 8, //金额｜能量｜电池
				"appeal_status": 0,//申诉状态 0未申请 1待处理 2已处理
				"reservation_status": 3, //状态 1已预约 2待使用 3使用中 4已完成 5已取消
				"order_time": 1766671601, //订单时间
				"start_time": 1766671612, //开始时间
				"end_time": 1766671618 //结束时间1766671618

    }))

    // 第一页 → 覆盖
    if (page.value === 1) {
      list.value = res
    } else {
      // 后续页 → 追加
      list.value.push(...res)
    }

    // 如果返回数据不足一页 → 没有更多
    if (res.length < pageSize.value) {
      noMore.value = true
    }

    page.value++
    loading.value = false
  }, 800)
}

// ==================== 上拉触底加载（核心） ====================
onReachBottom(() => {
  console.log("触底了")
  getList()
})

// ==================== 页面加载 ====================
onLoad(() => {
  getList()
})
</script>
<style lang="scss" scoped>

.page {
 background: #F8F8F8;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
	padding: 20rpx;
}

.item {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 20rpx 20rpx 30rpx 20rpx;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }

  .username {
    font-family: PingFangSC, PingFang SC;
    font-weight: 600;
    font-size: 28rpx;
    color: #1A1A1A;
		line-height: 40rpx;
		text-align: left;
		font-style: normal;
  }
}

.info-list {
  .info-item {
    display: flex;
    margin-bottom: 16rpx;
    font-size: 0;

    .label {
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 24rpx;
			color: #777777;
		
			text-align: left;
      white-space: nowrap;
    }
    .value {
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 24rpx;
      color: #1A1A1A;

      text-align: left;
      font-style: normal;
      margin-left: 10rpx;
    }
  }
}
</style>
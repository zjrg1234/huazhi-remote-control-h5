<template>
  <view class="page">
    <!-- 列表 -->
    <view class="list">
      <view class="item" v-for="(item, index) in list" :key="index">
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
            <text class="value">{{ formatDate(item.order_time) }}</text>
          </view>
          <view class="info-item">
            <text class="label">驾驶时长：</text>
            <text class="value">{{ compareTimestamp(item.start_time, item.end_time).text }}</text>
          </view>
          <view class="info-item">
            <text class="label">消费电池：</text>
            <text class="value">{{ paymentType(item.payment_type) }} {{ item.payment_amount }}</text>
          </view>
          <view class="info-item">
            <text class="label">开始时间：</text>
            <text class="value">{{ formatDate(item.start_time) }}</text>
          </view>
          <view class="info-item">
            <text class="label">结束时间：</text>
            <text class="value">{{ formatDate(item.end_time) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom, } from "@dcloudio/uni-app"
import { GetDrivingRecordlList } from "@/axios/mine.js"
import { reservationStatus, billingMethod, paymentType } from "../utils/filter.js"
import { formatDate, compareTimestamp } from "../utils/utils.js"
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
  const res = await GetDrivingRecordlList({
    page: page.value,
    size: 20,
  })

  // 第一页 → 覆盖
  if (page.value === 1) {
    list.value = res.data.content
  } else {
    // 后续页 → 追加
    if (res.data.content && res.data.content.length) {
      list.value = [...list.value, ...res.data.content]
    }
  }

  // 如果返回数据不足一页 → 没有更多
  if (res.data.content.length < pageSize.value) {
    noMore.value = true
  }

  page.value++
  loading.value = false
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
  padding-left: 80rpx;

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
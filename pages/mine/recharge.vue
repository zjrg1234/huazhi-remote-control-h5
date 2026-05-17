<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back" @click="goBack">&lt;</view>
      <text class="title">我的电池</text>
    </view>

    <!-- 电池余额卡片 -->
    <view class="balance-card">
      <view class="label">我的电池 <image class="icon" src="/static/icon_gift.png" /></view>
      <view class="num">13123</view>
    </view>

    <!-- 标签切换 -->
    <view class="tabs">
      <text class="tab" :class="{ active: tab === 'normal' }" @click="tab = 'normal'">普通充值</text>
      <text class="tab" :class="{ active: tab === 'first' }" @click="tab = 'first'">首充优惠</text>
    </view>

    <!-- 充值套餐 -->
    <view class="section">
      <text class="section-title">充值套餐</text>
      <view class="package-list">
        <view
          class="package-item"
          :class="{ active: selectedPackage === item.value }"
          v-for="item in packageList"
          :key="item.value"
          @click="selectedPackage = item.value"
        >
          <view class="num">{{ item.value }} <image class="icon" src="/static/icon_gift.png" /></view>
          <view class="price">¥{{ item.price.toFixed(2) }}</view>
        </view>
      </view>
    </view>

    <!-- 自定义充值 -->
    <view class="section">
      <text class="section-title">自定义数量充值</text>
      <input
        class="custom-input"
        type="number"
        placeholder="请输入电池数量（不低于3个）"
        v-model.number="customNum"
      />
    </view>

    <!-- 支付方式 -->
    <view class="section">
      <text class="section-title">支付方式</text>
      <view class="pay-list">
        <view
          class="pay-item"
          :class="{ active: payType === 'alipay' }"
          @click="payType = 'alipay'"
        >
          <image class="pay-icon" src="/static/icon_alipay.png" />
          <text>支付宝支付</text>
        </view>
        <view
          class="pay-item"
          :class="{ active: payType === 'wechat' }"
          @click="payType = 'wechat'"
        >
          <image class="pay-icon" src="/static/icon_wechat.png" />
          <text>微信支付</text>
        </view>
      </view>
    </view>

    <!-- 说明文字 -->
    <view class="desc">
      <text class="desc-title">充值说明：</text>
      <text class="desc-item">1. 如您未满18岁，请在监护人陪同下操作；</text>
    </view>

    <!-- 确定按钮 -->
    <button class="submit-btn" @click="handleSubmit">确定</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 当前选中标签
const tab = ref('normal')

// 选中的套餐
const selectedPackage = ref(null)

// 自定义充值数量
const customNum = ref(null)

// 支付方式
const payType = ref('alipay')

// 套餐列表
const packageList = ref([
  { value: 10, price: 10 },
  { value: 20, price: 20 },
  { value: 50, price: 50 },
  { value: 100, price: 100 },
  { value: 200, price: 200 },
  { value: 500, price: 500 }
])

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 提交
const handleSubmit = () => {
  let amount = 0
  if (selectedPackage.value) {
    amount = selectedPackage.value
  } else if (customNum.value && customNum.value >= 3) {
    amount = customNum.value
  } else {
    uni.showToast({ title: '请选择或输入充值数量', icon: 'none' })
    return
  }

  uni.showToast({
    title: `充值 ${amount} 电池，使用${payType.value === 'alipay' ? '支付宝' : '微信'}支付`,
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
page {
  background: #f5f6f8;
}

.page {
  min-height: 100vh;
  padding-bottom: 40rpx;
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
  background: #fff;

  .tab {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 30rpx;
    color: #666;

    &.active {
      color: #333;
      font-weight: bold;
      border-bottom: 4rpx solid #ffc832;
    }
  }
}

/* 通用 section */
.section {
  background: #fff;
  margin: 20rpx 30rpx 0;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: 500;
    margin-bottom: 20rpx;
    display: block;
  }
}

/* 套餐列表 */
.package-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .package-item {
    width: calc((100% - 40rpx) / 3);
    border: 1rpx solid #eee;
    border-radius: 12rpx;
    padding: 24rpx 10rpx;
    text-align: center;

    .num {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
      display: flex;
      align-items: center;
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

    &.active {
      border-color: #ffc832;
      background: #fff9e6;

      .num {
        color: #ff9800;
      }
    }
  }
}

/* 自定义输入框 */
.custom-input {
  width: 100%;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 20rpx;
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

    .pay-icon {
      width: 40rpx;
      height: 40rpx;
    }

    &.active {
      border-color: #ffc832;
      background: #ffc832;
      color: #fff;
    }
  }
}

/* 说明文字 */
.desc {
  margin: 20rpx 30rpx;
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

/* 提交按钮 */
.submit-btn {
  width: calc(100% - 60rpx);
  margin: 40rpx 30rpx 0;
  height: 96rpx;
  background: #ffc832;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  color: #333;
}
</style>
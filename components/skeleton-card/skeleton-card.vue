<template>
  <view class="skeleton-card" :style="{ height: cardHeight }">
    <!-- 图片占位 -->
    <view class="skeleton-img"></view>
    <!-- 底部信息占位 -->
    <view class="skeleton-info">
      <view class="fline">
        <view class="skeleton-title"></view>
        <view class="skeleton-tag"></view>
      </view>

      <view class="skeleton-queue"></view>
    </view>
    <!-- 右上角状态占位 -->
    <view class="skeleton-meta"></view>
  </view>
</template>

<script setup>
defineProps({
  cardHeight: {
    type: String,
    default: "400rpx",
  },
});
</script>

<style scoped>
.skeleton-card {
  position: relative;
  background: #f0f0f0;
  border-radius: 16rpx;
  overflow: hidden;
  width: 100%;
  margin-bottom: 15rpx;
}
.skeleton-img {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-info {
  position: absolute;
  bottom: 0;
  padding: 10rpx;
  width: 100%;
  box-sizing: border-box;
}
.skeleton-title {
  width: 60%;
  height: 32rpx;
  background: #e0e0e0;
  border-radius: 8rpx;

  display: inline-block;
}
.skeleton-tag {
  width: 80rpx;
  height: 30rpx;
  background: #e0e0e0;
  border-radius: 4rpx;
  display: inline-block;
  margin-left: 10rpx;
}
.skeleton-queue {
  display: block;
  width: 100%;
  height: 30rpx;
  background: #e0e0e0;
  margin-top: 8rpx;
  border-radius:4rpx;
}
.skeleton-meta {
  position: absolute;
  right: 10rpx;
  top: 10rpx;
  width: 80rpx;
  height: 30rpx;
  background: #e0e0e0;
  border-radius: 20rpx;
}
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>

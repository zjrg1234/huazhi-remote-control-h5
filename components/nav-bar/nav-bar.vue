<template>
  <view class="nav-bar">
    <!-- 返回按钮 -->
    <view class="nav-back" @click="handleBack">
      <image 
        class="back-icon" 
        src="/static/images/common/icon_arrows@2x.png" 
        mode="widthFix"
      />
    </view>

    <!-- 标题 -->
    <text class="nav-title">{{ title }}</text>
  </view>
</template>

<script setup>
const props = defineProps({
  // 标题文字
  title: {
    type: String,
    default: ''
  },
	url: {
	  type: String,
	  default: ''
	}
})

const emit = defineEmits(['back'])

// 返回事件
const handleBack = () => {
  emit('back')
	if(props.url) {
		history.back();
	} else {
		 window.location.href = "/index/index"
	}
}
</script>

<style lang="scss" scoped>
.nav-bar {
  position: relative;
  z-index: 99;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
}

.nav-back {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
}

.back-icon {
  width: 48rpx;
  height: 48rpx;
  transform: rotate(180deg); /* 箭头方向正确 */
}

.nav-title {

	font-family: PingFangSC, PingFang SC;
	font-weight: 500;
	font-size: 32rpx;
	color: #333333;
}
</style>
<template>
  <!-- 商务合作弹窗 -->
  <view v-if="visible" class="modal-mask" @click.self="close">
    <view class="modal-box">
      <view class="title">商务合作</view>

      <view class="item">
				<view class="line">
					<image class="icon" src="/static/images/common/icon_wechat@2x.png" mode="aspectFill"
					 />
					<text class="label">微信：</text>
				</view>
				<view class="line">
					<text class="text">we1731747901</text>
				<image class="icon" src="/static/images/common/icon_copy@2x.png" mode="aspectFill"
					@click="copy('we1731747901')"
				 />
				</view>
      </view>

      <view class="item mb">
				<view class="line">
					<image class="icon" src="/static/images/common/icon_email@2x.png" mode="aspectFill"
					 />
					<text class="label">邮箱：</text>
				</view>
        
				<view class="line">
						 <text class="text">fuhuanyong@sqzskj.cn</text>
						 <image class="icon" src="/static/images/common/icon_copy@2x.png" mode="aspectFill"
						 	@click="copy('fuhuanyong@sqzskj.cn')" />
				</view>
      </view>
      <view class="confirm common-btn" @click="close">确定</view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

// 关闭弹窗
const close = () => {
  emit('update:visible', false)
}

// 复制
const copy = (text) => {
 
	
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
</script>

<style lang="scss" scoped>
/* 遮罩 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* 弹窗 */
.modal-box {
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
}

/* 标题 */
.title {
  text-align: center;
 
  margin-bottom: 32rpx;
	font-family: PingFangSC, PingFang SC;
	font-weight: 500;
	font-size: 32rpx;
	color: #222222;
}

/* 行 */
.item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
	
	.line {
		display: flex;
		align-items: center;
	}
}
.mb {
	margin-bottom: 60rpx;
}
.label {
  width: 90rpx;
  font-size: 28rpx;
  color: #333;
	margin-left: 10rpx;
}

.text {
  flex: 1;
	font-family: PingFangSC, PingFang SC;
	font-weight: 400;
	font-size: 28rpx;
	color: #333333;
	margin-right: 20rpx;
}

/* 复制按钮 */
.icon {
  width: 32rpx;
  height: 32rpx;
  
}

/* 确定按钮 */
.confirm {
  width: 100%;
  height: 80rpx;
 
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
	margin: 0 auto;
}
</style>
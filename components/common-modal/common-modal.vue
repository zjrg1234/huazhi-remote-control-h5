<template>
  <!-- 蒙层：使用 v-show 避免频繁销毁组件，配合 v-if 确保逻辑正确 -->
  <view v-if="visible" class="modal-overlay" @touchmove.stop.prevent>
    <!-- 弹窗主体 -->
    <view class="modal-container">
      <!-- 标题 -->
      <view class="modal-title">{{ title }}</view>

      <!-- 内容区域 -->
      <view class="modal-content">
        <text class="content-text">{{ content }}</text>
      </view>

		  <view class="btn-group">
		        <view class="btn refuse" @click="onCancel">{{ cancelText }}</view>
		        <view class="btn allow" @click="onConfirm">{{ confirmText }}</view>
		  </view>

 
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

// --- 1. 定义 Props (接收外部传值) ---
const props = defineProps({
  // 控制弹窗显示隐藏
  visible: {
    type: Boolean,
    default: false
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 内容文本
  content: {
    type: String,
    default: ''
  },
  // 取消按钮文字
  cancelText: {
    type: String,
    default: ''
  },
  // 确认按钮文字
  confirmText: {
    type: String,
    default: ''
  }
})

// --- 2. 定义 Emits (向父组件发送事件) ---
const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// --- 3. 逻辑处理 ---

// 处理点击遮罩或取消
const onCancel = () => {
  // 触发 update:visible 事件，支持 v-model:visible 双向绑定
  emit('update:visible', false)
  // 触发取消事件
  emit('cancel')
}

// 处理点击确认
const onConfirm = () => {
  // 这里可以添加额外的逻辑，比如调用微信 API
  emit('confirm')
  // 根据需求，点击确认后通常也会关闭弹窗
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
/* --- 4. 样式部分 --- */

/* 蒙层：半透明黑色背景 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  z-index: 999;
  /* 使用 flex 居中弹窗 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 弹窗容器 */
.modal-container {
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden; /* 确保内部元素不溢出圆角 */
  /* 简单的淡入动画 */
  animation: modalFadeIn 0.3s ease-out;
}

/* 标题样式 */
.modal-title {
  padding: 32rpx 45rpx;
  text-align: center;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 32rpx;
  color: #222222;
}


.modal-content {
  padding: 0 20rpx;
  text-align: center;
	margin-bottom: 75rpx;
}

.content-text {
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 28rpx;
  color: #333333;
}
.btn-group {
  display: flex;
  justify-content: space-around;
	padding: 0 32rpx;
	margin-bottom: 32rpx;
}

.btn {

  text-align: center;
	padding: 18rpx 86rpx;
   border-radius: 16rpx;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 30rpx;
  color: #222222;
}

.refuse {
 
  background: #F0F0F0;

}

.allow {
	font-weight: 600;
  background: #FFC838;
}

/* 动画定义 */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
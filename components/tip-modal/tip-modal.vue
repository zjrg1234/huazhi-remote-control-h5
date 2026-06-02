<template>
  <!-- 使用 Transition 包裹，支持进场/离场动画 -->
  <Transition name="modal-fade">
    <view v-if="visible" class="modal-overlay" @touchmove.stop.prevent>
      <!-- 弹窗主体：点击遮罩关闭（可选） -->
      <view class="modal-container" @click.stop>
        <!-- ✅ 标题插槽 -->
        <view class="modal-title">
          <slot name="title">
            <text v-if="title">{{ title }}</text>
          </slot>
        </view>

        <!-- ✅ 内容插槽 -->
        <view class="modal-content">
          <slot name="content">
            <text class="content-text">{{ content }}</text>
          </slot>
        </view>

        <!-- ✅ 底部按钮插槽 -->
        <view class="btn-group">
          <slot name="footer">
            <view class="btn refuse" @click="onCancel">{{ cancelText || '取消' }}</view>
            <view class="btn allow" @click="onConfirm">{{ confirmText || '确认' }}</view>
          </slot>
        </view>
      </view>
    </view>
  </Transition>
</template>

<script setup>
/**
 * 通用弹窗组件
 * 支持 v-model:visible 双向绑定
 * 支持 title / content / footer 三个具名插槽
 */

// --- Props ---
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmText: {
    type: String,
    default: '确认'
  }
})

// --- Emits ---
const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// --- Methods ---
const onCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const onConfirm = () => {
  emit('confirm')
  // 注意：确认按钮是否自动关闭由父组件决定
  // 如果希望确认后自动关闭，可在此处加上 emit('update:visible', false)
  // 但推荐由父组件控制，以支持异步操作（如请求成功后再关闭）
}
</script>

<style lang="scss" scoped>
/* ========== 蒙层 ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ========== 弹窗容器 ========== */
.modal-container {
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

/* ========== 标题 ========== */
.modal-title {
  padding: 32rpx 45rpx;
  text-align: center;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 32rpx;
  color: #222222;

  /* 当插槽传入自定义内容时，移除默认间距 */
  &:empty {
    display: none;
  }
}

/* ========== 内容区 ========== */
.modal-content {
  padding: 0 40rpx;
  text-align: center;
  margin-bottom: 75rpx;
}

.content-text {
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

/* ========== 按钮组 ========== */
.btn-group {
  display: flex;
  justify-content: space-around;
  padding: 0 32rpx 32rpx;
}

.btn {
  text-align: center;
  padding: 18rpx 86rpx;
  border-radius: 16rpx;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 30rpx;
  color: #222222;

  &.refuse {
    background: #f0f0f0;
  }

  &.allow {
    font-weight: 600;
    background: #ffc838;
  }
}

/* ========== Transition 动画 ========== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;

  .modal-container {
    transition: transform 0.3s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.8);
  }
}
</style>
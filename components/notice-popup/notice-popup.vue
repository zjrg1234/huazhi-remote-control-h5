<template>
  <view v-if="visible" class="notice-mask" @click.stop="handleMaskClick">
    <!-- 弹窗主体 -->
    <view class="notice-popup" @click.stop>
      <view class="notice-header">
        <text class="notice-title">{{ title }}</text>
      </view>

      <scroll-view scroll-y class="notice-content">
        <rich-text v-if="isRichText" :nodes="content" />
        <text v-else class="notice-text">{{ content }}</text>
      </scroll-view>
    </view>

    <!-- ✅ 关闭按钮移到 popup 外部，不再受 overflow:hidden 影响 -->
    <view v-if="showClose" class="notice-close" @click.stop="handleClose">
      <image
        class="image"
        src="/static/images/common/close.png"
        mode="aspectFit"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
// script 部分无需修改，保持原样即可
import { ref, watch } from 'vue';

interface Props {
  modelValue: boolean;
  title?: string;
  content: string;
  isRichText?: boolean;
  confirmText?: string;
  showClose?: boolean;
  maskClosable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '公告',
  confirmText: '我知道了',
  showClose: true,
  maskClosable: false,
  isRichText: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'close'): void;
}>();

const visible = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  visible.value = val;
});

const close = () => {
  visible.value = false;
  emit('update:modelValue', false);
};

const handleConfirm = () => {
  emit('confirm');
  close();
};

const handleClose = () => {
  emit('close');
  close();
};

const handleMaskClick = () => {
  if (props.maskClosable) close();
};
</script>

<style scoped lang="scss">
.notice-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  flex-direction: column;       /* ✅ 改为纵向排列，方便弹窗+关闭按钮垂直居中 */
  align-items: center;
  justify-content: center;
}

.notice-popup {
  position: relative;
  width: 650rpx;
  height: 50vh;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;            /* ✅ 只裁剪弹窗内容，不影响外部关闭按钮 */
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.25s ease;
}

.notice-header {
  padding: 32rpx 32rpx 16rpx;
  text-align: center;
}

.notice-title {
    font-family: PingFangSC, PingFang SC;

  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.notice-content {
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
  flex: 1;
  padding: 20rpx;
  width: 610rpx;
  font-size: 28rpx;
  color: #333;
}

.notice-text {

    font-family: PingFangSC, PingFang SC;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* ✅ 关闭按钮样式重写 */
.notice-close {
  margin-top: 40rpx;           /* 与弹窗底部的间距 */
  width: 62rpx;
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  .image {
    width: 62rpx;
    height: 62rpx;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
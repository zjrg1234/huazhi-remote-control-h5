<template>
  <view
    class="ripple-btn"
    @touchstart="handleTouchStart"
    @touchend="stopRipple"
    @touchcancel="stopRipple"
  >
    <image
      class="image"
      src="/static/images/icon_microphone_open@2x.png"
      mode="aspectFit"
    />

    <!-- 动态水波纹节点 -->
    <view
      v-for="ripple in ripples"
      :key="ripple.id"
      class="ripple-effect"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
        width: ripple.size + 'px',
        height: ripple.size + 'px',
        opacity: ripple.opacity,
      }"
    ></view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance, onUnmounted } from "vue";

// ✅ 【修复核心】：在 setup 最顶层获取并保存实例，防止事件回调中获取为 null
const instance = getCurrentInstance();

const ripples = ref([]);
const INTERVAL = 1000; // 长按持续触发波纹的间隔时间（毫秒）
const ALPHA = 0.4; // 波纹透明度
const rippleColor = `rgba(255, 200, 56, ${ALPHA})`; // 波纹颜色

let timer = null; // 定时器引用

// 停止波纹（清除定时器）
const stopRipple = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// 触发水波纹的核心方法
const createRipple = (clientX, clientY) => {
  const query = uni.createSelectorQuery().in(instance.proxy);
  query
    .select(".ripple-btn")
    .boundingClientRect((rect) => {
      if (!rect) return;

      // 计算波纹相对于按钮的坐标
      const rippleX = clientX - rect.left;
      const rippleY = clientY - rect.top;

      // 计算波纹大小（取按钮宽高的最大值 * 1.5，确保能覆盖整个按钮）
      const size = Math.max(rect.width, rect.height) * 1.5;
      const id = Date.now() + Math.random(); // 加上随机数防止高频触发时 id 冲突

      // 1. 将波纹推入响应式数组
      ripples.value.push({
        id,
        x: rippleX,
        y: rippleY,
        size,
        opacity: ALPHA,
      });

      // 2. 延迟一帧触发 CSS 扩散动画
      setTimeout(() => {
        const rippleObj = ripples.value.find((r) => r.id === id);
        if (rippleObj) {
          rippleObj.opacity = 0;
        }
      }, 16);

      // 3. 动画结束后自动清理节点，防止内存泄漏
      setTimeout(() => {
        ripples.value = ripples.value.filter((r) => r.id !== id);
      }, 1200); // 对应 CSS 中的 1.2s 动画时间
    })
    .exec();
};

// 触摸按下：立即触发一次，并开启定时器持续触发
const handleTouchStart = (event) => {
  // 停止之前的定时器（防止快速连点导致定时器叠加）
  stopRipple();

  const touch = event.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;

  // 立即生成第一个波纹
  createRipple(x, y);

  // 开启定时器，长按期间持续生成波纹
  timer = setInterval(() => {
    createRipple(x, y);
  }, INTERVAL);
};

// 页面卸载时清理定时器
onUnmounted(() => {
  stopRipple();
});
</script>

<style lang="scss" scoped>
.ripple-btn {
  position: relative;
  overflow: hidden; /* 核心：防止波纹溢出按钮边界 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;

  .image {
    width: 25px;
    height: 25px;

    pointer-events: none; /* 防止图片拦截触摸事件 */
    user-select: none;
  }
}

.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background-color: v-bind(rippleColor); /* 动态绑定波纹颜色 */
  transform: translate(-50%, -50%) scale(0);
  pointer-events: none; /* 核心：防止波纹拦截后续的点击事件 */
  transition:
    transform 1.2s ease-out,
    opacity 1.2s ease-out;
}

/* 触发扩散动画 */
.ripple-effect[style*="opacity: 0"] {
  transform: translate(-50%, -50%) scale(4); /* 对应第一段的 scale(4) */
}
</style>

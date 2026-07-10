<template>
  <view
    class="ripple-btn"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <image
      class="image"
      src="/static/images/icon_microphone_open@2x.png"
      alt="麦克风"
    />

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
import { ref, getCurrentInstance } from "vue";

// ✅ 【修复核心】：在 setup 最顶层获取并保存实例
const instance = getCurrentInstance();

const ripples = ref([]);

const handleTouchStart = (event) => {
  const touch = event.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;

  // ✅ 【修复核心】：在事件中使用保存好的 instance
  const query = uni.createSelectorQuery().in(instance.proxy);
  query
    .select(".ripple-btn")
    .boundingClientRect((rect) => {
      if (!rect) return;

      const rippleX = x - rect.left;
      const rippleY = y - rect.top;
      const size = Math.max(rect.width, rect.height) * 1.5;
      const id = Date.now();

      ripples.value.push({
        id,
        x: rippleX,
        y: rippleY,
        size,
        opacity: 0.4,
      });

      setTimeout(() => {
        const rippleObj = ripples.value.find((r) => r.id === id);
        if (rippleObj) {
          rippleObj.opacity = 0;
        }
      }, 16);

      setTimeout(() => {
        ripples.value = ripples.value.filter((r) => r.id !== id);
      }, 600);
    })
    .exec();
};

const handleTouchEnd = () => {};
</script>

<style lang="scss" scoped>
.ripple-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  /* background-color: #1890ff; */
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;

  width: 25px;
  height: 25px;
  .image {
    width: 25px;
    height: 25px;
  }
}

.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%) scale(0);
  pointer-events: none;
  transition:
    transform 0.6s ease-out,
    opacity 0.6s ease-out;
}

.ripple-effect[style*="opacity: 0"] {
  transform: translate(-50%, -50%) scale(1);
}
</style>

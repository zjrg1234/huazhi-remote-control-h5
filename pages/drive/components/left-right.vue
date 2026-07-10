<template>
  <!-- 1. 将 transform 绑定到响应式变量 -->
  <view 
    class="control-box" 
    ref="boxRef" 
    :style="{ transform: `translate3d(${boxX}px, ${boxY}px, 0)` }"
  >
    <view
      class="arrow left"
      :style="{ backgroundImage: `url(${leftImage})` }"
      :class="{ active: isLeftActive }"
    ></view>

    <!-- 2. 将圆点的 transform 绑定到响应式变量 -->
    <view
      class="dot"
      ref="dotRef"
      :class="{ ready: isReadyMode }"
      :style="{
        backgroundImage: `url(${dotImage})`,
        transition: isDragging
          ? 'none'
          : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease, box-shadow 0.3s ease',
        transform: `translateX(${dotX}px) scale(1)`
      }"
      @touchstart.prevent="handleStart"
      @mousedown.prevent="handleStart"
    ></view>

    <view
      class="arrow right"
      :style="{ backgroundImage: `url(${rightImage})` }"
      :class="{ active: isRightActive }"
    ></view>
  </view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

import leftImg from "@/static/images/arrow_left_big@2x.png";
import rightImg from "@/static/images/arrow_right_big@2x.png";
import dotImg from "@/static/images/dot@2x.webp";

const emit = defineEmits(["action"]);

const props = defineProps({
  isLeft: { type: Boolean, default: false },
});

const leftImage = ref(leftImg);
const rightImage = ref(rightImg);
const dotImage = ref(dotImg);

// --- 配置参数 ---
const IDLE_DELAY = 500;
const SWIPE_THRESHOLD = 20;
const MAX_DOT_DRAG = 40;
const BOX_WIDTH = 90;

// --- 响应式状态 (用于触发 UI 变化和 绑定 style) ---
const isDragging = ref(false);
const isReadyMode = ref(false);
const isLeftActive = ref(false);
const isRightActive = ref(false);

// ✅ 【核心修改】：将原本直接操作 DOM 的坐标改为响应式变量
const boxX = ref(0);
const boxY = ref(0);
const dotX = ref(0);

// --- 内部非响应式状态 (用于高频计算，避免 Vue 响应式开销) ---
let idleTimer = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dotStartOffset = 0;
let initialBoxX = 0;
let initialBoxY = 0;

// RAF 调度控制
let animationFrameId = null;
let pendingMoveEvent = null;

// ✅ 【核心修改】：获取屏幕尺寸兼容多端
const getScreenSize = () => {
  // #ifdef H5
  return { width: window.innerWidth, height: window.innerHeight };
  // #endif
  // #ifndef H5
  const sysInfo = uni.getSystemInfoSync();
  return { width: sysInfo.windowWidth, height: sysInfo.windowHeight };
  // #endif
};

const backRightInit = () => {
  const { width, height } = getScreenSize();
  boxX.value = width / 2 + 130;
  boxY.value = height / 2 - 10;
};

const backLeftInit = () => {
  boxX.value = 20;
  boxY.value = 190;
};

watch(
  () => props.isLeft,
  (val) => {
    if (val) {
      backLeftInit();
    } else {
      backRightInit();
    }
  },
  { immediate: true, deep: true }
);

// --- 核心方法 ---
const resetIdleTimer = () => {
  clearTimeout(idleTimer);
  if (!isReadyMode.value) {
    idleTimer = setTimeout(enterReadyMode, IDLE_DELAY);
  }
};

const enterReadyMode = () => {
  isReadyMode.value = true;
  // 震动 API 兼容
  // #ifdef H5
  if (navigator.vibrate) navigator.vibrate(50);
  // #endif
  // #ifndef H5
  uni.vibrateShort({ type: 'light' });
  // #endif
};

const updateArrows = (deltaX) => {
  isLeftActive.value = deltaX < -SWIPE_THRESHOLD;
  isRightActive.value = deltaX > SWIPE_THRESHOLD;
  emit("action", { lr: deltaX < 0, value: deltaX });
};

const resetArrows = () => {
  isLeftActive.value = false;
  isRightActive.value = false;
  emit("action", { lr: false, value: 0 });
  if (props.isLeft) {
    backLeftInit();
  } else {
    backRightInit();
  }
};

// 【性能核心】：在 RAF 中统一处理状态更新
const processMove = () => {
  if (!pendingMoveEvent || !isDragging.value) {
    animationFrameId = requestAnimationFrame(processMove);
    return;
  }

  const e = pendingMoveEvent;
  pendingMoveEvent = null;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  resetIdleTimer();

  if (!isReadyMode.value) {
    // 【模式 A：自由拖动容器】
    let deltaX = clientX - dragOffsetX - initialBoxX;
    let deltaY = clientY - dragOffsetY - initialBoxY;

    const LIMIT = 80;
    if (props.isLeft) {
      deltaX = Math.max(0, Math.min(100, deltaX));
    } else {
      deltaX = Math.max(-LIMIT, Math.min(LIMIT, deltaX));
    }
    deltaY = Math.max(-LIMIT, Math.min(LIMIT, deltaY));

    // ✅ 【核心修改】：更新响应式变量，Vue 会自动更新 DOM
    boxX.value = initialBoxX + deltaX;
    boxY.value = initialBoxY + deltaY;
  } else {
    // 【模式 B：待命模式 - 圆点左右弹性滑动】
    let deltaX = clientX - (boxX.value + BOX_WIDTH / 2) - dotStartOffset;
    const absDelta = Math.abs(deltaX);

    if (absDelta > MAX_DOT_DRAG) {
      const excess = absDelta - MAX_DOT_DRAG;
      const sign = deltaX > 0 ? 1 : -1;
      deltaX = sign * (MAX_DOT_DRAG + excess * 0.2);
    }

    if (deltaX < -65) deltaX = -65;
    if (deltaX > 65) deltaX = 65;

    // ✅ 【核心修改】：更新响应式变量
    dotX.value = deltaX;
    updateArrows(deltaX);
  }

  animationFrameId = requestAnimationFrame(processMove);
};

// --- 事件处理 ---
const handleStart = (e) => {
  isDragging.value = true;
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  resetArrows();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  initialBoxX = boxX.value;
  initialBoxY = boxY.value;

  dragOffsetX = clientX - boxX.value;
  dragOffsetY = clientY - boxY.value;

  const dotScreenCenterX = boxX.value + BOX_WIDTH / 2 + dotX.value;
  dotStartOffset = clientX - dotScreenCenterX;

  resetIdleTimer();

  // ✅ 【核心修改】：使用 uni 兼容的事件绑定
  window.addEventListener("mousemove", handleMove);
  window.addEventListener("touchmove", handleMove, { passive: false });
  window.addEventListener("mouseup", handleEnd);
  window.addEventListener("touchend", handleEnd);

  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(processMove);
  }
};

const handleMove = (e) => {
  if (!isDragging.value) return;
  if (e.cancelable) e.preventDefault();
  pendingMoveEvent = e;
};

const handleEnd = () => {
  if (!isDragging.value) return;

  isDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  pendingMoveEvent = null;

  // ✅ 【核心修改】：重置响应式变量
  dotX.value = 0;
  dotStartOffset = 0;
  resetArrows();

  window.removeEventListener("mousemove", handleMove);
  window.removeEventListener("touchmove", handleMove);
  window.removeEventListener("mouseup", handleEnd);
  window.removeEventListener("touchend", handleEnd);
};

// --- 生命周期 ---
onMounted(() => {
  backRightInit();
});

onBeforeUnmount(() => {
  clearTimeout(idleTimer);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  window.removeEventListener("mousemove", handleMove);
  window.removeEventListener("touchmove", handleMove);
  window.removeEventListener("mouseup", handleEnd);
  window.removeEventListener("touchend", handleEnd);
});
</script>

<style scoped>
/* 样式保持不变 */
.control-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 90px;
  height: 25px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 100;
  will-change: transform;
  user-select: none;
  touch-action: none;
}
.arrow {
  width: 28px;
  height: 28px;
  opacity: 0.8;
  transition: all 0.2s ease;
  z-index: 1;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
}
.arrow.active {
  opacity: 1;
  filter: drop-shadow(0 0 4px rgba(255, 167, 38, 0.8));
  transform: scale(1.15);
}
.dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  cursor: grab;
  position: relative;
  z-index: 2;
  will-change: transform;
}
.dot:active { cursor: grabbing; }
.dot.ready { box-shadow: 0 0 7.5px rgba(255, 167, 38, 0.6); }
</style>
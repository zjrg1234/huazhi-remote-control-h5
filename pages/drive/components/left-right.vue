<template>
  <view 
    class="control-box" 
    ref="boxRef" 
    :style="{ transform: `translate3d(${boxX}px, ${boxY}px, 0)` }"
    @touchstart="handleStart"
    @touchmove.prevent="handleMove"
    @touchend="handleEnd"

  >
    <!-- #ifdef H5 
    @mousedown="handleStart"
    #endif -->
    <view
      class="arrow left"
      :style="{ backgroundImage: `url(${leftImage})` }"
      :class="{ active: isLeftActive }"
    ></view>

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

// ✅ 将原本直接操作 DOM 的坐标改为响应式变量
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
  boxY.value = height / 2 + 40;
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

// ✅ 【核心修改】：提取坐标获取逻辑，兼容 touch 和 mouse
const getClientPos = (e) => {
  if (e.touches && e.touches.length > 0) {
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  }
  return { clientX: e.clientX, clientY: e.clientY };
};

// --- 事件处理 ---
const handleStart = (e) => {
  isDragging.value = true;
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  resetArrows();

  const { clientX, clientY } = getClientPos(e);

  initialBoxX = boxX.value;
  initialBoxY = boxY.value;

  dragOffsetX = clientX - boxX.value;
  dragOffsetY = clientY - boxY.value;

  const dotScreenCenterX = boxX.value + BOX_WIDTH / 2 + dotX.value;
  dotStartOffset = clientX - dotScreenCenterX;

  resetIdleTimer();
};

const handleMove = (e) => {
  if (!isDragging.value) return;
  
  // 阻止默认的页面滚动
  // #ifdef H5
  if (e.cancelable) e.preventDefault();
  // #endif

  const { clientX, clientY } = getClientPos(e);

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

    dotX.value = deltaX;
    updateArrows(deltaX);
  }
};

const handleEnd = () => {
  if (!isDragging.value) return;

  isDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);

  dotX.value = 0;
  dotStartOffset = 0;
  resetArrows();
};

// --- 生命周期 ---
onMounted(() => {
  backRightInit();

  // #ifdef MP-WEIXIN
  // 监听屏幕尺寸变化（横竖屏切换、窗口大小改变）
  wx.onWindowResize((res) => {
    // 横屏或窗口大小改变时，重新初始化位置
    if (props.isLeft) {
      backLeftInit();
    } else {
      backRightInit();
    }
  });
  // #endif
  // #ifdef MP-WEIXIN
  // wx.setScreenOrientation({
  //   orientation: isLandscape.value ? 'portrait' : 'landscape',
  //   success: () => {backRightInit()},
  //   fail: (err) => console.error('切换失败', err)
  // })
  // #endif

});

onBeforeUnmount(() => {
  clearTimeout(idleTimer);

   // #ifdef MP-WEIXIN
  // 页面卸载时移除监听，防止内存泄漏
  wx.offWindowResize();
  // #endif
});
</script>

<style scoped>
.control-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 180px;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 100;
  will-change: transform;
  user-select: none;
  touch-action: none; /* 关键：禁止浏览器默认的触摸滚动行为 */
}
.arrow {
  width: 50px;
  height: 50px;
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
  width: 50px;
  height: 50px;
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
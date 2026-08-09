<template>
  <cover-view
    class="control-wrapper"
    ref="wrapperRef"
    @touchstart="handleWrapperStart"
    @touchmove="handleWrapperMove"
    @touchend="handleWrapperEnd"
    @mousedown="handleWrapperStart"
    @mousemove="handleWrapperMove"
    @mouseup="handleWrapperEnd"
  >
    <cover-view
      class="control-box"
      :style="{ transform: `translate3d(${currentBoxX}px, ${currentBoxY}px, 0)` }"
      @touchstart.stop.prevent="handleStart"
      @touchmove.stop.prevent="handleMove"
      @touchend.stop.prevent="handleEnd"
      @touchcancel.stop.prevent="handleEnd"
      @mousedown.stop.prevent="handleStart"
    >
      <cover-image class="arrow up" src="../static/arrow_up_big@2x.png" :class="{ active: isUpActive }"></cover-image>
      <cover-image class="dot" src="../static/dot@2x.png" :class="{ dragging: isDragging, ready: isReadyMode }" :style="{
        transform: `translateY(${currentDotY}px) scale(1)`
      }"></cover-image>
      <cover-image class="arrow down" src="../static/arrow_down_big@2x.png" :class="{ active: isDownActive }"></cover-image>
    </cover-view>
  </cover-view>
</template>

<script setup>
import { ref, watch } from "vue";

const emit = defineEmits(["action"]);
const props = defineProps({
  isLeft: { type: Boolean, default: true },
});

const IDLE_DELAY = 500;
const SWIPE_THRESHOLD = 20;
const MAX_DOT_DRAG = 40;

const isDragging = ref(false);
const isWrapperDragging = ref(false);
const isReadyMode = ref(false);
const isUpActive = ref(false);
const isDownActive = ref(false);

const currentBoxX = ref(0);
const currentBoxY = ref(0);
const currentDotY = ref(0);

let idleTimer = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let lastPointerY = 0;
let readyStartPointerY = 0;
let dragBaseX = 0;
let dragBaseY = 0;

let wrapperStartY = 0;
let wrapperDotBaseY = 0;

// 原始位置（基于 wrapper 左上角）
let originX = 60;
let originY = 10;  // 靠上显示

const getScreenSize = () => {
  const sysInfo = uni.getSystemInfoSync();
  return { width: sysInfo.windowWidth, height: sysInfo.windowHeight };
};

const backRightInit = () => {
  // 示例：靠右上方
  const { width, height } = getScreenSize();
  currentBoxX.value = width - 260;
  currentBoxY.value = 10;
  originX = currentBoxX.value;
  originY = currentBoxY.value;
};

const backLeftInit = () => {
  currentBoxX.value = 60;
  currentBoxY.value = 10;  // 距顶部 10px
  originX = 60;
  originY = 10;
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
  { immediate: true }
);

const getClientPos = (e) => {
  if (e.touches && e.touches.length > 0) {
    return {
      clientX: e.touches[0].pageX || e.touches[0].clientX,
      clientY: e.touches[0].pageY || e.touches[0].clientY,
    };
  }
  return {
    clientX: e.pageX || e.clientX,
    clientY: e.pageY || e.clientY,
  };
};

const resetIdleTimer = () => {
  clearTimeout(idleTimer);
  if (!isReadyMode.value) {
    idleTimer = setTimeout(enterReadyMode, IDLE_DELAY);
  }
};

const enterReadyMode = () => {
  isReadyMode.value = true;
  readyStartPointerY = lastPointerY;
  // #ifdef H5
  if (navigator.vibrate) navigator.vibrate(50);
  // #endif
  // #ifndef H5
  uni.vibrateShort({ type: 'light' });
  // #endif
};

const updateArrows = (deltaY) => {
  const newIsUpActive = deltaY < -SWIPE_THRESHOLD;
  const newIsDownActive = deltaY > SWIPE_THRESHOLD;
  if (isUpActive.value !== newIsUpActive) isUpActive.value = newIsUpActive;
  if (isDownActive.value !== newIsDownActive) isDownActive.value = newIsDownActive;
  emit("action", { fb: deltaY < 0, value: deltaY });
};

const resetArrows = () => {
  isUpActive.value = false;
  isDownActive.value = false;
  emit("action", { fb: false, value: 0 });
};

// ---------- Box 自身拖拽 ----------
const handleStart = (e) => {
  if (e.preventDefault) e.preventDefault();
  if (e.stopPropagation) e.stopPropagation();

  isDragging.value = true;
  isWrapperDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  resetArrows();

  const { clientX, clientY } = getClientPos(e);
  dragBaseX = currentBoxX.value;
  dragBaseY = currentBoxY.value;
  dragOffsetX = clientX - currentBoxX.value;
  dragOffsetY = clientY - currentBoxY.value;
  lastPointerY = clientY;
  resetIdleTimer();
};

const handleMove = (e) => {
  if (!isDragging.value) return;
  if (e.preventDefault) e.preventDefault();
  if (e.stopPropagation) e.stopPropagation();

  const { clientX, clientY } = getClientPos(e);
  lastPointerY = clientY;
  resetIdleTimer();

  if (!isReadyMode.value) {
    let deltaX = clientX - dragOffsetX - dragBaseX;
    let deltaY = clientY - dragOffsetY - dragBaseY;
    deltaX = Math.max(-50, Math.min(100, deltaX));
    deltaY = Math.max(-100, Math.min(50, deltaY));
    currentBoxX.value = dragBaseX + deltaX;
    currentBoxY.value = dragBaseY + deltaY;
  } else {
    let deltaY = clientY - readyStartPointerY;
    const absDelta = Math.abs(deltaY);
    if (absDelta > MAX_DOT_DRAG) {
      const excess = absDelta - MAX_DOT_DRAG;
      const sign = deltaY > 0 ? 1 : -1;
      deltaY = sign * (MAX_DOT_DRAG + excess * 0.2);
    }
    if (deltaY < -45) deltaY = -45;
    if (deltaY > 45) deltaY = 45;
    currentDotY.value = deltaY;
    updateArrows(deltaY);
  }
};

const handleEnd = (e) => {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();
  if (!isDragging.value) return;

  isDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  currentDotY.value = 0;
  readyStartPointerY = 0;
  resetArrows();
  currentBoxX.value = originX;
  currentBoxY.value = originY;
};

// ---------- Wrapper 空白区域操作 ----------
const handleWrapperStart = (e) => {
  const { clientX, clientY } = getClientPos(e);
  const { height: screenH } = getScreenSize();
  // wrapper 左上角屏幕坐标（fixed left:0 bottom:0 -> top = screenH - 300）
  const wrapperRect = {
    left: 0,
    top: screenH - 300,
    width: 350,
    height: 300,
  };

  const relX = clientX - wrapperRect.left;
  const relY = clientY - wrapperRect.top;

  // 点在 box 内则不处理
  if (
    relX >= currentBoxX.value &&
    relX <= currentBoxX.value + 50 &&
    relY >= currentBoxY.value &&
    relY <= currentBoxY.value + 180
  ) {
    return;
  }

  if (e.cancelable) e.preventDefault();
  isWrapperDragging.value = true;
  isDragging.value = false;
  isReadyMode.value = true;
  clearTimeout(idleTimer);
  resetArrows();

  // 目标：box 中心对准触点
  let targetX = relX - 25;   // 50/2
  let targetY = relY - 90;   // 180/2
  // 限制在 wrapper 内
  targetX = Math.max(0, Math.min(targetX, 350 - 50));
  targetY = Math.max(0, Math.min(targetY, 300 - 180));
  currentBoxX.value = targetX;
  currentBoxY.value = targetY;
  currentDotY.value = 0;

  wrapperStartY = clientY;
  wrapperDotBaseY = 0;
};

const handleWrapperMove = (e) => {
  if (!isWrapperDragging.value) return;
  if (e.cancelable) e.preventDefault();
  const { clientY } = getClientPos(e);
  let deltaY = clientY - wrapperStartY + wrapperDotBaseY;

  const absDelta = Math.abs(deltaY);
  if (absDelta > MAX_DOT_DRAG) {
    const excess = absDelta - MAX_DOT_DRAG;
    const sign = deltaY > 0 ? 1 : -1;
    deltaY = sign * (MAX_DOT_DRAG + excess * 0.2);
  }
  if (deltaY < -45) deltaY = -45;
  if (deltaY > 45) deltaY = 45;

  currentDotY.value = deltaY;
  updateArrows(deltaY);
};

const handleWrapperEnd = () => {
  if (!isWrapperDragging.value) return;
  isWrapperDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  currentDotY.value = 0;
  wrapperDotBaseY = 0;
  resetArrows();
  // 回弹到初始位置
  currentBoxX.value = originX;
  currentBoxY.value = originY;
};
</script>

<style scoped>
.control-wrapper {
  position: fixed;
  left: 40px;
  bottom:40px;
  width: 300px;
  height: 300px;
  background: rgba(255, 167, 38, 0.6);
}

.control-box {
  position: absolute;
  top: 0;      /* 修改点：改为 top:0，基于 wrapper 顶部定位 */
  left: 0;
  width: 50px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 9999;
  will-change: transform;
  user-select: none;
  touch-action: none;
}

.arrow {
  display: block;
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  position: relative;
  z-index: 2;
  will-change: transform;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    background 0.3s ease,
    box-shadow 0.3s ease;
}

.dot.ready {
  box-shadow: 0 0 7.5px rgba(255, 167, 38, 0.6);
  border: 1px solid rgba(255, 167, 38, 0.8);
  border-radius: 50%;
}

.dot.dragging {
  transition: none;
}
</style>
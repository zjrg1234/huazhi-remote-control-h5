<template>
  <!-- 修复：所有 touch 事件添加 .stop.prevent，并增加 touchcancel 处理 -->
  <cover-view 
    class="control-box" 
    :style="{ transform: `translate3d(${currentBoxX}px, ${currentBoxY}px, 0)` }"
    @touchstart.stop.prevent="handleStart"
    @touchmove.stop.prevent="handleMove"
    @touchend.stop.prevent="handleEnd"
    @touchcancel.stop.prevent="handleEnd"
  >
    <cover-image
      class="arrow up"
      src="../static/arrow_up_big@2x.png"
      :class="{ active: isUpActive }"
    ></cover-image>

  
    <cover-image
      class="dot"
      src="../static/dot@2x.png"
      :class="{ dragging: isDragging , ready: isReadyMode }"
      :style="{
        transform: `translateY(${currentDotY}px) scale(1)`
      }"
    ></cover-image>


    <cover-image
      class="arrow down"
      src="../static/arrow_down_big@2x.png"
      :class="{ active: isDownActive }"
    ></cover-image>
  </cover-view>
</template>

<script setup>
import { ref, watch } from "vue";

import upImg from "../static/arrow_up_big@2x.png";
import downImg from "../static/arrow_down_big@2x.png";
import dotImg from "../static/dot@2x.png";

const upImage = ref(upImg);
const downImage = ref(downImg);
const dotImage = ref(dotImg);

const emit = defineEmits(["action"]);
const props = defineProps({
  isLeft: { type: Boolean, default: true },
});

const IDLE_DELAY = 500;
const SWIPE_THRESHOLD = 20;
const MAX_DOT_DRAG = 40;

const isDragging = ref(false);
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

const getScreenSize = () => {
  const sysInfo = uni.getSystemInfoSync();
  return { width: sysInfo.windowWidth, height: sysInfo.windowHeight };
};

const backRightInit = () => {
  const { width, height } = getScreenSize();
  currentBoxX.value = width - 260;
  currentBoxY.value = height / 4 - 150;
};

const backLeftInit = () => {
  currentBoxX.value = 60;
  currentBoxY.value = -50;
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

const resetIdleTimer = () => {
  clearTimeout(idleTimer);
  if (!isReadyMode.value) {
    idleTimer = setTimeout(enterReadyMode, IDLE_DELAY);
  }
};

const enterReadyMode = () => {
  isReadyMode.value = true;
  readyStartPointerY = lastPointerY;
  uni.vibrateShort({ type: 'light' });
};

const updateArrows = (deltaY) => {
  const newIsUpActive = deltaY < -SWIPE_THRESHOLD;
  const newIsDownActive = deltaY > SWIPE_THRESHOLD;

  if (isUpActive.value !== newIsUpActive) {
    isUpActive.value = newIsUpActive;
  }
  if (isDownActive.value !== newIsDownActive) {
    isDownActive.value = newIsDownActive;
  }

  emit("action", { fb: deltaY < 0, value: deltaY });
};

const resetArrows = () => {
  isUpActive.value = false;
  isDownActive.value = false;
  emit("action", { fb: false, value: 0 });
  if (props.isLeft) {
    backLeftInit();
  } else {
    backRightInit();
  }
};

// ==================== 核心修复 ====================
// 获取触摸/鼠标坐标（统一使用 pageX/pageY，避免固定定位偏移）
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

const handleStart = (e) => {
  // 【修复1】显式阻止默认行为和事件冒泡
  if (e.preventDefault) e.preventDefault();
  if (e.stopPropagation) e.stopPropagation();

  isDragging.value = true;
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  resetArrows();

  const touch = e.touches[0];
  const {clientX, clientY} = getClientPos(e)
  // const clientX = touch.clientX;
  // const clientY = touch.clientY;

  dragBaseX = currentBoxX.value;
  dragBaseY = currentBoxY.value;
  dragOffsetX = clientX - currentBoxX.value;
  dragOffsetY = clientY - currentBoxY.value;
  lastPointerY = clientY;
  resetIdleTimer();
};

const handleMove = (e) => {
  if (!isDragging.value) return;

  // 【修复2】必须阻止默认行为，防止页面滚动穿透（上下抖动）
  if (e.preventDefault) e.preventDefault();
  if (e.stopPropagation) e.stopPropagation();

  const {clientX, clientY} = getClientPos(e)
  
  // const touch = e.touches[0];
  // const clientX = touch.clientX;
  // const clientY = touch.clientY;
  lastPointerY = clientY;
  resetIdleTimer();

  if (!isReadyMode.value) {
    // 模式 A：自由拖动容器
    let deltaX = clientX - dragOffsetX - dragBaseX;
    let deltaY = clientY - dragOffsetY - dragBaseY;

    deltaX = Math.max(-50, Math.min(100, deltaX));
    deltaY = Math.max(-100, Math.min(50, deltaY));

    currentBoxX.value = dragBaseX + deltaX;
    currentBoxY.value = dragBaseY + deltaY;
  } else {
    // 模式 B：待命模式 - 圆点上下弹性滑动
    let deltaY = clientY - readyStartPointerY;
    const absDelta = Math.abs(deltaY);

    if (absDelta > MAX_DOT_DRAG) {
      const excess = absDelta - MAX_DOT_DRAG;
      const sign = deltaY > 0 ? 1 : -1;
      deltaY = sign * (MAX_DOT_DRAG + excess * 0.2);
    }

    currentDotY.value = deltaY;
    console.log("deltaY:",deltaY)
    if (deltaY < -45) currentDotY.value = -45;
    if (deltaY > 45) currentDotY.value = 45;

    updateArrows(deltaY);
  }
};

const handleEnd = (e) => {
  // 【修复3】结束也阻止一下，防止部分机型 touchend 触发页面回弹
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();

  if (!isDragging.value) return;

  isDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);

  currentDotY.value = 0;
  readyStartPointerY = 0;
  resetArrows();
};
</script>

<style scoped>
.control-box {
  position: fixed;
  left: 0;
  bottom: 0;
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
  /* 【修复4】增加 touch-action，虽然小程序支持有限，但加上无害 */
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
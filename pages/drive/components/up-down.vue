<template>
  <!-- 注意：uni-app 中 div 需改为 view，事件绑定使用 touch 系列 -->
  <view 
    class="control-box" 
    :style="{ transform: `translate3d(${currentBoxX}px, ${currentBoxY}px, 0)` }"
    @touchstart.prevent="handleStart"
    @touchmove.prevent="handleMove"
    @touchend.prevent="handleEnd"
  >
    <view
      class="arrow up"
      :style="{ backgroundImage: `url(${upImage})` }"
      :class="{ active: isUpActive }"
    ></view>

    <view
      class="dot"
      :class="{ ready: isReadyMode, dragging: isDragging }"
      :style="{
        backgroundImage: `url(${dotImage})`,
        transform: `translateY(${currentDotY}px) scale(1)`
      }"
    ></view>

    <view
      class="arrow down"
      :style="{ backgroundImage: `url(${downImage})` }"
      :class="{ active: isDownActive }"
    ></view>
  </view>
</template>

<script setup>
import { ref, watch } from "vue";

// 图片资源引入（需确保图片在 static 目录下或使用网络图片）
import upImg from "@/static/images/arrow_up_big@2x.png";
import downImg from "@/static/images/arrow_down_big@2x.png";
import dotImg from "@/static/images/dot@2x.webp";

const upImage = ref(upImg);
const downImage = ref(downImg);
const dotImage = ref(dotImg);

const emit = defineEmits(["action"]);
const props = defineProps({
  isLeft: { type: Boolean, default: true },
});

// --- 配置参数 ---
const IDLE_DELAY = 500;
const SWIPE_THRESHOLD = 20;
const MAX_DOT_DRAG = 40;

// --- 响应式状态 (用于驱动视图更新) ---
const isDragging = ref(false);
const isReadyMode = ref(false);
const isUpActive = ref(false);
const isDownActive = ref(false);

// 核心位置状态（改为响应式，用于 :style 绑定）
const currentBoxX = ref(0);
const currentBoxY = ref(0);
const currentDotY = ref(0);

// --- 内部非响应式状态 ---
let idleTimer = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let lastPointerY = 0;
let readyStartPointerY = 0;
let dragBaseX = 0;
let dragBaseY = 0;

// 获取屏幕尺寸（替代 window.innerWidth/Height）
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

// --- 核心方法 ---
const resetIdleTimer = () => {
  clearTimeout(idleTimer);
  if (!isReadyMode.value) {
    idleTimer = setTimeout(enterReadyMode, IDLE_DELAY);
  }
};

const enterReadyMode = () => {
  isReadyMode.value = true;
  readyStartPointerY = lastPointerY;
  // 替代 navigator.vibrate
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

// --- 事件处理 ---
const handleStart = (e) => {
  isDragging.value = true;
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  resetArrows();

  const touch = e.touches[0];
  const clientX = touch.clientX;
  const clientY = touch.clientY;

  dragBaseX = currentBoxX.value;
  dragBaseY = currentBoxY.value;
  dragOffsetX = clientX - currentBoxX.value;
  dragOffsetY = clientY - currentBoxY.value;
  lastPointerY = clientY;
  resetIdleTimer();
};

const handleMove = (e) => {
  if (!isDragging.value) return;

  const touch = e.touches[0];
  const clientX = touch.clientX;
  const clientY = touch.clientY;
  lastPointerY = clientY;
  resetIdleTimer();

  if (!isReadyMode.value) {
    // 【模式 A：自由拖动容器】
    let deltaX = clientX - dragOffsetX - dragBaseX;
    let deltaY = clientY - dragOffsetY - dragBaseY;

    deltaX = Math.max(-50, Math.min(100, deltaX));
    deltaY = Math.max(-100, Math.min(50, deltaY));

    currentBoxX.value = dragBaseX + deltaX;
    currentBoxY.value = dragBaseY + deltaY;
  } else {
    // 【模式 B：待命模式 - 圆点上下弹性滑动】
    let deltaY = clientY - readyStartPointerY;
    const absDelta = Math.abs(deltaY);

    if (absDelta > MAX_DOT_DRAG) {
      const excess = absDelta - MAX_DOT_DRAG;
      const sign = deltaY > 0 ? 1 : -1;
      deltaY = sign * (MAX_DOT_DRAG + excess * 0.2);
    }

    currentDotY.value = deltaY;
    if (deltaY < -65) currentDotY.value = -65;
    if (deltaY > 65) currentDotY.value = 65;

    updateArrows(deltaY);
  }
};

const handleEnd = () => {
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
/* 样式基本保持不变，但需注意在小程序中不支持 * 选择器和部分新 CSS 语法 */
.control-box {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 50px;
  height:180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 100;
  will-change: transform;
  user-select: none;
  touch-action: none; /* 小程序端可能不支持，可通过 catchtouchmove 阻止穿透 */
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
  position: relative;
  z-index: 2;
  will-change: transform;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
              background 0.3s ease, 
              box-shadow 0.3s ease;
}

.dot.ready {
  box-shadow: 0 0 7.5px rgba(255, 167, 38, 0.6);
}
.dot.dragging {
  /* 拖动时取消过渡，让跟手更丝滑 */
  transition: none;
}
</style>
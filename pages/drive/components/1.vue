<template>
  <cover-view 
    class="control-box-left-right" 
    :style="boxStyle"
    @touchstart="handleStart" 
    @touchmove="handleMove" 
    catchtouchmove
    @touchend="handleEnd"
    @touchcancel="handleEnd"
  >
    <cover-image 
      class="arrow left" 
      src="/static/images/arrow_left_big@2x.png" 
      :class="{ active: isLeftActive }"
    />
    <cover-image 
      class="dot" 
      src="/static/images/dot@2x.png" 
      :class="{ ready: longPressMode }"
      :style="dotTransformStyle"
    />
    <cover-image 
      class="arrow right" 
      src="/static/images/arrow_right_big@2x.png" 
      :class="{ active: isRightActive }"
    />
  </cover-view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";

const emit = defineEmits(["action"]);
const props = defineProps({
  isLeft: { type: Boolean, default: false },
});

// 常量配置
const LONG_PRESS_TIME = 300;
const SWIPE_THRESHOLD = 20;
const MAX_DOT_DRAG = 40;
const BOX_WIDTH = 180;
const BOX_HEIGHT = 50;

// 状态
const isDragging = ref(false);
const longPressMode = ref(false);
let pressTimer = null;
const isLeftActive = ref(false);
const isRightActive = ref(false);
const boxX = ref(0);
const boxY = ref(0);
const dotX = ref(0);

// 缓存坐标
let screenW = 750;
let screenH = 360;
let startTouchX = 0;
let startTouchY = 0;
let startBoxX = 0;
let startBoxY = 0;

// 盒子样式 left/top 定位，抛弃translate漂移方案
const boxStyle = computed(() => {
  return {
    position: "fixed",
    left: `${boxX.value}px`,
    top: `${boxY.value}px`,
    width: `${BOX_WIDTH}px`,
    height: `${BOX_HEIGHT}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 9999999,
    pointerEvents: "auto",
    background: "rgba(0,0,0,0.01)"
  };
});

// 圆点样式
const dotTransformStyle = computed(() => ({
  transition: longPressMode.value ? "none" : "transform 0.2s ease-out",
  transform: `translateX(${dotX.value}px) scale(1)`,
  width: "50px",
  height: "50px"
}));

// 获取屏幕尺寸
const getScreenSize = () => {
  try {
    const info = uni.getSystemInfoSync();
    screenW = Math.max(info.windowWidth || 750, info.windowHeight || 750);
    screenH = Math.min(info.windowWidth || 750, info.windowHeight || 750);
  } catch (err) {
    screenW = 750;
    screenH = 360;
  }
};

// 初始化位置
const setPos = () => {
  getScreenSize();
  if (props.isLeft) {
    boxX.value = 20;
  } else {
    boxX.value = screenW - BOX_WIDTH - 30;
  }
  boxY.value = screenH / 2;
};

onMounted(() => {
  setPos();
  uni.onWindowResize(setPos);
});

onBeforeUnmount(() => {
  if (pressTimer) clearTimeout(pressTimer);
  uni.offWindowResize();
});

watch(() => props.isLeft, setPos);

// 按下，缓存手指与盒子初始坐标
const handleStart = (e) => {
  e.stopPropagation();
  if (pressTimer) clearTimeout(pressTimer);
  isDragging.value = true;
  longPressMode.value = false;
  dotX.value = 0;
  resetArrow();

  const touch = e.touches[0];
  startTouchX = touch.clientX;
  startTouchY = touch.clientY;
  startBoxX = boxX.value;
  startBoxY = boxY.value;

  // 长按计时
  pressTimer = setTimeout(() => {
    longPressMode.value = true;
    uni.vibrateShort({ type: "light" });
  }, LONG_PRESS_TIME);
};

// 拖动完整逻辑（修复核心：区分两种模式，短按可拖动整个盒子左右自由移动）
const handleMove = (e) => {
  console.log("move")
  if (!isDragging.value) return;
  const touch = e.touches[0];
  console.log(longPressMode.value)
  if (!longPressMode.value) {
    // ========== 短按拖动整个摇杆盒子（左右上下完全自由，修复向右拖不动） ==========
    const deltaX = touch.clientX - startTouchX;
    const deltaY = touch.clientY - startTouchY;
    let newX = startBoxX + deltaX;
    let newY = startBoxY + deltaY;

    console.log('newX',newX,'newY',newY)

    // 边界限制：左右都不会卡死
    newX = Math.max(0, Math.min(screenW - BOX_WIDTH, newX));
    newY = Math.max(0, Math.min(screenH - BOX_HEIGHT, newY));

    boxX.value = newX;
    boxY.value = newY;
  } else {
    // ========== 长按模式：仅拖动中间圆点 ==========
    let moveX = touch.clientX - (boxX.value + BOX_WIDTH / 2);
    const absX = Math.abs(moveX);
    if (absX > MAX_DOT_DRAG) {
      const over = absX - MAX_DOT_DRAG;
      const sign = moveX > 0 ? 1 : -1;
      moveX = sign * (MAX_DOT_DRAG + over * 0.2);
    }
    moveX = Math.max(-65, Math.min(65, moveX));
    dotX.value = moveX;
    console.log(moveX)
    updateArrow(moveX);
  }
};

// 松手重置全部状态
const handleEnd = () => {
  if (pressTimer) clearTimeout(pressTimer);
  isDragging.value = false;
  longPressMode.value = false;
  dotX.value = 0;
  resetArrow();
  emit("action", { lr: false, value: 0 });
};

// 圆点滑动输出事件
const updateArrow = (x) => {
  isLeftActive.value = x < -SWIPE_THRESHOLD;
  isRightActive.value = x > SWIPE_THRESHOLD;
  emit("action", { lr: x < 0, value: x });
};

const resetArrow = () => {
  isLeftActive.value = false;
  isRightActive.value = false;
};
</script>

<style scoped>
.arrow {
  width: 50px;
  height: 50px;
  opacity: 0.8;
  transition: all 0.2s;
}
.arrow.active {
  opacity: 1;
  filter: drop-shadow(0 0 4px #ffa726);
  transform: scale(1.15);
}
.dot {
  border-radius: 50%;
  z-index: 2;
}
.dot.ready {
  box-shadow: 0 0 8px rgba(255, 167, 38, 0.7);
}
</style>


<template>
  <cover-view class="control-box" ref="boxRef" :style="{ transform: `translate3d(${boxX}px, ${boxY}px, 0)` }"
    @touchstart="handleStart" @touchmove.prevent="handleMove" @touchend="handleEnd">
    <!-- #ifdef H5 
    @mousedown="handleStart"
    #endif -->
    <cover-view class="arrow left" :style="{ backgroundImage: `url(${leftImage})` }" :class="{ active: isLeftActive }"></cover-view>

    <cover-view class="dot" ref="dotRef" :class="{ ready: isReadyMode }" :style="{
      backgroundImage: `url(${dotImage})`,
      transition: isDragging
        ? 'none'
        : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease, box-shadow 0.3s ease',
      transform: `translateX(${dotX}px) scale(1)`
    }"></cover-view>

    <cover-view class="arrow right" :style="{ backgroundImage: `url(${rightImage})` }" :class="{ active: isRightActive }">
    </cover-view>
  </cover-view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

import leftImg from "@/static/images/arrow_left_big@2x.png";
import rightImg from "@/static/images/arrow_right_big@2x.png";
import dotImg from "@/static/images/dot@2x.png";

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

const getScreenSize = () => {
  // #ifdef H5
  return { width: window.innerWidth, height: window.innerHeight };
  // #endif
  
  // #ifdef MP-WEIXIN
  const info = uni.getSystemInfoSync();
  console.log(info,"info")
  // 强制取长边为 width（假设你的页面是横屏的）
  return {
    width: Math.max(info.windowWidth, info.windowHeight),
    height: Math.min(info.windowWidth, info.windowHeight)
  };
  // #endif
};

// ✅ 修改 backRightInit
const backRightInit = () => {
  const { width, height } = getScreenSize();
  console.log("屏幕尺寸:", width, height);
  
  boxX.value = width / 2 + 130 + 40;
  boxY.value = height / 2 + 40;
  
  console.log("最终位置:", boxX.value, boxY.value);
};

// ✅ 修改 onWindowResize 监听
onMounted(() => {
  backRightInit();


  // #ifdef H5
  window.addEventListener('resize', () => {
    if (props.isLeft) {
      backLeftInit();
    } else {
      backRightInit();
    }
  });
  // #endif
});

onBeforeUnmount(() => {
  clearTimeout(idleTimer);

  // #ifdef MP-WEIXIN
  // 页面卸载时移除监听，防止内存泄漏
  wx.offWindowResize();
  // #endif

  // #ifdef H5
  window.removeEventListener('resize', () => {});
  // #endif
});

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
  z-index: 9999;
  will-change: transform;
  user-select: none;
  touch-action: none;
  /* 关键：禁止浏览器默认的触摸滚动行为 */
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

.dot:active {
  cursor: grabbing;
}

.dot.ready {
  box-shadow: 0 0 7.5px rgba(255, 167, 38, 0.6);
}
</style>
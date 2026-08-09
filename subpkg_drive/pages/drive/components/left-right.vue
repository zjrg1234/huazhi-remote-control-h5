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
      ref="boxRef"
      :style="{
        transform: `translate3d(${boxX}px, ${boxY}px, 0)`,
        transition: boxTransition
      }"
      @touchstart.stop="handleStart"
      @touchmove.stop="handleMove"
      @touchend="handleEnd"
      @mousedown.stop="handleStart"
    >
      <cover-image class="arrow left" src="../static/arrow_left_big@2x.png"
        :class="{ active: isLeftActive }"></cover-image>

      <cover-image class="dot" ref="dotRef" :class="{ ready: isReadyMode }" src="../static/dot@2x.png" :style="{
        transition: isDragging || isWrapperDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease, box-shadow 0.3s ease',
        transform: `translateX(${dotX}px) scale(1)`
      }"></cover-image>

      <cover-image class="arrow right" src="../static/arrow_right_big@2x.png"
        :class="{ active: isRightActive }"></cover-image>
    </cover-view>
  </cover-view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const emit = defineEmits(["action"]);

const props = defineProps({
  isLeft: { type: Boolean, default: false },
  wrapperWidth: { type: Number, default: 360 },
  wrapperHeight: { type: Number, default: 300 },
});

// 配置参数
const IDLE_DELAY = 200;
const SWIPE_THRESHOLD = 20;
const MAX_DOT_DRAG = 40;
const BOX_WIDTH = 180;
const BOX_HEIGHT = 50;
const WRAPPER_RIGHT = 20;
const WRAPPER_BOTTOM = 20;

// 响应式状态
const isDragging = ref(false);          // 从 box 自身开始拖拽
const isWrapperDragging = ref(false);   // 从 wrapper 空白区域开始拖拽
const isReadyMode = ref(false);
const isLeftActive = ref(false);
const isRightActive = ref(false);
const boxX = ref(0);
const boxY = ref(0);
const dotX = ref(0);
const boxTransition = ref("none");

// 内部变量
let idleTimer = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dotStartOffset = 0;
let initialBoxX = 0;
let initialBoxY = 0;
let originBoxX = 0;
let originBoxY = 0;
let wrapperSize = { width: props.wrapperWidth, height: props.wrapperHeight };
// wrapper 操作基准值
let wrapperStartClientX = 0;
let wrapperDotBaseX = 0;

// 获取屏幕尺寸
const getRealScreenSize = () => {
  // #ifdef H5
  return { width: window.innerWidth, height: window.innerHeight };
  // #endif
  // #ifdef MP-WEIXIN
  const info = uni.getSystemInfoSync();
  return { width: info.windowWidth, height: info.windowHeight };
  // #endif
};

// 限制 box 在容器内
const clampInWrapper = (x, y) => {
  const maxX = wrapperSize.width - BOX_WIDTH;
  const maxY = wrapperSize.height - BOX_HEIGHT;
  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY)),
  };
};

// 右侧初始化
const backRightInit = () => {
  const x = wrapperSize.width - BOX_WIDTH - 10;
  const y = (wrapperSize.height - BOX_HEIGHT) / 2 + 50;
  const clamped = clampInWrapper(x, y);
  boxX.value = clamped.x;
  boxY.value = clamped.y;
  originBoxX = clamped.x;
  originBoxY = clamped.y;
};

// 左侧初始化
const backLeftInit = () => {
  const x = 10;
  const y = (wrapperSize.height - BOX_HEIGHT) / 2;
  const clamped = clampInWrapper(x, y);
  boxX.value = clamped.x;
  boxY.value = clamped.y;
  originBoxX = clamped.x;
  originBoxY = clamped.y;
};

const updateWrapperSize = () => {
  wrapperSize.width = props.wrapperWidth;
  wrapperSize.height = props.wrapperHeight;
};

onMounted(() => {
  updateWrapperSize();
  if (props.isLeft) backLeftInit();
  else backRightInit();
  // #ifdef H5
  window.addEventListener('resize', () => {
    updateWrapperSize();
    if (props.isLeft) backLeftInit();
    else backRightInit();
  });
  // #endif
});

onBeforeUnmount(() => {
  clearTimeout(idleTimer);
  // #ifdef H5
  window.removeEventListener('resize', () => {});
  // #endif
});

watch(() => props.isLeft, (val) => {
  updateWrapperSize();
  if (val) backLeftInit();
  else backRightInit();
}, { deep: true });

// --- 辅助函数 ---
const resetIdleTimer = () => {
  clearTimeout(idleTimer);
  if (!isReadyMode.value) idleTimer = setTimeout(enterReadyMode, IDLE_DELAY);
};

const enterReadyMode = () => {
  isReadyMode.value = true;
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
};

const resetToOrigin = () => {
  boxX.value = originBoxX;
  boxY.value = originBoxY;
  dotX.value = 0;
  dotStartOffset = 0;
  wrapperDotBaseX = 0;
  resetArrows();
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  boxTransition.value = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
};

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

// --- 从 control-box 自身开始拖拽（原有逻辑，未变） ---
const handleStart = (e) => {
  e.stopPropagation();
  if (e.cancelable) e.preventDefault();
  isDragging.value = true;
  isWrapperDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  resetArrows();
  boxTransition.value = "none";

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
  if (e.cancelable) e.preventDefault();
  const { clientX, clientY } = getClientPos(e);
  resetIdleTimer();

  if (!isReadyMode.value) {
    let newX = clientX - dragOffsetX;
    let newY = clientY - dragOffsetY;
    const clamped = clampInWrapper(newX, newY);
    boxX.value = clamped.x;
    boxY.value = clamped.y;
  } else {
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
  boxTransition.value = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  boxX.value = originBoxX;
  boxY.value = originBoxY;
};

// --- 从 wrapper 空白区域开始的操作（核心新逻辑） ---
const handleWrapperStart = (e) => {
  const { width: screenW, height: screenH } = getRealScreenSize();
  const wrapperRect = {
    left: screenW - wrapperSize.width - WRAPPER_RIGHT,
    top: screenH - wrapperSize.height - WRAPPER_BOTTOM,
    width: wrapperSize.width,
    height: wrapperSize.height,
  };

  const { clientX, clientY } = getClientPos(e);
  const relX = clientX - wrapperRect.left;
  const relY = clientY - wrapperRect.top;

  // 判断是否点在 control-box 内部
  if (
    relX >= boxX.value &&
    relX <= boxX.value + BOX_WIDTH &&
    relY >= boxY.value &&
    relY <= boxY.value + BOX_HEIGHT
  ) {
    return; // 由 box 自身事件处理
  }

  // 点在空白区域：移动整个 box 使圆点对准点击位置
  if (e.cancelable) e.preventDefault();
  isWrapperDragging.value = true;
  isDragging.value = false;
  isReadyMode.value = true;
  clearTimeout(idleTimer);
  resetArrows();
  boxTransition.value = "none";

  // 目标：box 中心 = (relX, relY)
  let targetBoxX = relX - BOX_WIDTH / 2;
  let targetBoxY = relY - BOX_HEIGHT / 2;
  const clamped = clampInWrapper(targetBoxX, targetBoxY);
  boxX.value = clamped.x;
  boxY.value = clamped.y;
  dotX.value = 0; // 圆点已在中心

  // 记录移动基准
  wrapperStartClientX = clientX;
  wrapperDotBaseX = 0;
};

const handleWrapperMove = (e) => {
  if (!isWrapperDragging.value) return;
  if (e.cancelable) e.preventDefault();
  const { clientX } = getClientPos(e);
  // 计算相对于按下点的位移，作为 dot 偏移量
  let deltaX = clientX - wrapperStartClientX + wrapperDotBaseX; // wrapperDotBaseX 初始为0，可扩展

  // 弹性限制（与原待命模式相同）
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
};

const handleWrapperEnd = () => {
  if (!isWrapperDragging.value) return;
  isWrapperDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);

  // 让 box 回到原始位置，圆点归零
  boxTransition.value = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  dotX.value = 0;
  wrapperDotBaseX = 0;
  resetArrows();
  // 延迟一点点再移动 box，让圆点先归位更自然
  setTimeout(() => {
    boxX.value = originBoxX;
    boxY.value = originBoxY;
  }, 50);
};
</script>

<style scoped>
.control-wrapper {
  position: fixed;
  right: 90px;
  bottom: 50px;
  width: v-bind(wrapperWidth + 'px');
  height: v-bind(wrapperHeight + 'px');
  /* background: rgba(0, 0, 0, 0.15); */
  border-radius: 12px;
  overflow: hidden;
  z-index: 9998;
  touch-action: none;
  user-select: none;
}

.control-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 180px;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  will-change: transform;
  user-select: none;
  touch-action: none;
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
  width: 48px;
  height: 48px;
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
  border: 1px solid rgba(255, 167, 38, 0.8);
  border-radius: 50%;
}
</style>
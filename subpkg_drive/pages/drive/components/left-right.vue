<template>
  <cover-view
    class="control-wrapper"
    ref="wrapperRef"
    :style="wrapperStyle"
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
import { ref, onMounted, onBeforeUnmount, watch, getCurrentInstance, reactive } from "vue";

const emit = defineEmits(["action"]);

const props = defineProps({
  isLeft: { type: Boolean, default: false },
  wrapperWidth: { type: Number, default: 360 },
  wrapperHeight: { type: Number, default: 270 },
});

// 配置参数
const IDLE_DELAY = 400;
const SWIPE_THRESHOLD = 20;
const MAX_DOT_DRAG = 40;
const BOX_WIDTH = 180;
const BOX_HEIGHT = 50;

// 响应式状态
const isDragging = ref(false);
const isWrapperDragging = ref(false);
const isReadyMode = ref(false);
const isLeftActive = ref(false);
const isRightActive = ref(false);
const boxX = ref(0);
const boxY = ref(0);
const dotX = ref(0);
const boxTransition = ref("none");

// refs (保留用于其他目的，但获取位置统一使用 SelectorQuery)
const wrapperRef = ref(null);
const boxRef = ref(null);
const dotRef = ref(null);

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
let wrapperStartClientX = 0;
let wrapperDotBaseX = 0;


// 动态 wrapper 样式
const wrapperStyle = reactive({
  width: '300px',
  height: '270px',
  right: '90px',
  bottom: '50px'
});

// 存储 wrapper 的真实位置（缓存）
const wrapperRect = ref({ right: '90px', bottom: '50px', width: 360, height: 270 });
const instance = getCurrentInstance();

// ---------- 跨平台获取 wrapper 位置 ----------
const fetchWrapperRect = () => {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery().in(instance.proxy);
    query.select('.control-wrapper').boundingClientRect((rect) => {
      if (rect) {
        wrapperRect.value = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
      }
      resolve(wrapperRect.value);
    }).exec();
  });
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

  wrapperStyle.right = '90px';
  wrapperStyle.bottom = '50px';
  delete wrapperStyle.left; // 确保不冲突

  const x = wrapperSize.width - BOX_WIDTH - 10 - 50;
 
  const y = (wrapperSize.height - BOX_HEIGHT) / 2 + 50;
 
  const clamped = clampInWrapper(x, y);
  boxX.value = clamped.x;
  boxY.value = clamped.y;
  originBoxX = clamped.x;
  originBoxY = clamped.y;
};

// 左侧初始化
const backLeftInit = () => {

  wrapperStyle.left = '0px';
  wrapperStyle.bottom = '50px';
  delete wrapperStyle.right; // 确保不冲突

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

onMounted(async () => {
  updateWrapperSize();
  if (props.isLeft) backLeftInit();
  else backRightInit();

  // 首次获取位置
  await fetchWrapperRect();

  // #ifdef H5
  window.addEventListener('resize', async () => {
    updateWrapperSize();
    if (props.isLeft) backLeftInit();
    else backRightInit();
    await fetchWrapperRect();
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

// --- 从 control-box 自身开始拖拽 ---
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

// --- 从 wrapper 空白区域开始的操作（核心修复：每次实时获取 rect） ---
const handleWrapperStart = async (e) => {
  // 实时获取 wrapper 的最新位置，确保计算准确
  await fetchWrapperRect();

  // 如果仍然没有获取到（理论上不会），则忽略
  if (!wrapperRect.value.width) return;

  const { clientX, clientY } = getClientPos(e);
  const relX = clientX - wrapperRect.value.left;
  const relY = clientY - wrapperRect.value.top;

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

  let targetBoxX = relX - BOX_WIDTH / 2;
  let targetBoxY = relY - BOX_HEIGHT / 2;
  const clamped = clampInWrapper(targetBoxX, targetBoxY);
  boxX.value = clamped.x;
  boxY.value = clamped.y;
  dotX.value = 0; // 圆点居中

  // 记录移动基准
  wrapperStartClientX = clientX;
  wrapperDotBaseX = 0;
};

const handleWrapperMove = (e) => {
  if (!isWrapperDragging.value) return;
  if (e.cancelable) e.preventDefault();
  const { clientX } = getClientPos(e);
  let deltaX = clientX - wrapperStartClientX + wrapperDotBaseX;

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

  boxTransition.value = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  dotX.value = 0;
  wrapperDotBaseX = 0;
  resetArrows();
  setTimeout(() => {
    boxX.value = originBoxX;
    boxY.value = originBoxY;
  }, 50);
};
</script>

<style scoped>
.control-wrapper {
  position: fixed;
  /* left: 90px;  
  bottom: 50px; */
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
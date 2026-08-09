<template>
  <cover-view
    class="control-wrapper"
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
import { ref, reactive, watch, nextTick, onMounted, onBeforeUnmount, getCurrentInstance } from "vue";

const emit = defineEmits(["action"]);
const props = defineProps({
  isLeft: { type: Boolean, default: true },
});

const IDLE_DELAY = 200;
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

// 动态 wrapper 样式
const wrapperStyle = reactive({
  width: '300px',
  height: '290px',
  // left 或 right 以及 bottom 将在初始化时动态设置
});



// 内部变量
let idleTimer = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let lastPointerY = 0;
let readyStartPointerY = 0;
let dragBaseX = 0;
let dragBaseY = 0;
let wrapperStartY = 0;
let wrapperDotBaseY = 0;

// box 在 wrapper 内的初始位置
let originX = 0;
let originY = 0;

// 动态获取 wrapper 的真实屏幕矩形
const wrapperRect = ref({ left: 0, top: 0, width: 300, height: 290 });

const instance = getCurrentInstance();

const updateWrapperRect = () => {
 
 
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

// 左侧初始化
const backLeftInit = () => {
  wrapperStyle.left = '0px';
  wrapperStyle.bottom = '40px';
  delete wrapperStyle.right; // 确保不冲突

  currentBoxX.value = 40;
  currentBoxY.value = 85;
  originX = 40;
  originY = 85;
};

// 右侧初始化
const backRightInit = () => {
  delete wrapperStyle.left;
  wrapperStyle.right = '160px';
  wrapperStyle.bottom = '40px';

  // box 在 wrapper 内部靠右的位置（wrapper 宽度 300，box 宽度 50）
  originX = 300 - 50 ; // 右边距 10
  originY = 85;
  currentBoxX.value = originX;
  currentBoxY.value = originY;
};

// 监听 isLeft 变化，重新初始化位置并更新矩形
watch(
  () => props.isLeft,
  (val) => {
    if (val) backLeftInit();
    else backRightInit();
    nextTick(() => updateWrapperRect());
  },
  { immediate: true }
);

// ---------- 工具函数 ----------
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

// ---------- Wrapper 空白区域操作 ----------
const handleWrapperStart = async (e) => {

  await updateWrapperRect();

  const { clientX, clientY } = getClientPos(e);
  const rect = wrapperRect.value;

  const relX = clientX - rect.left;
  const relY = clientY - rect.top;

  // 点在 box 内部则交给 box 自身处理
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

  // box 中心对准触点
  let targetX = relX - 25;   // 50/2
  let targetY = relY - 90;   // 180/2
  // 限制在 wrapper 内部
  targetX = Math.max(0, Math.min(targetX, rect.width - 50));
  targetY = Math.max(0, Math.min(targetY, rect.height - 180));
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
  currentBoxX.value = originX;
  currentBoxY.value = originY;
};

// 生命周期
onMounted(() => {
  updateWrapperRect();
  // #ifdef H5
  window.addEventListener('resize', updateWrapperRect);
  // #endif
});

onBeforeUnmount(() => {
  clearTimeout(idleTimer);
  // #ifdef H5
  window.removeEventListener('resize', updateWrapperRect);
  // #endif
});
</script>

<style scoped>
.control-wrapper {
  position: fixed;
  /* left/right 和 bottom 由 :style 动态绑定，这里不写 */
  width: 300px;
  height: 270px;
  /* 调试时可加背景色 */
  /* background: rgba(255, 167, 38, 0.2); */
	z-index: 9998;
}

.control-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
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
<template>
  <cover-view class="control-box" ref="boxRef" :style="{ transform: `translate3d(${boxX}px, ${boxY}px, 0)` }"
    @touchstart="handleStart" @touchmove.stop="handleMove" @touchend="handleEnd" @mousedown="handleStart">
    <cover-image class="arrow left" src="/static/images/arrow_left_big@2x.png"
      :class="{ active: isLeftActive }"></cover-image>

  
      <cover-image class="dot" ref="dotRef"  :class="{ ready: isReadyMode }" src="/static/images/dot@2x.png" :style="{
        transition: isDragging
          ? 'none'
          : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease, box-shadow 0.3s ease',
        transform: `translateX(${dotX}px) scale(1)`
      }"></cover-image>



    <cover-image class="arrow right" src="/static/images/arrow_right_big@2x.png"
      :class="{ active: isRightActive }"></cover-image>
  </cover-view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const emit = defineEmits(["action"]);

const props = defineProps({
  isLeft: { type: Boolean, default: false },
});

// --- 配置参数 ---
const IDLE_DELAY = 500;
const SWIPE_THRESHOLD = 20;
const MAX_DOT_DRAG = 40;
const BOX_WIDTH = 90;

// --- 响应式状态 ---
const isDragging = ref(false);
const isReadyMode = ref(false);
const isLeftActive = ref(false);
const isRightActive = ref(false);

const boxX = ref(0);
const boxY = ref(0);
const dotX = ref(0);

// --- 内部非响应式状态 ---
let idleTimer = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dotStartOffset = 0;
let initialBoxX = 0;
let initialBoxY = 0;

// 工具函数：获取屏幕尺寸（横屏适配）
const getScreenSize = () => {
  // #ifdef H5
  return { width: window.innerWidth, height: window.innerHeight };
  // #endif

  // #ifdef MP-WEIXIN
  const info = uni.getSystemInfoSync();
  // 强制取长边为 width（适配横屏）
  return {
    width: Math.max(info.windowWidth, info.windowHeight),
    height: Math.min(info.windowWidth, info.windowHeight),
  };
  // #endif
};

// 工具函数：限制组件位置在屏幕内
const clampPosition = (x, y) => {
  const { width, height } = getScreenSize();
  return {
    x: Math.max(0, Math.min(x, width - 180)),   // 180 是组件宽度
    y: Math.max(0, Math.min(y, height - 50)),   // 50 是组件高度
  };
};

// 右侧初始化
const backRightInit = () => {
  const { width, height } = getScreenSize();
  let x = width / 2 + 130 + 40;
  let y = height / 2 + 40;
  // 不调用 clampPosition 直接赋值，测试一下。
  const clamped = clampPosition(x, y);
  boxX.value = clamped.x;
  boxY.value = clamped.y;
};

// 左侧初始化
const backLeftInit = () => {
  // const { width, height } = getScreenSize();
  let x = 20;
  let y = 190;
  const clamped = clampPosition(x, y);
  boxX.value = clamped.x;
  boxY.value = clamped.y;
};

// 生命周期：初始化位置
onMounted(() => {
  if (props.isLeft) {
    backLeftInit();
  } else {
    backRightInit();
  }

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
  wx.offWindowResize();
  // #endif

  // #ifdef H5
  window.removeEventListener('resize', () => { });
  // #endif
});

// 监听 isLeft 变化（移除 immediate，避免与 onMounted 重复初始化）
watch(
  () => props.isLeft,
  (val) => {
    if (val) {
      backLeftInit();
    } else {
      backRightInit();
    }
  },
  { deep: true }
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
  // 震动反馈
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
  // 位置复位
  if (props.isLeft) {
    backLeftInit();
  } else {
    backRightInit();
  }
};

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

  // 小程序端由于使用了 @touchmove.stop，已自动阻止冒泡，此处无需额外操作
  // 但为了 H5 的兼容，仍调用 preventDefault（如果可取消）
  // #ifdef H5
  if (e.cancelable) e.preventDefault();
  // #endif

  const { clientX, clientY } = getClientPos(e);

  resetIdleTimer();

  if (!isReadyMode.value) {
    // 自由拖动容器
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
    // 待命模式：圆点左右弹性滑动
    let deltaX = clientX - (boxX.value + BOX_WIDTH / 2) - dotStartOffset;
    const absDelta = Math.abs(deltaX);
    console.log(absDelta, "absDelta", MAX_DOT_DRAG)

    if (absDelta > MAX_DOT_DRAG) {
      const excess = absDelta - MAX_DOT_DRAG;
      const sign = deltaX > 0 ? 1 : -1;
      deltaX = sign * (MAX_DOT_DRAG + excess * 0.2);
    }

    console.log(deltaX, "deltaX")

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
  /* H5 下禁止默认触摸行为 */
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
  /* background-color: rgba(255, 167, 38, 0.3); */
  border: 1px solid rgba(255, 167, 38, 0.8);
  border-radius: 50%;

}
</style>
<template>
  <cover-view class="control-wrapper" @touchstart.prevent="handleStart" @touchmove.prevent="handleMove"
      @touchend.prevent="handleEnd" ref="wrapperRef" :style="wrapperStyle">
    <cover-view class="control-box" >
      <cover-view class="cont">
        <!-- 轨迹背景圈 -->
        <cover-view class="track-bg">
          
        </cover-view>

        <cover-image class="arrow up" src="../static/arrow_up_big@2x.png"
        :class="{ active: isUpActive }"></cover-image>

        <cover-image class="arrow down" src="../static/arrow_down_big@2x.png"
        :class="{ active: isDownActive }"></cover-image>
        <!-- 摇杆圆点 -->
        <cover-view  class="dot" :class="{ ready: isReadyMode }" :style="dotStyle">
          <cover-image  src="../static/dot@2x.png"></cover-image>
        </cover-view>
      </cover-view>
    </cover-view>
  </cover-view>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, getCurrentInstance, reactive, nextTick } from "vue";

const emit = defineEmits(["action", "action2"]);

const props = defineProps({
  mode: { type: Boolean, default: true },
  isLeft: { type: Boolean, default: true },
});

watch(() => props.isLeft, (val) => {
  if (val) backLeftInit();
  else backRightInit();
}, { deep: true });

// --- 配置参数 ---
const IDLE_DELAY = 200; // 进入待命模式的延迟时间(ms)
const MAX_RADIUS = 65; // 圆点滑动的最大半径(px)
const SWIPE_THRESHOLD = 15; // 触发箭头的阈值

// --- 响应式状态 ---
const isDragging = ref(false);
const isReadyMode = ref(false);
const isUpActive = ref(false);
const isDownActive = ref(false);
const isLeftActive = ref(false);
const isRightActive = ref(false);

// 仅保留圆点位置状态
const currentDotX = ref(0);
const currentDotY = ref(0);
const wrapperRef = ref(null);
// --- 内部非响应式状态 ---
let idleTimer = null;
let lastPointerX = 0;
let lastPointerY = 0;
let readyBaseX = 0;
let readyBaseY = 0;
let emitInterval = null; // 定时器句柄

// --- 计算属性 (仅绑定圆点样式) ---
const dotStyle = computed(() => ({
  transform: `translate(calc(-50% + ${currentDotX.value}px), calc(-50% + ${currentDotY.value}px))`,
  transition: isDragging.value
    ? "none"
    : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease",
}));

const wrapperStyle = reactive({
  left: '90px',
  bottom: '50px'
});

const instance = getCurrentInstance();

const backLeftInit = () => {
  wrapperStyle.left = '90px';
  wrapperStyle.bottom = '50px';
  delete wrapperStyle.right;
}

const backRightInit = () => {
  wrapperStyle.right = '120px';
  wrapperStyle.bottom = '50px';
  delete wrapperStyle.left;
}

// --- 核心方法 ---
const resetIdleTimer = () => {
  clearTimeout(idleTimer);
  if (!isReadyMode.value) {
    idleTimer = setTimeout(enterReadyMode, IDLE_DELAY);
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

const enterReadyMode = () => {
  isReadyMode.value = true;
  // 关键修复：不更新基准点，防止抖动
  // readyBaseX = lastPointerX;
  // readyBaseY = lastPointerY;
  uni.vibrateShort({ type: "light" });
};

const updateArrows = (dx, dy) => {

  const distance = Math.sqrt(dx * dx + dy * dy);
  const ratioValue = Math.min(distance / MAX_RADIUS, 1);
  
  isUpActive.value = dy < -SWIPE_THRESHOLD;
  isDownActive.value = dy > SWIPE_THRESHOLD;
  // 左右方向保留（若未来需要可启用）
  isLeftActive.value = dx < -SWIPE_THRESHOLD;
  isRightActive.value = dx > SWIPE_THRESHOLD;

  // 清除旧定时器
  if (emitInterval) {
    clearInterval(emitInterval);
    emitInterval = null;
  }

  const hasActive = isUpActive.value || isDownActive.value;
  if (hasActive && isDragging.value) {
    // 立即发送一次，保证即时响应
    const value = Math.round(dy * 100) / 100;


    emit("action", { fb: dy < 0, value: value, ratioValue });

    // 启动定时器，每 40ms 持续发送当前偏移量
    emitInterval = setInterval(() => {
      // 若方向已取消或已松开，则停止
      if (!isDragging.value || !(isUpActive.value || isDownActive.value)) {
        clearInterval(emitInterval);
        emitInterval = null;
        return;
      }
      const dyNow = currentDotY.value;
      const valueNow = Math.round(dyNow * 100) / 100;

      emit("action", { fb: dyNow < 0, value: valueNow, ratioValue });
    }, 1000);
  } else {
    // 无激活方向，发送停止信号
    emit("action", { fb: false, value: 0 });
  }
};

const resetArrows = () => {
  isUpActive.value = false;
  isDownActive.value = false;
  isLeftActive.value = false;
  isRightActive.value = false;
  if (emitInterval) {
    clearInterval(emitInterval);
    emitInterval = null;
  }
  emit("action", { fb: false, value: 0 });
};

// --- 事件处理 ---
const handleStart = (e) => {
  isDragging.value = true;
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  resetArrows();

  const { clientX, clientY } = getClientPos(e);
  lastPointerX = clientX;
  lastPointerY = clientY;

  // 在按下时立刻记录基准点，防止移动时产生巨大偏移
  readyBaseX = lastPointerX;
  readyBaseY = lastPointerY;

  resetIdleTimer();
};

const handleMove = (e) => {
  if (!isDragging.value) return;

  const { clientX, clientY } = getClientPos(e);

  lastPointerX = clientX;
  lastPointerY = clientY;
  resetIdleTimer();

  // 圆点滑动逻辑
  let dx = clientX - readyBaseX;
  let dy = clientY - readyBaseY;

  // 计算距离并限制在圆内
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > MAX_RADIUS) {
    const angle = Math.atan2(dy, dx);
    dx = Math.cos(angle) * MAX_RADIUS;
    dy = Math.sin(angle) * MAX_RADIUS;
  }

  currentDotX.value = dx;
  currentDotY.value = dy;
  updateArrows(dx, dy);
};

const handleEnd = () => {
  if (!isDragging.value) return;
  // 1. 先归零（此时 isDragging 仍为 true，过渡被禁用）
  currentDotX.value = 0;
  currentDotY.value = 0;
  // 2. 再改变状态
  isDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);
  if (emitInterval) {
    clearInterval(emitInterval);
    emitInterval = null;
  }
  resetArrows();
};

const handleClick = (val) => {
  emit("action2", {
    type: val,
  });
};
</script>

<style lang="scss" scoped>
.control-wrapper {
  position: fixed;
  width: 140px;
  height: 180px;
  z-index: 9999;
}

.control-box {
  position: absolute;
  left: 0;
  width: 100%;
  height: 180px;
  user-select: none;
  touch-action: none;
}

.cont {
  position: relative;
  width: 140px;
  height: 190px;

  /* 轨迹背景圈 */
  .track-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 128px;
    height: 128px;
    border-radius: 50%;
    pointer-events: none;
  }

  /* 箭头通用 */
  .arrow {
    width: 50px;
    height: 50px;
    opacity: 0.7;
    transition: all 0.2s ease;
    z-index: 1;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    .image {
      display: block;
      width: 50px;
      height: 50px;
    }

    &.active {
      opacity: 1;
      filter: drop-shadow(0 0 4px rgba(255, 167, 38, 0.8));
      transform: scale(1.2);
    }
  }

  /* 箭头位置 */
  .arrow.up {
    position: absolute;
    left: 45px;
    top: 0;
  }

  .arrow.down {
    position: absolute;
    left: 45px;
    bottom: 0;
  }

  // .arrow.left { ... }
  // .arrow.right { ... }

  /* 摇杆圆点 — 居中 */
  .dot {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    z-index: 2;
    border: 2px solid rgba(255, 255, 255, 0.3);

    &.ready {
      box-shadow: 0 0 12px rgba(255, 167, 38, 0.8);
    }
  }
}

.flex {
  display: flex;
  justify-content: space-between;
}
</style>
<template>
  <cover-view class="control-wrapper">
    <cover-view
      class="control-box"
      @touchstart.prevent="handleStart"
      @touchmove.prevent="handleMove"
      @touchend.prevent="handleEnd"
    >
      <cover-view class="cont">
        <!-- 轨迹背景圈 -->
        <cover-view class="track-bg"></cover-view>

        <!-- 四个方向箭头 -->
        <cover-view class="arrow up" :class="{ active: isUpActive }">
          <cover-image class="image" src="/static/images/btn_up2@2x.png" />
        </cover-view>
        <cover-view class="arrow down" :class="{ active: isDownActive }">
          <cover-image class="image" src="/static/images/btn_down2@2x.png" />
        </cover-view>
        <cover-view class="arrow left" :class="{ active: isLeftActive }"></cover-view>
        <cover-view class="arrow right" :class="{ active: isRightActive }"></cover-view>

        <!-- 摇杆圆点（居中） -->
        <cover-view
          class="dot"
          :class="{ ready: isReadyMode }"
          :style="dotStyle"
        ></cover-view>
      </cover-view>
    </cover-view>

    <!-- 独立的上下箭头（保留原功能） -->
    <cover-view class="up-down-arrow">
      <cover-view class="arrow1 up" :class="{ active: isUpActive }">
        <cover-image
          class="image"
          src="/static/images/btn_up_ex@2x.png"
          @touchend.prevent="handleClick('up')"
          mode="aspectFit"
        />
      </cover-view>
      <cover-view class="arrow1 down" :class="{ active: isDownActive }">
        <cover-image
          class="image"
          src="/static/images/btn_down_ex@2x.png"
          @touchend.prevent="handleClick('down')"
          mode="aspectFit"
        />
      </cover-view>
    </cover-view>
  </cover-view>
</template>

<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["action", "action2"]);

// --- 配置 ---
const IDLE_DELAY = 500;       // 进入待命模式的延迟(ms)
const MAX_RADIUS = 65;        // 最大偏移半径(px)
const SWIPE_THRESHOLD = 20;   // 触发方向箭头的阈值

// --- 响应式状态 ---
const isDragging = ref(false);
const isReadyMode = ref(false);
const isUpActive = ref(false);
const isDownActive = ref(false);
const isLeftActive = ref(false);
const isRightActive = ref(false);

// 圆点偏移量（相对于圆心）
const currentDotX = ref(0);
const currentDotY = ref(0);

// 内部非响应式变量
let idleTimer = null;
let lastPointerX = 0;
let lastPointerY = 0;
let readyBaseX = 0;
let readyBaseY = 0;

// --- 计算属性：动态圆点样式（居中 + 偏移） ---
const dotStyle = computed(() => ({
  transform: `translate(calc(-50% + ${currentDotX.value}px), calc(-50% + ${currentDotY.value}px))`,
  transition: isDragging.value
    ? "none"
    : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease",
}));

// --- 工具函数 ---
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
  readyBaseX = lastPointerX;
  readyBaseY = lastPointerY;
  uni.vibrateShort?.({ type: "light" });
};

const updateArrows = (dx, dy) => {
  isUpActive.value = dy < -SWIPE_THRESHOLD;
  isDownActive.value = dy > SWIPE_THRESHOLD;
  isLeftActive.value = dx < -SWIPE_THRESHOLD;
  isRightActive.value = dx > SWIPE_THRESHOLD;
  emit("action", {
    up: isUpActive.value,
    down: isDownActive.value,
    left: isLeftActive.value,
    right: isRightActive.value,
  });
};

const resetArrows = () => {
  isUpActive.value = false;
  isDownActive.value = false;
  isLeftActive.value = false;
  isRightActive.value = false;
  emit("action", { up: false, down: false, left: false, right: false });
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
  readyBaseX = clientX;
  readyBaseY = clientY;

  resetIdleTimer();
};

const handleMove = (e) => {
  if (!isDragging.value) return;

  const { clientX, clientY } = getClientPos(e);
  lastPointerX = clientX;
  lastPointerY = clientY;
  resetIdleTimer();

  let dx = clientX - readyBaseX;
  let dy = clientY - readyBaseY;

  // 限制最大半径
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
  isDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);

  currentDotX.value = 0;
  currentDotY.value = 0;
  resetArrows();
};

const handleClick = (val) => {
  emit("action2", { type: val, isLeft: true });
};
</script>

<style lang="scss" scoped>
.control-box {
  position: fixed;
  left: 55px;
  bottom: 40px;
  width: 175px;
  height: 175px;
  z-index: 9999;
  user-select: none;
  touch-action: none;

}

.up-down-arrow {
  position: fixed;
  left: 230px;
  bottom: 78px;
  z-index: 9999;
  text-align: center;

  .arrow1 {
    width: 36px;
    height: 36px;

    .image {
      display: block;
      width: 36px;
      height: 36px;
    }
  }

  .down {
    margin-top: 20px;
  }
}

.cont {
  position: relative;
  width: 176px;
  height: 176px;

  /* 轨迹背景圈 */
  .track-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 128px;
    height: 128px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px dashed rgba(255, 255, 255, 0.2);
    pointer-events: none;
    z-index: 0;
  }

  /* 箭头通用 */
  .arrow {
    width: 26px;
    height: 26px;
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
      width: 26px;
      height: 26px;
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
    left: 75px;
    top: 25px;
  }

  .arrow.down {
    position: absolute;
    left: 75px;
    bottom: 25px;
  }

  .arrow.left {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 25px;
    width: 0;
    height: 0;
    border-top: 12.5px solid transparent;
    border-bottom: 12.5px solid transparent;
    border-right: 21.65px solid #ffcc66;
    background: none;

    &.active {
      border-right-color: #ffa726;
      filter: drop-shadow(0 0 6px rgba(255, 167, 38, 0.9));
      transform: translateY(-50%) scale(1.2);
    }
  }

  .arrow.right {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 25px;
    width: 0;
    height: 0;
    border-top: 12.5px solid transparent;
    border-bottom: 12.5px solid transparent;
    border-left: 21.65px solid #ffcc66;
    background: none;

    &.active {
      border-left-color: #ffa726;
      filter: drop-shadow(0 0 6px rgba(255, 167, 38, 0.9));
      transform: translateY(-50%) scale(1.2);
    }
  }

  /* 摇杆圆点 — 居中 */
  .dot {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 36px;
    height: 36px;
    border-radius: 50%;

    z-index: 2;
    border: 2px solid rgba(255, 255, 255, 0.4);

    &.ready {
      box-shadow: 0 0 12px rgba(255, 167, 38, 0.8);
    }
  }
}
</style>
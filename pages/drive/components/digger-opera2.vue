<template>
  <view
    class="control-box"
    :style="boxStyle"
    @touchstart.prevent="handleStart"
    @touchmove.prevent="handleMove"
    @touchend.prevent="handleEnd"
  >
    <!-- 轨迹背景圈 -->
    <view class="track-bg"></view>

    <!-- 四个方向箭头 -->
    <view class="arrow up" :class="{ active: isUpActive }">
      <image
        class="image"
        src="/static/images/btn_up1@2x.png"
        mode="aspectFit"
      ></image>
    </view>
    <view class="arrow down" :class="{ active: isDownActive }">
      <image
        class="image"
        src="/static/images/btn_down1@2x.png"
        mode="aspectFit"
      ></image>
    </view>
    <view class="arrow left" :class="{ active: isLeftActive }">
      <image
        class="image"
        src="/static/images/btn_bucket_down@2x.png"
        mode="aspectFit"
      ></image>
    </view>
    <view class="arrow right" :class="{ active: isRightActive }">
      <image
        class="image"
        src="/static/images/btn_bucket_up@2x.png"
        mode="aspectFit"
      ></image>
    </view>

    <!-- 摇杆圆点 -->
    <view class="dot" :class="{ ready: isReadyMode }" :style="dotStyle"></view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// --- 配置参数 ---
const IDLE_DELAY = 500; // 进入待命模式的延迟时间(ms)
const MAX_RADIUS = 65; // 圆点滑动的最大半径(px)
const SWIPE_THRESHOLD = 20; // 触发箭头的阈值

// --- 响应式状态 ---
const isDragging = ref(false);
const isReadyMode = ref(false);
const isUpActive = ref(false);
const isDownActive = ref(false);
const isLeftActive = ref(false);
const isRightActive = ref(false);

// 位置状态
const currentBoxX = ref(0);
const currentBoxY = ref(0);
const currentDotX = ref(0);
const currentDotY = ref(0);

// --- 内部非响应式状态 (用于计算，不触发视图更新) ---
let idleTimer = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let lastPointerX = 0;
let lastPointerY = 0;
let dragBaseX = 0;
let dragBaseY = 0;
let readyBaseX = 0;
let readyBaseY = 0;

// --- 计算属性 (绑定样式) ---
const boxStyle = computed(() => ({
  transform: `translate3d(${currentBoxX.value}px, ${currentBoxY.value}px, 0)`,
}));

const dotStyle = computed(() => ({
  transform: `translate3d(${currentDotX.value}px, ${currentDotY.value}px, 0) scale(1)`,
  transition: isDragging.value
    ? "none"
    : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease",
}));

// --- 核心方法 ---

// 初始化位置
const backLeftInit = () => {
  currentBoxX.value = 50;
  currentBoxY.value = 50;
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
  // 震动反馈
  uni.vibrateShort({ type: "light" });
};

const updateArrows = (dx, dy) => {
  isUpActive.value = dy < -SWIPE_THRESHOLD;
  isDownActive.value = dy > SWIPE_THRESHOLD;
  isLeftActive.value = dx < -SWIPE_THRESHOLD;
  isRightActive.value = dx > SWIPE_THRESHOLD;
};

const resetArrows = () => {
  isUpActive.value = false;
  isDownActive.value = false;
  isLeftActive.value = false;
  isRightActive.value = false;
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
  lastPointerX = clientX;
  lastPointerY = clientY;
  resetIdleTimer();
};

const handleMove = (e) => {
  if (!isDragging.value) return;

  const touch = e.touches[0];
  const clientX = touch.clientX;
  const clientY = touch.clientY;

  lastPointerX = clientX;
  lastPointerY = clientY;
  resetIdleTimer();

  if (!isReadyMode.value) {
    // --- 模式 A：自由拖动整个容器 ---
    let deltaX = clientX - dragOffsetX - dragBaseX;
    let deltaY = clientY - dragOffsetY - dragBaseY;

    // 限制容器移动范围
    deltaX = Math.max(-50, Math.min(100, deltaX));
    deltaY = Math.max(-100, Math.min(50, deltaY));

    currentBoxX.value = dragBaseX + deltaX;
    currentBoxY.value = dragBaseY + deltaY;
  } else {
    // --- 模式 B：待命模式 - 360度圆点滑动 ---
    let dx = clientX - readyBaseX;
    let dy = clientY - readyBaseY;

    // 【核心算法】：计算距离并限制在圆内
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > MAX_RADIUS) {
      // 超出半径，利用三角函数将坐标投影到圆周上
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * MAX_RADIUS;
      dy = Math.sin(angle) * MAX_RADIUS;
    }

    currentDotX.value = dx;
    currentDotY.value = dy;
    updateArrows(dx, dy);
  }
};

const handleEnd = () => {
  if (!isDragging.value) return;

  isDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);

  // 圆点回弹复位
  currentDotX.value = 0;
  currentDotY.value = 0;
  resetArrows();

  // 容器回到初始位置
  backLeftInit();
};

// 初始化
onMounted(() => {
  backLeftInit();
});
</script>

<style lang="scss" scoped>
/* 基础重置 */
/* 注意：在uni-app中，全局样式建议写在app.vue或uni.scss中，这里仅做组件内样式 */

.control-box {
  position: fixed;
  right: 160px;
  bottom: 100px;
  /* 原CSS中bottom未定义，默认为auto，这里保持原逻辑，通过JS控制top/left */
  width: 140px;
  height: 140px;
  display: grid;
  /* 三行三列网格布局，完美居中箭头和圆点 */
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  place-items: center;
  z-index: 100;
  will-change: transform;
  user-select: none;
  /* 防止长按选中或默认触摸行为 */
  touch-action: none;
}

/* 轨迹背景圈 */
.track-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  pointer-events: none;
  z-index: 0;
}

/* 箭头通用样式 */
.arrow {
  width: 25px;
  height: 25px;
  opacity: 1;
  transition: all 0.2s ease;
  z-index: 1;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;

  .image {
    width: 25px;
    height: 25px;
  }
}

.arrow.active {
  opacity: 1;
  filter: drop-shadow(0 0 4px rgba(255, 167, 38, 0.8));
  transform: scale(1.2);
}

/* 箭头位置分配 */
.arrow.up {
  grid-column: 2;
  grid-row: 1;
}
.arrow.down {
  grid-column: 2;
  grid-row: 3;
}
.arrow.left {
  grid-column: 1;
  grid-row: 2;
}
.arrow.right {
  grid-column: 3;
  grid-row: 2;
}

/* 摇杆圆点：居中 */
.dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  position: relative;
  z-index: 2;
  will-change: transform;
  grid-column: 2;
  grid-row: 2;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.dot.ready {
  box-shadow: 0 0 10px rgba(255, 167, 38, 0.8);
}
</style>

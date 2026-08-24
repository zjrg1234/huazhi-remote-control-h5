<template>
  <cover-view class="control-wrapper">
    <cover-view class="control-box" @touchstart.prevent="handleStart" @touchmove.prevent="handleMove"
      @touchend.prevent="handleEnd">
      <cover-view class="cont">
        <!-- 轨迹背景圈 -->
        <cover-view class="track-bg">
          <cover-image src="../static/btn_directional@2x.png"></cover-image>
        </cover-view>

        <!-- 摇杆圆点（居中） -->
        <cover-view class="dot" :class="{ ready: isReadyMode }" :style="dotStyle"></cover-view>
      </cover-view>
    </cover-view>


  </cover-view>
</template>

<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["action", "action2", "reset"]);

// --- 配置 ---
const IDLE_DELAY = 200; // 进入待命模式的延迟时间(ms)
const MAX_RADIUS = 52; // 圆点滑动的最大半径(px)
const SWIPE_THRESHOLD = 10; // 触发箭头的阈值

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
let emitInterval = null; // 持续发送定时器

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
  // 修复抖动：不更新基准点
  // readyBaseX = lastPointerX;
  // readyBaseY = lastPointerY;
  uni.vibrateShort?.({ type: "light" });
};

const emitCurrentState = () => {
  const dx = currentDotX.value;
  const dy = currentDotY.value;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = Math.min(distance / MAX_RADIUS, 1);

  // 默认无方向
  let up = false, down = false, left = false, right = false;

  if (distance >= SWIPE_THRESHOLD) {
    // 计算角度，以左为0度顺时针
    let angle = Math.atan2(dy, dx) * (180 / Math.PI); // 正右为0
    angle = (angle + 180) % 360; // 左为0
    if (angle < 0) angle += 360;

    // 判断区间
    if ((angle >= 330 && angle < 360) || (angle >= 0 && angle < 30)) {
      left = true;
    } else if (angle >= 30 && angle < 60) {
      left = true;
      up = true;
    } else if (angle >= 60 && angle < 120) {
      up = true;
    } else if (angle >= 120 && angle < 150) {
      up = true;
      right = true;
    } else if (angle >= 150 && angle < 210) {
      right = true;
    } else if (angle >= 210 && angle < 240) {
      right = true;
      down = true;
    } else if (angle >= 240 && angle < 300) {
      down = true;
    } else if (angle >= 300 && angle < 330) {
      down = true;
      left = true;
    }
  }

  // 更新活性（用于样式）
  isUpActive.value = up;
  isDownActive.value = down;
  isLeftActive.value = left;
  isRightActive.value = right;

  emit("action", {
    up,
    down,
    left,
    right,
    speed,
  });
};

// ----- 更新箭头（启动/停止定时器）-----
const updateArrows = (dx, dy) => {
  // 先清除旧定时器
  if (emitInterval) {
    clearInterval(emitInterval);
    emitInterval = null;
  }

  // 更新偏移量
  currentDotX.value = dx;
  currentDotY.value = dy;

  // 判断是否有任何方向激活
  const hasActive = (dy < -SWIPE_THRESHOLD || dy > SWIPE_THRESHOLD || dx < -SWIPE_THRESHOLD || dx > SWIPE_THRESHOLD);

  if (hasActive && isDragging.value) {
    // 立即发送一次
    emitCurrentState();

    // 启动定时器，每 40ms 持续发送
    emitInterval = setInterval(() => {
      // 如果方向已取消或已松开，则停止
      if (!isDragging.value || !(isUpActive.value || isDownActive.value || isLeftActive.value || isRightActive.value)) {
        clearInterval(emitInterval);
        emitInterval = null;
        return;
      }
      emitCurrentState();
    }, 40);
  } else {
    // 无激活方向，发送停止信号
    resetArrows();
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
  emit("action", { up: false, down: false, left: false, right: false, speed: 0 });
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

  // 调用更新（内部会处理定时器）
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


</script>

<style lang="scss" scoped>
.control-wrapper {
  position: fixed;
  left: 55px;
  bottom: 40px;
  width: 265px;
  height: 175px;
  z-index: 9999;
}

.control-box {
  position: absolute;
  width: 175px;
  height: 175px;
  user-select: none;
  touch-action: none;
}

.up-down-arrow {
  position: absolute;
  left: 190px;
  top: 45px;
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

  .track-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150px;
    height: 150px;
    border-radius: 50%;
    pointer-events: none;
  }




  /* 摇杆圆点 */
  .dot {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    z-index: 2;
 

    border: 2px solid rgba(84, 106, 130, 0.3);
    background-color: rgba(90 ,112, 137 ,50%);

    &.ready {
      box-shadow: 0 0 12px rgba(90 ,112, 137, 0.8);
    }
  }
}
</style>
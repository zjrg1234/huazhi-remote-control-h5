<template>
  <cover-view class="control-wrapper">
    <cover-view class="control-box" @touchstart.prevent="handleStart" @touchmove.prevent="handleMove"
      @touchend.prevent="handleEnd">
      <cover-view class="cont">
        <!-- 轨迹背景圈 -->
        <cover-view class="track-bg">
          <cover-image src="../static/btn_bg.png"></cover-image>
        </cover-view>

        <!-- 四个方向箭头（注释掉，仅保留摇杆） -->

        <!-- 摇杆圆点 -->
        <cover-view class="dot" :class="{ ready: isReadyMode }" :style="dotStyle"></cover-view>
      </cover-view>
    </cover-view>

    <!-- 代表ch2 油门 -->
    <cover-view class="up-down-arrow" v-show="!mode" :style="{ display: !mode ? 'block' : 'none' }">
      <cover-view class="arrow1 up" :class="{ active: isUpActive }">
        <cover-image class="image" src="../static/btn_up_ex@2x.png" @touchstart.stop="handleClickUp"
          @touchend.stop="handleClickUpLeave" @touchcancel.stop="handleClickUpLeave" @contextmenu.prevent mode="aspectFit"></cover-image>
      </cover-view>
      <cover-view class="arrow1 down" :class="{ active: isUpActive }">
        <cover-image class="image" src="../static/btn_down_ex@2x.png" mode="aspectFit" @touchstart.stop="handleClickDown"
          @touchend.stop="handleClickDownLeave" @touchcancel.stop="handleClickDownLeave"
          @contextmenu.prevent></cover-image>
      </cover-view>
    </cover-view>

    <cover-view class="up-up-arrow" v-show="mode" :style="{ display: mode ? 'block' : 'none' }">
      <cover-view class="flex">
        <cover-view class="arrow1 up" :class="{ active: isUpActive }">
          <cover-image class="image" src="../static/btn_up_ex@2x.png" @touchstart.stop="handleClickUp"
          @touchend.stop="handleClickUpLeave" @touchcancel.stop="handleClickUpLeave" @contextmenu.prevent mode="aspectFit"></cover-image>
        </cover-view>
        <cover-view class="arrow1 up" :class="{ active: isUpActive }">
          <cover-image class="image" src="../static/btn_up_ex@2x.png" mode="aspectFit" @touchstart.stop="handleClickDown"
          @touchend.stop="handleClickDownLeave" @touchcancel.stop="handleClickDownLeave"
            @contextmenu.prevent></cover-image>
        </cover-view>
      </cover-view>
    </cover-view>
  </cover-view>
</template>

<script setup>
import { ref, computed } from "vue";
const emit = defineEmits(["action", "action2","reset"]);

const props = defineProps({
  mode: { type: Boolean, default: true },
});

// --- 配置参数 ---
const IDLE_DELAY = 500; // 进入待命模式的延迟时间(ms)
const MAX_RADIUS = 58; // 圆点滑动的最大半径(px)
const SWIPE_THRESHOLD = 10; // 触发箭头的阈值

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

// 发送当前状态（方向 + 速率）
const emitCurrentState = () => {
  const dx = currentDotX.value;
  const dy = currentDotY.value;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // const speed = Math.min(distance / MAX_RADIUS, 1);
  const speed = Math.min(distance / 47, 1);


  const up = dy < -SWIPE_THRESHOLD;
  const down = dy > SWIPE_THRESHOLD;
  const left = dx < -SWIPE_THRESHOLD;
  const right = dx > SWIPE_THRESHOLD;

  // 更新箭头活性（用于样式）
  isUpActive.value = up;
  isDownActive.value = down;
  isLeftActive.value = left;
  isRightActive.value = right;
  console.log(speed)
  emit("action", {
    up,
    down,
    left,
    right,
    speed,
  });
};

const updateArrows = (dx, dy) => {
  // 清除旧定时器
  if (emitInterval) {
    clearInterval(emitInterval);
    emitInterval = null;
  }

  // 更新当前偏移量（已在 handleMove 中赋值，但为了安全再设置一次）
  currentDotX.value = dx;
  currentDotY.value = dy;

  // 判断是否有激活方向
  const hasActive = (dy < -SWIPE_THRESHOLD || dy > SWIPE_THRESHOLD || dx < -SWIPE_THRESHOLD || dx > SWIPE_THRESHOLD);
  
  if (hasActive && isDragging.value) {
    // 立即发送一次
    emitCurrentState();

    // 启动定时器，每 40ms 持续发送
    emitInterval = setInterval(() => {
      // 若方向已取消或已松开，则停止
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
  emit("action", {
    up: false,
    down: false,
    left: false,
    right: false,
    speed: 0,
  });
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

  // 更新响应式位置
  currentDotX.value = dx;
  currentDotY.value = dy;

  // 处理方向与定时器
  updateArrows(dx, dy);
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
};

// ---- 外部按钮（上/下）长按重复逻辑 ----
let longPressTimerUp = null;
let repeatTimerUp = null;
let longPressTimerDown = null;
let repeatTimerDown = null;

const LONG_PRESS_DELAY = 300;
const REPEAT_INTERVAL = 100;

const handleClickUp = () => {
  emit("reset");
  clearTimeout(longPressTimerUp);
  clearInterval(repeatTimerUp);
  doUpAction(true);

  longPressTimerUp = setTimeout(() => {
    repeatTimerUp = setInterval(() => {
      doUpAction(true);
    }, REPEAT_INTERVAL);
  }, LONG_PRESS_DELAY);
};

const handleClickUpLeave = () => {
  clearTimeout(longPressTimerUp);
  clearInterval(repeatTimerUp);
  longPressTimerUp = null;
  repeatTimerUp = null;
  doUpAction(false);
};

const handleClickDown = () => {
  emit("reset");
  clearTimeout(longPressTimerDown);
  clearInterval(repeatTimerDown);
  doDownAction(true);

  longPressTimerDown = setTimeout(() => {
    repeatTimerDown = setInterval(() => {
      doDownAction(true);
    }, REPEAT_INTERVAL);
  }, LONG_PRESS_DELAY);
};

const handleClickDownLeave = () => {
  clearTimeout(longPressTimerDown);
  clearInterval(repeatTimerDown);
  longPressTimerDown = null;
  repeatTimerDown = null;
  doDownAction(false);
};

const doDownAction = (flag) => {
  emit("action2", { type: "down", isLeft: false, flag: flag ? 1 : 0 });
};

const doUpAction = (flag) => {
  emit("action2", { type: "up", isLeft: false, flag: flag ? 1 : 0 });
};
</script>

<style lang="scss" scoped>
.control-wrapper {
  position: fixed;
  right: 85px;
  bottom: 40px;
  width: 265px;
  height: 175px;
  z-index: 9999;
}

.control-box {
  position: absolute;
  right: 0;
  width: 175px;
  height: 175px;
  user-select: none;
  touch-action: none;
}

.up-up-arrow {
  position: absolute;
  left: 0;
  top: 70px;
  z-index: 9999;
  height: 175px;
  text-align: center;
  width: 90px;

  .arrow1 {
    width: 36px;
    height: 36px;

    .image {
      display: block;
      width: 36px;
      height: 36px;
    }
  }
}

.up-down-arrow {
  position: absolute;
  left: 40px;
  top: 45px;
  z-index: 9999;
  height: 175px;
  text-align: center;
  width: 90px;

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
    width: 160px;
    height: 160px;
    border-radius: 50%;
    pointer-events: none;
  }

  /* 箭头通用（注释掉未使用） */
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

  /* 箭头位置（注释掉未使用） */
  .arrow.up { position: absolute; left: 75px; top: 25px; }
  .arrow.down { position: absolute; left: 75px; bottom: 25px; }
  .arrow.left { position: absolute; top: 50%; transform: translateY(-50%); left: 25px; }
  .arrow.right { position: absolute; top: 50%; transform: translateY(-50%); right: 25px; }

  /* 摇杆圆点 — 居中 */
  .dot {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 36px;
    height: 36px;
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
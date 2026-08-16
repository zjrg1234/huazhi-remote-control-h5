<template>
  <cover-view class="control-wrapper" ref="wrapperRef" :style="wrapperStyle">
    <cover-view class="control-box" >
      <cover-view class="cont">
        <!-- 轨迹背景圈 -->
        <cover-view class="track-bg">
          
        </cover-view>

        <!-- 四个方向箭头 -->
        <!-- <cover-view class="arrow up" :class="{ active: isUpActive }">
          <cover-image class="image" src="../static/btn_up1@2x.png"></cover-image>
        </cover-view>
        <cover-view class="arrow down" :class="{ active: isDownActive }">
          <cover-image class="image" src="../static/btn_down1@2x.png"></cover-image>
        </cover-view>
        <cover-view class="arrow left" :class="{ active: isLeftActive }">
          <cover-image class="image" src="../static/btn_bucket_down@2x.png"></cover-image>
        </cover-view>
        <cover-view class="arrow right" :class="{ active: isRightActive }">
          <cover-image class="image" src="../static/btn_bucket_up@2x.png"></cover-image>
        </cover-view> -->

           <cover-image class="arrow left" src="../static/arrow_left_big@2x.png"
        :class="{ active: isLeftActive }"></cover-image>

         <cover-image class="arrow right" src="../static/arrow_right_big@2x.png"
        :class="{ active: isRightActive }"></cover-image>
        <!-- 摇杆圆点 -->
        <cover-view @touchstart.prevent="handleStart" @touchmove.prevent="handleMove"
      @touchend.prevent="handleEnd" class="dot" :class="{ ready: isReadyMode }" :style="dotStyle">

           <cover-image  src="../static/dot@2x.png"></cover-image>
        </cover-view>
      </cover-view>
    </cover-view>

 
  </cover-view>
</template>

<script setup>

import { ref, onMounted, computed,onBeforeUnmount, watch, getCurrentInstance, reactive } from "vue";

const emit = defineEmits(["action", "action2"]);

const props = defineProps({
  mode: { type: Boolean, default: true },
  isLeft: { type: Boolean, default: false },
});


watch(() => props.isLeft, (val) => {

  if (val) backLeftInit();
  else backRightInit();
}, { deep: true });




// --- 配置参数 ---
const IDLE_DELAY = 500; // 进入待命模式的延迟时间(ms)
const MAX_RADIUS = 65; // 圆点滑动的最大半径(px)
const SWIPE_THRESHOLD = 5; // 触发箭头的阈值

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

// --- 计算属性 (仅绑定圆点样式) ---
// const dotStyle = computed(() => ({
//   transform: `translate3d(${currentDotX.value}px, ${currentDotY.value}px, 0) scale(1)`,
//   transition: isDragging.value
//     ? "none"
//     : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease",
// }));

const dotStyle = computed(() => ({
  transform: `translate(calc(-50% + ${currentDotX.value}px), calc(-50% + ${currentDotY.value}px))`,
  transition: isDragging.value
    ? "none"
    : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease",
}));

const wrapperStyle = reactive({
  right: '120px',
  bottom: '50px'
});

const instance = getCurrentInstance();

// ---------- 跨平台获取 wrapper 位置 ----------
// const fetchWrapperRect = () => {
//   return new Promise((resolve) => {
//     const query = uni.createSelectorQuery().in(instance.proxy);
//     query.select('.control-wrapper').boundingClientRect((rect) => {
//       if (rect) {
//         wrapperRect.value = {
//           left: rect.left,
//           top: rect.top,
//           width: rect.width,
//           height: rect.height,
//         };
//       }
//       resolve(wrapperRect.value);
//     }).exec();
//   });
// };

const backLeftInit = () => {
  wrapperStyle.left = '90px';
  wrapperStyle.bottom = '50px';
  delete wrapperStyle.right; // 确保不冲突
}

const backRightInit = () => {
   wrapperStyle.right = '120px';
  wrapperStyle.bottom = '50px';
  delete wrapperStyle.left; // 确保不冲突
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
  readyBaseX = lastPointerX;
  readyBaseY = lastPointerY;
  uni.vibrateShort({ type: "light" });
};

const updateArrows = (dx, dy) => {
 
  isUpActive.value = dy < -SWIPE_THRESHOLD;
  isDownActive.value = dy > SWIPE_THRESHOLD;
  isLeftActive.value = dx < -SWIPE_THRESHOLD;
  isRightActive.value = dx > SWIPE_THRESHOLD;

  if (isLeftActive.value == false && isRightActive.value == false) {
    return;
  }
 
  emit("action", { lr: dx < 0, value: dx });

};

const resetArrows = () => {
  isUpActive.value = false;
  isDownActive.value = false;
  isLeftActive.value = false;
  isRightActive.value = false;
  emit("action", { lr: false, value: 0 });
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

  isDragging.value = false;
  isReadyMode.value = false;
  clearTimeout(idleTimer);

  // 圆点回弹复位
  currentDotX.value = 0;
  currentDotY.value = 0;
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
  right: 120px;
  bottom: 40px;
  width: 215px;
  height: 175px;
  z-index: 9999;

}

.control-box {
  position: absolute;
  right: 0;
  width: 100%;
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
    width: 50px;
    height: 50px;
    opacity: 0.8;

    .image {
      display: block;
      width: 50px;
      height: 50px;
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
  width: 235px;
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
   


  }

  .arrow.right {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 25px;
  }

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

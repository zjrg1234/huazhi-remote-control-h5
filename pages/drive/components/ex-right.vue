<template>

    <view class="control-wrapper">


        <view class="control-box" @touchstart.prevent="handleStart" @touchmove.prevent="handleMove"
            @touchend.prevent="handleEnd">
            <!-- 轨迹背景圈 -->
            <view class="track-bg"></view>

            <!-- 四个方向箭头 -->
            <view class="arrow up" :class="{ active: isUpActive }">
                <image class="image" src="/static/images/btn_up1@2x.png" mode="aspectFit"></image>
            </view>
            <view class="arrow down" :class="{ active: isDownActive }">
                <image class="image" src="/static/images/btn_down1@2x.png" mode="aspectFit"></image>
            </view>
            <view class="arrow left" :class="{ active: isLeftActive }">
                <image class="image" src="/static/images/btn_bucket_down@2x.png" mode="aspectFit"></image>
            </view>
            <view class="arrow right" :class="{ active: isRightActive }">
                <image class="image" src="/static/images/btn_bucket_up@2x.png" mode="aspectFit"></image>
            </view>

            <!-- 摇杆圆点 -->
            <view class="dot" :class="{ ready: isReadyMode }" :style="dotStyle"></view>
        </view>

        <view class="up-down-arrow" v-if="!mode">
            <view class="arrow1 up" :class="{ active: isUpActive }">
                <image class="image" src="/static/images/btn_up_ex@2x.png" @touchend.prevent="handleClick('up')"
                    mode="aspectFit"></image>
            </view>
            <view class="arrow1 down" :class="{ active: isUpActive }">
                <image class="image" src="/static/images/btn_down_ex@2x.png" mode="aspectFit"
                    @touchend.prevent="handleClick('down')"></image>
            </view>
        </view>

        <view class="up-down-arrow flex" v-if="mode">
            <view class="arrow1 up" :class="{ active: isUpActive }">
                <image class="image" src="/static/images/btn_up_ex@2x.png" @touchend.prevent="handleClick('up')"
                    mode="aspectFit"></image>
            </view>
            <view class="arrow1 up" :class="{ active: isUpActive }">
                <image class="image" src="/static/images/btn_up_ex@2x.png" mode="aspectFit"
                    @touchend.prevent="handleClick('down')"></image>
            </view>
        </view>

    </view>
</template>

<script setup>
import { ref, computed } from "vue";
const emit = defineEmits(["action","action2"]);



const props = defineProps({
  mode: { type: Boolean, default: true },
});


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

// 仅保留圆点位置状态
const currentDotX = ref(0);
const currentDotY = ref(0);

// --- 内部非响应式状态 ---
let idleTimer = null;
let lastPointerX = 0;
let lastPointerY = 0;
let readyBaseX = 0;
let readyBaseY = 0;

// --- 计算属性 (仅绑定圆点样式) ---
const dotStyle = computed(() => ({
    transform: `translate3d(${currentDotX.value}px, ${currentDotY.value}px, 0) scale(1)`,
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
    emit("action", {
        up: false,
        down: false,
        left: false,
        right: false,
    });
};

// --- 事件处理 ---
const handleStart = (e) => {
    isDragging.value = true;
    isReadyMode.value = false;
    clearTimeout(idleTimer);
    resetArrows();

    const touch = e.touches[0];
    lastPointerX = touch.clientX;
    lastPointerY = touch.clientY;

    // 在按下时立刻记录基准点，防止移动时产生巨大偏移
    readyBaseX = lastPointerX;
    readyBaseY = lastPointerY;

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
}

</script>

<style lang="scss" scoped>
.control-box {
    /* 固定在屏幕右下角，不再需要 JS 控制位置 */
    position: fixed;
    right: 55px;
    bottom: 60px;
    width: 140px;
    height: 140px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    place-items: center;
    z-index: 100;
    user-select: none;
    touch-action: none;
}

.up-down-arrow {
    position: fixed;
    right: 230px;
    bottom: 78px;
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
.flex {
    display: flex;
    justify-content: space-between;
    width: 100px;
    bottom: 110px;
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
<template>
  <cover-view>
    <cover-view
      class="cover-slider"
      :style="{ width: width, height: height }"
      :class="{ 'cover-slider-disabled': disabled }"
      @touchstart.stop.prevent="onTouchStart"
      @touchmove.stop.prevent="onTouchMove"
      @touchend.stop.prevent="onTouchEnd"
    >
      <cover-view class="slider-track">
        <cover-view
          class="slider-progress"
          :style="{ width: progressWidth + '%' }"
        />
      </cover-view>

      <cover-view
        class="slider-thumb"
        :style="{ transform: `translateX(${thumbLeft}px)` }"
      />
    </cover-view>
  </cover-view>
</template>

<script setup>
import { ref, onMounted, watch, getCurrentInstance } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  disabled: { type: Boolean, default: false },
  width: { type: String, default: "100%" },
  height: { type: String, default: "40px" },
  disabledSlider: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "change"]);

const THUMB_SIZE = 15;
const thumbLeft = ref(0);
const progressWidth = ref(0);
const trackWidth = ref(0);
const instance = getCurrentInstance();

// --- 状态锁与内部绝对坐标 ---
const isDragging = ref(false); 
let startX = 0;
let startPercent = 0; // 记录按下瞬间的准确百分比
let localPercent = 0; // 纯内部维护的百分比，拖拽时与 props 彻底隔离

let emitTimer = null;
let pendingValue = null;

// ---------- 获取轨道宽度 ----------
const getTrackWidth = (retry = 0) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const query = uni.createSelectorQuery().in(instance.proxy);
      query
        .select(".slider-track")
        .boundingClientRect((res) => {
          if (res && res.width > 0) {
            trackWidth.value = res.width;
            resolve(res.width);
          } else if (retry < 5) {
            getTrackWidth(retry + 1).then(resolve);
          } else {
             resolve(0);
          }
        })
        .exec();
    }, 50);
  });

// ---------- 更新 UI (纯内部驱动) ----------
const updateSliderUI = (percent) => {
  if (trackWidth.value === 0) return;
  percent = Math.max(0, Math.min(1, percent));
  
  const maxLeft = trackWidth.value - THUMB_SIZE;
  // 直接更新响应式变量，驱动 cover-view 渲染
  thumbLeft.value = percent * maxLeft;
  progressWidth.value = percent * 100;
};

// ---------- 触摸事件 ----------
const onTouchStart = async (e) => {
  if (props.disabled) return;
  
  if (trackWidth.value === 0) {
    await getTrackWidth();
  }
  
  // 1. 上锁：拒绝父组件传入的值改变UI
  isDragging.value = true;
  
  // 2. 记录起点坐标（优先使用 clientX 防滚动干扰）
  startX = e.touches[0].clientX || e.touches[0].pageX;
  
  // 3. 锁定按下瞬间的进度基准
  startPercent = localPercent; 
};

const onTouchMove = (e) => {
  if (props.disabled || !props.disabledSlider || trackWidth.value === 0) return;
  
  const currentX = e.touches[0].clientX || e.touches[0].pageX;
  const diff = currentX - startX;
  const maxLeft = trackWidth.value - THUMB_SIZE;

  // 纯内部数学推算：起始比例 + 移动增量比例
  let p = startPercent + (diff / maxLeft);
  p = Math.max(0, Math.min(1, p));
  
  // 记录到内部变量并立即更新UI
  localPercent = p;
  updateSliderUI(p); 

  // 节流向父组件上报数据（哪怕外面卡顿，内部 UI 依然由 diff 控制，绝不乱跳）
  const newValue = props.min + p * (props.max - props.min);
  pendingValue = Math.round(newValue);

  if (!emitTimer) {
    emitTimer = setTimeout(() => {
      if (pendingValue !== null) {
        emit("update:modelValue", pendingValue);
      }
      emitTimer = null;
    }, 100); 
  }
};

const onTouchEnd = () => {
  if (props.disabled) return;
  
  if (emitTimer) {
    clearTimeout(emitTimer);
    emitTimer = null;
  }
  
  let finalValue = props.modelValue;
  if (pendingValue !== null) {
    finalValue = pendingValue;
    emit("update:modelValue", finalValue);
    pendingValue = null;
  }

  emit("change", finalValue);

  // 核心延迟解锁：给小程序双线程通信（你的 update 传到父组件，父组件再传回 props）留出足够的缓冲时间
  // 防止刚松手时，旧的 props 刚好传回来把滑块拽回去
  setTimeout(() => {
    isDragging.value = false;
  }, 300);
};

// ---------- 初始化与 Props 监听 ----------
onMounted(async () => {
  await getTrackWidth();
  localPercent = (props.modelValue - props.min) / (props.max - props.min);
  updateSliderUI(localPercent);
});

// 核心防御：只有在手指完全离开，且缓冲期结束（isDragging 为 false）后，才允许外部数据改变滑块位置
watch(() => props.modelValue, (newVal) => {
  if (!isDragging.value) {
    localPercent = (newVal - props.min) / (props.max - props.min);
    updateSliderUI(localPercent);
  }
});

watch(() => props.width, async () => {
  await getTrackWidth();
  updateSliderUI(localPercent);
});
</script>

<style scoped>
.cover-slider {
  height: 40px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
}

.cover-slider-disabled {
  opacity: 0.5;
}

.slider-track {
  width: 100%;
  height: 4px;
  background-color: #e5e5e5;
  position: relative;
  border-radius: 2px;
}

.slider-progress {
  height: 100%;
  background-color: #ffc838;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 2px;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  left: 10px;
  width: 15px;
  height: 15px;
  border: 2px solid #ffffff;
  background-color: #ffffff;
  border-radius: 50%;
  margin-top: -10px;
  z-index: 9999;
  /* 原生组件强制取消过渡动画，否则会被小程序的底层渲染拖慢导致视觉乱跳 */
  transition: none !important;
}
</style>
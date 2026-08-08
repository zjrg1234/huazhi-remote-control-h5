<template>
  <cover-view>
    <cover-view
      class="cover-slider"
      :style="{ width: width }"
      :class="{ 'cover-slider-disabled': disabled }"
      @touchstart.stop="onTouchStart"
      @touchmove.stop="onTouchMove"
      @touchend.stop="onTouchEnd"
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
import { ref, onMounted, watch, nextTick, getCurrentInstance } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  disabled: { type: Boolean, default: false },
  width: { type: String, default: "100%" },
});

const emit = defineEmits(["update:modelValue", "change"]);

const THUMB_SIZE = 20;
const thumbLeft = ref(0);
const progressWidth = ref(0);
const trackWidth = ref(0);
const startX = ref(0);
const startValue = ref(0);
const instance = getCurrentInstance();

// ---------- 节流控制 ----------
let emitTimer = null;
let pendingValue = null;

// ---------- 获取轨道宽度（增强版） ----------
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
          } else if (retry < 3) {
            getTrackWidth(retry + 1).then(resolve);
          } else {
            // 降级估算，保证可用
            // const parentWidth = instance.proxy.$el?.offsetWidth || 300;
            // trackWidth.value = parentWidth - 20; // 减去 padding
            // resolve(trackWidth.value);
             resolve(0);
          }
        })
        .exec();
    }, 50);
  });

// ---------- 更新 UI（逻辑完全不变） ----------
const updateSliderUI = () => {
  if (trackWidth.value === 0) {
    getTrackWidth().then(() => updateSliderUI());
    return;
  }
  const percent = Math.max(
    0,
    Math.min(1, (props.modelValue - props.min) / (props.max - props.min))
  );
  const maxLeft = trackWidth.value - THUMB_SIZE;
  thumbLeft.value = percent * maxLeft;
  progressWidth.value = (thumbLeft.value / trackWidth.value) * 100;
};

// ---------- 触摸事件 ----------
const onTouchStart = (e) => {
  if (props.disabled) return;
  if (trackWidth.value === 0) {
    getTrackWidth().then(() => {
      if (trackWidth.value > 0) {
        startX.value = e.touches[0].pageX || e.touches[0].clientX;
        startValue.value = props.modelValue;
      }
    });
    return;
  }
  startX.value = e.touches[0].pageX || e.touches[0].clientX;
  startValue.value = props.modelValue;
};

const onTouchMove = (e) => {
  if (props.disabled || trackWidth.value === 0) return;
  const currentX = e.touches[0].pageX || e.touches[0].clientX;
  const diff = currentX - startX.value;
  const maxLeft = trackWidth.value - THUMB_SIZE;

  // 计算新比例（与原来完全一致）
  const percent = Math.max(
    0,
    Math.min(
      1,
      (startValue.value - props.min) / (props.max - props.min) + diff / maxLeft
    )
  );
  const newValue = props.min + percent * (props.max - props.min);
  const rounded = Math.round(newValue);

  // 立即更新 UI（无延迟，无过渡）
  thumbLeft.value = percent * maxLeft;
  progressWidth.value = (thumbLeft.value / trackWidth.value) * 100;

  // 节流 emit（减少父组件更新频率）
  pendingValue = rounded;
  if (!emitTimer) {
    emitTimer = setTimeout(() => {
      if (pendingValue !== null) {
        emit("update:modelValue", pendingValue);
        pendingValue = null;
      }
      emitTimer = null;
    }, 30); // 30ms 约 33fps，平衡流畅与性能
  }
};

const onTouchEnd = () => {
  if (props.disabled) return;
  // 清除定时器，立即发出最终值
  if (emitTimer) {
    clearTimeout(emitTimer);
    emitTimer = null;
    if (pendingValue !== null) {
      emit("update:modelValue", pendingValue);
      pendingValue = null;
    }
  }
  emit("change", props.modelValue);
};

// ---------- 生命周期 ----------
onMounted(() => {
  // 延迟确保 DOM 渲染完成
  setTimeout(initSlider, 100);
});

const initSlider = async () => {
  await getTrackWidth();
  updateSliderUI();
};

watch(() => props.modelValue, updateSliderUI);
watch(() => props.width, () => setTimeout(initSlider, 100));
</script>

<style scoped>
.cover-slider {
  height: 40px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
  touch-action: none;
  user-select: none;
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
  left: 10px; /* 与父容器padding-left对齐 —— 保持不变 */
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  background-color: #ffffff;
  border-radius: 50%;
  margin-top: -12px;
  /* 关键优化：移除过渡动画，避免拖拽延迟 */
  /* transition: transform 0.1s ease; */
  /* 关键优化：启用硬件加速 */
  will-change: transform;
  z-index: 199999;
  touch-action: none;
  pointer-events: none; /* 避免图片干扰触摸，由父容器统一处理 */
  /* 关键：确保无过渡动画 */
  transition: none !important;
}
</style>
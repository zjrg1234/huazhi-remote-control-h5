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

      <cover-image
        class="slider-thumb"
        src="../static/icon_sider@2x.png"
        mode="aspectFit"
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
const instance = getCurrentInstance(); // 获取组件实例

// 获取轨道宽度
const getTrackWidth = () => {
  return new Promise((resolve) => {
    nextTick(() => {
      const query = uni.createSelectorQuery().in(instance.proxy);
      query
        .select(".slider-track")
        .boundingClientRect((res) => {
          if (res && res.width > 0) {
            trackWidth.value = res.width;
            resolve(res.width);
          } else {
            resolve(0);
          }
        })
        .exec();
    });
  });
};

// 初始化滑块UI
const initSlider = async () => {
  await getTrackWidth();
  updateSliderUI();
};

// 更新滑块位置和进度条
const updateSliderUI = () => {
  if (trackWidth.value === 0) {
    // 如果宽度为0，尝试重新获取（但不阻塞）
    getTrackWidth().then(() => {
      if (trackWidth.value > 0) updateSliderUI();
    });
    return;
  }
  const percent = Math.max(
    0,
    Math.min(1, (props.modelValue - props.min) / (props.max - props.min))
  );
  const maxLeft = trackWidth.value - THUMB_SIZE;
  thumbLeft.value = percent * maxLeft;
  // 进度条宽度 = thumbLeft（因为thumbLeft即进度条应占宽度）
  progressWidth.value = (thumbLeft.value / trackWidth.value) * 100;
};

const onTouchStart = (e) => {
  if (props.disabled) return;
  // 如果轨道宽度尚未获取，先获取再继续
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
  // 计算新比例
  const percent = Math.max(
    0,
    Math.min(
      1,
      (startValue.value - props.min) / (props.max - props.min) +
        diff / maxLeft
    )
  );
  const newValue = props.min + percent * (props.max - props.min);
  emit("update:modelValue", Math.round(newValue));
  // 直接更新UI，提高响应性
  thumbLeft.value = percent * maxLeft;
  progressWidth.value = (thumbLeft.value / trackWidth.value) * 100;
};

const onTouchEnd = () => {
  if (props.disabled) return;
  emit("change", props.modelValue);
};

onMounted(() => {
  initSlider();
});

// 监听外部值变化
watch(
  () => props.modelValue,
  () => {
    updateSliderUI();
  }
);

// 监听宽度变化
watch(
  () => props.width,
  () => {
    nextTick(() => {
      initSlider();
    });
  }
);
</script>

<style scoped>
.cover-slider {
  height: 40px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
  /* 增加触摸区域 */
  touch-action: none;
}

.cover-slider-disabled {
  opacity: 0.5;
}

.slider-track {
  width: 100%;
  height: 4px;
  background-color: #e5e5e5;
  position: relative;
}

.slider-progress {
  height: 100%;
  background-color: #ffc838;
  position: absolute;
  left: 0;
  top: 0;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  left: 10px; /* 与父容器padding-left对齐 */
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  background-color: #ffffff;
  border-radius: 50%;
  margin-top: -12px;
  transition: transform 0.1s ease;
  z-index: 199999;
  touch-action: none;
}
</style>
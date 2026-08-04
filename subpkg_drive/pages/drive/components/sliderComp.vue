<template>
  <cover-view>
    <cover-view
      class="cover-slider"
      :style="{ width: width }"
      :class="{ 'cover-slider-disabled': disabled }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
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
import { ref, onMounted, watch, nextTick } from "vue";

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

const initSlider = () => {
  nextTick(() => {
    const query = uni.createSelectorQuery();
    query
      .select(".slider-track")
      .boundingClientRect((res) => {
        if (res && res.width > 0) {
          trackWidth.value = res.width;
          updateSliderUI();
        }
      })
      .exec();
  });
};

const updateSliderUI = () => {
  if (trackWidth.value === 0) return;
  const percent = (props.modelValue - props.min) / (props.max - props.min);
  // 修复1：进度条最大宽度 = 轨道宽度 - 滑块宽度，避免进度条顶满
  const maxTrackValidWidth = trackWidth.value - THUMB_SIZE;
  // 进度百分比基于有效轨道长度计算
  progressWidth.value = (maxTrackValidWidth / trackWidth.value) * percent * 100;
  console.log(progressWidth.value)
  const maxLeft = trackWidth.value - THUMB_SIZE;
  thumbLeft.value = percent * maxLeft;
};

const onTouchStart = (e) => {
  if (props.disabled) return;
  startX.value = e.touches[0].clientX;
  startValue.value = props.modelValue;
};

const onTouchMove = (e) => {
  if (props.disabled) return;
  const currentX = e.touches[0].clientX;
  const diff = currentX - startX.value;
  const maxLeft = trackWidth.value - THUMB_SIZE;
  const percent = Math.max(
    0,
    Math.min(
      1,
      (startValue.value -
        props.min +
        (diff / maxLeft) * (props.max - props.min)) /
        (props.max - props.min),
    ),
  );
  const newValue = props.min + percent * (props.max - props.min);
  emit("update:modelValue", Math.round(newValue));
  updateSliderUI();
};

const onTouchEnd = () => {
  if (props.disabled) return;
  emit("change", props.modelValue);
};

onMounted(() => {
  initSlider();
});

watch(
  () => props.modelValue,
  () => {
    updateSliderUI();
  },
);

watch(
  () => props.width,
  () => {
    nextTick(() => {
      initSlider();
    });
  },
);
</script>

<style scoped>
.cover-slider {
  height: 40px;
  position: relative;
  display: flex;
  align-items: center;
  /* 修复2：给滑块预留左右边距，防止滑块被容器裁切 */
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
  left: 10px; /* 对应父容器padding-left */
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  background-color: #ffffff;
  border-radius: 50%;
  margin-top: -12px;
  transition: transform 0.1s ease;
  /* 修复3：提升层级，避免被进度条遮挡 */
  z-index: 2;
}
</style>

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
const instance = getCurrentInstance();

// 获取轨道宽度，增加延迟和重试
const getTrackWidth = (retry = 0) => {
  return new Promise((resolve) => {
    // 等待一帧确保渲染
    setTimeout(() => {
      const query = uni.createSelectorQuery().in(instance.proxy);
      query
        .select(".slider-track")
        .boundingClientRect((res) => {
          console.log("[Slider] track rect:", res);
          if (res && res.width > 0) {
            trackWidth.value = res.width;
            resolve(res.width);
          } else if (retry < 3) {
            // 重试最多3次
            getTrackWidth(retry + 1).then(resolve);
          } else {
            console.warn("[Slider] 无法获取轨道宽度，使用默认值");
            // 降级：尝试通过父容器宽度估算
            const parentWidth = (instance.proxy.$el || {}).offsetWidth || 300;
            trackWidth.value = parentWidth - 20; // 减去padding
            resolve(trackWidth.value);
          }
        })
        .exec();
    }, 50);
  });
};

// 更新滑块UI
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

const onTouchStart = (e) => {
  if (props.disabled) return;
  console.log("[Slider] touchstart", e.touches[0]);
  // 若宽度未获取，先获取
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
  // 立即更新UI
  thumbLeft.value = percent * maxLeft;
  progressWidth.value = (thumbLeft.value / trackWidth.value) * 100;
};

const onTouchEnd = () => {
  if (props.disabled) return;
  emit("change", props.modelValue);
};

onMounted(() => {
  // 延迟初始化，确保DOM完成
  setTimeout(() => {
    initSlider();
  }, 100);
});

const initSlider = async () => {
  await getTrackWidth();
  updateSliderUI();
};

watch(
  () => props.modelValue,
  () => updateSliderUI()
);

watch(
  () => props.width,
  () => {
    setTimeout(() => initSlider(), 100);
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
  left: 10px;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  background-color: #ffffff;
  border-radius: 50%;
  margin-top: -12px;
  transition: transform 0.1s ease;
  z-index: 199999;
  touch-action: none;
  pointer-events: none; /* 避免图片干扰触摸，由父容器统一处理 */
}
</style>
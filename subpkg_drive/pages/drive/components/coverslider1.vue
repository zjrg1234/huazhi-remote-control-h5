<template>
  <cover-view
    class="cover-slider"
    :style="{ width: width }"
    :class="{ 'cover-slider-disabled': disabled }"
    @touchstart.stop="onTouchStart"
    @touchmove.stop="onTouchMove"
    @touchend.stop="onTouchEnd"
  >
    <cover-view class="slider-track" id="slider-track">
      <cover-view
        class="slider-progress"
        ref="progressRef"
        :style="{ width: '0%' }"
      />
    </cover-view>

    <cover-view
      class="slider-thumb"
      ref="thumbRef"
      :style="{ transform: 'translateX(0px)' }"
    />
  </cover-view>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, getCurrentInstance } from 'vue';

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  disabled: { type: Boolean, default: false },
  width: { type: String, default: '100%' },
});

const emit = defineEmits(['update:modelValue', 'change']);

const THUMB_SIZE = 20;  // 滑块宽度（含阴影），需与 CSS 中实际尺寸匹配
const thumbRef = ref(null);
const progressRef = ref(null);
const trackWidth = ref(0);
const instance = getCurrentInstance();

// 原生 DOM 引用（绕开响应式）
let thumbDom = null;
let progressDom = null;

// ---------- 获取轨道实际宽度 ----------
const getTrackWidth = () => {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery().in(instance.proxy);
    query
      .select('#slider-track')
      .boundingClientRect((res) => {
        if (res && res.width > 0) {
          trackWidth.value = res.width;
          resolve(res.width);
        } else {
          // 降级：使用组件宽度 - 左右 padding
          const wrapper = instance.proxy.$el;
          if (wrapper) {
            const wrapperWidth = wrapper.offsetWidth || 300;
            trackWidth.value = wrapperWidth - 20;
          } else {
            trackWidth.value = 300;
          }
          resolve(trackWidth.value);
        }
      })
      .exec();
  });
};

// ---------- 计算滑块位置和进度（用于初始化/外部值变化） ----------
const calcLayout = (value) => {
  const percent = Math.max(0, Math.min(1, (value - props.min) / (props.max - props.min)));
  const maxLeft = trackWidth.value - THUMB_SIZE;
  return {
    thumbLeft: percent * maxLeft,
    progressPercent: (percent * maxLeft) / trackWidth.value * 100,
  };
};

// ---------- 直接操作 DOM 更新视图（避开 Vue 响应式） ----------
const updateDomDirectly = (thumbLeft, progressPercent) => {
  if (thumbDom) {
    thumbDom.style.transform = `translateX(${thumbLeft}px)`;
  }
  if (progressDom) {
    progressDom.style.width = progressPercent + '%';
  }
};

// ---------- 同步当前值到 UI ----------
const syncUI = (value) => {
  if (trackWidth.value === 0) return;
  const layout = calcLayout(value);
  updateDomDirectly(layout.thumbLeft, layout.progressPercent);
};

// ---------- 节流 emit ----------
let emitTimer = null;
let pendingValue = null;
const throttledEmit = (value) => {
  pendingValue = value;
  if (!emitTimer) {
    emitTimer = setTimeout(() => {
      if (pendingValue !== null) {
        emit('update:modelValue', pendingValue);
        pendingValue = null;
      }
      emitTimer = null;
    }, 16); // 约 60fps 同步一次业务值，完全够用
  }
};

// ---------- 触摸事件（完全原生性能） ----------
let startThumbLeft = 0;  // 触摸开始时滑块位置
let startTouchX = 0;

const onTouchStart = (e) => {
  if (props.disabled || trackWidth.value === 0) return;
  const touch = e.touches[0];
  startTouchX = touch.pageX || touch.clientX;
  // 从 DOM 读取当前滑块位置（而非响应式变量）
  if (thumbDom) {
    const transform = thumbDom.style.transform || 'translateX(0px)';
    const match = transform.match(/translateX\(([-\d.]+)px\)/);
    startThumbLeft = match ? parseFloat(match[1]) : 0;
  }
};

const onTouchMove = (e) => {
  if (props.disabled || trackWidth.value === 0) return;
  const touch = e.touches[0];
  const currentX = touch.pageX || touch.clientX;
  const diff = currentX - startTouchX;
  let newLeft = startThumbLeft + diff;
  const maxLeft = trackWidth.value - THUMB_SIZE;
  newLeft = Math.max(0, Math.min(maxLeft, newLeft));

  // 直接更新 DOM，无任何 Vue 开销
  const progressPercent = (newLeft / trackWidth.value) * 100;
  updateDomDirectly(newLeft, progressPercent);

  // 转换为业务值并节流发出
  const percent = newLeft / maxLeft;
  const newValue = props.min + percent * (props.max - props.min);
  throttledEmit(Math.round(newValue));
};

const onTouchEnd = () => {
  if (props.disabled) return;
  // 确保最终值被发出
  if (emitTimer) {
    clearTimeout(emitTimer);
    emitTimer = null;
    if (pendingValue !== null) {
      emit('update:modelValue', pendingValue);
      pendingValue = null;
    }
  }
  // 读取最终 DOM 位置计算准确值
  let finalValue = props.modelValue;
  if (thumbDom) {
    const transform = thumbDom.style.transform || 'translateX(0px)';
    const match = transform.match(/translateX\(([-\d.]+)px\)/);
    const left = match ? parseFloat(match[1]) : 0;
    const maxLeft = trackWidth.value - THUMB_SIZE;
    const percent = left / maxLeft;
    finalValue = props.min + percent * (props.max - props.min);
    finalValue = Math.round(finalValue);
  }
  emit('change', finalValue);
};

// ---------- 初始化 ----------
onMounted(async () => {
  await getTrackWidth();
  // 获取 DOM 引用
  // 注意：小程序中 ref 获取组件实例，需要拿其 $el
  if (thumbRef.value) {
    thumbDom = thumbRef.value.$el || thumbRef.value;
  }
  if (progressRef.value) {
    progressDom = progressRef.value.$el || progressRef.value;
  }
  // 根据外部 modelValue 初始化位置
  syncUI(props.modelValue);
});

// 当外部值变化时同步 UI（例如点击按钮改变值）
watch(() => props.modelValue, (val) => {
  syncUI(val);
});

// 当宽度变化时重新计算
watch(() => props.width, async () => {
  await nextTick();
  await getTrackWidth();
  syncUI(props.modelValue);
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
  will-change: width;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  left: 10px; /* 与父 padding-left 对齐 */
  width: 15px;
  height: 15px;
  border: 2px solid #ffffff;
  background-color: #ffffff;
  border-radius: 50%;
  margin-top: -10px;
  z-index: 199999;
  touch-action: none;
  pointer-events: none;
  will-change: transform;
  transition: none !important;
}
</style>
<template>
  <cover-view
    ref="sliderRef"  
    class="cover-slider"
    :style="{ width: width }"
    :class="{ 'cover-slider-disabled': disabled }"
    :data-min="min"
    :data-max="max"
    :data-value="modelValue"
    :data-disabled="disabled"
    :data-thumb-size="THUMB_SIZE"
    :data-track-width="trackWidth"  
    @touchstart="sliderWxs.handleTouchStart"
    @touchmove="sliderWxs.handleTouchMove"
    @touchend="sliderWxs.handleTouchEnd"
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
</template>

<script module="sliderWxs" lang="wxs">
// 模块级变量，缓存轨道宽度
var cachedTrackWidth = 0;

// 供逻辑层调用的设置宽度方法
function setTrackWidth(width) {
  cachedTrackWidth = width;
}

function getTouchPosition(e) {
  var touch = e.touches[0];
  return touch.pageX || touch.clientX;
}

// 日志辅助（输出到逻辑层控制台）
function log(ownerInstance, msg) {
  ownerInstance.callMethod('logWarn', '[WXS] ' + msg);
}

function handleTouchStart(e, ownerInstance) {
  log(ownerInstance, 'touchstart 触发');
  var dataset = e.currentTarget.dataset;
  log(ownerInstance, 'dataset: ' + JSON.stringify(dataset));

  if (dataset.disabled) {
    log(ownerInstance, 'disabled 为 true，忽略触摸');
    return;
  }

  // 优先使用缓存，若为0则从 dataset 读取（可能滞后），最后备用 300
  var trackWidth = cachedTrackWidth || dataset.trackWidth || 300;
  if (!cachedTrackWidth) {
    log(ownerInstance, 'cachedTrackWidth 为0，使用 dataset.trackWidth=' + dataset.trackWidth + ' 或备用300');
  }

  var min = dataset.min || 0;
  var max = dataset.max || 100;
  var value = dataset.value || 0;
  var thumbSize = dataset.thumbSize || 20;

  ownerInstance.setData({
    _startX: getTouchPosition(e),
    _startValue: value,
    _trackWidth: trackWidth,
    _min: min,
    _max: max,
    _thumbSize: thumbSize,
    _lastCall: 0,
    _lastValue: value
  });

  log(ownerInstance, '设置完成，trackWidth=' + trackWidth + ', startValue=' + value);
  ownerInstance.callMethod('startTouch');
}

function handleTouchMove(e, ownerInstance) {
  var dataset = e.currentTarget.dataset;
  if (dataset.disabled) return;

  var data = ownerInstance.getData();
  var startX = data._startX;
  var startValue = data._startValue;
  var trackWidth = data._trackWidth;
  var min = data._min;
  var max = data._max;
  var thumbSize = data._thumbSize;

  if (!trackWidth || startX === undefined) {
    log(ownerInstance, '移动中 trackWidth 或 startX 无效，跳过');
    return;
  }

  var currentX = getTouchPosition(e);
  var diff = currentX - startX;
  var maxLeft = trackWidth - thumbSize;
  if (maxLeft <= 0) {
    log(ownerInstance, 'maxLeft <= 0，跳过');
    return;
  }

  var percent = (startValue - min) / (max - min) + diff / maxLeft;
  percent = Math.max(0, Math.min(1, percent));
  var newValue = min + percent * (max - min);
  var rounded = Math.round(newValue);

  var thumbLeft = percent * maxLeft;
  var progressWidth = (thumbLeft / trackWidth) * 100;

  // 更新 UI
  var thumb = ownerInstance.selectComponent('.slider-thumb');
  if (thumb) {
    thumb.setStyle({ transform: 'translateX(' + thumbLeft + 'px)' });
  } else {
    log(ownerInstance, '⚠️ 未找到 .slider-thumb');
  }

  var progress = ownerInstance.selectComponent('.slider-progress');
  if (progress) {
    progress.setStyle({ width: progressWidth + '%' });
  } else {
    log(ownerInstance, '⚠️ 未找到 .slider-progress');
  }

  ownerInstance.setData({ _lastValue: rounded });

  var now = Date.now();
  var lastCall = data._lastCall || 0;
  if (now - lastCall >= 30) {
    log(ownerInstance, '节流更新值: ' + rounded);
    ownerInstance.callMethod('updateValue', rounded);
    ownerInstance.setData({ _lastCall: now });
  }
}

function handleTouchEnd(e, ownerInstance) {
  log(ownerInstance, 'touchend 触发');
  var data = ownerInstance.getData();
  var finalValue = data._lastValue;
  if (finalValue !== undefined) {
    log(ownerInstance, '最终值: ' + finalValue);
    ownerInstance.callMethod('updateValue', finalValue);
    ownerInstance.callMethod('change', finalValue);
  }

  ownerInstance.setData({
    _startX: undefined,
    _startValue: undefined,
    _trackWidth: undefined,
    _min: undefined,
    _max: undefined,
    _thumbSize: undefined,
    _lastCall: undefined,
    _lastValue: undefined
  });

  ownerInstance.callMethod('endTouch');
}

module.exports = {
  setTrackWidth: setTrackWidth,
  handleTouchStart: handleTouchStart,
  handleTouchMove: handleTouchMove,
  handleTouchEnd: handleTouchEnd
};
</script>

<script setup>
import { ref, onMounted, watch, getCurrentInstance } from 'vue';

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  disabled: { type: Boolean, default: false },
  width: { type: String, default: '100%' },
});

const emit = defineEmits(['update:modelValue', 'change']);

const THUMB_SIZE = 20;
const thumbLeft = ref(0);
const progressWidth = ref(0);
const trackWidth = ref(0);
const isTouching = ref(false);
const instance = getCurrentInstance();

// ---------- 日志（供 WXS 调用） ----------
const logWarn = (msg) => {
  console.warn(msg);
};

// ---------- 获取轨道宽度 ----------
const getTrackWidth = (retry = 0) =>
  new Promise((resolve) => {
    console.log(`[Slider] 获取宽度第 ${retry+1} 次尝试`);
    setTimeout(() => {
      const query = uni.createSelectorQuery().in(instance.proxy);
      query
        .select('.slider-track')
        .boundingClientRect((res) => {
          console.log('[Slider] boundingClientRect 结果:', res);
          if (res && res.width > 0) {
            trackWidth.value = res.width;
            // 关键：调用 WXS 的 setTrackWidth 方法
            if (instance.proxy && instance.proxy.callMethod) {
              instance.proxy.callMethod('setTrackWidth', res.width);
              console.log(`[Slider] 已通过 callMethod 传递宽度: ${res.width}px`);
            } else {
              console.warn('[Slider] callMethod 不可用，WXS 宽度可能未更新');
            }
            resolve(res.width);
          } else if (retry < 3) {
            getTrackWidth(retry + 1).then(resolve);
          } else {
            const fallback = 300;
            trackWidth.value = fallback;
            if (instance.proxy && instance.proxy.callMethod) {
              instance.proxy.callMethod('setTrackWidth', fallback);
              console.log(`[Slider] 使用备用宽度并传递: ${fallback}px`);
            }
            resolve(fallback);
          }
        })
        .exec();
    }, 500);
  });

// ---------- UI 更新（非触摸） ----------
const updateSliderUI = () => {
  if (isTouching.value) {
    console.log('[Slider] 触摸中，跳过 UI 更新');
    return;
  }
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
  console.log(`[Slider] UI 更新: thumbLeft=${thumbLeft.value}, progress=${progressWidth.value}%`);
};

// ---------- 逻辑层方法（供 WXS 调用） ----------
const startTouch = () => {
  isTouching.value = true;
  console.log('[Slider] startTouch');
};
const endTouch = () => {
  isTouching.value = false;
  console.log('[Slider] endTouch');
};
const updateValue = (val) => {
  console.log(`[Slider] updateValue: ${val}`);
  emit('update:modelValue', val);
};
const change = (val) => {
  console.log(`[Slider] change: ${val}`);
  emit('change', val);
};

defineExpose({
  startTouch,
  endTouch,
  updateValue,
  change,
  logWarn,
});

// ---------- 生命周期 ----------
onMounted(() => {
  console.log('[Slider] 组件挂载');
  setTimeout(initSlider, 200); // 增加延迟确保渲染
});

const initSlider = async () => {
  await getTrackWidth();
  updateSliderUI();
};

watch(
  () => props.modelValue,
  () => {
    if (!isTouching.value) updateSliderUI();
  }
);

watch(
  () => props.width,
  () => setTimeout(initSlider, 200)
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
  border: 2px solid red;
  background-color: #ffffff;
  border-radius: 50%;
  margin-top: -10px;
  will-change: transform;
  z-index: 199999;
  touch-action: none;
  pointer-events: none;
  transition: none !important;
}
</style>
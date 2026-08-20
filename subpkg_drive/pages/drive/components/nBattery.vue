<template>
  <cover-view class="cover-bat-cont">
    <cover-view class="battery">
      <cover-view class="slider-track">
        <cover-view
          class="battery-fill"
          :class="statusClass"
          :style="{ width: progressWidth + '%' }"
        />
      </cover-view>
      <cover-view class="battery-tip"></cover-view>
    </cover-view>

    <cover-view class="battery-text">{{ modelValue }}%</cover-view>
  </cover-view>
</template>

<script setup>
import { ref, onMounted, watch, computed, getCurrentInstance } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
});

const emit = defineEmits(["update:modelValue", "change"]);

const progressWidth = ref(0);
const trackWidth = ref(0);

const instance = getCurrentInstance();

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
  progressWidth.value = props.modelValue;
};

// 根据电量返回对应样式类
const statusClass = computed(() => {
  if (props.modelValue <= 20) return "low";
  if (props.modelValue <= 60) return "medium";
  return "";
});

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
watch(
  () => props.width,
  () => setTimeout(initSlider, 100),
);
</script>

<style lang="scss" scoped>
.cover-bat-cont {
  width: 60px;
  height: 12px;
  position: relative;
  display: flex;
  align-items: center;

  box-sizing: border-box;
  touch-action: none;
  user-select: none;

  .battery {
    width: 25px;
    position: relative;
  }

  .slider-track {
    position: relative;
    width: 23px;
    height: 12px;
    border-radius: 2px;
    border: 1px solid #fff;
    box-sizing: border-box; /* 改为 border-box 更稳定 */
    overflow: hidden; /* 确保内部绿色条不会溢出边框 */
    background-color: transparent; 
  }

   .battery-tip {
    position: absolute;
    right: 0;
    top: 3px;
    width: 2px;
    height: 6px;
    background-color: #ffffff;
    border-radius: 0 2px 2px 0;
  }

 

  .battery-fill {
    height: 100%;
    height: 12px;
    border-radius: 1px; /* 加上圆角，防止真机上直角溢出 */
    background-color: #4caf50;
    background: #4caf50;
    // transition:
    //   width 0.4s ease,
    //   background-color 0.4s ease;
    // border: 1px solid #fff;
    // border-right: none;
  }

  .battery-fill.medium {
    background-color: #ff9800;
    background: #ff9800;
  }

  .battery-fill.low {
    background-color: #f44336;
    background: #f44336;
  }

 

  .battery-text {
    position: absolute;
    right: 0;
    font-size: 10px;
    min-width: 25px;
    color: #ffffff;
    padding-left: 3px;
  }
}
</style>

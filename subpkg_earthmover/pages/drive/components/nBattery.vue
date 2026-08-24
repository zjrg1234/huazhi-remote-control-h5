<template>
  <cover-view class="cover-bat-cont">
    <!-- 电池主体 -->
    <cover-view class="battery">
      <!-- 顶部正极触点 -->
      <cover-view class="battery-tip"></cover-view>
      
      <!-- 轨道 -->
      <cover-view class="slider-track">
        <!-- 
          竖向关键：用 height 控制电量，bottom:0 保证从下往上填充 
          width 保持 100% 撑满轨道
        -->
        <cover-view
          class="battery-fill"
          :class="statusClass"
          :style="{ height: progressWidth + '%' }"
        />
      </cover-view>
    </cover-view>

    <!-- 电量文字放在电池下方或右侧，这里放在下方 -->
    <cover-view class="battery-text">{{ modelValue }}%</cover-view>
  </cover-view>
</template>

<script setup>
import { ref, onMounted, watch, computed, getCurrentInstance } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
});

const emit = defineEmits(["update:modelValue", "change"]);

// 变量名保留 progressWidth 以减少逻辑改动，实际现在代表 height 百分比
const progressWidth = ref(0);
const trackHeight = ref(0); // 原 trackWidth 改为 trackHeight

const instance = getCurrentInstance();

// ---------- 获取轨道高度（竖向版） ----------
const getTrackHeight = (retry = 0) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const query = uni.createSelectorQuery().in(instance.proxy);
      query
        .select(".slider-track")
        .boundingClientRect((res) => {
          if (res && res.height > 0) {
            trackHeight.value = res.height;
            resolve(res.height);
          } else if (retry < 3) {
            getTrackHeight(retry + 1).then(resolve);
          } else {
            resolve(0);
          }
        })
        .exec();
    }, 50);
  });

// ---------- 更新 UI ----------
const updateSliderUI = () => {
  if (trackHeight.value === 0) {
    getTrackHeight().then(() => updateSliderUI());
    return;
  }
  // 直接映射百分比，无需像素计算
  progressWidth.value = Math.min(100, Math.max(0, props.modelValue));
};

const statusClass = computed(() => {
  if (props.modelValue <= 20) return "low";
  if (props.modelValue <= 60) return "medium";
  return "";
});

// ---------- 生命周期 ----------
onMounted(() => {
  setTimeout(initSlider, 100);
});

const initSlider = async () => {
  await getTrackHeight();
  updateSliderUI();
};

watch(() => props.modelValue, updateSliderUI);
</script>

<style lang="scss" scoped>
.cover-bat-cont {
  /* 容器改为竖向排列 */
  width: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  
  /* 宽度自适应内容，不再固定 */
  width: auto; 
  
  box-sizing: border-box;
  touch-action: none;
  user-select: none;

  .battery {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* 正极触点移到顶部 */
  .battery-tip {
    width: 6px;
    height: 2px;
    background-color: #ffffff;
    border-radius: 2px 2px 0 0;
    margin-bottom: -1px; /* 与轨道无缝衔接 */
    z-index: 1;
  }

  .slider-track {
    /* 竖向轨道尺寸 */
    width: 10px;
    height: 18px;
    
    border-radius: 2px;
    border: 1px solid #fff;
    box-sizing: border-box;
    overflow: hidden;
    background-color: transparent;
    position: relative;
  }

  .battery-fill {
    /* ★ 竖向填充核心样式 ★ */
    width: 100%;
    position: absolute;
    bottom: 0;       /* 从底部开始填充 */
    left: 0;
    border-radius: 1px;
    background-color: #4caf50;
    background: #4caf50;
    border: 1px solid #4caf50;
    /* 注意：height 由 inline style 动态控制 */
  }

  .battery-fill.medium {
    background-color: #ff9800;
    background: #ff9800;
    border: 1px solid #ff9800;
  }

  .battery-fill.low {
    background-color: #f44336;
    background: #f44336;
    border: 1px solid #f44336;
  }

  .battery-text {
    font-size: 10px;
    color: #ffffff;
    margin-left: 4px;
    white-space: nowrap;
    text-align: center;
  }
}
</style>
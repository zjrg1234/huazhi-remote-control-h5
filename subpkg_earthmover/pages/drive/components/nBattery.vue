<template>
  <cover-view class="vertical-battery">
    <cover-view class="battery-body">
      <!-- 凸起（独立元素，非绝对定位） -->
      <cover-view class="battery-tip" />
      <!-- 轨道 -->
      <cover-view class="battery-track">
        <cover-view
          class="battery-fill"
          :class="statusClass"
          :style="{ height: batteryHeight + '%' }"
        />
      </cover-view>
    </cover-view>
    <cover-view class="battery-text">{{ displayValue }}%</cover-view>
  </cover-view>
</template>


<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    default: 30,
    validator: (v) => v >= 0 && v <= 100,
  },
});

const emit = defineEmits(["update:modelValue"]);

// 直接基于 props 计算高度（无需 ref/watch）
const batteryHeight = computed(() => {
  return Math.min(100, Math.max(0, props.modelValue));
});

const statusClass = computed(() => {
  const val = props.modelValue;
  if (val <= 20) return "low";
  if (val <= 60) return "medium";
  return "";
});

const displayValue = computed(() => Math.round(props.modelValue));

defineExpose({ batteryHeight, statusClass });
</script>

<style lang="scss" scoped>
.vertical-battery {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  --bat-width: 14px;
  --bat-height: 24px;
}

.battery-body {
  display: flex;
  flex-direction: column;
  align-items: center;    /* 水平居中凸起 */
  width: var(--bat-width);
  height: var(--bat-height);
  flex-shrink: 0;
  overflow: visible;      /* 确保凸起溢出不被裁剪 */
}

/* ---------- 凸起（不再用绝对定位） ---------- */
.battery-tip {
  width: 6px;
  height: 2px;
  background: #fff;
  border-radius: 2px 2px 0 0;
  margin-bottom: -1px;    /* 与轨道顶部重叠，消除缝隙 */
  flex-shrink: 0;
  z-index: 2;             /* 保持在轨道之上 */
}

.battery-track {
  width: 100%;
  height: calc(100% - 2px);  /* 留出凸起占用的高度，避免撑大整体 */
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 3px;
  overflow: hidden;
  background: transparent;
  box-sizing: border-box;
  position: relative;
}

/* ---------- 填充条（从底部向上） ---------- */
.battery-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0%;
  border-radius: 0 0 3px 3px;  /* 底部圆角，顶部直角 */
  background-color: #4caf50;
  transition: height 0.3s ease, background-color 0.3s ease;
  will-change: height;
}

/* 状态颜色不变 */
.battery-fill.medium { background-color: #ff9800; }
.battery-fill.low   { background-color: #f44336; }

.battery-text {
  font-family: YouSheBiaoTiHei;
  font-size: 20px;
  color: #ffffff;
  margin-left: 10px;
}
</style>
<template>
  <cover-view class="vertical-battery">
    <!-- 电池主体 -->
    <cover-view class="battery-body">
      <cover-view class="battery-track">
        <!-- 电量填充条：从底部向上 -->
        <cover-view
          class="battery-fill"
          :class="statusClass"
          :style="{ height: progressHeight + '%' }"
        />
      </cover-view>
      <!-- 正极凸起（顶部） -->
      <cover-view class="battery-tip" />
    </cover-view>

    <!-- 百分比文字（右侧） -->
    <cover-view class="battery-text">{{ displayValue }}%</cover-view>
  </cover-view>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

// ---------- Props ----------
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0 && v <= 100,
  },
});

// ---------- Emits ----------
const emit = defineEmits(['update:modelValue']);

// ---------- 填充高度（直接使用数值作为百分比） ----------
const progressHeight = ref(0);

// ---------- 更新进度 ----------
const updateUI = () => {
  progressHeight.value = Math.min(100, Math.max(0, props.modelValue));
};

// ---------- 颜色状态 ----------
const statusClass = computed(() => {
  const val = props.modelValue;
  if (val <= 20) return 'low';
  if (val <= 60) return 'medium';
  return '';
});

// ---------- 显示整数 ----------
const displayValue = computed(() => Math.round(props.modelValue));

// ---------- 监听变化 ----------
watch(() => props.modelValue, updateUI, { immediate: true });

// ---------- 暴露内部状态（可选） ----------
defineExpose({ progressHeight, statusClass });
</script>

<style scoped>
/* ---------- 整体容器 ---------- */
.vertical-battery {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  touch-action: none;
  user-select: none;

  /* 可自定义尺寸，此处固定为演示值 */
  --bat-width: 13px;
  --bat-height: 24px;
}

/* ---------- 电池主体 ---------- */
.battery-body {
  position: relative;
  width: var(--bat-width, 12px);
  height: var(--bat-height, 24px);
  flex-shrink: 0;
}

/* 电池外壳（轨道） */
.battery-track {
  width: 100%;
  height: 100%;
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  border-radius: 3px;
  overflow: hidden;
  background: transparent;
  box-sizing: border-box;
  position: relative;
}

/* 正极凸起（顶部） */
.battery-tip {
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 2.5px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 2px 2px 0 0;
}

/* 电量填充条（从底部向上） */
.battery-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0%;
  border-radius: 1px 1px 2px 2px;
  background-color: #4caf50; /* 默认绿色 */
  transition: height 0.3s ease, background-color 0.3s ease;
  will-change: height;
}

/* 颜色状态 */
.battery-fill.medium {
  background-color: #ff9800; /* 橙色 */
}
.battery-fill.low {
  background-color: #f44336; /* 红色 */
}

/* 百分比文字 */
.battery-text {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  min-width: 28px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
</style>
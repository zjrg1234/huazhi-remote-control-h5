<template>
  <cover-view class="mini-battery-wrapper">
    <!-- 电池主体 -->
    <cover-view class="battery-body">
      <!-- 电量填充条：加上圆角防止溢出 -->
      <cover-view
        class="battery-fill"
        :class="statusClass"
        :style="{ width: safePercent + '%' }"
      ></cover-view>
    </cover-view>
    <!-- 电池右侧凸起端头：移出 battery-body，利用 flex 自然排列 -->
    <cover-view class="battery-tip"></cover-view>
    
    <!-- 电量文字百分比 -->
    <cover-view class="battery-text">{{ safePercent }}%</cover-view>
  </cover-view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onHide } from '@dcloudio/uni-app';

const props = defineProps({
  percent: {
    type: Number,
    default: null
  }
});

// 设备实时电量缓存
const realBatteryLevel = ref(80);
let batteryTimer = null;

// 电量安全处理：限制0~100，自动四舍五入整数
const safePercent = computed(() => {
  const level = props.percent !== null ? props.percent : realBatteryLevel.value;
  return Math.max(0, Math.min(100, Math.round(level)));
});

// 根据电量返回对应样式类
const statusClass = computed(() => {
  if (safePercent.value <= 20) return 'low';
  if (safePercent.value <= 40) return 'medium';
  return '';
});

/**
 * 获取设备电量
 * 外部传入percent则跳过自动获取
 */
const fetchBatteryInfo = () => {
  if (props.percent !== null) return;

  // H5/webview环境
  // #ifdef H5
  if (navigator?.getBattery) {
    navigator.getBattery()
      .then(battery => {
        realBatteryLevel.value = battery.level * 100;
      })
      .catch(() => {});
  }
  // #endif

  // 小程序/App环境
  // #ifndef H5
  uni.getBatteryInfo({
    success(res) {
      realBatteryLevel.value = res.level;
    },
    fail(err) {
      console.warn('获取设备电量失败：', err);
    }
  });
  // #endif
};

// 页面显示初始化电量 + 定时刷新
onShow(() => {
  fetchBatteryInfo();
  // 开启30秒自动刷新电量
  batteryTimer = setInterval(fetchBatteryInfo, 30000);
});

// 页面隐藏销毁定时器，节省性能
onHide(() => {
  if (batteryTimer) {
    clearInterval(batteryTimer);
    batteryTimer = null;
  }
});
</script>

<style scoped>
.mini-battery-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.battery-body {
  position: relative;
  width: 25px;
  height: 12px;
  border: 1px solid #fff;

  border-radius: 2px;
  box-sizing: border-box; /* 改为 border-box 更稳定 */
  overflow: hidden; /* 确保内部绿色条不会溢出边框 */
}

.battery-fill {
  height: 100%;
  border-radius: 1px; /* 加上圆角，防止真机上直角溢出 */
  background-color: #4caf50;
  transition: width 0.4s ease, background-color 0.4s ease;
  border: 1px solid #fff;
}

.battery-fill.medium {
  background-color: #ff9800;
}

.battery-fill.low {
  background-color: #f44336;
}

/* 凸起端头：不再使用绝对定位，直接作为一个独立的 cover-view */
.battery-tip {
  width: 2px;
  height: 6px;
  background-color: #ffffff;
  border-radius: 0 2px 2px 0;
}

.battery-text {
  font-size: 10px;
  min-width: 20px;
  color: #ffffff;
  margin-left: 5px;
  margin-top: 2px;
}
</style>
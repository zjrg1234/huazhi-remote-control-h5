<template>
  <view class="mini-battery-wrapper">
    <view class="battery-body">
      <view class="battery-fill" :class="statusClass" :style="{ width: safePercent + '%' }"></view>
    </view>
    <text class="battery-text">{{ safePercent }}%</text>
  </view>
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

const realBatteryLevel = ref(80); 
let batteryTimer = null; 

const safePercent = computed(() => {
  const level = props.percent !== null ? props.percent : realBatteryLevel.value;
  return Math.max(0, Math.min(100, Math.round(level)));
});

const statusClass = computed(() => {
  if (safePercent.value <= 20) return 'low';
  if (safePercent.value <= 40) return 'medium';
  return ''; 
});

// 获取电量的方法
const fetchBatteryInfo = () => {
    return;
  if (props.percent !== null) return; // 如果外部传入了电量，则不自动获取
  
  // #ifdef H5
  // H5 端兼容 navigator.getBattery
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      realBatteryLevel.value = battery.level * 100;
    }).catch(() => {});
  }
  // #endif
  
  // #ifndef H5
  // App 和小程序端使用 uni.getBatteryInfo
  // 注意：需确保项目中已安装 uni-getbatteryinfo 插件
  uni.getBatteryInfo({
    success(res) {
      realBatteryLevel.value = res.level;
    },
    fail(err) {
      console.warn('获取电量失败:', err);
    }
  });
  // #endif
};

// 页面显示时获取电量，并开启定时刷新（模拟 levelchange）
onShow(() => {
  fetchBatteryInfo();
  // 每 30 秒刷新一次电量状态
//   batteryTimer = setInterval(fetchBatteryInfo, 30000);
});

// 页面隐藏时清理定时器
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
  gap: 2px;
}

.battery-body {
  position: relative;
  width: 16px;
  height: 8px;
  border: 1px solid #fff; 
  border-radius: 1px;
  padding: 1px;
  box-sizing: content-box;
}

.battery-body::after {
  content: '';
  position: absolute;
  right: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 3px;
  background-color: #fff;
  border-radius: 0 1px 1px 0;
}

.battery-fill {
  height: 100%;
  border-radius: 0.5px; 
  background-color: #4caf50;
  transition: width 0.5s ease, background-color 0.5s ease;
}

.battery-fill.medium { background-color: #ff9800; }
.battery-fill.low { 
  background-color: #f44336;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.battery-text {
  font-size: 14px;
  min-width: 10px;
  color: #fff;
      margin-left: 5px;
}
</style>
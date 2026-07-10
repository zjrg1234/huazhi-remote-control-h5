<template>
  <view class="real-time-clock">{{ displayTime }}</view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// import {formatDate } from "@/utils/utils"
// 定义 props，允许父组件传入自定义格式，默认为 YYYY-MM-DD HH:mm:ss
const props = defineProps({
  format: {
    type: String,
    default: "YYYY-MM-DD HH:mm:ss",
  },
});

const displayTime = ref("");
let timer = null;

// 简单的原生时间格式化函数（如需复杂格式可替换为 dayjs）
const formatTime = (date, fmt) => {
  const map = {
    YYYY: date.getFullYear(),
    MM: String(date.getMonth() + 1).padStart(2, "0"),
    DD: String(date.getDate()).padStart(2, "0"),
    HH: String(date.getHours()).padStart(2, "0"),
    mm: String(date.getMinutes()).padStart(2, "0"),
    ss: String(date.getSeconds()).padStart(2, "0"),
  };
  let result = fmt;
  for (const key in map) {
    result = result.replace(key, map[key]);
  }
  return result;
};

const updateTime = () => {
  displayTime.value = formatTime(new Date(), props.format);
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
/* 可根据需要添加默认样式 */
.real-time-clock {
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #fff;
  font-variant-numeric: tabular-nums;
  /* 让数字等宽，防止时间跳动 */
}
</style>

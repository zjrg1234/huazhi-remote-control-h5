// src/composables/useInactivityAlarm.js
import { ref, onUnmounted } from 'vue';

/**
 * 无操作报警组合式函数
 * @param {number} timeout - 无操作超时时间，单位毫秒
 * @param {Function} onAlarm - 超时后触发的回调函数
 * @returns {Object} - 返回控制函数
 */
export function useInactivityAlarm(timeout = 180000, onAlarm) {
  let inactivityTimer = ref(null);

  // 清理计时器
  const clearTimer = () => {
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value);
      inactivityTimer.value = null;
    }
  };

  // 重置计时器
  const resetTimer = () => {
    clearTimer();
    inactivityTimer.value = setTimeout(() => {
      if (typeof onAlarm === 'function') {
        onAlarm();
      }
    }, timeout);
  };

  // 启动监听
  const startListening = () => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer, true);
    });
    // 立即启动第一次计时
    resetTimer();
  };

  // 停止监听
  const stopListening = () => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.removeEventListener(event, resetTimer, true);
    });
    clearTimer();
  };

  // 组件卸载时自动清理
  onUnmounted(() => {
    stopListening();
  });

  // 暴露需要的方法和状态给组件使用
  return {
    resetTimer,
    startListening,
    stopListening
  };
}
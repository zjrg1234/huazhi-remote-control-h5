// src/composables/useInactivityAlarm.js
import { ref, onUnmounted } from 'vue';

/**
 * 无操作报警组合式函数（微信小程序/移动端适配）
 * @param {number} timeout - 无操作超时时间，单位毫秒，默认3分钟
 * @param {Function} onAlarm - 超时后触发的回调函数
 * @returns {Object} - 返回控制函数
 */
export function useInactivityAlarm(timeout = 180000, onAlarm) {
  const inactivityTimer = ref(null);
  const isListening = ref(false);

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

  // 事件处理函数（引用固定，便于移除监听）
  const handleActivity = () => {
    resetTimer();
  };

  // 启动监听
  const startListening = () => {
    if (isListening.value) return;
    
    // #ifdef H5
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'wheel'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true, capture: true });
    });
    // #endif

    // #ifdef MP-WEIXIN
    // 小程序没有 window 对象，使用页面生命周期和触摸事件
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage) {
      // 通过页面 onShow 重置
      const originalOnShow = currentPage.onShow;
      currentPage.onShow = function() {
        handleActivity();
        originalOnShow?.call(this);
      };
    }
    // #endif

    // #ifdef APP-PLUS
    const events = ['touchstart', 'touchmove', 'click', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true, capture: true });
    });
    // #endif

    isListening.value = true;
    resetTimer();
  };

  // 停止监听
  const stopListening = () => {
    if (!isListening.value) return;

    // #ifdef H5
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'wheel'];
    events.forEach(event => {
      window.removeEventListener(event, handleActivity, { capture: true });
    });
    // #endif

    // #ifdef MP-WEIXIN
    // 小程序无法移除页面生命周期，通过标志位控制
    // #endif

    // #ifdef APP-PLUS
    const events = ['touchstart', 'touchmove', 'click', 'scroll'];
    events.forEach(event => {
      document.removeEventListener(event, handleActivity, { capture: true });
    });
    // #endif

    clearTimer();
    isListening.value = false;
  };

  // 手动触发报警（用于测试或特定场景）
  const triggerAlarm = () => {
    clearTimer();
    if (typeof onAlarm === 'function') {
      onAlarm();
    }
  };

  // 组件卸载时自动清理
  onUnmounted(() => {
    stopListening();
  });

  return {
    resetTimer,
    startListening,
    stopListening,
    triggerAlarm,
    isListening
  };
}
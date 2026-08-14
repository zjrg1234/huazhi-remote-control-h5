// utils/notice.js
const NOTICE_KEY = '__notice_session_flag__';

/**
 * 生成当前会话标识（应用启动时生成，刷新/重启后变化）
 * 小程序端通过 getApp().globalData 持久化到本次启动周期
 * H5 端通过 sessionStorage 持久化到当前标签页
 */
function getSessionId() {
  // #ifdef H5
  let sid = sessionStorage.getItem('__uni_session_id__');
  if (!sid) {
    sid = Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessionStorage.setItem('__uni_session_id__', sid);
  }
  return sid;
  // #endif

  // #ifndef H5
  // 小程序/App：利用 globalData 在本次启动周期内保持不变
  const app = getApp();
  if (!app.globalData.__sessionId) {
    app.globalData.__sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  return app.globalData.__sessionId;
  // #endif
}

export function shouldFetchNotice(isLoggedIn) {
  if (!isLoggedIn) return false;

  try {
    const stored = uni.getStorageSync(NOTICE_KEY);
    // 只有 sessionId 匹配才视为"本次会话已获取"
    if (stored && stored.sessionId === getSessionId()) {
      return false;
    }
  } catch (e) {
    // storage 读取异常，允许重试
  }

  // 标记为已获取（请求前标记，防并发）
  uni.setStorageSync(NOTICE_KEY, {
    sessionId: getSessionId(),
    timestamp: Date.now()
  });
  return true;
}

// 退出登录时调用
export function resetNoticeFlag() {
  try {
    uni.removeStorageSync(NOTICE_KEY);
  } catch (e) {}
}
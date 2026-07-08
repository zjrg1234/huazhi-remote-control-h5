export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // 格式化为两位数，例如 1 -> "01"
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  if (formattedHours == "00") {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};



export const formatDate = (time, format = "yyyy-MM-dd hh:mm:ss") => {
  if (!time) return "";

  // 关键步骤：判断是秒级还是毫秒级
  let date = new Date(
    typeof time === "number"
      ? time.toString().length === 10
        ? time * 1000
        : time
      : time,
  );

  const o = {
    "M+": date.getMonth() + 1, // 月份
    "d+": date.getDate(), // 日
    "h+": date.getHours(), // 小时
    "m+": date.getMinutes(), // 分
    "s+": date.getSeconds(), // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  };

  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length),
    );
  }

  for (let k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length),
      );
    }
  }
  return format;
};

/**
 * 复制文本到剪贴板
 * @param {string} text - 需要复制的文本
 * @returns {Promise<boolean>} 是否复制成功
 */
export const copyToClipboard = async (text) => {
  // 优先使用现代 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("Clipboard API 复制失败，尝试降级方案", err);
    }
  }

  // 降级方案：使用传统的 execCommand
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // 防止页面滚动
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error("复制失败:", err);
    return false;
  }
};

export const compareTimestamp = (startTime, endTime) => {
  // 1. 判断并转换为毫秒级时间戳（兼容秒级和毫秒级输入）
  const time1 =
    startTime.toString().length === 10 ? startTime * 1000 : startTime;
  const time2 = endTime.toString().length === 10 ? endTime * 1000 : endTime;

  // 2. 计算差值的绝对值（毫秒）
  let diffMs = Math.abs(time1 - time2);

  if (diffMs < 0) {
    diffMs = 0;
  }
  console.log(diffMs);
  const date = new Date(diffMs);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  // 获取小时、分钟、秒（使用 UTC 方法避免受本地时区偏移影响）
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  // 待优化
  let text = "";
  if (days > 0) text += `${days}:`;
  if (hours > 0) text += `${formatNum(hours)}:`;
  if (minutes >= 0) text += `${formatNum(minutes)}:`;
  text += `${formatNum(seconds)}`;
  return {
    days,
    hours: formatNum(hours),
    minutes: formatNum(minutes),
    seconds: formatNum(seconds),
    text, // 直接可用的拼接文案
  };
};

const formatNum = (n) => (n < 10 ? "0" + n : n);


// export const mapValue = (value) => {
//   // 可选：限制输入值在 0~65 之间，防止越界
//   const clampedValue = Math.max(0, Math.min(65, Math.abs(value)));
//   return ((clampedValue / 65) * 100).toFixed(2);
// }

export const mapToPer = (value) => {
  // 1. 边界保护，防止超出范围
  if (value <= 0) return 0;
  if (value >= 65) return 1;
  
  // 2. 线性映射计算
  const percentage = 1 + (value / 65) * 99;
  
  // 3. 四舍五入取整（根据需求也可以保留小数）
  return (Math.round(percentage)/ 100).toFixed(2); 
}
export const formatTime = (time, format = 'yyyy-MM-dd hh:mm:ss') => {
	if (!time) return '';

	// 关键步骤：判断是秒级还是毫秒级
	let date = new Date(typeof time === 'number' ? (time.toString().length === 10 ? time * 1000 : time) : time);

	const o = {
		'M+': date.getMonth() + 1, // 月份
		'd+': date.getDate(), // 日
		'h+': date.getHours(), // 小时
		'm+': date.getMinutes(), // 分
		's+': date.getSeconds(), // 秒
		'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
		'S': date.getMilliseconds() // 毫秒
	};

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
	}

	for (let k in o) {
		if (new RegExp('(' + k + ')').test(format)) {
			format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k])
				.length)));
		}
	}
	return format;
}

export const compareTimestamp = (startTime, endTime) => {
	
	// 1. 判断并转换为毫秒级时间戳（兼容秒级和毫秒级输入）
	const time1 = startTime.toString().length === 10 ? startTime * 1000 : startTime;
	const time2 = endTime.toString().length === 10 ? endTime * 1000 : endTime;
	
	// 2. 计算差值的绝对值（毫秒）
	const diffMs = Math.abs(time1 - time2);
	
	if (diffMs < 0) {
		diffMs = 0;
	}
	console.log(diffMs)
	const date = new Date(diffMs);
	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	// 获取小时、分钟、秒（使用 UTC 方法避免受本地时区偏移影响）
	const hours = date.getUTCHours();
	const minutes = date.getUTCMinutes();
	const seconds = date.getUTCSeconds();

  
	// 待优化
	let text = '';
		if (days > 0) text += `${days}:`;
		if (hours > 0) text += `${formatNum(hours)}:`;
		if (minutes >= 0) text += `${formatNum(minutes)}:`;
		text += `${formatNum(seconds)}`;
	return {
		days,
		hours: formatNum(hours),
		minutes: formatNum(minutes),
		seconds: formatNum(seconds),
		text // 直接可用的拼接文案
	}
}

const formatNum = (n) => (n < 10 ? '0' + n : n);
const SYSTEM_INFO = uni.getSystemInfoSync();
console.log(SYSTEM_INFO)
export const getStatusBarHeight = ()=> SYSTEM_INFO.statusBarHeight || 15;

export const getTitleBarHeight = ()=>{
	console.log(uni.getMenuButtonBoundingClientRect())
	if(uni.getMenuButtonBoundingClientRect){
		let {top,height} = uni.getMenuButtonBoundingClientRect();
		return height + (top - getStatusBarHeight())*2		
	}else{
		return 40;
	}
}

export const  getNavBarHeight = ()=> getStatusBarHeight()+getTitleBarHeight();

export const getLeftIconLeft = ()=> {
	// #ifdef MP-TOUTIAO
		let {leftIcon:{left,width}}  = tt.getCustomButtonBoundingClientRect();
		return left+ parseInt(width);
	// #endif
	
	// #ifndef MP-TOUTIAO
		return 0
	// #endif	
}



// utils/throttleDebounce.js

/**
 * 防抖函数 (Debounce)
 * @param {Function} func - 需要执行的函数
 * @param {Number} delay - 延迟时间(ms)，默认300ms
 * @returns {Function} 包装后的函数
 */
export const debounce = (func, delay = 300) => {
  let timer = null;
  return (...args) => {
    const context = this; // 保存this指向
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

/**
 * 节流函数 (Throttle)
 * @param {Function} func - 需要执行的函数
 * @param {Number} interval - 间隔时间(ms)，默认500ms
 * @returns {Function} 包装后的函数
 */
export const throttle = (func, interval = 500) => {
  let lastTime = 0;
  return  (...args) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}
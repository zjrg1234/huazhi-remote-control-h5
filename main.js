import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'


 import pinia from '@/store/index'
// 引入全局路由拦截
import '@/router/index'
// 引入请求方法
import { get, post } from '@/utils/request'



export function createApp() {
  const app = createSSRApp(App)
  
  // 挂载Pinia
  app.use(pinia)
  
  // 全局挂载请求
  uni.$get = get
  uni.$post = post

  
  return {
    app
  }
}
// #endif
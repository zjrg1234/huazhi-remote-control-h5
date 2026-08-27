import { createI18n } from 'vue-i18n'
import Hans from './zh-Hans.json'
import hant from './zh-hant.json'

const messages = {
  'zh-CN': Hans,
  'zh-TW': hant
}

const i18n = createI18n({
  locale: uni.getLocale(),    // 优先读取系统语言
  fallbackLocale: 'zh-CN',  // 兜底语言
  messages,
  // ⚠️ Vue3 + vue-i18n v9 必须设置此项以支持小程序端
  legacy: false,
  // 允许在模板中直接使用 $t，无需额外注入
  globalInjection: true
})

export default i18n

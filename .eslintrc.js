module.exports = {
  // ...其他配置
  settings: {
    vue: {
      version: '3'  // ✅ 显式指定 Vue 3
    }
  },
  // 或者如果你使用的是 eslint-plugin-vue 的预设
  extends: [
    'plugin:vue/vue3-recommended'  // ✅ 使用 vue3 预设而非 vue-recommended
  ]
}
<template>
  <cover-view
    class="cover-switch"
    :class="{ 'cover-switch-checked': modelValue, 'cover-switch-disabled': disabled }"
    :hover-class="disabled ? '' : 'cover-switch-hover'"
    @click="handleClick"
  >
    <!-- 轨道背景：通过 class 切换颜色，无过渡动画 -->
    <cover-view class="cover-switch-track">
      <!-- 滑块：仅使用 transform 实现位移动画 -->
      <cover-view
        class="cover-switch-thumb"
        :style="{ transform: modelValue ? 'translateX(22px)' : 'translateX(0)' }"
      >
        <!-- 使用 cover-image 替代伪元素绘制对勾/关闭图标 -->
        <cover-view
          class="cover-switch-icon"
          :class="{'active' : modelValue} "

        />
      </cover-view>
    </cover-view>
  </cover-view>
</template>

<script>
export default {
  name: 'CoverSwitch',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  methods: {
    handleClick() {
      if (this.disabled) return;
      const newValue = !this.modelValue;
      this.$emit('update:modelValue', newValue);
      this.$emit('change', newValue);
    }
  }
};
</script>

<style lang="scss" scoped>
/* 开关容器 */
.cover-switch {
  width: 50px;
  height: 24px;
  border-radius: 28px;
  overflow: hidden;
}

/* 禁用态：降低透明度 */
.cover-switch-disabled {
  opacity: 0.6;
}

/* 点击反馈：仅支持 opacity 过渡 */
.cover-switch-hover {
  opacity: 0.8;
}

/* 轨道：颜色切换无过渡，这是 cover-view 的硬性限制 */
.cover-switch-track {
  width: 100%;
  height: 100%;
  background-color: #ccc;
  border-radius: 28px;
  position: relative;
}

/* 选中态轨道颜色 */
.cover-switch-checked .cover-switch-track {
  background-color: #fff;
}

/* 滑块：仅 transform 支持过渡动画 */
.cover-switch-thumb {
  width: 22px;
  height: 22px;
  position: absolute;
  top: 1px;
  left: 3px;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 图标尺寸 */
.cover-switch-icon {
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
}
.active {
  background: #0DA5FF;
}
</style>
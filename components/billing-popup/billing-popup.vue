<!-- components/BillingPopup/BillingPopup.vue -->
<template>
  <uni-popup ref="popupRef" type="bottom" :mask-click="false">
    <view class="billing-popup">
      <!-- 标题栏 -->
      <view class="header">
        <text class="title">选择计费方式</text>
        <view class="close-btn" @click="close">×</view>
      </view>

      <!-- 顶部：付费单位切换 -->
      <view class="payment-type-row">
        <text class="label">付费方式</text>
        <view class="type-selector">
          <view
            class="type-item"
            :class="{ active: currentUnit === 'battery' }"
            @click="switchUnit('battery')"
          >
            <view
              class="radio-circle"
              :class="{ checked: currentUnit === 'battery' }"
            ></view>
            <text>电池</text>
          </view>
          <view
            class="type-item"
            :class="{ active: currentUnit === 'energy' }"
            @click="switchUnit('energy')"
          >
            <view
              class="radio-circle"
              :class="{ checked: currentUnit === 'energy' }"
            ></view>
            <text>能量</text>
          </view>
        </view>
      </view>

      <!-- 按时间计费 -->
      <view class="section">
        <view class="section-title">按时间计费</view>
        <text class="desc">按照分钟计费，不受时间限制，想玩就玩</text>
        <view class="grid-box">
          <view
            class="option-card"
            :class="{ selected: selectedOption === -1 }"
            @click="
              selectOption(
                -1,
                billData.time_billing.time,
                billData.time_billing.battery
              )
            "
          >
            {{ billData.time_billing.time }}分钟{{
              billData.time_billing.battery
            }}
            {{ unitText }}
          </view>
        </view>
      </view>

      <!-- 按次计费 -->
      <view class="section">
        <view class="section-title">按次计费</view>
        <text class="desc">按照单次时间游玩，时间到则立即结束</text>
        <view class="grid-box">
          <view
            v-for="(item, index) in billData.one_billing"
            :key="index"
            class="option-card"
            :class="{ selected: selectedOption === index }"
            @click="selectOption(index, item.time, item.battery)"
          >
            {{ item.time }}分钟{{ item.battery }}{{ unitText }}
          </view>
        </view>
      </view>

      <view class="card">
        <text class="card-title">我的{{unitText}}</text>
        <text class="battery-num" v-if="currentUnit.value === 'battery'">{{ userInfo.wallet.balance }}</text>
        <text class="battery-num" v-if="currentUnit.value !== 'battery'">{{ userInfo.wallet.energy }}</text>
        
      </view>

      <!-- 底部按钮 -->
      <button class="confirm-btn" @click="handleConfirm">确定支付</button>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed } from "vue";
import {
		useUserStore
	} from '@/store/modules/user'
	const userStore = useUserStore()
const props = defineProps(["billData"]);
const emit = defineEmits(["confirm"]);


const popupRef = ref(null);
const currentUnit = ref("energy"); // 默认选中 'energy' (能量) 或 'battery' (电池)


	const userInfo = computed(() => {
		return userStore.getUserInfo()
	})
// 当前显示的文本后缀
const unitText = computed(() =>
  currentUnit.value === "battery" ? "电池" : "能量"
);

// 选中的结果对象
const selectedOption = ref(-1);

// 打开弹窗
const open = () => {
  selectedOption.value = -1;
  popupRef.value.open();
};

// 关闭弹窗
const close = () => {
  popupRef.value.close();
};

// 切换付费单位（电池/能量）
const switchUnit = (type) => {
  currentUnit.value = type;
};

// 选择具体的时长卡片
const selectOption = (id, label, cost) => {
  selectedOption.value = id;
};

// 点击确定
const handleConfirm = () => {
  const result = {
    unitType: currentUnit.value, // 'battery' or 'energy'
    ...selectedOption.value,
  };
  console.log("用户选择:", result);
  emit("confirm", result);
  close();
};

// 暴露方法给父组件调用
defineExpose({
  open,
});
</script>

<style scoped lang="scss">
/* 容器样式 */
.billing-popup {
  width: 100%;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 20rpx;
  box-sizing: border-box;
}

/* 标题栏 */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 40rpx;

  .title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
  }

  .close-btn {
    position: absolute;
    right: 0;
    top: -10rpx;
    font-size: 40rpx;
    color: #999;
    line-height: 1;
  }
}

/* 顶部付费方式切换 */
.payment-type-row {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;

  .label {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-right: 20rpx;
  }

  .type-selector {
    display: flex;
    gap: 30rpx;
  }

  .type-item {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #666;

    &.active {
      color: #333;
      font-weight: bold;
    }

    .radio-circle {
      width: 30rpx;
      height: 30rpx;
      border-radius: 50%;
      border: 2rpx solid #ccc;
      margin-right: 10rpx;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;

      &.checked {
        border-color: #fbbd08; /* 黄色主题色 */
        background-color: #fff;
        position: relative;
      }

      /* 模拟选中时的内部圆点 */
      &.checked::after {
        content: "";
        width: 16rpx;
        height: 16rpx;
        background-color: #fbbd08;
        border-radius: 50%;
      }
    }
  }
}

/* 分区样式 */
.section {
  margin-bottom: 30rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }

  .desc {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 20rpx;
    display: block;
  }
}

/* 选项网格 */
.grid-box {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.option-card {
  width: calc(33% - 10rpx); /* 一行三个 */
  height: 70rpx;
  border: 1rpx solid #ffc838;
  border-radius: 12rpx;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #fff;
  transition: all 0.2s;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 24rpx;
  color: #1a1a1a;

  &.selected {
    background: #ffc838;
    border: 1rpx solid #ffc838;
  }
}

/* 确定按钮 */
.confirm-btn {
  margin-top: 40rpx;
  background-color: #fbbd08;
  color: #333;
  font-weight: bold;
  border-radius: 50rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  border: none;

  &:active {
    opacity: 0.9;
  }
}

.card {
  background-color: #fff;


  margin-bottom: 20rpx;

  /* 卡片标题 */
  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
  }

  /* 卡片描述文字 */
  .card-desc {
    font-size: 28rpx;
    color: #999;
    display: block;
    margin-bottom: 24rpx;
  }
}
</style>
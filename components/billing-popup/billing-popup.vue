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
          <view class="type-item" :class="{ active: currentUnit === 1 }" @click="switchUnit(1)">
            <view class="radio-circle" :class="{ checked: currentUnit === 1 }"></view>
            <text>电池</text>
          </view>
          <view class="type-item" :class="{ active: currentUnit === 2 }" @click="switchUnit(2)">
            <view class="radio-circle" :class="{ checked: currentUnit === 2 }"></view>
            <text>能量</text>
          </view>
        </view>
      </view>

      <!-- 按时间计费 -->
      <view class="section" v-if="Object.hasOwn(billData, 'time_billing')">
        <view class="section-title">按时间计费</view>
        <text class="desc">按照分钟计费，不受时间限制，想玩就玩</text>
        <view class="grid-box">
          <view 
            class="option-card" 
            :class="{ selected: selectedIndex == -1 }" 
            @click="selectOption(-1, billData.time_billing.time, billData.time_billing.battery)">
            {{ billData.time_billing.time }}分钟{{ billData.time_billing.battery }}{{ unitText }}
          </view>
        </view>
      </view>

      <!-- 按次计费 -->
      <view class="section" v-if="Object.hasOwn(billData, 'one_billing')">
        <view class="section-title">按次计费</view>
        <text class="desc">按照单次时间游玩，时间到则立即结束</text>
        <view class="grid-box">
          <view 
            v-for="(item, index) in billData.one_billing" 
            :key="index" 
            class="option-card"
            :class="{ selected: selectedIndex === index }" 
            @click="selectOption(index, item.time, item.battery)">
            {{ item.time }}分钟{{ item.battery }}{{ unitText }}
          </view>
        </view>
      </view>

      <!-- 我的余额卡片 -->
      <view class="card">
        <text class="card-title">我的{{ unitText }}</text>
        <text class="battery-num" v-if="currentUnit === 1">{{ userInfo.wallet.balance }}</text>
        <text class="battery-num" v-if="currentUnit !== 1">{{ userInfo.wallet.energy }}</text>
      </view>

      <!-- 底部按钮 -->
      <button class="confirm-btn" v-if="isWallet" @click="handleConfirm">确定支付</button>
      <button class="confirm-btn recharge-btn" v-else @click="goRecharge">充值</button>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useUserStore } from "@/store/modules/user";

const userStore = useUserStore();
const props = defineProps(["billData"]);
const emit = defineEmits(["confirm"]);

const popupRef = ref(null);
const currentUnit = ref(1); // 默认选中电池
const selectedIndex = ref(-1);
const selectedOpt = ref({});
const isWallet = ref(true); // 余额是否充足

// 当前显示的文本后缀
const unitText = computed(() => (currentUnit.value === 1 ? "电池" : "能量"));

// 纯计算属性：只负责获取用户信息，绝不修改任何状态
const userInfo = computed(() => {
  return userStore.getUserInfo();
});

/**
 * 核心修复：使用 watch 统一管理 isWallet 的状态
 * 同时监听 currentUnit 和 userInfo，任意变化都会重新计算余额是否充足
 */
watch(
  [currentUnit, userInfo, selectedIndex, selectedOpt], // 增加监听 selectedIndex 和 selectedOpt
  ([newUnit, newUser, newSelectIndex, newSelectOpt]) => {
    if (!newUser || !newUser.wallet) return;

    const balance = Number(newUser.wallet.balance) || 0;
    const energy = Number(newUser.wallet.energy) || 0;
    // 获取当前选中项需要消耗的数量
    const cost = Number(newSelectOpt?.battery) || 0; 

    if (newUnit === 1) {
      // 电池模式：余额 >= 消耗量
      isWallet.value = balance >= cost;
    } else if (newUnit === 2) {
      // 能量模式：余额 >= 消耗量
      isWallet.value = energy >= cost;
    }
  },
  { immediate: true, deep: true }
);

// 打开弹窗
const open = () => {
  selectedIndex.value = -1;
  selectedOpt.value = {
    time: props.billData.time_billing?.time,
    battery: props.billData.time_billing?.battery,
  };

  // 在打开弹窗时，安全地初始化默认选中的付费方式
  const val = userInfo.value;
  if (val && val.wallet) {
    if (val.wallet.balance > 0 && val.wallet.energy == 0) {
      currentUnit.value = 1;
    } else if (val.wallet.balance == 0 && val.wallet.energy > 0) {
      currentUnit.value = 2;
    }
  }

  popupRef.value.open();
};

// 关闭弹窗
const close = () => {
  popupRef.value.close();
};

// 切换付费单位（逻辑已交由 watch 处理，此处只需更新值）
const switchUnit = (type) => {
  currentUnit.value = type;

  // if (type == 2) {
  //   // 按时间计费
  //   if (Object.hasOwn(props.billData, 'time_billing')) {
  //     if(Number(props.billData.time_billing.battery) > Number(userInfo.value.wallet.energy) ) {
  //       isWallet.value = false;
  //     }
  //   }
  // }

  // if (type == 1) {

  // }
};

// 选择具体的时长卡片
const selectOption = (id, label, cost) => {
  selectedIndex.value = id;
  selectedOpt.value = {
    time: label,
    battery: cost,
  };
};

// 点击确定支付
const handleConfirm = () => {
  const result = {
    unitType: currentUnit.value,
    selectType: selectedIndex.value,
    selectedOpt: selectedOpt.value,
  };
  emit("confirm", result);
  close();
};

// 跳转充值
const goRecharge = () => {
  close(); // 关闭当前弹窗
  uni.navigateTo({ url: '/pages/mine/recharge' });
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
        border-color: #fbbd08;
        background-color: #fff;
        position: relative;
      }

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
  width: calc(33% - 10rpx);
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

/* 确定/充值按钮 */
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

/* 余额卡片 */
.card {
  background-color: #fff;
  margin-bottom: 20rpx;

  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
  }
}
</style>
<template>
  <view class="page">
  


    <view class="sticky-content">
      <view class="wrap-content">
        <!-- #ifdef H5 -->
        <NavBar title="我的电池" url="/pages/mine/index"></NavBar>
        <view class="bg-image bg-image-h5">
          <image class="image" src="/static/images/mine/bg2@2x.png" mode="widthFix"></image>
        </view>
        <!-- #endif -->



            <!-- #ifdef MP-WEIXIN -->
    <custom-nav-bar title="我的电池" url="/subpkg_mine/pages/mine/battery" flag="0"></custom-nav-bar>
    <!-- #endif -->

        <!-- #ifndef H5 -->
        <!-- 顶部背景图 小程序-->
        <view class="bg-image">
          <image class="image" src="/static/images/mine/bg2@2x.png" mode="widthFix"></image>
        </view>
        <!-- #endif -->

        <!-- 电池卡片 -->
        <view class="card">
          <view class="card-bg">
            <image class="card-bg-img" src="/static/images/mine/bg_battery@2x.png" mode="widthFix"></image>
          </view>
          <view class="card-content">
            <view class="card-left">
              <view class="label">
                <view class="label-text"> 我的电池 </view>
                <image class="battery" src="/static/images/mine/icon_battery@2x.png" mode="widthFix">
                </image>
              </view>
              <view class="num">{{ balance }}</view>
            </view>
          </view>
        </view>
      </view>


      <view class="tabs">
        <view v-for="item in tabs" :key="item.id" class="tab-item" :class="{ active: tab === item.id }"
          @click="handleSelect(item.id)">
          <text>{{ item.name }}</text>
          <!-- 底部激活横线 -->
          <view v-if="tab === item.id" class="line"></view>
        </view>
      </view>
    </view>


    <!-- 充值套餐 -->
    <view class="section">
      <text class="section-title">充值套餐</text>
      <view class="package-list" v-if="tab == 'normal'">
        <view class="package-item" :class="{ active: selectedPackage === item.amount }" v-for="item in packageList"
          :key="item.amount" @click="selectedPackageIndex(1, item.amount)">
          <view class="num">
            <text> {{ item.amount }} </text>
            <image class="icon" src="/static/images/common/icon_battery@2x.png" />
          </view>
          <view class="price">¥{{ item.amount.toFixed(2) }}</view>
        </view>
      </view>
      <view class="package-list" v-if="tab == 'first'">
        <view class="package-item" :class="{ active: selectedPackage === item.payment_amount }"
          v-for="item in packageFirstList" :key="item.payment_amount" @click="selectedPackageIndex(2, item)">
          <view class="num">
            <text> {{ item.payment_amount }} </text>
            <image class="icon" src="/static/images/common/icon_battery@2x.png" />
          </view>
          <view class="energy">送{{ item.send_energy }}能量</view>
          <view class="price">¥{{ item.payment_amount.toFixed(2) }}</view>
        </view>
      </view>
    </view>

    <!-- 自定义充值 -->
    <view class="section">
      <text class="section-title">自定义数量充值</text>
      <input class="custom-input" type="number" placeholder="请输入电池数量（不低于3个）" v-model.number="customNum" />
    </view>

    <!-- 支付方式 -->
    <view class="section">
      <text class="section-title">支付方式</text>
      <view class="pay-list">
        <!-- <view
          class="pay-item"
          :class="{ active: payType === 'alipay' }"
          @click="payType = 'alipay'"
        >
          <image class="pay-icon" src="/static/images/common/icon_zfb@2x.png" />
          <text>支付宝支付</text>
        </view> -->
        <view class="pay-item" :class="{ active: payType === 'wechat' }" @click="payType = 'wechat'">
          <image class="pay-icon" src="/static/images/common/icon_wx@2x.png" />
          <text>微信支付</text>
        </view>
      </view>
    </view>

    <!-- 说明文字 -->
    <view class="desc">
      <text class="desc-title">充值说明：</text>
      <view class="desc-item">1. 禁止未成年人充值；</view>
      <view class="desc-item">2. 如您未满18岁，请在监护人陪同下操作；</view>
      <view class="desc-item">3. 如对充值有其它疑问，请联系客服。</view>
    </view>

    <!-- 确定按钮 -->
    <view class="submit-btn">
      <button class="btn" @click="handleSubmit">确定</button>

    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
// #ifdef  H5
import NavBar from "@/components/nav-bar/nav-bar.vue";
	// #endif
import {
  GetDepositList,
  GetFirstDepositList,
  AlipayDeposit,
  WechatDeposit,
} from "../axios/recharge.js";
import {
  WechatPay,
} from "@/axios/index.js";

import { getNavBarHeight } from "@/utils/system.js";

import { useUserStore } from "@/store/modules/user";

const userStore = useUserStore();

const balance = computed(() => {
  return userStore.getUserInfo().wallet.balance;
});
// 当前选中标签
const tab = ref("normal");

// 选中的套餐
const selectedPackage = ref(null);

const packageFirstList = ref(null);

const activityId = ref(null);

const tabs = [
  {
    id: "normal",
    name: "普通充值",
  },
  {
    id: "first",
    name: "首充优惠",
  },
];

onMounted(() => {
  getDepositList();
  getFirstDepositList();
});

const getDepositList = () => {
  GetDepositList({
    uid: userStore.getUserInfo().id,
  })
    .then((res) => {
      console.log(res);
      packageList.value = res.data;
    })
    .catch();
};

const getFirstDepositList = () => {
  GetFirstDepositList({
    uid: userStore.getUserInfo().id,
  })
    .then((res) => {
      console.log(res);
      packageFirstList.value = res.data;
    })
    .catch();
};

// 自定义充值数量
const customNum = ref(null);

watch(customNum, (newValue, oldValue) => {
  if (newValue) {
    selectedPackage.value = -1;
  }
});

// 支付方式
const payType = ref("wechat");

// 套餐列表
const packageList = ref();

const selectedPackageIndex = (type, item) => {
  selectedPackage.value = item;
  customNum.value = "";
  activityId.value = undefined;
  // 首充
  if (type == 2) {
    selectedPackage.value = item.payment_amount;
    activityId.value = item.activity_id;
  }
};
const handleSelect = (val) => {
  tab.value = val;
  customNum.value = "";
};
// 返回
const goBack = () => {
  uni.navigateBack();
};

// 提交
const handleSubmit = async () => {
  let amount = 0;
  if (selectedPackage.value && selectedPackage.value != -1) {
    amount = selectedPackage.value;
  } else if (customNum.value && customNum.value >= 3) {
    amount = customNum.value;
  } else {
    uni.showToast({
      title: "请选择或输入充值数量",
      icon: "none",
    });
    return;
  }
  let res;
  let obj = {
    uid: userStore.getUserInfo().id,
    amount: selectedPackage.value || customNum.value,
    activity_id: activityId.value || undefined,
  };
  if (payType.value == "alipay") {
    const {
      code,
      data: { order_str },
    } = await AlipayDeposit(obj);
    const payUrl = "https://mapi.alipay.com/gateway.do?" + order_str;
    window.location.href = payUrl;

    const rawPayUrl = "https://mapi.alipay.com/gateway.do?" + order_str;
    const encodedUrl = encodeURIComponent(rawPayUrl);
    const scheme = `alipays://platformapi/startapp?appId=20000067&url=${encodedUrl}`;

    // 尝试唤起App
    window.location.href = scheme;

    // 若未安装，3秒后跳转H5收银台
    setTimeout(() => {
      window.location.href = rawPayUrl;
    }, 3000);
  } else {
    res = await WechatPay(obj);
    if (res.code == 200) {
      wx.requestPayment({
        timeStamp: res.data.timeStamp,
        nonceStr: res.data.nonceStr,
        package: res.data.package, // 格式为: 'prepay_id=***'
        signType: res.data.signType, // 通常为 'RSA'
        paySign: res.data.paySign,
        success: (res) => {
          // 支付成功
          uni.showToast({ title: '支付成功', icon: 'success' })

        },
        fail: (err) => {
          // 支付失败或取消
        }
      });
    } else {
      uni.showToast({ title: res.msg, icon: 'none' })
    }
  }

  console.log(res);
};
</script>

<style lang="scss" scoped>
page {
  background: #f8f8f8;
  padding: 0 !important;
  margin: 0 !important;
  box-sizing: border-box;
}

.page {
  height: 100vh;
  background: #f8f8f8;
  padding-bottom: 100rpx;
}

.sticky-content {
  position: sticky;
  top: 0;
  z-index: 1;
}

.wrap-content {
  position: relative;
  width: 100%;
  background: #ffffff;


  /* 顶部背景图 */
  .bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 170rpx;
    z-index: 0;

    .image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      height: 170rpx;
    }
  }
  .bg-image-h5 {
    top: -97rpx;
  }

  /* 电池卡片 */
  .card {
    position: relative;
    z-index: 1;
    overflow: hidden;
    height: 196rpx;
    margin: 10rpx;
    margin-bottom: 0;
    padding: 20rpx;
    padding-bottom: 0;
    padding-left: 30rpx;

  }

  .card-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 0;

    .card-bg-img {
      width: 100%;
      height: 196rpx;
    }
  }

  .card-content {
    position: relative;
    z-index: 1;
    padding: 0 0;
    display: flex;
    justify-content: space-between;
    align-items: end;
  }

  .label {
    padding-top: 10rpx;

    display: flex;
    justify-content: left;
    align-items: center;

    .label-text {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 28rpx;
      color: #222222;
    }

    .battery {
      width: 38rpx;
      height: 38rpx;
    }
  }

  .num {
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 600;
    font-size: 40rpx;
    color: #222222;
    padding-top: 25rpx;
    padding-left: 10rpx;
  }


}

.tabs {
  display: flex;
  justify-content: space-around;
  background-color: #ffffff;
  margin-bottom: 20rpx;
  padding-bottom: 13rpx;

  .tab-item {
    margin: 0 40rpx;
    position: relative;
    padding-bottom: 10rpx;

    text {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 28rpx;
      color: #777777;
    }

    /* 激活状态样式 */
    &.active text {
      font-weight: 500;
      font-size: 30rpx;
      color: #1a1a1a;
    }

    .line {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;

      background: #1a1a1a;
      border-radius: 2rpx;
    }
  }
}

/* 通用 section */
.section {
  background: #fff;
  margin: 20rpx 20rpx 0;
  border-radius: 16rpx;
  padding: 20rpx;

  .section-title {
    display: block;
    font-family: PingFangSC, PingFang SC;
    font-weight: 500;
    font-size: 28rpx;
    color: #222222;
    margin-bottom: 20rpx;

  }
}

/* 套餐列表 */
.package-list {
  display: grid;
  grid-template-columns: repeat(3, auto);
  /* 3行，高度自适应 */
  gap: 20rpx;
  /* 间距 */
  height: 100%;

  .package-item {
    // width: calc((100% - 40rpx) / 3);
    border: 1rpx solid #eee;
    border-radius: 12rpx;
    padding: 24rpx 10rpx;
    text-align: center;

    .num {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
      display: flex;

      align-items: baseline;
      justify-content: center;

      .icon {
        width: 28rpx;
        height: 28rpx;
        margin-left: 6rpx;
      }
    }

    .price {
      font-size: 26rpx;
      color: #999;
      margin-top: 10rpx;
    }

    .energy {
      font-size: 26rpx;
      color: #999;
    }

    &.active {
      border-color: #ffc832;
      background: #fff9e6;

      .num {
        color: #ff8500;
      }

      .price {
        color: #ff8500;
      }
    }
  }
}

/* 自定义输入框 */
.custom-input {
  height: 88rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 10rpx;
  font-size: 28rpx;
}

/* 支付方式 */
.pay-list {
  display: flex;
  gap: 20rpx;

  .pay-item {
    flex: 1;
    border: 1rpx solid #eee;
    border-radius: 12rpx;
    padding: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    font-size: 28rpx;

    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    font-size: 30rpx;
    color: #1a1a1a;

    .pay-icon {
      width: 40rpx;
      height: 40rpx;
    }

    &.active {
      background: #ffc838;
      border-radius: 12rpx;
      border: 1rpx solid #ffc838;
      color: #1a1a1a;
    }
  }
}

/* 说明文字 */
.desc {
  margin: 20rpx 30rpx;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  font-size: 24rpx;
  color: #999999;
}

/* 提交按钮 */
.submit-btn {
  position: fixed;
  padding-bottom: env(safe-area-inset-bottom);
  bottom: 0;
  width: 100%;
  background: #fff;

  .btn {
    margin: 25rpx;
    border: none;
    background: #FFC838;
    border-radius: 16rpx;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 500;
    font-size: 32rpx;
    color: #1a1a1a;
  }
}


.recharge-btn {
  background: #ffc838;
  border-radius: 12rpx;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  font-size: 24rpx;
  color: #1a1a1a;
  padding: 10rpx 40rpx;
}

/* 列表 */
.list {
  padding: 0 20rpx 20rpx;
}

.item {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.common-text {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  font-size: 24rpx;
  color: #666666;
}

.type {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  font-size: 28rpx;
  color: #333333;
}

.middle {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: #999;

  .amount {
    font-family: DINAlternate, DINAlternate;
    font-weight: bold;
    font-size: 40rpx;
  }

  .red {
    color: #ee4040;
  }

  .green {
    color: #07c160;
  }
}

.load-tip {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 24rpx;
}
</style>

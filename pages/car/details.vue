<template>
  <view class="page">
    <!-- 1. 顶部背景图与基础信息 -->
    <view class="header-section">
      <image class="banner-img" :src="imageUrl" mode="aspectFill"></image>
      <view class="info-box">
        <view class="title-row">
          <text class="main-title">{{ detailData.venue_name }}</text>
          <text class="tag">{{ detailData.labels }}</text>
        </view>
        <view class="time-text"
          >营业时间：{{ detailData.start_time }} ~
          {{ detailData.end_time }}</view
        >
      </view>
    </view>

    <!-- 2. 统计数据 -->
    <view class="stats-container">
      <view class="stat-item">
        <view class="num-box">
          <text class="stat-num">{{ stats.queue }}</text>
          <text class="stat-unit">人</text>
        </view>
        <text class="stat-label">总排队人数</text>
      </view>

      <view class="divider"></view>

      <!-- 项 2 -->
      <view class="stat-item">
        <view class="num-box">
          <text class="stat-num">{{ stats.online }}</text>
          <text class="stat-unit">辆</text>
        </view>
        <text class="stat-label">在线车辆</text>
      </view>

      <view class="divider"></view>

      <!-- 项 3 -->
      <view class="stat-item">
        <view class="num-box">
          <text class="stat-num">{{ stats.drive }}</text>
          <text class="stat-unit">辆</text>
        </view>
        <text class="stat-label">驾驶中</text>
      </view>
    </view>

    <view class="text">车辆列表</view>
    <!-- 3. 车辆列表 -->
    <view class="car-list">
      <view class="car-card" v-for="car in carList" :key="car.id">
        <!-- 状态标签 -->
        <view
          class="status-tag"
          :class="car.vehicle_state == 1 ? 'tag-green' : 'tag-blue'"
        >
          {{
            car.vehicle_state == 1 ? "空闲" : "排队" + car.vehicle_queue + "人"
          }}
        </view>

        <!-- 左侧图片区域 -->
        <view class="img-wrapper">
          <image
            class="car-img"
            :src="car.vehicle_image"
            mode="aspectFill"
          ></image>
          <view class="lock-mask" v-if="car.is_password == 1">
            <uni-icons type="locked" size="30" color="#ffffff"></uni-icons>
          </view>
        </view>

        <!-- 右侧信息区域 -->
        <view class="info-wrapper">
          <view class="top-row">
            <text class="car-name">{{ car.vehicle_name }}</text>
          </view>
          <view class="desc-row">
            <text class="label">车辆特点：</text>
            <text class="value">{{ car.vehicle_introduction }}</text>
          </view>
          <view class="desc-row">
            <text class="label">最高时速：</text>
            <text class="value">{{ car.top_speed || "0km/h" }}</text>
          </view>
          <view class="bottom-row">
            <text class="battery">车辆电量：{{ car.vehicle_battery }}</text>
            <button
              class="action-btn"
              :class="{ 'btn-disabled': car.vehicle_state == 2 }"
              :disabled="car.vehicle_state == 2"
              @click="handleDrive(car)"
            >
              我要驾驶
            </button>
          </view>
        </view>
      </view>
    </view>

    <TipModal
      title="用户驾驶协议"
      v-model:visible="agree"
      key="1"
      @confirm="handleAgree"
    >
      <template #content>
        <view class="custom-content">
          <view class="cont"> 禁止未成年人充值使用。 </view>
          <view class="cont">
            用户充值消费驾驶后不支持退余额，充值的金额只能在平台消费，如果排队没玩到车，保留到后面场地有车继续消费。
          </view>
          <view class="cont">
            车辆预约会扣费，如没排队上，预约取消会自动退回账户里。
          </view>
          <view class="cont"> 如有疑问请联系客服。 </view>
        </view>
      </template>
    </TipModal>

    <TipModal
      title="输入密码"
      v-model:visible="pwdVisible"
      key="2"
      @confirm="handlePwd"
    >
      <template #content>
        <view class="custom-input">
          <input
            class="input"
            type="password"
            maxlength="6"
            placeholder="请输入密码"
            v-model="password"
          />
        </view>
      </template>
    </TipModal>

    <TipModal
      title="车辆预约"
      v-model:visible="orderVisible"
      key="2"
      @confirm="gotoUrl"
    >
      <template #content>
        <view class="order-cont">
          <view class="img">
            <image
              class="car-image"
              :src="selectCar.vehicle_image"
              mode="aspectFill"
            />
          </view>
          <!-- 注意：请将 src 替换为你实际的图片路径或网络地址 -->

          <!-- 3. 主要状态文本 -->
          <text class="main-status"
            >已成功预约 {{ orderCar.vehicle_name }} 车辆</text
          >
          <text class="sub-status"
            >当前还有 {{ orderCar.people_number }} 人排队，请耐心等待</text
          >

          <!-- 4. 详情信息卡片 (灰色背景区域) -->
          <view class="info-card">
            <view class="info-item">
              <text class="label">预约类型：</text>
              <text class="value"
                >按{{
                  orderCar.billing_method == "0" ? "时间" : "次"
                }}计费</text
              >
            </view>
            <view class="info-item">
              <text class="label">预约时间：</text>
              <text class="value">{{ orderCar.time }}</text>
            </view>
          </view>

          <!-- 5. 提示语 -->
          <text class="tip-text">请在【我的-预约订单】中查看</text>
        </view>
      </template>
    </TipModal>

    <BillingPopup
      ref="billingPopupRef"
      :billData="billingMethod"
      @confirm="onBillingConfirm"
    />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import TipModal from "@/components/tip-modal/tip-modal.vue";
import BillingPopup from "@/components/billing-popup/billing-popup.vue";
import { GetVenueDetail, OrderCar } from "@/axios/index";

const title = ref("");
const stats = ref({ queue: 0, online: 0, drive: 0 });
const agree = ref(false);
const pwdVisible = ref(false);
const orderVisible = ref(false);
const password = ref("");
const billingPopupRef = ref(null);
const imageUrl = ref("");
const billingMethod = ref({});
const detailData = ref({
  venue_name: "",
  labels: "",
  start_time: "",
  end_time: "",
});
const selectCar = ref({
  vehicle_id: "",
  vehicle_name: "",
  venue_id: "",
  billing_rules: "",
  venue_name: "",
  vehicle_image: "",
});
const orderCar = ref({
  vehicle_name: "",
  time: "",
  payment_type: 1,
  billing_method: 0,
  order_no: "",
  transmitter_id: 0,
  people_number: 0,
});
const currentCar = ref({});
const carList = ref([]);

// 页面加载模拟
onLoad((options) => {
  // 模拟获取路由参数
  title.value = uni.getStorageSync("carTitle") || "车辆详情";
  uni.setNavigationBarTitle({
    title: uni.getStorageSync("carTitle"),
  });

  GetVenueDetail({ venue_id: options.id })
    .then((res) => {
      const { code, data, msg } = res;
      if (code === 200) {
        detailData.value = { ...data };
        stats.value.queue = data.queue;
        stats.value.online = data.online;
        stats.value.drive = data.drive;
        imageUrl.value = data.venue_image?.[0];
        carList.value = data.vehicle;
        billingMethod.value = data.venue_config;
        selectCar.value.venue_id = options.id;
        selectCar.value.venue_name = data.venue_name;
        uni.setStorageSync("wssUrl", data.content_url);
        uni.setStorageSync("wssPort", data.content_url_port);
      } else {
        uni.showToast({
          title: msg,
          icon: "none",
        });
      }
    })
    .catch((e) => {
      throw e;
    });
});

// 交互逻辑
const handleDrive = (item) => {
  currentCar.value = { ...item };
  agree.value = true;
};

const handlePwd = () => {
  if (password.value === currentCar.value.password) {
    pwdVisible.value = false;
    selectCar.value.vehicle_id = currentCar.value.id;
    selectCar.value.vehicle_name = currentCar.value.vehicle_name;
    selectCar.value.vehicle_image = currentCar.value.vehicle_image;
    billingPopupRef.value.open();
  } else {
    uni.showToast({
      title: "密码不正确",
      icon: "none",
    });
  }
};

const handleAgree = () => {
  agree.value = false;
  if (currentCar.value.is_password == 1) {
    pwdVisible.value = true;
    return;
  }
  if (currentCar.value.vehicle_state === "2") {
    uni.showToast({
      title: "该车正在排队中",
      icon: "none",
    });
    return;
  }
  selectCar.value.vehicle_id = currentCar.value.id;
  selectCar.value.vehicle_name = currentCar.value.vehicle_name;
  selectCar.value.vehicle_image = currentCar.value.vehicle_image;
  billingPopupRef.value.open();
};

const flag = ref(true);
const onBillingConfirm = (params) => {
  if (!flag.value) return;
  flag.value = false;
  const min = Math.pow(10, 7);
  const max = Math.pow(10, 8) - 1;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  OrderCar({
    vehicle_id: selectCar.value.vehicle_id,
    vehicle_name: selectCar.value.vehicle_name,
    venue_id: selectCar.value.venue_id,
    venue_name: selectCar.value.venue_name,
    billing_rules: params.selectedOpt,
    payment_type: params.unitType,
    billing_method: params.selectType == -1 ? 0 : 1,
    app_transmitter_id: randomNumber,
  })
    .then((res) => {
      if (res.code === 200) {
        orderCar.value = { ...res.data };
        orderVisible.value = true;
      }
    })
    .catch(() => {
      uni.showToast({
        title: "预约失败",
        icon: "none",
      });
    })
    .finally(() => {
      flag.value = true;
    });
};

const gotoUrl = () => {
  orderVisible.value = false;
  uni.navigateTo({
    url: "/pages/mine/reservation",
  });
};
</script>

<style lang="scss" scoped>
/* 全局容器 */
.page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 30rpx;
}

/* 1. 头部样式 */
.header-section {
  background-color: #ffffff;

  .banner-img {
    width: 100%;
    height: 340rpx !important;
    display: block;
  }

  .info-box {
    padding: 20rpx;

    .title-row {
      display: flex;
      align-items: center;

      .main-title {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 28rpx;
        color: #1a1a1a;
        margin-right: 10rpx;
      }

      .tag {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 20rpx;
        color: #3e77ac;
        padding: 2rpx 5rpx;
        background: #c7e0ff;
        border-radius: 4rpx;
      }
    }

    .time-text {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 20rpx;
      color: #666666;
    }
  }
}

/* 2. 统计栏样式 */
.stats-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: #ffffff;

  padding: 10rpx 0 20rpx 0;

  .stat-item {
    display: flex;
    flex-direction: column; // 保持上下结构：上面数字，下面文字
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  // 新增：数字和单位的容器
  .num-box {
    display: flex;
    flex-direction: row; // 数字和单位横向排列
    align-items: baseline; // 关键：让数字和单位底部对齐，视觉更整齐
  }

  .stat-num {
    font-family: DINAlternate, DINAlternate;
    font-weight: bold;
    font-size: 42rpx;
    color: #1a1a1a;
  }

  // 新增：单位的样式
  .stat-unit {
    font-size: 24rpx;
    color: #999999;
    margin-left: 4rpx; // 数字和单位之间的一点点间距
    margin-bottom: 4rpx; // 微调垂直位置，视字体而定
  }

  .stat-label {
    font-size: 24rpx;
    color: #999999;
    margin-top: 4rpx;
  }

  .divider {
    width: 1rpx;
    height: 40rpx;
    background-color: #f0f0f0;
  }
}

.text {
  padding: 20rpx;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
}

/* 3. 列表卡片样式 */
.car-list {
  padding: 0 20rpx;
  // margin-top: 20rpx;
}

.car-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  display: flex;
  padding: 20rpx;
  position: relative;
  overflow: hidden;

  .status-tag {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 22rpx;
    font-size: 20rpx;
    color: #fff;
    padding: 6rpx 15rpx;
    border-radius: 0rpx 16rpx 0rpx 16rpx;

    &.tag-green {
      background-color: #4cd964;
      /* 绿色 */
    }

    &.tag-blue {
      background-color: #007aff;
      /* 蓝色 */
    }
  }

  /* 图片区域 */
  .img-wrapper {
    width: 200rpx;
    height: 200rpx;
    margin-right: 30rpx;
    position: relative;
    border-radius: 12rpx;
    overflow: hidden;

    .car-img {
      width: 100%;
      height: 100%;
    }

    .lock-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      opacity: 0.6;
    }
  }

  /* 信息区域 */
  .info-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 10rpx;

    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .car-name {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        font-size: 28rpx;
        color: #222222;
      }
    }

    .desc-row {
      display: flex;
      margin-top: 10rpx;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 20rpx;
      color: #555555;

      .label {
        width: 100rpx;
      }

      .value {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .battery {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 20rpx;
        color: #555555;
      }

      .action-btn {
        background: #ffc838;
        /* 黄色按钮 */
        color: #333;
        font-size: 24rpx;
        font-weight: bold;
        padding: 0 30rpx;
        height: 60rpx;
        line-height: 60rpx;
        border-radius: 30rpx;
        margin: 0;
        /* 去除默认外边距 */

        &.btn-disabled {
          background-color: #cccccc;
          color: #666;
        }
      }
    }
  }
}

.custom-input {
  background: #f8f8f8;
  border-radius: 16rpx;

  .input {
    height: 90rpx;
    line-height: 1;
  }
}

.custom-content {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  font-size: 28rpx;
  color: #333333;

  .title {
    font-weight: 600;
  }

  .cont {
    display: block;
    text-align: left;
  }
}

.order-cont {
  .popup-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 30rpx;
  }

  .img {
    text-align: center;
  }

  /* 车辆图片 */
  .car-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    /* 圆形图片 */
    margin-bottom: 20rpx;
    background-color: #f0f0f0;
    /* 占位背景色 */
  }

  /* 主状态文本 */
  .main-status {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 10rpx;
    display: block;
  }

  /* 副状态文本 */
  .sub-status {
    font-size: 26rpx;
    color: #999999;
    margin-bottom: 30rpx;
    display: block;
  }

  /* 详情信息卡片 */
  .info-card {
    width: 100%;
    background-color: #f7f8fa;
    /* 浅灰背景 */
    border-radius: 12rpx;
    padding: 20rpx;
    box-sizing: border-box;
    margin-bottom: 20rpx;
  }

  .info-item {
    display: flex;
    font-size: 26rpx;
    margin-bottom: 10rpx;
    line-height: 1.6;
  }

  .info-item:last-child {
    margin-bottom: 0;
  }

  .label {
    color: #666666;
  }

  .value {
    color: #333333;
  }

  /* 底部提示语 */
  .tip-text {
    font-size: 24rpx;
    color: #999999;
    margin-bottom: 40rpx;
  }
}
</style>

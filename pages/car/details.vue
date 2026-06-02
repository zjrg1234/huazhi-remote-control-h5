<template>
  <view class="page">
    <!-- 1. 顶部背景图与基础信息 -->
    <view class="header-section">
      <image
        class="banner-img"
        src="https://via.placeholder.com/800x400"
        mode="widthFix"
      ></image>
      <view class="info-box">
        <view class="title-row">
          <text class="main-title">RC疯狂汽车城</text>
          <text class="tag">遥控车</text>
        </view>
        <text class="time-text">营业时间：00:00~24:00</text>
      </view>
    </view>

    <view class="stats-container">
      <!-- 项 1 -->
      <view class="stat-item">
        <!-- 新增 num-box 包裹数字和单位 -->
        <view class="num-box">
          <text class="stat-num">{{ stats.totalQueue }}</text>
          <text class="stat-unit">人</text>
        </view>
        <!-- 原有的标签保留 -->
        <text class="stat-label">总排队人数</text>
      </view>

      <view class="divider"></view>

      <!-- 项 2 -->
      <view class="stat-item">
        <view class="num-box">
          <text class="stat-num">{{ stats.onlineCars }}</text>
          <text class="stat-unit">辆</text>
        </view>
        <text class="stat-label">在线车辆</text>
      </view>

      <view class="divider"></view>

      <!-- 项 3 -->
      <view class="stat-item">
        <view class="num-box">
          <text class="stat-num">{{ stats.drivingCars }}</text>
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
          :class="car.status === 'idle' ? 'tag-green' : 'tag-blue'"
        >
          {{ car.status === "idle" ? "空闲" : "排队" + car.queueCount + "人" }}
        </view>

        <!-- 左侧图片区域 -->
        <view class="img-wrapper">
          <image class="car-img" :src="car.image" mode="aspectFill"></image>
          <view class="lock-mask" v-if="car.status === 'queue'">
            <uni-icons type="locked" size="30" color="#ffffff"></uni-icons>
          </view>
        </view>

        <!-- 右侧信息区域 -->
        <view class="info-wrapper">
          <view class="top-row">
            <text class="car-name">{{ car.name }}</text>
          </view>

          <view class="desc-row">
            <text class="label">车辆特点：</text>
            <text class="value">{{ car.features }}</text>
          </view>

          <view class="desc-row">
            <text class="label">最高时速：</text>
            <text class="value">{{ car.speed }}</text>
          </view>

          <view class="bottom-row">
            <text class="battery">车辆电量：{{ car.battery }}%</text>
            <!-- 按钮：根据状态改变样式 -->
            <button
              class="action-btn"
              :class="{ 'btn-disabled': car.status === 'queue' }"
              :disabled="car.status === 'queue'"
              @click="handleDrive(car)"
            >
              我要驾驶
            </button>
          </view>
        </view>
      </view>
    </view>

    <TipModal title="用户驾驶协议" v-model:visible="agree" key="1" @confirm="handleAgree">
      <template #content>
        <view class="custom-content">
          <text> 华制远控驾驶协议：</text>

          用户充值消费驾驶玩后不支持退余额， 充值的金额只能在平台消费，
          如排队没玩到车保留到后面场地有车继续消费。
          预约会扣费，如没排队上预约取消会自动退回账户里
          如有疑问联系客服。禁止未成年充值使用
        </view>
      </template>
    </TipModal>


    <TipModal title="输入密码" v-model:visible="pwdVisible" key="2" @confirm="handlePwd">
      <template #content>
        <view class="custom-input">
			<input class="input" type="password" maxlength="6" 
            placeholder="请输入密码" v-model="password" />
        </view>
      </template>
    </TipModal>

  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import TipModal from "@/components/tip-modal/tip-modal.vue";
// --- 1. 模拟数据 ---
const stats = reactive({
  totalQueue: 8,
  onlineCars: 32,
  drivingCars: 8,
});

const agree = ref(false);
const pwdVisible = ref(true);
const password = ref('');

// 车辆列表数据
const carList = ref([
  {
    id: 1,
    name: "1号牧马人",
    image: "https://via.placeholder.com/150", // 替换为真实图片URL
    features: "黑色敞篷车，霸气甩尾",
    speed: "30km/h",
    battery: 90,
    status: "idle", // idle: 空闲, queue: 排队中
    queueCount: 0,
  },
  {
    id: 2,
    name: "1号牧马人",
    image: "https://via.placeholder.com/150",
    features: "黑色敞篷车，霸气甩尾",
    speed: "30km/h",
    battery: 90,
    status: "queue",
    queueCount: 1,
  },
  {
    id: 3,
    name: "1号牧马人",
    image: "https://via.placeholder.com/150",
    features: "黑色敞篷车，霸气甩尾",
    speed: "30km/h",
    battery: 90,
    status: "idle",
    queueCount: 0,
  },
]);

// --- 2. 页面生命周期 ---
onLoad((options) => {
  // 这里可以根据 options.id 请求后台获取真实数据
  console.log("页面加载，获取车辆列表...");
  uni.setNavigationBarTitle({
    title: "车辆1",
  });
});

// --- 3. 交互逻辑 ---
const handleDrive = (car) => {
  if (car.status === "queue") {
    // 理论上按钮已禁用，这里是双重保险
    uni.showToast({ title: "该车正在排队中", icon: "none" });
    return;
  }

  // 空闲状态点击
  uni.showModal({
    title: "确认驾驶",
    content: `是否确认驾驶【${car.name}】？`,
    success: function (res) {
      if (res.confirm) {
        console.log("用户点击确定，跳转驾驶页面或请求接口");
        // 模拟操作
        uni.showToast({ title: "连接车辆中...", icon: "loading" });
        // uni.navigateTo({ url: '/pages/drive/index?id=' + car.id })
      }
    },
  });
};


const handlePwd = () => {
    pwdVisible.value = false;
}

const handleAgree = () => {
    agree.value = false
}
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
    height: 340rpx;
    display: block;
  }

  .info-box {
    padding: 20rpx;

    .title-row {
      display: flex;
      align-items: center;

      .main-title {
        font-family: PingFangSC, PingFang SC;
        font-weight: 500;
        font-size: 28rpx;
        color: #1a1a1a;
        margin-right: 10rpx;
      }

      .tag {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 20rpx;
        color: #3e77ac;
        padding: 2rpx 5rpx;
        background: #c7e0ff;
        border-radius: 4rpx;
      }
    }

    .time-text {
      font-family: PingFangSC, PingFang SC;
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
  font-family: PingFangSC, PingFang SC;
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
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 28rpx;
        color: #222222;
      }
    }

    .desc-row {
      display: flex;
      margin-top: 10rpx;
      font-family: PingFangSC, PingFang SC;
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
      margin-top: 20rpx;

      .battery {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 20rpx;
        color: #555555;
      }

      .action-btn {
        background-color: #f1c40f;
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

    background: #F8F8F8;
    border-radius: 16rpx;
    .input {
        height: 90rpx;
        line-height: 1;
    }
}
</style>
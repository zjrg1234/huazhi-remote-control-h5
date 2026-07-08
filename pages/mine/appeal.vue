<template>
  <view class="page">
    <!-- 预约列表 -->
    <view class="list">
      <view
        class="item"
        v-for="(item, index) in list"
        :key="index"
        :class="{ active: item.reservation_status === 'done' }"
      >
        <!-- 信息行 -->
        <view class="info-line">
          <text class="label">预约编号：</text>
          <text class="value">{{ item.order_no }}</text>
          <image
            class="copy-icon"
            src="/static/images/common/icon_copy@2x.png"
            mode="aspectFill"
            @click="copyOrderNo(item.order_no)"
          />
        </view>
        <view class="info-line">
          <text class="label">预约类型：</text>
          <text class="value">{{ payFillText(item.billing_method) }}</text>
        </view>
        <view class="info-line">
          <text class="label">预约场地：</text>
          <text class="value">{{ item.venue_name }}</text>
        </view>
        <view class="info-line">
          <text class="label">预约时间：</text>
          <text class="value">{{ formatDate(item.time) }}</text>
        </view>
        <view class="info-line">
          <text class="label">预约状态：</text>
          <text class="value">{{ appealStatus(item.appeal_status) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
import { formatDate } from "@/utils/utils.js";
import { GetAppealList } from "@/axios/mine.js";
// 模拟数据
const list = ref([]);
const loading = ref(false);

// 初始化加载
onLoad(() => {
  fetchData();
});

// 下拉刷新触发
onPullDownRefresh(() => {
  fetchData(true);
});

const appealStatus = (type) => {
  //"appeal_status": 2,申诉状态 0未申请 1待处理 2已处理
  return {
    0: "未申请",
    1: "待处理",
    2: "已处理",
  }[type];
};
// 获取列表数据
const fetchData = async (isRefresh = false) => {
  if (loading.value) return;
  loading.value = true;

  if (isRefresh) {
    list.value = [];
  }

  // 模拟接口请求
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 生成模拟数据
  list.value = [
    {
      id: 1,
      uid: 9,
      order_no: "aaacasd13213121", //预约号
      venue_id: 1,
      venue_name: "测试", //场地名称
      billing_method: 0, //计费方式 0按时间 1按次
      appeal_status: 2, //申诉状态 0未申请 1待处理 2已处理
      time: 1766747094, //时间
    },
  ];

  loading.value = false;
  uni.stopPullDownRefresh(); // 结束下拉刷新动画
};

// 复制预约编号
const copyOrderNo = (text) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({
        title: "已复制",
        icon: "success",
      });
    },
  });
};

// 按钮点击事件
const handleBtnClick = (item) => {
  if (item.btnText === "开始驾驶") {
    uni.showToast({
      title: "开始驾驶",
      icon: "none",
    });
  } else if (item.btnText === "申诉") {
    uni.showToast({
      title: "申诉功能",
      icon: "none",
    });
  }
};

const payFillText = (type) => {
  return {
    0: "按时间计费",
    1: "按次计费",
  }[type];
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f2f4f7;
}

.page {
  padding: 20rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.item {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  position: relative;
  overflow: hidden;

  .info-line {
    display: flex;
    align-items: center;
    margin: 10rpx 0;

    .label {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 24rpx;
      color: #777777;
    }

    .value {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 24rpx;
      color: $uni-color-1;
      margin-left: 8rpx;
    }

    .copy-icon {
      width: 32rpx;
      height: 32rpx;
      margin-left: 10rpx;
    }
  }
}
</style>

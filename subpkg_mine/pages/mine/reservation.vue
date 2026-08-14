<template>
  <view class="page">
    <!-- #ifdef H5 -->
    <NavBar title="我的预约" url="/pages/mine/index" flag="1"></NavBar>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <custom-nav-bar title="我的预约" url="/pages/mine/index" flag="1"></custom-nav-bar>
    <!-- #endif -->

    <view class="main-cont">
      <scroll-view class="list-scroll" scroll-y :refresher-enabled="true"  refresher-default-style="none" :refresher-triggered="isRefreshing"
        :refresher-threshold="60" @refresherpulling="onPulling" @refresherrefresh="onRefresh" @scrolltolower="loadMore">
        <!-- ✅ 自定义下拉刷新插槽（仅汉字，无省略号） -->
        <view slot="refresher" class="custom-refresher">
          <text class="refresh-text">{{ tipText }}</text>
        </view>

        <!-- 预约列表 -->
        <view class="list">
          <view class="item" v-for="(item, index) in list" :key="item.order_no || index"
            :class="{ active: item.reservation_status === 4 }">
            <!-- 状态角标 -->
            <view class="corner-tag" :class="item.reservation_status">
              <image class="image" v-if="item.vehicle_state == 1" :src="statusMap[item.reservation_status]"
                mode="aspectFill"></image>
              <image class="image" v-if="item.vehicle_state == 2" :src="statusMap[2]" mode="aspectFill"></image>
            </view>

            <!-- 标题 -->
            <view class="title">
              <text class="name">{{ item.vehicle_name }}</text>
            </view>

            <!-- 信息行 -->
            <view class="info-line">
              <text class="label">预约编号：</text>
              <text class="value">{{ item.order_no }}</text>
              <image class="copy-icon" src="/static/images/common/icon_copy@2x.png" mode="aspectFill"
                @click="copyOrderNo(item.order_no)" />
            </view>
            <view class="info-line">
              <text class="label">预约类型：</text>
              <text class="value">{{ billingMethod(item.billing_method) }}</text>
            </view>
            <view class="info-line">
              <text class="label">预约场地：</text>
              <text class="value">{{ item.venue_name }}</text>
            </view>
            <view class="info-line">
              <text class="label">预约时间：</text>
              <text class="value">{{ formatDate(item.order_time) }}</text>
            </view>
            <view class="info-line" v-if="item.reservation_status == 4 && item.is_reservation == 1">
              <text class="label">如果不能驾驶可以向平台发起</text>
            </view>

            <template v-if="item.vehicle_state == 1">
              <view class="btn-wrap bmt" v-if="item.reservation_status == 1 || item.reservation_status == 2">
                <button class="btn" @click="handleAction(item)">开始驾驶</button>
              </view>

              <view class="btn-wrap bmt" v-if="item.reservation_status == 3">
                <button class="btn" @click="overDrive(item)">结束驾驶</button>
              </view>

              <view class="btn-wrap bmc" v-if="item.reservation_status == 1 || item.reservation_status == 2">
                <button class="btn" @click="cancelOrder(item)">取消预约</button>
              </view>

              <view class="btn-wrap bt" v-if="item.reservation_status == 4 && item.is_reservation == 1">
                <button class="btn" @click="handleAppeal(item)">申诉</button>
              </view>
            </template>

            <template v-if="item.vehicle_state != 1">
              <view class="btn-wrap bmt">
                <button class="btn" @click="handleAction(item)">等待中</button>
              </view>
            </template>
          </view>

          <!-- 加载状态提示 -->
          <view class="loading-tips" v-if="loadingMore">
            <text>加载中</text>
          </view>
          <view class="loading-tips" v-if="!hasMore && list.length > 0">
            <text>没有更多了</text>
          </view>
          <view class="loading-tips" v-if="!loading && list.length === 0">
            <text>暂无预约记录</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onPageShow } from "@dcloudio/uni-app";

import { formatDate } from "../utils/utils.js";
import { GetReservationList } from "@/axios/mine";
import { GetCarDetails, CancelReservation } from "@/axios/index";
import { billingMethod } from "../utils/filter.js";
import { StartDrive, CheckCar, LockCar } from "@/axios/index.js";

// #ifdef H5
import NavBar from "@/components/nav-bar/nav-bar.vue";
// #endif

const statusMap = {
  1: "/static/images/reservation/icon_waiting@2x.png",
  2: "/static/images/reservation/icon_waiting@2x.png",
  5: "/static/images/reservation/icon_canceled@2x.png",
  3: "/static/images/reservation/icon_driving@2x.png",
  4: "/static/images/reservation/icon_completed@2x.png",
};

const list = ref([]);
const page = ref(1);
const pageSize = 10;
const hasMore = ref(true);
const loading = ref(false);
const loadingMore = ref(false);

// ✅ 下拉刷新状态（仅保留必要变量）
const isRefreshing = ref(false);
const tipText = ref("下拉刷新");

onPageShow(() => {
  fetchData();
});

// ✅ 拉动过程：根据距离切换汉字
const onPulling = (e) => {
  if (isRefreshing.value) return;
  const dy = e.detail.dy;
  // tipText.value = dy >= 60 ? "释放刷新" : "下拉刷新";
  tipText.value = dy >= 60 ? "下拉刷新" : "下拉刷新";
};

// ✅ 触发刷新
const onRefresh = async () => {
  isRefreshing.value = true;
  tipText.value = "刷新中";
  await refreshData();
  isRefreshing.value = false;
  tipText.value = "下拉刷新";
};

const refreshData = async () => {
  page.value = 1;
  hasMore.value = true;
  list.value = [];
  await fetchData();
};

const loadMore = () => {
  if (hasMore.value && !loading.value && !loadingMore.value) {
    page.value++;
    fetchData();
  }
};

const fetchData = async () => {
  const isLoadMore = page.value > 1;
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }

  try {
    const params = { page: page.value, pageSize };
    const { data } = await GetReservationList(params);
    const content = data?.content || [];

    if (isLoadMore) {
      list.value = list.value.concat(content);
    } else {
      list.value = content;
    }
    hasMore.value = content.length >= pageSize;
  } catch (error) {
    console.error("获取预约列表失败:", error);
    if (page.value > 1) page.value--;
    uni.showToast({ title: "加载失败", icon: "none" });
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const copyOrderNo = (text) => {
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: "已复制", icon: "success" }),
  });
};

const flag = ref(false);
const handleAction = async (item) => {
  if (flag.value) return;
  flag.value = true;

  const { code, msg } = await CheckCar({ vehicle_id: item.vehicle_id });
  if (code != 200) {
    uni.showToast({ title: msg, icon: "none" });
    flag.value = false;
    return;
  }

  const res = await LockCar({ vehicle_id: item.vehicle_id });
  if (res.code != 200) {
    uni.showToast({ title: res.msg, icon: "none" });
    flag.value = false;
    return;
  }

  GetCarDetails({ id: item.vehicle_id })
    .then((res) => {
      if (res.code == 200) {
        uni.setStorageSync("app_id", item.app_transmitter_id);
        uni.removeStorageSync("loadingOne");
        uni.setStorageSync("carInfo", JSON.stringify(item));
        uni.setStorageSync("carDetails", JSON.stringify(res.data));
        uni.navigateTo({
          url: `/subpkg_drive/pages/drive/index?order_no=${item.order_no}&vehicle_id=${item.vehicle_id}`,
          animationType: "none",
          animationDuration: 0,
        });
      } else {
        uni.showToast({ title: "联系客服，报错原因：" + res.msg, icon: "none" });
      }
    })
    .finally(() => {
      flag.value = false;
    });
};

const handleAppeal = (item) => {
  if (item.reservation_status == 4 && item.is_reservation == 1) {
    uni.navigateTo({
      url: "/subpkg_mine/pages/mine/orderAppeal?order_no=" + item.order_no,
    });
  }
};

const overDrive = (item) => {
  StartDrive({ order_no: item.order_no, type: 3, vehicle_id: item.vehicle_id }, true)
    .then((res) => {
      if (res.code == 200) {
        uni.showToast({ title: "结束驾驶成功", icon: "success" });
      } else {
        uni.showToast({ title: res.msg, icon: "none" });
      }
      refreshData();
    })
    .catch();
};

const cancelOrder = (item) => {
  CancelReservation({ order_no: item.order_no })
    .then((res) => {
      if (res.code == 200) {
        uni.showToast({ title: "取消预约成功", icon: "success" });
        fetchData();
      } else {
        uni.showToast({ title: res.msg, icon: "none" });
      }
    })
    .catch();
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f2f4f7;
}

.page {
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-cont {
  flex: 1;
  padding: 20rpx;
  background-color: #f2f4f7;
  overflow: hidden;
}

.list-scroll {
  height: 100%;
}

/* ✅ 自定义下拉刷新样式 */
.custom-refresher {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100rpx;
  width: 100%;

  .refresh-text {
    font-size: 26rpx;
    color: #999;
  }
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.item {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 20rpx 0 20rpx;
  position: relative;
  overflow: hidden;

  .corner-tag {
    position: absolute;
    top: 0;
    right: 0;
    width: 84rpx;
    height: 84rpx;
    overflow: hidden;
    z-index: 1;

    .image {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .title {
    margin-bottom: 20rpx;

    .name {
      font-family: PingFangSC, PingFang SC;
      font-weight: 500;
      font-size: 28rpx;
      color: #1A1A1A;
    }
  }

  .info-line {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .label {
     font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 24rpx;
      color: #777777;
    }

    .value {
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 24rpx;
      margin-left: 10rpx;
      color: #1A1A1A;
    }

    .copy-icon {
      width: 32rpx;
      height: 32rpx;
      margin-left: 10rpx;
    }
  }

  .btn-wrap {
    position: absolute;
    right: 20rpx;
    min-width: 140rpx;

    .btn {
      text-align: center;
      background: #ffc838;
      border-radius: 12rpx;
      border: none;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 24rpx;
      color: #1a1a1a;
    }
  }

  .bt {
    bottom: 20rpx;
  }

  .bmt {
    bottom: 90rpx;
  }

  .bmc {
    bottom: 20rpx;

    .btn {
      color: #fff;
      background-color: #999;
    }
  }
}

.loading-tips {
  text-align: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
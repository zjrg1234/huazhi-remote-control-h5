<template>
  <view class="page">
    <!-- ✅ 使用 scroll-view 包裹列表区域 -->
    <scroll-view scroll-y class="list-scroll-view" refresher-enabled  refresher-default-style="none"
      :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh" @scrolltolower="onLoadMore">

      <view slot="refresher" class="custom-refresher">
        <text class="refresh-text">{{ isRefreshing ? '正在刷新...' : '下拉刷新' }}</text>
      </view>
      <!-- 预约列表 -->
       <!-- 2. 无数据空状态 -->
			
			<view class="empty-box" v-if="!loading && list.length === 0">
				<image class="empty-img" src="/static/images/common/car@2x.png" mode="widthFix"></image>
				<text class="empty-text">暂时没有内容哦～</text>
			</view>

      <view class="list">

        <view class="item" v-for="(item, index) in list" :key="index"
          :class="{ active: item.reservation_status === 'done' }">
          <!-- 信息行 -->
          <view class="info-line">
            <text class="label">预约编号：</text>
            <text class="value">{{ item.order_no }}</text>
            <image class="copy-icon" src="/static/images/common/icon_copy@2x.png" mode="aspectFill"
              @click="copyOrderNo(item.order_no)" />
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
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { formatDate } from "../utils/utils.js";
import { GetAppealList } from "@/axios/mine.js";

// 数据定义
const list = ref([]);
const loading = ref(false);
const isRefreshing = ref(false);
const page = ref(1); // ✅ 新增：当前页码

// 初始化加载
onLoad(() => {
  fetchData();
});

// ✅ 下拉刷新事件
const onRefresh = async () => {
  isRefreshing.value = true;
  page.value = 1; // 重置页码为 1
  list.value = []; // 清空列表
  await fetchData(true);
  isRefreshing.value = false;
};

// ✅ 上拉加载更多事件
const onLoadMore = async () => {
  if (loading.value) return; // 防止重复加载
  page.value++; // 页码自增
  await fetchData(false);
};

// 状态文本映射
const appealStatus = (type) => {
  return {
    0: "未申请",
    1: "待处理",
    2: "已处理",
  }[type];
};

const payFillText = (type) => {
  return {
    0: "按时间计费",
    1: "按次计费",
  }[type];
};

// 获取列表数据
const fetchData = async (isRefresh = false) => {
  if (loading.value) return;
  loading.value = true;

  try {

    if (isRefresh) {
      await nextTick(() => {
        list.value = []
      });
    }
    const res = await GetAppealList({
      page: page.value, // ✅ 使用动态页码
    });

    if (res.code === 200 && res.data) {
      if (isRefresh) {
        // 下拉刷新：直接覆盖列表
        list.value = res.data.content;
      } else {
        // 上拉加载：追加数据到列表末尾
        list.value = [...list.value, ...res.data.content];
      }
    }
  } catch (error) {
    console.error("获取数据失败", error);
  } finally {
    loading.value = false;
  }
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
</script>

<style lang="scss" scoped>
page {
  background-color: #fff;
  height: 100%;
}

.page {
  padding: 20rpx;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 自定义刷新样式 */
.custom-refresher {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60rpx;
  width: 100%;
  text-align: center;
  .refresh-text { font-size: 26rpx; color: #999; }
}

/* ✅ 核心样式：scroll-view 必须有固定高度才能滚动 */
.list-scroll-view {
  flex: 1;
  height: 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.item {
  background: #f2f4f7;
  border-radius: 16rpx;
  padding: 20rpx;
  position: relative;
  overflow: hidden;

  .info-line {
    display: flex;
    align-items: center;
    margin: 10rpx 0;

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

	/* 空状态 */
	.empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 150rpx 0;

		.empty-img {
      display: block;
			width: 70%;
			height: 100%;
		}
		.empty-text {
			margin-top: 20rpx;
			font-size: 26rpx;
			color: #999;
		}
	}

</style>
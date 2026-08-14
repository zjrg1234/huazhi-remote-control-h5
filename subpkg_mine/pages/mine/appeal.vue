<template>
  <view class="page">
    <view class="main-cont">
      <!-- ✅ 修复1: scroll-view 必须有明确的高度才能触发下拉刷新 -->
      <scroll-view 
        class="list-scroll-view" 
        scroll-y 
        refresher-enabled 
        refresher-default-style="none"
        :refresher-triggered="isRefreshing" 
        @refresherrefresh="onRefresh" 
        @scrolltolower="onLoadMore"
      >
        <!-- 自定义下拉刷新插槽 -->
        <view slot="refresher" class="custom-refresher">
          <text class="refresh-text">{{ isRefreshing ? '正在刷新...' : '下拉刷新' }}</text>
        </view>

        <!-- 空状态 -->
        <view class="empty-box" v-if="!loading && list.length === 0">
          <image class="empty-img" src="/static/images/common/car@2x.png" mode="widthFix"></image>
          <text class="empty-text">暂时没有内容哦～</text>
        </view>

        <!-- 列表内容 -->
        <view class="list">
          <view 
            class="item" 
            v-for="(item, index) in list" 
            :key="item.order_no || index" 
            :class="{ active: item.reservation_status === 'done' }"
          >
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
              <text class="value">{{ item.platform_reply }}</text>
            </view>
          </view>
        </view>

        <!-- 底部加载状态提示 -->
        <view class="loading-tips" v-if="list.length > 10">
          {{ loading ? '加载中...' : '没有更多了' }}
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onPageShow } from "@dcloudio/uni-app";
import { GetAppealList } from "@/axios/mine.js";
import { formatDate } from "../utils/utils.js";

const list = ref([]);
const loading = ref(false);
const isRefreshing = ref(false);
const page = ref(1);
const hasMore = ref(true); // ✅ 新增：防止无数据时重复请求

// 初始化加载
onPageShow(() => {
  fetchData(true);
});

// ✅ 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true;
  page.value = 1;
  hasMore.value = true;
  await fetchData(true);
  isRefreshing.value = false; // 确保无论成功失败都关闭刷新动画
};

// ✅ 上拉加载更多
const onLoadMore = async () => {
  if (loading.value || !hasMore.value) return;
  page.value++;
  await fetchData(false);
};

const payFillText = (type) => ({ 0: "按时间计费", 1: "按次计费" }[type] || "未知");

// ✅ 统一数据获取逻辑
const fetchData = async (isRefresh = false) => {
  if (loading.value) return;
  loading.value = true;

  try {
    const res = await GetAppealList({ page: page.value });

    if (res.code === 200 && res.data) {
      const content = res.data.content || [];
      
      if (isRefresh) {
        list.value = content; // ✅ 移除多余的 nextTick 清空操作
      } else {
        list.value = [...list.value, ...content];
      }

      // ✅ 判断是否还有更多数据
      hasMore.value = content.length >= (res.data.pageSize || 10);
    }
  } catch (error) {
    console.error("获取数据失败", error);
    // 加载失败时回退页码，避免跳过数据
    if (!isRefresh) page.value--;
  } finally {
    loading.value = false;
  }
};

const copyOrderNo = (text) => {
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: "已复制", icon: "success" }),
  });
};
</script>

<style lang="scss" scoped>



.page {
  height: 100vh;       /* ✅ 必须给页面固定高度 */
  display: flex;
  flex-direction: column;
  background-color: #f2f4f7;
}

.main-cont {
  flex: 1;             /* ✅ 撑满剩余空间 */
  overflow: hidden;    /* ✅ 防止外层滚动 */
  padding: 20rpx;
}

/* ✅ 核心修复：scroll-view 必须有明确高度 */
.list-scroll-view {
  height: 100%;        /* 继承 main-cont 的高度 */
  width: 100%;
}

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

.loading-tips {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
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
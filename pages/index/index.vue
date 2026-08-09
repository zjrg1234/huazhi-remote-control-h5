<template>
  <view class="container">
    <!-- 顶部 Banner -->
    <view class="banner-section">
      <image :src="imgUrl" mode="scaleToFill" class="banner-img" lazy-load></image>
    </view>

    <!-- 分类导航栏 (Sticky 吸顶 + 横向滚动) -->
<view class="nav">
     <view class="sticky-nav-wrapper">
      <scroll-view
        scroll-x
        class="nav-scroll"
        :show-scrollbar="false"
        enable-flex
      >
        <view class="nav-list">
          <view
            v-for="(item, index) in categories"
            :key="index"
            class="nav-item"
            :class="{ active: currentCategory === item.id }"
            @click="handleCategoryClick(item)"
          >
            {{ item.name }}
          </view>
        </view>
      </scroll-view>
    </view>
</view>
  


 

    <!-- ✅ 核心改动：使用 scroll-view 包裹瀑布流区域 -->
    <scroll-view
      scroll-y
      class="waterfall-scroll"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      refresher-default-style="none"
      
      @refresherrefresh="onRefresh"
    >
      <!-- 自定义下拉刷新插槽 -->
      <view slot="refresher" class="custom-refresher">
        <text class="refresh-text">{{ isRefreshing ? '正在刷新...' : '下拉刷新' }}</text>
      </view>

      <!-- 骨架屏 -->
  <view v-if="loading && leftList.length === 0 && rightList.length === 0" class="skeleton-wrapper">
    <view class="column col-left">
          <SkeletonCard :key="'s-left-4'" />
          <SkeletonCard v-for="i in 3" :key="'s-left-' + i" cardHeight="540rpx" />
    </view>
    <view class="column col-right">
      <SkeletonCard v-for="i in 4" :key="'s-right-' + i" cardHeight="540rpx" />
    </view>
  </view>

    <!-- 瀑布流列表区域 -->
    <view v-else class="waterfall-container">
        <view v-if="leftList.length === 0 && rightList.length === 0 && !loading" class="empty-state">
          <image class="empty-img" src="/static/images/common/car@2x.png" mode="widthFix"></image>
          <text class="empty-text">暂时没有内容哦～</text>
      </view>

      <!-- 左列 -->
      <view class="column col-left">
        <view
          v-for="(item, index) in leftList"
          :key="'left-' + index"
          class="card-item"
          @click="handleCar(item)"
        >
            <image :src="item.venue_image[0]" mode="scaleToFill" class="card-img" lazy-load></image>
          <view class="meta">
            <text class="status online"></text>
              <text>在线{{ item.online }}</text>
            <text class="divider">|</text>
            <text class="drivers">驾驶{{ item.driving }}</text>
          </view>
          <view class="card-info">
            <view class="title-tags">
              <text class="title">{{ item.venue_name }}</text>
              <text class="tag">{{ item.labels }}</text>
            </view>
            <view class="num">
                <image src="/static/images/common/icon_queue@2x.png" mode="widthFix" class="icon" lazy-load></image>
              <text class="text"> {{ item.online }}人排队</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 右列 -->
      <view class="column col-right">
        <view
          v-for="(item, index) in rightList"
          :key="'right-' + index"
          class="card-item"
          @click="handleCar(item)"
        >
            <image :src="item.venue_image[0]" mode="scaleToFill" class="card-img" lazy-load></image>
          <view class="meta">
            <text class="status online"></text>
            <text>在线{{ item.online }}</text>
            <text class="divider">|</text>
            <text class="drivers">驾驶{{ item.driving }}</text>
          </view>
          <view class="card-info">
            <view class="title-tags">
              <text class="title">{{ item.venue_name }}</text>
              <text class="tag">{{ item.labels }}</text>
            </view>
            <view class="num">
                <image src="/static/images/common/icon_queue@2x.png" mode="widthFix" class="icon" lazy-load></image>
              <text class="text">{{ item.queue }}人排队</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态提示 -->
    <!-- <view class="loading-status">
      <text v-if="loading">加载中...</text>
      <text v-else-if="noMore">没有更多了</text>
    </view> -->
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { throttle } from "@/utils/system.js"; // 引用封装好的节流函数
import { GetHomeBanner, GetHomeTabTitle, GetHomeDataList } from "@/axios/index";


import SkeletonCard from '@/components/skeleton-card/skeleton-card.vue'

// --- 数据定义 ---
const categories = ref([]);
const currentCategory = ref("");

const leftList = ref([]);
const rightList = ref([]);
const page = ref(1);
const loading = ref(false);
const noMore = ref(false);
const imgUrl = ref("");
const isRefreshing = ref(false); // ✅ 控制刷新状态

// --- 模拟接口请求 ---
const fetchData = async (isRefresh = false) => {
  if (loading.value || noMore.value) return;

  loading.value = true;
  if (isRefresh) {
    page.value = 1;
    noMore.value = false;
    await nextTick(() => {
      leftList.value = [];
      rightList.value = [];
    });
  }

  try {
    const { code, data: { venueList } } = await GetHomeDataList({ type: currentCategory.value, size: 9999 });
    if (code == 200 && venueList.length) {
       // 简单的左右分发逻辑
      venueList.forEach((item, index) => {
        if (index % 2 === 0) {
          leftList.value.push(item);
        } else {
          rightList.value.push(item);
        }
      });
    } else if (isRefresh) {
      noMore.value = true;
    }
    
  } catch (error) {
    console.error("获取数据失败", error);
  } finally {
    loading.value = false;
  }
};

// ✅ 自定义下拉刷新逻辑
const onRefresh = async () => {
  isRefreshing.value = true;
  try {
    await fetchData(true);
  } finally {
    isRefreshing.value = false; // 数据加载完成后关闭刷新动画
  }
};

// --- 事件处理 (应用节流) ---

// 分类点击节流 (300ms内只能点一次)
const handleCategoryClick = throttle((item) => {

  if (currentCategory.value === item.id) return;
  currentCategory.value = item.id;
  noMore.value = false;
  // 切换分类时重新加载第一页
  fetchData(true);
}, 300);

const handleCar = (item) => {
  uni.setStorageSync('carTitle', item.venue_name)
  uni.navigateTo({ url: '/subpkg_car/pages/car/index?id=' + item.id })
}

// --- 生命周期 ---
onLoad(() => {
  categories.value = [{ name: "全部", id: "" }];
  GetHomeBanner().then((res) => { imgUrl.value = res.data[0]?.image; }).catch(() => {});
  GetHomeTabTitle().then((res) => { categories.value = [...categories.value, ...res.data]; }).catch(() => {});
  fetchData();
});
</script>

<style lang="scss" scoped>
/* 全局容器：必须使用 flex 布局撑满屏幕 */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;

}

/* Banner 区域 */
.banner-section {
  width: 100%;
  overflow: hidden;
  height: 300rpx;
  flex-shrink: 0; /* 防止被压缩 */
  .banner-img { 
    width: 100%; 
    height: 100%; 
    display: block; 
}
}

.nav {
  margin-top: -20rpx;
}

/* 导航栏核心样式 (重点修改部分) */
.sticky-nav-wrapper {
  position: sticky;
  top: -10rpx;
  z-index: 99;
  background-color: #fff;
  box-shadow: 0rpx -4rpx 20rpx 0rpx rgba(0, 0, 0, 0.1);
  border-radius: 40rpx 40rpx 0rpx 0rpx;
  margin-top: -10rpx;
  flex-shrink: 0; /* 防止被压缩 */
  border-bottom: 1rpx solid #f6f6f6;
}


.nav-scroll { width: 100%; white-space: nowrap; }
.nav-list { display: inline-flex; padding: 0 20rpx; height: 88rpx; align-items: center; }
.nav-item {
  display: inline-block; padding: 0 30rpx; font-size: 28rpx; color: #777; position: relative; flex-shrink: 0; line-height: 88rpx;
  &.active {
    color: #1A1A1A; font-weight: bold; font-size: 30rpx;
    &::after { content: ""; position: absolute; bottom: 10rpx; left: 50%; transform: translateX(-50%); width: 30rpx; height: 6rpx; background-color: #000; border-radius: 3rpx; }
    }
  }

/* ✅ 核心样式：scroll-view 必须占据剩余空间 */
.waterfall-scroll {
  flex: 1;
  height: 0; /* 兼容部分小程序端的 flex 布局 bug */
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

/* 瀑布流布局 */
.waterfall-container {
  display: flex;
  padding: 10rpx;
  padding-top: 20rpx;
  gap: 10rpx;
  /* 列间距 */
  background-color: #fff;

  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    /* 卡片上下间距 */
  }
}

.col-left {
  .card-item {
    &:first-child {
      height: 400rpx;

      .card-img {
        width: 100%;
        display: block;
        height: 400rpx !important;
      }
    }
  }
}

/* 卡片样式 */
.card-item {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

  background: #e9e9e9;
  border-radius: 8rpx;
  height: 540rpx;
  .card-img {
    height: 100%;
    width: 100%;
    display: block;
    position: absolute;
  }

  .card-info {
    padding: 10rpx;
    position: absolute;
    bottom: 0;

    .title-tags {
      margin-bottom: 10rpx;
      display: flex;
      align-items: center;

      .title {
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 38rpx;
        color: #ffffff;
        text-align: center;
         // 单行省略
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 250rpx;
      }

      .tag {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 20rpx;
        color: #1a1a1a;
        padding: 0 5rpx;
        background: #fee2a2;
        border-radius: 4rpx;
        margin-left: 15rpx;
      }
    }

    .num {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .icon {
        width: 20rpx;
        height: 20rpx;
        display: block;
      }
      .text {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 22rpx;
        color: #ffc838;
        margin-left: 10rpx;
      }
    }
  }

  .meta {
    position: absolute;
    right: 10rpx;
    top: 10rpx;
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 20rpx;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 24rpx;
    color: #ffffff;
    padding: 2rpx 10rpx;

    .online {
      width: 8rpx;
      height: 8rpx;
      border-radius: 50%;
      margin-right: 10rpx;
      background: #15cb50;
    }

    .divider {
      margin: 0 10rpx;
      color: #ddd;
    }
  }
}

.loading-status {
  text-align: center;
  padding: 30rpx 0;
  font-size: 26rpx;
  color: #999;
}

/* 空状态样式 */
.empty-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .empty-img {
    width: 300rpx; /* 根据你的实际图片大小调整 */
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.skeleton-wrapper {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  .column {
    width: 48%;
  }
}
</style>
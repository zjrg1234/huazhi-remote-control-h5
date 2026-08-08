<template>
  <view class="container">
    <!-- 顶部 Banner -->
    <view class="banner-section">
      <image :src="imgUrl" mode="widthFix" class="banner-img" lazy-load></image>
    </view>

    <!-- 分类导航栏 (已移除吸顶效果) -->
    <view class="static-nav-wrapper">
      <scroll-view scroll-x class="nav-scroll" :show-scrollbar="false" enable-flex>
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
      <view v-if="leftList.length === 0 && rightList.length === 0 && loading == false" class="empty-state">
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
            <text class="drivers">驾驶{{ item.drivers }}</text>
          </view>
          <view class="card-info">
            <view class="title-tags">
              <text class="title">{{ item.title }}</text>
              <text class="tag">{{ item.tag }}</text>
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
    <view class="loading-status">
      <text v-if="loading">加载中...</text>
      <text v-else-if="noMore">没有更多了</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { throttle } from "@/utils/system.js";
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

// --- 模拟接口请求 ---
const fetchData = async (isRefresh = false) => {
  if (loading.value || noMore.value) return;
  loading.value = true;
  
  if (isRefresh) {
    page.value = 1;
    leftList.value = [];
    rightList.value = [];
    noMore.value = false;
  }
  
  try {
    // 模拟网络延迟
    const { code, data: { venueList } } = await GetHomeDataList({ type: currentCategory.value });
    if (code == 200 && venueList.length) {
      // 简单的左右分发逻辑
      venueList.forEach((item, index) => {
        if (index % 2 === 0) {
          leftList.value.push(item);
        } else {
          rightList.value.push(item);
        }
      });
    }
  } catch (error) {
    console.error("获取数据失败", error);
  } finally {
    loading.value = false;
    // 已移除 uni.stopPullDownRefresh()
  }
};

// --- 事件处理 (应用节流) ---
// 分类点击节流 (300ms内只能点一次)
const handleCategoryClick = throttle((item) => {
  if (currentCategory.value === item.id) return;
  currentCategory.value = item.id;
  // 切换分类时重新加载第一页
  fetchData(true);
}, 300);

// 上拉加载更多 (节流)
const loadMore = throttle(() => {
  fetchData();
}, 500);

// --- 生命周期与监听 ---
onMounted(() => {
  fetchData();
});

onLoad(() => {
  categories.value = [{ name: "全部", id: "" }];
  GetHomeBanner()
    .then((res) => {
      imgUrl.value = res.data[0]?.image;
    })
    .catch();
  GetHomeTabTitle()
    .then((res) => {
      categories.value = [...categories.value, ...res.data];
    })
    .catch();
});

// 触底加载
// onReachBottom(() => {
//   loadMore();
// });

const handleCar = (item) => {
  uni.setStorageSync('carTitle', item.venue_name)
  uni.navigateTo({
    url: '/subpkg_car/pages/car/index?id=' + item.id
  })
}
</script>

<style lang="scss" scoped>
/* 全局容器 */
.container {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 40rpx;
}

/* Banner 区域 */
.banner-section {
  width: 100%;
  overflow: hidden;
  height: 280rpx;
  .banner-img {
    width: 100%;
    display: block;
  }
}

/* 导航栏核心样式 (已移除吸顶) */
.static-nav-wrapper {
  position: static; /* 修改为 static */
  z-index: 99;
  background-color: #fff;
  box-shadow: 0rpx -4rpx 20rpx -10rpx rgba(0, 0, 0, 0.1);
  border-radius: 40rpx 40rpx 0rpx 0rpx;
  margin-top: -10rpx;
  border-bottom: 1rpx solid #f6f6f6;
}

.nav-scroll {
  width: 100%;
  white-space: nowrap;
}

.nav-list {
  display: inline-flex;
  padding: 0 20rpx;
  height: 88rpx;
  align-items: center;
}

.nav-item {
  display: inline-block;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #777;
  position: relative;
  flex-shrink: 0;
  line-height: 88rpx;
  &.active {
    color: #1A1A1A;
    font-weight: bold;
    font-size: 30rpx;
    &::after {
      content: "";
      position: absolute;
      bottom: 10rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 30rpx;
      height: 6rpx;
      background-color: #000;
      border-radius: 3rpx;
    }
  }
}

/* 瀑布流布局 */
.waterfall-container {
  display: flex;
  padding: 10rpx;
  padding-top: 20rpx;
  gap: 10rpx;
  background-color: #fff;
  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 270rpx;
      }
      .tag {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 20rpx;
        color: #1a1a1a;
        padding: 0 5rpx;
        background: #fee2a2;
        border-radius: 4rpx;
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
      margin-right: 5rpx;
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
    width: 300rpx;
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
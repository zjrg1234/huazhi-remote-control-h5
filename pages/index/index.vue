<template>
  <view class="container">
    <!-- 顶部 Banner -->
    <view class="banner-section">
      <image :src="imgUrl" mode="widthFix" class="banner-img" lazy-load></image>
    </view>

    <!-- 分类导航栏 (Sticky 吸顶 + 横向滚动) -->
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
            :class="{ active: currentCategory === item.name }"
            @click="handleCategoryClick(item)"
          >
            {{ item.name }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 瀑布流列表区域 -->
    <view class="waterfall-container">
      <!-- 左列 -->
      <view class="column col-left">
        <view
          v-for="(item, index) in leftList"
          :key="'left-' + index"
          class="card-item"
        >
          <image
            :src="item.image"
            mode="widthFix"
            class="card-img"
            lazy-load
          ></image>
          <view class="card-info">
            <view class="title-tags">
              <text class="title">{{ item.title }}</text>
              <text class="tag">{{ item.tag }}</text>
            </view>
          </view>
          <view class="meta">
              <text class="status online"></text>
              <text>在线{{ item.online }}</text>
              <text class="divider">|</text>
              <text class="drivers">驾驶{{ item.drivers }}</text>
          </view>
        </view>
      </view>

      <!-- 右列 -->
      <view class="column col-right">
        <view
          v-for="(item, index) in rightList"
          :key="'right-' + index"
          class="card-item"
        >
          <image
            :src="item.image"
            mode="widthFix"
            class="card-img"
            lazy-load
          ></image>
          <view class="card-info">
            <view class="title-tags">
              <text class="title">{{ item.title }}</text>

              <text class="tag">{{ item.tag }}</text>
            </view>
            
          </view>

          <view class="meta">
              <text class="status online"></text>
              <text>在线{{ item.online }}</text>
              <text class="divider">|</text>
              <text class="drivers">驾驶{{ item.drivers }}</text>
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
import { ref, onMounted, computed } from "vue";
import { onReachBottom, onPullDownRefresh, onLoad } from "@dcloudio/uni-app";
import { throttle } from "@/utils/system.js"; // 引用封装好的节流函数
import { GetHomeBanner, GetHomeTabTitle, GetHomeDataList } from "@/axios/index";
// --- 数据定义 ---
const categories = ref([]);
const currentCategory = ref("全部");

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
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 模拟返回数据 (实际开发替换为 uni.request)
    const mockData = Array.from({ length: 6 }).map((_, i) => ({
      id: page.value * 10 + i,
      title: "RC疯狂汽车城",
      tag: "遥控车",
      online: 12,
      drivers: 3,
      // 随机高度图片模拟瀑布流效果
      image: `https://picsum.photos/200/${
        300 + Math.floor(Math.random() * 150)
      }?random=${page.value}${i}`,
    }));

    // 简单的左右分发逻辑
    mockData.forEach((item, index) => {
      if (index % 2 === 0) {
        leftList.value.push(item);
      } else {
        rightList.value.push(item);
      }
    });

    if (mockData.length === 0) noMore.value = true;
    else page.value++;
  } catch (error) {
    console.error("获取数据失败", error);
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
};

// --- 事件处理 (应用节流) ---

// 分类点击节流 (300ms内只能点一次)
const handleCategoryClick = throttle((item) => {
  if (currentCategory.value === item.name) return;
  currentCategory.value = item.name;
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
  console.log(2);
});

onLoad(() => {
  console.log(1);
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

// 下拉刷新
onPullDownRefresh(() => {
  fetchData(true);
});

// 触底加载
onReachBottom(() => {
  loadMore();
});
</script>

<style lang="scss" scoped>
/* 全局容器 */
.container {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-bottom: 40rpx;
}

/* Banner 区域 */
.banner-section {
  width: 100%;
  overflow: hidden;
  height: 280rpx;
  .banner-img {
    width: 100%;
    display: block; /* 消除图片底部间隙 */
  }
}

/* 导航栏核心样式 (重点修改部分) */
.sticky-nav-wrapper {
  position: sticky;
  top: 0;
  z-index: 99;
  background-color: #fff;
  box-shadow: 0rpx -4rpx 20rpx 0rpx rgba(0, 0, 0, 0.1);
  border-radius: 40rpx 40rpx 0rpx 0rpx;
  margin-top: -10rpx;
}

.nav-scroll {
  width: 100%;
  white-space: nowrap; /* 关键：强制内部内容不换行 */
}

.nav-list {
  display: inline-flex; /* 配合 white-space: nowrap 撑开宽度 */
  padding: 0 20rpx;
  height: 88rpx;
  align-items: center;
}

.nav-item {
  display: inline-block; /* 关键：让元素在一行排列 */
  padding: 0 30rpx;
  font-size: 30rpx;
  color: #666;
  position: relative;
  flex-shrink: 0; /* 关键：防止文字过多时被挤压换行 */
  line-height: 88rpx;

  &.active {
    color: #000;
    font-weight: bold;
    font-size: 32rpx;

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
  gap: 10rpx; /* 列间距 */
  background-color: #fff;
  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx; /* 卡片上下间距 */
  }
}

.col-left {
  .card-item {
    width: 360rpx;
    height: 400rpx;
    .card-img {
      width: 100%;
      height: 400rpx !important;
      display: block;
    }
  }
}
.col-right {
  .card-item {
    height: 540rpx;
    .card-img {
      width: 100%;
      height: 540rpx !important;
      display: block;
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

  .card-img {
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
      font-size: 0;
      display: flex;
      align-items: center;

      .title {
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 40rpx;
        color: #ffffff;
        text-align: center;
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
  }

   .meta {
    position: absolute;
    right: 15rpx;
    top: 15rpx;
      display: flex;
      align-items: center;
      font-size: 22rpx;
      color: #fff;

      background: rgba(0,0,0,0.5);
      border-radius: 20rpx;
      padding: 2rpx 15rpx;
      .online {
        width: 8rpx;
        height: 8rpx;
        background: #15CB50;
        color: #4caf50; /* 绿色状态点 */
        border-radius: 50%;
        margin-right: 5rpx;
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
</style>
<template>
  <view class="container">
    <!-- 顶部 Banner -->
    <view class="banner-section">
      <image :src="imgUrl" mode="widthFix" class="banner-img" lazy-load></image>
    </view>

    <!-- 分类导航栏 -->
    <view class="sticky-nav-wrapper">
      <scroll-view scroll-x class="nav-scroll" :show-scrollbar="false" enable-flex>
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

    <!-- 瀑布流列表区域（合并左右列） -->
    <view class="waterfall-container">
      <!-- 循环渲染两列 -->
      <view v-for="(column, colIndex) in columns" :key="colIndex" class="column">
        <view
          v-for="(item, index) in column"
          :key="item.id || index"
          class="card-item"
        >
          <!-- 状态标签（右上角） -->
          <view class="meta">
            <text class="status online"></text>
            <text>在线{{ item.online }}</text>
            <text class="divider">|</text>
            <text class="drivers">驾驶{{ item.drivers }}</text>
          </view>

          <!-- 图片 -->
          <image
            :src="item.image"
            mode="widthFix"
            class="card-img"
            lazy-load
            @load="onImageLoad"
          ></image>
          
          <!-- 底部信息 -->
          <view class="card-info">
            <view class="title-tags">
              <text class="title">{{ item.title }}</text>
              <text class="tag">{{ item.tag }}</text>
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
import { onReachBottom, onPullDownRefresh, onLoad } from "@dcloudio/uni-app";
import { throttle } from "@/utils/system.js";
import { GetHomeBanner, GetHomeTabTitle } from "@/axios/index";

// --- 数据定义 ---
const categories = ref([]);
const currentCategory = ref("全部");

// 使用二维数组存储两列数据，代替 leftList 和 rightList
const columns = ref([[], []]); 
// 记录左右两列的当前高度，用于动态分配
const columnHeights = ref(); 

const page = ref(1);
const loading = ref(false);
const noMore = ref(false);
const imgUrl = ref("");

// --- 图片加载回调（可选，用于更精确的高度计算） ---
const onImageLoad = () => {
  // 在实际复杂场景中，可以在此处重新获取真实高度微调布局
};

// --- 模拟接口请求 ---
const fetchData = async (isRefresh = false) => {
  if (loading.value || noMore.value) return;

  loading.value = true;
  if (isRefresh) {
    page.value = 1;
    columns.value = [[], []]; // 清空两列
    columnHeights.value = 0; // 重置高度记录
    noMore.value = false;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 模拟返回数据
    const mockData = Array.from({ length: 6 }).map((_, i) => ({
      id: page.value * 10 + i,
      title: "RC疯狂汽车城",
      tag: "遥控车",
      online: 12,
      drivers: 3,
      // 随机高度图片模拟瀑布流效果
      image: `https://picsum.photos/200/${
        300 + Math.floor(Math.random() * 200)
      }?random=${page.value}${i}`,
      // 模拟不同高度的卡片（图片高度 + 底部文字区域约 100rpx）
      estimatedHeight: 300 + Math.floor(Math.random() * 200) + 100 
    }));

    // 核心优化：动态将数据分配到高度较小的一列
    mockData.forEach((item) => {
      if(item%2 ==0 ) {
        columns.value[0].push(item);

      } else {
        columns.value[1].push(item);

      }
      // 找出当前高度较小的那一列的索引 (0 或 1)
      const targetColIndex = columnHeights.value <= columnHeights.value ? 0 : 1;
      // 累加该列的高度
      columnHeights.value[targetColIndex] += item.estimatedHeight;
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

// --- 事件处理 ---
const handleCategoryClick = throttle((item) => {
  if (currentCategory.value === item.name) return;
  currentCategory.value = item.name;
  fetchData(true);
}, 300);

const loadMore = throttle(() => {
  fetchData();
}, 500);

// --- 生命周期 ---
onMounted(() => {
  fetchData();
});

onLoad(() => {
  categories.value = [{ name: "全部", id: "" }];
  GetHomeBanner()
    .then((res) => {
      imgUrl.value = res.data?.image;
    })
    .catch(() => {});
  GetHomeTabTitle()
    .then((res) => {
      categories.value = [...categories.value, ...res.data];
    })
    .catch(() => {});
});

onPullDownRefresh(() => {
  fetchData(true);
});

onReachBottom(() => {
  loadMore();
});
</script>

<style lang="scss" scoped>
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
    display: block;
  }
}

/* 导航栏核心样式 */
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
  font-size: 30rpx;
  color: #666;
  position: relative;
  flex-shrink: 0;
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

/* 瀑布流布局（合并后） */
.waterfall-container {
  display: flex;
  padding: 10rpx;
  gap: 10rpx;
  background-color: #fff;
  
  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }
}

/* 卡片样式（统一） */
.card-item {
  position: relative;
  background: #e9e9e9;
  border-radius: 8rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

  .card-img {
    width: 100%;
    display: block;
  }

  .card-info {
    padding: 10rpx;
    .title-tags {
      display: flex;
      align-items: center;
      .title {
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 40rpx;
        color: #ffffff;
        text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3); /* 增加文字阴影防止背景过亮看不清 */
      }
      .tag {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 20rpx;
        color: #1a1a1a;
        padding: 0 5rpx;
        background: #fee2a2;
        border-radius: 4rpx;
        margin-left: 10rpx;
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
    z-index: 10;

    .online {
      width: 8rpx;
      height: 8rpx;
      background: #15CB50;
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
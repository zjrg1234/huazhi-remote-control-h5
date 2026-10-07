<template>
  <view class="container">
    <!-- 顶部 Banner -->
    <view class="banner-section">
      <image :src="imgUrl" mode="scaleToFill" class="banner-img" lazy-load></image>
    </view>


     <view class="banner-section">
      <image :src="imgUrl" mode="scaleToFill" class="banner-img" lazy-load></image>
    </view>








    <NoticePopup v-model="showNotice" title="公告" :content="noticeContent" :is-rich-text="false" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { GetHomeBanner, GetNotice } from "@/axios/index";

import NoticePopup from '@/components/notice-popup/notice-popup.vue';
import { shouldFetchNotice, resetNoticeFlag } from '@/utils/notice';

const imgUrl = ref("");
const showNotice = ref(false);
const noticeContent = ref('');
const isLoggedIn = ref(!!uni.getStorageSync('token'));


// --- 生命周期 ---
onLoad(() => {
  GetHomeBanner().then((res) => { imgUrl.value = res.data[0]?.image; }).catch(() => { });
  if (shouldFetchNotice(isLoggedIn.value)) {
    getNotice();
  }
})


const getNotice = () => {
  GetNotice().then(res => {
    if (res.data && res.data.status == 1) {
      showNotice.value = true
      noticeContent.value = res.data.content
    }
  }).catch(() => {
    resetNoticeFlag();
  })
}

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
  height: 280rpx;
  flex-shrink: 0;

  /* 防止被压缩 */
  .banner-img {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.nav {
  margin-top: -60rpx;
}

/* 导航栏核心样式 (重点修改部分) */
.sticky-nav-wrapper {
  position: sticky;

  z-index: 99;
  background-color: #fff;
  box-shadow: 0rpx -4rpx 20rpx 0rpx rgba(0, 0, 0, 0.1);
  border-radius: 40rpx 40rpx 0rpx 0rpx;

  flex-shrink: 0;
  /* 防止被压缩 */
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
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  display: inline-block;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #777;
  position: relative;
  flex-shrink: 0;
  line-height: 88rpx;

  &.active {
    color: #1A1A1A;
    font-weight: 500;
    font-size: 30rpx;

    &::after {
      content: "";
      position: absolute;
      bottom: 10rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 31rpx;
      height: 5rpx;
      background-color: #000;
      border-radius: 2rpx;
    }
  }
}

/* ✅ 核心样式：scroll-view 必须占据剩余空间 */
.waterfall-scroll {
  flex: 1;
  height: 0;
  /* 兼容部分小程序端的 flex 布局 bug */
}

/* 自定义刷新样式 */
.custom-refresher {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60rpx;
  width: 100%;
  text-align: center;

  .refresh-text {
    font-size: 26rpx;
    color: #999;
  }
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
        font-size: 30rpx;
        color: #fff;
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
    padding: 0 15rpx;
    height: 40rpx;
    line-height: 40rpx;
    // width: 220rpx;

    .online {
      width: 8rpx;
      height: 8rpx;
      border-radius: 50%;
      margin-right: 10rpx;
      background: #15cb50;
    }

    .divider {
      margin: 0 15rpx;
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
    /* 根据你的实际图片大小调整 */
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
<template>
  <view class="container">
    <view class="loadingLayout" v-if="!list.length && !noData">
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <!-- 网格列表 -->
    <view class="grid">
      <view class="grid-item" v-for="(item, index) in list" :key="index" :class="{ active: selected === item.id }"
        @click="selected = item.id">
        <image class="car-img" src="/static/images/common/car@2x.png" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ item.agent_name }}</text>
          <text class="desc">分区数 ｜ {{ item.partitions_number }} 个</text>
          <text class="desc">车辆数 ｜ {{ item.vehicles_number }} 辆</text>
          <text class="price">剩余金额 ￥{{ item.balance }}</text>
        </view>
      </view>
    </view>

    <view class="loadingLayout" v-if="list.length || noData">
      <uni-load-more :status="noData ? 'noMore' : 'loading'"></uni-load-more>
    </view>

    <!-- 底部确定按钮 -->
    <view class="btn-wrap">
      <button class="confirm-btn common-btn" @click="confirm">确定</button>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { GetSpecialList, ChangeSpecialList } from "@/axios/mine.js"

import { onLoad, onUnload, onReachBottom, onShareTimeline } from "@dcloudio/uni-app"
const list = ref([])
const selected = ref(0)
import {
  useUserStore
} from '@/store/modules/user'

const userStore = useUserStore();
selected.value = userStore.areaId


const loading = ref(false)
onMounted(() => {

  getSpecialList()
})
const noData = ref(false)
//定义data参数
const queryParams = {
  page: 1,
  size: 12
}

onReachBottom(() => {

  if (noData.value) return;
  if (loading.value) return

  loading.value = true
  queryParams.page++;


  setTimeout(() => {
    getSpecialList();
    // 结束加载
    loading.value = false
  }, 1000)
})
const getSpecialList = async () => {
  const res = await GetSpecialList()
  list.value = [...list.value, ...res.data];
  if (queryParams.size > res.data.length) noData.value = true;
}

const confirm = () => {
  const obj = { special_id: selected.value }
  ChangeSpecialList(obj).then(res => {
    if (res.code == 200) {
      userStore.setAreaId(selected.value)

      uni.showToast({ title: '更换专区成功', icon: 'success' })
    } else {
      uni.showToast({ title: res.msg, icon: 'error' })
    }
  }).catch()

}
</script>

<style lang="scss" scoped>
.container {
  background-color: #F2F5F8;
  min-height: 100vh;
}

/* 顶部栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20rpx 0;

  .back-btn {
    position: absolute;
    left: 30rpx;
    font-size: 32rpx;
    color: #333;
  }

  .title {
    font-size: 34rpx;
    font-weight: 500;
    color: #333;
  }
}

/* 网格布局 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  flex-wrap: wrap;
  gap: 10rpx;
  padding: 10rpx 20rpx;
}

.grid-item {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  border: 4rpx solid transparent;
  transition: border-color 0.2s;
  font-size: 0;

  &.active {
    border-color: #FFC838;
    position: relative;
    border-radius: 10rpx;
    border: 4rpx solid #FFC838;
  }

  .car-img {
    width: 100%;
    height: 180rpx;
    width: 210rpx;
    height: 177rpx;
    border-radius: 8rpx;
    margin: 10rpx;
  }

  .info {
    padding: 0 10rpx 10rpx 10rpx;
    font-size: 26rpx;

    .name {
      display: block;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 28rpx;
      color: $uni-color-1;

    }

    .desc {
      display: block;
      color: #666;
      margin: 6rpx 0;
      line-height: 1;
    }

    .price {
      display: block;
      color: #ff8800;
      font-weight: 500;
      margin-top: 8rpx;
      line-height: 1;
    }
  }

  /* 选中标记 */
  &.active::after {
    content: " ";
    position: absolute;
    bottom: 0rpx;
    right: -1rpx;
    width: 51rpx;
    height: 40rpx;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAABQCAMAAADcIvDgAAAAnFBMVEUAAAD+xzj/yjb/wD//0DH/yDf/yDj/yDj/yDj/yTj/yDf/yTn/yTj/yDj/yTn/xzj/yDj/yDj/yDj/yTj/yDj/yDf/yDj/yDf/yTj/yDj/yTn/yDgaGholIhseHRr6xTfzvzbfsDNtWSQwKx2dfStKPiDquDWzji5gTyPXqjO8lS9VRyE5MR7GnDGphy19ZSc/Nh/OozKTdimIbShPW8HqAAAAG3RSTlMA/hkJBPHj18qXbEX6flst9evBroo4IxK5ok5DxgZVAAACLUlEQVRo3rzVOQKCQBQEUWRYxwFUFNC6/z0Nf2BkUPQFXlZdnbE0ViesHqj8Xe+cwOQLPpNW8JmlB5+ZW3ymeYLP1A/wmVcHPpMLPpPe4DPbgMpEXnxmuuAz+womE3nxmfmGyUReRCbyojKRF5/JBZOJvPjM1oPPfFp8ppnAZ/YDfGbpMJnIi880I/hMPaAycZM+kws+k1bwma3HZCIvJhM36TP7gcrETfrMXPCZNPL/lLz8zsrLtzZz21UQBqJoxONRYjwaXweQ+00Q1P//txPTkikMNHZC12NNWAp072nMS7+v2RqcwvVEjed5QYUaK/FSJd6HlKU5780sXsHR/H0bL09fWO54hy3ESztYQlzjTOF66kBYyhsgq8dLIS2xaoG1a/IxWDagwpjCdaSeoBtbgHHIb7MkDmGWl7S8YYJ5vESfF6nPYYa3tLxgilm84H1pIpiy6aQlBYL5Ib8Q10qiqSUWHwQPoJjHyy2Tnmq8PFgKmIExhYfS4z9VSykXa5iDEy/hXV6yXViiMOKFfHXyAymMeKEPIsfHtQAjXshrlff48i3AjRfcJKKQcSvNwp3Ccct3oirVYKCwpnAMMCTTWXbmh3wkVS0haNgzp3AsFyxkDVfOIR8psJC1uDRejKh9LGQNR3LINyQq/SbdgJ7dD5nCbeCSmrTBxRn/1WaJE5nCbXDYknixwK9jEC98y5nUpAUOjhIvtrictkpNWmLnOqQmVzbsr+5R2fv/YJisvL6xvsMAAAAASUVORK5CYII=);
    background-size: cover;
    background-repeat: no-repeat;

  }
}

/* 底部按钮 */
.btn-wrap {

  position: fixed;
  bottom: env(safe-area-inset-bottom);
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 26rpx;

  .confirm-btn {
    width: 702rpx;
    height: 94rpx;
    line-height: 94rpx;
    border: none;
    font-family: PingFangSC, PingFang SC;
    font-weight: 500;
    font-size: 32rpx;
    color: $uni-color-1;
  }
}
</style>
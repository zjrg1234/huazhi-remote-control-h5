<template>
  <view class="container">
    <!-- 1. 首次加载状态 -->
    <view class="loadingLayout" v-if="loading && list.length === 0">
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <!-- 2. 网格列表 -->
    <view class="grid" v-if="list.length > 0">
      <view class="grid-item" v-for="item in list" :key="item.id" :class="{ active: selected === item.id }"
        @click="selected = item.id">
        <image class="car-img" :src="item.image" mode="aspectFill" lazy-load />
        <view class="info">
          <text class="name">{{ item.agent_name }}</text>
          <text class="desc">分区数 ｜ {{ item.partitions_number }} 个</text>
          <text class="desc">车辆数 ｜ {{ item.vehicles_number }} 辆</text>
          <text class="price">剩余金额 ￥{{ item.balance }}</text>
        </view>
      </view>
    </view>

    <!-- 3. 列表底部加载状态 -->
    <view class="loadingLayout" v-if="list.length > 15">
      <uni-load-more :status="noData ? 'noMore' : 'loading'"></uni-load-more>
    </view>

    <!-- 底部确定按钮 -->
    <view class="btn-wrap">
      <button class="confirm-btn common-btn" @click="confirm">确定</button>
    </view>

    <!-- 提示弹窗 -->
    <TipModal title="提示" v-model:visible="tipVisible" key="2" @confirm="handleConfirm">
      <template #content>
        <view>
          <view class="text">变更专区后您所有的账户数据不会转移到新的专区（您稍后也可自行变更到当前专区）</view>
          <view class="text">确定变更到专区「{{ name }}」吗?</view>
        </view>
      </template>
    </TipModal>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onReachBottom } from "@dcloudio/uni-app"
import { GetSpecialList, ChangeSpecialList } from "@/axios/mine.js"
import TipModal from "@/components/tip-modal/tip-modal.vue"
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// --- 状态定义 ---
const list = ref([])
const selected = ref(userStore.areaId || 0) // 初始化时直接赋值，避免后续覆盖
const name = ref('')
const tipVisible = ref(false)
const loading = ref(false)
const noData = ref(false)

const newUser = ref('')

// --- 核心逻辑 ---
onMounted(() => {
  newUser.value = uni.getStorageSync('new_user')
  if (newUser.value == 1) {
    selected.value = ''
  }
  getSpecialList()
})

// 下拉触底加载
onReachBottom(() => {
  if (noData.value || loading.value) return

  getSpecialList()
})

// 获取列表数据
const getSpecialList = async () => {
  if (loading.value) return // 防止重复请求
  loading.value = true

  try {
    // 假设接口支持分页参数，若不支持需后端配合
    const res = await GetSpecialList()
    if (res.code != 200) {
      uni.showToast({ title: res.msg, icon: 'none' })
    } else {
      list.value = [...res.data]
    }
  } catch (err) {
    console.error('获取专区列表失败:', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 点击确定
const confirm = () => {
  if (!selected.value) {
    return uni.showToast({ title: '请选择一个专区', icon: 'none' })
  }

  if (uni.getStorageSync('new_user') != "1") {
    if (userStore.areaId == selected.value) {
      return uni.showToast({ title: '您已在当前专区', icon: 'none' })
    }

    const obj = list.value.find(item => item.id == selected.value)
    if (obj) {
      name.value = obj.agent_name
      tipVisible.value = true
    }
  } else {
    handleConfirm()
  }

}

// 确认变更
const handleConfirm = async () => {
  try {
    const res = await ChangeSpecialList({ special_id: selected.value })
    if (res.code == 200) {
      uni.removeStorageSync('new_user')
      tipVisible.value = false;
      userStore.setAreaId(selected.value)
      uni.showToast({ title: '更换专区成功', icon: 'success' })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/mine/index' })
      }, 2001)

    } else {
      uni.showToast({ title: res.msg || '操作失败', icon: 'none' })
    }
  } catch (err) {
    uni.showToast({ title: '网络异常，请重试', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #F2F5F8;
  min-height: 100vh;
  padding-bottom: 140rpx;
  /* 防止底部按钮遮挡列表内容 */
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
    height: 177rpx;
    border-radius: 8rpx;
    margin: 10rpx auto;
    display: block;
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
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 36rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #F2F5F8;

  .confirm-btn {
    width: 100%;
    height: 94rpx;
    line-height: 94rpx;
    border-radius: 47rpx;
    border: none;
    font-family: PingFangSC, PingFang SC;
    font-weight: 500;
    font-size: 32rpx;
    color: $uni-color-1;
  }
}

.text {
  text-align: left;
  color: #333;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 32rpx;
  padding-bottom: 2rpx;
}
</style>
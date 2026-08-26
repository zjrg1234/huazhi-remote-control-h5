<template>
  <view class="page">
    <!-- 顶部操作组 -->
    <view class="card">
      <view class="item" @click="handleModifyPassword">
        <text class="label">修改密码</text>
        <image class="arrow" src="/static/images/common/icon_arrows_gray@2x.png" mode="aspectFill" />
      </view>
      <view class="item" @click="handleModifyPhone">
        <text class="label">修改手机号</text>
        <image class="arrow" src="/static/images/common/icon_arrows_gray@2x.png" mode="aspectFill" />
      </view>
    </view>

    <!-- 版本与服务信息组 -->
    <view class="card">
      <view class="item">
        <text class="label">版本号</text>
        <text class="text">1.0.9</text>
      </view>
      <view class="item" @click="handleOpenPrivacy">
        <text class="label">隐私政策</text>
        <image class="arrow" src="/static/images/common/icon_arrows_gray@2x.png" mode="aspectFill" />
      </view>
      <view class="item" @click="handleOpenInfoList">
        <text class="label">个人信息收集清单</text>
        <image class="arrow" src="/static/images/common/icon_arrows_gray@2x.png" mode="aspectFill" />
      </view>
      <view class="item" @click="handleOpenSDKList">
        <text class="label">SDK 共享清单</text>
        <image class="arrow" src="/static/images/common/icon_arrows_gray@2x.png" mode="aspectFill" />
      </view>
    
      <!-- <view class="item" @click="handleOpenFAQ">
        <text class="label">常见问题</text>
        <image class="arrow" src="/static/images/common/icon_arrows_gray@2x.png" mode="aspectFill" />
      </view> -->

      <view class="item" @click="handleDeleteAccount">
        <text class="label">注销账号</text>
        <image class="arrow" src="/static/images/common/icon_arrows_gray@2x.png" mode="aspectFill" />
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-btn" @click="handleLogout">
      退出登录
    </view>
  </view>

  <CustomModal v-model:visible="logoutModal" title="提示" content="是否注销账号?" cancelText="取消" confirmText="确定"
    @cancel="logoutModal = false" @confirm="handleConfirm" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CustomModal from '@/components/common-modal/common-modal.vue'
import { logoutAccount } from "@/axios/mine.js"
import { resetNoticeFlag } from '@/utils/notice';
const cacheSize = ref('34.23kb')
const logoutModal = ref(false)
// 模拟获取缓存大小
onMounted(() => {

})

// 事件处理函数
const handleModifyPassword = () => {
  uni.navigateTo({ url: '/subpkg_user/pages/user/modifyPwd' })
}

const handleModifyPhone = () => {
  uni.navigateTo({ url: '/subpkg_user/pages/user/modifyPhone' })
}

const handleOpenPrivacy = () => {
  uni.navigateTo({ url: '/subpkg_set/pages/set/privacy' })
}

const handleOpenInfoList = () => {
  uni.navigateTo({ url: '/subpkg_set/pages/set/infoSheet' })
}

const handleOpenSDKList = () => {
  uni.navigateTo({ url: '/subpkg_set/pages/set/sdkSheet' })
}

const handleOpenCompanyIntro = () => {
  uni.navigateTo({ url: '/pages/webview/company' })
}

const handleOpenFAQ = () => {
  uni.navigateTo({ url: '/pages/webview/faq' })
}

const handleClearCache = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.showToast({ title: '清除成功' })
        cacheSize.value = '0.00kb'
      }
    }
  })
}

const handleDeleteAccount = () => {
  logoutModal.value = true
}
const handleConfirm = () => {
  logoutAccount().then(res => {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    uni.showToast({ title: '注销成功', icon: 'success' });

    const timer = setTimeout(() => {
      uni.reLaunch({ url: '/subpkg_login/pages/login/login' })
      clearTimeout(timer)
    }, 1500)
    // 回到首页
  }).catch();
}
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        resetNoticeFlag()
        // 清除登录状态
        uni.removeStorageSync('id')
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.showToast({ title: '已退出' })
        const timer = setTimeout(() => {
          uni.reLaunch({ url: '/subpkg_login/pages/login/login' })
          clearTimeout(timer)
        }, 1500)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
page {
  background: #F8F8F8;
}

.page {
  padding: 20rpx;
  background: #F8F8F8;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 34rpx 30rpx 34rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .label {
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 28rpx;
    color: #222222;
  }

  // .value {
  //   font-size: 30rpx;
  //   color: #999;
  // }

  .arrow {
    width: 32rpx;
    height: 32rpx;
  }
}

.logout-btn {
  margin-top: 80rpx;
  background-color: #fff;
  border-radius: 16rpx;
  text-align: center;
  padding: 25rpx;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 28rpx;
  color: #222222;
}
</style>
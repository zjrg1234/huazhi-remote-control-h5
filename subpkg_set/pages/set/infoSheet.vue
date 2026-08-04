<template>
  <view class="page">
    <view class="container">
     
      <view class="table-box">
        <!-- 第1行 -->
        <view class="table-row">
          <view class="table-th">信息名称</view>
          <view class="table-td">名字（昵称）</view>
        </view>
        <view class="table-row">
          <view class="table-th">使用目的</view>
          <view class="table-td">对外展示</view>
        </view>
        <view class="table-row">
          <view class="table-th">使用场景</view>
          <view class="table-td">首次注册创建账号、用户自行编辑资料、产生预约记录、驾驶记录、申诉记录时</view>
        </view>
        <view class="table-row">
          <view class="table-th">收集情况</view>
          <view class="table-td" id="nameText">未收集</view>
        </view>
        <view class="table-row">
          <view class="table-th">信息内容</view>
          <view class="table-td" id="name">/</view>
        </view>
      </view>

      <!-- 间隔 -->
      <view class="gap"></view>

      <!-- 第2行 -->
      <view class="table-box">
        <view class="table-row">
          <view class="table-th">信息名称</view>
          <view class="table-td">手机号码</view>
        </view>
        <view class="table-row">
          <view class="table-th">使用目的</view>
          <view class="table-td">创建账号、作为登录账号</view>
        </view>
        <view class="table-row">
          <view class="table-th">使用场景</view>
          <view class="table-td">首次注册创建账号、使用账号或验证码登录功能时、使用第三方账号登录时</view>
        </view>
        <view class="table-row">
          <view class="table-th">收集情况</view>
          <view class="table-td" id="phoneText">未收集</view>
        </view>
        <view class="table-row">
          <view class="table-th">信息内容</view>
          <view class="table-td" id="phone">/</view>
        </view>
      </view>

      <!-- 间隔 -->
      <view class="gap"></view>

      <!-- 第3行 -->
      <view class="table-box">
        <view class="table-row">
          <view class="table-th">信息名称</view>
          <view class="table-td">头像</view>
        </view>
        <view class="table-row">
          <view class="table-th">使用目的</view>
          <view class="table-td">对外展示</view>
        </view>
        <view class="table-row">
          <view class="table-th">使用场景</view>
          <view class="table-td">用户自行编辑资料、用户产生预约记录、驾驶记录、申诉记录时</view>
        </view>
        <view class="table-row">
          <view class="table-th">收集情况</view>
          <view class="table-td">1条</view>
        </view>
        <view class="table-row">
          <view class="table-th">信息内容</view>
          <view class="table-td">/</view>
        </view>
      </view>

    </view>
  </view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
page {
  background-color: #f7f8fa;
}

.page {
  padding: 20rpx;
  min-height: 100vh;
}

.title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  margin: 20rpx 0 30rpx;
  color: #333;
}

/* 表格卡片 */
.table-box {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

/* 行 */
.table-row {
  display: flex;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

/* 左侧表头 */
.table-th {
  width: 220rpx;
  background-color: #f8f9fa;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  border-right: 1rpx solid #f0f0f0;
}

/* 右侧内容 */
.table-td {
  flex: 1;
  padding: 24rpx;
  font-size: 28rpx;
  color: #666;
  word-wrap: break-word;
  word-break: break-all;
}

.gap {
  height: 20rpx;
}
</style>
<template>
  <!-- uni-app 要求 template 下必须且只能有一个根节点 -->
  <view class="page">
    

    <!-- 用户信息区域 -->
    <view class="header">
      <view class="user-info">
        <view class="avatar-image">
          <!-- 使用 uni-ui 的 uni-icons 替代 img 标签，或使用 image 标签 -->
          <image 
            class="avatar" 
            :src="userInfo.head_shot" 
            mode="aspectFill" 
            @click="triggerUpload" 
          />
          <!-- 编辑箭头 -->
          <image 
            class="arrow-edit" 
            src="/static/images/mine/icon_edit@2x.png" 
            mode="aspectFit" 
            @click="triggerUpload" 
          />
        </view>
      </view>
    </view>

    <view class="list-container">
      <!-- 第一行：昵称 -->
      <view class="list-item" @click="editUsername">
        <text class="label">昵称</text>
        <text class="content">{{ userInfo.username }}</text>
        <uni-icons type="right" size="14" color="#969799" />
      </view>

      <!-- 第二行：ID -->
      <view class="list-item no-arrow">
        <text class="label">ID</text>
        <text class="content">{{ userInfo.show_id }}</text>
      </view>
    </view>

    <!-- 密码输入弹窗：使用 uni-popup 替代 van-popup -->
    <uni-popup ref="popupRef" type="center" >
      <view class="modal-content">
        <text class="modal-title">修改昵称</text>
        <input 
          class="modal-input" 
          v-model="username" 
          placeholder="请输入,限定8个字" 
          maxlength="8" 
        />
        <view class="modal-footer">
          <button class="confirm-btn common-btn" @click="handleConfirm">确认</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>
<script setup>
import { ref, computed } from "vue";
import { ChangeHeadImg, ChangeName } from "@/axios/mine.js";
import { GetUserInfo } from "@/axios/index";
import { baseUrl } from '@/config/env'

import {
  useUserStore
} from '@/store/modules/user'

const userStore = useUserStore();


const popupRef = ref(null);
const visible = ref(false);

const userInfo = computed(() => userStore.getUserInfo());
const username = ref("");

const editUsername = () => {
  username.value = userInfo.value.username;
  popupRef.value.open(); // 打开 uni-popup
};

const handleConfirm = () => {
  ChangeName({ name: username.value })
    .then((res) => {
      if (res.code == 200) {
        uni.showToast({ title: "修改成功", icon: "success" });
        GetUserInfo().then((res) => {
          userStore.setUser({ ...res.data });
        });
        popupRef.value.close();
      } else {
        uni.showToast({ title: "修改失败", icon: "none" });
      }
    })
    .catch(() => {
      uni.showToast({ title: "修改失败", icon: "none" });
    });
};

// 唤起图片选择
const triggerUpload = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      uploadImage(tempFilePath);
    },
  });
};

// 图片上传处理 (替换 fetch 和 FormData)
const uploadImage = async (filePath) => {
  // 本地预览临时图
  userStore.setUser({ ...userInfo.value, head_shot: filePath });

  uni.showLoading({ title: "上传中..." });
  uni.uploadFile({
    url: `${baseUrl}/api/upload/picture`,
    filePath: filePath,
    name: "imageFile[]", // 对应后端的字段名
    success: (uploadRes) => {
      // uploadFile 返回的 data 是字符串，需要 JSON.parse
      const data = JSON.parse(uploadRes.data);
      if (data.code === 200) {
        const newUrl = data.data.file[0];
        ChangeHeadImg({ head_shot: newUrl }).then(() => {
          userStore.setUser({ ...userInfo.value, head_shot: newUrl });
          uni.showToast({ title: "上传成功", icon: "success" });
        });
      } else {
        uni.showToast({ title: "上传失败", icon: "none" });
      }
    },
    fail: (err) => {
      console.error("上传失败：", err);
      uni.showToast({ title: "上传失败", icon: "none" });
    },
    complete: () => {
      uni.hideLoading();
    },
  });
};
</script>

<style lang="scss" scoped>
.page {
  background: #fff;
  min-height: 100vh;
}

.header {
  position: relative;
  z-index: 1;
  padding: 50rpx 30rpx 0;
  display: flex;
  justify-content: center;
  // border-top: 0.5rpx solid #eaeaea;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar-image {
  position: relative;
  margin-right: 20rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;

  .avatar {
    width: 100%;
    height: 100%;
  }

  .arrow-edit {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 32rpx;
    height: 32rpx;
    display: block;
    border-radius: 50%;
    background-color: #fff;
    z-index: 2;
  }
}

.list-container {
  margin-top: 60rpx;
  background-color: #fff;

  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;

    .label {
      width: 100rpx;
      color: #969799;
      font-size: 28rpx;
    }

    .content {
      flex: 1;
      color: #323233;
      font-size: 28rpx;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 20rpx;
    }
  }
}

.confirm-btn {
  margin-top: 40rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: bold;
  background-color: #fbbd08;
  border: none;
  color: #333;
  width: 100%;
}

.modal-content {
  padding: 40rpx;
  width: 80vw;
  max-width: 600rpx;
  text-align: center;
  background: #fff;
  border-radius: 24rpx;
}

.modal-title {
  display: block;
  margin-bottom: 30rpx;
  font-size: 36rpx;
  font-weight: bold;
}

.modal-input {
  border: 2rpx solid #eee;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.modal-footer {
  margin-top: 30rpx;
}
</style>
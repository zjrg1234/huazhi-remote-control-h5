<template>
  <view class="page">
    <!-- 表单 -->
    <view class="form">
      <!-- 手机号 -->
      <view class="input-item">
        <text class="prefix">+86</text>
        <input
          class="input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          v-model="form.phone"
        />
      </view>
      <VerifyCodeInput v-model="form.code" :phone="form.phone" />
      <!-- 密码 -->
      <view class="input-item">
        <input
          class="input"
          type="password"
          maxlength="6"
          placeholder="请输入密码"
          v-model="form.password"
        />
      </view>
      <view class="input-item">
        <input
          class="input"
          type="password"
          maxlength="6"
          placeholder="请再次输入密码"
          v-model="form.passwordAgain"
        />
      </view>
      <view class="login-btn" @click="handleLogin">完成</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { Register, Login } from "@/axios/index.js";
import {
	useUserStore
} from '@/store/modules/user'
import VerifyCodeInput from "@/components/verify-code/verify-code.vue";
const form = ref({
  phone: "",
  password: "",
  code: "",
  passwordAgain: "",
});

const userStore = useUserStore()
// 登录
const handleLogin = () => {
  if (!form.value.phone || form.value.phone.length !== 11) {
    uni.showToast({
      title: "请输入手机号",
      icon: "none",
    });
    return;
  }
  if (!form.value.code) {
    uni.showToast({
      title: "请输入验证码",
      icon: "none",
    });
    return;
  }
  if (!form.value.password || form.value.password.length < 6) {
    uni.showToast({
      title: "密码至少6位",
      icon: "none",
    });
    return;
  }
  if (form.value.password !== form.value.passwordAgain) {
    uni.showToast({
      title: "两次密码输入不一致",
      icon: "none",
    });
    return;
  }

  Register({
    ...form.value,
    type: 1,
    noteVerify: form.value.code,
  })
    .then((res) => {
   
      if (res.code == 200) {
        uni.showToast({
          title: "注册成功",
          icon: "success",
        });

        Login({
          ...form.value,
          password: form.value.password,
          type: 1,
        })
          .then((res) => {
            if (res.code == 200) {
              userStore.setToken(res.data.session_key);
              userStore.setAreaId(res.data.special_area);
              userStore.setId(res.data.id);

              GetUserInfo({ uid: res.data.id })
                .then((res) => {
                  userStore.setUser(res.data);

                  uni.reLaunch({
                    url: "/subpkg_mine/pages/mine/changeArea", // 你的首页路径
                  });
                })
                .catch();
            } else {
              uni.showToast({
                title: res.msg,
                icon: "none",
              });
            }
          })
          .catch();
      }
    })
    .catch();
};

</script>

<style lang="scss" scoped>
page {
  background-color: #fff;
}

.page {
  padding: 10rpx 32rpx 40rpx;
  box-sizing: border-box;
  position: relative;
  height: 100vh;
  background-color: #fff;
}

/* 头像 */
.avatar-wrap {
  text-align: center;
  margin-bottom: 60rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 16rpx;
  }
}

/* 表单 */
.form {
  width: 100%;
}

.input-item {
  display: flex;
  align-items: center;
  background-color: #f7f7f7;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 96rpx;
  margin-bottom: 24rpx;

  .prefix {
    font-size: 28rpx;
    color: #333;
    margin-right: 16rpx;
  }

  .input {
    flex: 1;
    font-size: 28rpx;
    background: transparent;
  }
}

.login-btn {
  background: linear-gradient(90deg, #ffc838 0%, #ffc838 100%);
  border-radius: 24rpx;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  font-size: 32rpx;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 50rpx;
  padding: 25rpx 0;
}
</style>

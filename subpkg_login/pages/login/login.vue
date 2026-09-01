<template>
  <view class="page">
    <view class="avatar-wrap">
      <image class="avatar" src="/static/logo.png" mode="aspectFill" />
    </view>

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

      <!-- 密码 -->
      <view class="input-item">
        <input
          class="input"
          type="password"
          maxlength="10"
          placeholder="请输入密码"
          v-model="form.password"
        />
      </view>

      <!-- 忘记密码 / 验证码登录 -->
      <view class="row-link">
        <text class="link" @click="goForgetPwd">忘记密码</text>
        <text class="link" @click="goCodeLogin">验证码登录</text>
      </view>

      <!-- 登录按钮 -->
      <view class="login-btn" @click="handleLogin">登录</view>

      <!-- 注册账号 -->
      <view class="register-link" @click="goRegister">
        <text>注册帐号</text>
      </view>
    </view>

    <view class="agreement">
      <view
        class="checkbox"
        :class="{ checked: agree }"
        @click="agree = !agree"
      >
        <image
          class="check-icon"
          src="/static/images/login/checked@2x.png"
          mode="aspectFill"
          v-if="agree"
        />
        <image
          class="un-check-icon"
          src="/static/images/login/circle@2x.png"
          mode="aspectFill"
          v-if="!agree"
        />
      </view>
      <text class="text">
        我已同意<text
          class="highlight"
          @click="goto('/subpkg_set/pages/set/userPolicy')"
          >用户协议</text
        >
        和
        <text @click="goto('/subpkg_set/pages/set/privacy')" class="highlight"
          >隐私条款</text
        >
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { Login, GetUserInfo } from "@/axios/index.js";
import { useUserStore } from "@/store/modules/user";
const form = ref({
  phone: "",
  password: "",
});

const agree = ref(false);
const userStore = useUserStore();
// 登录
const handleLogin = async () => {
  if (!agree.value) {
    uni.showToast({
      title: "请先同意用户协议和隐私条款",
      icon: "none",
    });
    return;
  }

  if (!form.value.phone) {
    uni.showToast({
      title: "请输入手机号",
      icon: "none",
    });
    return;
  }
  if (!form.value.password) {
    uni.showToast({
      title: "请输入密码",
      icon: "none",
    });
    return;
  }

  // 2. 获取微信登录的临时凭证 code
  const loginRes = await new Promise((resolve, reject) => {
    uni.login({
      provider: "weixin",
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    });
  });

  uni.setStorageSync("openid", loginRes.code);

  Login({
    ...form.value,
    password: form.value.password,
    type: 1,
    login_code: loginRes.code,
  })
    .then((res) => {
      if (res.code == 200) {
        userStore.setToken(res.data.session_key);
        userStore.setAreaId(res.data.special_area);
        userStore.setId(res.data.id);

        GetUserInfo({ uid: res.data.id })
          .then((res) => {
            userStore.setUser(res.data);

            uni.switchTab({
              url: "/pages/index/index",
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
  // 这里写你的登录接口
};

// 跳转
const goForgetPwd = () => {
  uni.navigateTo({
    url: "/subpkg_login/pages/login/forgetPwd",
  });
};

const goCodeLogin = () => {
  uni.navigateTo({
    url: "/subpkg_login/pages/login/loginCode",
  });
};

const goRegister = () => {
  uni.navigateTo({
    url: "/subpkg_register/pages/register/index",
  });
};

const goto = (url) => {
  uni.navigateTo({
    url,
  });
};
</script>

<style lang="scss" scoped>
page {
  background-color: #fff;
}

.page {
  padding: 138rpx 32rpx 40rpx;
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
    height: 96rpx;

    font-size: 28rpx;
    background: transparent;
  }
}

.row-link {
  display: flex;
  justify-content: space-between;
  margin-bottom: 50rpx;

  .link {
    font-size: 26rpx;
    color: #999;
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

.register-link {
  text-align: center;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 60rpx;
}

.other-login {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;

  .line {
    flex: 1;
    height: 1rpx;
    background-color: #eee;
  }

  .text {
    font-size: 26rpx;
    color: #999;
    margin: 0 20rpx;
  }
}

.third-list {
  display: flex;
  justify-content: center;
  gap: 60rpx;
  margin-bottom: 80rpx;

  .third-item {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    overflow: hidden;

    .icon {
      width: 100%;
      height: 100%;
    }
  }
}

.agreement {
  position: absolute;
  bottom: 50rpx;
  left: 50%;
  width: 100%;
  transform: translatex(-50%);
  display: flex;
  align-items: center;
  justify-content: center;

  .checkbox {
    width: 46rpx;
    height: 46rpx;
    border-radius: 4rpx;
    margin-right: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .check-icon {
      width: 40rpx;
      height: 40rpx;
    }

    .un-check-icon {
      width: 46rpx;
      height: 46rpx;
    }
  }

  .text {
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    font-size: 24rpx;
    color: #29220a;

    .highlight {
      color: #ffc838;
    }
  }
}
</style>

<template>
  <view class="landscape-page">
    <view class="page-content">

      <cover-view class="logout" @click="logout">
        <cover-image src="./static/icon_exit@2x.png" class="image" mode="aspectFit" />
        <cover-view class="text">返回</cover-view>
      </cover-view>

      <cover-view class="time-text">
        {{ currentTime }}
      </cover-view>

      <!-- #ifdef MP-WEIXIN -->

      <web-view :src="videoUrl" ref="iframeView"></web-view>

      <!-- #endif -->
      <!-- 退出按钮 -->

      <!-- 顶部状态栏 -->
      <cover-view class="status-bar-capsule">
        <cover-view class="flex">
          <cover-view class="fl">
            <cover-view class="car">
              <cover-image class="image" src="./static/icon_car@2x.png" mode="aspectFit" />
              <cover-view class="text"> 车辆已连接 </cover-view>
            </cover-view>
          </cover-view>

          <nBattery v-model="batteryPer"></nBattery>
        </cover-view>
      </cover-view>

      <!-- 剩余时间提示 -->
      <cover-view class="tip" v-show="numTip > 0" :style="{ display: numTip > 0 ? 'block' : 'none' }">
        <cover-view>距离本次结束驾驶还有{{ 31 - numTip }}s</cover-view>
      </cover-view>

      <!-- 设置按钮 -->
      <cover-view class="right-cont">
        <cover-view class="flex">
          <cover-view class="first" @click="handleReport">
            <cover-image class="image" src="./static/icon_repairs@2x.png" mode="aspectFit" />
            <cover-view class="text">维修</cover-view>
          </cover-view>

          <cover-image class="image" @click="set" src="./static/icon_set@2x.png" mode="aspectFit" />
        </cover-view>
      </cover-view>

      <ExLeft @action="handleLeftDrive" @reset="onUserActivity">
      </ExLeft>
      <ExRight @action="handleRightDrive" :mode="operMode" @reset="onUserActivity"></ExRight>

      <!-- 时间显示 -->

      <cover-view v-show="setVisible" :style="{ display: setVisible ? 'block' : 'none' }" class="custom-popup-mask"
        @click="close">
        <cover-view class="custom-popup-right" @click.stop>
          <cover-view class="cont">
            <cover-view class="right">
              <cover-view class="settings-bar" @click="close">
                <cover-view class="text-area">设置</cover-view>
                <cover-view class="close-btn">
                  <cover-image class="image" src="./static/icon_close@2x.png" mode="widthFix"></cover-image>
                </cover-view>
              </cover-view>
              <cover-view class="setting-group" v-for="(item, index) in setGroup" :key="index">
                <cover-view class="setting-item" :class="{ active: selectedIndex == item.key }"
                  @click="handleItem(index)">
                  {{ item.name }}
                </cover-view>
                <cover-view class="gradient-line" v-show="selectedIndex == item.key"></cover-view>
              </cover-view>
            </cover-view>
            <cover-view class="left">
              <cover-view class="group" v-show="selectedIndex == 0">
                <cover-view class="group-item pr">
                  <cover-view class="flex fj">
                    <cover-view class="tit">进退反向操作</cover-view>
                    <SwitchComp v-model="operFB" @change="setHandleOper(1, $event)"></SwitchComp>
                  </cover-view>
                  <cover-view class="flex fj">
                    <cover-view class="tit">旋转反向操作</cover-view>
                    <SwitchComp v-model="operDir" @change="setHandleOper(2, $event)"></SwitchComp>
                  </cover-view>
                </cover-view>
              </cover-view>
            </cover-view>
          </cover-view>
        </cover-view>
        <!-- </cover-view> -->
      </cover-view>

      <cover-view class="tip-popup-mask" v-show="allPopupVisible"
        :style="{ display: allPopupVisible ? 'block' : 'none' }" @tap.stop="handleMaskClick">
        <cover-view class="fcenter">
          <!-- 弹窗主体内容 -->
          <cover-view class="popup-container" :class="{ contmax: type === 'repair' }" @tap.stop>
            <!-- 场景1：黑屏提示 -->
            <cover-view v-show="type === 'tip'">
              <cover-view class="tip-content">
                <cover-view class="time">倒计时{{ count }}s</cover-view>
                <cover-view class="tit">是否黑屏？</cover-view>
                <cover-view class="text">
                  <cover-view class="text1">开始驾驶前如遇黑屏或者车辆故障上报不扣费，开始驾驶后开始计费。</cover-view>
                  <cover-view>如果一切正常，请点击“开始驾驶”</cover-view>
                </cover-view>
              </cover-view>

              <cover-view class="footer fc">
                <cover-view class="flex">
                  <cover-view class="btn left" @tap.stop="logoutOne('logout')">
                    退出驾驶
                  </cover-view>
                  <cover-view class="btn left ml" @tap.stop="handlePopupAction('report')">
                    上报故障
                  </cover-view>
                </cover-view>
                <cover-view class="flex mt">
                  <cover-view class="btn right" @tap.stop="handlePopupAction('driving')">
                    开始驾驶
                  </cover-view>
                </cover-view>
              </cover-view>
            </cover-view>

            <!-- 场景2：退出驾驶 -->
            <cover-view v-show="type === 'logout'">
              <cover-view class="tip-content">
                <cover-view class="tit">退出驾驶</cover-view>
                <cover-view class="text ct">
                  <cover-view>未用完的电池将放到余额里</cover-view>
                </cover-view>
              </cover-view>
              <cover-view class="footer fc">
                <cover-view class="flex">
                  <cover-view class="btn left" @tap.stop="cancel">
                    取消
                  </cover-view>
                  <cover-view class="btn left ml" @tap.stop="handlePopupAction('report')">
                    上报故障
                  </cover-view>
                </cover-view>
                <cover-view class="flex mt">
                  <cover-view class="btn right" @tap.stop="handlePopupAction('logout')">
                    退出驾驶
                  </cover-view>
                </cover-view>
              </cover-view>
            </cover-view>

            <!-- 场景3：维修以及上报故障 -->
            <cover-view v-show="type === 'repair'">
              <cover-view class="tip-content repair">
                <cover-view class="tit">设备报修</cover-view>
                <cover-view v-if="showRepairReason" class="reason">
                  <cover-view v-for="(item, index) in list" :key="index" @tap="selectReason(index, item)" :class="[
                    'reason-item',
                    { active: selectedReasonIndex === index },
                  ]">{{ item }}</cover-view>
                </cover-view>
                <!-- 替换 Vant 的 textarea 为原生 input -->
                <cover-view class="ttarea">
                  <!-- <input
                    v-model="message"
                    class="custom-textarea"
                    type="text"
                    maxlength="20"
                    placeholder="请输入故障原因，最多20字（选填）"
                  />
                  <cover-view class="word-limit"
                    >{{ message.length }}/20</cover-view
                  > -->
                </cover-view>
                <cover-view class="warn-tip">
                  温馨提示：上报车辆故障后，车辆将冻结，你将退退出驾驶。若遇到黑屏或者画面卡顿，请重新刷新页面
                </cover-view>
              </cover-view>
              <cover-view class="footer">
                <cover-view class="flex">
                  <cover-view class="btn left" @tap.stop="cancel">取消</cover-view>
                  <cover-view class="btn right ml" @tap.stop="report">上报</cover-view>
                </cover-view>
              </cover-view>
            </cover-view>

            <!-- 场景4：即将结束倒计时 -->
            <cover-view v-show="type === 'countTip'">
              <cover-view class="tip-content">
                <cover-view class="time">倒计时{{ count }}s</cover-view>
                <cover-view class="tit">您的驾驶时间即将结束</cover-view>
                <cover-view class="text">
                  <cover-view>即将结束本次驾驶，欢迎您下次再来！</cover-view>
                </cover-view>
              </cover-view>
              <cover-view class="footer">
                <cover-view class="flex mt">
                  <cover-view class="btn right" @tap.stop="handlePopupAction('logout')">退出驾驶</cover-view>
                </cover-view>
              </cover-view>
            </cover-view>

            <cover-view v-show="type === 'longTimeTip'">
              <!-- 场景5：长时间无操作 -->

              <cover-view class="tip-content">
                <cover-view class="time"> {{ logoutCont }}s</cover-view>
                <cover-view class="tit">【警告】您180秒无操作！</cover-view>
                <cover-view class="text">
                  <cover-view class="text1">三分钟未操作,请立即驾驶。
                    为防止您的电池被浪费，即将结束本次驾驶，欢迎您下次再来!</cover-view>
                </cover-view>
              </cover-view>
              <cover-view class="footer">
                <cover-view class="flex mt">
                  <cover-view class="btn right" @tap.stop="handleContinueDrive">继续驾驶</cover-view>
                </cover-view>
              </cover-view>
            </cover-view>

            <cover-view v-show="type === 'offLineTip'">
              <!-- 场景5：长时间无操作 -->

              <cover-view class="tip-content">
                <cover-view class="tit">提示</cover-view>
                <cover-view class="text">
                  <cover-view class="text1">当前车辆已离线，是否退出驾驶？或继续等待车辆恢复链接</cover-view>
                </cover-view>
              </cover-view>
              <cover-view class="footer">
                <cover-view class="btn left mr" @tap.stop="handlePopupAction('logout')">退出驾驶</cover-view>
                <cover-view class="btn right" @tap.stop="handleContinueDrive">继续驾驶</cover-view>
              </cover-view>
            </cover-view>
          </cover-view>
        </cover-view>
      </cover-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { onLoad, onUnload, onHide } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/modules/user";

import {
  StartDrive,
  UpdateBattery,
  SetKey,
  CheckCarStatus,
  CarReport,
} from "@/axios/index.js";

import { LoginTop, DeviceDetails } from "./axios/video.js";

import nBattery from "./components/nBattery.vue";
import SwitchComp from "./components/switchComp.vue";
import ExLeft from "./components/ex-left.vue";
import ExRight from "./components/ex-right.vue";




import {
  formatTime,
  handleBattery,
} from "./utils/utils.js";
import UDPSocketClient from "./utils/udpSocket.js";
import { handleDriverSocketData } from "./utils/socketHelper.js";
import { encryptAES } from "./utils/crypto.js";

import { ExcavatorControlHandler } from "./control/earthmover.js";
import { useHESbus } from "./composables/useHESbus.js";
import { useInactivityAlarm } from "./composables/useInactivityAlarm.js";


// ------------------- 状态 -------------------

const videoUrl = ref(""); // 视频地址
const allPopupVisible = ref(false);
const type = ref("tip");
const carStatus = ref(false);
const currentTime = ref("00:00:00");
const showSpeed = ref(false);
const showRepairReason = ref(false);

const setVisible = ref(false);

const carType = ref("1");
const orderNo = ref("");
const vehicleId = ref("");
const operMode = ref(false);
const operFB = ref(false);
const operDir = ref(false);

const activeKey = ref([]);
const chValue = ref({
  ch1: "",
  ch2: "",
  ch3: "",
  ch4: "",
  ch5: "",
  ch6: "",
  ch7: "",
  ch8: "",
});
const carDetails = ref(null);
const videoDefinition = ref("1");
const carHandler = ref(null);
const UDPSocket = ref(null);
const numTip = ref(0);
const { handleReceive, model } = useHESbus();
const batteryPer = ref(100);
const vlot = ref("");



// 计费定时器
let sendMsgTimer = null;
let billingTimer = null;
let tipTimer = null;
let isRequesting = false;

const userStore = useUserStore();

const balance = computed(() => {
  return userStore.balance || 0;
});

const energy = computed(() => {
  return userStore.energy || 0;
});

onHide(() => {
  console.log("离开页面了");
});

// ------------------- 工具函数 -------------------
const clearSendTimer = () => {
  if (sendMsgTimer) {
    clearInterval(sendMsgTimer);
    sendMsgTimer = null;
  }
};

const clearAllTimers = () => {
  if (billingTimer) {
    clearInterval(billingTimer);
    billingTimer = null;
  }
  if (tipTimer) {
    clearInterval(tipTimer);
    tipTimer = null;
  }
};

// 结束驾驶逻辑
const handleDriveEnd = () => {
  uni.removeStorageSync("sendNum");
  clearAllTimers();
  handlePopupAction("logout");
};

const daojishiTip = () => {
  const carInfo = JSON.parse(uni.getStorageSync("carInfo"));
  console.log("carInfo");
  if (!carInfo) return;

  let countNum = 0;
  if (carInfo.billing_method == 0) {
    const balanceVal = carInfo.payment_type == 1 ? balance.value : energy.value;
    const totalCycles = Math.trunc(balanceVal / carInfo.billing_rules.battery);
    countNum = totalCycles * (carInfo.billing_rules.time * 2);
  } else {
    countNum = carInfo.billing_rules.time * 2;
  }

  if (countNum <= 0) {
    handleDriveEnd();
    return;
  }

  let num = Number(uni.getStorageSync("sendNum") || 0);
  let hasTriggeredTip = false;

  // 30S 之后若提示  5s 之后弹窗
  billingTimer = setInterval(async () => {
    if (isRequesting) return;
    num++;
    uni.setStorageSync("sendNum", num);
    isRequesting = true;
    console.log(num, "num");
    if (num == countNum - 1) {
      clearInterval(billingTimer);
      billingTimer = null;
      numTip.value = 0;
      tipTimer = setInterval(() => {
        numTip.value++;
        if (numTip.value === 25 && !hasTriggeredTip) {
          hasTriggeredTip = true;
          allPopupVisible.value = true;
          type.value = "countTip";
          count.value = 6;
        }
        count.value--;

        if (numTip.value >= 30) {
          clearInterval(tipTimer);
          tipTimer = null;
          handleDriveEnd();
        }
      }, 1000);
    }

    if (num <= countNum - 1) {
      continueDrive();
    }
    isRequesting = false;
  }, 30 * 1000);

  const statusTimer = setInterval(async () => {
    const res = await CheckCarStatus({
      vehicle_id: vehicleId.value,
    });
    if (res.code != 200) {
      clearInterval(statusTimer);
      uni.showToast({ title: "车辆被下架", icon: "none" });
      handlePopupAction("logout");
    }
  }, 5 * 1000);
};

const handleContinueDrive = () => {
  onUserActivity();
  allPopupVisible.value = false;
  type.value = "";
};
const continueDrive = async () => {

  try {
    const res = await StartDrive({
      order_no: orderNo.value,
      type: 2,
      vehicle_id: vehicleId.value,
    });
    console.log("继续驾驶返回", res);
    if (res.code != 200 && res.code != 2000) {
      uni.showToast({ title: res.msg, icon: "none" });
    }
  } catch (e) {
    console.error("继续驾驶请求失败", e);
  } finally {
    isRequesting = false;
  }
};
// 获取视频设备信息

//video_only:自动打开视频
//video_audio:自动打开视频+音频
const GetDeviceInfo = (data) => {
  DeviceDetails({ ...data })
    .then((res) => {
      if (res.data?.rows?.length) {
        const base = "https://vedioafz.fzbkapp.com/";
        const query = `?device_id=${encodeURIComponent(carDetails.value.front_camera)}&token=${encodeURIComponent(data.token)}&initAction=video_only&videoDefinition=${carDetails.value.video_definition}&defaultCameraClarity=${carDetails.value.default_camera_clarity}&orderNo=${orderNo.value}&_t=${Date.now()}`;
        // const query = `?device_id=${encodeURIComponent('1002211')}&token=${encodeURIComponent(data.token)}&initAction=video_only&videoDefinition=${carDetails.value.video_definition}&defaultCameraClarity=${carDetails.value.default_camera_clarity}&closeFlag=0&_t=${Date.now()}`;
        videoUrl.value = base + query;

        console.log("请求接口之后的url:", videoUrl.value);
      }
    })
    .catch(() => { });
};

// 初始化摄像头播放
const initTopVideo = () => {
  if (!carDetails.value?.web_camera_user_name) return;
  LoginTop({
    username: carDetails.value.web_camera_user_name,
    password: encryptAES(carDetails.value.web_camera_user_password),
    usertype: "0",
  })
    .then((res) => {
      if (res.code == 200) GetDeviceInfo(res.data);
    })
    .catch(() => { });
};

const reportModal = () => {
  wx.showModal({
    title: "设备报修",
    editable: true, // 开启输入框
    placeholderText: "请输入故障原因（最多20字）",
    maxLength: 20, // 限制字数（可选）
    confirmText: "上报",
    cancelText: "取消",
    success(res) {
      if (res.confirm) {
        if (res.content) {
          // 调用上报接口
          report(res.content);
        } else {
          uni.showToast({ title: "请输入正确的内容", icon: "none" });
        }
      } else if (res.cancel) {
        console.log("用户取消");
      }
    },
    fail(err) {
      console.error("showModal 失败", err);
    },
  });
};

const logoutOne = () => {
  clearAllTimers();
  clearInterval(timerNum.value);
  clearInterval(countdownTimer);

  if (UDPSocket.value) {
    UDPSocket.value.close();
  }
  uni.reLaunch({
    url: "/subpkg_mine/pages/mine/reservation", // 你的首页路径
  });
};
// 弹窗动作处理
const handlePopupAction = (val) => {
  // 维修显示 各种原因   上报故障不显示原因
  if (val == "repair" || val == "report") {
    // 一开始的弹窗，点上报 清掉定时器
    if (type.value == "tip") {
      count.value = -1;
      clearCountdown();
    }
    type.value = "repair";
    allPopupVisible.value = false;
    reportModal();
    onUserActivity();
    return;
  }
  if (val == "driving") {
    clearCountdown();
    console.log("开始驾驶");
    StartDrive({
      order_no: orderNo.value,
      type: 1,
      vehicle_id: vehicleId.value,
    })
      .then((res) => {
        allPopupVisible.value = false;
        if (res.code != 200) {
          uni.showToast({ title: res.msg, icon: "none" });
        } else {
          SetKey({
            order_no: orderNo.value,
            type: 0,
          });
          daojishiTip();
        }
      })
      .catch(() => {
        allPopupVisible.value = false;
      })
      .finally(() => {
        allPopupVisible.value = false;
      });
    return;
  }
  if (val == "logout") {
    console.log("退出驾驶");
    clearInterval(billingTimer);
    StartDrive(
      {
        order_no: orderNo.value,
        type: 3,
        vehicle_id: vehicleId.value,
      },
      true,
    )
      .then((res) => {
        if (res.code == 2000 || res.code == 200) {
          SetKey({
            order_no: orderNo.value,
            type: 1,
          })
            .then((res1) => {
              uni.showToast({ title: "退出驾驶成功", icon: "none" });
              console.log("电池电量", batteryPer.value);
              UpdateBattery({
                vehicle_id: vehicleId.value,
                vehicle_battery: batteryPer.value,
              });
              const timer = setTimeout(() => {
                clearInterval(sendMsgTimer);
                if (UDPSocket.value) {
                  UDPSocket.value.close();
                }
                clearTimeout(timer);

                uni.reLaunch({
                  url: "/subpkg_mine/pages/mine/reservation", // 你的首页路径
                });
              }, 2100);
            })
            .catch();
        } else {
          uni.showToast({ title: res.msg, icon: "none" });
        }
      })
      .catch((e) => {
        console.log("catch", e);
      })
      .finally(() => { });
  }
};



const set = () => {
  onUserActivity();
  setVisible.value = true;
};

const logout = () => {
  onUserActivity();
  allPopupVisible.value = true;
  type.value = "logout";
  showSpeed.value = false;
};

const logoutCont = ref(5);
let logoutTimer = null
// 无操作报警
const handleInactivityAlarm = () => {
  allPopupVisible.value = true;
  type.value = "longTimeTip";

  if (logoutTimer) {
    clearInterval(logoutTimer);
    logoutTimer = null;
    logoutCont.value = 5;
  }

  logoutTimer = setInterval(() => {
    logoutCont.value -= 1;
    if (logoutCont.value == 0) {
      logoutCont.value = 0;
      handlePopupAction("logout");
      clearInterval(logoutTimer);
    }
  }, 1000);
};
const { resetTimer, startListening } = useInactivityAlarm(
  180 * 1000,
  handleInactivityAlarm,
);
// 页面触摸事件（小程序主要交互方式）
const onUserActivity = () => {
  resetTimer();
  if (logoutTimer) {
    clearInterval(logoutTimer);
    logoutTimer = null;
    logoutCont.value = 5;
  }
};

// ------------------- 生命周期 -------------------
// 先onload 再onMounted
// 前置摄像头 切换清晰度 前置 切换的前置 有喇叭， 后置摄像头只有标清
onLoad((options) => {
  initRouteData(options);
  startListening();
});

const count = ref(15);
onMounted(() => {
  startListening();
  console.log("onMounted");
  if (!uni.getStorageSync("sendNum")) uni.setStorageSync("sendNum", 0);
  initTimer(); // 时钟
  initVehicleConfig(); //获取配置 加载车辆类型
  initSocket(); // 微信小程序 udp

  initSendLoop();
  initTopVideo();
  clearCountdown();
  // 注意：uni-app 不支持 sessionStorage，需改用 uni.getStorageSync
  if (uni.getStorageSync("loadingOne") !== "1") {
    allPopupVisible.value = true;

    countdownTimer = setInterval(() => {
      count.value -= 1;
      if (count.value == 0) {
        count.value = 0;
        clearInterval(countdownTimer);
        countdownTimer = null;
        allPopupVisible.value = false;
        console.log("自动调驾驶接口");
        // 自动调开始驾驶的接口
        handlePopupAction("driving");
        uni.setStorageSync("loadingOne", "1");
      }
    }, 1000);
  } else {
    allPopupVisible.value = false;
  }
  text.value = "车辆翻车";
});

const clearCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

const timerNum = ref();
const initTimer = () => {
  let num = 1;
  timerNum.value = setInterval(() => {
    currentTime.value = formatTime(++num);
  }, 1000);
};

const initRouteData = (options) => {
  orderNo.value = options.order_no || "";
  vehicleId.value = options.vehicle_id || "";
  // 预约页面那边设置的值
  const details = uni.getStorageSync("carDetails");
  if (details) {
    carDetails.value = JSON.parse(details);
    videoDefinition.value = carDetails.value.video_definition || "1";

    const type = carDetails.value.vehicle_type;

    // case fourWheelVehicle = 10 //遥控车 - 四驱车
    // excavatorGeneralVehicle = 20 //挖机- 普通挖机case
    // caseexcavatorHydraulicVehicle = 21 //挖机- 液压挖机
    // bulldozerGeneralVehicle = 30 //铲车 (推土机) - 普通铲车case
    // bulldozerHydraulicVehicle = 31//铲车(推土机) - 液压铲车case
    // case otherVehicle = 40
    carType.value = "5";
    return
    if (type == 31) {

    }
    else if (type >= 10 && type <= 19) carType.value = "1";
    else if (type >= 20 && type <= 29 && type != 21) carType.value = "2";
    else if (type == 21) {
      carType.value = "3";
    } else if (type == 30) {
      carType.value = "4";
    }
  } else {
    console.log("carDetails 空");
  }
};

let ch5Open;
let ch5Close;
const initVehicleConfig = () => {
  const details = carDetails.value;
  if (!details) return;

  // 初始化车辆配置
  if (carDetails.value) {
    // 正反 上下
    operFB.value = carDetails.value.reverse_up_down == 1;
    operDir.value = carDetails.value.reverse_left_right == 1;

    ch5Open =
      carDetails.value.vehicle_config_detail.ch5.open_value.current_value;
    ch5Close =
      carDetails.value.vehicle_config_detail.ch5.close_value.current_value;

    // ch1 方向左开右关 ch2 前进后退 ch3 //挖斗-左开值-上、右关值-下
    //   ch4;//摆臂- 上开值下关值 ch5;// 油泵
    // 液压挖机ch1～ch6 全部都是中位值的current_value
    // mixed_control 为1 油泵一直开着 为0时，ch5 ch4 ch6 需要开油泵 就是ch7 需要open_values

    const config = carDetails.value.vehicle_config_detail || {};
    ["ch1", "ch2", "ch3", "ch4"].forEach((key) => {
      if (config[key])
        chValue.value[key] = config[key].center_value.current_value;
    });

    if (carType.value == "5") {
      if (carDetails.value.mixed_control == 1) {
        chValue.value.ch5 = config["ch5"].open_value.current_value;
      } else {
        chValue.value.ch5 = config["ch5"].close_value.current_value;
      }

      carHandler.value = new ExcavatorControlHandler({
        reverseUpDownState: operFB.value,
        reverseLeftRightState: operDir.value,
        ...carDetails.value.vehicle_config_detail,
        mixedControl: carDetails.value.mixed_control,
      });
    }
  }
};

// 使用 ref 存储定时器
const messageTimer = ref(null);

const initSocket = () => {
  // 初始化 WebSocket
  const wssUrl = uni.getStorageSync("wssUrl");
  const wssPort = uni.getStorageSync("wssPort");
  console.log(wssUrl, wssPort);
  // #ifdef MP-WEIXIN

  if (UDPSocket.value) {
    console.log("关闭UDPSocket");
    UDPSocket.value.close();
    UDPSocket.value = null;
  }

  UDPSocket.value = new UDPSocketClient({
    address: wssUrl,
    port: wssPort,

    onMessage: (msg) => {
      carStatus.value = true;
      // 收到消息，重置定时器
      clearTimeout(messageTimer.value);
      handleReceive(msg);
      // console.log("收到的消息", model)
      vlot.value = Number(model.volt ?? 0).toFixed(1);
      batteryPer.value = handleBattery(model.volt, carDetails.value.battery);
      // 重新启动超时检测
      startMessageTimeout();
    },

    onError: (err) => {
      console.error("UDP 通信发生异常:", err);
      wx.showToast({ title: "网络异常", icon: "none" });
    },
  });

  // 启动超时检测
  function startMessageTimeout() {
    clearTimeout(messageTimer.value);
    messageTimer.value = setTimeout(() => {
      console.warn("10秒内未收到消息");
      carStatus.value = false;
      allPopupVisible.value = true;
      type.value = "offLineTip";
    }, 20 * 1000);
  }

  // 初始启动
  startMessageTimeout();

  // #endif
};

// 初始化定时循环发送
const initSendLoop = () => {
  clearSendTimer();
  console.log("循环发送数据");
  console.log("发射机ID", uni.getStorageSync("app_id"));
  sendMsgTimer = setInterval(() => {
    if (UDPSocket.value) {
      const app_id = uni.getStorageSync("app_id");

      const val = handleDriverSocketData(
        app_id,
        chValue.value.ch1,
        chValue.value.ch2,
        chValue.value.ch3,
        chValue.value.ch4,
        chValue.value.ch5,
        chValue.value.ch6,
        chValue.value.ch7,
        chValue.value.ch8,
      );

      UDPSocket.value.send(val);
    }
  }, 40);
};

onUnmounted(() => {
  clearAllTimers();
  clearInterval(timerNum.value);
  clearInterval(countdownTimer);
  SetKey({
    order_no: orderNo.value,
    type: 1,
  });
});
onUnload(() => {
  if (UDPSocket.value) {
    UDPSocket.value.close();
    UDPSocket.value = null;
  }
  clearAllTimers();
  clearInterval(timerNum.value);
  clearInterval(countdownTimer);

  SetKey({
    order_no: orderNo.value,
    type: 1,
  });
});

// 遥杆操作 挖机
const handleLeftDrive = (param) => {
  handleComDrive("left", param);
  onUserActivity();
};



// 遥杆操作
const handleRightDrive = (param) => {
  onUserActivity();
  handleComDrive("right", param);
};
const handleComDrive = (type, param) => {
  if (
    param.left == false &&
    param.right == false &&
    param.up == false &&
    param.down == false
  ) {
    carHandler.value.resetChValue();
    chValue.value.ch5 = Math.min(ch5Open, ch5Close);

  } else {
    // 解决舵机先响的问题，应该油泵先响
    // 油泵 需要打开的时候 传开值关值的最大值
    // 关闭的时候 取开值关值的最小值
    if (type == "left") {
      chValue.value.ch5 = Math.min(ch5Open, ch5Close);
    }
    if (type == "right") {
      chValue.value.ch5 = Math.max(ch5Open, ch5Close);
    }

    carHandler.value.handleRemoteControlChannel(
      type,
      param.left,
      param.right,
      param.up,
      param.down,
      param.speed,
    );
  }

  const ch = carHandler.value.getChValue();
  chValue.value.ch1 = ch.ch1;
  chValue.value.ch2 = ch.ch2;
  chValue.value.ch3 = ch.ch3;
  chValue.value.ch4 = ch.ch4;

  chValue.value.ch6 = ch.ch6;
  chValue.value.ch7 = ch.ch7;
  chValue.value.ch8 = ch.ch8;
};

// 正反 旋转，上下操作
const setHandleOper = (type, val) => {
  console.log(type, val);
  onUserActivity();
  if (type == 1) operFB.value = val;
  if (type == 2) operDir.value = val;
  // 四驱车 液压挖机
  carHandler.value.setReverseStatus(operFB.value, operDir.value);
};

const setArr = [{ name: "通用设置", key: 0 }];
const setGroup = computed(() => {
  return setArr;
});

const selectedIndex = ref(0);
const handleItem = (index) => {
  selectedIndex.value = index;
  onUserActivity();
};

const close = () => {
  onUserActivity();
  setVisible.value = false;
};

// --------------------------tip -----------------------

// 点击遮罩层处理（原配置为 false，即不关闭）
const handleMaskClick = () => {
  // 如果需要点击遮罩关闭，可在此处设置 visible.value = false;
};

const text = ref();
let countdownTimer = null;

const list = ref([
  "车辆翻车",
  "画面卡顿",
  "无视频信号",
  "车辆无法控制",
  "画面黑屏",
  "电量低",
  "其他",
]);
const selectedReasonIndex = ref(0);

const selectReason = (index, item) => {
  selectedReasonIndex.value = index;
  text.value = item;
};

const cancel = () => {
  allPopupVisible.value = false;
  selectedReasonIndex.value = 0;
  onUserActivity();
};

const report = (text) => {
  let msg = "";
  onUserActivity();
  // 调用 API 上报 2s 退出回去
  CarReport({ order_no: orderNo.value, id: vehicleId.value, text }).then(
    (res) => {
      if (res.code == 200) {
        const timer = setTimeout(() => {
          UDPSocket.value.close();
          clearTimeout(timer);
          uni.reLaunch({
            url: "/subpkg_mine/pages/mine/reservation",
          });
        }, 2000);
      } else {
        uni.showToast({ title: res.msg, icon: "none" });
      }
    },
  );
};

const handleReport = () => {
  reportModal()
}
</script>

<style lang="scss" scoped>
/* 横屏页面已配置 pageOrientation: landscape，无需旋转 hack，直接用百分比/rpx 布局 */
.landscape-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #f1e9e9;
}

.page-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
}

.logout {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;

  width: 90px;
  height: 30px;
  background: rgba(0, 0, 0, 0.3);


  .image {
    position: absolute;
    width: 18px;
    height: 18px;
    left: 20px;
    top: 5px;
  }

  .text {
    position: absolute;
    right: 15px;
    top: 6px;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 500;
    font-size: 16px;
    color: #fff;
    font-style: normal;
  }
}

.time-text {
  position: fixed;
  z-index: 99999;
  top: 45px;
  left: 0;
  width: 60px;
  padding: 7px 5px;
  padding-left: 25px;
  background: rgba(0, 0, 0, 0.3);
  font-family: YouSheBiaoTiHei;
  font-size: 14px;
  color: #fff;
  font-style: normal;

}

.right-cont {
  position: fixed;
  z-index: 9999;
  top: 40px;
  right: 20px;

  display: flex;
  justify-content: flex-end; // 整体靠右（可根据实际布局调整）
  align-items: center;

  padding: 0 10px; // 可选

  .flex {
    display: flex;
    flex-direction: row; // 水平排列
    align-items: center; // 垂直居中
    gap: 26px; // 两组之间的间距
  }

  // 第一个组（图标+文字，竖向排列）
  .first {
    display: flex;
    flex-direction: row; // 纵向
    align-items: center; // 水平居中
    justify-content: center;
  }

  .image {
    width: 27px;
    height: 27px;
    display: block; // 避免行内间隙
  }

  // 文字样式
  .text {
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    font-size: 16px;
    color: #ffffff;
    margin-left: 9px;
    margin-right: 26px;
  }
}

// ========== 顶部状态栏 ==========
.status-bar-capsule {
  // --- 定位与尺寸 ---
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;

  // --- 布局 ---
  display: inline-flex; // 宽度由内容撑开，避免固定宽度溢出
  align-items: center;
  padding: 5px 10px; // 稍紧凑的内边距
  gap: 12px; // 左右内容间距
  // --- 视觉风格 ---
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;


  color: #ffffff;

  .flex {
    display: flex;
    align-items: center;
    gap: 10px; // 统一间距，替代 margin-right
    width: 100%;
  }

  // --- 左侧区域（车辆状态） ---
  .fl {
    display: flex;
    align-items: center;
    gap: 6px;
    // 不再需要 margin-right，由父级 gap 控制
  }

  // --- 车辆状态项 ---
  .car {
    display: flex;
    align-items: center;

    margin-right: 8px;

    .image {
      margin-right: 10px;
      width: 18px;
      height: 18px;
      flex-shrink: 0; // 防止图标被压缩
      // 图标已有 mode="aspectFit"，无需额外样式
    }

    // 文字“车辆已连接” 已在父级继承字体，可添加微调
    .text {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 15px;
      color: #fff;
      white-space: nowrap; // 防止文字换行
    }
  }

  // --- 连接状态指示点（原 .dot / .dot-red）---
  // 如果使用了，可优化为统一类
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #09ff77;
    box-shadow: 0 0 6px rgba(9, 255, 119, 0.6); // 发光效果
    flex-shrink: 0;
  }

  .dot-red {
    @extend .dot;
    background: #ff4d4f;
    box-shadow: 0 0 6px rgba(255, 77, 79, 0.6);
  }

  // --- 分隔线（原 .split-vertical）---
  .split-vertical {
    width: 1px;
    height: 16px;
    background: rgba(255, 255, 255, 0.25);
    flex-shrink: 0;
  }

  // --- 右侧电池组件 ---
  // 电池组件本身由 <nBattery> 控制，这里可以调整其与父级的间距
  // 若需要，可增加包裹层，但现有结构已满足
}

.tip {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;

  position: fixed;
  z-index: 99999;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  color: #ccc;
  font-size: 15px;
}

.side-menu-icon {
  position: fixed;
  z-index: 199999;
  top: 80px;
  right: 55px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;

  .image {
    width: 25px;
    height: 25px;
  }

  .sound {
    margin-top: 5px;
  }
}

.side-menu {
  position: fixed;
  z-index: 99999;
  top: 80px;
  right: 19px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  padding: 10px 4px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4px;

  .img {
    width: 18px;
    height: 18px;
    margin-bottom: 2px;
  }

  .label {
    font-size: 10px;
    color: #fff;
  }
}

.side-menu-oil {
  position: fixed;
  z-index: 99999;
  top: 180px;
  right: 19px;

  .image {
    width: 28px;
    height: 28px;
  }
}

.slider {
  position: fixed;
  z-index: 199999;
  top: 260px;
  right: 35px;
  width: 125px;
  overflow: visible !important;
}

.slider-wrapper-cont {
  position: relative;
  overflow: visible !important;

  padding: 0 15px;

  .slider-label {
    position: relative;
    height: 25px;
    overflow: visible !important;
  }

  .num {
    position: absolute;
    top: 15px;
    left: 0;
    transform: translateX(-50%);
    color: #fff;
    font-size: 10px;
    white-space: nowrap;
    border-radius: 14px;
    overflow: visible;
    transition: left 0.1s ease;
    min-width: 30px;
    text-align: center;
    box-sizing: border-box;
    margin-left: 0;
  }

  .slider-label-bottom {
    display: flex;
    justify-content: space-between;
    margin-top: 1px;
    padding: 0 15px;
  }

  .slider-label-bottom .num-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 10px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }
}

.time-clock {
  position: fixed;
  z-index: 99999;
  bottom: 10px;
  left: 20px;
  display: flex;
  align-items: center;
  opacity: 0.8;

  .image {
    display: block;
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }
}

.left-right-wrapper,
.up-down-wrapper {
  position: fixed;
  z-index: 9999;
}

/* 遮罩层 */
.custom-popup-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  width: 100%;

  .fe {
    display: flex;
    justify-content: flex-end;
  }

  .custom-popup-right {
    width: 400px;
    height: 100%;
    background-color: #fff;
    animation: slideIn 0.3s ease-out;
    display: flex;
    flex-direction: column;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }

    to {
      transform: translateX(0);
    }
  }

  .cont {
    display: flex;
    display: flex;
    width: 100%;
  }

  .left {
    width: 80%;
    /* 可以添加背景色或内边距方便查看效果 */
    background-color: #f0f0f0;

    box-sizing: border-box;

    border-right: 1px solid #777272;
    background: rgba(0, 0, 0, 0.5);
    box-shadow: 0rpx 0rpx 0rpx 0rpx rgba(255, 255, 255, 0.3);
  }

  .right {
    width: 20%;
    height: 100vh;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.8);

    .settings-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #ffffff;
      padding: 8px;
      width: 100%;
      box-sizing: border-box;
      border-bottom: 2px solid rgba(255, 255, 255, 0.4);

      .text-area {
        flex: 1;
        text-align: center;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 14px;
        letter-spacing: 4px;
        color: #ffffff;
      }

      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn .image {
        display: block;
        width: 24px;
        height: 24px;
      }
    }

    .setting-group {
      border-bottom: 2px solid #87878766;
      padding-bottom: 4px;

      .setting-item {
        font-family:
          PingFangSC,
          PingFang SC;
        font-size: 15px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        font-style: normal;
        font-weight: 500;
        height: 30px;
        line-height: 30px;
      }

      .active {
        color: #0da5ff;
      }

      .gradient-line {
        height: 2px;
        /* 线条的高度/粗细 */
        width: 100%;
        /* 线条长度 */

        /* 关键代码：创建线性渐变 */
        background: linear-gradient(to right,
            transparent,
            rgba(13, 165, 255, 0.8) 20%,
            #0da5ff 50%,
            rgba(13, 165, 255, 0.8) 80%,
            transparent
            /* 终点：完全透明 */
          );

        margin: 0 auto;
      }
    }
  }

  .left {
    padding: 30px 30px 10px 10px;

    .group-item {
      margin-bottom: 4px;

      .tit {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 16px;
        color: #ffffff;
      }
    }

    .flex {
      display: flex;
      gap: 24px;
      padding-top: 10px;
      margin-bottom: 10px;
    }

    .fj {
      justify-content: space-between;
    }

    .pr {
      padding-right: 30px;
    }

    .content-layout {
      display: flex;
      width: 100%;
      height: 100%;
      padding: 5px;
      box-sizing: border-box;
    }

    .reverse-layout {
      flex-direction: row-reverse;
    }

    .icon-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .icon-row {
      display: flex;
      gap: 4px;
      margin-bottom: 2px;
      height: 36px;

      .icon-img {
        width: 20px;
        height: 20px;
      }
    }

    .icon-row.vertical {
      flex-direction: column;
    }

    .icon-row.horizontal {
      flex-direction: row;
      height: 16px;
      margin: 10px 0;
    }

    .label {
      font-size: 12px;
      color: #ccc;
      margin-top: 4px;
    }

    .is-active .label {
      color: #fff;
    }
  }

  .section {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .slider-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 80px;
    overflow: visible;

    .slider-label {
      position: relative;
      height: 20px;
      overflow: visible;
    }

    .num {
      position: absolute;
      top: 5px;
      transform: translateX(-50%);
      /* 关键：让标签的中心点对齐 left 值，实现完美居中 */
      color: #fff;
      font-size: 12px;
      white-space: nowrap;
      /* 防止数字换行 */
      pointer-events: none;
      text-align: left;
      /* 防止标签拦截鼠标的拖拽事件 */

      overflow: visible;
      min-width: 40px;
    }

    .slider-label-bottom {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;

      .num-text {
        color: #fff;
        font-size: 12px;
      }

      .nl {
        margin-left: -8px;
      }
    }
  }

  .reduce,
  .add,
  .btn {
    flex-shrink: 0;

    user-select: none;
    -webkit-user-select: none;

    /* 禁止触摸高亮（移动端关键） */
    -webkit-tap-highlight-color: transparent;

    /* 禁止长按弹出菜单（部分浏览器支持） */
    -webkit-touch-callout: none;
  }

  .btn {
    border-radius: 4px;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    font-size: 12px;
    color: #1a1a1a;
    padding: 4px 8px;
    background: #0DA5FF;
    margin-left: 5px;
  }

  .reduce .image,
  .add .image {
    width: 24px;
    height: 24px;
    display: block;
  }

  :deep(uni-slider) {
    margin: 0;
  }
}

.repair-input {
  position: fixed;
  /* 根据弹窗实际位置调整 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 20px;
  /* 微调，使输入框出现在弹窗内容区 */
  width: 80%;
  max-width: 300px;
  /* 与弹窗宽度一致 */
  height: 60px;
  background: #f2f2f2;
  padding: 15px;
  border-radius: 6px;
  font-size: 14px;
  color: #222;
  box-sizing: border-box;
  text-align: left;
  z-index: 100000;
  /* 高于遮罩层 */
  border: none;
  outline: none;
}

.tip-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);

  z-index: 99999;

  .fcenter {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .popup-container {
    background-color: #fff;
    border-radius: 6px;
    width: 80%;
    max-width: 300px;
    overflow: hidden;
  }

  .contmax {
    max-width: 500px;
  }

  .tip-content {
    text-align: center;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .time {
      font-size: 18px;
      color: #333;
    }

    .tit {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-top: 10px;
    }

    .text {
      font-size: 14px;
      color: #666;
      text-align: left;
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .text1 {
      word-wrap: break-word;
      white-space: break-spaces;
    }

    .ct {
      text-align: center;
    }
  }

  .footer {
    display: flex;
    padding: 0 20px 20px;
    justify-content: space-between;
  }

  .fc {
    flex-direction: column;
  }

  .flex {
    display: flex;
    width: 100%;
    gap: 10px;
  }

  .btn {
    display: block;
    flex: 1;
    text-align: center;
    border-radius: 4px;
    font-weight: 400;
    font-size: 18px;
    color: #222222;
    padding: 10px 0;
  }

  .left {
    background: #f0f0f0;
  }

  .right {
    background: #0DA5FF;
  }

  .mt {
    margin-top: 10px;
  }

  .mr {
    margin-right: 10px;
  }

  .ml {
    margin-left: 10px;
  }

  .reason {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 0;
  }

  .reason-item {
    padding: 5px 10px;
    border-radius: 20px;
    color: #666666;
    font-size: 14px;
    border: 1px solid #666666;
    margin-right: 5px;
    margin-top: 5px;
  }

  .reason-item.active {
    border: 1px solid #0DA5FF;
    background-color: #0DA5FF;
    color: #1a1a1a;
  }

  .warn-tip {
    font-size: 12px;
    color: #999999;
    padding-top: 10px;
    text-align: left;
  }

  .ttarea {
    width: 480px;
    margin-top: 10px;
    position: relative;

    .custom-textarea {
      width: 480px;
      height: 60px;
      background: #f2f2f2;
      padding: 15px;
      border-radius: 6px;
      font-size: 14px;
      color: #222;
      box-sizing: border-box;
      text-align: left;
    }

    .word-limit {
      position: absolute;
      right: 16px;
      bottom: 2px;
      font-size: 14px;
      color: #999;
    }
  }
}

uni-slider {
  margin: 2px 5px;
}
</style>

<style>
cover-view,
cover-image {
  visibility: visible !important;
  z-index: 99999;
}
</style>

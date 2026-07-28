<template>
  <view class="landscape-page" @touchstart="onUserActivity" @touchmove="onUserActivity">
    <view class="page-content">



      <!-- #ifdef MP-WEIXIN -->

      <!-- <view class="logout-wrapper" @click="logout">
         内层依然是 cover-view 保证能悬浮在 web-view 上 
       
      </view> -->

      <cover-view class="logout" @click="logout">
        <cover-image src="/static/images/icon_exit@2x.png" class="image" mode="aspectFit" />
      </cover-view>
      <web-view :src="videoUrl" ref="iframeView">

      </web-view>


      <!-- #endif -->
      <!-- 退出按钮 -->

      <!-- 顶部状态栏 -->
      <cover-view class="status-bar-capsule">
        <cover-view class="flex">
          <cover-view class="fl">
            <cover-text class="dot" v-if="carStatus"></cover-text>
            <cover-view class="car">
              <cover-image class="image" src="/static/images/icon_car@2x.png" mode="aspectFit" />
              <cover-text class="mini-forbidden" v-if="!carStatus"></cover-text>
            </cover-view>
          </cover-view>
          <cover-view>
            <battery :percent="batteryPer"></battery>
          </cover-view>
          <cover-view><cover-text class="time-text">|</cover-text></cover-view>
          <cover-view>
            <cover-text class="time-text">{{ currentTime }}</cover-text>
          </cover-view>
        </cover-view>
      </cover-view>

      <!-- 剩余时间提示 -->
      <cover-view class="tip" v-if="numTip > 0">
        <cover-text>距离本次结束驾驶还有{{ 31 - numTip }}s</cover-text>
      </cover-view>

      <!-- 设置按钮 -->
      <cover-view class="right-cont" @click="set">
        <cover-image class="image" src="/static/images/icon_set@2x.png" mode="aspectFit" />
      </cover-view>

      <!-- 声音/波纹图标 -->
      <cover-view class="side-menu-icon">
        <microphone></microphone>
        <cover-image class="image" v-if="!showSound" src="/static/images/icon_sound_close@2x.png"
          @click="showSound = true" mode="aspectFit" />
        <cover-image class="image" v-if="showSound" src="/static/images/icon_sound_open@2x.png"
          @click="showSound = false" mode="aspectFit" />
      </cover-view>

      <!-- 右侧菜单 -->
      <!-- 右侧菜单 -->
      <cover-view class="side-menu">
        <cover-view class="menu-item" v-for="(item, index) in menuList" :key="index" @click="handleIcon(item)">
          <cover-image class="img" mode="aspectFit" :src="activeKey.includes(item.key) ? item.iconSelect : item.icon" />
          <cover-text class="label">{{ item.name }}</cover-text>
        </cover-view>
      </cover-view>

      <!-- 定速滑块 -->
      <cover-view class="slider" v-show="showSpeed">
        <cover-view class="slider-left">
          <cover-view class="slider-wrapper">
            <cover-view class="slider-label">
              <cover-view class="num" :style="{ left: constSpeed + '%' }">
                {{ constSpeed }} km/h
              </cover-view>
            </cover-view>
            <slider :value="constSpeed" :min="1" :max="100" :step="1" activeColor="#f5c542" backgroundColor="#e9e9e9"
              block-size="6" @change="changeConstSpeed" />
            <cover-view class="slider-label-bottom">
              <cover-view class="num-text num-left">0</cover-view>
              <cover-view class="num-text num-right">100</cover-view>
            </cover-view>
          </cover-view>
        </cover-view>
      </cover-view>

      <LeftRight @action="handleLRDrive" v-if="carType == 1" :isLeft="operMode"></LeftRight>

      <UpDown @action="handleFBDrive" v-if="carType == 1" :isLeft="!operMode"></UpDown>

      <ExLeft @action="handleLeftDrive" @action2="handleDrive" v-if="carType == 3"></ExLeft>
      <ExRight @action="handleRightDrive" @action2="handleDrive" v-if="carType == 3"></ExRight>
      <!-- <pointOprea1 @action="handleLeftDrive" v-if="carType == 3"></pointOprea1> -->
      <!-- <pointOprea2 @action="handleRightDrive" v-if="carType == 3"></pointOprea2> -->

      <!-- 时间显示 -->
      <cover-view class="time">
        <cover-image class="image" src="/static/images/icon_time@2x.png"  />
        <TimeClock></TimeClock>
      </cover-view>

      <!-- 通用弹窗 -->
      <!-- <ALLPopup ref="allPopup" v-model:show="allPopupVisible" type="tip" :orderNo="orderNo" :vehicleId="vehicleId"
        :isShow="showRepairReason" @action="handlePopupAction" /> -->

      <!-- 设置弹窗 -->
      <SetPopup v-model:show="setVisible" :videoDefinition="videoDefinition" :operFB="operFB"
        :directionCenter="directionCenter" :acceleratorDynamics="acceleratorDynamics"
        :directionDynamics="directionDynamics" :operDir="operDir" :type="carType" @action="handleOper"
        @operAction="handleFBDir" @changeValue="changeVal" />



    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, getCurrentInstance } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import ALLPopup from "./components/tip.vue";
import SetPopup from "./components/set.vue";
import microphone from "./components/microphone.vue";
import TimeClock from "./components/tclock.vue";
import battery from "./components/battery.vue";
import UpDown from "./components/up-down.vue";
import LeftRight from "./components/left-right.vue";
// import pointOprea1 from "./components/digger-opera1.vue";
// import pointOprea2 from "./components/digger-opera2.vue";
import ExLeft from "./components/ex-left.vue";
import ExRight from "./components/ex-right.vue";
import { formatTime, mapToPer, handleBattery } from "@/utils/utils.js";
import UDPSocketClient from "@/utils/udpSocket.js";
import { handleDriverSocketData } from "@/utils/socketHelper.js";
import { useHESbus } from "@/composables/useHESbus.js";
import { encryptAES } from "@/utils/crypto.js";
import { StartDrive } from "@/axios/index.js";
import { LoginTop, DeviceDetails } from "@/axios/video.js";
import { CarControlHandler } from "./control/siqu.js";
import { ExcavatorControlHandler } from "./control/excavator.js";
import { useInactivityAlarm } from "@/composables/useInactivityAlarm.js";
import {
  ch1,
  speeds,
  cSpeeds,
  repairs,
  ch_selected,
  speeds_selected,
  cSpeeds_selected,
  after_diff,
  after_diff_selected,
  before_diff,
  before_diff_selected,
  light,
  light_selected,
} from "./control/img.js";

// ------------------- 状态 -------------------
const webview1 = getCurrentInstance().proxy;
const iframeView = ref(null)
const videoUrl = ref(""); // 视频地址
const allPopupVisible = ref(false);
const carStatus = ref(true)
const currentTime = ref("");
const showSpeed = ref(false);
const showRepairReason = ref(false);
const constSpeed = ref(1);
const setVisible = ref(false);
const showSound = ref(false);
const carType = ref("1");
const orderNo = ref("");
const vehicleId = ref("");
const operMode = ref(false);
const operFB = ref(0);
const operDir = ref(0);
const directionCenter = ref({});
const directionDynamics = ref({});
const acceleratorCenter = ref({});
const acceleratorDynamics = ref({});
const allPopup = ref(null);
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
const batteryPer = ref(100)
// 菜单配置
const menuList = computed(() => {
  if (carType.value == 1) {
    return [
      {
        name: "报修",
        icon: repairs,
        key: "repairs",
        iconSelect: repairs,
        type: 1,
      },
      {
        name: "前差",
        icon: before_diff,
        key: "chBefore",
        iconSelect: before_diff_selected,
        type: 1,
      },
      {
        name: "后差",
        icon: after_diff,
        key: "chAfter",
        iconSelect: after_diff_selected,
        type: 1,
      },
      { name: "CH4", icon: ch1, key: "ch4", iconSelect: ch_selected, type: 1 },
      {
        name: "高低",
        icon: speeds,
        key: "highLowSpeed",
        iconSelect: speeds_selected,
        type: 1,
      },
      {
        name: "定速",
        icon: cSpeeds,
        key: "speed",
        iconSelect: cSpeeds_selected,
        type: 1,
      },
    ];
  }

  if (carType.value == 2) {
    return [
      {
        name: "报修",
        icon: repairs,
        key: "repairs",
        iconSelect: repairs,
        type: 1,
      },
      {
        name: "",
        icon: light,
        key: "light",
        iconSelect: light_selected,
        type: 2,
      },
    ];
  }
  return [
    {
      name: "报修",
      icon: repairs,
      key: "repairs",
      iconSelect: repairs,
      type: 1,
    },
    {
      name: "",
      icon: light,
      key: "light",
      iconSelect: light_selected,
      type: 2,
    },
  ];
});

// 计费定时器
let sendMsgTimer = null;
let billingTimer = null;
let tipTimer = null;
let isRequesting = false;

// 用户信息
const userInfo = computed(() => uni.getStorageSync("userInfo") || {});
const balance = computed(() => userInfo.value?.wallet?.balance || 0);
const energy = computed(() => userInfo.value?.wallet?.energy || 0);

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
  clearAllTimers()
  console.log("触发结束逻辑：发送中位值、停车");
};

// 发送继续驾驶请求
const sendConDrive = () => {


  const carInfo = JSON.parse(uni.getStorageSync("carInfo"));
  if (!carInfo) return;


  let count = 0;
  if (carInfo.billing_method == 0) {
    const balanceVal = carInfo.payment_type == 1 ? balance.value : energy.value;
    const totalCycles = Math.trunc(balanceVal / carInfo.billing_rules.battery);
    count = totalCycles * (carInfo.billing_rules.time * 2);
  } else {
    count = carInfo.billing_rules.time * 2;
  }


  if (count <= 0) {
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

    if (num >= count - 1) {
      clearInterval(billingTimer);
      billingTimer = null;
      numTip.value = 0;
      tipTimer = setInterval(() => {
        numTip.value++;
        if (numTip.value === 25 && !hasTriggeredTip) {
          hasTriggeredTip = true;
          allPopup.value.setType("countTip");
          allPopupVisible.value = true;
        }
        if (numTip.value >= 30) {
          clearInterval(tipTimer);
          tipTimer = null;
          handleDriveEnd();
        }
      }, 1000);
    }

    try {
      await StartDrive({
        order_no: orderNo.value,
        type: 2,
        vehicle_id: vehicleId.value,
      });
    } catch (e) {
      console.error("继续驾驶请求失败", e);
    } finally {
      isRequesting = false;
    }
  }, 30 * 1000);
};


// 获取视频设备信息
const GetDeviceInfo = (data) => {
  DeviceDetails({ ...data })
    .then((res) => {
      if (res.data?.rows?.length) {
        videoUrl.value = 'https://xyvision.top:8028/?device_id=' + carDetails.value.front_camera + '&token=' + data.token + '&initAction=video_only'; // 根据实际字段调整 
      }
    })
    .catch(() => { });
};

const handleMessage = (e) => {
  console.log('收到消息:', e.detail.data);
}

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

// 图标点击处理
const handleIcon = (item) => {
  if (item.key === "repairs") {
    allPopupVisible.value = true;
    allPopup.value.setType("repair", true);
    return;
  }

  const updateChannel = (key, chKey) => {
    if (item.key === key) {
      const config = carDetails.value.vehicle_config_detail[chKey];
      const valueObj = activeKey.value.includes(item.key)
        ? config.close_value
        : config.open_value;
      chValue.value[chKey] = valueObj.current_value;
    }
  };

  updateChannel("chBefore", "ch5");
  updateChannel("chAfter", "ch6");
  updateChannel("ch4", "ch4");
  updateChannel("highLowSpeed", "ch3");

  const index = activeKey.value.indexOf(item.key);
  if (index > -1) {
    activeKey.value.splice(index, 1);
    if (item.key === "speed") showSpeed.value = false;
  } else {
    activeKey.value.push(item.key);
    if (item.key === "speed") showSpeed.value = true;
  }
};

// 弹窗动作处理
const handlePopupAction = (type) => {
  if (type == "report") {
    allPopupVisible.value = false;
    showRepairReason.value = false;
    return;
  }
  if (type == "repair") {
    allPopupVisible.value = true;
    showRepairReason.value = true;
    return;
  }
  if (type == "driving") {
    StartDrive({
      order_no: orderNo.value,
      type: 1,
      vehicle_id: vehicleId.value,
    })
      .then((res) => {
        allPopupVisible.value = false;
        if (res.code != 200) uni.showToast({ title: res.msg, icon: "none" });
        else sendConDrive();
      })
      .catch(() => {
        allPopupVisible.value = false;
      })
      .finally(() => {
        allPopupVisible.value = false;
      });
    return;
  }
  if (type == "logout") {
    StartDrive({
      order_no: orderNo.value,
      type: 3,
      vehicle_id: vehicleId.value,
    })
      .then((res) => {
        if (res.code != 2000) {
          uni.showToast({ title: res.msg, icon: "none" });

          setTimeout(() => {

            UDPSocket.value.close()

            uni.reLaunch({
              url: '/pages/mine/reservation'  // 你的首页路径
            })
          }, 2000);

        }
        else {
          uni.showToast({ title: res.msg, icon: "none" });
        }

      })
      .catch(() => { });
  }
};

const handleOper = (type) => {
  operMode.value = type == "mode2";
};

// 是否开启相反方向
const handleFBDir = (val) => {
  const arr = val.split("_");
  if (arr[0] == 1) operFB.value = arr[1] === "true" ? 1 : 0;
  if (arr[0] == 2) operDir.value = arr[1] === "true" ? 1 : 0;
  if (arr[0] == 3) operFB.value = arr[1] === "true" ? 1 : 0;
  if (arr[0] == 4) operDir.value = arr[1] === "true" ? 1 : 0;

  // 四驱车 液压挖机
  carHandler.value.setReverseStatus(!!operFB.value, !!operDir.value)

};

const changeVal = (value) => {
  directionCenter.value.current_value = value[1];
  directionDynamics.value.current_value = value[2];
  acceleratorDynamics.value.current_value = value[3];
  carHandler.value.setConfigValue({
    0: { ...directionCenter.value },
    2: { ...directionDynamics.value },
    3: { ...acceleratorDynamics.value },
  });
};

const set = () => {
  setVisible.value = true;
  showSpeed.value = false;
  handleFBDrive({ fb: false, value: 0 });
  handleIcon("speed");
};

const logout = () => {
  console.log(123)
  allPopup.value.setType("logout");
  allPopupVisible.value = true;
  showSpeed.value = false;
  handleFBDrive({ fb: false, value: 0 });
  handleIcon("speed");
};



// 无操作报警
const handleInactivityAlarm = () => {
  allPopupVisible.value = true;
  allPopup.value.setType("longTimeTip");
};
const { resetTimer, startListening } = useInactivityAlarm(
  180 * 1000,
  handleInactivityAlarm,
);
// 页面触摸事件（小程序主要交互方式）
const onUserActivity = () => {
  resetTimer();
};

onUnload(() => {
  if (UDPSocket.value) {
    UDPSocket.value.close()
    UDPSocket.value = null
  }
})
// ------------------- 生命周期 -------------------
// 先onload 再onMounted
// 前置摄像头 切换清晰度 前置 切换的前置 有喇叭， 后置摄像头只有标清
onLoad((options) => {
  initRouteData(options);
  startListening();
});

onMounted(() => {
  console.log("onMounted")
  if (!uni.getStorageSync("sendNum")) uni.setStorageSync("sendNum", 0);
  initTimer(); // 时钟
  initVehicleConfig(); //获取配置 加载车辆类型
  initSocket(); // 微信小程序 udp

  initSendLoop();
  initTopVideo();
});

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
    if (type >= 10 && type <= 19) carType.value = "1";
    else if (type >= 20 && type <= 29) carType.value = "2";
    else carType.value = "3";
  } else {
    console.log("carDetails 空")
  }
};

const initVehicleConfig = () => {
  const details = carDetails.value;
  if (!details) return;

  // 初始化车辆配置
  if (carDetails.value) {
    operFB.value = carDetails.value.reverse_left_right || 0;
    operDir.value = carDetails.value.reverse_up_down || 0;
    directionCenter.value = carDetails.value.direction_center || {};
    directionDynamics.value = carDetails.value.direction_dynamics || {};
    acceleratorCenter.value = carDetails.value.accelerator_center || {};
    acceleratorDynamics.value = carDetails.value.accelerator_dynamics || {};

    const config = carDetails.value.vehicle_config_detail || {};
    ["ch3", "ch4", "ch5", "ch6", "ch7", "ch8"].forEach((key) => {
      if (config[key])
        chValue.value[key] = config[key].close_value.current_value;
    });
    chValue.value.ch1 = directionCenter.value.current_value;
    chValue.value.ch2 = acceleratorCenter.value.current_value;

    // 四驱车
    if (carType.value == 1) {
      carHandler.value = new CarControlHandler({
        reverseUpDownState: operFB.value != 0,
        reverseLeftRightState: operDir.value != 0,
        ch1: directionCenter.value.current_value,
        ch2: acceleratorDynamics.value.current_value,
        0: { ...directionCenter.value },
        1: { ...carDetails.value.accelerator_center },
        2: { ...directionDynamics.value },
        3: { ...acceleratorDynamics.value },
      });
    }
    // 液压挖机
    if (carType.value == 3) {
      carHandler.value = new ExcavatorControlHandler({
        reverseUpDownState: operFB.value != 0,
        reverseLeftRightState: operDir.value != 0,
        ...carDetails.value.vehicle_config_detail,
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
  console.log(wssUrl, wssPort)
  // #ifdef MP-WEIXIN

  if (UDPSocket.value) {
    console.log("关闭UDPSocket")
    UDPSocket.value.close()
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
      console.warn("5秒内未收到消息");
      carStatus.value = false;
    }, 5000);
  }

  // 初始启动
  startMessageTimeout();


  // #endif
}

// 初始化定时循环发送
const initSendLoop = () => {
  clearSendTimer();
  console.log("循环发送数据")
  sendMsgTimer = setInterval(() => {

    if (UDPSocket.value) {
      const app_id = carDetails.value.app_transmitter_id;
      
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

// 四驱车 前进后退
const handleFBDrive = (item) => {
  console.log(item)
  showSpeed.value = false;
  let type = "";
  let ratioValue = 0;
  if (item.fb == true) {
    type = "upType";
    ratioValue = mapToPer(Math.abs(item.value));
  } else {
    if (item.value == 0) {
      type = "endType";
      chValue.value.ch2 = acceleratorCenter.value.current_value;
      return;
    } else {
      type = "downType";
      ratioValue = mapToPer(Math.abs(item.value));
    }
  }
  carHandler.value.handleTwoDirectionControlChannel(true, type, ratioValue);
  chValue.value.ch2 = carHandler.value.ch2;
  console.log('ch2:', chValue.value.ch2)
};

// 速度
const changeConstSpeed = (e) => {
  constSpeed.value = e.detail.value;
  carHandler.value.handleTwoDirectionControlChannel(
    true,
    "upType",
    constSpeed.value / 100,
  );
};

// 四驱车 左右
const handleLRDrive = (item) => {
  let type = "endType";
  let ratioValue = 0;
  if (item.lr == true) {
    ratioValue = mapToPer(Math.abs(item.value));
    type = "leftType";
  } else {
    if (item.value == 0) {
      chValue.value.ch1 = directionCenter.value.current_value;
    } else {
      ratioValue = mapToPer(Math.abs(item.value));
      type = "rightType";
    }
  }
  carHandler.value.handleTwoDirectionControlChannel(false, type, ratioValue);
  chValue.value.ch1 = carHandler.value.ch1;
};


onUnmounted(() => {
  clearAllTimers();
  clearInterval(timerNum.value);
});

// 遥杆操作 挖机
const handleLeftDrive = (param) => {
  handleComDrive("left", param);
};

const handleDrive = (param) => {
  if (param.isLeft) {
    carHandler.value.handleArrowControlChannel(
      "left",
      param.type == 'up' ? true : false,
    );
  } else {
    carHandler.value.handleArrowControlChannel(
      "right",
      param.type == 'up' ? true : false,
    );
  }

  const ch = carHandler.value.getChValue();
  chValue.value.ch3 = ch.ch3;
  chValue.value.ch4 = ch.ch4;
  chValue.value.ch5 = ch.ch5;
  chValue.value.ch6 = ch.ch6;
  chValue.value.ch7 = ch.ch7;
};

// 遥杆操作
const handleRightDrive = (param) => {
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
  } else {
    carHandler.value.handleRemoteControlChannel(
      type,
      param.left,
      param.right,
      param.up,
      param.down,
    );
  }

  const ch = carHandler.value.getChValue();
  chValue.value.ch3 = ch.ch3;
  chValue.value.ch4 = ch.ch4;
  chValue.value.ch5 = ch.ch5;
  chValue.value.ch6 = ch.ch6;
  chValue.value.ch7 = ch.ch7;
};
</script>

<style lang="scss" scoped>
/* 横屏页面已配置 pageOrientation: landscape，无需旋转 hack，直接用百分比/rpx 布局 */
.landscape-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #fff;
}

cover-view,
cover-image {
  visibility: visible !important;
  z-index: 99999;
}

.page-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
}



.logout-wrapper {
  position: fixed;
  z-index: 100000;
  /* 确保比 cover-view 的层级更高 */
  top: 10px;
  /* 和 .logout 的 top 保持一致 */
  left: 20px;
  /* 和 .logout 的 left 保持一致 */
  width: 40px;
  /* 宽高要和按钮图片大小一致 */
  height: 40px;
  background: rgba(255, 0, 0, 0.5);
  /* 调试时可以加个背景色看看位置对不对，比如 background: rgba(255,0,0,0.5); */
}

.logout {
  position: fixed;
  z-index: 99999;
  top: 10px;
  left: 20px;
  width: 30px;
  height: 30px;

  .image {
    width: 27px;
    height: 27px;
  }
}


.right-cont {
  position: fixed;
  z-index: 99999;
  top: 40px;
  right: 20px;

  .image {
    width: 27px;
    height: 27px;
  }
}

.status-bar-capsule {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20rpx;
  position: fixed;
  z-index: 99999;
  top: 10rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 3rpx 15rpx;

  .flex {
    display: flex;
    align-items: center;
  }

  .fl {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }

  .car {
    position: relative;

    .image {
      width: 25px;
      height: 25px;

    }

    .mini-forbidden {
      position: absolute;
      bottom: 10px;
      right: -2px;
    }
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #09ff77;
    margin-right: 5px;
  }

  .time-text {
    font-size: 20px;
    color: #fff;

  }
}

.tip {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20rpx;

  position: fixed;
  z-index: 99999;
  top: 50rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 4rpx 16rpx;
  color: #ccc;
  font-size: 22rpx;
}

.mini-forbidden {
  display: inline-block;
  width: 6px;
  height: 6px;
  border: 2px solid #ff4d4f;
  border-radius: 50%;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 2px;
    background: #ff4d4f;
    transform: translate(-50%, -50%) rotate(45deg);
  }
}

.side-menu-icon {

  position: fixed;
  z-index: 99999;
  top: 40px;
  right: 60px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;

  .image {
    width: 28px;
    height: 28px;
  }
}

.side-menu {
  position: fixed;
  z-index: 99999;
  top: 80px;
  right: 14px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: rgba(20, 20, 20, 0.75);
  backdrop-filter: blur(20rpx);
  border-radius: 40rpx;
  padding: 10rpx 4rpx;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  .img {
    width: 18px;
    height: 18px;
    margin-bottom: 2px;
  }

  .label {
    font-size: 14px;
    color: #fff;
  }
}

.slider {

  position: fixed;
  z-index: 99999;
  bottom: 30px;
  right: 60px;
  width: 120px;
}

.slider-wrapper {
  .num {
    position: absolute;
    top: 30px;
    transform: translateX(-50%);
    color: #fff;
    font-size: 14px;
    white-space: nowrap;
  }

  .slider-label {
    position: relative;
    height: 40px;
  }

  .slider-label-bottom {
    display: flex;
    justify-content: space-between;

    .num-text {
      color: #fff;
      font-size: 14px;
    }
  }
}

.time {
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
</style>

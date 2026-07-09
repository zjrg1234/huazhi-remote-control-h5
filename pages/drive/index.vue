<template>
  <div class="landscape-page">
    <div class="page-content">
      <!-- 背景区域（原 iframe 改为 video 组件） -->
      <div class="bg">
        <iframe
          :src="videoUrl"
          controls
          autoplay
          muted
          object-fit="fill"
          style="width:100%; height:100%"
        ></iframe>
      </div>

      <!-- 退出按钮 -->
      <div class="logout" @click="logout">
        <image src="/static/images/icon_exit@2x.png" class="image" mode="aspectFit" />
      </div>

      <!-- 顶部状态栏 -->
      <div class="status-bar-capsule">
        <div class="flex">
          <div class="fl">
            <span class="dot"></span>
            <div class="car">
              <image class="image" src="/static/images/icon_car@2x.png" mode="aspectFit" />
              <span class="mini-forbidden"></span>
            </div>
          </div>
          <div>
            <!-- <battery :percent="40"></battery> -->
          </div>
          <div><span class="time-text">|</span></div>
          <div><span class="time-text">{{ currentTime }}</span></div>
        </div>
      </div>

      <!-- 剩余时间提示 -->
      <div class="tip" v-if="numTip > 0">
        距离本次结束驾驶还有{{ 31 - numTip }}s
      </div>

      <!-- 设置按钮 -->
      <div class="right-cont" @click="set">
        <image  class="image" src="/static/images/icon_set@2x.png" mode="aspectFit" />
      </div>

      <!-- 声音/波纹图标 -->
      <div class="side-menu-icon">
        <!-- <Ripple /> -->
        <image
          v-if="!showSound"
          src="/static/images/icon_sound_close@2x.png"
          @click="showSound = true"
          mode="aspectFit"
        />
        <image
          v-if="showSound"
          src="/static/images/icon_sound_open@2x.png"
          @click="showSound = false"
          mode="aspectFit"
        />
      </div>

      <!-- 右侧菜单 -->
      <div class="side-menu">
        <div
          class="menu-item"
          v-for="(item, index) in menuList"
          :key="index"
          @click="handleIcon(item)"
        >
          <image
            class="img"
            mode="aspectFit"
            :src="activeKey.includes(item.key) ? item.iconSelect : item.icon"
          />
          <span class="label">{{ item.name }}</span>
        </div>
      </div>

      <!-- 定速滑块 -->
      <div class="slider" v-show="showSpeed">
        <div class="slider-left">
          <div class="slider-wrapper">
            <div class="slider-label">
              <div class="num" :style="{ left: constSpeed + '%' }">
                {{ constSpeed }} km/h
              </div>
            </div>
            <slider
              :value="constSpeed"
              :min="1"
              :max="100"
              :step="1"
              activeColor="#f5c542"
              backgroundColor="#e9e9e9"
              block-size="14"
              @change="changeConstSpeed"
            />
            <div class="slider-label-bottom">
              <div class="num-text num-left">0</div>
              <div class="num-text num-right">100</div>
            </div>
          </div>
        </div>
      </div>

   
      <!-- <LeftRight @action="handleLRDrive" :isLeft="operMode"></LeftRight>

     
      <UpDown @action="handleFBDrive" :isLeft="!operMode"></UpDown> -->

      <!-- 时间显示 -->
      <div class="time">
        <image class="image" src="/static/images/icon_time@2x.webp" mode="aspectFit" />
        <TimeClock></TimeClock> 
      </div>

      <!-- 通用弹窗 -->
      <ALLPopup
        ref="allPopup"
        v-model:show="allPopupVisible"
        type="tip"
        :orderNo="orderNo"
        :vehicleId="vehicleId"
        :isShow="showRepairReason"
        @action="handlePopupAction"
      />

      <!-- 设置弹窗 -->
       <SetPopup
        v-model:show="setVisible"
        :videoDefinition="videoDefinition"
        :operFB="operFB"
        :directionCenter="directionCenter"
        :acceleratorDynamics="acceleratorDynamics"
        :directionDynamics="directionDynamics"
        :operDir="operDir"
        :type="carType"
        @action="handleOper"
        @operAction="handleFBDir"
        @changeValue="changeVal"
      /> 
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ALLPopup from './components/tip.vue'
import SetPopup from './components/set.vue'
// import Ripple from './components/Ripple.vue'
 import TimeClock from './components/timeclock1.vue'
// import battery from './components/battery.vue'
// import UpDown from './components/UpDown.vue'
// import LeftRight from './components/LeftRight.vue'
import { formatTime, mapToPer } from '@/utils/utils'
import { getWebSocket } from '@/utils/socket'
import { handleDriverSocketData } from '@/utils/socketHelper'
import { encryptAES } from '@/utils/crypto'
import { StartDrive } from '@/axios/index.js'
import { LoginTop, DeviceDetails } from '@/axios/video.js'
import { CarControlHandler } from './control/siqu.js'
import { useInactivityAlarm } from './control/useInactivityAlarm.js'
import {
  ch1, speeds, cSpeeds, repairs, ch_selected,
  speeds_selected, cSpeeds_selected, after_diff,
  after_diff_selected, before_diff, before_diff_selected,
  light, light_selected
} from './control/img.js'

// ------------------- 状态 -------------------
const videoUrl = ref('')              // 视频地址
const allPopupVisible = ref(false)
const currentTime = ref('')
const showSpeed = ref(false)
const showRepairReason = ref(false)
const constSpeed = ref(1)
const setVisible = ref(false)
const showSound = ref(false)
const carType = ref('1')
const orderNo = ref('')
const vehicleId = ref('')
const operMode = ref(false)
const operFB = ref(0)
const operDir = ref(0)
const directionCenter = ref({})
const directionDynamics = ref({})
const acceleratorCenter = ref({})
const acceleratorDynamics = ref({})
const allPopup = ref(null)
const activeKey = ref([])
const chValue = ref({ ch1: '', ch2: '', ch3: '', ch4: '', ch5: '', ch6: '', ch7: '', ch8: '' })
const carDetails = ref(null)
const videoDefinition = ref('1')
const carHandler = ref(null)
const ws = ref(null)
const numTip = ref(0)

// 菜单配置
const menuList = ref([
  { name: '报修', icon: repairs, key: 'repairs', iconSelect: repairs, type: 1 },
  { name: '前差', icon: before_diff, key: 'chBefore', iconSelect: before_diff_selected, type: 1 },
  { name: '后差', icon: after_diff, key: 'chAfter', iconSelect: after_diff_selected, type: 1 },
  { name: 'CH4', icon: ch1, key: 'ch4', iconSelect: ch_selected, type: 1 },
  { name: '高低', icon: speeds, key: 'highLowSpeed', iconSelect: speeds_selected, type: 1 },
  { name: '定速', icon: cSpeeds, key: 'speed', iconSelect: cSpeeds_selected, type: 1 },
  { name: '', icon: light, key: 'light', iconSelect: light_selected, type: 2 }
])

// 计费定时器
let sendMsgTimer = null
let billingTimer = null
let tipTimer = null
let isRequesting = false

// 用户信息
const userInfo = computed(() => uni.getStorageSync('userInfo') || {})
const balance = computed(() => userInfo.value?.wallet?.balance || 0)
const energy = computed(() => userInfo.value?.wallet?.energy || 0)

// ------------------- 工具函数 -------------------
const clearSendTimer = () => {
  if (sendMsgTimer) {
    clearInterval(sendMsgTimer)
    sendMsgTimer = null
  }
}

const clearAllTimers = () => {
  clearSendTimer()
  if (billingTimer) {
    clearInterval(billingTimer)
    billingTimer = null
  }
  if (tipTimer) {
    clearInterval(tipTimer)
    tipTimer = null
  }
}

// 结束驾驶逻辑
const handleDriveEnd = () => {
  clearAllTimers()
  console.log('触发结束逻辑：发送中位值、停车')
}

// 发送继续驾驶请求
const sendConDrive = () => {
  clearAllTimers()
  const carInfo = uni.getStorageSync('carInfo')
  if (!carInfo) return

  let count = 0
  if (carInfo.billing_method == 0) {
    const balanceVal = carInfo.payment_type == 1 ? balance.value : energy.value
    const totalCycles = Math.trunc(balanceVal / carInfo.billing_rules.battery)
    count = totalCycles * (carInfo.billing_rules.time * 2)
  } else {
    count = carInfo.billing_rules.time * 2
  }

  if (count <= 0) {
    handleDriveEnd()
    return
  }

  let num = Number(uni.getStorageSync('sendNum') || 0)
  let hasTriggeredTip = false

  // 30S 之后若提示  5s 之后弹窗
  billingTimer = setInterval(async () => {
    if (isRequesting) return
    num++
    uni.setStorageSync('sendNum', num)
    isRequesting = true

    if (num >= count - 1) {
      clearInterval(billingTimer)
      billingTimer = null
      numTip.value = 0
      tipTimer = setInterval(() => {
        numTip.value++
        if (numTip.value === 25 && !hasTriggeredTip) {
          hasTriggeredTip = true
          allPopup.value.setType('countTip')
          allPopupVisible.value = true
        }
        if (numTip.value >= 30) {
          clearInterval(tipTimer)
          tipTimer = null
          handleDriveEnd()
        }
      }, 1000)
    }

    try {
      await StartDrive({ order_no: orderNo.value, type: 2, vehicle_id: vehicleId.value })
    } catch (e) {
      console.error('继续驾驶请求失败', e)
    } finally {
      isRequesting = false
    }
  }, 30 * 1000)
}

// 初始化定时循环发送
const initSendLoop = () => {
  clearSendTimer()
  sendMsgTimer = setInterval(() => {
    if (ws.value && ws.value.readyState === 1) {
      const val = handleDriverSocketData(
        carDetails.value.app_transmitter_id,
        chValue.value.ch1, chValue.value.ch2, chValue.value.ch3,
        chValue.value.ch4, chValue.value.ch5, chValue.value.ch6,
        chValue.value.ch7, chValue.value.ch8
      )
      ws.value.send(val)
    }
  }, 3000)
}

// 3秒内快速发送数据（每40ms一次）
const initThreeSend = () => {
  const maxCount = 75
  let count = 0
  clearSendTimer()
  sendMsgTimer = setInterval(() => {
    count++
    if (ws.value && ws.value.readyState === 1) {
      const val = handleDriverSocketData(
        carDetails.value.app_transmitter_id,
        chValue.value.ch1, chValue.value.ch2, chValue.value.ch3,
        chValue.value.ch4, chValue.value.ch5, chValue.value.ch6,
        chValue.value.ch7, chValue.value.ch8
      )
      ws.value.send(val)
    }
    if (count >= maxCount) {
      clearInterval(sendMsgTimer)
      sendMsgTimer = null
      initSendLoop()
    }
  }, 40)
}

// 获取视频设备信息
const GetDeviceInfo = (data) => {
  DeviceDetails({ ...data }).then(res => {
    if (res.data?.rows?.length) {
      videoUrl.value = res.data.rows[0].hls || res.data.rows[0].url || '' // 根据实际字段调整
    }
  }).catch(() => {})
}

// 初始化摄像头播放
const initTopVideo = () => {
  if (!carDetails.value?.web_camera_user_name) return
  LoginTop({
    username: carDetails.value.web_camera_user_name,
    password: encryptAES(carDetails.value.web_camera_user_password),
    usertype: '0'
  }).then(res => {
    if (res.code == 200) GetDeviceInfo(res.data)
  }).catch(() => {})
}

// 图标点击处理
const handleIcon = (item) => {
  if (item.key === 'repairs') {
    allPopupVisible.value = true
    allPopup.value.setType('repair', true)
    return
  }

  const updateChannel = (key, chKey) => {
    if (item.key === key) {
      const config = carDetails.value.vehicle_config_detail[chKey]
      const valueObj = activeKey.value.includes(item.key)
        ? config.close_value
        : config.open_value
      chValue.value[chKey] = valueObj.current_value
    }
  }

  updateChannel('chBefore', 'ch5')
  updateChannel('chAfter', 'ch6')
  updateChannel('ch4', 'ch4')
  updateChannel('highLowSpeed', 'ch3')

  const index = activeKey.value.indexOf(item.key)
  if (index > -1) {
    activeKey.value.splice(index, 1)
    if (item.key === 'speed') showSpeed.value = false
  } else {
    activeKey.value.push(item.key)
    if (item.key === 'speed') showSpeed.value = true
  }
}

// 弹窗动作处理
const handlePopupAction = (type) => {
  if (type == 'report') {
    allPopupVisible.value = false
    showRepairReason.value = false
    return
  }
  if (type == 'repair') {
    allPopupVisible.value = true
    showRepairReason.value = true
    return
  }
  if (type == 'driving') {
    StartDrive({ order_no: orderNo.value, type: 1, vehicle_id: vehicleId.value })
      .then(res => {
        allPopupVisible.value = false
        if (res.code != 200) uni.showToast({ title: res.msg, icon: 'none' })
        else sendConDrive()
      })
      .catch(() => { allPopupVisible.value = false })
      .finally(() => { allPopupVisible.value = false })
    return
  }
  if (type == 'logout') {
    StartDrive({ order_no: orderNo.value, type: 3, vehicle_id: vehicleId.value })
      .then(res => {
        if (res.code != 2000) uni.showToast({ title: res.msg, icon: 'none' })
        else setTimeout(() => { uni.navigateBack() }, 2000)
      })
      .catch(() => {})
  }
}

const handleOper = (type) => {
  operMode.value = type == 'mode2'
}

const handleFBDir = (val) => {
  const arr = val.split('_')
  if (arr[0] == 1) operFB.value = arr[1] === 'true' ? 1 : 0
  if (arr[0] == 2) operDir.value = arr[1] === 'true' ? 1 : 0
}

const changeVal = (value) => {
  directionCenter.value.current_value = value[1]
  directionDynamics.value.current_value = value[2]
  acceleratorDynamics.value.current_value = value[3]
  carHandler.value.setConfigValue({
    0: { ...directionCenter.value },
    2: { ...directionDynamics.value },
    3: { ...acceleratorDynamics.value }
  })
}

const set = () => {
  setVisible.value = true
  showSpeed.value = false
  handleFBDrive({ fb: false, value: 0 })
  handleIcon('speed')
}

const logout = () => {
  allPopup.value.setType('logout')
  allPopupVisible.value = true
  showSpeed.value = false
  handleFBDrive({ fb: false, value: 0 })
  handleIcon('speed')
}

const handleFBDrive = (item) => {
  showSpeed.value = false
  let type = ''
  let ratioValue = 0
  if (item.fb == true) {
    type = 'upType'
    ratioValue = mapToPer(Math.abs(item.value))
  } else {
    if (item.value == 0) {
      type = 'endType'
      chValue.value.ch2 = acceleratorCenter.value.current_value
    } else {
      type = 'downType'
      ratioValue = mapToPer(Math.abs(item.value))
    }
  }
  carHandler.value.handleTwoDirectionControlChannel(true, type, ratioValue)
  chValue.value.ch2 = carHandler.value.ch2
}

const changeConstSpeed = (e) => {
  constSpeed.value = e.detail.value
  carHandler.value.handleTwoDirectionControlChannel(true, 'upType', constSpeed.value / 100)
}

const handleLRDrive = (item) => {
  let type = 'endType'
  let ratioValue = 0
  if (item.lr == true) {
    ratioValue = mapToPer(Math.abs(item.value))
    type = 'leftType'
  } else {
    if (item.value == 0) {
      chValue.value.ch1 = directionCenter.value.current_value
    } else {
      ratioValue = mapToPer(Math.abs(item.value))
      type = 'rightType'
    }
  }
  carHandler.value.handleTwoDirectionControlChannel(false, type, ratioValue)
  chValue.value.ch1 = carHandler.value.ch1
}

// 无操作报警
const handleInactivityAlarm = () => {
  allPopupVisible.value = true
  allPopup.value.setType('longTimeTip')
}
const { resetTimer: resetInactivityTimer } = useInactivityAlarm(180 * 1000, handleInactivityAlarm)

// ------------------- 生命周期 -------------------
onLoad((options) => {
  orderNo.value = options.order_no || ''
  vehicleId.value = options.vehicle_id || ''
  const details = uni.getStorageSync('carDetails')
  if (details) {
    carDetails.value = JSON.parse(details)
    videoDefinition.value = carDetails.value.video_definition || '1'
    const type = carDetails.value.vehicle_type
    if (type >= 10 && type <= 19) carType.value = '1'
    else if (type >= 20 && type <= 29) carType.value = '2'
    else carType.value = '3'
  }

  // 初始化车辆配置
  if (carDetails.value) {
    operFB.value = carDetails.value.reverse_left_right || 0
    operDir.value = carDetails.value.reverse_up_down || 0
    directionCenter.value = carDetails.value.direction_center || {}
    directionDynamics.value = carDetails.value.direction_dynamics || {}
    acceleratorCenter.value = carDetails.value.accelerator_center || {}
    acceleratorDynamics.value = carDetails.value.accelerator_dynamics || {}

    const config = carDetails.value.vehicle_config_detail || {}
    ;['ch3','ch4','ch5','ch6','ch7','ch8'].forEach(key => {
      if (config[key]) chValue.value[key] = config[key].close_value.current_value
    })
    chValue.value.ch1 = directionCenter.value.current_value
    chValue.value.ch2 = acceleratorCenter.value.current_value

    carHandler.value = new CarControlHandler({
      reverseUpDownState: operFB.value != 0,
      reverseLeftRightState: operDir.value != 0,
      ch1: directionCenter.value.current_value,
      ch2: acceleratorDynamics.value.current_value,
      0: { ...directionCenter.value },
      1: { ...carDetails.value.accelerator_center },
      2: { ...directionDynamics.value },
      3: { ...acceleratorDynamics.value }
    })
  }

  // 初始化 WebSocket
  const wssUrl = uni.getStorageSync('wssUrl') || 'zksjtest.zksjyk.cn'
  const wssPort = uni.getStorageSync('wssPort') || '80'
  ws.value = getWebSocket(`ws://${wssUrl}:${wssPort}/ws`, {
    maxReconnectCount: 5,
    reconnectInterval: 3000,
    heartBeatInterval: 30000
  })
  ws.value.connect()

  // 初始化发送定时器
  setTimeout(() => {
    initThreeSend()
    initTopVideo()
  }, 500)
})

onMounted(() => {
  if (!uni.getStorageSync('sendNum')) uni.setStorageSync('sendNum', 0)
  // 时钟
  let num = 1
  const timer = setInterval(() => {
    currentTime.value = formatTime(++num)
  }, 1000)
  // 清理时一并移除
  onUnmounted(() => clearInterval(timer))
})

onUnmounted(() => {
  clearAllTimers()
  if (ws.value) ws.value.close()
})
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

.page-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
}

.bg {
  background: rgba(0,0,0,0.3);
  height: 100%;
  position: relative;
}

.logout {
  position: absolute;
  z-index: 1;
  top: 10px;
  left: 20px;
  .image {
    width: 27px;
    height: 27px;
  }
}

.right-cont {
  position: absolute;
  z-index: 1;
  top: 10px;
  right: 20px;
  .image {
    width: 27px;
    height: 27px;
  }
}

.status-bar-capsule {
  background: rgba(0,0,0,0.5);
  border-radius: 20rpx;
  position: absolute;
  top: 10rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 4rpx 16rpx;
  .flex {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }
  .fl {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }
  .car {
    position: relative;
    .image {
      width: 20rpx;
      height: 20rpx;
    }
    .mini-forbidden {
      position: absolute;
      bottom: 2rpx;
      right: -2rpx;
    }
  }
  .dot {
    width: 6rpx;
    height: 6rpx;
    border-radius: 50%;
    background: #09ff77;
  }
  .time-text {
    font-size: 20rpx;
    color: #fff;
  }
}

.tip {
  background: rgba(0,0,0,0.5);
  border-radius: 20rpx;
  position: absolute;
  top: 50rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 4rpx 16rpx;
  color: #ccc;
  font-size: 22rpx;
}

.mini-forbidden {
  display: inline-block;
  width: 8rpx;
  height: 8rpx;
  border: 2rpx solid #ff4d4f;
  border-radius: 50%;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8rpx;
    height: 2rpx;
    background: #ff4d4f;
    transform: translate(-50%, -50%) rotate(45deg);
  }
}

.side-menu-icon {
  position: fixed;
  top: 40rpx;
  right: 60rpx;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  align-items: center;
  image {
    width: 30rpx;
    height: 30rpx;
  }
}

.side-menu {
  position: fixed;
  top: 50px;
  right: 14px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: rgba(20,20,20,0.75);
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
  position: absolute;
  z-index: 1;
  top: 200rpx;
  right: 50rpx;
  width: 160rpx;
}

.slider-wrapper {
  .num {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    color: #fff;
    font-size: 20rpx;
    white-space: nowrap;
  }
  .slider-label {
    position: relative;
    height: 40rpx;
  }
  .slider-label-bottom {
    display: flex;
    justify-content: space-between;
    margin-top: 4rpx;
    .num-text {
      color: #fff;
      font-size: 18rpx;
    }
  }
}

.time {
  position: absolute;
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
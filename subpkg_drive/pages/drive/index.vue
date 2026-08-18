<template>
  <view class="landscape-page">
    <view class="page-content" @touchstart="onUserActivity" @touchmove="onUserActivity">
      <!-- @touchstart="onUserActivity" @touchmove="onUserActivity" -->
      <cover-view class="logout" @click="logout">
        <cover-image src="./static/icon_exit@2x.png" class="image" mode="aspectFit" />
      </cover-view>
      <!-- #ifdef MP-WEIXIN -->

      <!-- <view class="logout-wrapper" @click="logout">
         内层依然是 cover-view 保证能悬浮在 web-view 上 
       
      </view> -->

      <web-view :src="videoUrl" ref="iframeView"></web-view>

      <!-- #endif -->
      <!-- 退出按钮 -->

      <!-- 顶部状态栏 -->
      <cover-view class="status-bar-capsule">
        <cover-view class="flex">
          <cover-view class="fl">
            <cover-view class="dot" :class="{ 'dot-red': !carStatus }"></cover-view>
            <cover-view class="car">
              <cover-image class="image" src="./static/icon_car@2x.png" mode="aspectFit" />
              <cover-view class="mini-forbidden" :style="{ display: !carStatus ? 'block' : 'none' }"
                v-show="!carStatus"></cover-view>
            </cover-view>
          </cover-view>
          <cover-view>
            <battery :percent="batteryPer"></battery>

          </cover-view>
          <cover-view class="vlot-text">{{ vlot }}</cover-view>
          <cover-view class="split-vertical"></cover-view>
          <cover-view class="time-text">
            {{ currentTime }}
          </cover-view>
        </cover-view>
      </cover-view>

      <!-- 剩余时间提示 -->
      <cover-view class="tip" v-show="numTip > 0" :style="{ display: numTip > 0 ? 'block' : 'none' }">
        <cover-view>距离本次结束驾驶还有{{ 31 - numTip }}s</cover-view>
      </cover-view>

      <!-- 设置按钮 -->
      <cover-view class="right-cont" @click="set">
        <cover-image class="image" src="./static/icon_set@2x.png" mode="aspectFit" />
      </cover-view>

      <!-- 声音/波纹图标 -->
      <!-- <cover-view class="side-menu-icon">
        <microphone @action="handleMic"></microphone>
        <cover-image class="image sound" v-show="!showSound" :style="{ display: !showSound ? 'block' : 'none' }"
          src="./static/icon_sound_close@2x.png" @click="handleSound(true)" mode="aspectFit" />
        <cover-image class="image sound" v-show="showSound" :style="{ display: showSound ? 'block' : 'none' }"
          src="./static/icon_sound_open@2x.png" @click="handleSound(false)" mode="aspectFit" />
      </cover-view> -->

      <!-- 右侧菜单 -->
      <!-- 右侧菜单 -->
      <cover-view class="side-menu">
        <cover-view class="menu-item" v-for="(item, index) in menuList" :key="index" @click="handleIcon(item)">
          <cover-image class="img" mode="aspectFit" :src="activeKey.includes(item.key) ? item.iconSelect : item.icon" />
          <cover-view class="label">{{ item.name }}</cover-view>
        </cover-view>
      </cover-view>

      <!-- 定速巡航 滑块 -->
      <cover-view class="slider" v-show="showSpeed">
        <cover-view class="slider-left">
          <cover-view class="slider-wrapper-cont">
            <cover-view class="slider-label">
              <cover-view class="num" :style="{ left: '50%' }">
                {{ constSpeed }}
              </cover-view>
            </cover-view>
            <!-- <slider :value="constSpeed" :min="1" :max="100" :step="1" activeColor="#f5c542" backgroundColor="#e9e9e9"
              block-size="6" @change="changeConstSpeed" /> -->

            <SliderComp :disabledSlider="true" v-model="constSpeed" :min="1" :max="100" height="30px"
              @change="changeConstSpeed">
            </SliderComp>

            <cover-view class="slider-label-bottom">
              <cover-view class="num-text num-left">1</cover-view>
              <cover-view class="num-text num-right">100</cover-view>
            </cover-view>
          </cover-view>
        </cover-view>
      </cover-view>

      <LeftRight @action="handleLRDrive" v-show="carType == 1" :isLeft="operMode"></LeftRight>
      <UpDown @action="handleFBDrive" v-show="carType == 1" :isLeft="!operMode"></UpDown>

      <ExLeft @action="handleLeftDrive" @action2="handleDrive" v-show="carType == 3"></ExLeft>
      <ExRight @action="handleRightDrive" @action2="handleDrive" v-show="carType == 3" :mode="operMode"></ExRight>
      <!-- <pointOprea1 @action="handleLeftDrive" v-if="carType == 3"></pointOprea1> -->
      <!-- <pointOprea2 @action="handleRightDrive" v-if="carType == 3"></pointOprea2> -->

      <!-- 时间显示 -->
      <cover-view class="time-clock">
        <cover-image class="image" src="./static/icon_time@2x.png" />
        <TimeClock></TimeClock>
      </cover-view>

      <!-- 通用弹窗 -->
      <!-- <ALLPopup ref="allPopup" v-model:show="allPopupVisible" type="tip" :orderNo="orderNo" :vehicleId="vehicleId"
        :isShow="showRepairReason" @action="handlePopupAction" /> -->

      <!-- 设置弹窗 -->
      <!-- <SetPopup v-model:show="setVisible" :videoDefinition="videoDefinition" :operFB="operFB"
        :directionCenter="directionCenter" :acceleratorDynamics="acceleratorDynamics"
        :directionDynamics="directionDynamics" :operDir="operDir" :type="carType" @action="handleOper"
        @operAction="handleFBDir" @changeValue="changeVal" /> -->

      <cover-view v-show="setVisible" :style="{ display: setVisible ? 'block' : 'none' }" class="custom-popup-mask"
        @click="close">
        <!-- <cover-view class="fe"> -->
        <cover-view class="custom-popup-right" @click.stop>
          <cover-view class="cont">
            <cover-view class="left">
              <!-- type 1 是遥控车 -->
              <cover-view class="group" v-show="selectedIndex == 0 && carType == '1'">
                <!-- <cover-view class="group-item">
                  <cover-view class="tit">视频清晰度</cover-view>
                  <cover-view class="flex">
                    <cover-view v-for="(item, index) in qualityList" :key="index" class="btn-quality"
                      :class="{ active: currentQuality === item.value }" @click="handleSelect(item.value)">
                      {{ item.label }}
                    </cover-view>
                  </cover-view>
                </cover-view> -->
                <cover-view class="group-item">
                  <cover-view class="tit">操作设置</cover-view>
                  <cover-view class="flex">
                    <cover-view v-for="(mode, index) in steeringModes" :key="index" class="option-card"
                      :class="{ 'is-active': selectedMode === mode.id }" @click="handleSetSelect(mode.id)">
                      <!-- 右上角的黄色对勾 (仅当选中时显示) -->

                      <cover-view v-show="selectedMode === mode.id" class="check-mark" :style="{
                        display: selectedMode === mode.id ? 'block' : 'none',
                      }">
                        <cover-image class="image" src="./static/icon_selected@2x.png" mode="widthFix"></cover-image>
                      </cover-view>
                      <!-- 布局区域：根据配置交换左右顺序 -->
                      <cover-view class="content-layout" :class="{ 'reverse-layout': mode.isReverse }">
                        <!-- 左侧/第一组图标 -->
                        <cover-view class="icon-group">
                          <cover-view class="icon-row vertical">
                            <cover-image src="./static/arrow_up@2x.png" class="icon-img"></cover-image>
                            <cover-image src="./static/arrow_down@2x.png" class="icon-img"></cover-image>
                          </cover-view>
                          <cover-view class="label">前进/后退</cover-view>
                        </cover-view>
                        <!-- 右侧/第二组图标 -->
                        <cover-view class="icon-group">
                          <cover-view class="icon-row horizontal">
                            <cover-image src="./static/arrow_left@2x.png" class="icon-img"></cover-image>
                            <cover-image src="./static/arrow_right@2x.png" class="icon-img"></cover-image>
                          </cover-view>
                          <cover-view class="label">左转/右转</cover-view>
                        </cover-view>
                      </cover-view>
                    </cover-view>
                  </cover-view>
                </cover-view>
                <cover-view class="group-item pr">
                  <cover-view class="flex fj">
                    <cover-view class="tit">方向反向操作</cover-view>

                    <SwitchComp v-model="operDir" @change="setHandleOper(2, $event)"></SwitchComp>
                  </cover-view>
                  <cover-view class="flex fj">
                    <cover-view class="tit">进退反向操作</cover-view>

                    <SwitchComp v-model="operFB" @change="setHandleOper(1, $event)"></SwitchComp>
                  </cover-view>
                </cover-view>
              </cover-view>

              <cover-view class="group" v-show="selectedIndex == 0 && (carType == '2' || carType == '3')
                ">
                <!-- <cover-view class="group-item">
                  <cover-view class="tit">视频清晰度</cover-view>
                  <cover-view class="flex">
                    <cover-view v-for="(item, index) in qualityList" :key="index" class="btn-quality"
                      :class="{ active: currentQuality === item.value }" @click="handleSelect(item.value)">
                      {{ item.label }}
                    </cover-view>
                  </cover-view>
                </cover-view> -->
                <cover-view class="group-item">
                  <cover-view class="tit">操作设置</cover-view>
                  <cover-view class="flex">
                    <cover-view v-for="(mode, index) in steeringModes" :key="index" class="option-card"
                      :class="{ 'is-active': selectedMode === mode.id }" @click="handleSetSelect(mode.id)">
                      <cover-image class="image" v-show="selectedMode === mode.id && index == 0"
                        src="./static/icon_ev_dir1_selected@2x.png" mode="widthFix"></cover-image>
                      <cover-image class="image" v-show="selectedMode !== mode.id && index == 0"
                        src="./static/icon_ev_dir1@2x.png" mode="widthFix"></cover-image>
                      <cover-image class="image" v-show="selectedMode === mode.id && index == 1"
                        src="./static/icon_ev_dir2_selected@2x.png" mode="widthFix"></cover-image>
                      <cover-image class="image" v-show="selectedMode !== mode.id && index == 1"
                        src="./static/icon_ev_dir2@2x.png" mode="widthFix"></cover-image>
                    </cover-view>
                  </cover-view>
                </cover-view>
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

              <cover-view class="group" v-show="selectedIndex == 1">
                <cover-view class="group-item">
                  <cover-view class="tit">方向中位微调</cover-view>
                  <cover-view class="section">
                    <!-- 减少按钮 -->
                    <cover-view class="reduce" @touchstart.prevent="onTouchStart(1, -1)" @touchend.stop="onTouchEnd"
                      @touchcancel.stop="onTouchEnd">
                      <cover-image class="image" src="./static/icon_reduce@2x.png" mode="widthFix"></cover-image>
                    </cover-view>
                    <!-- 滑块区域（占据主要空间） -->
                    <cover-view class="slider-wrapper">
                      <cover-view class="slider-label">
                        <cover-view class="num" :style="{ left: '50%' }">
                          {{ dirMiddleVal }}
                        </cover-view>
                      </cover-view>
                      <!-- <slider :min="1" :max="100" :value="dirMiddle" @change="setChangeVal(1, $event)"
                        activeColor="#f5c542" backgroundColor="#e5e5e5" block-size="20" /> -->
                      <SliderComp v-model="dirMiddle" :min="1" :max="100" @change="setChangeVal(1, $event)">
                      </SliderComp>
                      <cover-view class="slider-label-bottom">
                        <cover-view class="num-text">
                          {{ directionCenter.mini_value }}
                        </cover-view>
                        <cover-view class="num-text">
                          {{ directionCenter.max_value }}
                        </cover-view>
                      </cover-view>
                    </cover-view>
                    <!-- 增加按钮 -->
                    <cover-view class="add" @touchstart.prevent="onTouchStart(1, 1)" @touchend.stop="onTouchEnd"
                      @touchcancel.stop="onTouchEnd">
                      <cover-image class="image" src="./static/icon_add@2x.png" mode="widthFix"></cover-image>
                    </cover-view>
                    <!-- 保存按钮 -->
                    <cover-view class="btn" @click="save(1)">保存</cover-view>
                  </cover-view>
                </cover-view>
                <cover-view class="group-item">
                  <cover-view class="tit">方向力度微调</cover-view>
                  <cover-view class="section">
                    <!-- 减少按钮 -->
                    <cover-view class="reduce" @touchstart.prevent="onTouchStart(2, -1)" @touchend.stop="onTouchEnd"
                      @touchcancel.stop="onTouchEnd">
                      <cover-image class="image" src="./static/icon_reduce@2x.png" mode="widthFix"></cover-image>
                    </cover-view>
                    <!-- 滑块区域（占据主要空间） -->
                    <cover-view class="slider-wrapper">
                      <cover-view class="slider-label">
                        <cover-view class="num" :style="{ left: '50%' }">
                          {{ dirTurn }}
                        </cover-view>
                      </cover-view>

                      <SliderComp v-model="dirTurn" :min="1" :max="directionDynamics.current_value"
                        @change="setChangeVal(2, $event)"></SliderComp>
                      <cover-view class="slider-label-bottom">
                        <cover-view class="num-text">
                          {{ directionDynamics.mini_value }}
                        </cover-view>
                        <cover-view class="num-text">
                          {{ directionDynamics.current_value }}
                        </cover-view>
                      </cover-view>
                    </cover-view>
                    <!-- 增加按钮 -->
                    <cover-view class="add" @touchstart.prevent="onTouchStart(2, 1)" @touchend.stop="onTouchEnd"
                      @touchcancel.stop="onTouchEnd">
                      <cover-image class="image" src="./static/icon_add@2x.png" mode="widthFix"></cover-image>
                    </cover-view>
                    <!-- 保存按钮 -->
                    <cover-view class="btn" @click="save(2)">保存</cover-view>
                  </cover-view>
                </cover-view>
                <cover-view class="group-item">
                  <cover-view class="tit">油门力度微调</cover-view>
                  <cover-view class="section">
                    <!-- 减少按钮 -->
                    <cover-view class="reduce" @touchstart.prevent="onTouchStart(3, -1)" @touchend.stop="onTouchEnd"
                      @touchcancel.stop="onTouchEnd">
                      <cover-image class="image" src="./static/icon_reduce@2x.png" mode="widthFix"></cover-image>
                    </cover-view>
                    <!-- 滑块区域（占据主要空间） -->
                    <cover-view class="slider-wrapper">
                      <cover-view class="slider-label">
                        <cover-view class="num" :style="{ left: '50%' }">
                          {{ throttle }}
                        </cover-view>
                      </cover-view>

                      <SliderComp v-model="throttle" :min="1" :max="acceleratorDynamics.current_value"
                        @change="setChangeVal(3, $event)"></SliderComp>

                      <cover-view class="slider-label-bottom">
                        <cover-view class="num-text num-left">
                          {{ acceleratorDynamics.mini_value }}
                        </cover-view>
                        <cover-view class="num-text num-right">
                          {{ acceleratorDynamics.current_value }}
                        </cover-view>
                      </cover-view>
                    </cover-view>
                    <!-- 增加按钮 -->
                    <cover-view class="add" @touchstart.prevent="onTouchStart(3, 1)" @touchend.stop="onTouchEnd"
                      @touchcancel.stop="onTouchEnd">
                      <cover-image class="image" src="./static/icon_add@2x.png" mode="widthFix"></cover-image>
                    </cover-view>
                    <!-- 保存按钮 -->
                    <cover-view class="btn" @click="save(3)">保存</cover-view>
                  </cover-view>
                </cover-view>
              </cover-view>
            </cover-view>
            <cover-view class="right">
              <cover-view class="settings-bar">
                <cover-view class="text-area" @click="close">设置</cover-view>
                <cover-view class="close-btn" @click="close">
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
          </cover-view>
        </cover-view>
        <!-- </cover-view> -->
      </cover-view>

      <!-- <input v-show="type === 'repair'" :style="{ display: allPopupVisible ? 'block' : 'none' }" v-model="message"
        class="repair-input" type="text" maxlength="20" placeholder="请输入故障原因，最多20字（选填）" /> -->

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
                  <cover-view class="btn right" @tap.stop="handlePopupAction('logout')">退出驾驶</cover-view>
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
                <cover-view class="btn right" @tap.stop="continueDrive">继续驾驶</cover-view>
              </cover-view>
            </cover-view>

          </cover-view>
        </cover-view>
      </cover-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, getCurrentInstance } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/modules/user";

// import ALLPopup from "./components/tip.vue";
// import SetPopup from "./components/set.vue";
// import microphone from "./components/microphone.vue";
import TimeClock from "./components/tclock.vue";
import battery from "./components/battery.vue";
import SwitchComp from "./components/switchComp.vue";
import SliderComp from "./components/sliderComp.vue";
import UpDown from "./components/up-down.vue";
import LeftRight from "./components/left-right.vue";
// import pointOprea1 from "./components/digger-opera1.vue";
// import pointOprea2 from "./components/digger-opera2.vue";
import ExLeft from "./components/ex-left.vue";
import ExRight from "./components/ex-right.vue";

import { StartDrive, UpdateBattery, SetKey } from "@/axios/index.js";
import { LoginTop, DeviceDetails } from "./axios/video.js";

import {
  formatTime,
  mapToPer,
  handleBattery,
  createReverseMapper,
  createMapperNew,
} from "./utils/utils.js";
import UDPSocketClient from "./utils/udpSocket.js";
import { handleDriverSocketData } from "./utils/socketHelper.js";
import { encryptAES } from "./utils/crypto.js";

import { CarControlHandler } from "./control/siqu.js";
import { ExcavatorControlHandler } from "./control/excavator.js";
import { useHESbus } from "./composables/useHESbus.js";
import { useInactivityAlarm } from "./composables/useInactivityAlarm.js";
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
} from "./utils/img.js";
// import { reactive } from "vue";

// ------------------- 状态 -------------------

const videoUrl = ref(""); // 视频地址
const allPopupVisible = ref(false);
const type = ref('tip')
const carStatus = ref(false);
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
const operFB = ref(false);
const operDir = ref(false);
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
const batteryPer = ref(100);
const vlot = ref('')
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
        name: "后差",
        icon: after_diff,
        key: "chAfter",
        iconSelect: after_diff_selected,
        type: 1,
      },
      {
        name: "前差",
        icon: before_diff,
        key: "chBefore",
        iconSelect: before_diff_selected,
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


const videoUrlVal = ref();
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

const handleMic = (val) => {
  // val false 是打开 true 是关闭
  if (videoUrl.value.includes("video_audio")) {
    videoUrl.value = videoUrl.value.replace(/micVal=\d+/, `micVal=${!val ? '1' : '0'}`);

  } else {
    const newUrl = videoUrl.value
      .replace(/initAction=[^&]*/, `initAction=${!val ? 'video_audio' : 'video_only'}`)
      .replace(/micVal=[^&]*/, `micVal=${!val ? '1' : '0'}`);
    videoUrl.value = newUrl;
  }
  console.log(videoUrl.value)

}


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
    console.log(num, "num")
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
          count.value = 6
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
      continueDrive()
    }
    isRequesting = false;
  }, 30 * 1000);
}

// 发送继续驾驶请求
const sendConDrive = async () => {
  console.log("开始发送继续驾驶请求");
  await continueDrive()
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
}
// 获取视频设备信息

//video_only:自动打开视频
//video_audio:自动打开视频+音频
const GetDeviceInfo = (data) => {
  DeviceDetails({ ...data })
    .then((res) => {
      if (res.data?.rows?.length) {

        const base = 'https://vedioafz.fzbkapp.com/';
        const query = `?device_id=${encodeURIComponent(carDetails.value.front_camera)}&token=${encodeURIComponent(data.token)}&initAction=video_only&videoDefinition=${carDetails.value.video_definition}&defaultCameraClarity=${carDetails.value.default_camera_clarity}&_t=${Date.now()}`;
        // const query = `?device_id=${encodeURIComponent('1002211')}&token=${encodeURIComponent(data.token)}&initAction=video_only&videoDefinition=${carDetails.value.video_definition}&defaultCameraClarity=${carDetails.value.default_camera_clarity}&closeFlag=0&_t=${Date.now()}`;
        videoUrl.value = base + query;

        console.log("请求接口之后的url:", videoUrl.value)

        // videoUrl.value =
        //   "https://xyvision.top:8028/?device_id=" +
        //   carDetails.value.front_camera +
        //   "&token=" +
        //   data.token +
        //   "&initAction=video_audio"; // 根据实际字段调整
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

// 图标点击处理
const handleIcon = (item) => {
  if (item.key === "repairs") {
    reportModal();
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

const logoutOne = () => {

  clearAllTimers();
  clearInterval(timerNum.value);
  clearInterval(countdownTimer);

  if (UDPSocket.value) {
    UDPSocket.value.close();
  }
  uni.redirectTo({
    url: "/subpkg_mine/pages/mine/reservation", // 你的首页路径
  });

}
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
        }
        else {
          daojishiTip()
          sendConDrive();
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

    StartDrive({
      order_no: orderNo.value,
      type: 3,
      vehicle_id: vehicleId.value,
    }, true)
      .then((res) => {

        if (res.code == 2000 || res.code == 200) {

          SetKey({
            order_no: orderNo.value,
            type: 1
          }).then(res1 => {
            uni.showToast({ title: "退出驾驶成功", icon: "none" });
            console.log("电池电量", batteryPer.value)
            UpdateBattery({
              vehicle_id: vehicleId.value,
              vehicle_battery: batteryPer.value
            })
            const timer = setTimeout(() => {
              clearInterval(sendMsgTimer);
              if (UDPSocket.value) {
                UDPSocket.value.close();
              }
              clearTimeout(timer);

              uni.redirectTo({
                url: "/subpkg_mine/pages/mine/reservation", // 你的首页路径
              });
            }, 2100);

          }).catch()

        } else {
          uni.showToast({ title: res.msg, icon: "none" });
        }
      })
      .catch((e) => {
        console.log("catch", e);
      }).finally(() => {

      });
  }
};

const handleOper = (type) => {
  operMode.value = type == "mode2";
};



const set = () => {
  saveFlag.value = { 1: false, 2: false, 3: false }
  setVisible.value = true;
  showSpeed.value = false;
  handleFBDrive({ fb: false, value: 0 });
  const mapNum = createReverseMapper(
    1,
    100,
    directionCenter.value.mini_value,
    directionCenter.value.max_value,
  );
  console.log("点击设置， 当前中位值", saveVal.value[1])
  dirMiddle.value = mapNum(saveVal.value[1]);
  dirMiddleValFunc(dirMiddle.value);
  dirTurn.value = saveVal.value[2]
  throttle.value = saveVal.value[3]
};

const logout = () => {
  allPopupVisible.value = true;
  type.value = "logout";
  showSpeed.value = false;
  handleFBDrive({ fb: false, value: 0 });
  handleIcon("speed");
};

const logoutCont = ref(5);
// 无操作报警
const handleInactivityAlarm = () => {
  allPopupVisible.value = true;
  type.value = "longTimeTip";
  const timer = setInterval(() => {
    logoutCont.value -= 1;
    if (logoutCont.value == 0) {
      logoutCont.value == 0;
      handlePopupAction("logout");
      clearInterval(timer);
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
    if (type >= 10 && type <= 19) carType.value = "1";
    else if (type >= 20 && type <= 29) carType.value = "2";
    else carType.value = "3";
  } else {
    console.log("carDetails 空");
  }
};

const initVehicleConfig = () => {
  const details = carDetails.value;
  if (!details) return;

  // 初始化车辆配置
  if (carDetails.value) {
    // 正反 上下
    operFB.value = carDetails.value.reverse_up_down == 1;
    operDir.value = carDetails.value.reverse_left_right == 1;
    directionCenter.value = carDetails.value.direction_center || {};
    directionDynamics.value = carDetails.value.direction_dynamics || {};
    acceleratorCenter.value = carDetails.value.accelerator_center || {};
    acceleratorDynamics.value = carDetails.value.accelerator_dynamics || {};

    dirMiddle.value = directionCenter.value.current_value
    dirTurn.value = directionDynamics.value.current_value
    throttle.value = acceleratorDynamics.value.current_value

    saveVal.value = {
      1: dirMiddle.value,
      2: dirTurn.value,
      3: throttle.value
    }
    const config = carDetails.value.vehicle_config_detail || {};
    ["ch3", "ch4", "ch5", "ch6", "ch7", "ch8"].forEach((key) => {
      if (config[key])
        chValue.value[key] = config[key].close_value.current_value;
    });
    chValue.value.ch1 = directionCenter.value.current_value;
    chValue.value.ch2 = acceleratorCenter.value.current_value;

    // 走设置清晰度 以及 转换switch 数值
    setQualityList();

    // 四驱车
    if (carType.value == 1) {
      carHandler.value = new CarControlHandler({
        reverseUpDownState: operFB.value,
        reverseLeftRightState: operDir.value,
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
        reverseUpDownState: operFB.value,
        reverseLeftRightState: operDir.value,
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
      vlot.value = Number(model.volt ?? 0).toFixed(1)
      batteryPer.value = handleBattery(model.volt, carDetails.value.battery);
      batteryPer.value = 100;
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
      type.value = 'offLineTip';
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
      // console.log("chValue.ch", chValue.value.ch1,chValue.value.ch2)
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
  console.log(item);

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
  console.log("ch2:", chValue.value.ch2);
};

// 速度
const changeConstSpeed = (value) => {
  // 算速度  1-100 对应1-设置的油门力度  1 + (value - 1) * (45 - 1) / (100 - 1);
  const zhuanhuanVal = 1 + (value - 1) * (throttle.value - 1) / (100 - 1);
  console.log("转换值", zhuanhuanVal)
  // constSpeed.value = value;
  carHandler.value.handleTwoDirectionControlChannel(
    true,
    "upType",
    zhuanhuanVal / throttle.value,
  );
  console.log("定速", zhuanhuanVal / throttle.value)
  chValue.value.ch2 = carHandler.value.ch2;
  console.log("定速ch2:", chValue.value.ch2);
};

// 四驱车 方向左右
const handleLRDrive = (item) => {
  let type = "endType";
  let ratioValue = 0;
  showSpeed.value = false;
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
  clearInterval(countdownTimer);
});
onUnload(() => {
  if (UDPSocket.value) {
    UDPSocket.value.close();
    UDPSocket.value = null;
  }
  clearAllTimers();
  clearInterval(timerNum.value);
  clearInterval(countdownTimer);
})

// 遥杆操作 挖机
const handleLeftDrive = (param) => {
  handleComDrive("left", param);
};

const handleDrive = (param) => {
  if (param.isLeft) {
    carHandler.value.handleArrowControlChannel(
      "left",
      param.type == "up" ? true : false,
    );
  } else {
    // 挖机右
    carHandler.value.handleArrowControlChannel(
      "right",
      param.type == "up" ? true : false,
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

//  set
const qualityList = ref([]);
const currentQuality = ref("1");

const dirMiddle = ref(1);
const dirTurn = ref(1);
const throttle = ref(1);
const dirMiddleVal = ref(0);

// 当前保存的值
const saveVal = ref({
  1: 0,
  2: 0,
  3: 0
});


const dirMiddleValFunc = (num) => {
  console.log("dirMiddleValFunc", num);
  const mapNum = createMapperNew(
    1,
    100,
    directionCenter.value.mini_value ?? 500,
    directionCenter.value.max_value ?? 1500,
    num,
  );

  dirMiddleVal.value = mapNum.toFixed(0);
  console.log("dirMiddleVal.value", dirMiddleVal.value)
};

const setQualityList = () => {
  const qualityListMap = [
    { label: "户外", value: "1" },
    { label: "超清", value: "2" },
    { label: "高清", value: "3" },
    { label: "标清", value: "4" },
  ];
  const targetValues = videoDefinition.value.split(",");
  qualityList.value = qualityListMap.filter((item) =>
    targetValues.includes(item.value),
  );
  currentQuality.value = carDetails.value.default_camera_clarity + '';
};

// 正反 旋转，上下操作
const setHandleOper = (type, val) => {
  console.log(type, val);
  if (type == 1) operFB.value = val;
  if (type == 2) operDir.value = val;
  // 四驱车 液压挖机
  carHandler.value.setReverseStatus(operFB.value, operDir.value);
};

const handleSelect = (value) => {
  currentQuality.value = value;
  videoUrl.value = videoUrl.value.replace(/resRatio=\d+/, `resRatio=${Number(value) - 1}`);
  uni.showToast({ title: "切换成功", icon: "none" })
};

const selectedMode = ref("mode1");
// 定义两种模式的配置数据
const steeringModes = [
  { id: "mode1", isReverse: false }, // 正常布局
  { id: "mode2", isReverse: true }, // 反转布局
];
// 点击切换左右操作
const handleSetSelect = (id) => {
  selectedMode.value = id;
  operMode.value = selectedMode.value == "mode2";
};

const setGroup = ref([
  { name: "通用设置", key: 0 },
  { name: "车辆微调", key: 1 },
]);
const selectedIndex = ref(0);
const handleItem = (index) => {
  selectedIndex.value = index;
};

// 改变值
const changeVal = (value) => {
  // directionCenter.value.current_value = value[1];
  // directionDynamics.value.current_value = value[2];
  // acceleratorDynamics.value.current_value = value[3];
  carHandler.value.setConfigValue({
    0: { current_value: value[0], max_value: directionCenter.value.max_value },
    2: { current_value: value[2], max_value: directionDynamics.value.max_value },
    3: { current_value: value[3], max_value: acceleratorDynamics.value.max_value },
  });

};

// 是否点击保存
const saveFlag = ref({ 1: false, 2: false, 3: false });
const save = (type) => {
  saveFlag.value[type] = true;
  uni.showToast({ title: "保存成功", icon: "none" })
};

const close = () => {
  const val = {
    0: carDetails.value.direction_center.current_value,
    2: carDetails.value.direction_dynamics.current_value,
    3: carDetails.value.accelerator_dynamics.current_value,
  };

  if (saveFlag.value[1]) {
    val[0] = dirMiddleVal.value;
    saveVal.value[1] = dirMiddleVal.value;
  }
  if (saveFlag.value[2]) {
    val[2] = dirTurn.value;
    saveVal.value[2] = dirTurn.value;
  }
  if (saveFlag.value[3]) {
    val[3] = throttle.value;
    saveVal.value[3] = throttle.value;
  }
  changeVal(val);
  setVisible.value = false;

  if (carType.value == 1) {
    if (activeKey.value.includes['speed']) {
      showSpeed.value = true;
    }
  }
};
// 滑动slider
const setChangeVal = (flag, value) => {

  const obj = JSON.parse(uni.getStorageSync("carDetails"));

  let val = Object.assign({}, {
    0: obj.direction_center.current_value,
    2: obj.direction_dynamics.current_value,
    3: obj.accelerator_dynamics.current_value,
  })



  if (flag == 1) {
    dirMiddleValFunc(value);
    dirMiddle.value = value;
    val[0] = dirMiddleVal.value;
    // 改变方向的中位值
    chValue.value.ch1 = dirMiddleVal.value;
  } else if (flag == 2) {
    dirTurn.value = value;
    val[2] = value
  } else {
    throttle.value = value;
    val[3] = value;
  }
  console.log("滑动slider之后,打印当前值", val)
  changeVal(val)
};

let longPressTimer = null;
const INITIAL_DELAY = 300;   // 首次触发前的等待时间(ms)，区分单击和长按
const REPEAT_INTERVAL = 80;  // 长按后重复触发的间隔(ms)

// 触摸开始
const onTouchStart = (type, step) => {
  // 立即执行一次
  handleValueChange(type, step);

  // 设置长按定时器
  longPressTimer = setTimeout(() => {
    clearTimeout(longPressTimer)
    // 首次延迟后，切换为快速重复模式
    longPressTimer = setInterval(() => {
      handleValueChange(type, step);
    }, REPEAT_INTERVAL);
  }, INITIAL_DELAY);
};

// 触摸结束 / 取消
const onTouchEnd = () => {
  longPressTimer && clearTimeout(longPressTimer);
  longPressTimer && clearInterval(longPressTimer);
  longPressTimer = null;
};


const handleAdd = (type) => handleValueChange(type, 1);
const handleReduce = (type) => handleValueChange(type, -1);
const valueMap = { 1: dirMiddle, 2: dirTurn, 3: throttle };
const valueMapMax = { 1: dirMiddle, 2: directionDynamics, 3: acceleratorDynamics };
// 2. 统一的加减处理函数
const handleValueChange = (type, step) => {
  const target = valueMap[type];
  if (!target) return; // 如果 type 不匹配，直接返回
  // 计算新值
  const newValue = target.value + step;
  if (type == 2 || type == 3) {
    target.value = Math.max(1, Math.min(valueMapMax[type].value.current_value, newValue));
  } else {
    target.value = Math.max(1, Math.min(100, newValue));
  }

  // 第一个滑块
  if (type == 1) {
    console.log("第一个滑块")
    dirMiddleValFunc(target.value)
    dirMiddle.value = target.value
  }

};

// --------------------------tip -----------------------

// 点击遮罩层处理（原配置为 false，即不关闭）
const handleMaskClick = () => {
  // 如果需要点击遮罩关闭，可在此处设置 visible.value = false;
};


const message = ref("");
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
};

const report = (text) => {
  let msg = "";

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
        uni.showToast({ title: res.msg, icon: 'none' })
      }
    },
  );
};
</script>

<style lang="scss" scoped>
/* 横屏页面已配置 pageOrientation: landscape，无需旋转 hack，直接用百分比/rpx 布局 */
.landscape-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: rgba(0, 0, 0, 0.6);
}

.page-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  background: rgba(0, 0, 0, 0.6);
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
  z-index: 9999;
  top: 40px;
  right: 20px;

  .image {
    width: 27px;
    height: 27px;
  }
}

.status-bar-capsule {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  position: fixed;
  z-index: 9999;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 10px;

  .mini-forbidden {
    display: inline-block;
    width: 5px;
    height: 4px;
    border: 2px solid #ff4d4f;
    border-radius: 50%;

    position: absolute;
    bottom: 4px;
    right: 0px;

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 2px;
      background: #ff4d4f;
      transform: translate(-50%, -50%) rotate(45deg);
    }
  }

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
      width: 20px;
      height: 20px;
    }
  }



  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #09ff77;
    margin-right: 5px;
  }

  .dot-red {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #ff4d4f;
    margin-right: 5px;
  }

  .vlot-text {
    font-size: 10px;
    color: #fff;
    margin-left: 5px;
  }

  .time-text {
    font-size: 10px;
    color: #fff;
    margin-left: 5px;
    width: 40px;
  }

  .split-vertical {
    width: 1px;
    height: 12px;
    margin-left: 5px;
    background: rgba(255, 255, 255, 0.9);
  }
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
  font-size: 10px;
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
    padding-top: 40px;

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
        color: #ffc838;
      }

      .gradient-line {
        height: 2px;
        /* 线条的高度/粗细 */
        width: 100%;
        /* 线条长度 */

        /* 关键代码：创建线性渐变 */
        background: linear-gradient(to right,
            transparent,
            rgba(245, 197, 66, 0.8) 20%,
            #f5c542 50%,
            rgba(245, 197, 66, 0.8) 80%,
            transparent
            /* 终点：完全透明 */
          );

        margin: 0 auto;

      }
    }
  }

  .left {
    padding: 10px;

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

    .btn-quality {
      background: transparent;
      border: 1px solid #f5c542;
      color: #f5c542;
      padding: 7px 10px 3px 10px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      outline: none;
      margin-right: 5px;
      height: 15px;
      line-height: 15px;
    }

    .btn-quality.active {
      background-color: #f5c542;
      color: #000000;
      font-weight: bold;
      border-color: #f5c542;
    }

    .option-card {
      position: relative;
      width: 150px;
      height: 80px;
      border: 0.5px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      background-color: rgba(0, 0, 0, 0.4);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
    }

    .option-card:hover {
      border-color: rgba(255, 255, 255, 0.6);
    }

    .option-card.is-active {
      border: 1px solid #f5c542;
      background-color: rgba(245, 197, 66, 0.05);
    }

    .check-mark {
      position: absolute;
      top: -0.5px;
      right: -0.5px;
      width: 20px;
      height: 20px;

      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      overflow: hidden;
    }

    .check-mark img {
      position: absolute;
      top: 0;
      right: 0;
      width: 16px;
      height: 16px;
      transform: rotate(0deg);
      display: block;
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
    background: #ffc838;
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
    background: #ffc838;
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
    border: 1px solid #ffc838;
    background-color: #ffc838;
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

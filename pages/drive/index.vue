<template>
  <view class="landscape-page">
    <view class="page-content">
      <!-- @touchstart="onUserActivity" @touchmove="onUserActivity" -->
      <cover-view class="logout" @click="logout">
        <cover-image
          src="/static/images/icon_exit@2x.png"
          class="image"
          mode="aspectFit"
        />
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
            <cover-view
              class="dot"
              :class="{ 'dot-red': !carStatus }"
              v-show="carStatus"
            ></cover-view>
            <cover-view class="car">
              <cover-image
                class="image"
                src="/static/images/icon_car@2x.png"
                mode="aspectFit"
              />
              <cover-view
                class="mini-forbidden"
                v-show="!carStatus"
              ></cover-view>
            </cover-view>
          </cover-view>
          <cover-view>
            <battery :percent="batteryPer"></battery>
          </cover-view>
          <cover-view class="split-vertical"></cover-view>
          <cover-view class="time-text">
            {{ currentTime }}
          </cover-view>
        </cover-view>
      </cover-view>

      <!-- 剩余时间提示 -->
      <cover-view class="tip" v-show="numTip > 0">
        <cover-view>距离本次结束驾驶还有{{ 31 - numTip }}s</cover-view>
      </cover-view>

      <!-- 设置按钮 -->
      <cover-view class="right-cont" @click="set">
        <cover-image
          class="image"
          src="/static/images/icon_set@2x.png"
          mode="aspectFit"
        />
      </cover-view>

      <!-- 声音/波纹图标 -->
      <cover-view class="side-menu-icon">
        <microphone></microphone>
        <cover-image
          class="image"
          v-show="!showSound"
          src="/static/images/icon_sound_close@2x.png"
          @click="showSound = true"
          mode="aspectFit"
        />
        <cover-image
          class="image"
          v-show="showSound"
          src="/static/images/icon_sound_open@2x.png"
          @click="showSound = false"
          mode="aspectFit"
        />
      </cover-view>

      <!-- 右侧菜单 -->
      <!-- 右侧菜单 -->
      <cover-view class="side-menu">
        <cover-view
          class="menu-item"
          v-for="(item, index) in menuList"
          :key="index"
          @click="handleIcon(item)"
        >
          <cover-image
            class="img"
            mode="aspectFit"
            :src="activeKey.includes(item.key) ? item.iconSelect : item.icon"
          />
          <cover-view class="label">{{ item.name }}</cover-view>
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
            <slider
              :value="constSpeed"
              :min="1"
              :max="100"
              :step="1"
              activeColor="#f5c542"
              backgroundColor="#e9e9e9"
              block-size="6"
              @change="changeConstSpeed"
            />
            <cover-view class="slider-label-bottom">
              <cover-view class="num-text num-left">0</cover-view>
              <cover-view class="num-text num-right">100</cover-view>
            </cover-view>
          </cover-view>
        </cover-view>
      </cover-view>

      <LeftRight
        @action="handleLRDrive"
        v-show="carType == 1"
        :isLeft="operMode"
      ></LeftRight>
      <UpDown
        @action="handleFBDrive"
        v-show="carType == 1"
        :isLeft="!operMode"
      ></UpDown>

      <ExLeft
        @action="handleLeftDrive"
        @action2="handleDrive"
        v-show="carType == 3"
      ></ExLeft>
      <ExRight
        @action="handleRightDrive"
        @action2="handleDrive"
        v-show="carType == 3"
      ></ExRight>
      <!-- <pointOprea1 @action="handleLeftDrive" v-if="carType == 3"></pointOprea1> -->
      <!-- <pointOprea2 @action="handleRightDrive" v-if="carType == 3"></pointOprea2> -->

      <!-- 时间显示 -->
      <cover-view class="time-clock">
        <cover-image class="image" src="/static/images/icon_time@2x.png" />
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

      <cover-view
        v-show="setVisible"
        :style="{ display: setVisible ? 'block' : 'none' }"
        class="custom-popup-mask"
      >
        <!-- <cover-view class="fe"> -->
        <cover-view class="custom-popup-right">
          <cover-view class="cont">
            <cover-view class="left">
              <!-- type 1 是遥控车 -->
              <cover-view
                class="group"
                v-show="selectedIndex == 0 && carType == '1'"
              >
                <cover-view class="group-item">
                  <cover-view class="tit">视频清晰度</cover-view>
                  <cover-view class="flex">
                    <cover-view
                      v-for="(item, index) in qualityList"
                      :key="index"
                      class="btn-quality"
                      :class="{ active: currentQuality === item.value }"
                      @click="handleSelect(item.value)"
                    >
                      {{ item.label }}
                    </cover-view>
                  </cover-view>
                </cover-view>
                <cover-view class="group-item">
                  <cover-view class="tit">操作设置</cover-view>
                  <cover-view class="flex">
                    <cover-view
                      v-for="(mode, index) in steeringModes"
                      :key="index"
                      class="option-card"
                      :class="{ 'is-active': selectedMode === mode.id }"
                      @click="handleSetSelect(mode.id)"
                    >
                      <!-- 右上角的黄色对勾 (仅当选中时显示) -->

                      <cover-view
                        v-show="selectedMode === mode.id"
                        class="check-mark"
                        :style="{
                          display: selectedMode === mode.id ? 'block' : 'none',
                        }"
                      >
                        <cover-image
                          class="image"
                          src="/static/images/icon_selected@2x.png"
                          mode="widthFix"
                        ></cover-image>
                      </cover-view>
                      <!-- 布局区域：根据配置交换左右顺序 -->
                      <cover-view
                        class="content-layout"
                        :class="{ 'reverse-layout': mode.isReverse }"
                      >
                        <!-- 左侧/第一组图标 -->
                        <cover-view class="icon-group">
                          <cover-view class="icon-row vertical">
                            <cover-image
                              src="/static/images/arrow_up@2x.png"
                              class="icon-img"
                            ></cover-image>
                            <cover-image
                              src="/static/images/arrow_down@2x.png"
                              class="icon-img"
                            ></cover-image>
                          </cover-view>
                          <cover-view class="label">前进/后退</cover-view>
                        </cover-view>
                        <!-- 右侧/第二组图标 -->
                        <cover-view class="icon-group">
                          <cover-view class="icon-row horizontal">
                            <cover-image
                              src="/static/images/arrow_left@2x.png"
                              class="icon-img"
                            ></cover-image>
                            <cover-image
                              src="/static/images/arrow_right@2x.png"
                              class="icon-img"
                            ></cover-image>
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

                    <SwitchComp
                      v-model="operFB"
                      @change="setHandleOper(1, $event)"
                    ></SwitchComp>
                  </cover-view>
                  <cover-view class="flex fj">
                    <cover-view class="tit">进退反向操作</cover-view>

                    <SwitchComp
                      v-model="operDir"
                      @change="setHandleOper(2, $event)"
                    ></SwitchComp>
                  </cover-view>
                </cover-view>
              </cover-view>

              <cover-view
                class="group"
                v-show="
                  selectedIndex == 0 && (carType == '2' || carType == '3')
                "
              >
                <cover-view class="group-item">
                  <cover-view class="tit">视频清晰度</cover-view>
                  <cover-view class="flex">
                    <cover-view
                      v-for="(item, index) in qualityList"
                      :key="index"
                      class="btn-quality"
                      :class="{ active: currentQuality === item.value }"
                      @click="handleSelect(item.value)"
                    >
                      {{ item.label }}
                    </cover-view>
                  </cover-view>
                </cover-view>
                <cover-view class="group-item">
                  <cover-view class="tit">操作设置</cover-view>
                  <cover-view class="flex">
                    <cover-view
                      v-for="(mode, index) in steeringModes"
                      :key="index"
                      class="option-card"
                      :class="{ 'is-active': selectedMode === mode.id }"
                      @click="handleSetSelect(mode.id)"
                    >
                      <cover-image
                        class="image"
                        v-show="selectedMode === mode.id && index == 0"
                        src="/static/images/icon_ev_dir1_selected@2x.png"
                        mode="widthFix"
                      ></cover-image>
                      <cover-image
                        class="image"
                        v-show="selectedMode !== mode.id && index == 0"
                        src="/static/images/icon_ev_dir1@2x.png"
                        mode="widthFix"
                      ></cover-image>
                      <cover-image
                        class="image"
                        v-show="selectedMode === mode.id && index == 1"
                        src="/static/images/icon_ev_dir2_selected@2x.png"
                        mode="widthFix"
                      ></cover-image>
                      <cover-image
                        class="image"
                        v-show="selectedMode !== mode.id && index == 1"
                        src="/static/images/icon_ev_dir2@2x.png"
                        mode="widthFix"
                      ></cover-image>
                    </cover-view>
                  </cover-view>
                </cover-view>
                <cover-view class="group-item pr">
                  <cover-view class="flex fj">
                    <cover-view class="tit">进退反向操作</cover-view>

                    <SwitchComp
                      v-model="operFB"
                      @change="setHandleOper(1, $event)"
                    ></SwitchComp>
                  </cover-view>
                  <cover-view class="flex fj">
                    <cover-view class="tit">旋转反向操作</cover-view>
                    <SwitchComp
                      v-model="operDir"
                      @change="setHandleOper(2, $event)"
                    ></SwitchComp>
                  </cover-view>
                </cover-view>
              </cover-view>

              <cover-view class="group" v-show="selectedIndex == 1">
                <cover-view class="group-item">
                  <cover-view class="tit">方向中位微调</cover-view>
                  <cover-view class="section">
                    <!-- 减少按钮 -->
                    <cover-view class="reduce" @click="handleReduce(1)">
                      <cover-image
                        class="image"
                        src="/static/images/icon_reduce@2x.png"
                        mode="widthFix"
                      ></cover-image>
                    </cover-view>
                    <!-- 滑块区域（占据主要空间） -->
                    <cover-view class="slider-wrapper">
                      <cover-view class="slider-label">
                        <cover-view
                          class="num"
                          :style="{ left: dirMiddle + '%' }"
                        >
                          {{ dirMiddleVal }}
                        </cover-view>
                      </cover-view>
                      <!-- <slider :min="1" :max="100" :value="dirMiddle" @change="setChangeVal(1, $event)"
                        activeColor="#f5c542" backgroundColor="#e5e5e5" block-size="20" /> -->
                      <SliderComp
                        v-model="dirMiddle"
                        :min="1"
                        :max="100"
                        @change="setChangeVal(1, $event)"
                      ></SliderComp>
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
                    <cover-view class="add" @click="handleAdd(1)">
                      <cover-image
                        class="image"
                        src="/static/images/icon_add@2x.png"
                        mode="widthFix"
                      ></cover-image>
                    </cover-view>
                    <!-- 保存按钮 -->
                    <cover-view class="btn" @click="save(1)">保存</cover-view>
                  </cover-view>
                </cover-view>
                <cover-view class="group-item">
                  <cover-view class="tit">方向力度微调</cover-view>
                  <cover-view class="section">
                    <!-- 减少按钮 -->
                    <cover-view class="reduce" @click="handleReduce(2)">
                      <cover-image
                        class="image"
                        src="/static/images/icon_reduce@2x.png"
                        mode="widthFix"
                      ></cover-image>
                    </cover-view>
                    <!-- 滑块区域（占据主要空间） -->
                    <cover-view class="slider-wrapper">
                      <cover-view class="slider-label">
                        <cover-view
                          class="num"
                          :style="{ left: dirTurn + '%' }"
                        >
                          {{ dirTurn }}
                        </cover-view>
                      </cover-view>

                      <SliderComp
                        v-model="dirTurn"
                        :min="1"
                        :max="100"
                        @change="setChangeVal(2, $event)"
                      ></SliderComp>
                      <cover-view class="slider-label-bottom">
                        <cover-view class="num-text">
                          {{ directionDynamics.mini_value }}
                        </cover-view>
                        <cover-view class="num-text">
                          {{ directionDynamics.max_value }}
                        </cover-view>
                      </cover-view>
                    </cover-view>
                    <!-- 增加按钮 -->
                    <cover-view class="add" @click="handleAdd(2)">
                      <cover-image
                        class="image"
                        src="/static/images/icon_add@2x.png"
                        mode="widthFix"
                      ></cover-image>
                    </cover-view>
                    <!-- 保存按钮 -->
                    <cover-view class="btn" @click="save(2)">保存</cover-view>
                  </cover-view>
                </cover-view>
                <cover-view class="group-item">
                  <cover-view class="tit">油门力度微调</cover-view>
                  <cover-view class="section">
                    <!-- 减少按钮 -->
                    <cover-view class="reduce" @click="handleReduce(3)">
                      <cover-image
                        class="image"
                        src="/static/images/icon_reduce@2x.png"
                        mode="widthFix"
                      ></cover-image>
                    </cover-view>
                    <!-- 滑块区域（占据主要空间） -->
                    <cover-view class="slider-wrapper">
                      <cover-view class="slider-label">
                        <cover-view
                          class="num"
                          :style="{ left: throttle + '%' }"
                        >
                          {{ throttle }}
                        </cover-view>
                      </cover-view>

                      <SliderComp
                        v-model="throttle"
                        :min="1"
                        :max="100"
                        @change="setChangeVal(3, $event)"
                      ></SliderComp>

                      <cover-view class="slider-label-bottom">
                        <cover-view class="num-text num-left">
                          {{ acceleratorDynamics.mini_value }}
                        </cover-view>
                        <cover-view class="num-text num-right">
                          {{ acceleratorDynamics.max_value }}
                        </cover-view>
                      </cover-view>
                    </cover-view>
                    <!-- 增加按钮 -->
                    <cover-view class="add" @click="handleAdd(3)">
                      <cover-image
                        class="image"
                        src="/static/images/icon_add@2x.png"
                        mode="widthFix"
                      ></cover-image>
                    </cover-view>
                    <!-- 保存按钮 -->
                    <cover-view class="btn" @click="save(3)">保存</cover-view>
                  </cover-view>
                </cover-view>
              </cover-view>
            </cover-view>
            <cover-view class="right">
              <cover-view class="settings-bar">
                <cover-view class="text-area">设置</cover-view>
                <cover-view class="close-btn" @click="close">
                  <cover-image
                    class="image"
                    src="/static/images/icon_close@2x.png"
                    mode="widthFix"
                  ></cover-image>
                </cover-view>
              </cover-view>
              <cover-view
                class="setting-group"
                v-for="(item, index) in setGroup"
                :key="index"
              >
                <cover-view
                  class="setting-item"
                  :class="{ active: selectedIndex == item.key }"
                  @click="handleItem(index)"
                >
                  {{ item.name }}
                </cover-view>
                <cover-view
                  class="gradient-line"
                  v-show="selectedIndex == item.key"
                ></cover-view>
              </cover-view>
            </cover-view>
          </cover-view>
        </cover-view>
        <!-- </cover-view> -->
      </cover-view>

      <cover-view
        class="tip-popup-mask"
        v-show="allPopupVisible"
        :style="{ display: allPopupVisible ? 'block' : 'none' }"
        @tap.stop="handleMaskClick"
      >
        <cover-view class="fcenter">
          <!-- 弹窗主体内容 -->
          <cover-view
            class="popup-container"
            :class="{ contmax: type === 'repair' }"
            @tap.stop
          >
            <!-- 场景1：黑屏提示 -->
            <cover-view v-show="type === 'tip'">
              <cover-view class="tip-content">
                <cover-view class="time">倒计时{{ count }}s</cover-view>
                <cover-view class="tit">是否黑屏？</cover-view>
                <cover-view class="text">
                  <cover-view
                    >开始驾驶前如遇黑屏或者车辆故障上报不扣费，开始驾驶后开始计费。</cover-view
                  >
                  <cover-view>如果一切正常，请点击“开始驾驶”</cover-view>
                </cover-view>
              </cover-view>
              <cover-view class="footer">
                <cover-view
                  class="btn left mr"
                  @tap.stop="handleAction('repair')"
                  >上报故障</cover-view
                >
                <cover-view
                  class="btn right"
                  @tap.stop="handleAction('driving')"
                  >开始驾驶</cover-view
                >
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
                  <cover-view
                    class="btn left ml"
                    @tap.stop="handlePopupAction('report')"
                  >
                    上报故障
                  </cover-view>
                </cover-view>
                <cover-view class="flex mt">
                  <cover-view
                    class="btn right"
                    @tap.stop="handlePopupAction('logout')"
                  >
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
                  <cover-view
                    v-for="(item, index) in list"
                    :key="index"
                    @tap="selectReason(index, item)"
                    :class="[
                      'reason-item',
                      { active: selectedReasonIndex === index },
                    ]"
                    >{{ item }}</cover-view
                  >
                </cover-view>
                <!-- 替换 Vant 的 textarea 为原生 input -->
                <cover-view class="ttarea">
                  <input
                    v-model="message"
                    class="custom-textarea"
                    type="text"
                    maxlength="20"
                    placeholder="请输入故障原因，最多20字（选填）"
                  />
                  <cover-view class="word-limit"
                    >{{ message.length }}/20</cover-view
                  >
                </cover-view>
                <cover-view class="warn-tip">
                  温馨提示：上报车辆故障后，车辆将冻结，你将退退出驾驶。若遇到黑屏或者画面卡顿，请重新刷新页面
                </cover-view>
              </cover-view>
              <cover-view class="footer">
                <cover-view class="flex">
                  <cover-view class="btn left" @tap.stop="cancel"
                    >取消</cover-view
                  >
                  <cover-view class="btn right ml" @tap.stop="report"
                    >上报</cover-view
                  >
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
                  <cover-view
                    class="btn right"
                    @tap.stop="handlePopupAction('logout')"
                    >退出驾驶</cover-view
                  >
                </cover-view>
              </cover-view>
            </cover-view>

            <cover-view v-if="type === 'longTimeTip'">
              <!-- 场景5：长时间无操作 -->

              <cover-view class="tip-content">
                <cover-view class="time">【警告】您180秒无操作！</cover-view>
                <cover-view class="tit">三分钟未操作,请立即驾驶</cover-view>
                <cover-view class="text">
                  <cover-view
                    >为防止您的电池被浪费，即将结束本次驾驶，欢迎您下次再来!</cover-view
                  >
                </cover-view>
              </cover-view>
              <cover-view class="footer">
                <cover-view class="flex mt">
                  <cover-view
                    class="btn right"
                    @tap.stop="handleAction('logout')"
                    >退出驾驶</cover-view
                  >
                </cover-view>
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
// import ALLPopup from "./components/tip.vue";
// import SetPopup from "./components/set.vue";
import microphone from "./components/microphone.vue";
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
import {
  formatTime,
  mapToPer,
  handleBattery,
  createReverseMapper,
  createMapperNew,
} from "@/utils/utils.js";
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

const videoUrl = ref(""); // 视频地址
const allPopupVisible = ref(false);
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
  clearAllTimers();
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
        videoUrl.value =
          "https://xyvision.top:8028/?device_id=" +
          carDetails.value.front_camera +
          "&token=" +
          data.token +
          "&initAction=video_only"; // 根据实际字段调整
      }
    })
    .catch(() => {});
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
    .catch(() => {});
};

// 图标点击处理
const handleIcon = (item) => {
  if (item.key === "repairs") {
    allPopupVisible.value = true;
    type.value = "repair";
    showRepairReason.value = true;
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
const handlePopupAction = (val) => {
  // 维修显示 各种原因   上报故障不显示原因
  if (val == "repair" || val == "report") {
    type.value = "repair";
    allPopupVisible.value = true;
    showRepairReason.value = val == "repair" ? true : false;
    return;
  }
  if (val == "driving") {
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
  if (val == "logout") {
    StartDrive({
      order_no: orderNo.value,
      type: 3,
      vehicle_id: vehicleId.value,
    })
      .then((res) => {
        if (res.code != 2000) {
          uni.showToast({ title: res.msg, icon: "none" });

          setTimeout(() => {
            UDPSocket.value.close();

            uni.reLaunch({
              url: "/pages/mine/reservation", // 你的首页路径
            });
          }, 2000);
        } else {
          uni.showToast({ title: res.msg, icon: "none" });
        }
      })
      .catch(() => {});
  }
};

const handleOper = (type) => {
  operMode.value = type == "mode2";
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
  console.log(setVisible.value);
  setVisible.value = true;
  showSpeed.value = false;
  handleFBDrive({ fb: false, value: 0 });
  handleIcon("speed");

  const mapNum = createReverseMapper(
    1,
    100,
    directionCenter.value.mini_value,
    directionCenter.value.max_value,
  );
  dirMiddle.value = mapNum(directionCenter.value.current_value);
  dirMiddleValFunc(dirMiddle.value);
};

const logout = () => {
  allPopupVisible.value = true;
  type.value = "logout";
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
    UDPSocket.value.close();
    UDPSocket.value = null;
  }
});
// ------------------- 生命周期 -------------------
// 先onload 再onMounted
// 前置摄像头 切换清晰度 前置 切换的前置 有喇叭， 后置摄像头只有标清
onLoad((options) => {
  initRouteData(options);
  startListening();
});

const count = ref(15)
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
    operFB.value = !!carDetails.value.reverse_left_right;
    operDir.value = !!carDetails.value.reverse_up_down;
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
};

// 初始化定时循环发送
const initSendLoop = () => {
  clearSendTimer();
  console.log("循环发送数据");
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
  console.log(item);
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
  console.log("ch2:", chValue.value.ch2);
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
      param.type == "up" ? true : false,
    );
  } else {
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

const dirMiddleValFunc = (num) => {
  console.log(num);
  const mapNum = createMapperNew(
    1,
    100,
    directionCenter.value.current_value.mini_value ?? 500,
    directionCenter.value.current_value.max_value ?? 1500,
    num,
  );

  dirMiddleVal.value = mapNum.toFixed(0);
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
  currentQuality.value = targetValues[0];
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
  console.log("点击清晰度");
  currentQuality.value = value;
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
// 是否点击保存
const saveFlag = ref({ 1: false, 2: false, 3: false });
const save = (type) => {
  saveFlag.value[type] = true;
};

const close = () => {
  const obj = JSON.parse(uni.getStorageSync("carDetails"));

  const val = {
    1: obj.direction_center.current_value,
    2: obj.direction_dynamics.current_value,
    3: obj.accelerator_dynamics.current_value,
  };
  if (saveFlag.value[1]) {
    val[1] = dirMiddleVal.value;
  }
  if (saveFlag.value[2]) {
    val[2] = dirTurn.value;
  }
  if (saveFlag.value[3]) {
    val[3] = throttle.value;
  }
  changeVal(val);
  setVisible.value = false;
};
// 滑动slider
const setChangeVal = (flag, value) => {
  const val = value.detail.value;
  if (flag == 1) {
    dirMiddleValFunc(val);
    dirMiddle.value = val;
  } else if (flag == 2) {
    dirTurn.value = val;
  } else {
    throttle.value = val;
  }
};

// --------------------------tip -----------------------

// 点击遮罩层处理（原配置为 false，即不关闭）
const handleMaskClick = () => {
  // 如果需要点击遮罩关闭，可在此处设置 visible.value = false;
};

const type = ref("tip");
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

const report = () => {

  let msg = "";
  if (!showRepairReason.value) {
    if (!message.value) {
      uni.showToast({ title: "请输入内容", icon: "none" });
      return;
    } else {
      msg = message.value;
    }
  } else {
    if (text.value == "其他") {
      if (!message.value) {
        uni.showToast({ title: "请输入内容", icon: "none" });
        return;
      } else {
        msg = message.value;
      }
    } else {
      msg = text.value;
    }
  }

  // 调用 API 上报 2s 退出回去
  CarReport({ order_no: orderNo.value, id: vehicleId.value, text: msg }).then(
    (res) => {
      if (res.code == 200) {
        const timer = setTimeout(() => {
          UDPSocket.value.close();
          clearTimeout(timer);
          uni.reLaunch({
            url: "/pages/mine/reservation", // 你的首页路径
          });
        }, 2000);
      } else {
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
  background: #fff;
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
  padding: 3px 15px;

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
      bottom: 5px;
      right: 0px;
    }
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #09ff77;
    margin-right: 5px;
  }

  .dot-red {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff4d4f;
    margin-right: 5px;
  }

  .time-text {
    font-size: 14px;
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
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  color: #ccc;
  font-size: 22px;
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
  gap: 8px;
  background: rgba(20, 20, 20, 0.75);
  backdrop-filter: blur(20px);
  border-radius: 40px;
  padding: 10px 4px;
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
        background: linear-gradient(
          to right,
          /* 方向：从左到右 */ transparent,
          /* 起点：完全透明 */ rgba(245, 197, 66, 0.8) 20%,
          /* 20%处开始显色 */ #f5c542 50%,
          /* 中间：颜色最深 (#f5c542 是取样的金黄色) */ rgba(245, 197, 66, 0.8)
            80%,
          /* 80%处开始变淡 */ transparent /* 终点：完全透明 */
        );

        margin: 0 auto;
        /* 居中显示 */
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
      padding: 3px 10px;
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
</style>

<style>
cover-view,
cover-image {
  visibility: visible !important;
  z-index: 99999;
}
</style>

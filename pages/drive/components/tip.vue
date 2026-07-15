<!-- MyPopup.vue -->
<template>
  <!-- 弹窗遮罩层与容器 -->
  <view class="popup-mask" v-if="visible" @tap.stop="handleMaskClick">
    <!-- 弹窗主体内容 -->
    <view class="popup-container" :class="{contmax: type === 'repair'}"  @tap.stop>
      
      <!-- 场景1：黑屏提示 -->
      <template v-if="type === 'tip'">
        <view class="tip-content">
          <text class="time">倒计时{{ count }}s</text>
          <text class="tit">是否黑屏？</text>
          <view class="text">
            <text>开始驾驶前如遇黑屏或者车辆故障上报不扣费，开始驾驶后开始计费。</text>
            <text>如果一切正常，请点击“开始驾驶”</text>
          </view>
        </view>
        <view class="footer">
          <text class="btn left mr" @tap.stop="handleAction('repair')">上报故障</text>
          <text class="btn right" @tap.stop="handleAction('driving')">开始驾驶</text>
        </view>
      </template>

      <!-- 场景2：退出驾驶 -->
      <template v-else-if="type === 'logout'">
        <view class="tip-content">
          <text class="tit">退出驾驶</text>
          <view class="text ct">
            <text>未用完的电池将放到余额里</text>
          </view>
        </view>
        <view class="footer fc">
          <view class="flex">
            <text class="btn left" @tap.stop="cancel">取消</text>
            <text class="btn left" @tap.stop="handleAction('report')">上报故障</text>
          </view>
          <view class="flex mt">
            <text class="btn right" @tap.stop="handleAction('logout')">退出驾驶</text>
          </view>
        </view>
      </template>

      <!-- 场景3：维修 -->
      <template v-else-if="type === 'repair'">
        <view class="tip-content repair">
          <text class="tit">设备报修</text>
          <view v-if="isShow" class="reason">
            <text
              v-for="(item, index) in list"
              :key="index"
              @tap="selectReason(index, item)"
              :class="['reason-item', { active: selectedIndex === index }]"
            >{{ item }}</text>
          </view>
          <!-- 替换 Vant 的 textarea 为原生 input -->
          <view class="ttarea">
            <input
              v-model="message"
              class="custom-textarea"
              type="text"
              maxlength="20"
              placeholder="请输入故障原因，最多20字（选填）"
            />
            <text class="word-limit">{{ message.length }}/20</text>
          </view>
          <text class="warn-tip">
            温馨提示：上报车辆故障后，车辆将冻结，你将退退出驾驶。若遇到黑屏或者画面卡顿，请重新刷新页面
          </text>
        </view>
        <view class="footer">
          <view class="flex">
            <text class="btn left" @tap.stop="cancel">取消</text>
            <text class="btn right" @tap.stop="report">上报</text>
          </view>
        </view>
      </template>

      <!-- 场景4：即将结束倒计时 -->
      <template v-if="type === 'countTip'">
        <view class="tip-content">
          <text class="time">倒计时{{ count }}s</text>
          <text class="tit">您的驾驶时间即将结束</text>
          <view class="text">
            <text>即将结束本次驾驶，欢迎您下次再来！</text>
          </view>
        </view>
        <view class="footer">
          <view class="flex mt">
            <text class="btn right" @tap.stop="handleAction('logout')">退出驾驶</text>
          </view>
        </view>
      </template>

      <!-- 场景5：长时间无操作 -->
      <template v-if="type === 'longTimeTip'">
        <view class="tip-content">
          <text class="time">【警告】您180秒无操作！</text>
          <text class="tit">三分钟未操作,请立即驾驶</text>
          <view class="text">
            <text>为防止您的电池被浪费，即将结束本次驾驶，欢迎您下次再来!</text>
          </view>
        </view>
        <view class="footer">
          <view class="flex mt">
            <text class="btn right" @tap.stop="handleAction('logout')">退出驾驶</text>
          </view>
        </view>
      </template>

    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from "vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  orderNo: { type: String, default: "" },
  vehicleId: { type: String, default: "" },
});

const type = ref("tip");
const isShow = ref(false);
const count = ref(15);
const message = ref("");
const text = ref();

let countdownTimer = null;

const list = ref([
  "车辆翻车", "画面卡顿", "无视频信号", "车辆无法控制", "画面黑屏", "电量低", "其他",
]);
const selectedIndex = ref(0);

const selectReason = (index, item) => {
  selectedIndex.value = index;
  text.value = item;
};

onMounted(() => {
  clearCountdown();
  // 注意：uni-app 不支持 sessionStorage，需改用 uni.getStorageSync
  if (uni.getStorageSync('loadingOne') !== "1") {
    visible.value = true;
    countdownTimer = setInterval(() => {
      count.value -= 1;
      if (count.value == 0) {
        count.value = 0;
        clearInterval(countdownTimer);
        countdownTimer = null;
        visible.value = false;
        handleAction("driving");
        uni.setStorageSync('loadingOne', "1");
      }
    }, 1000);
  } else {
    visible.value = false;
  }
  text.value = "车辆翻车";
});

const clearCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

onUnmounted(() => {
  clearCountdown();
});

const emit = defineEmits(["update:show", "action"]);

// 实现 v-model:show 双向绑定
const visible = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val),
});

// 点击遮罩层处理（原配置为 false，即不关闭）
const handleMaskClick = () => {
  // 如果需要点击遮罩关闭，可在此处设置 visible.value = false;
};

const handleAction = (actionType) => {
  countdownTimer && clearInterval(countdownTimer);
  if (actionType == "repair" || actionType == "report") {
    type.value = "repair";
    countdownTimer && clearInterval(countdownTimer);
    return;
  }
  emit("action", actionType);
};

const cancel = () => {
  visible.value = false;
  selectedIndex.value = 0;
};

const report = () => {
  let msg = "";
  if (!isShow.value) {
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

  // 调用 API 上报
  // CarReport({ order_no: props.orderNo, id: props.vehicleId, text: msg })
  //   .then((res) => { ... })
};

const setType = (val, flag) => {
  type.value = val;
  isShow.value = !!flag;
  message.value = "";
  selectedIndex.value = 0;
  text.value = list.value[0];

  if (val === "countTip") {
    count.value = 5;
    countdownTimer = setInterval(() => {
      count.value -= 1;
      if (count.value == 0) {
        count.value = 0;
        clearInterval(countdownTimer);
        countdownTimer = null;
        visible.value = false;
        handleAction("logout");
      }
    }, 1000);
  }
};

defineExpose({ setType });
</script>

<style lang="scss" scoped>
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
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

  .time { font-size: 18px; color: #333; }
  .tit { font-size: 18px; font-weight: bold; color: #333; margin-top: 10rpx; }
  .text { 
    font-size: 14px; color: #666; text-align: left; margin-top: 10rpx; 
    display: flex; flex-direction: column; gap: 4rpx;
  }
  .ct { text-align: center; }
}

.footer {
  display: flex;
  padding: 0 20px 20px;
  justify-content: space-between;
}
.fc { flex-direction: column; }
.flex { display: flex; width: 100%; gap: 10rpx; }

.btn {
  display: block;
  flex: 1;
  text-align: center;
  border-radius: 4rpx;
  font-weight: 400;
  font-size: 18rpx;
  color: #222222;
  padding: 10rpx 0;
}
.left { background: #f0f0f0; }
.right { background: #ffc838; }
.mt { margin-top: 10rpx; }
.mr { margin-right: 10rpx; }

.reason {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  padding: 10rpx 0;
}
.reason-item {
  padding: 5px 10px;
  border-radius: 20rpx;
  color: #666666;
  font-size: 14px;
  border: 1rpx solid #666666;
}
.reason-item.active {
  border: 1rpx solid #ffc838;
  background-color: #ffc838;
  color: #1a1a1a;
}

.warn-tip {
  font-size: 12rpx;
  color: #999999;
  padding-top: 10rpx;
  text-align: left;
}

.ttarea {
 width: 480px;
  margin-top: 10rpx;
  position: relative;
  
  .custom-textarea {
    width: 480px;
     height: 60px;
    background: #f2f2f2;
    padding: 15px;
    border-radius: 6rpx;
    font-size: 14px;
    color: #222;
    box-sizing: border-box;
    text-align: left;
    
  }
  .word-limit {
    position: absolute;
    right: 16px;
    bottom: 2rpx;
    font-size: 14px;
    color: #999;
  }
}
</style>
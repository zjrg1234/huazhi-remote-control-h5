<template>
  <view class="input-item">
  
    <!-- 输入框 -->
    <input
      class="input"
      type="id-number" 
       v-if="inputReady"
      maxlength="6"
      :placeholder="placeholder"
      autocomplete="off"
      autocorrect="off"
      v-model="inputValue"
    
      :name="randomInputName"
    />

    <!-- 右侧按钮 -->
    <text
      class="code-btn"
      :class="{ 'disabled': isCounting }"
      @click="handleClick"
    >
      {{ btnText }}
    </text>
  </view>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import {GetPhoneCode} from "@/axios/index.js"

// 1. 定义延迟渲染的状态
const inputReady = ref(false);
const randomInputName = ref('verify_code_' + Math.random().toString(36).substring(2, 9));

// 2. 页面挂载后延迟 100 毫秒再渲染输入框，破坏浏览器的填充时机
onMounted(() => {
  setTimeout(() => {
    inputReady.value = true;
  }, 100);
});

// --- Props 定义 ---
const props = defineProps({
  modelValue: { type: [String, Number], default: '' }, // 验证码内容
  time: { type: Number, default: 60 }, // 倒计时时长
  placeholder: { type: String, default: '请输入验证码' },
  phone: { type: String, required: true } // 需要传入手机号用于发送请求
});

const emit = defineEmits(['update:modelValue', 'success', 'error']);

const inputValue = ref(props.modelValue);
const isCounting = ref(false);
const count = ref(props.time);
let timer = null;

const btnText = ref('获取验证码');

watch(inputValue, (val) => {
  emit('update:modelValue', val);
});


const sendRequest = async () => {

  try {
    // 模拟网络延迟
    await GetPhoneCode({phone: props.phone})
    
    console.log(`验证码已发送至：${props.phone}`);
    
    // 2. 请求成功
    uni.showToast({ title: '发送成功', icon: 'success' });
    emit('success'); // 通知父组件发送成功
    startCountdown(); // 开始倒计时
  } catch (err) {
    // 3. 请求失败
    uni.showToast({ title: '发送失败，请重试', icon: 'none' });
    emit('error', err); // 通知父组件发送失败
  }
};

// --- 倒计时逻辑 ---
const startCountdown = () => {
  isCounting.value = true;
  count.value = props.time;
  btnText.value = `${count.value}s后重发`;
  
  timer = setInterval(() => {
    count.value--;
    if (count.value <= 0) {
      clearInterval(timer);
      isCounting.value = false;
      btnText.value = '获取验证码';
    } else {
      btnText.value = `${count.value}s后重发`;
    }
  }, 1000);
};

// --- 按钮点击事件 ---
const handleClick = () => {
  if (isCounting.value) return; // 倒计时中禁止点击
  if (!props.phone) {
    uni.showToast({ title: '手机号不能为空', icon: 'none' });
    return;
  }
  
  sendRequest();
};
</script>

<style scoped>

.code-btn {
  color: #FFC200; /* 黄色 */
  font-size: 14px;
}
.code-btn.disabled {
  color: #999; /* 倒计时期间变灰 */
}
/* 其他样式保持不变... */
.input-item {
  height: 88px;
  background-color: #F7F8FA;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  margin-bottom: 15px;
}
.input {
  flex: 1;
  margin-left: 10px;
  font-size: 14px;
  height: 100%;
}
</style>
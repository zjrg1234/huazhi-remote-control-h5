<template>
  <van-popup
    v-model:show="visible"
    :close-on-click-overlay="false"
    position="right"
    teleport="body"
    round
    class="custom-popup-right"
    :style="{ width: '60%', height: '100%' }"
  >
    <div class="cont">
      <div class="left">
        <!-- type 1 是遥控车 -->
        <div class="group" v-if="selectedIndex == 0 && type == '1'">
          <div class="group-item">
            <p class="tit">视频清晰度</p>
            <div class="flex">
              <span
                v-for="(item, index) in qualityList"
                :key="index"
                class="btn-quality"
                :class="{ active: currentQuality === item.value }"
                @click="handleSelect(item.value)"
              >
                {{ item.label }}
              </span>
            </div>
          </div>

          <div class="group-item">
            <p class="tit">操作设置</p>
            <div class="flex">
              <div
                v-for="(mode, index) in steeringModes"
                :key="index"
                class="option-card"
                :class="{ 'is-active': selectedMode === mode.id }"
                @click="handleSetSelect(mode.id)"
              >
                <!-- 右上角的黄色对勾 (仅当选中时显示) -->
                <div v-if="selectedMode === mode.id" class="check-mark">
                  <img src="@/assets/images/icon_selected@2x.png" alt="" />
                </div>

                <!-- 布局区域：根据配置交换左右顺序 -->
                <div
                  class="content-layout"
                  :class="{ 'reverse-layout': mode.isReverse }"
                >
                  <!-- 左侧/第一组图标 -->
                  <div class="icon-group">
                    <div class="icon-row vertical">
                      <IconArrowUp />
                      <IconArrowDown />
                    </div>
                    <span class="label">前进/后退</span>
                  </div>

                  <!-- 右侧/第二组图标 -->
                  <div class="icon-group">
                    <div class="icon-row horizontal">
                      <IconArrowLeft />
                      <IconArrowRight />
                    </div>
                    <span class="label">左转/右转</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="group-item pr">
            <div class="flex fj">
              <span class="tit">方向反向操作</span>
              <van-switch
                v-model="dir1Oper"
                @change="handleOper(1, $event)"
                size="15px"
                active-color="#f5c542"
                inactive-color="#dcdee0"
              />
            </div>

            <div class="flex fj">
              <span class="tit">进退反向操作</span>
              <van-switch
                v-model="dir2Oper"
                @change="handleOper(2, $event)"
                size="15px"
                active-color="#f5c542"
                inactive-color="#dcdee0"
              />
            </div>
          </div>
        </div>

        <div class="group" v-if="selectedIndex == 0 && type == '2'">
          <div class="group-item">
            <p class="tit">视频清晰度</p>
            <div class="flex">
              <span
                v-for="(item, index) in qualityList"
                :key="index"
                class="btn-quality"
                :class="{ active: currentQuality === item.value }"
                @click="handleSelect(item.value)"
              >
                {{ item.label }}
              </span>
            </div>
          </div>

          <div class="group-item">
            <p class="tit">操作设置</p>
            <div class="flex">
              <div
                v-for="(mode, index) in steeringModes"
                :key="index"
                class="option-card"
                :class="{ 'is-active': selectedMode === mode.id }"
                @click="handleSetSelect(mode.id)"
              >
                <img
                  v-if="selectedMode === mode.id && index == 0"
                  src="@/assets/images/icon_ev_dir1_selected@2x.png"
                  alt=""
                />
                <img
                  v-if="selectedMode !== mode.id && index == 0"
                  src="@/assets/images/icon_ev_dir1@2x.png"
                  alt=""
                />
                <img
                  v-if="selectedMode === mode.id && index == 1"
                  src="@/assets/images/icon_ev_dir2_selected@2x.png"
                  alt=""
                />
                <img
                  v-if="selectedMode !== mode.id && index == 1"
                  src="@/assets/images/icon_ev_dir2@2x.png"
                  alt=""
                />
              </div>
            </div>
          </div>

          <div class="group-item pr">
            <div class="flex fj">
              <span class="tit">进退反向操作</span>
              <van-switch
                v-model="dir1Oper"
                @change="handleOper(3, $event)"
                size="15px"
                active-color="#f5c542"
                inactive-color="#dcdee0"
              />
            </div>

            <div class="flex fj">
              <span class="tit">旋转反向操作</span>
              <van-switch
                v-model="dir2Oper"
                @change="handleOper(4, $event)"
                size="15px"
                active-color="#f5c542"
                inactive-color="#dcdee0"
              />
            </div>
          </div>
        </div>

        <div class="group" v-if="selectedIndex == 1">
          <div class="group-item">
            <p class="tit">方向中位微调</p>
            <div class="section">
              <!-- 减少按钮 -->
              <div class="reduce" @click="handleReduce(1)">
                <img src="@/assets/images/icon_reduce@2x.webp" alt="" />
              </div>
              <!-- 滑块区域（占据主要空间） -->
              <div class="slider-wrapper">
                <div class="slider-label">
                  <div class="num" :style="{ left: dirMiddle + '%' }">
                    {{ dirMiddleVal }}
                  </div>
                </div>
                <van-slider
                  v-model="dirMiddle"
                  :min="1"
                  :max="100"
                  @change="changeVal"
                  active-color="#f5c542"
                >
                  <template #button>
                    <div class="custom-sider-img">
                      <img
                        src="@/assets/images/icon_sider@2x.webp"
                        alt="滑块"
                      />
                    </div>
                  </template>
                </van-slider>
                <div class="slider-label-bottom">
                  <div class="num-text num-left nl">
                    {{ directionCenter.mini_value }}
                  </div>
                  <div class="num-text num-right">
                    {{ directionCenter.max_value }}
                  </div>
                </div>
              </div>

              <!-- 增加按钮 -->
              <div class="add" @click="handleAdd(1)">
                <img src="@/assets/images/icon_add@2x.webp" alt="" />
              </div>

              <!-- 保存按钮 -->
              <div class="btn" @click="save(1)">保存</div>
            </div>
          </div>

          <div class="group-item">
            <p class="tit">方向力度微调</p>
            <div class="section">
              <!-- 减少按钮 -->
              <div class="reduce" @click="handleReduce(2)">
                <img src="@/assets/images/icon_reduce@2x.webp" alt="" />
              </div>

              <!-- 滑块区域（占据主要空间） -->
              <div class="slider-wrapper">
                <div class="slider-label">
                  <div class="num" :style="{ left: dirTurn + '%' }">
                    {{ dirTurn }}
                  </div>
                </div>
                <van-slider
                  v-model="dirTurn"
                  :min="1"
                  @change="changeVal"
                  :max="100"
                  active-color="#f5c542"
                >
                  <template #button>
                    <div class="custom-sider-img">
                      <img src="@/assets/images/icon_sider@2x.webp" alt="" />
                    </div>
                  </template>
                </van-slider>
                <div class="slider-label-bottom">
                  <div class="num-text num-left">
                    {{ directionDynamics.mini_value }}
                  </div>
                  <div class="num-text num-right">
                    {{ directionDynamics.max_value }}
                  </div>
                </div>
              </div>

              <!-- 增加按钮 -->
              <div class="add" @click="handleAdd(2)">
                <img src="@/assets/images/icon_add@2x.webp" alt="" />
              </div>

              <!-- 保存按钮 -->
              <div class="btn" @click="save(2)">保存</div>
            </div>
          </div>

          <div class="group-item">
            <p class="tit">油门力度微调</p>
            <div class="section">
              <!-- 减少按钮 -->
              <div class="reduce" @click="handleReduce(3)">
                <img src="@/assets/images/icon_reduce@2x.webp" alt="" />
              </div>

              <!-- 滑块区域（占据主要空间） -->
              <div class="slider-wrapper">
                <div class="slider-label">
                  <div class="num" :style="{ left: throttle + '%' }">
                    {{ throttle }}
                  </div>
                </div>
                <van-slider
                  v-model="throttle"
                  :min="1"
                  :max="100"
                  @change="changeVal"
                  active-color="#f5c542"
                >
                  <template #button>
                    <div class="custom-sider-img">
                      <img src="@/assets/images/icon_sider@2x.webp" alt="" />
                    </div>
                  </template>
                </van-slider>
                <div class="slider-label-bottom">
                  <div class="num-text num-left">
                    {{ acceleratorDynamics.mini_value }}
                  </div>
                  <div class="num-text num-right">
                    {{ acceleratorDynamics.max_value }}
                  </div>
                </div>
              </div>

              <!-- 增加按钮 -->
              <div class="add" @click="handleAdd(3)">
                <img src="@/assets/images/icon_add@2x.webp" alt="" />
              </div>

              <!-- 保存按钮 -->
              <div class="btn" @click="save(3)">保存</div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="settings-bar">
          <div class="text-area">设置</div>
          <div class="close-btn" @click="close">
            <img src="@/assets/images/icon_close@2x.webp" alt="" />
          </div>
        </div>
        <div
          class="setting-group"
          v-for="(item, index) in setGroup"
          :key="index"
        >
          <div
            class="setting-item"
            :class="{ active: selectedIndex == item.key }"
            @click="handleItem(index)"
          >
            {{ item.name }}
          </div>
          <div class="gradient-line" v-if="selectedIndex == item.key"></div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { computed, ref, watch, h } from "vue";
// import { BidirectionalMap } from "@/utils/linearMapOptions";
import { arrowUp, arrowDown, arrowLeft, arrowRight } from "../img.js";

const dirMiddle = ref(1);
const dirTurn = ref(1);
const throttle = ref(1);

//  const volumeSlider = new BidirectionalMap({
//     inMin: 1,
//     inMax: 100,
//     outMin: props.directionCenter.mini_value,
//     outMax: props.directionCenter.max_value,
//     clamp: true,
//     step: 1,
//   });

const dirCenter = ref()
const dirDyn = ref()
const altDyn = ref()

const props = defineProps({
  show: { type: Boolean, default: false },
  type: { type: String, default: "1" },
  videoDefinition: {
    type: String,
    default: "1",
  },
  operFB: { type: Number, default: 0 },
  operDir: { type: Number, default: 0 },
  // 方向中位
  directionCenter: {
    type: Object,
    default: () => ({
      mini_value: 500,
      max_value: 1500,
      current_value: 0,
    }),
  },
  // 方向力度
  directionDynamics: {
    type: Object,
    default: () => ({
      mini_value: 1,
      max_value: 100,
      current_value: 0,
    }),
  },
  // 油门力度
  acceleratorDynamics: {
    type: Object,
    default: () => ({
      mini_value: 1,
      max_value: 100,
      current_value: 0,
    }),
  },
});
watch(
  () => props.directionCenter,
  (val) => {
    dirCenter.value = {...val}
    const mapNum = createReverseMapper(1, 100, val.mini_value, val.max_value);
    dirMiddle.value = mapNum(val.current_value);
  },
  { immediate: true, deep: true },
);
watch(
  () => props.directionDynamics,
  (val) => {
    dirDyn.value = {...val}
    const mapNum = createReverseMapper(1, 100, val.mini_value, val.max_value);
    dirTurn.value = mapNum(val.current_value);
  },
  { immediate: true, deep: true },
);
watch(
  () => props.acceleratorDynamics,
  (val) => {
    altDyn.value = {...val}
    const mapNum = createReverseMapper(1, 100, val.mini_value, val.max_value);
    throttle.value = mapNum(val.current_value);
  },
  { immediate: true , deep: true},
);
const dir1Oper = ref(false);
const dir2Oper = ref(false);

const valueMap = {
  1: dirMiddle,
  2: dirTurn,
  3: throttle,
};

const dirMiddleVal = computed(() => {
  const mapNum = createMapper(
    1,
    100,
    props.directionCenter.mini_value,
    props.directionCenter.max_value,
  );

  return mapNum(dirMiddle.value).toFixed(0);
});

const qualityList = ref([]);
const currentQuality = ref("1");
// "video_definition": "1,2,3", //清晰度 1户外 2超清 3高清 4标清
watch(
  () => props.videoDefinition,
  (newVal, oldVal) => {
    const qualityListMap = [
      { label: "户外", value: "1" },
      { label: "超清", value: "2" },
      { label: "高清", value: "3" },
      { label: "标清", value: "4" },
    ];
    // 自动追踪 props.videoDefinition 的变化
    console.log("当前清晰度:", newVal);
    const targetStr = newVal;
    const targetValues = targetStr.split(",");

    // 2. 过滤出对应的对象
    qualityList.value = qualityListMap.filter((item) =>
      targetValues.includes(item.value),
    );
    currentQuality.value = targetValues[0];
  },
  { immediate: true  ,deep: true},
);

// 前后正常操作
watch(
  () => props.operFB,
  (newVal, oldVal) => {
    dir1Oper.value = newVal == 0 ? false : true;
  },
  { immediate: true },
);

// 左右正常操作
watch(
  () => props.operDir,
  (newVal) => {
    dir2Oper.value = newVal == 0 ? false : true;
  },
  { immediate: true,  deep: true },
);

const emit = defineEmits([
  "update:show",
  "action",
  "operAction",
  "changeValue",
]);

const visible = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val),
});

const setGroup = ref([
  { name: "通用设置", key: 0 },
  { name: "车辆微调", key: 1 },
]);
const selectedIndex = ref(0);

const close = () => {
  const obj = JSON.parse(localStorage.carDetails)
  const val = {
    1: obj.direction_center.current_value,
    2: obj.direction_dynamics.current_value,
    3: obj.accelerator_dynamics.current_value
  }

  if (saveFlag.value[1]) {
    val[1] = dirMiddleVal.value
  } 
  if (saveFlag.value[2]) {
    val[2] = dirTurn.value
  }
  if (saveFlag.value[3]) {
    val[2] = throttle.value
  }
  emit("changeValue", val);
  visible.value = false;
};
const handleItem = (index) => {
  selectedIndex.value = index;
};

// 3. 处理点击事件
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
  emit("action", id);
};

const iconConfig = {
  width: "12px",
  height: "12px",
  style: "object-fit: contain;",
};

const IconArrowUp = () => h("img", { src: arrowUp, ...iconConfig });
const IconArrowDown = () => h("img", { src: arrowDown, ...iconConfig });
const IconArrowLeft = () => h("img", { src: arrowLeft, ...iconConfig });
const IconArrowRight = () => h("img", { src: arrowRight, ...iconConfig });

// 2. 统一的加减处理函数
const handleValueChange = (type, step) => {
  const target = valueMap[type];
  if (!target) return; // 如果 type 不匹配，直接返回

  // 计算新值
  const newValue = target.value + step;
  target.value = Math.max(0, Math.min(100, newValue));
  // 减产操作，传值
  emit("changeValue", {
    1: dirMiddleVal.value,
    2: dirTurn.value,
    3: throttle.value,
  });
};
const changeVal = () =>{ 
  emit("changeValue", {
    1: dirMiddleVal.value,
    2: dirTurn.value,
    3: throttle.value,
  });
}

// 4. 调用时只需传入 type 和 步长（1 为加，-1 为减）
const handleAdd = (type) => handleValueChange(type, 1);
const handleReduce = (type) => handleValueChange(type, -1);

// 操作不同的类型 是否反向 正向
const handleOper = (type, val) => {
  emit("operAction", type + "_" + val);
};

function createMapper(inMin, inMax, outMin, outMax) {
  return (value) => {
    const clampedValue = Math.max(inMin, Math.min(inMax, value));
    return (
      outMin + ((clampedValue - inMin) * (outMax - outMin)) / (inMax - inMin)
    );
  };
}
function createReverseMapper(inMin, inMax, outMin, outMax) {
  return (value) => {
    const clampedValue = Math.max(outMin, Math.min(outMax, value));
    const result =
      inMin + ((clampedValue - outMin) * (inMax - inMin)) / (outMax - outMin);

    return parseFloat(result.toFixed(1));
  };
}

const saveFlag = ref({
  1: false,
  2: false,
  3: false,
});
const save = (type) => {
  saveFlag.value[type] = true
};
</script>

<style lang="scss" scoped>
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

  border-right: 1px solid #fff;
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
    padding: 4px;
    width: 100%;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(255, 255, 255, 0.4);

    .text-area {
      flex: 1;
      text-align: center;
      font-family: PingFangSC, PingFang SC;
      font-weight: 500;
      font-size: 7px;
      letter-spacing: 2;
      color: #ffffff;
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn img {
      display: block;
      width: 12px;
      height: 12px;
    }
  }

  .setting-group {
    border-bottom: 1px solid #87878766;
    padding-bottom: 2px;

    .setting-item {
      font-family: PingFangSC, PingFang SC;
      font-weight: 500;
      font-size: 7px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1;
      text-align: center;
      font-style: normal;
      padding: 5px 0;
    }

    .active {
      color: #ffc838;
    }

    .gradient-line {
      height: 1px;
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
  padding: 5px;

  .group-item {
    margin-bottom: 2px;

    .tit {
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 7px;
      color: #ffffff;
    }
  }

  .flex {
    display: flex;
    gap: 12px;
    padding-top: 5px;
    margin-bottom: 5px;
  }

  .fj {
    justify-content: space-between;
  }

  .pr {
    padding-right: 15px;
  }

  .btn-quality {
    background: transparent;
    border: 1px solid #f5c542;
    color: #f5c542;
    padding: 1px 5px;
    border-radius: 2px;
    font-size: 7px;
    cursor: pointer;
    transition: all 0.3s ease;
    outline: none;
  }

  .btn-quality.active {
    background-color: #f5c542;
    color: #000000;
    font-weight: bold;
    border-color: #f5c542;
  }

  .option-card {
    position: relative;
    width: 65px;
    height: 36px;
    border: 0.25px solid rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    background-color: rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .option-card:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }

  .option-card.is-active {
    border: 0.5px solid #f5c542;
    background-color: rgba(245, 197, 66, 0.05);
  }

  .check-mark {
    position: absolute;
    top: -0.25px;
    right: -0.25px;
    width: 10px; // 修改：稍微增大宽度，避免挤压
    height: 10px; // 修改：稍微增大高度
    // border: none;
    // border-style: solid;
    // border-width: 0 7.5px 7.5px 0;
    // border-color: transparent #f5c542 transparent transparent;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    overflow: hidden;
  }

  .check-mark img {
    position: absolute;
    top: 0; // 修改：修正顶部偏移，贴边显示
    right: 0; // 修改：修正右侧偏移，贴边显示
    width: 8px;
    height: 8px;
    transform: rotate(0deg);
    display: block;
  }

  .content-layout {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 2.5px;
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
    gap: 2px;
  }

  .icon-row {
    display: flex;
    gap: 2px;
    margin-bottom: 1px;
    height: 18px;

    img {
      width: 10px;
      width: 10px;
    }
  }

  .icon-row.vertical {
    flex-direction: column;
  }

  .icon-row.horizontal {
    flex-direction: row;
  }

  .label {
    font-size: 6px;
    color: #ccc;
    margin-top: 2px;
  }

  .is-active .label {
    color: #fff;
  }
}

.section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 40px;
  .num {
  position: absolute;
  top: 5px;
  transform: translateX(-50%);
  /* 关键：让标签的中心点对齐 left 值，实现完美居中 */
  color: #fff;
  font-size: 6px;
  white-space: nowrap;
  /* 防止数字换行 */
  pointer-events: none;
  text-align: left;
  /* 防止标签拦截鼠标的拖拽事件 */
}

.slider-label {
  position: relative;
  height: 15px;
}

.slider-label-bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 2px;

  .num-text {
    color: #fff;
    font-size: 6px;
  }

  .num-left {
    margin-left: -1px;
  }
  .nl {
    margin-left: -4px;
  }

  .num-right {
    margin-right: -4px;
  }
}
}



.reduce,
.add,
.btn {
  flex-shrink: 0;
}

.btn {
  border-radius: 2px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 6px;
  color: #1a1a1a;
  padding: 2px 4px;
  background: #ffc838;
}

.reduce img,
.add img {
  width: 12px;
  height: 12px;
  display: block;
}

// :deep(.van-slider__bar) {
//   min-width: 5px !important;
// }
</style>

<style>
.custom-popup-right {
  border-radius: 0px !important;
}

.custom-sider-img {
  width: 10px;
  height: 10px;
}
</style>

// 1. 定义摇杆方向枚举常量 (对应 Swift 的 MoveDirectionControlType)
const MoveDirectionControlType = {
  endType: "endType",
  upType: "upType",
  downType: "downType",
  leftType: "leftType",
  rightType: "rightType",
};

// 2. 将核心逻辑封装为类
export class ExcavatorControlHandler {
  /**
   * @param {number}
   * @param {number}
   */
  constructor(config) {
    // 通过参数传入初始值
    this.ch1 = config.ch1;
    this.ch2 = config.ch2;
    this.reverseUpDownState = config.reverseUpDownState;
    this.reverseRotateState = config.reverseRotateState;
    this.config = config;

    this.ch3 = config.ch3.close_value.current_value; // 旋转
    this.ch4 = config.ch4.close_value.current_value; // 大臂
    this.ch5 = config.ch5.close_value.current_value; // 小臂
    this.ch6 = config.ch6.close_value.current_value; // 挖斗
    this.ch7 = config.ch7.close_value.current_value; // 油泵
    this.ch8 = config.ch8.close_value.current_value;
  } // 模拟获取配置参数的方法

  getConfigValue(index) {
    return this.config[index];
  }

  setConfigValue(obj) {
    this.config[0] = obj[0];
    this.config[2] = obj[2];
    this.config[3] = obj[3];
    console.log(this.config);
  }
  resetChValue() {
    this.ch3 = config.ch3.close_value.current_value; // 旋转
    this.ch4 = config.ch4.close_value.current_value; // 大臂
    this.ch5 = config.ch5.close_value.current_value; // 小臂
    this.ch6 = config.ch6.close_value.current_value; // 挖斗
    this.ch7 = config.ch7.close_value.current_value; // 油泵
  }
  getChValue() {
    // 1. 定义需要处理的通道数组
    const channels = ["ch3", "ch4", "ch5", "ch6", "ch7"];

    // 2. 遍历通道并限制范围
    channels.forEach((ch) => {
      // 获取原始配置值
      let value = this[ch];
      value = Math.max(1, Math.min(2000, value));
      // 将处理后的值赋给 this 对应的通道
      this[ch] = value;
    });
    return {
      ch3: this.ch3,
      ch4: this.ch4,
      ch5: this.ch5,
      ch6: this.ch6,
      ch7: this.ch7
    };
  }

  /**
   *
   * @param {boolean} type - 是否为左侧，还是右侧， 左侧left，右侧right
   * @param {string} positionType - 是点向上箭头 还是向下箭头；如果操作设置 ^ ^  左侧左轮前进（后退） 右轮前进（后退）
   * @param {number} ratioValue 应该有速率。速率先不管
   */
  handleArrowControlChannel(type, positionType) {
    // 左侧上下箭头
    if (type == "left") {
      // true 点击向上
      const center = this.config.ch2.center_value.current_value;
      const open = this.config.ch2.open_value.current_value;
      const offset = Math.abs(center - open);

      // 核心逻辑：非反向时 up=+offset / down=-offset；反向时取反
      const isUp = !!positionType;
      const direction = isUp !== this.reverseUpDownState ? 1 : -1;

      this.ch2 = center + direction * offset;
    } else {
      const center = this.config.ch1.center_value.current_value;
      const open = this.config.ch1.open_value.current_value;
      const offset = Math.abs(center - open);

      // 核心逻辑：positionType 向左 还是向右
      // const isLeftRight = !!positionType;
      const direction = !!positionType ? 1 : -1;

      this.ch1 = center + direction * offset;
    }
    if (this.ch1 > 2000) {
      this.ch1 = 2000;
    }
    if (this.ch2 > 2000) {
      this.ch2 = 2000;
    }
  }

  // 遥杆操作
  handleRemoteControlChannel(type, left, right, up, down) {
    const rateValue = 1;

    // 左侧遥杆
    if (type == "left") {
      const ch3Center = this.config.ch3.center_value.current_value;
      const ch3Open = this.config.ch3.open_value.current_value;
      const ch3Close = this.config.ch3.close_value.current_value;
      const ch5Center = this.config.ch5.center_value.current_value;
      const ch5Open = this.config.ch5.open_value.current_value;
      const ch5Close = this.config.ch5.close_value.current_value;

      // 向左旋转 或者 开启旋转反向
      if (left || (right && this.reverseRotateState)) {
        this.ch3 = ch3Center + (ch3Open - ch3Center) * rateValue;
      }
      if (right || (left && this.reverseRotateState)) {
        this.ch3 = ch3Center - (ch3Center - ch3Close) * rateValue;
      }

      if (up) {
        this.ch5 = ch5Center + (ch5Open - ch5Center);
      }
      if (down) {
        this.ch5 = ch5Center - (ch5Center - ch5Close);
      }
      if (up || down) {
        this.ch7 = this.config.ch7.open_value.current_value;
      } else {
        this.ch7 = this.config.ch7.close_value.current_value;
      }
    } else {
      // 右侧遥控
      const ch4Center = this.config.ch4.center_value.current_value;
      const ch4Open = this.config.ch4.open_value.current_value;
      const ch4Close = this.config.ch4.close_value.current_value;
      const ch6Center = this.config.ch6.center_value.current_value;
      const ch6Open = this.config.ch6.open_value.current_value;
      const ch6Close = this.config.ch6.close_value.current_value;
      const ch7Open = this.config.ch7.open_value.current_value;
      const ch7Close = this.config.ch7.close_value.current_value;

      this.ch7 = Math.max(ch7Open, ch7Close);
      if (left) {
        this.ch6 = ch6Center - (ch6Center - ch6Close) * rateValue;
      }

      if (right) {
        this.ch6 = ch6Center + (ch6Open - ch6Center) * rateValue;
      }

      if (up) {
        this.ch4 = ch4Center + (ch4Open - ch4Center) * rateValue;
      }

      if (down) {
        this.ch4 = ch4Center - (ch4Center - ch4Close) * rateValue;
      }
    }
  }
}

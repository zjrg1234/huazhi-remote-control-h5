
// 2. 将核心逻辑封装为类
export class ExcavatorControlHandler {
  /**
   * @param {number}
   * @param {number}
   */
  constructor(config) {
    // 通过参数传入初始值
    this.config = config;

    this.mixedControl = config.mixedControl;
    this.reverseUpDownState = config.reverseUpDownState;
    this.reverseRotateState = config.reverseRotateState;

    this.ch1 = config.ch1.center_value.current_value; // 方向左开右关
    this.ch2 = config.ch2.center_value.current_value; //  前进后退 
    this.ch3 = config.ch3.center_value.current_value; // ch3 //挖斗-左开值-上、右关值-下 
    this.ch4 = config.ch4.center_value.current_value; // ch4;//摆臂- 上开值下关值
    this.ch5 = config.ch5.center_value.current_value; // ch5;// 油泵
    this.ch6 = config.ch6.close_value.current_value;
    this.ch7 = config.ch7.close_value.current_value; 
    this.ch8 = config.ch8.close_value.current_value;

  } // 模拟获取配置参数的方法

  setReverseStatus(type1, type2) {
    this.reverseUpDownState = type1;
    this.reverseLeftRightState = type2;
  }

  getConfigValue(index) {
    return this.config[index];
  }


  resetChValue() {
    this.ch1 = this.config.ch1.center_value.current_value;  // 方向左开右关
    this.ch2 = this.config.ch2.center_value.current_value; // 前进后退 
    this.ch3 = this.config.ch3.center_value.current_value; // ch3 //挖斗-左开值-上、右关值-下 
    this.ch4 = this.config.ch4.center_value.current_value; // ch4;//摆臂- 上开值下关值

    this.ch6 = this.config.ch6.close_value.current_value;
    this.ch7 = this.config.ch7.close_value.current_value; 
    this.ch8 = this.config.ch8.close_value.current_value;

    this.ch5 = this.getCloseCH5Value();
    
  }
  getCloseCH5Value() {
    const ch5Open = this.config.ch5.open_value.current_value;
    const ch5Close = this.config.ch5.close_value.current_value;
    this.ch5 = Math.min(ch5Open, ch5Close);
    return this.ch5
  }
  getChValue() {
    return {
      ch1: this.ch1,
      ch2: this.ch2,
      ch3: this.ch3,
      ch4: this.ch4,
      ch5: this.ch5,
      ch6: this.ch6,
      ch7: this.ch7,
      ch8: this.ch8,
    };
  }

  getCh1Ch2Value() {
    return {
      ch1: this.ch1,
      ch2: this.ch2,
    };
  }



  // 遥杆操作
  handleRemoteControlChannel(type, left, right, up, down, rateValue) {
 
    const ch5Open = this.config.ch5.open_value.current_value;
    const ch5Close = this.config.ch5.close_value.current_value;
    // 左侧遥杆
    if (type == "left") {
      const ch1Center = this.config.ch1.center_value.current_value;
      const ch1Open = this.config.ch1.open_value.current_value;
      const ch1Close = this.config.ch1.close_value.current_value;
      const ch2Center = this.config.ch2.center_value.current_value;
      const ch2Open = this.config.ch2.open_value.current_value;
      const ch2Close = this.config.ch2.close_value.current_value;

      // 向左旋转 或者 开启旋转反向
      if (left || (right && this.reverseRotateState)) {
        this.ch1 = ch1Center + (ch1Open - ch1Center) * rateValue;
      }
      if (right || (left && this.reverseRotateState)) {
        this.ch1 = ch1Center - (ch1Center - ch1Close) * rateValue;
      }

      if (up || (down && this.reverseUpDownState)) {
        this.ch2 = ch2Center + (ch2Open - ch2Center) * rateValue;
      }
      if (down || (up && this.reverseUpDownState)) {
        this.ch2 = ch2Center - (ch2Center - ch2Close) * rateValue;
      }
     
    } else {
      // 右侧遥控 ch3挖斗-左开值-上、右关值-下  ch4摆臂- 上开值下关值
      const ch3Center = this.config.ch3.center_value.current_value;
      const ch3Open = this.config.ch3.open_value.current_value;
      const ch3Close = this.config.ch3.close_value.current_value;
      const ch4Center = this.config.ch4.center_value.current_value;
      const ch4Open = this.config.ch4.open_value.current_value;
      const ch4Close = this.config.ch4.close_value.current_value;

      this.ch5 = Math.max(ch5Open, ch5Close);

      if (right) {
        this.ch3 = ch3Center + (ch3Open - ch3Center) * rateValue;
      }

      if (left) {
        this.ch3 = ch3Center - (ch3Center - ch3Close) * rateValue;
      }

      if (down) {
        this.ch4 = ch4Center - (ch4Center - ch4Close) * rateValue;
      }

      if (up) {
        this.ch4 = ch4Center + (ch4Open - ch4Center) * rateValue; 
      }
    }
  }
}

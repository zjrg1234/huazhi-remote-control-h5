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
    this.config = config;

    this.mixedControl = config.mixedControl;
    this.reverseUpDownState = config.reverseUpDownState;
    this.reverseRotateState = config.reverseRotateState;

    this.ch1 = config.ch1.center_value.current_value;
    this.ch2 = config.ch2.center_value.current_value;
    this.ch3 = config.ch3.center_value.current_value; // 旋转
    this.ch4 = config.ch4.center_value.current_value; // 大臂
    this.ch5 = config.ch5.center_value.current_value; // 小臂
    this.ch6 = config.ch6.center_value.current_value; // 挖斗
    this.ch7 = config.ch7.close_value.current_value; // 油泵
    this.ch8 = config.ch8.close_value.current_value;
  } // 模拟获取配置参数的方法

  setReverseStatus(type1, type2) {
    this.reverseUpDownState = type1;
    this.reverseLeftRightState = type2;
  }

  getConfigValue(index) {
    return this.config[index];
  }

  setConfigValue() {}

  resetChValue() {

    this.ch3 = this.config.ch3.center_value.current_value; // 旋转
    this.ch4 = this.config.ch4.center_value.current_value; // 大臂
    this.ch5 = this.config.ch5.center_value.current_value; // 小臂
    this.ch6 = this.config.ch6.center_value.current_value; // 挖斗
    this.ch8 = this.config.ch8.close_value.current_value; // 灯光
    // ch7 油泵
    this.ch7 = this.getCloseCH7Value();
  }
  getCloseCH7Value() {
    const ch7Open = this.config.ch7.open_value.current_value;
    const ch7Close = this.config.ch7.close_value.current_value;
    this.ch7 = Math.min(ch7Open, ch7Close);
    return this.ch7;
  }
  getChValue() {
    return {
      ch3: this.ch3,
      ch4: this.ch4,
      ch5: this.ch5,
      ch6: this.ch6,
    };
  }

  getCh1Ch2Value() {
    return {
      ch1: this.ch1,
      ch2: this.ch2,
    };
  }

 /**
 * 处理箭头控制通道值
 * @param {string}  type          - 'left' 或 'right'
 * @param {string|boolean} positionType - 方向标识（详见各模式说明）
 * @param {boolean} mode          - false=老司机模式，true=新手模式
 */
handleArrowControlChannel(type, positionType, mode) {
  // ---- 1. 提取配置并计算偏移量 ----
  const { ch1, ch2 } = this.config;
  const center1 = ch1.center_value.current_value;
  const open1 = ch1.open_value.current_value;
  const offset1 = Math.abs(center1 - open1);
  const center2 = ch2.center_value.current_value;
  const open2 = ch2.open_value.current_value;
  const offset2 = Math.abs(center2 - open2);

  // 辅助：设置单个通道值
  const setChannel = (channelKey, center, offset, direction) => {
    this[channelKey] = center + direction * offset;
  };

  // 辅助：将 positionType 转为布尔（用于方向判断）
  const toBoolean = (val) => {
    if (typeof val === 'boolean') return val;
    // 字符串 'true' / 'up' / 'yes' 视为 true，其他（包括 'false'、'down'、空）视为 false
    return val === 'true' || val === 'up' || val === 'yes';
  };

  // 辅助：根据反向标志修正方向（仅用于 ch1 的上下控制）
  const getDirWithReverse = (isUp) => {
    const raw = isUp ? 1 : -1;
    return this.reverseUpDownState ? -raw : raw;
  };
  // ch1 代表油门 ch2 代表方向
  // ---- 2. 老司机模式 ----
  if (mode === false) {
    if (type === 'left') {
      // 左侧：控制 ch1（前后），方向受 reverseUpDownState 影响 up 向左 down 向右
      const isUp = toBoolean(positionType);
      const dir = getDirWithReverse(isUp);
      setChannel('ch1', center1, offset1, dir);
    } else { // type === 'right'
      // 右侧：控制 ch2（左右），方向不受反向影响，positionType 表示左/右（true=左，false=右）
      // 向左 大值 向右 小值
      const isLeft = toBoolean(positionType);
      const dir = isLeft ? 1 : -1;
      setChannel('ch2', center2, offset2, dir);
    }
    return;
  }

  // ---- 3. 新手模式 ----
  if (type === 'left') {
    // 左侧摇杆：上下控制 ch1（前后），左右控制 ch2（转向）
    // 注意：原逻辑中 ch2 的方向也直接使用了 positionType（上下方向），这可能不合理，但保留
    const isUp = toBoolean(positionType);
    const dir1 = getDirWithReverse(isUp);   // ch1 受反向影响
     const dir2 = isUp ? 1 : -1;             // ch2 受反向影响
    setChannel('ch1', center1, offset1, dir1);
    setChannel('ch2', center2, offset2, dir2); // 不用dir2
    console.log("ch1","ch2", this.ch1,this.ch2)
  } else { 
   
    // type === 'right'
    // 右侧摇杆：根据 positionType 决定控制 ch1 还是 ch2
    // 原代码：'up' 时控制 ch1，其他（'down'）控制 ch2，但方向计算均为 !!positionType（永远为正）
    // 此处保留原逻辑，仅将 !!positionType 替换为明确的 1，因为必定为正
    if (positionType) {
      // const isUp = toBoolean(positionType);
     
      const isUp = toBoolean(positionType);
      const dir1 = getDirWithReverse(isUp);
     
      // 控制 ch1，方向为正
      setChannel('ch1', center1, offset1, dir1);
   
    } else {
      // 控制 ch2，方向为负（原逻辑使用 !!positionType 转为 1，但这里是 down，应该为负？保留原样）
      // 注意：原代码 direction = !!positionType ? 1 : -1，对于 'down'，!!'down' 为 true，所以方向为 1，这里保留
      setChannel('ch2', center2, offset2, 1);
    }
  }
}

  // 遥杆操作
  handleRemoteControlChannel(type, left, right, up, down, rateValue) {
    const ch7Open = this.config.ch7.open_value.current_value;
    const ch7Close = this.config.ch7.close_value.current_value;
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
        this.ch5 = ch5Center - (ch5Center - ch5Close) * rateValue;
      }
      if (down) {
        this.ch5 = ch5Center + (ch5Open - ch5Center)  * rateValue;
      }
    } else {
      // 右侧遥控
      const ch4Center = this.config.ch4.center_value.current_value;
      const ch4Open = this.config.ch4.open_value.current_value;
      const ch4Close = this.config.ch4.close_value.current_value;
      const ch6Center = this.config.ch6.center_value.current_value;
      const ch6Open = this.config.ch6.open_value.current_value;
      const ch6Close = this.config.ch6.close_value.current_value;

      this.ch7 = Math.max(ch7Open, ch7Close);
    
      if (left) {
        this.ch6 = ch6Center + (ch6Open - ch6Center) * rateValue;
      }

      if (right) {
        this.ch6 = ch6Center - (ch6Center - ch6Close) * rateValue;
      }

      if (up) {
        this.ch4 = ch4Center - (ch4Center - ch4Close) * rateValue;
      }

      if (down) {
        this.ch4 = ch4Center + (ch4Open - ch4Center) * rateValue; // 这是向下
      }
    }
  }
}

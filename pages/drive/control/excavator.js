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
  /**
   * 处理双摇杆控制通道
   * @param {boolean} isUpDown - 是否为上下摇杆 (true: 上下, false: 左右)
   * @param {string} positionType - 摇杆状态 (对应 MoveDirectionControlType)
   * @param {number} ratioValue - 摇杆推动的比例值 (0.0 ~ 1.0)
   */

  handleDirectionControlChannel(isUpDown, positionType, ratioValue) {
    let maxValue = 0.0;
    let centerValue = 0.0;
    let minValue = 0.0;
    let rateValue = 0.0;
    console.log(positionType);
    // 1,3 进退油门
    if (isUpDown === true) {
      //maxValue = this.getConfigValue(1)?.max_value;
      centerValue = this.getConfigValue(1)?.current_value;
      //minValue = this.getConfigValue(1)?.min_value ; // 计算油门力度比例

      const acceleratorDynamicsValue = this.getConfigValue(3)?.current_value;
      const acceleratorDynamicsMaxValue = this.getConfigValue(3)?.max_value;
      rateValue = acceleratorDynamicsValue / acceleratorDynamicsMaxValue;

      if (positionType === MoveDirectionControlType.endType) {
        // 摇杆回中
        this.ch2 = Math.round(centerValue);
      } else {
        const isReverse = this.reverseUpDownState;
        const delta = 500 * rateValue * ratioValue;
        console.log(delta, rateValue, ratioValue);

        if (positionType === MoveDirectionControlType.upType) {
          // 上推：如果开启反向，则变为向下输出
          this.ch2 = Math.round(
            isReverse ? centerValue - delta : centerValue + delta,
          );
        } else {
          // 下拉：如果开启反向，则变为向上输出
          this.ch2 = Math.round(
            isReverse ? centerValue + delta : centerValue - delta,
          );
        }
      } // 边界保护 (忠实保留原逻辑)

      if (this.ch2 < 1) this.ch2 = 1;
      if (this.ch2 > 2000) this.ch2 = 2000;
    } else {
      // ==========0,2 左右控制 (方向) ==========
      maxValue = this.getConfigValue(0)?.max_value;
      centerValue = this.getConfigValue(0)?.current_value;
      minValue = this.getConfigValue(0)?.min_value; // 计算方向力度比例

      const directionDynamicsValue = this.getConfigValue(2)?.current_value;
      const directionDynamicsMaxValue = this.getConfigValue(2)?.max_value;
      rateValue = directionDynamicsValue / directionDynamicsMaxValue;

      if (positionType === MoveDirectionControlType.endType) {
        // 摇杆回中
        this.ch1 = Math.round(centerValue);
      } else {
        const isReverse = this.reverseRotateState;
        const delta = 500 * rateValue * ratioValue;

        if (positionType === MoveDirectionControlType.leftType) {
          // 左推：如果开启反向，则变为向右输出
          this.ch1 = Math.round(
            isReverse ? centerValue - delta : centerValue + delta,
          );
        } else {
          // 右推：如果开启反向，则变为向左输出
          this.ch1 = Math.round(
            isReverse ? centerValue + delta : centerValue - delta,
          );
        } // 左右控制的边界保护

        if (this.ch1 < 1) this.ch1 = 1;
        if (this.ch1 > 2000) this.ch1 = 2000;
      }
    }
  }

  /**
   *
   * @param {boolean} type - 是否为左侧，还是右侧， 左侧true，右侧false
   * @param {string} positionType - 是点向上箭头 还是向下箭头；如果操作设置 ^ ^  左侧左轮前进（后退） 右轮前进（后退）
   * @param {number} ratioValue 应该有速率。速率先不管
   */
  handleUpDownControlChannel(type, positionType) {
    // 左侧上下箭头
    if (type) {
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
}

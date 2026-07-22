// composables/useHESbus.js
import { reactive, readonly } from "vue";

// ==================== 常量定义 ====================

const HES_CONSTANTS = {
  // 协议格式
  PACKET_LENGTH: 55,
  HEADER_LENGTH: 2,
  COMMAND_LENGTH: 1,
  SEQUENCE_LENGTH: 2,
  TERMINAL_ID_LENGTH: 8,
  DATA_LENGTH_FIELD: 2,
  VOLTAGE_LENGTH: 2,
  GSM_LENGTH: 2,
  LOCATION_LENGTH: 34,
  CHECKSUM_LENGTH: 1,
  END_LENGTH: 1,

  // 位置信息子字段
  YEAR_LENGTH: 1,
  MONTH_LENGTH: 1,
  DAY_LENGTH: 1,
  HOUR_LENGTH: 1,
  MINUTE_LENGTH: 1,
  SECOND_LENGTH: 1,
  LATITUDE_LENGTH: 8,
  NORTH_SOUTH_LENGTH: 1,
  LONGITUDE_LENGTH: 8,
  EAST_WEST_LENGTH: 1,
  SPEED_LENGTH: 2,
  HEADING_LENGTH: 2,
  ALTITUDE_LENGTH: 2,
  STATUS_LENGTH: 4, // 4个状态字节

  // 偏移量
  OFFSET_COMMAND: 2,
  OFFSET_VOLTAGE: 15,
  OFFSET_GSM: 17,
  OFFSET_LATITUDE: 25,
  OFFSET_NORTH_SOUTH: 33,
  OFFSET_LONGITUDE: 34,
  OFFSET_EAST_WEST: 42,
  OFFSET_SPEED: 43,

  // SBUS
  SBUS_CHANNEL_COUNT: 16,
  SBUS_PACKET_LENGTH: 25,
  SBUS_DECODE_LENGTH: 22,
  SBUS_MAX_VALUE: 0x07ff,
};

// ==================== 响应式状态 ====================

/**
 * 创建 HES 设备数据模型
 */
export function createHESModel() {
  return reactive({
    commandCode: "", // 命令码
    volt: "", // 电压
    gsm: "", // GSM信号强度
    lat: "", // 纬度
    lon: "", // 经度
    northSouth: "", // 南北
    eastWest: "", // 东西
    speed: "", // 速度
    rawHex: "", // 原始16进制数据（调试用）
    timestamp: null, // 接收时间戳
  });
}

// ==================== 纯函数工具 ====================

/**
 * 数字转16进制字符串（2位）
 * @param {number} num - 0-255
 * @returns {string} 如 "5A"
 */
export function toHex(num) {
  if (num < 0 || num > 255) {
    throw new Error(`toHex: 数值 ${num} 超出 0-255 范围`);
  }
  return num.toString(16).toUpperCase().padStart(2, "0");
}

/**
 * 字符串转16进制字符串
 * @param {string} str - 如 "T48007740"
 * @returns {string} 如 "543438303037373430"
 */
export function stringToHex(str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  return Array.from(bytes)
    .map((b) => toHex(b))
    .join("");
}

/**
 * 设备号字符串转10进制数组
 * @param {string} deviceId - 如 "T48007740"
 * @returns {number[]} [84, 52, 56, 48, 48, 55, 55, 52, 48]
 */
export function deviceIdToBytes(deviceId) {
  const hexStr = stringToHex(deviceId);
  const result = [];
  for (let i = 0; i < hexStr.length; i += 2) {
    result.push(parseInt(hexStr.substring(i, i + 2), 16));
  }
  return result;
}

/**
 * 16进制字符串转 Uint8Array
 * @param {string} hexStr - 如 "5A431000" 或 "5A 43 10 00"
 * @returns {Uint8Array}
 */
export function hexToBytes(hexStr) {
  const clean = hexStr.replace(/\s/g, "");
  if (clean.length % 2 !== 0) {
    throw new Error("hexToBytes: 16进制字符串长度必须是偶数");
  }

  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Uint8Array/ArrayBuffer 转16进制字符串
 * @param {Uint8Array|ArrayBuffer|number[]} data
 * @returns {string} 如 "5A431000"
 */
export function bytesToHex(data) {
  let bytes;
  if (data instanceof Uint8Array) {
    bytes = data;
  } else if (data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data);
  } else if (Array.isArray(data)) {
    bytes = new Uint8Array(data);
  } else {
    throw new Error("bytesToHex: 不支持的数据类型");
  }

  return Array.from(bytes)
    .map((b) => toHex(b))
    .join("");
}

/**
 * 提取子字节并转16进制
 * @param {Uint8Array} bytes - 源数据
 * @param {number} start - 起始索引
 * @param {number} length - 长度
 * @returns {string} 16进制字符串
 */
function extractHex(bytes, start, length) {
  return bytesToHex(bytes.slice(start, start + length));
}

/**
 * 计算校验和（异或校验）
 * @param {Uint8Array} bytes - 数据（不含起始符和结束符）
 * @param {number} start - 起始位置
 * @param {number} end - 结束位置
 * @returns {number} 校验字节
 */
export function calcChecksum(bytes, start = 0, end = bytes.length) {
  let checksum = 0;
  for (let i = start; i < end; i++) {
    checksum ^= bytes[i];
  }
  return checksum;
}

// ==================== SBUS 编解码 ====================

/**
 * 16通道数据编码为 SBUS 数据包（25字节）
 * @param {number[]} channels - 16个通道值，每个 0-2047
 * @returns {number[]} 25字节数组
 */
export function encodeSBUS(channels) {
  if (
    !Array.isArray(channels) ||
    channels.length !== HES_CONSTANTS.SBUS_CHANNEL_COUNT
  ) {
    throw new Error(
      `encodeSBUS: 需要 ${HES_CONSTANTS.SBUS_CHANNEL_COUNT} 个通道数据`,
    );
  }

  const ch = channels.map((v) => Number(v) & HES_CONSTANTS.SBUS_MAX_VALUE);

  const results = [
    (ch[0] | (ch[1] << 11)) >>> 0,
    ((ch[1] >> 3) | (ch[2] << 8)) >>> 0,
    ((ch[2] >> 6) | (ch[3] << 5)) >>> 0,
    ((ch[3] >> 9) | (ch[4] << 2) | (ch[5] << 13)) >>> 0,
    ((ch[5] >> 5) | (ch[6] << 7)) >>> 0,
    ((ch[6] >> 8) | (ch[7] << 4)) >>> 0,
    ((ch[7] >> 11) | (ch[8] << 1) | (ch[9] << 12)) >>> 0,
    ((ch[9] >> 4) | (ch[10] << 9)) >>> 0,
    ((ch[10] >> 7) | (ch[11] << 6)) >>> 0,
    ((ch[11] >> 10) | (ch[12] << 3)) >>> 0,
    ch[13],
    ((ch[13] >> 8) | (ch[14] << 3)) >>> 0,
    ((ch[14] >> 5) | (ch[15] << 6)) >>> 0,
  ];

  // 原始算法（22字节数据部分）
  const raw = [
    ch[0] & 0x07ff,
    (ch[0] >> 8) | (ch[1] << 3),
    (ch[1] >> 5) | (ch[2] << 6),
    ch[2] >> 2,
    (ch[2] >> 10) | (ch[3] << 1),
    (ch[3] >> 7) | (ch[4] << 4),
    (ch[4] >> 4) | (ch[5] << 7),
    ch[5] >> 1,
    (ch[5] >> 9) | (ch[6] << 2),
    (ch[6] >> 6) | (ch[7] << 5),
    ch[7] >> 3,
    ch[8] & 0x07ff,
    (ch[8] >> 8) | (ch[9] << 3),
    (ch[9] >> 5) | (ch[10] << 6),
    ch[10] >> 2,
    (ch[10] >> 10) | (ch[11] << 1),
    (ch[11] >> 7) | (ch[12] << 4),
    (ch[12] >> 4) | (ch[13] << 7),
    ch[13] >> 1,
    (ch[13] >> 9) | (ch[14] << 2),
    (ch[14] >> 6) | (ch[15] << 5),
    ch[15] >> 3,
  ];

  const packet = [0x0f]; // SBUS 起始字节
  raw.forEach((v) => packet.push(v & 0xff));
  packet.push(0x00); // 标志位
  packet.push(0x00); // 结束字节

  return packet;
}

/**
 * SBUS 数据解码为16通道（22字节输入）
 * @param {number[]} bytes - 22字节数组
 * @returns {number[]} 16通道值
 */
export function decodeSBUS(bytes) {
  if (
    !Array.isArray(bytes) ||
    bytes.length !== HES_CONSTANTS.SBUS_DECODE_LENGTH
  ) {
    throw new Error(
      `decodeSBUS: 需要 ${HES_CONSTANTS.SBUS_DECODE_LENGTH} 字节数据`,
    );
  }

  const n = bytes.map((v) => Number(v));

  return [
    (n[0] | (n[1] << 8)) & 0x07ff,
    ((n[1] >> 3) | (n[2] << 5)) & 0x07ff,
    ((n[2] >> 6) | (n[3] << 2) | (n[4] << 10)) & 0x07ff,
    ((n[4] >> 1) | (n[5] << 7)) & 0x07ff,
    ((n[5] >> 4) | (n[6] << 4)) & 0x07ff,
    ((n[6] >> 7) | (n[7] << 1) | (n[8] << 9)) & 0x07ff,
    ((n[8] >> 2) | (n[9] << 6)) & 0x07ff,
    ((n[9] >> 5) | (n[10] << 3)) & 0x07ff,
    (n[11] | (n[12] << 8)) & 0x07ff,
    ((n[12] >> 3) | (n[13] << 5)) & 0x07ff,
    ((n[13] >> 6) | (n[14] << 2) | (n[15] << 10)) & 0x07ff,
    ((n[15] >> 1) | (n[16] << 7)) & 0x07ff,
    ((n[16] >> 4) | (n[17] << 4)) & 0x07ff,
    ((n[17] >> 7) | (n[18] << 1) | (n[19] << 9)) & 0x07ff,
    ((n[19] >> 2) | (n[20] << 6)) & 0x07ff,
    ((n[20] >> 5) | (n[21] << 3)) & 0x07ff,
  ];
}

// ==================== 数据包解析 ====================

/**
 * 解析55字节HES数据包
 * @param {Uint8Array|ArrayBuffer|number[]} data - 原始数据
 * @returns {Object|null} 解析结果
 */
export function parsePacket(data) {
  // 标准化输入
  let bytes;
  if (data instanceof Uint8Array) {
    bytes = data;
  } else if (data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data);
  } else if (Array.isArray(data)) {
    bytes = new Uint8Array(data);
  } else {
    console.error("parsePacket: 数据类型错误");
    return null;
  }

  // 长度校验
  if (bytes.length !== HES_CONSTANTS.PACKET_LENGTH) {
    console.error(
      `parsePacket: 数据长度错误，期望 ${HES_CONSTANTS.PACKET_LENGTH}，实际 ${bytes.length}`,
    );
    return null;
  }

  // 校验和验证（假设最后2字节是校验+结束符）
  // 实际协议需根据文档调整校验范围
  const calcSum = calcChecksum(bytes, 0, bytes.length - 1);
  const recvSum = bytes[bytes.length - 1];
  if (calcSum !== recvSum) {
    console.warn(
      `parsePacket: 校验和不匹配，计算=${toHex(calcSum)}, 接收=${toHex(recvSum)}`,
    );
    // 根据需求决定是否继续解析
  }

  // 解析字段
  const model = {
    commandCode: parseInt(
      extractHex(
        bytes,
        HES_CONSTANTS.OFFSET_COMMAND,
        HES_CONSTANTS.COMMAND_LENGTH,
      ),
      16,
    ).toString(),

    volt:
      (
        parseInt(
          extractHex(
            bytes,
            HES_CONSTANTS.OFFSET_VOLTAGE,
            HES_CONSTANTS.VOLTAGE_LENGTH,
          ),
          16,
        ) / 100
      ).toFixed(1) + "V",

    gsm: parseInt(
      extractHex(bytes, HES_CONSTANTS.OFFSET_GSM, HES_CONSTANTS.GSM_LENGTH),
      16,
    ).toString(),

    lat: parseFloat64(bytes, HES_CONSTANTS.OFFSET_LATITUDE).toString(),
    northSouth: parseInt(
      extractHex(
        bytes,
        HES_CONSTANTS.OFFSET_NORTH_SOUTH,
        HES_CONSTANTS.NORTH_SOUTH_LENGTH,
      ),
      16,
    ).toString(),

    lon: parseFloat64(bytes, HES_CONSTANTS.OFFSET_LONGITUDE).toString(),
    eastWest: parseInt(
      extractHex(
        bytes,
        HES_CONSTANTS.OFFSET_EAST_WEST,
        HES_CONSTANTS.EAST_WEST_LENGTH,
      ),
      16,
    ).toString(),

    speed: Math.floor(
      parseInt(
        extractHex(
          bytes,
          HES_CONSTANTS.OFFSET_SPEED,
          HES_CONSTANTS.SPEED_LENGTH,
        ),
        16,
      ) / 1000,
    ).toString(),

    rawHex: bytesToHex(bytes),
    timestamp: Date.now(),
  };

  return model;
}

/**
 * 从字节数组解析64位浮点数（大端序）
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {number}
 */
function parseFloat64(bytes, offset) {
  const buf = bytes.slice(offset, offset + 8);
  // 创建8字节ArrayBuffer
  const ab = new ArrayBuffer(8);
  const view = new Uint8Array(ab);
  view.set(buf);
  return new DataView(ab).getFloat64(0, false); // false = big-endian
}

// ==================== 数据包构建 ====================

/**
 * 构建HES数据包
 * @param {Object} params - 参数对象
 * @returns {Uint8Array} 55字节数据包
 */
export function buildPacket(params) {
  const {
    commandCode = 0x01,
    sequence = 0x0001,
    terminalId = "T48007740",
    voltage = 12.5, // V
    gsm = 25, // 信号强度
    latitude = 0,
    longitude = 0,
    northSouth = 0, // 0=北, 1=南
    eastWest = 0, // 0=东, 1=西
    speed = 0, // km/h
  } = params;

  const packet = new Uint8Array(HES_CONSTANTS.PACKET_LENGTH);
  let offset = 0;

  // 起始符 (2字节) - 假设为 0x5A 0x43
  packet[offset++] = 0x5a;
  packet[offset++] = 0x43;

  // 命令码 (1字节)
  packet[offset++] = commandCode;

  // 流水号 (2字节，大端序)
  packet[offset++] = (sequence >> 8) & 0xff;
  packet[offset++] = sequence & 0xff;

  // 终端ID (8字节，ASCII)
  const idBytes = deviceIdToBytes(terminalId);
  idBytes.forEach((b) => (packet[offset++] = b));

  // 数据长度 (2字节) - 位置信息长度
  const dataLen = HES_CONSTANTS.LOCATION_LENGTH;
  packet[offset++] = (dataLen >> 8) & 0xff;
  packet[offset++] = dataLen & 0xff;

  // 电源电压 (2字节，放大100倍)
  const voltValue = Math.round(voltage * 100);
  packet[offset++] = (voltValue >> 8) & 0xff;
  packet[offset++] = voltValue & 0xff;

  // GSM信号 (2字节)
  packet[offset++] = (gsm >> 8) & 0xff;
  packet[offset++] = gsm & 0xff;

  // 位置信息 (34字节)
  // 年月日时分秒 (6字节) - 简化处理，实际需要BCD或特定格式
  const now = new Date();
  packet[offset++] = now.getFullYear() % 100; // 年
  packet[offset++] = now.getMonth() + 1; // 月
  packet[offset++] = now.getDate(); // 日
  packet[offset++] = now.getHours(); // 时
  packet[offset++] = now.getMinutes(); // 分
  packet[offset++] = now.getSeconds(); // 秒

  // 纬度 (8字节，大端序double)
  const latBuf = float64ToBytes(latitude);
  latBuf.forEach((b) => (packet[offset++] = b));

  // 南北 (1字节)
  packet[offset++] = northSouth;

  // 经度 (8字节，大端序double)
  const lonBuf = float64ToBytes(longitude);
  lonBuf.forEach((b) => (packet[offset++] = b));

  // 东西 (1字节)
  packet[offset++] = eastWest;

  // 速度 (2字节，放大1000倍)
  const speedValue = Math.round(speed * 1000);
  packet[offset++] = (speedValue >> 8) & 0xff;
  packet[offset++] = speedValue & 0xff;

  // 航向 (2字节)
  packet[offset++] = 0;
  packet[offset++] = 0;

  // 海拔 (2字节)
  packet[offset++] = 0;
  packet[offset++] = 0;

  // 状态 (4字节)
  packet[offset++] = 0;
  packet[offset++] = 0;
  packet[offset++] = 0;
  packet[offset++] = 0;

  // 校验和 (1字节) - 异或校验
  packet[offset++] = calcChecksum(packet, 0, offset);

  // 结束符 (1字节)
  packet[offset++] = 0x0d;

  return packet;
}

/**
 * 64位浮点数转字节数组（大端序）
 * @param {number} value
 * @returns {number[]} 8字节数组
 */
function float64ToBytes(value) {
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setFloat64(0, value, false);
  return Array.from(new Uint8Array(buffer));
}



 export function arrayBufferToByte(buffer) {
    // 1. 用 Uint8Array 视图来读取 ArrayBuffer 的数据
    const uint8Array = new Uint8Array(buffer);

    // 2. 遍历每个字节，转成16进制字符串
    const hexArray = [];
    for (let i = 0; i < uint8Array.length; i++) {
      // toString(16) 转16进制，padStart(2, '0') 补齐两位（比如 'A' 变成 '0A'）
      hexArray.push(uint8Array[i].toString(16).padStart(2, "0"));
    }
    let hexStr = "";

    hexArray.forEach((item) => {
      hexStr += item;
    });

    const clean = hexStr.replace(/\s/g, "");
    if (clean.length % 2 !== 0) {
      throw new Error("hexToBytes: 16进制字符串长度必须是偶数");
    }

    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
    }

    return bytes;
  }


// ==================== Composable (Vue3) ====================

/**
 * HES 设备通信 Composable
 */
export function useHESbus() {
  const model = createHESModel();
  const logs = reactive([]);

  /**
   * 处理接收到的数据
   * @param {Uint8Array|ArrayBuffer|number[]} data
   */
  function handleReceive(data) {
    const result = parsePacket(data);
    if (result) {
      Object.assign(model, result);
      addLog("接收", result.rawHex);
    } else {
      addLog("错误", "数据解析失败: " + bytesToHex(data));
    }
  }

  /**
   * 发送数据
   * @param {Object} params - 构建参数
   * @returns {Uint8Array} 数据包
   */
  function handleSend(params) {
    const packet = buildPacket(params);
    addLog("发送", bytesToHex(packet));
    return packet;
  }

  function addLog(type, content) {
    logs.unshift({
      type,
      content,
      time: new Date().toLocaleTimeString(),
    });
    if (logs.length > 100) logs.pop();
  }

  function clearLogs() {
    logs.length = 0;
  }

  return {
    model: readonly(model),
    logs: readonly(logs),
    handleReceive,
    handleSend,
    clearLogs,
    // 导出工具函数
    toHex,
    hexToBytes,
    bytesToHex,
    encodeSBUS,
    decodeSBUS,
    calcChecksum,
    arrayBufferToByte
  };
}

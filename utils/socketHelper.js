// 更快的实现（减少中间转换和内存分配），数字字符串转指定进制
function fastConvert(string, radix) {
  return string
    .split("")
    .map((char) => {
      return char.charCodeAt(0).toString(radix);
    })
    .join("");
}

// 终端接收机id - 数据转换
function convertToStringArray(input) {
  const stringArray = [];
  if (input.length % 2 !== 0) {
    console.warn("Waring~：终端接收机id - 数据转换出错");
    return ["00", "00", "00", "00", "00", "00", "00", "00"];
  }
  // 按每两位字符进行分割
  for (let i = 0; i < input.length; i += 2) {
    const substring = input.substr(i, 2);
    stringArray.push(substring);
  }
  return stringArray;
}

// 辅助函数：编码两个11位值的组合
function encodeChunk(a, b, shiftA, shiftB, mask) {
  const valueA = (a & mask) >> shiftA;
  const valueB = (b & mask) << shiftB;
  const value = (valueA | valueB) & 0xff; // 只取低8位
  return value;
}

// 编码通道数据
function encodeChannelData(channels) {
  // 确保至少有16个通道，不足的补"0"
  let channelStrings = [...channels];
  if (channelStrings.length < 16) {
    channelStrings.push(...Array(16 - channelStrings.length).fill("0"));
  }

  // 转换为Int数组
  const channelInts = channelStrings
    .slice(0, 16)
    .map((str) => parseInt(str, 10) || 0);

  const result = [];
  const mask = 0x07ff; // 11位掩码

  // 添加固定头部
  result.push(15);

  // 处理前8个通道 (0-7)
  result.push(channelInts[0] & mask);
  result.push(encodeChunk(channelInts[0], channelInts[1], 8, 3, mask));
  result.push(encodeChunk(channelInts[1], channelInts[2], 5, 6, mask));
  result.push(encodeChunk(channelInts[2], 0, 2, 0, mask));
  result.push(encodeChunk(channelInts[2], channelInts[3], 10, 1, mask));
  result.push(encodeChunk(channelInts[3], channelInts[4], 7, 4, mask));
  result.push(encodeChunk(channelInts[4], channelInts[5], 4, 7, mask));
  result.push(encodeChunk(channelInts[5], 0, 1, 0, mask));
  result.push(encodeChunk(channelInts[5], channelInts[6], 9, 2, mask));
  result.push(encodeChunk(channelInts[6], channelInts[7], 6, 5, mask));
  result.push(encodeChunk(channelInts[7], 0, 3, 0, mask));

  // 处理后8个通道 (8-15)
  result.push(channelInts[8] & mask);
  result.push(encodeChunk(channelInts[8], channelInts[9], 8, 3, mask));
  result.push(encodeChunk(channelInts[9], channelInts[10], 5, 6, mask));
  result.push(encodeChunk(channelInts[10], 0, 2, 0, mask));
  result.push(encodeChunk(channelInts[10], channelInts[11], 10, 1, mask));
  result.push(encodeChunk(channelInts[11], channelInts[12], 7, 4, mask));
  result.push(encodeChunk(channelInts[12], channelInts[13], 4, 7, mask));
  result.push(encodeChunk(channelInts[13], 0, 1, 0, mask));
  result.push(encodeChunk(channelInts[13], channelInts[14], 9, 2, mask));
  result.push(encodeChunk(channelInts[14], channelInts[15], 6, 5, mask));
  result.push(encodeChunk(channelInts[15], 0, 3, 0, mask));

  // 添加尾部
  result.push(0);
  result.push(0);

  return result;
}

// 十六进制转换工具（替代 HESbusTool）
const HESbusTool = {
  // 转为十六进制字符串，不足两位补0
  toHex(value) {
    const hex = (value & 0xff).toString(16).toUpperCase();
    return hex.length === 1 ? "0" + hex : hex;
  },
  // 将十六进制字符串转为Uint8Array
  convertHexStrToData(hexString) {
    if (!hexString || hexString.length === 0) {
      return new Uint8Array(0);
    }
    const length = hexString.length / 2;
    const data = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      data[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return data;
  },
};

// 主函数：组装Socket数据
export function handleDriverSocketData(
  transmitterId,
  chValue1,
  chValue2,
  chValue3,
  chValue4,
  chValue5,
  chValue6,
  chValue7,
  chValue8,
) {
  if (!transmitterId || transmitterId.length <= 0) {
    return null;
  }

  // 流水号
  const flowNumber = Math.floor(Math.random() * 256) + 1;
  let commandArray = [
    "90",
    "67",
    "16",
    "00",
    "00",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "13",
  ];
  // 更新流水号
  commandArray[4] = flowNumber < 10 ? `0${flowNumber}` : `${flowNumber}`;

  // 终端接收机id - 转10进制
  const transmitterIdConvertToTenValue = fastConvert(String(transmitterId), 10);

  const transmitterIdStringArray = convertToStringArray(
    transmitterIdConvertToTenValue,
  );
  for (let index = 0; index < transmitterIdStringArray.length; index++) {
    const commandIndex = index + 5;
    commandArray[commandIndex] = transmitterIdStringArray[index];
  }
  // 5 6 7 8 9 10 11 12
  commandArray[13] = "00";
  commandArray[14] = "27";
  commandArray[15] = "00";
  commandArray[16] = "00";

  const channels = [chValue1, chValue2, chValue3, chValue4, chValue5,chValue6,chValue7,chValue8];

  const clampedChannels = channels.map(v => Math.max(1, Math.min(2000, Number(v))));

  // 通道数据
  const channelsArray = [
    `${clampedChannels[0]}`,
    `${clampedChannels[1]}`,
    `${clampedChannels[2]}`,
    `${clampedChannels[3]}`,
    `${clampedChannels[4]}`,
    `${clampedChannels[5]}`,
    `${clampedChannels[6]}`,
    `${clampedChannels[7]}`,
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
  ];
  const channelsEncodeArray = encodeChannelData(channelsArray);
  for (let index = 0; index < channelsEncodeArray.length; index++) {
    const commandIndex = index + 17;
    commandArray[commandIndex] = `${channelsEncodeArray[index]}`;
  }

  // 计算异或校验和
  let check = 0;
  for (let index = 0; index < 40; index++) {
    const tempString = commandArray[index + 2];
    const commandValue = parseInt(tempString, 10) || 1;
    check ^= commandValue;
  }
  commandArray[42] = `${check}`;

  // 组装发送数据
  const sendData = [];
  for (let index = 0; index < commandArray.length; index++) {
    const commandItemString = commandArray[index];
    const hexString = HESbusTool.toHex(parseInt(commandItemString, 10) || 0);
    const itemHexData = HESbusTool.convertHexStrToData(hexString);
    sendData.push(...itemHexData);
  }

  let sendVal = Array.from(new Uint8Array(sendData)).map((b, i) => {
    const h = b.toString(16).padStart(2, "0").toUpperCase();
    return  h;
  });

  console.log("发送16进制：", sendVal);
  sendVal = hexArrayToArrayBuffer(sendVal)
  console.log("发送hexArrayToArrayBuffer：", sendVal);

  return sendVal;
}

function hexArrayToArrayBuffer(hexArray) {
  // 1. 创建一个与数组长度相等的 Uint8Array (1个字节 = 8位)
  const buffer = new Uint8Array(hexArray.length);
  
  // 2. 遍历数组，将每个十六进制字符串解析为十进制数字，并写入 buffer
  for (let i = 0; i < hexArray.length; i++) {
    // parseInt('5A', 16) 会将 '5A' 解析为十进制的 90
    buffer[i] = parseInt(hexArray[i], 16);
  }
  
  // 3. 返回底层的 ArrayBuffer 对象
  return buffer.buffer;
}

function uint8ArrayToAscii(uint8Array) {
  let asciiStr = "";
  for (let i = 0; i < uint8Array.length; i++) {
    asciiStr += String.fromCharCode(uint8Array[i]);
  }
  return asciiStr;
}

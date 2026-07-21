// utils/udp.js

let udpSocket = null;

/**
 * 创建 UDP Socket（微信小程序基础库 2.7.0+）
 */
export function createUDPSocket() {
  // #ifdef MP-WEIXIN
  if (!wx.createUDPSocket) {
    console.error('当前基础库不支持 UDP，请升级至 2.7.0+');
    return null;
  }
  
  udpSocket = wx.createUDPSocket();
  
  // 绑定本地端口（0 表示随机端口）
  const port = udpSocket.bind();
  console.log('UDP 绑定端口:', port);
  
  return udpSocket;
  // #endif
  
  // #ifndef MP-WEIXIN
  console.error('UDP 仅支持微信小程序端');
  return null;
  // #endif
}

/**
 * 发送 UDP 消息
 * @param {string} message - 要发送的内容（字符串或 ArrayBuffer）
 * @param {string} ip - 目标 IP
 * @param {number} port - 目标端口
 */
export function sendUDP(message, ip, port) {
  if (!udpSocket) {
    console.error('UDP Socket 未创建');
    return;
  }
  
  // 字符串转 ArrayBuffer
  let buffer = message;
  if (typeof message === 'string') {
    buffer = stringToArrayBuffer(message);
  }
  
  udpSocket.send({
    address: ip,
    port: port,
    message: buffer,
    success: () => {
      console.log(`UDP 发送成功 -> ${ip}:${port}`);
    },
    fail: (err) => {
      console.error('UDP 发送失败:', err);
    }
  });
}

/**
 * 发送十六进制数据（用于硬件通信）
 * @param {string} hexStr - 十六进制字符串，如 "5a870cff"
 * @param {string} ip 
 * @param {number} port 
 */
export function sendHexUDP(hexStr, ip, port) {
  const buffer = hexToArrayBuffer(hexStr);
  sendUDP(buffer, ip, port);
}

/**
 * 监听 UDP 消息
 * @param {function} onMessage - 回调函数 (res) => { res.message, res.remoteInfo }
 */
export function onUDPMessage(onMessage) {
  if (!udpSocket) return;
  
  udpSocket.onMessage((res) => {
    // res.message: ArrayBuffer
    // res.remoteInfo: { address, port, family, size }
    
    // ArrayBuffer 转字符串
    const text = arrayBufferToString(res.message);
    
    // ArrayBuffer 转十六进制
    const hex = arrayBufferToHex(res.message);
    
    console.log('UDP 收到消息:', {
      text,
      hex,
      from: `${res.remoteInfo.address}:${res.remoteInfo.port}`,
      size: res.remoteInfo.size
    });
    
    onMessage && onMessage({
      ...res,
      text,
      hex
    });
  });
}

/**
 * 监听错误
 */
export function onUDPError(onError) {
  if (!udpSocket) return;
  udpSocket.onError((err) => {
    console.error('UDP 错误:', err);
    onError && onError(err);
  });
}

/**
 * 关闭 UDP
 */
export function closeUDP() {
  if (udpSocket) {
    udpSocket.close();
    udpSocket = null;
    console.log('UDP 已关闭');
  }
}

// ==================== 工具函数 ====================

/**
 * 字符串转 ArrayBuffer
 */
function stringToArrayBuffer(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * ArrayBuffer 转字符串
 */
function arrayBufferToString(buffer) {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}

/**
 * 十六进制字符串转 ArrayBuffer
 */
function hexToArrayBuffer(hexStr) {
  // 去掉空格
  hexStr = hexStr.replace(/\s/g, '');
  const length = hexStr.length / 2;
  const buffer = new ArrayBuffer(length);
  const view = new Uint8Array(buffer);
  
  for (let i = 0; i < length; i++) {
    view[i] = parseInt(hexStr.substr(i * 2, 2), 16);
  }
  
  return buffer;
}

/**
 * ArrayBuffer 转十六进制字符串
 */
function arrayBufferToHex(buffer) {
  const view = new Uint8Array(buffer);
  return Array.from(view)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ');
}
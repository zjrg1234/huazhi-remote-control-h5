/**
 * 微信小程序 UDP 通信最优封装类 (修复手动销毁后自动重连的 Bug)
 */
export default class UDPSocketClient {
  constructor(options = {}) {
    this.socket = null;
    this.options = options;

    if (!options.address || !options.port) {
      console.error("[UDP] 初始化失败: 必须提供目标 address 和 port");
      return;
    }

    this.sendQueue = [];
    this.flushTimer = null;
    this.FLUSH_INTERVAL = 40; // 约 60fps

    // 状态标记
    this.isClosed = false;
    this.destroyed = false; // 【新增】永久销毁标志

    this.init();
  }

  get isConnected() {
    return !this.isClosed && this.socket !== null;
  }

  init() {
    // 【修复】如果已被手动销毁，禁止重新初始化
    if (this.destroyed) {
      console.warn("[UDP] 已被销毁，无法重新初始化");
      return;
    }

    // 1. 初始化前强制清理残留的旧实例（防止重复创建）
    if (this.socket) {
      this.close();
    }

    try {
      this.socket = wx.createUDPSocket();

      const localPort = this.socket.bind(this.options.localPort);
      console.log(`[UDP] 绑定成功，本地端口: ${localPort}`);

      if (this.options.ttl) {
        this.socket.setTTL(this.options.ttl);
      }

      // 2. 监听消息
      this.socket.onMessage((res) => {
        if (this.isClosed || !this.options.onMessage) return;
        const { message, remoteInfo } = res;
        try {
          this.options.onMessage(this.arrayBufferToByte(message), remoteInfo);
        } catch (e) {
          this.options.onMessage(this.arrayBufferToByte(message), remoteInfo);
        }
      });

      // 3. 监听错误
      this.socket.onError((err) => {
        console.error("[UDP] 发生错误:", err);
        if (!this.isClosed && this.options.onError) {
          this.options.onError(err);
        }
      });

      // 4. 监听关闭事件（被动关闭，不设置 destroyed）
      this.socket.onClose(() => {
        // console.log("[UDP] 底层 Socket 已关闭");
        this.isClosed = true;
        this.socket = null;
        this.sendQueue = [];
        if (this.flushTimer) {
          clearInterval(this.flushTimer);
          this.flushTimer = null;
        }
      });
    } catch (error) {
      console.error("[UDP] 初始化失败:", error);
    }
  }

  send(message) {
    // 【修复】如果已被手动销毁，直接丢弃消息，不重连
    if (this.destroyed) {
      console.warn("[UDP] Socket 已被手动销毁，无法发送");
      return;
    }

    if (this.isClosed || !this.socket) {
      console.warn("[UDP] Socket 已关闭，尝试自动重连...");
      this.init();
      if (this.isClosed || !this.socket) return; // 若重连失败则丢弃
    }

    this.sendQueue.push({
      address: this.options.address,
      port: this.options.port,
      message,
    });

    if (this.flushTimer === null) {
      this.flushTimer = setInterval(
        () => this.flushQueue(),
        this.FLUSH_INTERVAL,
      );
    }
  }

  flushQueue() {
    if (this.sendQueue.length === 0) {
      if (this.flushTimer !== null) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }
      return;
    }

    while (this.sendQueue.length > 0 && this.socket && !this.isClosed) {
      const packet = this.sendQueue.shift();
      if (packet) {
        try {
          this.socket.send(packet);
        } catch (err) {
          console.error("[UDP] 发送异常:", err);
        }
      }
    }
  }

  /**
   * 手动销毁 Socket，彻底禁止重连
   */
  close() {
    if (this.isClosed || !this.socket) return;

    // 【新增】标记为永久销毁
    this.destroyed = true;
    this.isClosed = true;

    this.sendQueue = [];
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // 解除事件监听
    this.socket.offMessage();
    this.socket.offError();
    this.socket.offClose();
    this.socket.offListening();

    // 关闭底层 Socket
    this.socket.close();
    this.socket = null;

    console.log("[UDP] Socket 已安全销毁（永久禁用重连）");
  }

  arrayBufferToByte(buffer) {
    const uint8Array = new Uint8Array(buffer);
    const hexArray = [];
    for (let i = 0; i < uint8Array.length; i++) {
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
}
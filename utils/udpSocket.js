/**
 * 微信小程序 UDP 通信最优封装类 (修复重连版)
 */
export default class UDPSocketClient {
  constructor(options = {}) {
    this.socket = null;
    this.options = options;

    if (!options.address || !options.port) {
      console.error('[UDP] 初始化失败: 必须提供目标 address 和 port');
      return;
    }
    
    this.sendQueue = [];
    this.flushTimer = null;
    this.FLUSH_INTERVAL = 40; // 约 60fps
    
    // 状态标记
    this.isClosed = false; 

    this.init();
  }

  get isConnected() {
    return !this.isClosed && this.socket !== null;
  }

  init() {
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
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(message);
          this.options.onMessage(text, remoteInfo);
        } catch (e) {
          this.options.onMessage(message, remoteInfo);
        }
      });

      // 3. 监听错误
      this.socket.onError((err) => {
        console.error('[UDP] 发生错误:', err);
        if (!this.isClosed && this.options.onError) {
          this.options.onError(err);
        }
      });

      // 4. 【关键修复】监听关闭事件，自动重置状态，为下一次重连做准备
      this.socket.onClose(() => {
        console.log('[UDP] 底层 Socket 已关闭');
        this.isClosed = true;
        this.socket = null;
        this.sendQueue = [];
        if (this.flushTimer) {
          clearInterval(this.flushTimer);
          this.flushTimer = null;
        }
      });
      
    } catch (error) {
      console.error('[UDP] 初始化失败:', error);
    }
  }

  send(message) {
    if (this.isClosed || !this.socket) {
      console.warn('[UDP] Socket 已关闭，尝试自动重连...');
      // 如果处于关闭状态，尝试重新初始化
      this.init();
      if (this.isClosed || !this.socket) return; // 如果重连依然失败，则丢弃
    }
    
    this.sendQueue.push({ 
      address: this.options.address, 
      port: this.options.port, 
      message 
    });

    if (this.flushTimer === null) {
      this.flushTimer = setInterval(() => this.flushQueue(), this.FLUSH_INTERVAL);
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
          console.error('[UDP] 发送异常:', err);
        }
      }
    }
  }

  close() {
    if (this.isClosed || !this.socket) return;
    
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
    
    console.log('[UDP] Socket 已安全销毁');
  }
}
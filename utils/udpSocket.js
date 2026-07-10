/**
 * 微信小程序 UDP 通信最优封装类 (集成 IP 绑定版)
 */
export default class UDPSocketClient {
  /**
   * @param {Object} options - 配置项
   * @param {string} options.address - 目标 IP 地址（必填）
   * @param {number} options.port - 目标端口号（必填）
   * @param {number} [options.localPort] - 本地绑定的端口号，不传则由系统随机分配
   * @param {number} [options.ttl=64] - 设置 IP_TTL 套接字选项
   * @param {Function} [options.onMessage] - 收到消息的回调 (msg, remoteInfo) => {}
   * @param {Function} [options.onError] - 发生错误的回调 (err) => {}
   */
  constructor(options = {}) {
    this.socket = null;
    this.options = options;

    // 校验必填的目标 IP 和端口
    if (!options.address || !options.port) {
      console.error('[UDP] 初始化失败: 必须提供目标 address 和 port');
      return;
    }
    
    // 消息队列与合并发送机制（防止高频调用阻塞主线程）
    this.sendQueue = [];
    this.flushTimer = null;
    this.FLUSH_INTERVAL = 40; // 约 60fps 刷新一次
    
    // 状态标记，防止销毁后继续操作
    this.isClosed = false; 

    this.init();
  }

  /**
   * 获取当前 Socket 的连接状态
   * @returns {boolean} 是否可用
   */
  get isConnected() {
    return !this.isClosed && this.socket !== null;
  }

  /**
   * 1. 初始化 Socket 并绑定事件
   */
  init() {
    try {
      this.socket = wx.createUDPSocket();
      
      // 绑定本地端口
      const localPort = this.socket.bind(this.options.localPort);
      console.log(`[UDP] 绑定成功，本地端口: ${localPort}`);

      // 设置 TTL
      if (this.options.ttl) {
        this.socket.setTTL(this.options.ttl);
      }

      // 监听消息（使用 TextDecoder 优化二进制转字符串性能）
      this.socket.onMessage((res) => {
        if (this.isClosed || !this.options.onMessage) return;
        const { message, remoteInfo } = res;
        
        // 尝试作为文本解析，如果是纯二进制数据则直接抛出 ArrayBuffer
        try {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(message);
          this.options.onMessage(text, remoteInfo);
        } catch (e) {
          this.options.onMessage(message, remoteInfo);
        }
      });

      // 监听错误
      this.socket.onError((err) => {
        console.error('[UDP] 发生错误:', err);
        if (!this.isClosed && this.options.onError) {
          this.options.onError(err);
        }
      });
      
    } catch (error) {
      console.error('[UDP] 初始化失败:', error);
    }
  }

  /**
   * 2. 发送消息（支持高频合并发送，无需再传 IP 和端口）
   * @param {string | ArrayBuffer} message - 要发送的数据
   */
  send(message) {
    if (this.isClosed || !this.socket) {
      console.warn('[UDP] Socket 已关闭或未初始化，丢弃消息');
      return;
    }
    
    // 将消息推入队列（自动绑定初始化时传入的 IP 和端口）
    this.sendQueue.push({ 
      address: this.options.address, 
      port: this.options.port, 
      message 
    });

    // 如果定时器未启动，则启动合并发送
    if (this.flushTimer === null) {
      this.flushTimer = setInterval(() => this.flushQueue(), this.FLUSH_INTERVAL);
    }
  }

  /**
   * 3. 批量发送队列中的消息
   */
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

  /**
   * 4. 安全销毁（释放内存，解除强引用）
   */
  close() {
    if (this.isClosed || !this.socket) return;
    
    this.isClosed = true;
    
    // 1. 清空发送队列并停止定时器
    this.sendQueue = [];
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // 2. 主动解除事件监听（极其重要，防止内存泄漏）
    this.socket.offMessage();
    this.socket.offError();
    this.socket.offClose();
    this.socket.offListening();

    // 3. 关闭底层 Socket，解除 Native 强引用，允许 GC 回收
    this.socket.close();
    this.socket = null;
    
    console.log('[UDP] Socket 已安全销毁');
  }
}
// utils/websocket.js

class WebSocketClient {
    constructor(url) {
        this.url = this._formatUrl(url);
        this.ws = null;
        this.isConnected = false;
        this.isManualClose = false;
        this.reconnectTimer = null;
        this.heartBeatTimer = null;
        this.reconnectCount = 0;
        this.maxReconnectCount = 10;
        this.reconnectInterval = 3000;
        this.heartBeatInterval = 30000;
        this.messageQueue = [];
        this.onMessageCallback = null;
        this.onOpenCallback = null;
        this.onCloseCallback = null;
        this.onErrorCallback = null;
    }

    /**
     * 格式化URL，自动添加端口号8899
     */
    _formatUrl(url) {
        if (!url) return url;

        // 如果URL中已经包含端口号，直接返回
        if (url.match(/:\d+/)) {
            return url;
        }

        // 提取协议和主机名，添加8899端口
        if (url.startsWith('wss://')) {
            const host = url.replace('wss://', '');
            return `wss://${host}:8899`;
        } else if (url.startsWith('ws://')) {
            const host = url.replace('ws://', '');
            return `ws://${host}:8899`;
        }

        // 如果没有协议前缀，默认使用wss
        return `wss://${url}:8899`;
    }

    /**
     * 连接WebSocket
     */
    connect() {
        if (this.isConnected) {
            console.log('[WebSocket] 已连接，无需重复连接');
            return;
        }

        console.log(`[WebSocket] 正在连接: ${this.url}`);
        this.isManualClose = false;

        this.ws = uni.connectSocket({
            url: this.url,
            success: () => {
                console.log('[WebSocket] 连接请求已发送');
            },
            fail: (err) => {
                console.error('[WebSocket] 连接请求失败:', err);
                this._handleError(err);
            }
        });

        this._bindEvents();
    }

    /**
     * 绑定事件监听
     */
    _bindEvents() {
        uni.onSocketOpen((res) => {
            console.log('[WebSocket] 连接已打开', res);
            this.isConnected = true;
            this.reconnectCount = 0;

            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }

            this._startHeartBeat();
            this._flushMessageQueue();

            if (this.onOpenCallback) {
                this.onOpenCallback(res);
            }
        });

        uni.onSocketMessage((res) => {
            console.log('[WebSocket] 收到消息:', res.data);
            if (this.onMessageCallback) {
                this.onMessageCallback(res.data);
            }
        });

        uni.onSocketClose((res) => {
            console.log('[WebSocket] 连接已关闭', res);
            this.isConnected = false;
            this._stopHeartBeat();

            if (this.onCloseCallback) {
                this.onCloseCallback(res);
            }

            if (!this.isManualClose) {
                this._reconnect();
            }
        });

        uni.onSocketError((err) => {
            console.error('[WebSocket] 连接错误:', err);
            this._handleError(err);
        });
    }

    /**
     * 发送消息
     */
    send(data) {
        if (!this.isConnected) {
            console.warn('[WebSocket] 连接未建立，消息已加入队列');
            this.messageQueue.push(data);
            return;
        }

        const message = typeof data === 'object' ? JSON.stringify(data) : data;

        uni.sendSocketMessage({
            data: message,
            success: () => {
                console.log('[WebSocket] 消息发送成功:', message);
            },
            fail: (err) => {
                console.error('[WebSocket] 消息发送失败:', err);
                this.messageQueue.unshift(data);
            }
        });
    }

    /**
     * 发送队列中的消息
     */
    _flushMessageQueue() {
        if (this.messageQueue.length === 0) return;

        console.log(`[WebSocket] 正在发送队列中的 ${this.messageQueue.length} 条消息`);
        this.messageQueue.forEach((data) => {
            this.send(data);
        });
        this.messageQueue = [];
    }

    /**
     * 启动心跳检测
     */
    _startHeartBeat() {
        this._stopHeartBeat();

        this.heartBeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'ping', timestamp: Date.now() });
            }
        }, this.heartBeatInterval);

        console.log('[WebSocket] 心跳已启动');
    }

    /**
     * 停止心跳检测
     */
    _stopHeartBeat() {
        if (this.heartBeatTimer) {
            clearInterval(this.heartBeatTimer);
            this.heartBeatTimer = null;
            console.log('[WebSocket] 心跳已停止');
        }
    }

    /**
     * 重连
     */
    _reconnect() {
        if (this.reconnectCount >= this.maxReconnectCount) {
            console.error(`[WebSocket] 重连次数已达上限 (${this.maxReconnectCount})，停止重连`);
            return;
        }

        this.reconnectCount++;
        const delay = this.reconnectInterval * this.reconnectCount;

        console.log(`[WebSocket] 第 ${this.reconnectCount} 次重连，${delay}ms 后尝试...`);

        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * 处理错误
     */
    _handleError(err) {
        if (this.onErrorCallback) {
            this.onErrorCallback(err);
        }
        this.isConnected = false;
        this._stopHeartBeat();
        if (!this.isManualClose) {
            this._reconnect();
        }
    }

    /**
     * 手动关闭连接
     */
    close() {
        this.isManualClose = true;
        this._stopHeartBeat();

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        uni.closeSocket({
            success: () => {
                console.log('[WebSocket] 连接已手动关闭');
            }
        });
    }

    /**
     * 设置消息回调
     */
    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    /**
     * 设置连接打开回调
     */
    onOpen(callback) {
        this.onOpenCallback = callback;
    }

    /**
     * 设置连接关闭回调
     */
    onClose(callback) {
        this.onCloseCallback = callback;
    }

    /**
     * 设置错误回调
     */
    onError(callback) {
        this.onErrorCallback = callback;
    }
}

// 单例模式导出
let wsInstance = null;

export function getWebSocket(url) {
    if (!wsInstance) {
        wsInstance = new WebSocketClient(url);
    }
    return wsInstance;
}

export default WebSocketClient;
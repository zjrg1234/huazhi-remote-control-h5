
func startListeningPortReceiver(host string, port string) {

heartBeatPort := ":8898" //接收机接收心跳ip
log.Printf("多对多转发服务器启动在端口: %s (3秒TTL缓存 + 完整业务融合版)", port)
udpAddr, err := net.ResolveUDPAddr("udp", ":"+port)
// 4. 创建 UDP 监听器
conn, err := net.ListenUDP("udp", udpAddr)
if err != nil {
logger.Error("UDP 监听失败：", zap.Error(err))
return
}
//方便后续调用
server := &ForwardServer{
conn: conn,
port: port,
}
buffer := make([]byte, 1024)
for {
n, clientAddr, err := conn.ReadFromUDP(buffer)
if err != nil {
fmt.Printf("读取 UDP 数据失败: %v\n", err)
continue
}
//log.Printf("[DEBUG-RAW] 源地址: %s | 原始Hex数据: %X\n", clientAddr.String(), buffer[:n])
//fmt.Printf("发送方ip加端口: %q\n", clientAddr.String()) //测试使用后期注释
if buffer[0] != 0x5A || buffer[1] != 0x43 {
continue
}
commandCode := buffer[2]      //命令码
idStr := string(buffer[5:13]) //id
dataCopy := make([]byte, n)
copy(dataCopy, buffer[:n])
if commandCode == 0x10 {
go startForwardingReceiver(server, idStr, dataCopy, clientAddr)
}
if commandCode == 0x15 {
//dataCopy := make([]byte, n)
//copy(dataCopy, buffer[:n])
go getReceiverMessage(server, idStr, dataCopy, clientAddr)
}
if commandCode == 0x16 {
//dataCopy := make([]byte, n)
//copy(dataCopy, buffer[:n])
go getReceiverHeartBeat(server, idStr, dataCopy, clientAddr, heartBeatPort, buffer[5:13])
}

}

}
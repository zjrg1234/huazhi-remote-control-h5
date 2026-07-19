//
//  DriverSocketDataTools.swift
//  HuaZhiElection
//
//  Created by 丸子 on 2026/1/30.
//

import Foundation
// 驾驶数据 - 组装成Socket数据工具
class DriverSocketDataTools{
    
    //不确定类型json字段转String 金额
    class func handleDriverSocketData(transmitterId:String,
                                      chValue1:Int,
                                      chValue2:Int,
                                      chValue3:Int,
                                      chValue4:Int,
                                      chValue5:Int,
                                      chValue6:Int,
                                      chValue7:Int,
                                      chValue8:Int)->Data?{
        
        if transmitterId.count <= 0 {
            return nil
        }
  
        // 流水号
        let flowNumber = Int.random(in: 1...256)
        var commandArray = ["90", "67", "16", "00", "00","", "","", "","", "","", "","", "","", "","", "","", "","", "","", "","", "","","","","","","","","","","","","","","","","","13"]
        
        // 更新流水号
        if flowNumber < 10 {
            commandArray[4] = String(format: "0%d", flowNumber)
        } else {
            commandArray[4] = "\(flowNumber)"
        }
        //终端接收机id  - 转 10 进制
        let transmitterIdConvertToTenValue = DriverSocketDataTools.fastConvert(transmitterId, 10)
        
        let transmitterIdStringArray = DriverSocketDataTools.convertToStringArray(transmitterIdConvertToTenValue)
        for index in 0..<transmitterIdStringArray.count {
            let commandIndex = index + 5
            commandArray[commandIndex] = transmitterIdStringArray[index]
        }
        commandArray[13] = "00"
        commandArray[14] = "27"
        commandArray[15] = "00"
        commandArray[16] = "00"
        
        // 通道数据
        let channelsArray = ["\(chValue1)", "\(chValue2)", "\(chValue3)", "\(chValue4)", "\(chValue5)","\(chValue6)", "\(chValue7)","\(chValue8)","0","0","0","0","0","0","0","0"]
        let channelsEncodeArray = DriverSocketDataTools.encodeChannelData(channelsArray)
        for index in 0..<channelsEncodeArray.count {
            let commandIndex = index + 17
            commandArray[commandIndex] = "\(channelsEncodeArray[index])"
        }
        
        var check = 00
        for index in 0..<40 {
            let tempString = commandArray[index + 2]
            let commandValue = Int(tempString) ?? 1
            check = check^commandValue
        }
        commandArray[42] = "\(Int(check))"
//        let testHexArray = NSMutableArray.init()
        // 组装结束
        let sendData = NSMutableData.init()
        for index in 0..<commandArray.count {
            let commandItemString = commandArray[index]
            let hexString = HESbusTool.toHex(Int64(commandItemString) ?? 0)
//            testHexArray.add(hexString)
            let itemHexData = HESbusTool.convertHexStr(toData: hexString) ?? Data.init()
            sendData.append(itemHexData)
        }
        
//        DDLog("testHexArray:\(testHexArray)")
        DDLog("sendData:\(sendData)")
        return sendData as Data
    }
    
    // 更快的实现（减少中间转换和内存分配）,数字字符串转10进制或者16进制：radix 即为进制数
    class func fastConvert(_ string: String,_ radix:Int) -> String {
        return string.unicodeScalars.map { scalar in
            String(scalar.value, radix: radix)
        }.joined()
    }
    
    // 终端接收机id - 数据转换
    class func convertToStringArray(_ input: String) -> [String] {
        var stringArray: [String] = []
        guard input.count % 2 == 0 else {
            DDLog("Waring~：终端接收机id - 数据转换出错")
            return ["00","00", "00", "00", "00", "00","00", "00"]
        }
        // 按每两位字符进行分割
        for i in stride(from: 0, to: input.count, by: 2) {
            let startIndex = input.index(input.startIndex, offsetBy: i)
            let remainingDistance = input.distance(from: startIndex, to: input.endIndex)
            let offset = min(2, remainingDistance)
            let endIndex = input.index(startIndex, offsetBy: offset)
            
            let substring = String(input[startIndex..<endIndex])
            stringArray.append(substring)
        }
        return stringArray
    }
  
    
    class func encodeChannelData(_ channels: [String]) -> [UInt8] {
        // 确保至少有16个通道，不足的补"0"
        var channelStrings = channels
        if channelStrings.count < 16 {
            channelStrings.append(contentsOf: Array(repeating: "0", count: 16 - channelStrings.count))
        }
        
        // 转换为Int数组
        let channelInts = channelStrings.prefix(16).map { Int($0) ?? 0 }
        
        var result = [UInt8]()
        let mask = 0x07FF  // 11位掩码
        
        // 添加固定头部
        result.append(15)
        
        // 处理前8个通道 (0-7)
        result.append(UInt8(truncatingIfNeeded:(channelInts[0] & mask)))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[0], b: channelInts[1], shiftA: 8, shiftB: 3, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[1], b: channelInts[2], shiftA: 5, shiftB: 6, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[2], b: 0, shiftA: 2, shiftB: 0, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[2], b: channelInts[3], shiftA: 10, shiftB: 1, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[3], b: channelInts[4], shiftA: 7, shiftB: 4, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[4], b: channelInts[5], shiftA: 4, shiftB: 7, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[5], b: 0, shiftA: 1, shiftB: 0, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[5], b: channelInts[6], shiftA: 9, shiftB: 2, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[6], b: channelInts[7], shiftA: 6, shiftB: 5, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[7], b: 0, shiftA: 3, shiftB: 0, mask: mask))
        
        // 处理后8个通道 (8-15)
        result.append(UInt8(truncatingIfNeeded:(channelInts[8] & mask)))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[8], b: channelInts[9], shiftA: 8, shiftB: 3, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[9], b: channelInts[10], shiftA: 5, shiftB: 6, mask: mask))
        
        // 注意：这里使用channels[11]（可能是个错误，但保持与原OC代码一致）
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[10], b: 0, shiftA: 2, shiftB: 0, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[10], b: channelInts[11], shiftA: 10, shiftB: 1, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[11], b: channelInts[12], shiftA: 7, shiftB: 4, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[12], b: channelInts[13], shiftA: 4, shiftB: 7, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[13], b: 0, shiftA: 1, shiftB: 0, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[13], b: channelInts[14], shiftA: 9, shiftB: 2, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[14], b: channelInts[15], shiftA: 6, shiftB: 5, mask: mask))
        result.append(DriverSocketDataTools.encodeChunk(a: channelInts[15], b: 0, shiftA: 3, shiftB: 0, mask: mask))
        
        // 添加尾部
        result.append(0)
        result.append(0)
        
        return result
    }

    // 辅助函数：编码两个11位值的组合
    class func encodeChunk(a: Int, b: Int, shiftA: Int, shiftB: Int, mask: Int) -> UInt8 {
        let valueA = (a & mask) >> shiftA
        let valueB = (b & mask) << shiftB
        // 使用 UInt8 是默认结果值不会超过255，如果实际超过255 则会发生crash。我们此处的要求是只取低8位
        //实现方法1：
//        let value = UInt8((valueA | valueB) & 0xFF)
        //实现方法2：
        let value = UInt8(truncatingIfNeeded:(valueA | valueB))
        return value
    }

}

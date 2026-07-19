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


//
//  HESbusTool.h
//  HuachiElection
//
//  Created by YPKJ on 2023/5/10.
//

#import <Foundation/Foundation.h>

#import "NSString+SBus.h"

@class HESbusToolModel;

@interface HESbusTool : NSObject


/// 转hex16进制
/// - Parameter tmpid: 10进制数
+ (NSString *)toHex:(long long int)tmpid;

//设备号id转10进制
+ (NSArray *)strtoul:(NSString *)tmpid;

#pragma mark Sbus协议数据长度和数据块内容
+ (NSMutableArray *)listData:(NSArray *)arr;

#pragma mark 10进制转16进制
+ (NSString *)toSixteenHex:(uint16_t)tmpid;

#pragma mark 字符串转NSData
+ (NSData *)convertHexStrToData:(NSString *)str;

+(HESbusToolModel *)decryptionInputPackageWithData:(NSData *)data;
//2(起始符) + 1(命令码) + 2(流水号) + 8(终端 ID 号) + 2(数据长度) + 2(电源电压) + 2(GSM信号强度) + 34(位置信息) + 1(校验码) + 1(结束符) = 55(字节)。
//34(位置信息)： 1(年) + 1(月) + 1(日) + 1(时) + 1(分) + 1(秒) + 8(纬度) + 1(南北) + 8(经度) + 1(东西) + 2(速度) + 2(航向) + 2(海拔) + 1(状态1) +  1(状态2) + 1(状态3) + 1(状态4)

+(NSString *)HexStringWithData:(NSData *)data;

@end

@interface HESbusToolModel : NSObject

@property (nonatomic, copy) NSString * commandCode; //命令码
@property (nonatomic, copy) NSString * volt; //电压
@property (nonatomic, strong) NSString *gsm;//GSM信号强度
@property (nonatomic, strong) NSString *lat; //纬度
@property (nonatomic, strong) NSString *lon; //经度
@property (nonatomic, strong) NSString *northSouth;//南北
@property (nonatomic, strong) NSString *eastWest;//东西
@property (nonatomic, strong) NSString *speed;//速度
//定位状态:0,未定位;1,非差分定位;2,差分定位;4，fix；5，float；6,正在估算;

@end



//
//  HESbusTool.m
//  HuachiElection
//
//  Created by YPKJ on 2023/5/10.
//

#import "HESbusTool.h"

@implementation HESbusTool

/// 转hex16进制
/// - Parameter tmpid: 10进制数
+ (NSString *)toHex:(long long int)tmpid{
    NSString * result = [NSString stringWithFormat:@"%llx",tmpid];
    if (result.length < 2) {
        NSString *retun_str = [NSString stringWithFormat:@"0%@",result];
        return retun_str;
    }
    return [result uppercaseString];
}

//设备号id转10进制
+ (NSArray *)strtoul:(NSString *)tmpid{
    NSString *str1 = [self hexStringFromString:tmpid];
    NSMutableArray *arr2 = [NSMutableArray array];
    for (int i = 0 ; i < str1.length / 2; i++) {
        NSString *s = [str1 substringWithRange:NSMakeRange(2 * i, 2)];
        long l = strtoul(s.UTF8String, 0, 16);
//        NSLog(@"%@==%@=== %ld", str1,s,l);
        [arr2 addObject:[NSString stringWithFormat:@"%ld",l]];
    }
    return arr2;
}

+ (NSString *)hexStringFromString:(NSString *)string{
    NSData *myD = [string dataUsingEncoding:NSUTF8StringEncoding];
    Byte *bytes = (Byte *)[myD bytes];
    //下面是Byte 转换为16进制。
    NSString *hexStr=@"";
    for(int i=0;i<[myD length];i++) {
        NSString *newHexStr = [NSString stringWithFormat:@"%x",bytes[i]&0xff];///16进制数
        if([newHexStr length]==1)
            hexStr = [NSString stringWithFormat:@"%@0%@",hexStr,newHexStr];
        else
            hexStr = [NSString stringWithFormat:@"%@%@",hexStr,newHexStr];
    }
    return hexStr;
}

#pragma mark Sbus协议数据长度和数据块内容
+ (NSMutableArray *)listData:(NSArray *)arr{
    NSInteger channels0 = [arr[0] integerValue];
    NSInteger channels1 = [arr[1] integerValue];
    NSInteger channels2 = [arr[2] integerValue];
    NSInteger channels3 = [arr[3] integerValue];
    NSInteger channels4 = [arr[4] integerValue];
    NSInteger channels5 = [arr[5] integerValue];
    NSInteger channels6 = [arr[6] integerValue];
    NSInteger channels7 = [arr[7] integerValue];
    NSInteger channels8 = [arr[8] integerValue];
    NSInteger channels9 = [arr[9] integerValue];
    NSInteger channels10 = [arr[10] integerValue];
    NSInteger channels11 = [arr[11] integerValue];
    NSInteger channels12 = [arr[12] integerValue];
    NSInteger channels13 = [arr[13] integerValue];
    NSInteger channels14 = [arr[14] integerValue];
    NSInteger channels15 = [arr[15] integerValue];
    NSMutableArray *mtu_arr = [NSMutableArray array];
    NSInteger hexResult1 = (unsigned char) ((channels0 & 0x07FF));
    NSInteger hexResult2  = (unsigned char) ((channels0 & 0x07FF)>>8   | (channels1 & 0x07FF)<<3);
    NSInteger hexResult3  = (unsigned char) ((channels1 & 0x07FF)>>5   | (channels2 & 0x07FF)<<6);
    NSInteger hexResult4  = (unsigned char) ((channels2 & 0x07FF)>>2);
    NSInteger hexResult5  = (unsigned char) ((channels2 & 0x07FF)>>10  | (channels3 & 0x07FF)<<1);
    NSInteger hexResult6  = (unsigned char) ((channels3 & 0x07FF)>>7   | (channels4 & 0x07FF)<<4);
    NSInteger hexResult7  = (unsigned char) ((channels4 & 0x07FF)>>4   | (channels5 & 0x07FF)<<7);
    NSInteger hexResult8  = (unsigned char) ((channels5 & 0x07FF)>>1);
    NSInteger hexResult9  = (unsigned char) ((channels5 & 0x07FF)>>9   | (channels6 & 0x07FF)<<2);
    NSInteger hexResult10 = (unsigned char) ((channels6 & 0x07FF)>>6   | (channels7 & 0x07FF)<<5);
    NSInteger hexResult11 = (unsigned char) ((channels7 & 0x07FF)>>3);
    NSInteger hexResult12 = (unsigned char) ((channels8 & 0x07FF));
    NSInteger hexResult13 = (unsigned char) ((channels8 & 0x07FF)>>8   | (channels9 & 0x07FF)<<3);
    NSInteger hexResult14 = (unsigned char) ((channels9 & 0x07FF)>>5   | (channels10 & 0x07FF)<<6);
    NSInteger hexResult15 = (unsigned char) ((channels11 & 0x07FF)>>2);
    NSInteger hexResult16 = (unsigned char) ((channels11 & 0x07FF)>>10 | (channels11 & 0x07FF)<<1);
    NSInteger hexResult17 = (unsigned char) ((channels11 & 0x07FF)>>7  | (channels12 & 0x07FF)<<4);
    NSInteger hexResult18 = (unsigned char) ((channels12 & 0x07FF)>>4  | (channels13 & 0x07FF)<<7);
    NSInteger hexResult19 = (unsigned char) ((channels13 & 0x07FF)>>1);
    NSInteger hexResult20 = (unsigned char) ((channels13 & 0x07FF)>>9  | (channels14 & 0x07FF)<<2);
    NSInteger hexResult21 = (unsigned char) ((channels14 & 0x07FF)>>6  | (channels15 & 0x07FF)<<5);
    NSInteger hexResult22 = (unsigned char) ((channels15 & 0x07FF)>>3);
    [mtu_arr addObject:@(15)];
    [mtu_arr addObject:@(hexResult1)];
    [mtu_arr addObject:@(hexResult2)];
    [mtu_arr addObject:@(hexResult3)];
    [mtu_arr addObject:@(hexResult4)];
    [mtu_arr addObject:@(hexResult5)];
    [mtu_arr addObject:@(hexResult6)];
    [mtu_arr addObject:@(hexResult7)];
    [mtu_arr addObject:@(hexResult8)];
    [mtu_arr addObject:@(hexResult9)];
    [mtu_arr addObject:@(hexResult10)];
    [mtu_arr addObject:@(hexResult11)];
    [mtu_arr addObject:@(hexResult12)];
    [mtu_arr addObject:@(hexResult13)];
    [mtu_arr addObject:@(hexResult14)];
    [mtu_arr addObject:@(hexResult15)];
    [mtu_arr addObject:@(hexResult16)];
    [mtu_arr addObject:@(hexResult17)];
    [mtu_arr addObject:@(hexResult18)];
    [mtu_arr addObject:@(hexResult19)];
    [mtu_arr addObject:@(hexResult20)];
    [mtu_arr addObject:@(hexResult21)];
    [mtu_arr addObject:@(hexResult22)];
    
    [mtu_arr addObject:@(00)];
    [mtu_arr addObject:@(00)];
    
    return mtu_arr;
}

#pragma mark 10进制转16进制
+ (NSString *)toSixteenHex:(uint16_t)tmpid{
    NSString *nLetterValue;
    NSString *str =@"";
    uint16_t ttmpig;
    NSString *n1;
    ttmpig=tmpid%16;
    tmpid=tmpid/16;
    switch (ttmpig) {
        case 10:
            nLetterValue =@"A";
            break;
        case 11:
            nLetterValue =@"B";
            break;
        case 12:
            nLetterValue =@"C";
            break;
        case 13:
            nLetterValue =@"D";
            break;
        case 14:
            nLetterValue =@"E";
            break;
        case 15:
            nLetterValue =@"F";
            break;
        default:
            nLetterValue = [NSString stringWithFormat:@"%u",ttmpig];
    }
    if (tmpid ==0) {
        str=[str stringByAppendingString:[NSString stringWithFormat:@"0%@",nLetterValue]];
        return str;
    }
    if(tmpid >0 && tmpid<=16){
        switch (tmpid){
            case 10:
                n1 =@"A";break;
            case 11:
                n1 =@"B";break;
            case 12:
                n1 =@"C";break;
            case 13:
                n1 =@"D";break;
            case 14:
                n1 =@"E";break;
            case 15:
                n1 =@"F";break;
            default:
                n1 = [NSString stringWithFormat:@"%u",tmpid];
        }
        str = [n1 stringByAppendingString:nLetterValue];
    }
    return str;
}

#pragma mark 字符串转NSData
+ (NSData *)convertHexStrToData:(NSString *)str{
    if (!str || [str length] == 0) {
        return nil;
    }
    NSMutableData *hexData = [[NSMutableData alloc] initWithCapacity:20];
    NSRange range;
    if ([str length] % 2 == 0) {
        range = NSMakeRange(0, 2);
    } else {
        range = NSMakeRange(0, 1);
    }
    for (NSInteger i = range.location; i < [str length]; i += 2) {
        unsigned int anInt;
        NSString *hexCharStr = [str substringWithRange:range];
        NSScanner *scanner = [[NSScanner alloc] initWithString:hexCharStr];
        [scanner scanHexInt:&anInt];
        NSData *entity = [[NSData alloc] initWithBytes:&anInt length:1];
        [hexData appendData:entity];
        range.location += range.length;
        range.length = 2;
    }
    return hexData;
}



//2(起始符) + 1(命令码) + 2(流水号) + 8(终端 ID 号) + 2(数据长度) + 2(电源电压) + 2(GSM信号强度) + 34(位置信息) + 1(校验码) + 1(结束符) = 55(字节)。
//34(位置信息)： 1(年) + 1(月) + 1(日) + 1(时) + 1(分) + 1(秒) + 8(纬度) + 1(南北) + 8(经度) + 1(东西) + 2(速度) + 2(航向) + 2(海拔) + 1(状态1) +  1(状态2) + 1(状态3) + 1(状态4)
#pragma mark -
#pragma mark ===== 解数据 =====
+(HESbusToolModel *)decryptionInputPackageWithData:(NSData *)data{
    HESbusToolModel *model = [[HESbusToolModel alloc] init];
    // 检查数据
    if (!data || ![data isKindOfClass:[NSData class]]) {
        NSError *error = [NSError errorWithDomain:NSCocoaErrorDomain code:0 userInfo:@{NSLocalizedDescriptionKey:@"Encryption Data is nil or not kind of NSData Class"}];
//        HTMiddlewareLog(@"%@", error.localizedDescription);
        return nil;
    }
    NSInteger dataLenth = data.length;
    // 总长度是否等于55
    if (dataLenth != 55) {
        NSError *error = [NSError errorWithDomain:NSCocoaErrorDomain code:0 userInfo:@{NSLocalizedDescriptionKey:@"Decryption Data Size Error"}];
//        HTMiddlewareLog(@"%@", error.localizedDescription);
        return nil;
    }
    
    //命令码
    NSData *commandCodeData = [data subdataWithRange:NSMakeRange(2, 1)];
    NSString *commandCode = [self HexStringWithData:commandCodeData];
    model.commandCode = [NSString stringWithFormat:@"%lu",strtoul(commandCode.UTF8String,0,16)];;
    
    //电源电压
    NSData *voltageData = [data subdataWithRange:NSMakeRange(15, 2)];
    NSString *voltage = [self HexStringWithData:voltageData];
    NSString *volt = [NSString stringWithFormat:@"%lu",strtoul(voltage.UTF8String,0,16)];;
    model.volt = [NSString stringWithFormat:@"%.1fV",volt.floatValue / 100.0];
    
    //    GSM信号强度
    NSData *GSMData = [data subdataWithRange:NSMakeRange(17, 2)];
    NSString *gsm = [self HexStringWithData:GSMData];
    model.gsm =  [NSString stringWithFormat:@"%lu",strtoul(gsm.UTF8String,0,16)];
//    <5a43        16         126c    3230303030303535 0026       047c             0017        2b         0d>
    //2(起始符) + 1(命令码) + 2(流水号) + 8(终端 ID 号) + 2(数据长度) + 2(电源电压) + 2(GSM信号强度) + 34(位置信息) + 1(校验码) + 1(结束符) = 55(字节)。
    //34(位置信息)： 1(年) + 1(月) + 1(日) + 1(时) + 1(分) + 1(秒) + 8(纬度) + 1(南北) + 8(经度) + 1(东西) + 2(速度) + 2(航向) + 2(海拔) + 1(状态1) +  1(状态2) + 1(状态3) + 1(状态4)
                //    00     00        00     08     00    00 00000000 00000000 2c 00000000 00000000 2c     0000    0000      0000      00         00      00 00
//    纬度
    NSData *latitudeMData = [data subdataWithRange:NSMakeRange(25, 8)];
    NSString *latitude = [self HexStringWithData:latitudeMData];
    uint64_t encoding;
    const char *sss = [latitude UTF8String];
    sscanf(sss,"%"SCNx64, &encoding);
    double value;
    memcpy(&value, &encoding, sizeof value);
    model.lat =  [NSString stringWithFormat:@"%f",value];
//    南北
    NSData *northSouthData = [data subdataWithRange:NSMakeRange(33, 1)];
    NSString *northSouth = [self HexStringWithData:northSouthData];
    model.northSouth =  [NSString stringWithFormat:@"%lu",strtoul(northSouth.UTF8String,0,16)];
//    经度
    NSData *longitudeData = [data subdataWithRange:NSMakeRange(34, 8)];
    NSString *longitude = [self HexStringWithData:longitudeData];
    const char *sss2 = [longitude UTF8String];
    sscanf(sss2,"%"SCNx64, &encoding);
    double value2;
    memcpy(&value2, &encoding, sizeof value2);
    model.lon =  [NSString stringWithFormat:@"%f",value2];
//    东西
    NSData * eastWestData= [data subdataWithRange:NSMakeRange(42, 1)];
    NSString *eastWest = [self HexStringWithData:eastWestData];
    model.eastWest =  [NSString stringWithFormat:@"%lu",strtoul(eastWest.UTF8String,0,16)];
    //    速度
    NSData * speedData= [data subdataWithRange:NSMakeRange(43, 2)];
    NSString *speed = [self HexStringWithData:speedData];
    NSString *speeds = [NSString stringWithFormat:@"%lu",strtoul(speed.UTF8String,0,16)];
    model.speed = [NSString stringWithFormat:@"%ld",speeds.integerValue / 1000];
    return model;
}

+(NSString *)HexStringWithData:(NSData *)data{
    Byte *bytes = (Byte *)[data bytes];
    NSString *hexStr=@"";
    for(int i=0;i<[data length];i++) {
        NSString *newHexStr = [NSString stringWithFormat:@"%x",bytes[i]&0xff];///16进制数
        if([newHexStr length]==1){
            hexStr = [NSString stringWithFormat:@"%@0%@",hexStr,newHexStr];
        }
        else{
            hexStr = [NSString stringWithFormat:@"%@%@",hexStr,newHexStr];
        }
    }
    hexStr = [hexStr uppercaseString];
    return hexStr;
}

- (NSArray *)sBusEncode:(NSArray *)arr{
    NSMutableArray *new_arr = [NSMutableArray array];
//    [new_arr add]
    NSInteger n1 = [arr[0] intValue];
    NSInteger n2 = [arr[1] intValue];
    NSInteger n3 = [arr[2] intValue];
    NSInteger n4 = [arr[3] intValue];
    NSInteger n5 = [arr[4] intValue];
    NSInteger n6 = [arr[5] intValue];
    NSInteger n7 = [arr[6] intValue];
    NSInteger n8 = [arr[7] intValue];
    NSInteger n9 = [arr[8] intValue];
    NSInteger n10 = [arr[9] intValue];
    NSInteger n11 = [arr[10] intValue];
    NSInteger n12 = [arr[11] intValue];
    NSInteger n13 = [arr[12] intValue];
    NSInteger n14 = [arr[13] intValue];
    NSInteger n15 = [arr[14] intValue];
    NSInteger n16 = [arr[15] intValue];
    NSInteger n17 = [arr[16] intValue];
    NSInteger n18 = [arr[17] intValue];
    NSInteger n19 = [arr[18] intValue];
    NSInteger n20 = [arr[19] intValue];
    NSInteger n21 = [arr[20] intValue];
    NSInteger n22 = [arr[21] intValue];
    
    NSInteger c1  = ((n1|n2<<8)                      & 0x07FF);
    NSInteger c2  = ((n2>>3 |n3<<5) & 0x07FF);
    NSInteger c3  = ((n3>>6 |n4<<2 |n5<<10)  & 0x07FF);
    NSInteger c4  = ((n5>>1 |n6<<7)                 & 0x07FF);
    NSInteger c5  = ((n6>>4 |n7<<4)                 & 0x07FF);
    NSInteger c6  = ((n7>>7 |n8<<1 |n9<<9)   & 0x07FF);
    NSInteger c7  = ((n9>>2 | n10<<6)                & 0x07FF);
    NSInteger c8  = ((n10>>5|n11<<3)                & 0x07FF);
    NSInteger c9  = ((n12   |n13<<8)                & 0x07FF);
    NSInteger c10  = ((n13>>3|n14<<5)                & 0x07FF);
    NSInteger c11 = ((n14>>6|n15<<2|n16<<10) & 0x07FF);
    NSInteger c12 = ((n16>>1|n17<<7)                & 0x07FF);
    NSInteger c13 = ((n17>>4|n18<<4)                & 0x07FF);
    NSInteger c14 = ((n18>>7|n19<<1|n20<<9)  & 0x07FF);
    NSInteger c15 = ((n20>>2|n21<<6)                & 0x07FF);
    NSInteger c16 = ((n21>>5|n22<<3)                & 0x07FF);
    
    [new_arr addObject:@(c1)];
    [new_arr addObject:@(c2)];
    [new_arr addObject:@(c3)];
    [new_arr addObject:@(c4)];
    [new_arr addObject:@(c5)];
    [new_arr addObject:@(c6)];
    [new_arr addObject:@(c7)];
    [new_arr addObject:@(c8)];
    [new_arr addObject:@(c9)];
    [new_arr addObject:@(c10)];
    [new_arr addObject:@(c11)];
    [new_arr addObject:@(c12)];
    [new_arr addObject:@(c13)];
    [new_arr addObject:@(c14)];
    [new_arr addObject:@(c15)];
    [new_arr addObject:@(c16)];
    
    return new_arr;
}


@end




@implementation HESbusToolModel



@end



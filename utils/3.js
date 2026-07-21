/**
 * HESbusToolModel - 数据模型
 */
class HESbusToolModel {
    constructor() {
        this.commandCode = '';    // 命令码
        this.volt = '';           // 电压
        this.gsm = '';            // GSM信号强度
        this.lat = '';            // 纬度
        this.lon = '';            // 经度
        this.northSouth = '';     // 南北
        this.eastWest = '';       // 东西
        this.speed = '';          // 速度
    }
}

/**
 * HESbusTool - 工具类
 */
class HESbusTool {
    
    // ==================== 静态工具方法 ====================
    
    /**
     * 转 hex 16进制
     * @param {number} tmpid - 10进制数
     * @returns {string} 16进制字符串
     */
    static toHex(tmpid) {
        let result = tmpid.toString(16).toLowerCase();
        if (result.length < 2) {
            return '0' + result;
        }
        return result.toUpperCase();
    }
    
    /**
     * 设备号id转10进制数组
     * @param {string} tmpid - 字符串
     * @returns {number[]} 10进制数组
     */
    static strtoul(tmpid) {
        const str1 = this.hexStringFromString(tmpid);
        const arr2 = [];
        for (let i = 0; i < str1.length / 2; i++) {
            const s = str1.substring(2 * i, 2 * i + 2);
            const l = parseInt(s, 16);
            arr2.push(l.toString());
        }
        return arr2;
    }
    
    /**
     * 字符串转16进制字符串
     * @param {string} string - 输入字符串
     * @returns {string} 16进制字符串
     */
    static hexStringFromString(string) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(string);
        let hexStr = '';
        for (let i = 0; i < bytes.length; i++) {
            let newHexStr = (bytes[i] & 0xff).toString(16);
            if (newHexStr.length === 1) {
                hexStr += '0' + newHexStr;
            } else {
                hexStr += newHexStr;
            }
        }
        return hexStr;
    }
    
    /**
     * SBUS协议数据长度和数据块内容（编码）
     * @param {number[]} arr - 16通道数据数组
     * @returns {number[]} 编码后的数据数组
     */
    static listData(arr) {
        const channels = arr.map(v => Number(v));
        
        const hexResult1  = (channels[0]  & 0x07FF);
        const hexResult2  = ((channels[0]  & 0x07FF) >> 8  | (channels[1]  & 0x07FF) << 3);
        const hexResult3  = ((channels[1]  & 0x07FF) >> 5  | (channels[2]  & 0x07FF) << 6);
        const hexResult4  = ((channels[2]  & 0x07FF) >> 2);
        const hexResult5  = ((channels[2]  & 0x07FF) >> 10 | (channels[3]  & 0x07FF) << 1);
        const hexResult6  = ((channels[3]  & 0x07FF) >> 7  | (channels[4]  & 0x07FF) << 4);
        const hexResult7  = ((channels[4]  & 0x07FF) >> 4  | (channels[5]  & 0x07FF) << 7);
        const hexResult8  = ((channels[5]  & 0x07FF) >> 1);
        const hexResult9  = ((channels[5]  & 0x07FF) >> 9  | (channels[6]  & 0x07FF) << 2);
        const hexResult10 = ((channels[6]  & 0x07FF) >> 6  | (channels[7]  & 0x07FF) << 5);
        const hexResult11 = ((channels[7]  & 0x07FF) >> 3);
        const hexResult12 = ((channels[8]  & 0x07FF));
        const hexResult13 = ((channels[8]  & 0x07FF) >> 8  | (channels[9]  & 0x07FF) << 3);
        const hexResult14 = ((channels[9]  & 0x07FF) >> 5  | (channels[10] & 0x07FF) << 6);
        const hexResult15 = ((channels[10] & 0x07FF) >> 2);
        const hexResult16 = ((channels[10] & 0x07FF) >> 10 | (channels[11] & 0x07FF) << 1);
        const hexResult17 = ((channels[11] & 0x07FF) >> 7  | (channels[12] & 0x07FF) << 4);
        const hexResult18 = ((channels[12] & 0x07FF) >> 4  | (channels[13] & 0x07FF) << 7);
        const hexResult19 = ((channels[13] & 0x07FF) >> 1);
        const hexResult20 = ((channels[13] & 0x07FF) >> 9  | (channels[14] & 0x07FF) << 2);
        const hexResult21 = ((channels[14] & 0x07FF) >> 6  | (channels[15] & 0x07FF) << 5);
        const hexResult22 = ((channels[15] & 0x07FF) >> 3);
        
        const mtu_arr = [
            15,
            hexResult1 & 0xFF,  hexResult2 & 0xFF,  hexResult3 & 0xFF,
            hexResult4 & 0xFF,  hexResult5 & 0xFF,  hexResult6 & 0xFF,
            hexResult7 & 0xFF,  hexResult8 & 0xFF,  hexResult9 & 0xFF,
            hexResult10 & 0xFF, hexResult11 & 0xFF, hexResult12 & 0xFF,
            hexResult13 & 0xFF, hexResult14 & 0xFF, hexResult15 & 0xFF,
            hexResult16 & 0xFF, hexResult17 & 0xFF, hexResult18 & 0xFF,
            hexResult19 & 0xFF, hexResult20 & 0xFF, hexResult21 & 0xFF,
            hexResult22 & 0xFF,
            0, 0
        ];
        
        return mtu_arr;
    }
    
    /**
     * 10进制转16进制（2位）
     * @param {number} tmpid - 10进制数
     * @returns {string} 16进制字符串
     */
    static toSixteenHex(tmpid) {
        const hex = tmpid.toString(16).toUpperCase().padStart(2, '0');
        return hex;
    }
    
    /**
     * 16进制字符串转 Uint8Array
     * @param {string} str - 16进制字符串
     * @returns {Uint8Array|null} 字节数组
     */
    static convertHexStrToData(str) {
        if (!str || str.length === 0) {
            return null;
        }
        const hexData = [];
        let start = (str.length % 2 === 0) ? 0 : 1;
        
        if (str.length % 2 !== 0) {
            hexData.push(parseInt(str[0], 16));
        }
        
        for (let i = start; i < str.length; i += 2) {
            const hexCharStr = str.substring(i, i + 2);
            const anInt = parseInt(hexCharStr, 16);
            hexData.push(anInt);
        }
        
        return new Uint8Array(hexData);
    }
    
    /**
     * 数据转16进制字符串
     * @param {Uint8Array|ArrayBuffer|Array} data - 数据
     * @returns {string} 16进制字符串
     */
    static HexStringWithData(data) {
        let bytes;
        if (data instanceof Uint8Array) {
            bytes = data;
        } else if (data instanceof ArrayBuffer) {
            bytes = new Uint8Array(data);
        } else if (Array.isArray(data)) {
            bytes = new Uint8Array(data);
        } else {
            throw new Error('Unsupported data type');
        }
        
        let hexStr = '';
        for (let i = 0; i < bytes.length; i++) {
            let newHexStr = (bytes[i] & 0xff).toString(16);
            if (newHexStr.length === 1) {
                hexStr += '0' + newHexStr;
            } else {
                hexStr += newHexStr;
            }
        }
        return hexStr.toUpperCase();
    }
    
    /**
     * 解析数据包
     * 协议格式:
     * 2(起始符) + 1(命令码) + 2(流水号) + 8(终端ID) + 2(数据长度) + 2(电源电压) + 2(GSM信号) + 34(位置信息) + 1(校验码) + 1(结束符) = 55字节
     * 34(位置信息): 1(年)+1(月)+1(日)+1(时)+1(分)+1(秒)+8(纬度)+1(南北)+8(经度)+1(东西)+2(速度)+2(航向)+2(海拔)+1(状态1)+1(状态2)+1(状态3)+1(状态4)
     * 
     * @param {Uint8Array|ArrayBuffer|Array} data - 原始数据
     * @returns {HESbusToolModel|null} 解析后的模型
     */
    static decryptionInputPackageWithData(data) {
        const model = new HESbusToolModel();
        
        // 检查数据
        if (!data) {
            console.error('Encryption Data is nil');
            return null;
        }
        
        let bytes;
        if (data instanceof Uint8Array) {
            bytes = data;
        } else if (data instanceof ArrayBuffer) {
            bytes = new Uint8Array(data);
        } else if (Array.isArray(data)) {
            bytes = new Uint8Array(data);
        } else {
            console.error('Data is not a valid byte array');
            return null;
        }
        
        // 总长度是否等于55
        if (bytes.length !== 55) {
            console.error('Decryption Data Size Error: expected 55, got', bytes.length);
            return null;
        }
        
        // 辅助函数：提取子数据并转16进制字符串
        const subHex = (start, length) => {
            const sub = bytes.slice(start, start + length);
            return this.HexStringWithData(sub);
        };
        
        // 命令码 (位置2, 长度1)
        const commandCode = subHex(2, 1);
        model.commandCode = parseInt(commandCode, 16).toString();
        
        // 电源电压 (位置15, 长度2)
        const voltage = subHex(15, 2);
        const volt = parseInt(voltage, 16);
        model.volt = (volt / 100.0).toFixed(1) + 'V';
        
        // GSM信号强度 (位置17, 长度2)
        const gsm = subHex(17, 2);
        model.gsm = parseInt(gsm, 16).toString();
        
        // 纬度 (位置25, 长度8) - 8字节double
        const latitudeHex = subHex(25, 8);
        const latBytes = this.convertHexStrToData(latitudeHex);
        const latView = new DataView(latBytes.buffer);
        const latValue = latView.getFloat64(0, false); // big-endian
        model.lat = latValue.toString();
        
        // 南北 (位置33, 长度1)
        const northSouth = subHex(33, 1);
        model.northSouth = parseInt(northSouth, 16).toString();
        
        // 经度 (位置34, 长度8) - 8字节double
        const longitudeHex = subHex(34, 8);
        const lonBytes = this.convertHexStrToData(longitudeHex);
        const lonView = new DataView(lonBytes.buffer);
        const lonValue = lonView.getFloat64(0, false); // big-endian
        model.lon = lonValue.toString();
        
        // 东西 (位置42, 长度1)
        const eastWest = subHex(42, 1);
        model.eastWest = parseInt(eastWest, 16).toString();
        
        // 速度 (位置43, 长度2)
        const speed = subHex(43, 2);
        const speeds = parseInt(speed, 16);
        model.speed = Math.floor(speeds / 1000).toString();
        
        return model;
    }
    
    /**
     * SBUS解码 - 将22字节数据解码为16通道
     * @param {number[]} arr - 22字节数组
     * @returns {number[]} 16通道数据
     */
    static sBusEncode(arr) {
        const n = arr.map(v => Number(v));
        
        const c1  = ((n[0]  | n[1]  << 8)                    & 0x07FF);
        const c2  = ((n[1]  >> 3 | n[2]  << 5)               & 0x07FF);
        const c3  = ((n[2]  >> 6 | n[3]  << 2 | n[4]  << 10) & 0x07FF);
        const c4  = ((n[4]  >> 1 | n[5]  << 7)              & 0x07FF);
        const c5  = ((n[5]  >> 4 | n[6]  << 4)              & 0x07FF);
        const c6  = ((n[6]  >> 7 | n[7]  << 1 | n[8]  << 9)  & 0x07FF);
        const c7  = ((n[8]  >> 2 | n[9]  << 6)              & 0x07FF);
        const c8  = ((n[9]  >> 5 | n[10] << 3)              & 0x07FF);
        const c9  = ((n[11] | n[12] << 8)                  & 0x07FF);
        const c10 = ((n[12] >> 3 | n[13] << 5)              & 0x07FF);
        const c11 = ((n[13] >> 6 | n[14] << 2 | n[15] << 10) & 0x07FF);
        const c12 = ((n[15] >> 1 | n[16] << 7)              & 0x07FF);
        const c13 = ((n[16] >> 4 | n[17] << 4)              & 0x07FF);
        const c14 = ((n[17] >> 7 | n[18] << 1 | n[19] << 9)  & 0x07FF);
        const c15 = ((n[19] >> 2 | n[20] << 6)              & 0x07FF);
        const c16 = ((n[20] >> 5 | n[21] << 3)              & 0x07FF);
        
        return [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16];
    }
}




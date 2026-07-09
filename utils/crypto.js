// src/utils/crypto.js
import CryptoJS from 'crypto-js';

// 定义密钥（需与后端保持一致，通常为16或32位字符串）
// const SECRET_KEY = 'xyv8isi9on888888'; 
const SECRET_KEY = 'xyv8isi9on888888' ||  import.meta.env.UNI_APP_SECRET_KEY
console.log("SECRET_KEY",SECRET_KEY)
// 将密钥转换为 UTF-8 编码的 WordArray 格式
const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);

/**
 * AES 加密
 * @param {string} plaintext - 需要加密的明文
 * @returns {string} 加密后的 Base64 字符串
 */
export function encryptAES(plaintext) {
    const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString(); // 返回 Base64 格式的密文
}

/**
 * AES 解密
 * @param {string} ciphertext - 需要解密的密文
 * @returns {string} 解密后的 UTF-8 明文字符串
 */
export function decryptAES(ciphertext) {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8); // 将二进制数据转回 UTF-8 字符串
}
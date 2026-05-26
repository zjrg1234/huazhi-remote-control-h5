<template>
    <view class="page">
        <view class="wrap-content">
            <!-- 申诉图片 -->
            <view class="form-item">
                <text class="label required">申诉图片</text>
                <view class="upload-box" @click="chooseImage">
                    <view v-if="!imageUrl" class="upload-placeholder">
                        <text class="plus-icon">+</text>
                    </view>
                    <image v-else :src="imageUrl" class="preview-img" mode="aspectFill" />
                </view>
                <text class="tip">支持.png\.jpg\.jpeg，最大1M，仅限一张</text>
            </view>

            <!-- 申诉原因 -->
            <view class="form-item">
                <text class="label required">申诉原因</text>
                <view class="reason-tags">
                    <view v-for="item in reasonList" :key="item" class="tag-item"
                        :class="{ active: selectedReason === item }" @click="selectedReason = item">
                        {{ item }}
                    </view>
                </view>
            </view>

            <!-- 申诉内容输入 -->
            <view class="form-item">
                <textarea class="content-textarea" v-model="content" placeholder="请把你申诉的内容反馈给我们" />
            </view>

            <text class="hint">提示：由于车辆或车主原因导致不能驾驶可以向平台发起申诉</text>

        </view>

        <!-- 提交按钮 -->
        <view class="submit-btn" @click="handleSubmit">确定</view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { AppealOrderNo } from "@/axios/mine"
import { baseUrl } from '@/config/env'

// 表单数据
const imageUrl = ref('')
const selectedReason = ref('')
const content = ref('')
const orderNo = ref('')

onLoad((options) => {
    orderNo.value = options.order_no || ''
})

// 申诉原因选项
const reasonList = ref([
    '无视频信号',
    '无法控制',
    '车辆故障',
    '画面黑屏',
    '软件闪退',
    '车辆翻车',
    '其他'
])

// 选择并上传图片（兼容微信/抖音小程序）
const chooseImage = async () => {
    try {
        // 选择图片（限制 1 张）
        const res = await uni.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera']
        })

        const tempFilePath = res.tempFilePaths[0]
        
        // 校验大小 1M
        const fileInfo = await uni.getFileInfo({ filePath: tempFilePath })
        const sizeMB = fileInfo.size / (1024 * 1024)
        if (sizeMB > 1) {
            uni.showToast({ title: '图片大小不能超过1M', icon: 'none' })
            return
        }

        // 上传
        await uploadFile(tempFilePath)
    } catch (err) {
        console.error('选择图片失败：', err)
    }
}

// 上传文件（已修复 BUG）
const uploadFile = async (filePath) => {
    uni.showLoading({ title: '上传中...' })
    
    // 上传前先清空旧图，防止显示错误
    imageUrl.value = ''
    
    try {
        const uploadRes = await uni.uploadFile({
            url: baseUrl + '/api/upload/picture',
            filePath: filePath,
            name: 'imageFile[]', // 修复：只保留一个
            method: 'POST',
        })

        const data = JSON.parse(uploadRes.data)
        console.log(data)
        if (data.code === 200) {
            // 上传成功 → 赋值展示
            imageUrl.value = data.data.file[0]
            uni.showToast({ title: '上传成功', icon: 'success' })
        } else {
            throw new Error('上传失败')
        }
    } catch (err) {
        imageUrl.value = '' // 失败清空
        uni.showToast({ title: '上传失败', icon: 'none' })
        console.error('上传错误：', err)
    } finally {
        uni.hideLoading()
    }
}

// 提交申诉
const handleSubmit = () => {
    if (!imageUrl.value) {
        uni.showToast({ title: '请上传申诉图片', icon: 'none' })
        return
    }
    if (!selectedReason.value) {
        uni.showToast({ title: '请选择申诉原因', icon: 'none' })
        return
    }
    if (selectedReason.value === '其他' && !content.value) {
        uni.showToast({ title: '请填写申诉原因', icon: 'none' })
        return
    }

    const submitData = {
        image: imageUrl.value,
        content: selectedReason.value === '其他' ? content.value : selectedReason.value,
        order_no: orderNo.value
    }

    AppealOrderNo(submitData).then(res => {
        console.log(res, "===")
        uni.showToast({ title: '提交成功' })
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)
    }).catch(err => {
        uni.showToast({ title: '提交失败', icon: 'none' })
    })
}
</script>

<style lang="scss" scoped>
.page {
    background: #F8F8F8;
    min-height: 100vh;
    padding: 20rpx;
}

.wrap-content {
    background: #fff;
    padding: 25rpx;
    border-radius: 16rpx;
}

.form-item {
    margin-bottom: 40rpx;
}

.label {
    font-size: 30rpx;
    color: #333;
    display: block;
    margin-bottom: 20rpx;
}

.required::before {
    content: '*';
    color: red;
    margin-right: 8rpx;
}

.upload-box {
    width: 200rpx;
    height: 200rpx;
    background: #f5f5f5;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.upload-placeholder .plus-icon {
    font-size: 60rpx;
    color: #999;
}

.preview-img {
    width: 100%;
    height: 100%;
}

.tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
    display: block;
}

.reason-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.tag-item {
    padding: 10rpx 16rpx;
    border: 1rpx solid #666;
    border-radius: 8rpx;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 24rpx;
    color: #666666;
}

.tag-item.active {
    background: #FFC838;
    border-color: #FFC838;
    border-radius: 12rpx;
    color: #1A1A1A;
}

.content-textarea {
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    width: 100%;
    height: 200rpx;
    background: #F8F8F8;
    border-radius: 16rpx;
    padding: 20rpx;
    font-size: 28rpx;
    box-sizing: border-box;

    ::placeholder {
        color: #CCCCCC;
    }
}

.hint {
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 24rpx;
    color: #999999;
}

.submit-btn {
    position: fixed;
    left: 30rpx;
    right: 30rpx;
    bottom: 40rpx;
    background: #ffc83d;
    color: #000;
    text-align: center;
    line-height: 88rpx;
    border-radius: 12rpx;
    font-size: 32rpx;
}
</style>
<template>
	<view class="layout">
		<view class="navbar">
			<view class="statusBar" :style="{ height: getStatusBarHeight() + 'px' }"></view>

			<view class="nav-back" @click="handleBack">
				<image class="back-icon" src="/static/images/common/icon_arrows@2x.png" mode="widthFix" />
			</view>

			<view class="titleBar" v-if="title"
				:style="{ height: getTitleBarHeight() + 'px', marginLeft: getLeftIconLeft() + 'px' }">
				<view class="title">{{ title }}</view>
			</view>
		</view>

		<view class="fill" :style="{ height: getNavBarHeight() + 'px' }">

		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { getStatusBarHeight, getTitleBarHeight, getNavBarHeight, getLeftIconLeft } from "@/utils/system.js"
const emit = defineEmits(['back'])

const props =  defineProps({
	title: {
		type: String,
		default: ""
	},
	url: {
		type: String,
		default: ""
	},
	flag: {
		type: String,
		default: "0"
	}
})

// 返回事件
const handleBack = () => {
	console.log(123,props.url)
  emit('back')
	if(props.url) {
		if (props.flag == 1) {
			uni.switchTab({url: props.url})
		} else {
		uni.navigateTo({ url: props.url })

		}
	} else {
		window.location.href = "/pages/index/index"
	}
}

</script>

<style lang="scss" scoped>
.layout {
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 10;

		.titleBar {
			display: flex;
			align-items: center;

			.title {
				
				width: 100%;
				text-align: center;

				font-family: PingFangSC, PingFang SC;
				font-weight: 500;
				font-size: 32rpx;
				color: #333333;

			}

		}


		.nav-back {
			position: absolute;
			left: 0;
			
			display: flex;
			align-items: center;
			justify-content: center;
			width: 60rpx;
			height: 60rpx;
		}

		.back-icon {
			width: 48rpx;
			height: 48rpx;
			margin-top: 12rpx;
			transform: rotate(180deg);
			/* 箭头方向正确 */
		}
	}

}
</style>
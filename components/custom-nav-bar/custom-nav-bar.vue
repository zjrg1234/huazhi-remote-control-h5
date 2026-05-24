<template>
	<view class="layout">
		<view class="navbar">
			<view class="statusBar" :style="{height:getStatusBarHeight()+'px'}"></view>
			<view class="titleBar" v-if="title"
			:style="{height:getTitleBarHeight()+'px',marginLeft:getLeftIconLeft()+'px'}">
				<view class="title">{{title}}</view>
			</view>
		</view>
		
		<view class="fill" :style="{height:getNavBarHeight()+'px'}">
			
		</view> 
	</view>
</template>

<script setup>
import { ref } from 'vue';
import {getStatusBarHeight,getTitleBarHeight,getNavBarHeight,getLeftIconLeft} from "@/utils/system.js"

defineProps({
	title:{
		type:String,
		default:""
	}
})


</script>

<style lang="scss" scoped>
.layout{
	.navbar{
		position: fixed;
		top:0;
		left:0;
		width: 100%;
		z-index: 10;
		.titleBar{
			display: flex;	
			align-items: center;
			padding:0 30rpx;
				
			.title{
				font-size: 22px;
				font-weight: 700;
				color: $uni-color-1;
			}
			
		}
	}
	
}
</style>
<template>
	<view>

		<div class="container">
			<!-- 顶部通用声明 -->
			<div class="intro-text">
				为保障掌中视界APP的稳定运行或实现相关功能，我们可能会接入由第三方提供的软件开发包（SDK）实现上述目的。我们会尽到审慎义务，对合作方获取信息的软件工具开发包（SDK）进行严格的安全监测，以保护数据安全。我们接入的第三方SDK主要服务于您以及其他的用户的需求，因此在满足新的服务需求及业务功能变更时，我们可能会调整我们接入的第三方SDK。我们会及时在本说明中向您公开说明接入第三方SDK的最新情况。目前掌中视界APP接入的第三方SDK列明如下:
			</div>

			<!-- 1. 支付宝 -->
			<div class="sdk-item">
				<div class="sdk-title">APP支付宝客户端SDK</div>
				<div class="info-row"><span class="info-label">开发者信息</span><span class="info-content">支付宝（杭州）信息技术有限公司</span>
				</div>
				<div class="info-row"><span class="info-label">收集信息范围：</span><span
						class="info-content">AndroidID、OAID、IDFV、传感器信息（传感器列表）、设备屏幕密度、运营商信息、WIFI参数、网络类型</span></div>
				<div class="info-row"><span class="info-label">收集方式：</span><span class="info-content">SDK本机采集</span></div>
				<div class="info-row"><span class="info-label">使用目的：</span><span class="info-content">为用户提供支付宝支付功能</span></div>
				<div class="info-row"><span class="info-label">使用场景：</span><span class="info-content">用户支付订单时</span></div>
				<a href="https://opendocs.alipay.com/open/54/01g6qm#%25E6%2594%25AF%25E4%25BB%2598%25E5%25AE%259D%2520App%2520%25E6%2594%25A"
					target="_blank"
					class="privacy-link">隐私政策链接：https://opendocs.alipay.com/open/54/01g6qm#%25E6%2594%25AF%25E4%25BB%2598%25E5%25AE%259D%2520App%2520%25E6%2594%25A</a>
			</div>

			<!-- 2. 微信 OpenSDK -->
			<div class="sdk-item">
				<div class="sdk-title">微信OpenSDK Android</div>
				<div class="info-row"><span class="info-label">开发者信息</span><span class="info-content">深圳市腾讯计算机系统有限公司</span>
				</div>
				<div class="info-row"><span class="info-label">收集信息范围：</span><span
						class="info-content">AndroidID、OAID、IDFV、传感器信息（传感器列表）、设备屏幕密度、运营商信息、WIFI参数、网络类型</span></div>
				<div class="info-row"><span class="info-label">收集方式：</span><span class="info-content">SDK本机采集</span></div>
				<div class="info-row"><span class="info-label">使用目的：</span><span class="info-content">为用户提供微信支付功能</span></div>
				<div class="info-row"><span class="info-label">使用场景：</span><span class="info-content">用户支付订单时</span></div>
				<a href="https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/RYiYJkLOrQwu0nb8" target="_blank"
					class="privacy-link">隐私政策链接：https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/RYiYJkLOrQwu0nb8</a>
			</div>
		</div>


	</view>
</template>

<script setup>

</script>

<style scoped>
	/* 主容器：PC端限制宽度，H5端自适应 */
	.container {
		max-width: 800rpx;
		/* PC端最大宽度 */
		margin: 0 auto;
		background-color: #ffffff;
		border-radius: 8rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		padding: 30rpx;
	}

	/* 顶部通用声明样式 */
	.intro-text {
		font-size: 28rpx;
		color: #555;
		margin-bottom: 30rpx;
		text-align: justify;
		/* 两端对齐 */
		background: #f0f2f5;
		padding: 15rpx;
		border-radius: 6rpx;
	}

	/* SDK 列表项样式 */
	.sdk-item {
		border-bottom: 1rpx solid #eee;
		padding: 20rpx 0;
	}

	.sdk-item:last-child {
		border-bottom: none;
	}

	/* SDK 标题 */
	.sdk-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 15rpx;
		display: flex;
		align-items: center;
	}

	.sdk-title::before {
		content: '';
		display: inline-block;
		width: 4rpx;
		height: 32rpx;
		background-color: #007bff;
		/* 蓝色装饰条 */
		margin-right: 8rpx;
		border-radius: 2rpx;
	}

	/* 信息行样式 */
	.info-row {
		margin-bottom: 8rpx;
		font-size: 28rpx;
		display: flex;
		flex-wrap: wrap;
		/* 允许换行 */
	}

	.info-label {
		font-weight: 600;
		color: #333;
		min-width: 80rpx;
		/* 标签最小宽度，保持对齐 */
		flex-shrink: 0;
	}

	.info-content {
		color: #666;
		flex: 1;
		word-break: break-all;
		/* 防止长单词溢出 */
	}

	/* 链接样式 */
	.privacy-link {
		display: inline-block;
		margin-top: 5rpx;
		color: #007bff;
		text-decoration: none;
		font-size: 26rpx;
		word-break: break-all;
	}

	.privacy-link:hover {
		text-decoration: underline;
	}

	/* 针对 H5 手机端的微调 */
	@media (max-width: 480rpx) {
		body {
			padding: 10rpx;
			background-color: #fff;
			/* 手机端通常全屏白底 */
		}

		.container {
			box-shadow: none;
			padding: 10rpx;
		}

		.info-row {
			flex-direction: column;
			/* 手机端标签和内容分行显示 */
			margin-bottom: 12rpx;
		}

		.info-label {
			margin-bottom: 2rpx;
			color: #888;
			font-size: 13rpx;
		}

		.info-content {
			color: #333;
			font-size: 14rpx;
		}
	}
</style>
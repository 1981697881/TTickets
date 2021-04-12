<template>
	<view class="group-content">
		<view class="cont-header">
			<view class="head-box text-black">
				<view class="text-bold text-xxl">电子普通电影抵用券</view>
				<view class="box-text padding-top">数量：10张</view>
				<view class="box-text">已兑换：3</view>
				<view class="box-text text-gray">剩余：7</view>
			</view>
			<view class="img-box"><image class="img" src="https://i.postimg.cc/nryKKkJp/wx-guojixinze.jpg" mode="scaleToFill"></image></view>
		</view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view>
		<view class="cont-price text-gray">
			<view class="text-black text-bold text-xl">实付金额：￥{{ detail.ticketPaymoney }}</view>
			<view>订单号：{{ detail.ticketId }}</view>
			<view>购买时间：2021-01-01 13:00:00</view>
			<view>手机号：131****1213</view>
			<view>电影票由公司提供</view>
		</view>

		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view>
		<view class="cont-action">
			<view class="act-btn"><button>申请改签</button></view>
			<view class="act-btn"><button>申请退票</button></view>
			<view class="act-text"><text>未取票开场前30分钟可以改签,改签费规则点击查看</text></view>
			<view class="act-text"><text>未取票开场前30分钟可以退票,退票费规则点击查看</text></view>
		</view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view>
		<view class="cont-notice text-gray">
			<view class="text-black text-bold text-xl">团体票使用方法</view>
			<view>1.生成兑换码，截图发送给好友。</view>
		</view>
	</view>
</template>

<script>
import tkiQrcode from '@/components/tki-qrcode/tki-qrcode.vue';
export default {
	components: { tkiQrcode },
	data() {
		return {
			cid: 'qrcode',
			ifShow: true,
			val: '二维码', // 要生成的二维码值
			size: 200, // 二维码大小
			unit: 'upx', // 单位
			icon: '', // 二维码图标
			iconsize: 40, // 二维码图标大小
			lv: 3, // 二维码容错级别 ， 一般不用设置，默认就行
			onval: false, // val值变化时自动重新生成二维码
			loadMake: true, // 组件加载完成后自动生成二维码
			src: '', // 二维码生成后的图片地址或base64
			img: 'http://139.159.136.187:50080/uploadFiles/image/340beba0ae805c0f9e8ad5928b0e2fdf.jpeg',
			scan: 'http://139.159.136.187:50080/uploadFiles/image/scan.png',
			tabCurrent: 'ended',
			scrollLeft: 0,
			tabList: [
				{
					id: 'ended',
					title: '取电影票'
				},
				{
					id: 'ing',
					title: '扫码入场'
				}
			]
		};
	},
	methods: {
		onTab(id) {
			this.tabCurrent = id;
		},
		qrR(res) {
			this.src = res;
		}
	},
	props: {
		detail: {
			type: Object,
			default: null
		}
	}
};
</script>

<style scoped lang="scss">
.group-content {
	width: 100%;
	.cont-header {
		padding: 20rpx;
		border-radius: 20rpx 20rpx 0 0;
		display: flex;
		background: linear-gradient(#fff, #fff);
		.head-box {
			position: relative;
			width: 600rpx;
			padding: 20rpx;
			.box-text {
				line-height: 45rpx;
			}
		}
		.img-box {
			margin-right: 20rpx;
			width: 200rpx;
			overflow: hidden;
			position: relative;
			.img {
				top: 30%;
				width: 200rpx;
				height: 180rpx;
				border-radius: 15rpx;
				background-color: #ccc;
			}
		}
	}
	.cir-info {
		width: 100%;
		display: flex;
		height: 48rpx;
		position: relative;
		.cir-line {
			position: absolute;
			height: 1px;
			background: linear-gradient(to right, #dcdcdc, #dcdcdc 5px, transparent 5px, transparent);
			background-size: 15rpx 100%;
			top: 45%;
			width: 90%;
			left: 5%;
		}
		.cir-left {
			width: 50%;
			background: radial-gradient(circle at 1% 24rpx, transparent 20rpx, #fff 0) top left 49% no-repeat;
		}
		.cir-right {
			width: 50%;
			background: radial-gradient(circle at 99% 24rpx, transparent 20rpx, #fff 0) top right 49% no-repeat;
		}
	}
	.cont-action {
		display: flex;
		flex-wrap: wrap;
		padding: 30rpx;
		justify-content: center;
		background: linear-gradient(#fff, #fff);
		.act-btn {
			width: 50%;
			padding: 25rpx;
			button {
				font-size: 30rpx;
				padding: 10rpx;
				border: 1px solid #cd3333;
				color: #cd3333;
				border-radius: 80rpx;
			}
			button:after {
				border: none;
			}
		}
		.act-text {
			width: 50%;
			padding: 15rpx;
			text {
				color: #8b7e66;
				-webkit-transform: scale(0.8);
				display: inline-block;
				text-decoration: underline;
			}
		}
	}
	.cont-price {
		padding: 35rpx;
		background: linear-gradient(#fff, #fff);
		view {
			padding: 10rpx;
		}
	}
	.cont-notice {
		padding: 35rpx;
		background: linear-gradient(#fff, #fff);
		view {
			padding: 5rpx;
		}
	}
}
</style>

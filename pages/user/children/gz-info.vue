<template>
	<view class="group-content">
		<view class="cont-header"></view>
		<view class="cont-wallet">
			<view class="tab-box x-f">
				<view class="tab-item" @tap="onTab(tab.id)" :class="{ 'tab-active': tabCurrent === tab.id }" v-for="tab in tabList" :key="tab.id">
					<text class="tab-title">{{ tab.title }}</text>
					<text v-show="tabCurrent === tab.id" class="tab-triangle"></text>
				</view>
			</view>
			<view class="wallet-box" v-if="tabCurrent == 'ended'">
				<view class="head-box text-black">
					<view class="text-bold text-xxl">电子普通电影抵用券</view>
					<view class="box-text padding-top">数量：10张</view>
					<view class="box-text">已兑换：3</view>
					<view class="box-text text-gray">剩余：7</view>
				</view>
				<view class="img-box">
					<image class="img" src="https://i.postimg.cc/nryKKkJp/wx-guojixinze.jpg" mode="scaleToFill"></image>
					<button class="margin-top cu-btn round sm lines-red"><text class="cuIcon-barcode" @tap="unYsc">已生成</text></button>
				</view>
				<view class="box-gift flex flex-wrap justify-end align-center">
					<uni-number-box class="cknumber" @change="changeNum" :step="1" :min="0" :currentSkuPrice.sync="currentSkuPrice" :value="ticketNum"></uni-number-box>
					<button class="cu-btn round sm bg-olive" @tap="generate">生成兑换码</button>
				</view>
				<view class="box-record">
					<view class="rec-title text-center padding-sm text-bold text-xl text-orange">兑换记录</view>
					<view class="cu-form-group bg-gray">
						<view style="width: 100%;" class="flex flex-wrap justify-between align-center">
							<view>用户</view>
							<view>兑换时间</view>
						</view>
					</view>
					<scroll-view class="scroll-box" scroll-y enable-back-to-top scroll-with-animation>
						<view class="cu-form-group">
							<view style="width: 100%;" class="flex flex-wrap justify-between align-center">
								<view>测试1</view>
								<view>2021-10-10 10:10:10</view>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>
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
import uniNumberBox from '@/components/uni-number-box/uni-number-box.vue';
export default {
	components: { tkiQrcode, uniNumberBox },
	data() {
		return {
			cid: 'qrcode',
			ifShow: true,
			showPrivacy: true,
			currentSkuPrice: {},
			ticketNum: 0,
			val: '二维码', // 要生成的二维码值
			size: 200, // 二维码大小
			unit: 'upx', // 单位
			icon: '', // 二维码图标
			iconsize: 40, // 二维码图标大小
			lv: 3, // 二维码容错级别 ， 一般不用设置，默认就行
			onval: false, // val值变化时自动重新生成二维码
			loadMake: true, // 组件加载完成后自动生成二维码
			src: '', // 二维码生成后的图片地址或base64
			tabCurrent: 'ended',
			scrollLeft: 0,
			tabList: [
				{
					id: 'ended',
					title: '普通劵'
				},
				{
					id: 'ing',
					title: '通用劵'
				}
			]
		};
	},
	methods: {
		generate(){
			let that = this
			if(that.ticketNum>0){
				// 预览图片
				uni.previewImage({
					urls: ['https://www.liantu.com/images/2013/case/1.jpg'],
					longPressActions: {
						itemList: ['发送给朋友', '保存图片'],
						success: function(data) {
							console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
						},
						fail: function(err) {
							console.log(err.errMsg);
						}
					}
				});
			}else{
				uni.showToast({
					icon: 'none',
					title: '数量不能为零'
				})
			}
		},
		unYsc() {
			// 预览图片
			uni.previewImage({
				urls: ['https://www.liantu.com/images/2013/case/1.jpg'],
				longPressActions: {
					itemList: ['发送给朋友', '保存图片'],
					success: function(data) {
						console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
					},
					fail: function(err) {
						console.log(err.errMsg);
					}
				}
			});
		},
		// 数量
		changeNum(e) {
			let that = this;
			that.ticketNum = +e;
		},
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
	.cont-wallet {
		.tab-box {
			.tab-item {
				flex: 1;
				line-height: 84rpx;
				text-align: center;
				background: linear-gradient(#fff, #fff);
				font-size: 28rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: #999999;
				position: relative;
				.tab-triangle {
					position: absolute;
					z-index: 2;
					bottom: 0;
					left: 42%;
					width: 45rpx;
					height: 10rpx;
					background: #2b4055;
				}
			}
			.tab-active {
				font-size: 40rpx;
				font-weight: 600;
				color: #333333;
			}
		}
		.wallet-box {
			background: linear-gradient(#fff, #fff);
			display: flex;
			flex-wrap: wrap;
			flex-direction: row;
			.box-gift,
			.box-record {
				width: 100%;
				padding: 20rpx;
				.scroll-box {
					height: 400rpx;
				}
			}
			.box-gift {
				border-bottom: 1px dotted #c0c0c0;
			}
			.head-box {
				position: relative;
				width: 500rpx;
				padding: 20rpx;
				.box-text {
					line-height: 45rpx;
				}
			}
			.img-box {
				margin-right: 20rpx;
				width: 150rpx;
				overflow: hidden;
				position: relative;
				.img {
					top: 10%;
					width: 150rpx;
					height: 150rpx;
					border-radius: 15rpx;
					background-color: #ccc;
				}
			}
			.box-tip {
				padding: 30rpx;
			}
			.box-scan {
				padding-top: 20rpx;
				.img {
					height: 300rpx;
					width: 50%;
					left: 25%;
				}
			}
			.box-info {
				padding: 20rpx;
				text-align: center;
			}
			.box-num {
				text-align: center;
				padding: 25rpx;
				margin-left: 8%;
				width: 86%;
				color: #696969;
				border-radius: 15rpx;
				border: 1px solid #ccc;
				text {
					font-size: 40rpx;
					color: #696969;
				}
				.is-use {
					color: #bebebe;
					text-decoration: line-through;
				}
			}
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

<template>
	<view class="group-content">
		<view class="cont-header">
			<view class="head-box text-black">
				<view class="text-bold text-xxl">{{ detail.shortName || ''}}</view>
				<view class="box-text padding-top">{{ detail.showDateTime || ''}} </view>
				<view class="box-text">{{ detail.cinemaName || ''}} {{ detail.hallName || ''}}</view>
				<view class="box-text text-gray">
					<text v-for="(item, index) in detail.tickets" :key="index">{{ item.rowId || ''}}排{{ item.columnId || ''}}座</text>
				</view>
			</view>
			<view class="img-box"><image class="img" :src="detail.filmPhoto" mode="aspectFill"></image></view>
		</view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view>
		<view class="cont-wallet">
			<view class="tab-box x-f">
				<view class="tab-item" @tap="onTab(tab.id)" :class="{ 'tab-active': tabCurrent === tab.id }" v-for="tab in tabList" :key="tab.id">
					<text class="tab-title">{{ tab.title }}</text>
					<text v-show="tabCurrent === tab.id" class="tab-triangle"></text>
				</view>
			</view>
			<view class="wallet-box">
				<view v-if="tabCurrent == 'ing'" class="box-tip text-gray"><text>如该影院是“扫码入场”试点影院，出示下方二维码入场</text></view>
				<view class="box-scan">
					<tki-qrcode
						ref="qrcode"
						:cid="cid"
						class="img"
						:val="scanId"
						:size="size"
						:unit="unit"
						:icon="icon"
						:iconSize="iconsize"
						:lv="lv"
						:onval="onval"
						:loadMake="loadMake"
						@result="qrR"
					/>
				</view>
				<view class="box-info">{{ detail.tickets.length }}张电影票</view>
				<view v-if="tabCurrent == 'ended'" class="box-num">
					取票号：
					<text class="is-use">{{ detail.confirmationId }}</text>
				</view>
			</view>
		</view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view>
		<!-- <view class="cont-action">
			<view class="act-btn"><button>申请改签</button></view>
			<view class="act-btn"><button>申请退票</button></view>
			<view class="act-text"><text>未取票开场前30分钟可以改签,改签费规则点击查看</text></view>
			<view class="act-text"><text>未取票开场前30分钟可以退票,退票费规则点击查看</text></view>
		</view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view> -->
		<!-- <view class="cont-shops">
			<view class="shops-info padding-xs">
				<view class="padding-xs text-bold text-xxl text-black">{{ detail.cinemaName }}</view>
				<view class="padding-xs text-gray">白云区太和镇龙归龙岗1号广场</view>
			</view>
			<view class="shops-img padding-xl"><image class="simg-box" src="../../../static/telephone.png" mode="aspectFill"></image></view>
		</view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view> -->
		<view class="cont-price text-gray">
			<view class="text-black text-bold text-xl">实付金额：￥{{ detail.ticketPayMoney }}</view>
			<view>订单号：{{ detail.confirmationId }}</view>
			<view>购买时间：{{detail.createDateTime}}</view>
			<view>手机号：{{detail.mobile}}</view>
			<view>电影票由{{detail.channelName}}影城提供</view>
		</view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view>
		<view class="cont-notice text-gray">
			<view class="text-black text-bold text-xl">观影须知</view>
			<view>1.请提前到达影院，找到自助取票机，打印纸质电影票，完成取票。</view>
			<view>2.如现场自助取票机无法打印电影票，请联系影院工作人员处理。</view>
			<view>3.凭打印好的纸质电影票，检查入场观影。</view>
			<view>4.如果订单使用了兑换劵，或购买了特殊场次，暂不支持退票和改签。</view>
			<view>5.如有开具所购买电影票发票的需求，请保留好电影票根，尽量在观影当天联系影城工作人员进行开具，如遇特殊情况请及时联系人工客服咨询。</view>
			<view>6.改签、退票服务由影城决定，特殊场次及使用兑换券场次不支持改签、退票。</view>
		</view>
	</view>
</template>

<script>
import tkiQrcode from '@/components/tki-qrcode/tki-qrcode.vue';
export default {
	components: { tkiQrcode },
	data() {
		return {
			cid:'qrcode',
			ifShow: true,
			val: '', // 要生成的二维码值
			size: 200, // 二维码大小
			unit: 'upx', // 单位
			icon: '', // 二维码图标
			iconsize: 40, // 二维码图标大小
			lv: 3, // 二维码容错级别 ， 一般不用设置，默认就行
			onval: true, // val值变化时自动重新生成二维码
			loadMake: true, // 组件加载完成后自动生成二维码
			src: '', // 二维码生成后的图片地址或base64
			scrollLeft: 0,
			tabCurrent: 'ended',
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
			this.src = res
		},
		clearCode(){
			let that = this
			this.scanId = ''
			that.$nextTick(function(){
				that.$refs.qrcode._clearCode()
			})
		}
	},
	props: {
		detail: {
			type: Object,
			default: null
		},
		scanId: {
			type: String,
			default: ''
		}
	},
	mounted(){
		console.log(123)
		console.log(this.scanId)
	},
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
				height: 200rpx;
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
	.cont-shops {
		display: flex;
		padding: 30rpx;
		justify-content: center;
		background: linear-gradient(#fff, #fff);
		.shops-info {
			width: 500rpx;
		}
		.shops-img {
			.simg-box {
				width: 100rpx;
				height: 100rpx;
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

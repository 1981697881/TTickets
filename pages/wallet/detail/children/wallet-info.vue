<template>
	<view class="group-content">
		<view class="cont-header">
			<view class="head-box">
				<view>我不是药神</view>
				<view>2021-01-20 20:30 ~ 22.22(国语 2D)</view>
				<view>广州WeChat影城广州店 3号厅</view>
				<view>8排06座 8排07座</view>
			</view>
			<view class="img-box"><image class="img" :src="img" mode="aspectFill"></image></view>
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
				<view class="box-tip text-gray">
					<text>如该影院是“扫码入场”试点影院，出示下方二维码入场</text>
				</view>
				<view class="box-scan"><image class="img" :src="scan" mode="aspectFit"></image></view>
				<view class="box-info">8排06座</view>
				<view class="box-num">
					取票号：
					<text></text>
				</view>
			</view>
		</view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view>
		<view class="cont-shops"></view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view>
		<view class="cont-price"></view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view>
		<view class="cont-notice"></view>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {
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
		background: linear-gradient(#fff, #f5f5f5);
		.head-box {
			position: relative;
			width: 600rpx;
		}
		.img-box {
			margin-right: 20rpx;
			width: 200rpx;
			height: 200rpx;
			overflow: hidden;
			position: relative;
			.img {
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
			background: radial-gradient(circle at 1% 24rpx, transparent 20rpx, (#fff, #f5f5f5) 0) top left 49% no-repeat;
		}
		.cir-right {
			width: 50%;
			background: radial-gradient(circle at 99% 24rpx, transparent 20rpx, (#fff, #f5f5f5) 0) top right 49% no-repeat;
		}
	}
	.cont-wallet {
		.tab-box {
			.tab-item {
				flex: 1;
				line-height: 84rpx;
				text-align: center;
				background: linear-gradient(#f5f5f5, #fff);
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
			background: linear-gradient(#fff, #f5f5f5);
			.box-tip{
				padding: 30rpx;
			}
			.box-scan {
				.img{
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
				margin-left: 10%;
				width: 80%;
				border: 1px solid #ccc;
			}
		}
	}
	.cont-shops {
	}
	.cont-price {
	}
	.cont-notice {
	}
}
</style>

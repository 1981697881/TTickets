<template>
	<view class="activity-goods-box x-bc" @tap="jump('/pages/wallet/detail/index', { id: cardId })">
		<view class="img-box">
			<slot name="tag"></slot>
			<image class="img" :src="img" mode="scaleToFill"></image>
		</view>
		<view class="goods-right y-bc">
			<view class="title one-t">{{ title }}</view>
			<view class="tip one-t">{{ subtitle }}</view>
			<view class="slod-end"><slot name="sell"></slot></view>
			<view class=" price-box">
				<view class="x-f">
					<view class="current">￥{{ price }}</view>
					<!-- <view class="original">￥{{ originalPrice }}</view> -->
				</view>
			</view>
		</view>
		<view class="cir-info">
			<view class="cir-left"></view>
			<view class="cir-right"></view>
			<view class="cir-line"></view>
		</view>
		<view class="fot-content"><slot name="btn"></slot></view>
	</view>
</template>

<script>
export default {
	name: 'walletCard',
	components: {},
	data() {
		return {};
	},
	props: {
		cardId: 0,
		img: '',
		title: '',
		subtitle: '',
		price: '',
		originalPrice: ''
	},
	computed: {},
	created() {},
	methods: {
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({ path: path, query: parmas });
		}
	}
};
</script>

<style lang="scss">
.activity-goods-box {
	margin: 30rpx;
	box-shadow: 1px 2px 2px 2px #f6f6f6;
	border-radius: 10rpx;
	background: #fff;
	flex-wrap: wrap;
	.cir-info {
		width: 100%;
		margin-top: 15rpx;
		display: flex;
		height: 48rpx;
		background: #f6f6f6;
		position: relative;
		.cir-line {
			position: absolute;
			height: 1px;
			box-shadow: 1px 1px 1px 1px #fff;
			background: linear-gradient(to right, #DCDCDC, #DCDCDC 5px, transparent 5px, transparent);
			background-size: 15rpx 100%;
			top: 45%;
			width: 93%;
			left: 3.5%;
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
	.fot-content {
		padding: 20rpx;
		width: 100%;
		display: inline-block;
	}
	.img-box {
		padding: 20rpx;
		padding-bottom: 0;
		width: 200rpx;
		overflow: hidden;
		position: relative;
		.img {
			width: 200rpx;
			border-radius: 15rpx;
			height: 210rpx;
			background-color: #ccc;
		}
	}
	.goods-right {
		padding: 20rpx;
		width: 450rpx;
		min-height: 200rpx;
		position: relative;
		align-items: flex-start;
		position: relative;
		.title {
			font-size: 28rpx;
			line-height: 28rpx;
			width: 500rpx;
		}

		.tip {
			font-size: 22rpx;
			color: #a8700d;
			width: 500rpx;
		}

		.price-box {
			.current {
				font-size: 28rpx;
				font-weight: 500;
				color: rgba(225, 33, 43, 1);
			}

			.original {
				font-size: 22rpx;
				font-weight: 400;
				text-decoration: line-through;
				color: rgba(153, 153, 153, 1);
				margin-left: 14rpx;
			}
		}
	}
}
</style>

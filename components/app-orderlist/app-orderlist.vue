<template>
	<view class="">
		<view class="goods-box" @tap="jump('/pages/user/groupticketinfo', {memberCdkeyId:detail.memberCdkeyId})">
			<view class="box-title">
				<view class="titel-name text-xl text-pink">订单号：{{detail.memberCdkeyId}}</view>
				<view><text class="cuIcon-pay text-gray padding-xs">已付款</text></view>
			</view>
			<view class="box-content">
				<view>{{detail.cdkeyName}} x {{detail.cdkeyCount}}</view>
			</view>
			<view class="box-foot">
				<view class="x-f"><view class="detail text-orange"> 共 {{detail.cdkeyCount}} 张 实付款 ￥{{detail.paymoney}}</view></view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: '',
	components: {},
	data() {
		return {};
	},
	props: {
		detail: {
			type: Object,
			default: null
		}
	},
	mounted() {},
	onHide() {},
	computed: {},
	created() {},
	methods: {
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		}
	}
};
</script>

<style lang="scss">
.detail {
	width: 100%;
	text-align: right;
}
.goods-box {
	position: relative;
	background: white;
	padding: 20rpx;
	border-radius: 15rpx;
	box-shadow: 1px 1px 1px #c0c0c0;
}
// order
.goods-box {
	.box-title {
		display: flex;
		.titel-name {
			width: 550rpx;
		}
	}
	.box-foot {
		margin-top: 30rpx;
		padding-top: 10rpx;
		border-top: 1px dashed #ccc;
	}
	.order-right {
		height: 180rpx;
	}
	.order-tip {
		font-size: 24rpx;
		font-family: PingFang SC;
		font-weight: 400;
		color: rgba(153, 153, 153, 1);
		width: 450rpx;
		margin-bottom: 20rpx;
		.order-num {
			margin-right: 10rpx;
		}
	}

	.order-goods {
		width: 480rpx;

		.status-btn {
			background: none;
			height: 32rpx;
			border: 1rpx solid rgba(207, 169, 114, 1);
			border-radius: 15rpx;
			font-size: 20rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(168, 112, 13, 1);
			padding: 0 10rpx;
			margin-left: 20rpx;
			background: rgba(233, 183, 102, 0.16);
		}
		.order-price {
			font-size: 26rpx;
			font-family: PingFang SC;
			font-weight: 600;
			color: rgba(51, 51, 51, 1);
		}
	}
}
</style>

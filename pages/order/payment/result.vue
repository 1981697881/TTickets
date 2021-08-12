<template>
	<view class="success-page">
		<view class="success-box flex flex-direction align-center">
			<image class="pay-img" :src="pay ? 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/pay_success.png' : 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/pay_fail.png'" mode=""></image>
			<text class="notice">{{ pay ? '支付成功' : '支付失败' }}</text>
			<text class="pay-money" v-if="pay &&ticketPaymoney">￥{{ ticketPaymoney }}</text>
			<view class="btn-box flex justify-between">
				<button class="cu-btn base-btn" @tap="routerTo.push('/pages/index/index')">返回首页</button>
				<button class="cu-btn base-btn" v-if="pay" @tap="onOrder">查看订单</button>
				<button class="again-pay cu-btn" v-if="!pay" @tap="onPay">重新支付</button>
			</view>
		</view>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
import AppPay from '@/common/app-pay';
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	components: {},
	data() {
		return {
			routerTo: this.$Router,
			orderDetail: {},
			pay: null
		};
	},
	computed: {},
	onLoad() {
		if(this.$Route.query){
			if(this.$Route.query.reType ==1){
				this.orderDetail = {...this.$Route.query}
				this.orderDetail.schedule = JSON.parse(this.orderDetail.schedule); 
				this.orderDetail.locationHall = JSON.parse(this.orderDetail.locationHall); 
				this.orderDetail.seats = JSON.parse(this.orderDetail.seats); 
			}else{
				this.orderDetail = {...this.$Route.query};
			}
		}
		this.pay = this.$Route.query.pay;
		this.ticketId = this.$Route.query.ticketId;
		this.ticketPaymoney = this.$Route.query.ticketPaymoney;
		/* this.getOrderDetail(); */
	},
	methods: {
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		replace(path, parmas) {
			this.$Router.replace({
				path: path,
				query: parmas
			});
		},
		// 查看订单
		onOrder() {
			this.$Router.replace({
				path: '/pages/index/wallet',
				query: { type: this.$Route.query.reType != 4?'ing':'nostart' }
			});
		},
		// 支付信息
		getOrderDetail() {
			let that = this;
			that.$api('order.detail', {
				order_sn: that.$Route.query.orderSn
			}).then(res => {
				if (res.code === 1) {
					that.orderDetail = res.data;
				}
			});
		},
		// 重新支付
		onPay() {
			let that = this;
			let pay = new AppPay(that.$Route.query.type, that.orderDetail, that.$Route.query.url, that.$Route.query.params,this.$Route.query.reType);
		}
	}
};
</script>

<style lang="scss">
.success-box {
	background: #fff;
	width: 750rpx;
	padding: 40rpx 0;
	.pay-img {
		width: 128rpx;
		height: 76rpx;
	}
	.notice {
		font-size: 30rpx;
		font-family: PingFang SC;
		font-weight: bold;
		color: rgba(51, 51, 51, 1);
		line-height: 30rpx;
		margin-top: 30rpx;
	}
	.pay-money {
		font-size: 36rpx;
		color: #e1212b;
		font-weight: 600;
		margin-top: 20rpx;
	}
	.btn-box {
		margin-top: 30rpx;
		width: 660rpx;
		.base-btn {
			width: 320rpx;
			height: 70rpx;
			background: rgba(255, 255, 255, 1);
			border: 1rpx solid rgba(223, 223, 223, 0.5);
			border-radius: 35rpx;
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(153, 153, 153, 1);
			padding: 0;
		}
		.again-pay {
			width: 320rpx;
			height: 70rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
			border-radius: 35rpx;
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(255, 255, 255, 0.8);
			padding: 0;
		}
	}
}
.hot-box {
	background: #fff;
	padding: 20rpx;
	margin-top: 20rpx;
	.hot-title {
		font-size: 30rpx;
		font-family: PingFang SC;
		font-weight: 500;
		color: rgba(51, 51, 51, 1);
		height: 80rpx;
	}
}
</style>

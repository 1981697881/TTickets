<template>
	<view class="page_box">
		<view class="head_box margin-top">
			<view class="cu-form-group text-xl text-bold text-brown">我的账户：123123</view>
			<view class="cu-form-group text-grey">我的账号余额：0元</view>
			<view class="cu-form-group text-bold">充值金额：</view>
		</view>
		<view class="content_box">
			<view class="y-f money-box" >
				<view class="money">100</view>
				<view class="money">200</view>
				<view class="money">300</view>
				<view class="money">400</view>
			</view>
			<radio-group @change="selPay" class="pay-box" v-if="payment">
				<label class="x-bc pay-item" v-if="payment.includes('wechat')">
					<view class="x-f">
						<image class="pay-img" src="http://shopro.7wpp.com/imgs/wx_pay.png" mode=""></image>
						<text>微信支付</text>
					</view>
					<radio value="wechat" :class="{ checked: payType === 'wechat' }" class=" pay-radio orange" :checked="payType === 'wechat'"></radio>
				</label>
			</radio-group>
			<view class="x-c">
				<button class="cu-btn pay-btn" @tap="confirmPay">确认支付 ￥{{ orderDetail.total_fee }}</button>
			</view>
		</view>
		<view class="foot_box"></view>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
import AppPay from '@/common/app-pay';
import { mapMutations, mapActions, mapState } from 'vuex';

let timer;
export default {
	components: {},
	data() {
		return {
			payType: 'wechat',
			options: {},
			orderDetail: {},
			isAndroid: uni.getStorageSync('isAndroid'),
			platform: uni.getStorageSync('platform')
		};
	},
	computed: {
		...mapState({
			payment: state => state.init.initData.payment
		})
	},
	onLoad(options) {
		this.options = options;
		if(this.$Route.query){
			this.orderDetail = this.$Route.query
		}
		if (options.openid) {
			//检测到回传openid
			uni.setStorageSync('openid', options.openid);
		}
		// #ifdef H5
		if (uni.getStorageSync('platform') === 'wxOfficialAccount' && uni.getSystemInfoSync().platform === 'ios' && !uni.getStorageSync('payReload')) {
			//检测到IOS支付路径问题
			uni.setStorageSync('payReload', true);
			window.location.reload();
			throw 'stop';
		}
		uni.removeStorageSync('payReload');
		// #endif
		/* this.init(); */
	},
	onShow() {},
	onHide() {
		clearInterval(timer);
	},
	methods: {
		init() {
			return Promise.all([this.getOrderDetail()]);
		},
		selPay(e) {
			this.payType = e.detail.value;
		},
		// 发起支付
		confirmPay() {
			let that = this;
			uni.showToast({
				icon: 'none',
				title: '此功能尚未完善....'
			})
			/* let pay = new AppPay(that.payType, that.orderDetail); */
		},
		// 支付信息
		getOrderDetail() {
			let that = this;
			that.$api('order.detail', {
				id: that.options.orderId
			}).then(res => {
				if (res.code === 1) {
					that.orderDetail = res.data;
					if (res.data.ext_arr !== null) {
						that.countDown();
					} else {
						that.isPast = false;
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.head_box{
	background: #fff;
}
.money-box {
	background: #fff;
	height: 340rpx;
	display: flex;
	 flex-direction: row;
	 flex-wrap:wrap;
	 align-items: flex-start;
	 align-content: flex-start;
	margin-bottom: 20rpx;
	.money { 
		text-align: center;
		width: 220rpx;
		margin: 15rpx;
		height: 120rpx;
		box-shadow: 1px 1px 1px 1px #A5A5A5;
		border-radius: 15rpx;
		line-height: 120rpx;
		color: #e1212b;
		background: #CCCCCC;
		font-size: 60rpx;
		&::before {
			content: '￥';
			font-size: 46rpx;
		}
	}
	.money:after{ 
	background-color:yellow;
	}
}

.pay-box {
	.pay-item {
		height: 90rpx;
		padding: 0 30rpx;
		font-size: 26rpx;
		background: #fff;
		width: 750rpx;
		border-bottom: 1rpx solid #eeeeee;

		&:last-child {
			border-bottom: none;
		}

		.pay-radio {
			transform: scale(0.8);
		}

		.pay-img {
			width: 40rpx;
			height: 40rpx;
			// background: #ccc;
			margin-right: 25rpx;
		}
	}
}

.pay-btn {
	width: 690rpx;
	height: 80rpx;
	background: linear-gradient(90deg, rgba(240, 199, 133, 1), rgba(246, 214, 157, 1));
	border-radius: 40rpx;
	color: rgba(#fff, 0.9);
	margin-top: 100rpx;
}
</style>

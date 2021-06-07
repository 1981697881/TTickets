<template>
	<view class="page_box">
		<view class="head_box"></view>
		<view class="content_box">
			<view class="y-f money-box">
				<text class="time" v-if="isPast">{{ timeText }}</text>
				<view class="money">{{ total_fee }}</view>
				<view class="text-center text-orange">{{ orderText }}</view>
			</view>
			<radio-group @change="selPay" class="pay-box" v-if="payment">
				<label class="x-bc pay-item" v-if="payment.includes('wechat')">
					<view class="x-f">
						<image class="pay-img" src="http://shopro.7wpp.com/imgs/wx_pay.png" mode=""></image>
						<text>微信支付</text>
					</view>
					<radio value="wechat" :class="{ checked: payType === 'wechat' }" class=" pay-radio orange" :checked="payType === 'wechat'"></radio>
				</label>
				<label class="x-bc pay-item" v-if="payment.includes('wallet')">
					<view class="x-f">
						<image class="pay-img" src="http://shopro.7wpp.com/imgs/wallet_pay.png" mode=""></image>
						<text>余额支付</text>
					</view>
					<radio value="wallet" :class="{ checked: payType === 'wallet' }" class="pay-radio orange" :checked="payType === 'wallet'"></radio>
				</label>
			</radio-group>
			<view class="x-c">
				<button :disabled="isSubOrder" class="cu-btn pay-btn" @tap="confirmPay">确认支付 ￥{{ total_fee }}</button>
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
			timeText: '',
			orderText: '',
			params: {},
			isSubOrder: false,
			total_fee: '',
			isPast: true, //是否显示订单倒计时。
			isAndroid: uni.getStorageSync('isAndroid'),
			platform: uni.getStorageSync('platform')
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo,
			payment: state => state.init.initData.payment,
			balInfo: state => state.user.balInfo
		})
	},
	onLoad(options) {
		clearInterval(timer);
		timer = null;
		this.options = options;
		if (this.$Route.query) {
			this.total_fee = this.$Route.query.goodsPrice;
			this.orderText = this.$Route.query.goodsName + '(' + this.$Route.query.goodsDescribe + ')';
			this.params = this.$Route.query;
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
	onShow() {
		clearInterval(timer);
		timer = null;
		this.countDown();
	},
	onHide() {
		this.isSubOrder = true;
		timer = null;
		clearInterval(timer);
	},
	methods: {
		payMeal(val) {
			let that = this;
			if (that.balInfo.CustID) {
				uni.showLoading({ title: '加载中' });
				let parArray = [];
				//测试订单
				let params = {
					coinPaymoney: that.$Route.query.goodsPrice,
					goodsId: that.$Route.query.goodsId
				};
				/* uni.showToast({
					icon: 'none',
					title: '此功能尚未开放....敬请期待'
				}); */
				that.isSubOrder = true;
				let pay = new AppPay(that.payType, val, 'goods.payCoinMoney', params, 2);
				uni.hideLoading();
			} else {
				uni.showToast({
					icon: 'none',
					title: '新用戶暂还没开放充值，敬请期待'
				});
			}
		},
		//积分充值
		integral() {
			let that = this;
			that.$api('goods.veIntegral', { qty: that.$Route.query.integral, custId: that.balInfo.CustID, phoneNumber: that.userInfo.phoneNumber }).then(res => {
				if (res.flag) {
					uni.showToast({
						icon: 'success',
						title: '充值成功'
					});
					setInterval(() => {
						uni.switchTab({
							url: '/pages/index/videoGame'
						});
					}, 1500);
				}
			});
		},
		//游戏币充值
		currency() {
			let that = this;
			that.$api('goods.veCoin', { qty: that.$Route.query.coinCount, custId: that.balInfo.CustID, phoneNumber: that.userInfo.phoneNumber }).then(res => {
				if (res.flag) {
					that.integral();
				}
			});
		},
		selPay(e) {
			this.payType = e.detail.value;
		},
		num(n) {
			return n < 10 ? '0' + n : '' + n;
		},
		// 倒计时
		countDown() {
			let that = this;
			let maxtime = 10 * 30;
			timer = setInterval(() => {
				if (maxtime >= 0) {
					let minutes = Math.floor(maxtime / 60);
					let seconds = Math.floor(maxtime % 60);
					that.timeText = `${that.num(minutes)}:${that.num(seconds)}`;
					--maxtime;
				} else {
					clearInterval(timer);
					timer = null;
					that.timeText = '订单已过期!';
					that.isPast = false;
					that.isSubOrder = true;
				}
			}, 1000);
		},
		//余额购买
		blanBuy(val) {
			let that = this;
			let params = {
				qty: val.coinPaymoney + '',
				custId: that.balInfo.CustID,
				coinNo: val.coinNo,
				phoneNumber: that.userInfo.phoneNumber
			};
			this.$api('user.deduction', params).then(res => {
				if (res.flag) {
					that.currency();
				} else {
					uni.showToast({
						icon: 'none',
						title: res.msg
					});
				}
			});
		},
		// 发起支付
		confirmPay() {
			let that = this;
			uni.showLoading({ title: '购买中~~！' });
			if (that.userInfo.phoneNumber) {
				if (that.payType == 'wallet') {
					//生成订单
					this.$api('goods.addCoinOrder', { coinPaymoney: that.$Route.query.goodsPrice, goodsId: that.$Route.query.goodsId, openId: uni.getStorageSync('openid') }).then(
						res => {
							if (res.flag) {
								that.isSubOrder = true;
								that.blanBuy(res.data);
							} else {
								uni.showToast({
									icon: 'none',
									title: res.msg
								});
							}
						}
					);
				} else {
					that.payMeal(that.params);
				}
			} else {
				uni.showToast({
					icon: 'none',
					title: '手机号码为必填项'
				});
			}
		}
	}
};
</script>

<style lang="scss">
.money-box {
	background: #fff;
	height: 250rpx;
	margin-bottom: 20rpx;
	padding-top: 30rpx;

	.time {
		font-size: 28rpx;
		color: #c4c4c4;
	}

	.money {
		color: #e1212b;
		font-size: 60rpx;
		margin-top: 60rpx;

		&::before {
			content: '￥';
			font-size: 46rpx;
		}
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

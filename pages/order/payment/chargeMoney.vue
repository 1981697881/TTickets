<template>
	<view class="page_box payment-page">
		<scroll-view class="content_box payment-scroll" scroll-y>
			<view class="payment-content">
				<view class="order-summary">
					<view class="coin-media">
						<image src="/static/imgs/user/menu/arcade-coins.jpg" mode="aspectFit"></image>
					</view>
					<view class="order-copy">
						<text class="order-name">{{ params.goodsName || '游戏币' }}</text>
						<text v-if="params.goodsDescribe" class="order-description">{{ params.goodsDescribe }}</text>
						<view class="order-price"><text>¥</text>{{ total_fee }}</view>
					</view>
				</view>

				<view class="countdown-row">
					<text>支付倒计时</text>
					<text class="countdown" :class="{ expired: !isPast }">{{ isPast ? timeText : '已过期' }}</text>
				</view>

				<text class="payment-title">选择支付方式</text>
				<radio-group v-if="payment" class="pay-box" @change="selPay">
					<label v-if="payment.includes('wechat')" class="pay-item">
						<view class="pay-info">
							<view class="pay-icon wechat-icon">
								<image src="/static/imgs/pay/wei.png" mode="aspectFit"></image>
							</view>
							<text class="pay-name">微信支付</text>
						</view>
						<radio value="wechat" color="#A9B238" class="pay-radio" :checked="payType === 'wechat'"></radio>
					</label>
					<label v-if="payment.includes('wallet')" class="pay-item">
						<view class="pay-info">
							<view class="pay-icon wallet-icon">
								<image src="/static/imgs/user/wallet.png" mode="aspectFit"></image>
							</view>
							<view class="wallet-copy">
								<text class="pay-name">余额支付</text>
								<text class="balance">（¥{{ balInfo.Money || '0.00' }}）</text>
							</view>
						</view>
						<radio value="wallet" color="#A9B238" class="pay-radio" :checked="payType === 'wallet'"></radio>
					</label>
				</radio-group>
			</view>
		</scroll-view>
		<view class="payment-footer">
			<button :disabled="isSubOrder || !isPast" class="confirm-button" @tap="confirmPay">确认支付 ¥{{ total_fee }}</button>
		</view>
		<view class="foot_box"></view>
		<app-login-modal></app-login-modal>
	</view>
</template>
<script>
import AppPay from '@/common/app-pay';
import { mapMutations, mapActions, mapState } from 'vuex';
import { isIOSPlatform } from '@/common/runtime/system-info';
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
			storeInfo: state => state.user.storeInfo,
			balInfo: state => state.user.balInfo || {}
		})
	},
	onLoad(options) {
		timer = null;
		this.options = options;
		if (this.$Route.query) {
			const price = Number(this.$Route.query.goodsPrice);
			this.total_fee = Number.isFinite(price) && price > 0 ? String(price) : '';
			this.orderText = this.$Route.query.goodsName + '(' + this.$Route.query.goodsDescribe + ')';
			this.params = this.$Route.query;
			if (!this.total_fee || !this.$Route.query.goodsId) {
				uni.showToast({ icon: 'none', title: '商品参数异常' });
				this.isPast = false;
			}
		}
		// #ifdef H5
		if (uni.getStorageSync('platform') === 'wxOfficialAccount' && isIOSPlatform() && !uni.getStorageSync('payReload')) {
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
		this.isSubOrder = false;
		this.countDown();
	},
	onHide() {
		timer = null;
		clearInterval(timer);
	},
	methods: {
		payMeal(val) {
			let that = this;
			if (that.balInfo.custId) {
				uni.showLoading({ title: '加载中' });
				const price = Number(that.total_fee || that.$Route.query.goodsPrice);
				if (!Number.isFinite(price) || price <= 0 || !that.$Route.query.goodsId) {
					that.isSubOrder = false;
					uni.hideLoading();
					uni.showToast({ icon: 'none', title: '商品参数异常' });
					return;
				}
				let params = {
					coinPaymoney: price,
					storeId: that.storeInfo.id,
					goodsId: that.$Route.query.goodsId
				};
				that.isSubOrder = true;
				try {
					new AppPay(that.payType, val, 'goods.payCoinMoney', params, 2);
				} catch (e) {
					that.isSubOrder = false;
					uni.showToast({ icon: 'none', title: '支付发起失败，请重试' });
				}
				uni.hideLoading();
			} else {
				that.isSubOrder = false;
				uni.hideLoading();
				uni.showToast({
					icon: 'none',
					title: '新用戶暂还没开放充值，敬请期待'
				});
			}
		},
		//积分充值
		integral() {
			let that = this;
			that.$api('goods.veIntegral', { 
				qty: that.$Route.query.integral,
				 custId: that.balInfo.custId,
				 placeId: that.storeInfo.v8PlaceId,
				V8Url: that.storeInfo.v8Url,
				storeId: that.storeInfo.id,
				  phoneNumber: that.userInfo.phoneNumber }).then(res => {
				if (res.flag) {
					uni.showToast({
						title: '购买成功',
						icon: 'success',
						duration: 2000,
						mask: true,
						success: function() {
							setTimeout(function(){
								uni.switchTab({
									url: '/pages/index/videoGame',
								})
							}, 2000);
						}
					});
				}
			});
		},
		//游戏币充值
		currency() {
			let that = this;
			that.$api('goods.veCoin', { qty: that.$Route.query.coinCount,storeId: that.storeInfo.id, placeId: that.storeInfo.v8PlaceId,V8Url: that.storeInfo.v8Url, custId: that.balInfo.custId, phoneNumber: that.userInfo.phoneNumber }).then(res => {
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
			const updateCountdown = () => {
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
			};
			updateCountdown();
			timer = setInterval(updateCountdown, 1000);
		},
		//余额购买
		blanBuy(val) {
			let that = this;
			let params = {
				qty: val.coinPaymoney + '',
				custId: that.balInfo.custId,
				coinNo: val.coinNo,
				placeId: that.storeInfo.v8PlaceId,
				V8Url: that.storeInfo.v8Url, 
				storeId: that.storeInfo.id,
				note: '[使用'+val.coinPaymoney+'预存款购买'+val.coinNo+'枚游戏币]',
				phoneNumber: that.userInfo.phoneNumber
			};
			this.$api('user.deduction', params).then(res => {
				if (res.flag) {
					that.currency();
				} else {
					that.isSubOrder = false;
					uni.showToast({
						icon: 'none',
						title: res.msg
					});
				}
			}).catch(() => {
				that.isSubOrder = false;
				uni.showToast({ icon: 'none', title: '扣款失败，请重试' });
			});
		},
		// 发起支付
		confirmPay() {
			let that = this;
			if (that.isSubOrder || !that.isPast) return;
			const price = Number(that.total_fee || that.$Route.query.goodsPrice);
			if (!Number.isFinite(price) || price <= 0) {
				uni.showToast({ icon: 'none', title: '支付金额异常' });
				return;
			}
			if (!that.$Route.query.goodsId) {
				uni.showToast({ icon: 'none', title: '商品信息缺失' });
				return;
			}
			uni.showLoading({ title: '购买中~~！' });
			if (that.userInfo.phoneNumber) {
				if (that.payType == 'wallet') {
					if (price <= Number(that.balInfo.Money)) {
						that.isSubOrder = true;
						//生成订单
						this.$api('goods.addCoinOrder', { storeId: that.storeInfo.id,coinPaymoney: price, goodsId: that.$Route.query.goodsId, openId: uni.getStorageSync('openid') }).then(
							res => {
								if (res.flag) {
									that.blanBuy(res.data);
								} else {
									that.isSubOrder = false;
									uni.hideLoading();
									uni.showToast({
										icon: 'none',
										title: res.msg
									});
								}
							}
						).catch(() => {
							that.isSubOrder = false;
							uni.hideLoading();
							uni.showToast({ icon: 'none', title: '下单失败，请重试' });
						});
					} else {
						uni.hideLoading();
						uni.showToast({
							icon: 'none',
							title: '余额不足以支付本次费用，请选择其他支付方式'
						});
					}
				} else {
					that.isSubOrder = true;
					that.payMeal(that.params);
				}
			} else {
				uni.hideLoading();
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
.payment-page,
.payment-scroll,
.payment-content {
	background: #fff;
}

.payment-scroll {
	flex: 1;
	height: 100%;
}

.payment-content {
	padding: 28rpx 28rpx 44rpx;
}

.order-summary {
	display: flex;
	align-items: stretch;
	min-height: 220rpx;
	overflow: hidden;
	background: #fff;
	border: 1rpx solid var(--tt-border);
	border-radius: 26rpx;
}

.coin-media {
	width: 220rpx;
	flex: 0 0 220rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f7f1;

	image {
		width: 156rpx;
		height: 156rpx;
	}
}

.order-copy {
	min-width: 0;
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	padding: 24rpx 26rpx;
}

.order-name {
	font-size: 32rpx;
	font-weight: 720;
	line-height: 44rpx;
	color: var(--tt-text);
}

.order-description {
	margin-top: 10rpx;
	font-size: 23rpx;
	line-height: 32rpx;
	color: var(--tt-text-muted);
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.order-price {
	margin-top: 14rpx;
	font-size: 40rpx;
	font-weight: 750;
	line-height: 50rpx;
	color: #ec6b20;

	text {
		margin-right: 4rpx;
		font-size: 24rpx;
		font-weight: 650;
	}
}

.countdown-row {
	height: 92rpx;
	margin-top: 24rpx;
	padding: 0 24rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #fff;
	border: 1rpx solid var(--tt-border);
	border-radius: 22rpx;
	font-size: 27rpx;
	color: var(--tt-text);
	box-sizing: border-box;
}

.countdown {
	font-size: 28rpx;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
	color: #ec6b20;

	&.expired {
		color: var(--tt-danger);
	}
}

.payment-title {
	display: block;
	padding: 36rpx 2rpx 18rpx;
	font-size: 31rpx;
	font-weight: 700;
	line-height: 44rpx;
	color: var(--tt-text);
}

.pay-box {
	overflow: hidden;
	background: #fff;
	border: 1rpx solid var(--tt-border);
	border-radius: 24rpx;
}

.pay-item {
	height: 102rpx;
	padding: 0 22rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1rpx solid var(--tt-border);
	box-sizing: border-box;

	&:last-child {
		border-bottom: 0;
	}
}

.pay-info,
.wallet-copy {
	display: flex;
	align-items: center;
}

.pay-icon {
	width: 58rpx;
	height: 58rpx;
	margin-right: 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 15rpx;

	image {
		width: 42rpx;
		height: 42rpx;
	}
}

.wechat-icon {
	background: #e8f8ea;
}

.wallet-icon {
	background: var(--tt-primary-soft);
}

.pay-name {
	font-size: 28rpx;
	font-weight: 560;
	color: var(--tt-text);
}

.balance {
	font-size: 23rpx;
	color: var(--tt-text-muted);
}

.pay-radio {
	transform: scale(0.82);
}

.payment-footer {
	padding: 18rpx 28rpx calc(18rpx + constant(safe-area-inset-bottom));
	padding: 18rpx 28rpx calc(18rpx + env(safe-area-inset-bottom));
	background: rgba(255, 255, 255, 0.97);
	border-top: 1rpx solid var(--tt-border);
}

.confirm-button {
	width: 100%;
	height: 88rpx;
	margin: 0;
	padding: 0 30rpx;
	background: var(--tt-primary);
	border-radius: 999rpx;
	font-size: 29rpx;
	font-weight: 700;
	line-height: 88rpx;
	color: #fff;
	box-shadow: 0 8rpx 18rpx rgba(143, 152, 30, 0.2);

	&[disabled] {
		background: #d9dbd2;
		color: #fff;
		box-shadow: none;
	}
}
</style>

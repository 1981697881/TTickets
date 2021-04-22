<template>
	<view class="container position-relative">
		<view style="margin-bottom: 130rpx;">
			<!-- 购物车列表 begin -->
			<view class="section-2">
				<view class="cart d-flex flex-column">
					<list-cell last v-for="(item, index) in cart" :key="index">
						<view class="w-100 d-flex flex-column">
							<view class="d-flex align-items-center mb-10">
								<view class="name-and-props overflow-hidden">
									<view class="text-color-base font-size-lg">{{ item.goodsName }}</view>
								</view>
								<view class="d-flex flex-fill justify-content-between align-items-center text-color-base font-size-lg">
									<view>x{{ item.goodsCount }}</view>
									<view>￥{{ item.goodsPrice }}</view>
								</view>
							</view>
							<view class="text-truncate font-size-base text-color-assist">{{ item.props_text }}</view>
						</view>
					</list-cell>
				</view>
				<!-- 优惠券 -->
				<view class="coupon x-bc item-list">
					<view class="item-title">优惠券</view>
					<view class="x-f" @tap="selCoupon">
						<text class="price" v-if="pickerData.couponList.length">{{ pickerData.title }}</text>
						<text class="sel-coupon" v-else>暂无优惠券</text>
						<text class="cuIcon-right"></text>
					</view>
				</view>
				<!-- 手机号码 -->
				<view class="phone x-bc item-list">
					<view class="item-title">手机号码</view>
					<view class="x-f" v-if="userInfo.phoneNumber">
						<text class="price">{{ userInfo.phoneNumber }}</text>
					</view>
					<view v-else class="x-f">
						<text class="sel-coupon">无手机号码</text>
						<button class="cu-btn round lines-red" open-type="getPhoneNumber" @getphonenumber="bindPhone">获取</button>
					</view>
				</view>
				<list-cell last>
					<view class="flex-fill d-flex justify-content-end align-items-center">
						<view>总计￥{{ total }},实付</view>
						<view class="font-size-extra-lg font-weight-bold">￥{{ amount }}</view>
					</view>
				</list-cell>
			</view>
			<!-- 购物车列表 end -->
			<view class="d-flex align-items-center justify-content-start font-size-sm text-color-warning" style="padding: 20rpx 0;">
				<view class="iconfont iconhelp line-height-100"></view>
				<view>优惠券不与满赠、满减活动共享</view>
			</view>
			<!-- 支付方式 begin -->
			<radio-group @change="selPay" class="pay-box">
				<label class="x-bc pay-item">
					<view class="x-f">
						<image class="pay-img" src="http://shopro.7wpp.com/imgs/wx_pay.png" mode=""></image>
						<text>微信支付</text>
					</view>
					<radio value="wechat" :class="{ checked: payType === 'wechat' }" class=" pay-radio orange" :checked="payType === 'wechat'"></radio>
				</label>
				<label class="x-bc pay-item">
					<view class="x-f">
						<image class="pay-img" src="http://shopro.7wpp.com/imgs/wallet_pay.png" mode=""></image>
						<text>
							余额支付
							<text class="text-red padding-left">{{balInfo.Money==0 ||balInfo.Money==null?'余额不足':''}}({{balInfo.Money || "0.00"}})</text>
						</text>
					</view>
					<radio value="wallet" :disabled="balInfo.Money==0 ||balInfo.Money==null?true:false" :class="{ checked: payType === 'wallet' }" class="pay-radio orange" :checked="payType === 'wallet'"></radio>
				</label>
			</radio-group>

			<!-- 支付方式 end -->
		</view>
		<!-- 付款栏 begin -->
		<view class="w-100 pay-box position-fixed fixed-bottom d-flex align-items-center justify-content-between bg-white">
			<view class="font-size-sm" style="margin-left: 20rpx;">合计：</view>
			<view class="font-size-lg flex-fill">￥{{ amount }}</view>
			<button :disabled="isSubOrder" class="bg-primary h-100 d-flex align-items-center just-content-center text-color-white font-size-base" style="padding: 0 60rpx;" @tap="combuy">付款</button>
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import AppPay from '@/common/app-pay';
import listCell from '@/components/list-cell/list-cell';
import modal from '@/components/modal/modal';
let orders = [];

export default {
	components: {
		listCell,
		modal
	},
	data() {
		return {
			cart: [],
			payType: 'wechat',
			pickerData: {
				title: '选择优惠券',
				couponList: []
			},
			form: {
				remark: ''
			},
			orderType: 'dinein',
			address: '123',
			store: '1',
			isSubOrder: false,
			ensureAddressModalVisible: false
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo,
			balInfo: state => state.user.balInfo
		}),
		total() {
			return this.cart.reduce((acc, cur) => acc + cur.goodsCount * cur.goodsPrice, 0);
		},
		amount() {
			return this.cart.reduce((acc, cur) => acc + cur.goodsCount * cur.goodsPrice, 0);
		}
	},
	onLoad(option) {
		const { remark } = option;
		this.cart = uni.getStorageSync('cart');
		remark && this.$set(this.form, 'remark', remark);
	},
	methods: {
		combuy(){
			uni.showToast({
				icon: 'none',
				title: '此功能尚未开放....敬请期待'
			})
			/* if(this.payType=='wallet'){
				this.blanBuy()
			}else{
				this.pay()
			} */
		},
		// 选择优惠券
		selCoupon() {
			if (this.pickerData.couponList.length) {
				this.showPicker = true;
			} else {
				this.$tools.toast('暂无优惠券');
			}
		},
		selPay(e) {
			if(e.detail.value == 'wallet'){
				if(Number(this.amount) <= Number(that.balInfo.Money) ){
					that.payType = e.detail.value;
				}else{
					that.payType = 'wechat';
				return uni.showToast({
					icon: 'none',
					title: '余额不足以支付本次费用，请选择其他支付方式'
				})
				}
			}else{
				that.payType = 'wechat';
			}
		},
		submit() {
			if (this.orderType == 'takeout') {
				this.ensureAddressModalVisible = true;
			} else {
				this.pay();
			}
		},
		//余额购买
		blanBuy(){
			let ticketList = []
			let that = this;
			if(that.userInfo.phoneNumber){
				that.isSubOrder = true
				let params = {
					ticketId: that.perGoodsList.ticketId,
					qty: that.amount+"",
					custId: that.balInfo.custId,
					phoneNumber: that.userInfo.phoneNumber,
				}
				this.$api('user.deduction', params).then(res => {
					if(res.flag){
						that.jump('/pages/index/wallet', res.data);
					}else{
						uni.showToast({
							icon: 'none',
							title: res.msg
						})
					}
				});
				
			}else{
				uni.showToast({
					icon: 'none',
					title: '手机号码为必填项'
				})
			}
			
		},
		//线上支付
		pay() {
			let that = this;
			if(that.userInfo.phoneNumber){
			uni.showLoading({ title: '加载中' });
			let parArray = [];
			that.isSubOrder = true
			that.cart.forEach((item, index) => {
				let obj = {};
				obj.goodsId = item.goodsId;
				obj.goodsName = item.goodsName;
				obj.goodsCount = item.goodsCount;
				obj.goodsAllprice = (Number(item.goodsCount) * 100 * (Number(item.goodsPrice) * 100)) / 10000;
				parArray.push(obj);
			});
			//测试订单
			let params = {
				goodsPaymoney: that.amount,
				memberGoodsDetailPojos: parArray
			};
			
			let pay = new AppPay(that.payType, that.cart, 'goods.payGoodsMoney', params);
			uni.removeStorageSync('cart');
			uni.hideLoading();
			}else{
				uni.showToast({
					icon: 'none',
					title: '手机号码为必填项'
				})
			}
		}
	}
};
</script>

<style lang="scss" scoped>
@import '~@/static/style/app.scss';
.pay-box {
	.pay-item {
		height: 90rpx;
		padding: 0 30rpx;
		font-size: 26rpx;
		background: #fff;
		width: 700rpx;
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
.coupon,
.phone {
	border-bottom: 1rpx solid rgba(#dfdfdf, 0.5);
	box-shadow: 1px 1px 1px #c0c0c0;
}
.item-list {
	height: 100rpx;
	background: #fff;
	padding: 0 25rpx;

	.item-title {
		font-size: 28rpx;
		margin-right: 20rpx;
	}

	.detail {
		font-size: 28rpx;
		color: #333;
	}

	.price {
		font-size: 26rpx;
		color: #e1212b;
		margin-right: 20rpx;
	}
	.sel-coupon {
		font-size: 26rpx;
		color: #c4c4c4;
		margin-right: 20rpx;
	}
	.cuIcon-right {
		color: #c4c4c4;
	}
}
.container {
	padding: 30rpx;
}

.arrow {
	width: 50rpx;
	height: 50rpx;
	position: relative;
	margin-right: -10rpx;
}

.location {
	.store-name {
		font-size: $font-size-lg;
	}

	.iconfont {
		font-size: 50rpx;
		line-height: 100%;
		color: $color-primary;
	}
}

.section-1 {
	margin-bottom: 30rpx;
	.contact {
		.contact-tip {
			margin-left: 10rpx;
			border: 2rpx solid $color-primary;
			padding: 6rpx 10rpx;
			color: $color-primary;
		}
	}
}

.section-2 {
	.name-and-props {
		width: 65%;
	}
}

.payment {
	margin-bottom: 30rpx;

	.disabled {
		color: $text-color-grey;
	}

	.payment-icon {
		font-size: 44rpx;
		margin-right: 10rpx;
	}

	.checkbox {
		font-size: 36rpx;
		margin-left: 10rpx;
	}

	.checked {
		color: $color-primary;
	}
}

.pay-box {
	box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);
	height: 100rpx;
}

.modal-content {
	.change-address-btn {
		line-height: 2;
		padding: 0 1em;
	}
	.pay_btn {
		width: 100%;
		border-radius: 50rem !important;
		line-height: 3;
	}
}
</style>

<template>
	<view class="page_box">
		<view class="head_box margin-top">
			<view class="cu-form-group text-xl text-bold text-brown">我的账户：{{balInfo.Number || ''}}</view>
			<view class="cu-form-group text-grey">我的余额：{{ balInfo.Money || "0.00" }} 元</view>
			<view class="cu-form-group text-bold">充值金额：{{checkPrice}} 元</view>
		</view>
		<view class="content_box">
			<!--<view class="y-f money-box">
				 <button
					v-for="(item, index) in setMeal"
					:key="index"
					class="money"
					:class="checkItem == index ? 'moneyAct' : ''"
					@tap="checkMoney"
					:data-target="index"
					:data-price="item.price"
				>
				{{item.price}}
				</button> 
			</view>-->
			<radio-group @change="selMoney" class="pay-box" style="margin-top: 20rpx;">
				<label class="x-bc pay-item" style="height: 120rpx" v-for="(item, index) in setMeal"
					:key="index">
					<view class="x-f" style="flex-direction:column;align-items: flex-start;">
						<text class="text-orange text-xl text-bold"><text class="text-red">￥</text> {{item.amount}}</text>
						<text class="text-sm text-gray">{{item.remark}}</text>
					</view>
					<radio :value="item.amount" class=" pay-radio yellow"></radio>
				</label>
			</radio-group>
			<radio-group @change="selPay" class="pay-box" style="margin-top: 20rpx;" v-if="payment">
				<label class="x-bc pay-item" v-if="payment.includes('wechat')">
					<view class="x-f">
						<image class="pay-img" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/wx_pay.png" mode=""></image>
						<text>微信支付</text>
					</view>
					<radio value="wechat" :class="{ checked: payType === 'wechat' }" class=" pay-radio orange" :checked="payType === 'wechat'"></radio>
				</label>
			</radio-group>
			<!-- 购票须知 -->
			<view class="notice x-bc">
				<view class="notice-title">充值须知</view>
				<view class="notice-detail">
					<view>充值之后<text class="text-bold text-xl">不可退款</text>并且<text class="text-bold text-xl">不可提现</text>，请选择合适的充值金额后确认充值，谢谢</view>
				</view>
			</view>
			<view class="x-c">
				<button class="cu-btn pay-btn bg-cyan" :disabled="isSubOrder" @tap="confirmPay">确认支付 ￥{{ checkPrice }}</button>
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
			setMeal:[],
			isSubOrder: false,
			payType: 'wechat',
			options: {},
			checkItem: 0,
			checkPrice: 0,
			orderDetail: {},
			isAndroid: uni.getStorageSync('isAndroid'),
			platform: uni.getStorageSync('platform')
		};
	},
	computed: {
		...mapState({
			payment: state => state.init.initData.payment,
			balInfo: state => state.user.balInfo,
			storeInfo: state => state.user.storeInfo,
			userInfo: state => state.user.userInfo
		})
	},
	onLoad(options) {
		this.options = options;
		if(this.$Route.query){
			this.orderDetail = this.$Route.query
		}
		this.getMealList();
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
	},
	onShow() {},
	onHide() {
		clearInterval(timer);
	},
	methods: {
		...mapActions(['getUserBalance']),
		checkMoney(e){
			if(this.checkItem == e.target.dataset.target){
				return
			}else{
				this.checkItem = e.target.dataset.target
				this.checkPrice = e.target.dataset.price
			}
		},
		selPay(e) {
			this.payType = e.detail.value;
		},
		selMoney(e) {
			this.checkPrice = e.detail.value
		},
		getMealList(){
			let that = this
			this.$api('goods.amountMoneyList', {}).then(res => {
				if(res.flag){
					that.setMeal = res.data
				}else{
					uni.showToast({
						icon: 'none',
						title: res.msg
					})
				}
			});
		},
		// 发起支付
		confirmPay() {
			let that = this;
			if(that.userInfo.phoneNumber){
			if(that.balInfo.custId){
				
					/* uni.showToast({
						icon: 'none',
						title: '此功能尚未开放....敬请期待'
					}) */
					let params ={
						rechargeMoney: that.checkPrice+"",
						openId:uni.getStorageSync('openid'),
						custId:that.balInfo.custId,
						storeId:that.storeInfo.id,
					}
					let pay = new AppPay(that.payType, that.orderDetail,"user.payRecharge",params,3);
				
			}else{
				uni.showToast({
					icon: 'none',
					title: '新用戶暂还没开放充值，敬请期待'
				})
			}
			}else{
				uni.showToast({
					icon: 'none',
					title: '需提供手机号码，请到“我的”页面，填写或者授权手机号码'
				})
			}
		},
		//第三方订单接口
		confirmOrder(){
			let ticketList = []
			let that = this
			this.$api('user.recharge', {
				custId: this.balInfo.custId,
				qty: that.checkPrice,
				placeId: that.storeInfo.v8PlaceId,
				V8Url: that.storeInfo.v8Url,
				storeId: that.storeInfo.id,
				phoneNumber: this.userInfo.phoneNumber,
			}).then(res => {
				if(res.flag){
					uni.showToast({
						icon: 'none',
						title: res.msg
					})
					that.isSubOrder = false
					that.getUserBalance()
					/* that.jump('/pages/index/wallet', res.data); */
				}else{
					uni.showToast({
						icon: 'none',
						title: res.msg
					})
				}
			});
		},	
	}
};
</script>

<style lang="scss">
.head_box {
	background: #fff;
}
.notice {
	margin-top: 20rpx;
	background: #fff;
	padding: 0 25rpx;
	display: inline-block;
	.notice-title {
		height: 80rpx;
		line-height: 80rpx;
		font-size: 35rpx;
		font-weight: bold;
		border-bottom: 1px solid #eeeed1;
	}
	.notice-detail {
		padding-top: 10rpx;
		view {
			line-height: 50rpx;
		}
	}
}
.money-box {
	background: #fff;
	height: auto;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: flex-start;
	align-content: flex-start;
	margin-bottom: 20rpx;
	.money {
		text-align: center;
		width: 920rpx;
		padding: 0 !important;
		margin: 15rpx;
		height: 120rpx;
		box-shadow: 1px 1px 1px 1px #a5a5a5;
		border-radius: 15rpx;
		line-height: 120rpx;
		color: #778899;
		background: #f8f8ff;
		font-size: 55rpx;
		&::before {
			content: '￥';
			font-size: 46rpx;
		}
	}
	.moneyAct {
		color: #e1212b;
		box-shadow: 1px 1px 1px 1px;
		background-color: #faf0e6;
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
	border-radius: 40rpx;
	box-shadow: 1px 1px 1px 1px #cce6ff;
	margin-top: 100rpx;
}
</style>

<template>
	<view class="container position-relative">
		<view style="margin-bottom: 130rpx;">
			<!-- 购物车列表 begin -->
			<view class="section-2">
				<view class="cart d-flex flex-column bg-white">
					<view class="goods-box x-start" v-for="(item, index) in cart" :key="index" >
						<image class="goods-img" :src="decodeURIComponent(item.ImagePath)|| 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/zanwu.jpg'" mode=""></image>
						<view class="y-start">
							<view class="goods-title more-t">{{ item.PackageName }}</view>
							<view class="action">
							<view class="btn-group">
								<!-- <button type="default" plain class="btn" size="mini" hover-class="none" @tap="handlePropertyReduce(item)"><view class="cuIcon-move"></view></button> -->
								<view class="number">{{ item.goodsCount }}</view>
								<!-- <button type="primary" class="btn" size="min" hover-class="none" @tap="handlePropertyAdd(item)"><view class="cuIcon-add"></view></button> -->
							</view>
							</view>
							<view class="size-tip">{{ item.Note || '' }}</view>
							<slot name="goodsBottom">
								<view class="price">￥{{ item.PackageAmount }}</view>
							</slot>
						</view>
					</view>
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
						<image class="pay-img" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/wx_pay.png" mode=""></image>
						<text>微信支付</text>
					</view>
					<radio value="wechat" :class="{ checked: payType === 'wechat' }" class=" pay-radio orange" :checked="payType === 'wechat'"></radio>
				</label>
				<label class="x-bc pay-item">
					<view class="x-f">
						<image class="pay-img" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/wallet_pay.png" mode=""></image>
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
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
		<app-modal v-model="showExpressType" :modalType="'bottom-modal'">
			<block slot="modalContent">
				<!-- 选择优惠券 -->
				<view class="express-type page_box">
					<view class="express-type__head head-box">
						<view class="express-type__head-nav" >
							<text class="head-nav__title head-nav__title--active" >优惠券</text>
							<view class="head-nav__left--active"></view>
						</view>
					</view>
					<view class="express-type__content content_box">
						<fz-coupon-card ref="couponCard" @changeCoupon="changeCoupon" :pickerData="pickerData.couponList"></fz-coupon-card>
					</view>
					<view class="express-type__bottom x-bc">
						<button class="cu-btn cancel-btn" @tap="hideExpressType">取消</button>
						<button class="cu-btn save-btn" @tap="saveExpressType">确定</button>
					</view>
				</view>
			</block>
		</app-modal>
	</view>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
import fzCouponCard from './children/fz-coupon-card.vue';
import AppPay from '@/common/app-pay';
import modal from '@/components/modal/modal';
let orders = [];
export default {
	components: {
		modal,
		fzCouponCard
	},
	data() {
		return {
			cart: [],
			payType: 'wechat',
			pickerData: {
				title: '选择优惠券',
				couponList: []
			},
			isSubOrder: false,
			couponId: 0,
			couponPrice: 0,
			showExpressType: false, //优惠券弹窗
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo,
			storeInfo: state => state.user.storeInfo,
			balInfo: state => state.user.balInfo
		}),
		total() {
			let that = this
			return this.cart.reduce((acc, cur) => acc + cur.goodsCount * cur.PackageAmount, 0);
		},
		amount() {
			let that = this
			return this.cart.reduce((acc, cur) => acc + cur.goodsCount * cur.PackageAmount -Number(that.couponPrice), 0);
		},
		
	},
	async onShow() {
		const { query } = this.$Route;
		this.cart = JSON.parse(query.pay)
		this.getCoupons();
		await this.getUserBalance();
		console.log(this.cart)
	},
	methods: {
		...mapActions(['getUserBalance','getUserDetails']),
		handlePropertyAdd(item) {
			this.$set(item,'goodsCount',item.goodsCount+1)
		},
		handlePropertyReduce(item) {
			if (item.goodsCount === 1) return;
			this.$set(item,'goodsCount',item.goodsCount-1)
		},
		// 关闭弹窗
		hideExpressType() {
			this.showExpressType = false;
		},
		// 保存方式
		saveExpressType() {
			this.showExpressType = false;
		},
		//计算团体票优惠
		calculateBenefits(val = []) {
			let that = this;
			let countPrice = 0;
			countPrice = Number(that.couponPrice);
			if (countPrice == 0) {
				this.pickerData.title = '选择优惠券';
			} else {
				this.pickerData.title = '-￥' + countPrice;
			}
		},
		combuy(){
			let that = this
			
			if(that.balInfo.CustID == undefined){
				if (that.userInfo.phoneNumber) {
					that.routerTo('https://server.zk2016.com/outside/web/auth/miniAuth.do?placeId=77BAF153-CDE4-466E-B394-C69240E79077&redirect_uri=/pages/user/register')
				} else {
					uni.showToast({
						icon: 'none',
						title: '未检测到手机号码，请回个人中心授权手机号码',
						duration: 2000
					});
					uni.switchTab({
						url: '/pages/index/user',
					})
				}
			}else{
				if(this.payType=='wallet'){
					if (Number(this.amount) <= Number(that.balInfo.Money)) {
						uni.showLoading({ title: '购买中~~为了避免购买失败，请勿退出！' });
						this.$api('goods.addGoodsOrder', {
							openId: uni.getStorageSync('openid'),
							storeId: that.storeInfo.id,
							goodsPaymoney: this.amount
						}).then(res => {
							if(res.flag){
								this.blanBuy(res.data)
							}else{
								uni.showToast({
									icon: 'none',
									title: res.msg
								})
							}
						});
					} else {
						uni.showToast({
							icon: 'none',
							title: '余额不足以支付本次费用，请选择其他支付方式'
						});
					}
				}else{
					this.pay()
				}
			}
		},
		// 可用优惠券
		getCoupons() {
			let that = this;
			that.$api('coupons.list', {
				couponType: 3,
				openId: uni.getStorageSync('openid'),
				status: 0,
				payType: that.payType == 'wechat' ? 1 : 0,
				goodsAllPriceStr: this.amount,
			}).then(res => {
				if (res.flag) {
					that.pickerData.couponList = res.data;
					that.pickerData.title = '可用优惠券(' + (that.pickerData.couponList.length) + '张)';
				}
			});
		}, 
		// 选择优惠券
		selCoupon() {
			if (this.pickerData.couponList.length>0) {
				this.showExpressType = true;
			} else {
				this.$tools.toast('暂无优惠券');
			}
		},
		changeCoupon(index) {
			this.couponArray = [];
			this.couponId = 0;
			if (index >= 0) {
				this.couponId = this.pickerData.couponList[index].id;
				this.couponPrice = this.pickerData.couponList[index].reducePrice;
				this.calculateBenefits();
			} else {
				this.couponId = 0;
				this.pickerData.title = '选择优惠券';
			}
		},
		selPay(e) {
			let that = this
			if(e.detail.value == 'wallet'){
				console.log(Number(this.amount) <= Number(that.balInfo.Money) )
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
			console.log(that.payType)
		},
		submit() {
			this.pay();
		},
		//余额购买
		blanBuy(val){
			let ticketList = []
			let that = this;
			if(that.userInfo.phoneNumber){
				that.isSubOrder = true
				that.confirmOrder('res.data',val.goodsNo)
				/* let params = {
					goodsNo: val.goodsNo,
					qty: that.amount+"",
					custId: that.balInfo.custId,
					placeId: that.storeInfo.v8PlaceId,		
					storeId: that.storeInfo.id,		
					V8Url: that.storeInfo.v8Url, 
					note: '[使用'+that.amount+'预存款购买商品'+that.cart[0].PackageName+']',
					phoneNumber: that.userInfo.phoneNumber,
				}
				this.$api('user.deduction', params).then(res => {
					if(res.flag){
						that.confirmOrder(res.data,val.goodsNo)
					}else{
						uni.showToast({
							icon: 'none',
							title: res.msg
						})
					}
				}); */
				
			}else{
				uni.showToast({
					icon: 'none',
					title: '手机号码为必填项'
				})
			}
			
		},
		//确认订单
		confirmOrder(val,orderNo) {
			let that = this;
			this.$api('goods.depositMixPackage', {
				custId: that.balInfo.custId,
				qty: that.cart[0].goodsCount+"",
				packageId: that.cart[0].packageId+"",
				couponId: that.couponId,
				orderNo: orderNo,
				payType: 1,
				placeId: that.storeInfo.v8PlaceId,
				V8Url: that.storeInfo.v8Url,
				storeId: that.storeInfo.id,
				amount: that.amount+"",
				phoneNumber: that.userInfo.phoneNumber,
			}).then(res => {
				if (res.flag) {
					uni.hideLoading();
					uni.showToast({
						title: '购买成功',
						icon: 'success',
						duration: 2000,
						mask: true,
						success: function() {
							setTimeout(function(){
								that.jump('/pages/index/wallet', {type:'nostart'});
							}, 2000);
						}
					});
				} else {
					uni.showToast({
						icon: 'none',
						title: res.msg
					});
				}
			});
		},
		jump(path, parmas) {
			this.$Router.replace({
				path: path,
				query: parmas
			});
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
				storeId: that.storeInfo.id,	
				memberGoodsDetailPojos: parArray
			};
			let pay = new AppPay(that.payType, that.cart, 'goods.payGoodsMoney', params,4,{custId: that.balInfo.custId,
				qty: that.cart[0].goodsCount+"",
				packageId: that.cart[0].packageId+"",
				couponId: that.couponId,
				placeId: that.storeInfo.v8PlaceId,
				V8Url: that.storeInfo.v8Url,
				storeId: that.storeInfo.id,
				phoneNumber: that.userInfo.phoneNumber,
				amount: that.amount+""});
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
.express-type {
	width: 750rpx;
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	height: 700rpx;
	overflow: visible;
	.express-type__head {
		width: 100%;
		height: 74rpx;
		background: #f8e3bd;
		@include flex($align: center);
		border-radius: 20rpx 20rpx 0 0;
		&-nav {
			width: (750rpx/4);
			@include flex($align: center, $justify: center);
			position: relative;
			height: 100%;
		}
		.head-nav--active {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: 0;
			background: #fff;
			width: 100%;
			height: 80rpx;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0px 0px;
			&::after {
				content: '';
				display: block;
				width: 40rpx;
				height: 80rpx;
				position: absolute;
				transform: skewX(20deg);
				background: #fff;
				border-top-right-radius: 20rpx;
				top: 0;
				right: -15rpx;
			}
			&::before {
				content: '';
				display: block;
				width: 40rpx;
				height: 80rpx;
				position: absolute;
				transform: skewX(-20deg);
				background: #fff;
				border-top-left-radius: 20rpx;
				top: 0;
				left: -15rpx;
			}
		}
		.head-nav__left--active {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: 0;
			background: #fff;
			width: 100%;
			height: 74rpx;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0px 0px;
			&::after {
				content: '';
				display: block;
				width: 40rpx;
				height: 74rpx;
				position: absolute;
				transform: skewX(20deg);
				background: #fff;
				border-top-right-radius: 20rpx;
				top: 0;
				right: -15rpx;
			}
		}
		.head-nav__right--active {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: 0;
			background: #fff;
			width: 100%;
			height: 74rpx;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0px 0px;
			&::before {
				content: '';
				display: block;
				width: 40rpx;
				height: 74rpx;
				position: absolute;
				transform: skewX(-20deg);
				background: #fff;
				border-top-left-radius: 20rpx;
				top: 0;
				left: -15rpx;
			}
		}
		.head-nav__title {
			font-size: 24rpx;
			font-weight: 500;
			color: #666;
			position: relative;
			z-index: 6;
		}
		.head-nav__title--active {
			color: #a8700d;
			font-size: 26rpx;
		}
	}
	.express-type__content {
		.empty-address {
			height: 120rpx;
			padding: 0 25rpx;
			@include flex($justify: null, $align: center, $direction: null, $warp: null, $warpAlign: null);
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(153, 153, 153, 1);
		}
		
	}
	.express-type__bottom {
		height: 90rpx;
		padding: 0 30rpx;
		.cancel-btn {
			width: 335rpx;
			height: 74rpx;
			background: rgba(238, 238, 238, 1);
			border-radius: 37rpx;
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(51, 51, 51, 1);
		}
		.save-btn {
			width: 335rpx;
			height: 74rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			border-radius: 37rpx;
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(255, 255, 255, 1);
		}
	}
}
.action {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 70rpx;
		.left {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			margin-right: 20rpx;
			overflow: hidden;
			.price {
				font-size: $font-size-lg;
				color: $text-color-base;
			}
			.props {
				color: $text-color-assist;
				font-size: 24rpx;
				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
		.btn-group {
			display: flex;
			align-items: center;
			justify-content: space-around;
			.number {
				font-size: $font-size-base;
				width: 44rpx;
				height: 44rpx;
				line-height: 44rpx;
				text-align: center;
			}

			.btn {
				padding: 0;
				font-size: $font-size-base;
				width: 44rpx;
				height: 44rpx;
				line-height: 44rpx;
				border-radius: 100%;
			}
		}
	}
.cart{
	border-bottom: 1rpx solid #eeeeee;
	box-shadow: 1px 1px 1px #c0c0c0;
}
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

.pay-box {
	box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);
	height: 100rpx;
}


.goods-box {
	position: relative;
	.goods-img {
		height: 180rpx;
		width: 180rpx;
		background-color: #ccc;
		margin-right: 25rpx;
	}
	.order-goods__tag {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 3;
		width: 60rpx;
		height: 30rpx;
	}
	.goods-title {
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 500;
		color: rgba(51, 51, 51, 1);
		width: 450rpx;
		line-height: 40rpx;
		margin-bottom: 10rpx;
	}

	.size-tip {
		line-height: 40rpx;
		// background: #f4f4f4;
		// padding: 0 16rpx;
		font-size: 24rpx;
		color: #666;
	}
	.sub-tip {
		width: 480rpx;
		line-height: 40rpx;
		// background: #F6F2EA;
		font-size: 24rpx;
		color: #a8700d;
		margin: 10rpx 0;
	}

	.price {
		color: #e1212b;
	}
}
// order
.goods-box {
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
			background:rgba(233,183,102,0.16);
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

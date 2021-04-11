<template>
	<view class="page_box">
		<view class="content_box">
			<!-- 确认订单卡片 -->
			<view class="goods-list">
				<view class="goods-card">
					<view class="goods-box x-start">
						<view class="y-start">
							<view class="goods-title more-t"><view class="item-title text-xl text-bold">团体电子普通电影抵用券</view></view>
							<view class="size-tip">
								<view class="cu-tag radius line-yellow">全场影片</view>
								<view class="cu-tag radius line-yellow">普通厅</view>
							</view>
							<slot name="goodsBottom">
								<view class="price">
									注意事项：该劵为普通抵用券，可适用于全场普通影厅的影片播放场次，若需选择除普通影厅外的特殊厅，可购买“通用电影抵用劵”或在选择影片支付时额外补交其他影厅的所需的费用
								</view>
							</slot>
						</view>
					</view>
				</view>
				<view class="logistic item-list x-bc">
					<view class="x-f"><text class="cuIcon-ticket text-blue padding-xs">普通票 ￥15</text></view>
					<view class="x-f"><uni-number-box @change="changeNum" :step="1" :min="4" :currentSkuPrice.sync="currentSkuPrice" :value="ticketNum"></uni-number-box></view>
				</view>
			</view>
			<view class="goods-list">
				<view class="goods-card">
					<view class="goods-box x-start">
						<view class="y-start">
							<view class="goods-title more-t"><view class="item-title text-xl text-bold">团体电子通用电影抵用券</view></view>
							<view class="size-tip">
								<view class="cu-tag radius line-yellow">全场影片</view>
								<view class="cu-tag radius line-yellow">所有影厅</view>
							</view>
							<slot name="goodsBottom">
								<view class="price">
									注意事项：该劵为通用抵用券，使用于全场所有影厅，所有影片，但该劵为特殊影厅而设，若只是普通观影，请选择“普通电影抵用券”，避免造成不必要的浪费
								</view>
							</slot>
						</view>
					</view>
				</view>
				<view class="logistic item-list x-bc">
					<view class="x-f"><text class="cuIcon-ticket text-red padding-xs">通用票 ￥30</text></view>
					<view class="x-f"><uni-number-box @change="changeNumt" :step="1" :min="4" :currentSkuPrice.sync="currentSkuPrice" :value="tickettNum"></uni-number-box></view>
				</view>
			</view>
			<!-- 团体票购买须知 -->
			<view class="notice x-bc">
				<view class="notice-title">团体票购买须知</view>
				<view class="notice-detail">
					<view>1.团体票购买之后，在“我的-团体票-已购买”中查看购买信息，以及赠予派送</view>
					<view>2.团体票购买之后，在赠予过程，因操作失误或故意转发造成抵用券发送错误、他人冒领，官方不承担任何责任</view>
					<view>3.团体票可以在“我的-团体票-兑换”中兑换</view>
				</view>
			</view>
		</view>
		<view class="foot_box x-f">
			<text class="num">共1件</text>
			<view class="all-money">
				<text>合计：</text>
				<text class="price">￥1</text>
			</view>
			<button class="cu-btn sub-btn bg-red" @tap="confirmPay" :disabled="isSubOrder">
				<text v-if="isSubOrder" class="cuIcon-loading2 cuIconfont-spin"></text>
				立即购买
			</button>
		</view>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
import AppPay from '@/common/app-pay';
import { mapMutations, mapActions, mapState } from 'vuex';
// #ifdef H5
import wxsdk from '@/common/wechat/sdk';
// #endif
// #ifdef APP-PLUS
import permision from '@/common/permission.js';
// #endif
import goods from '@/csJson/scoreList.json';
import uniNumberBox from '@/components/uni-number-box/uni-number-box.vue';
export default {
	components: {
		uniNumberBox
	},
	data() {
		return {
			ticketNum: 5,
			tickettNum: 5,
			goodsInfo: {},
			currentSkuPrice: {},
			showPicker: false,
			isSubOrder: false,
			isAndroid: uni.getStorageSync('isAndroid'),
			platform: uni.getStorageSync('platform'),
			payType: 'wechat',
			from: '',
			orderType: '',
			grouponBuyType: 'alone',
			grouponId: 0,
			perGoodsList: {}, //确认单订单
			orderPre: {},
			couponId: 0,
			getFocus: false, //获取焦点。
			checkTime: {}
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo
		})
	},
	watch: {},
	async onLoad(options) {
		this.options = options;
		if (options.openid) {
			//检测到回传openid
			uni.setStorageSync('openid', options.openid);
		}
		if (this.$Route.query) {
			this.perGoodsList = { ...this.$Route.query };
			this.perGoodsList.schedule = JSON.parse(this.$Route.query.schedule);
			this.perGoodsList.locationHall = JSON.parse(this.$Route.query.locationHall);
			this.perGoodsList.seats = JSON.parse(this.$Route.query.seats);
		}
		this.initDate();
	},
	onShow() {},
	methods: {
		bindPhone(e) {
			let me = this;
			me.$api('user.getWxMiniPhoneNumber', {
				sessionKey: uni.getStorageSync('session_key'),
				openid: uni.getStorageSync('openid'),
				encryptedData: e.detail.encryptedData,
				iv: e.detail.iv
			}).then(res => {
				if (res.flag) {
					me.$api('user.getWxMiniPhoneNumber', {
						sessionKey: uni.getStorageSync('session_key'),
						openid: uni.getStorageSync('openid'),
						encryptedData: e.detail.encryptedData,
						iv: e.detail.iv
					}).then(res => {
						if (res.flag) {
							uni.setStorageSync('phone', res.data);
							me.jump('/pages/user/edit-phone', { fromType: 'bind', phone: res.data });
						}
					});
				}
			});
		},
		// 数量
		changeNum(e) {
			let that = this;
			that.ticketNum = +e;
		},
		changeNumt(e) {
			let that = this;
			that.tickettNum = +e;
		},
		// 发起支付
		confirmPay() {
			let that = this;
			let pay = new AppPay(that.payType, that.perGoodsList);
		},
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		//确认订单
		confirmOrder() {
			let ticketList = [];
			this.perGoodsList.seats.forEach(item => {
				let obj = {};
				obj.seatId = item.seatId;
				obj.ticketFee = item.ticketFee;
				obj.ticketPrice = item.ticketPrice;
				ticketList.push(obj);
			});
			this.$api('cinema.confirmOrder', {
				lockOrderId: this.perGoodsList.lockOrderId,
				scheduleId: this.perGoodsList.scheduleId,
				scheduleKey: this.perGoodsList.scheduleKey,
				mobile: uni.getStorageSync('phone'),
				ticketList: ticketList
			}).then(res => {
				if (res.flag) {
					console.log(res);
				}
			});
		},
		// 订单信息
		getPre() {
			let that = this;
			let res = goods;
			if (res.code === 1) {
				that.orderPre = res.data;
				that.perGoodsList = res.data.data;
				that.perGoodsList.map(item => {
					item.selType = item.dispatch_type;
					that.goodsList.forEach(goods => {
						if (item.goods_id == goods.goods_id && item.sku_price_id == goods.sku_price_id) {
							goods.dispatch_type = item.dispatch_type;

							if (item.store_id) {
								goods.store_id = item.store_id;
							}
						}
					});
				});
			}
		},
		// 更改提交数据
		changeGoodsList() {
			this.goodsList.forEach(goods => {
				if (goods.goods_id == this.currentGoodsId && this.currentSkuId == goods.sku_price_id) {
					goods.dispatch_type = this.expressTypeCur;
					goods.dispatch_phone = this.selfPhone;
					goods.dispatch_date = this.checkTime['day'][this.checkDayCur].value + ' ' + this.checkTime['time'][this.checkTimeCur] + ':00';
					if (this.expressTypeCur == 'selfetch') {
						goods.store_id = this.storeInfo.id;
					}
					goods.checkDayCur = this.checkDayCur;
					goods.checkTimeCur = this.checkTimeCur;
				}
			});
		},
		// 格式日期
		check(type, index) {
			if (type == 'time') {
				this.checkTimeCur = index;
				this.checkTimeId = this.checkTime['time'][index].split(':')[[0]];
			}
			if (type == 'day') {
				this.checkDayCur = index;
			}
		},
		// 是否同意协议
		checkProtocol() {
			this.isProtocol = !this.isProtocol;
		}
	}
};
</script>

<style lang="scss">
// 商品卡片
.goods-list {
	background: linear-gradient(90deg, rgba(103, 100, 97, 1), rgba(238, 204, 137, 1));
	position: relative;
	margin: 20rpx;
	color: white;
	border-radius: 15rpx;
	box-shadow: 1px 1px 1px #c0c0c0;
	/deep/ .goods-title {
		width: 460rpx !important;
	}
	.goods-card {
		padding: 30rpx;
	}
	.goods-price {
		font-size: 30rpx;
		font-weight: 500;
		width: 480rpx;
		.goods-num {
			padding-left: 10rpx;
			width: 80%;
			float: left;
			font-size: 28rpx;
			color: #c4c4c4;
			text {
				padding-left: 10rpx;
			}
		}
		.goods-hald {
			float: left;
		}
	}
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
.logistic,
.price-box,
.remark-box,
.score,
.coupon {
	border-top: 1rpx solid rgba(#dfdfdf, 0.5);
}
.coupon,
.phone {
	margin: 20rpx;
	border-radius: 15rpx;
	box-shadow: 1px 1px 1px #c0c0c0;
}
.notice {
	margin: 20rpx;
	border-radius: 15rpx;
	box-shadow: 1px 1px 1px #c0c0c0;
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
.border-top {
	border-top: 1rpx solid rgba(#dfdfdf, 0.5);
}

.foot_box {
	height: 100rpx;
	padding: 0 25rpx;
	justify-content: flex-end;
	background-color: #fff;
	.num {
		font-size: 26rpx;
		color: #999;
	}
	.all-money {
		margin: 0 60rpx 0 20rpx;
		.price {
			color: #e1212b;
		}
	}
	.sub-btn {
		width: 210rpx;
		height: 70rpx;
		background: linear-gradient(90deg, rgba(233, 130, 97, 1), rgba(238, 204, 137, 1));
		box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
		border-radius: 35rpx;
		font-size: 28rpx;
		color: #fff;
	}
}
</style>

<template>
	<view class="page_box">
		<view class="content_box">
			<!-- 确认订单卡片 -->
			<view class="goods-list" v-for="ticeket in ticketsList" :key="ticeket.cdkeyNumber">
				<view class="goods-card">
					<view class="goods-box x-start">
						<view class="y-start">
							<view class="goods-title more-t">
								<view class="item-title text-xl text-bold">{{ ticeket.cdkeyName }}</view>
							</view>
							<view class="size-tip">
								<view v-for="(item, index) in ticeket.cdKeyKeyWordsArrays" :key="index" class="cu-tag radius line-yellow">{{ item }}</view>
							</view>
							<slot name="goodsBottom">
								<view class="price">{{ ticeket.cdkeyDescription }}</view>
							</slot>
						</view>
					</view>
				</view>
				<view v-if="ticeket.cdkeyNumber == 1" class="logistic item-list x-bc">
					<view class="x-f">
						<text class="cuIcon-ticket text-blue padding-xs">普通票 ￥{{ ticeket.cdkeyPrice }}</text>
					</view>
					<view class="x-f">
						<uni-number-box @change="changeNum($event, ticeket)" :step="1" :min="0" :currentSkuPrice.sync="currentSkuPrice" :value="ticketNum"></uni-number-box>
					</view>
				</view>
				<view v-else class="logistic item-list x-bc">
					<view class="x-f">
						<text class="cuIcon-ticket text-red padding-xs">通用票 ￥{{ ticeket.cdkeyPrice }}</text>
					</view>
					<view class="x-f">
						<uni-number-box @change="changeNumt($event, ticeket)" :step="1" :min="0" :currentSkuPrice.sync="currentSkuPrice" :value="tickettNum"></uni-number-box>
					</view>
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
			<text class="num">共{{ count }}件</text>
			<view class="all-money">
				<text>合计：</text>
				<text class="price">￥{{ countPrice.toFixed(2) }}</text>
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
			ticketNum: 0,
			tickettNum: 0,
			currentSkuPrice: {},
			isSubOrder: false,
			isAndroid: uni.getStorageSync('isAndroid'),
			platform: uni.getStorageSync('platform'),
			payType: 'wechat',
			orderType: '',
			perGoodsList: {}, //确认单订单
			ticketsList: []
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo
		}),
		countPrice: function() {
			let sum = 0;
			return this.ticketNum * Number(this.ticketsList[0].cdkeyPrice) + this.tickettNum * Number(this.ticketsList[1].cdkeyPrice);
		},
		count: function() {
			return this.tickettNum + this.ticketNum;
		}
	},
	watch: {},
	created() {
		this.getTicketsList();
	},
	async onLoad(options) {},
	onShow() {},
	methods: {
		// 数量
		changeNum(e, item) {
			console.log(e);
			console.log(item);
			let that = this;
			if(that.tickettNum>0){
				that.tickettNum = 0
				return uni.showToast({
					icon: 'none',
					title: '一次只能选择一种类型购买'
				});
			}else{
				that.ticketNum = +e;
				that.$set(item, 'ticketNum', that.ticketNum);
			}
			
		},
		changeNumt(e, item) {
			console.log(e);
			console.log(item);
			let that = this;
			if(that.ticketNum>0){
				that.ticketNum = 0
				return uni.showToast({
					icon: 'none',
					title: '一次只能选择一种类型购买'
				});
			}else{
				that.tickettNum = +e;
				that.$set(item, 'ticketNum', that.tickettNum);
			}
		},
		// 发起支付
		confirmPay() {
			let that = this;
			if (that.userInfo.phoneNumber) {
				if (that.count > 0 && that.countPrice > 0) {
					let params = {
						cdkeyNumber: this.ticketsList[0].cdkeyNumber,
						cdkeyCount: this.count,
						paymoney: this.countPrice
					};
					uni.showToast({
						icon: 'none',
						title: '当前功能尚未开放....'
					});
					/* let pay = new AppPay(that.payType, that.ticketsList,'user.payCdKeyMoney',params); */
				} else {
					uni.showToast({
						icon: 'none',
						title: '请选择购买数量....'
					});
				}
			} else {
				uni.showToast({
					icon: 'none',
					title: '需提供手机号码，请到“我的”页面，填写或者授权手机号码'
				});
			}
		},
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		//确认订单
		confirmOrder() {
			if (this.count > 0 && this.countPrice > 0) {
				let ticketList = [];
				this.ticketsList.forEach(item => {
					let obj = {};
					ticketList.push(obj);
				});
				this.$api('user.payCdKeyMoney', {
					cdkeyNumber: this.ticketsList[0].cdkeyNumber,
					cdkeyCount: this.count,
					paymoney: this.countPrice,
					openId: uni.getStorageSync('openid')
				}).then(res => {
					if (res.flag) {
						this.confirmPay(res.data);
					}
				});
			} else {
				uni.showToast({
					icon: 'none',
					title: '请选择购买数量....'
				});
			}
		},
		// 抵用券列表
		getTicketsList() {
			let that = this;
			that.$api('user.cdKeyList', {}).then(res => {
				if (res.flag) {
					that.ticketsList = res.data;
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

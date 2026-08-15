<template>
	<view class="page_box">
		<view class="head_box">
			<cu-custom :isBack="true">
				<block slot="backText"></block>
				<block slot="content">我的钱包</block>
			</cu-custom>
			<!-- <image class="resale-bg" src="/static/resale_bg.png" mode=""></image> -->
			<view class="card-box x-end x-bc">
				<view class="left y-start">
					<view class="flex"><!-- -->
						<text class="title">账户：<text class="text-red"> {{balInfo.Number || '您还不是会员!'}}</text></text>
						<button v-if="!balInfo.Number" class="cu-btn sm round shadow lines-orange margin-left" @tap="register">成为会员</button>
					</view>
					<text class="money-num">{{balInfo.Money || "0.00"}}</text>
					<text class="text-olive">
						<text>游戏币：{{balInfo.Coins || "0"}}</text>
						<text class="padding-left"> 彩票：{{balInfo.Tickets || "0"}}</text>
						<text class="padding-left">积分：{{balInfo.Point || "0.00"}}</text>
						   </text>
					<text class="add">温馨提示: 任何冒充工作人员索要您帐号信息的私信均为诈骗信息,请您提高警惕,切勿上当受骗。</text>
				</view>
				<!-- <button class="cu-btn cash-btn" @tap="onWithdrawals">提现</button> -->
			</view>
		</view>
		<view class="content_box"><!-- v-if="!balInfo.IsBandCard && balInfo.Number" -->
			<view class="resale-list x-bc" v-if="!balInfo.IsBandCard && balInfo.Number" @tap="bindingCard" >
				<view class="x-f">
					<text class=" cuicon cuIcon-vipcard"></text>
					<text>绑定会员卡</text>
				</view>
				<text class="cuIcon-right"></text>
			</view>
			<view class="resale-list x-bc" @tap="jump('/pages/user/wallet/recharge')">
				<view class="x-f">
					<text class=" cuicon cuIcon-recharge"></text>
					<text>充值</text>
				</view>
				<text class="cuIcon-right"></text>
			</view>
			<view class="resale-list x-bc" @tap="jump('/pages/user/wallet/log')">
				<view class="x-f">
					<text class=" cuicon cuIcon-baby"></text>
					<text>钱包明细</text>
				</view>
				<text class="cuIcon-right"></text>
			</view>
			<!-- <view class="resale-list x-bc" @tap="jump('/pages/user/team/index')">
				<view class="x-f">
					<text class=" cuicon cuIcon-friend"></text>
					<text>我的团队</text>
				</view>
				<text class="cuIcon-right"></text>
			</view> -->
			<!-- <view class="resale-list x-bc" @tap="jump('/pages/user/poster')">
				<view class="x-f">
					<text class=" cuicon cuIcon-present"></text>
					<text>邀请好友</text>
				</view>
				<text class="cuIcon-right"></text>
			</view> -->
		</view>
		<view class="foot_box"></view>
		<app-modal v-model="showModal" style="z-index: 88;">
			<block slot="modalContent">
				<view class="modal-box">
					<view class="modal-head">
						<image class="modal-head-img" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/modal_bg.png" mode=""></image>
						<text class="modal-head-title">提现金额</text>
					</view>
					<input class="inp" type="number" @input="onInput" v-model="money" placeholder="在此输入提现金额" placeholder-class="pl-inp" />
					<button class="cu-btn post-btn" @tap="postMoney">提现</button>
				</view>
			</block>
		</app-modal>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
		<!-- 自定义底部导航 -->
		<app-tabbar></app-tabbar>
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
	</view>
</template>

<script>
import appModal from '@/components/app-modal/app-modal.vue';
import { mapState, mapActions } from 'vuex';
export default {
	components: {
		appModal
	},
	data() {
		return {
			showModal: false,
			money: '',
			routerTo: this.$tools.routerTo,
			rules: ''
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo,
			balInfo: state => state.user.balInfo,
			storeInfo: state => state.user.storeInfo
		})
	},
	onShow() {
		console.log('进入')
		/* this.getApplyRules(); */
		/* this.getUserInfo(); */
		this.getUserBalance()
	},
	methods: {
		...mapActions(['getUserInfo','getUserBalance']),
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		bindingCard(){
			let that = this
			if (that.userInfo.phoneNumber) {
				that.routerTo('https://server.zk2016.com/outside/web/auth/miniAuth.do?placeId='+that.storeInfo.v8PlaceId+'&redirect_uri=/pages/user/wallet/bind-bank')
			} else {
				uni.showToast({
					icon: 'none',
					title: '未检测到手机号码，请回个人中心授权手机号码'
				});
			}
		},
		register(){
			let that = this
			if (that.userInfo.phoneNumber) {
				that.routerTo('https://server.zk2016.com/outside/web/auth/miniAuth.do?placeId='+that.storeInfo.v8PlaceId+'&redirect_uri=/pages/user/register')
			} else {
				uni.showToast({
					icon: 'none',
					title: '未检测到手机号码，请回个人中心授权手机号码'
				});
			}
		},
		postMoney() {
			this.apply();
			this.showModal = false;
		},
		onInput() {
			if (+this.userinfo.money > 0 && +this.userinfo.money < +this.money) {
				setTimeout(() => {
					this.money = this.userinfo.money;
				}, 0);
			}
		},
		// 提现
		apply() {
			let that = this;
			that.$api('user_wallet_apply.apply', {
				money: that.money
			}).then(res => {
				if (res.code === 1) {
					//  #ifdef MP-WEIXIN
					this.$store.dispatch('getMessageIds', 'wallet');
					//  #endif
					this.$tools.toast(res.msg);
					that.getUserInfo();
				}
			});
		},
		// 提现规则
		getApplyRules() {
			let that = this;
			that.$api('user_wallet_apply.rule').then(res => {
				if (res.code === 1) {
					that.rules = res.data;
				}
			});
		},
		onWithdrawals() {
			if (this.userinfo.money <= 0) {
				this.$tools.toast('暂无可提现余额');
			} else {
				this.showModal = true;
			}
		}
	}
};
</script>

<style lang="scss">
// 提现弹窗
.modal-box {
	background: #fff;
	width: 610rpx;
	margin: 0 auto;
	border-radius: 20rpx;
	.modal-head-img {
		width: 100%;
		height: 213rpx;
	}

	.modal-head-title {
		font-size: 35rpx;
		font-family: PingFang SC;
		font-weight: bold;
		color: #6d5028;
		line-height: 42rpx;
	}

	.inp {
		width: 501rpx;
		height: 78rpx;
		border: 1rpx solid rgba(168, 112, 13, 1);
		margin: 60rpx auto 40rpx;
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 400;
		color: #6d5028;

		.pl-inp {
			color: #bd9560;
		}
	}

	.radio {
		width: 500rpx;
		padding: 0 50rpx;
		font-size: 24rpx;
		font-family: PingFang SC;
		font-weight: 400;
		color: rgba(200, 150, 61, 1);
		margin-bottom: 20rpx;

		.radio-inp {
			transform: scale(0.7);
			margin-right: 10rpx;
		}
	}

	.post-btn {
		width: 492rpx;
		height: 70rpx;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
		border-radius: 35rpx;
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 500;
		color: rgba(255, 255, 255, 1);
		padding: 0;
		margin-bottom: 60rpx;
	}
}

.head_box {
	width: 750rpx;
	height: 540rpx;
	background: linear-gradient(125deg, rgba(239, 196, 128, 1) 0%, rgba(148, 120, 165, 1) 100%);
	position: relative;
	color: white;
	.resale-bg {
		width: 750rpx;
		height: 64rpx;
		position: absolute;
		bottom: 0;
	}
	.card-box {
		width: 695rpx;
		height: 338rpx;
		padding: 30rpx;
		background: url(data:image/png;base64,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)
			no-repeat;
		background-size: 100% 100%;
		box-shadow: 0px 0px 12rpx 9rpx rgba(#f8dca5, 0.82);
		border-radius: 30rpx;
		overflow: hidden;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		top: 160rpx;
		z-index: 6;
		.left {
			display: flex;
			justify-content: space-between;
			height: 100%;
		}

		.cash-btn {
			width: 170rpx;
			height: 64rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			border: 2rpx solid rgba(230, 184, 115, 1);
			box-shadow: 0px 7px 6px 0px rgba(229, 138, 0, 0.22);
			border-radius: 32rpx;
			padding: 0;
			font-size: 30rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(51, 51, 51, 1);
		}

		.title {
			font-size: 30rpx;
			font-family: Noto Sans S Chinese;
			font-weight: 400;
			color: rgba(230, 184, 115, 1);
			line-height: 50rpx;
		}

		.money-num {
			font-size: 70rpx;
			font-family: FZHei-B01S;
			font-weight: 400;
			color: rgba(230, 184, 115, 1);
			line-height: 72rpx;
		}

		.add {
			font-size: 22rpx;
			width: 650rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(230, 184, 115, 1);
			line-height: 35rpx;
		}
	}
}

.resale-list {
	height: 96rpx;
	background: #fff;
	padding: 0 30rpx 0 40rpx;
	border-bottom: 1rpx solid #dfdfdf;
	font-size: 28rpx;
	font-weight: 500;
	color: rgba(51, 51, 51, 1);

	.cuicon {
		font-size: 40rpx;
		color: #666;
		margin-right: 30rpx;
	}
}
</style>

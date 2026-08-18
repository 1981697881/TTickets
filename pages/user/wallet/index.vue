<template>
	<view class="page_box user-subpage user-wallet-page">
		<view class="wallet-hero">
			<cu-custom :isBack="true">
				<block slot="backText"></block>
				<block slot="content">我的钱包</block>
			</cu-custom>
			<view class="wallet-card">
				<view class="wallet-card__head">
					<text class="wallet-account">账户 {{ balInfo.Number || '未开通会员' }}</text>
					<button v-if="!balInfo.Number" class="wallet-join" @tap="register">成为会员</button>
				</view>
				<view class="wallet-balance">
					<text class="wallet-balance__label">账户余额</text>
					<view class="wallet-balance__value">
						<text class="wallet-balance__yen">¥</text>
						<text>{{ displayMoney }}</text>
					</view>
				</view>
				<view class="wallet-stats">
					<view class="wallet-stat">
						<text class="wallet-stat__num">{{ balInfo.Coins || '0' }}</text>
						<text class="wallet-stat__label">游戏币</text>
					</view>
					<view class="wallet-stat">
						<text class="wallet-stat__num">{{ balInfo.Tickets || '0' }}</text>
						<text class="wallet-stat__label">彩票</text>
					</view>
					<view class="wallet-stat">
						<text class="wallet-stat__num">{{ balInfo.Point || '0' }}</text>
						<text class="wallet-stat__label">积分</text>
					</view>
				</view>
			</view>
		</view>
		<view class="wallet-tip">任何冒充工作人员索要账号信息的私信均为诈骗，请勿泄露账户资料。</view>
		<view class="wallet-menu">
			<view class="wallet-menu__item" v-if="!balInfo.IsBandCard && balInfo.Number" @tap="bindingCard">
				<view class="wallet-menu__left">
					<text class="cuicon cuIcon-vipcard"></text>
					<text>绑定会员卡</text>
				</view>
				<text class="cuIcon-right"></text>
			</view>
			<view class="wallet-menu__item" @tap="jump('/pages/user/wallet/recharge')">
				<view class="wallet-menu__left">
					<text class="cuicon cuIcon-recharge"></text>
					<text>充值</text>
				</view>
				<text class="cuIcon-right"></text>
			</view>
			<view class="wallet-menu__item" @tap="jump('/pages/user/wallet/log')">
				<view class="wallet-menu__left">
					<text class="cuicon cuIcon-baby"></text>
					<text>钱包明细</text>
				</view>
				<text class="cuIcon-right"></text>
			</view>
		</view>
		<view class="foot_box"></view>
		<app-modal v-model="showModal">
			<template #modalContent>
				<view class="modal-box">
					<view class="modal-head">
						<text class="modal-head-title">提现金额</text>
					</view>
					<input class="inp" type="number" @input="onInput" v-model="money" placeholder="在此输入提现金额" placeholder-class="pl-inp" />
					<button class="cu-btn post-btn" @tap="postMoney">提现</button>
				</view>
			</template>
		</app-modal>
		<app-login-modal></app-login-modal>
		<app-tabbar></app-tabbar>
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
		}),
		displayMoney() {
			const value = Number(this.balInfo && this.balInfo.Money);
			if (!Number.isFinite(value)) return '0.00';
			return value.toFixed(2);
		}
	},
	onShow() {
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
@import '@/static/style/user-center.scss';

.user-wallet-page {
	background: var(--tt-bg);
}

.wallet-hero {
	padding: 0 24rpx 28rpx;
	background: linear-gradient(165deg, #3b4220 0%, var(--tt-primary-strong) 58%, var(--tt-primary) 100%);
}

.wallet-hero .cu-bar,
.wallet-hero .cu-bar.fixed {
	background: transparent !important;
	color: #fff !important;
}

.wallet-hero .cu-bar .action,
.wallet-hero .cu-bar .content {
	color: #fff !important;
}

.wallet-card {
	margin-top: 12rpx;
	padding: 28rpx 28rpx 22rpx;
	background: rgba(255, 255, 255, 0.14);
	border: 1rpx solid rgba(255, 255, 255, 0.22);
	border-radius: var(--tt-radius-lg);
	box-shadow: 0 16rpx 36rpx rgba(20, 24, 10, 0.18);
}

.wallet-card__head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.wallet-account {
	min-width: 0;
	flex: 1;
	font-size: 24rpx;
	line-height: 34rpx;
	color: rgba(255, 255, 255, 0.86);
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.wallet-join {
	height: 52rpx;
	min-height: 52rpx;
	margin: 0;
	padding: 0 20rpx;
	background: #fff;
	border-radius: 999rpx;
	font-size: 22rpx;
	font-weight: 600;
	line-height: 52rpx;
	color: var(--tt-primary-strong);
}

.wallet-balance {
	margin-top: 28rpx;
}

.wallet-balance__label {
	display: block;
	font-size: 22rpx;
	line-height: 32rpx;
	color: rgba(255, 255, 255, 0.72);
}

.wallet-balance__value {
	display: flex;
	align-items: baseline;
	margin-top: 6rpx;
	font-size: 64rpx;
	font-weight: 720;
	line-height: 80rpx;
	color: #fff;
}

.wallet-balance__yen {
	margin-right: 8rpx;
	font-size: 32rpx;
	font-weight: 650;
}

.wallet-stats {
	display: flex;
	margin-top: 28rpx;
	padding-top: 22rpx;
	border-top: 1rpx solid rgba(255, 255, 255, 0.16);
}

.wallet-stat {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.wallet-stat__num {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #fff;
}

.wallet-stat__label {
	margin-top: 4rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: rgba(255, 255, 255, 0.7);
}

.wallet-tip {
	margin: 20rpx 24rpx 0;
	padding: 16rpx 20rpx;
	background: var(--tt-primary-soft);
	border-radius: var(--tt-radius-sm);
	font-size: 22rpx;
	line-height: 34rpx;
	color: var(--tt-primary-strong);
}

.wallet-menu {
	padding: 20rpx 24rpx calc(24rpx + var(--tt-safe-bottom));
}

.wallet-menu__item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 104rpx;
	margin-bottom: 14rpx;
	padding: 0 28rpx;
	background: var(--tt-surface);
	border: 1rpx solid var(--tt-border);
	border-radius: var(--tt-radius-md);
	box-shadow: var(--tt-shadow);
	font-size: 28rpx;
	color: var(--tt-text);
}

.wallet-menu__left {
	display: flex;
	align-items: center;
}

.wallet-menu__left .cuicon {
	margin-right: 20rpx;
	font-size: 40rpx;
	color: var(--tt-primary-strong);
}

.wallet-menu__item .cuIcon-right {
	color: var(--tt-text-muted);
}

.modal-box {
	width: 610rpx;
	margin: 0 auto;
	padding: 40rpx 0 48rpx;
	background: #fff;
	border-radius: var(--tt-radius-lg);
}

.modal-head-title {
	display: block;
	font-size: 34rpx;
	font-weight: 700;
	line-height: 48rpx;
	color: var(--tt-text);
	text-align: center;
}

.inp {
	width: 500rpx;
	height: 80rpx;
	margin: 36rpx auto 28rpx;
	padding: 0 24rpx;
	border: 1rpx solid var(--tt-border);
	border-radius: 16rpx;
	font-size: 28rpx;
	color: var(--tt-text);
	box-sizing: border-box;
}

.pl-inp {
	color: var(--tt-text-muted);
}

.post-btn {
	width: 500rpx;
	height: 80rpx;
	margin: 0 auto;
	background: var(--tt-primary);
	border-radius: 999rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: #fff;
}
</style>

<template>
	<!-- #ifndef MP-WEIXIN  -->
	<app-safe-popup v-if="!screenShot" v-model="showLogin" max-width="610rpx" aria-label="登录提示">
			<view class="modal-box">
				<view class="login-mark"><text class="cuIcon-profile"></text></view>
				<view class="detail">
					<view class="title1">您还没有登录</view>
					<view class="title2">登录即刻开启品质生活</view>
				</view>
				<view class="btn-box y-f">
					<button class="cu-btn login-btn" @tap="onLogin">立即登录</button>
					<button class="cu-btn close-btn" @tap="hideModal">取消</button>
				</view>
			</view>
	</app-safe-popup>
	<!-- #endif  -->
	<!-- #ifdef MP-WEIXIN  -->
	<app-safe-popup :model-value="forceOauth || showLogin" :mask-closable="false" max-width="680rpx" aria-label="微信授权登录">
		<view class="force-login-wrap">
		<view class="force-login__content y-f">
			<view class="user-avatar x-c"><text class="cuIcon-profile"></text></view>
			<view class="login-notice">为了提供更优质的服务，需要获取您的头像昵称</view>
			<button class="cu-btn author-btn" @tap="getuserinfo">授权并查看</button>
			<button class="cu-btn close-btn" @tap="closeAuth">暂不授权</button>
		</view>
	</view>
	</app-safe-popup>
	<!-- #endif  -->
</template>

<script>
import Wechat from '@/common/wechat/wechat';
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	name: 'appLoginModal',
	components: {},
	data() {
		return {
			screenShot: uni.getStorageSync('screenShot')
		};
	},
	props: {
		value: {},
		modalType: {
			type: String,
			default: ''
		}
	},
	created() {},
	computed: {
		...mapState({
			showLoginTip: state => state.user.showLoginTip,
			forceOauth: state => state.user.forceOauth
		}),
		showLogin: {
			get() {
				return this.showLoginTip;
			},
			set(val) {
				this.$store.commit('LOGIN_TIP', val);
			}
		}
	},
	methods: {
		...mapActions(['setTokenAndBack']),
		// 隐藏登录弹窗
		hideModal() {
			this.showLogin = false;
		},
		// 去登录
		onLogin() {
			this.showLogin = false;
			uni.setStorageSync('fromLogin', this.$Route);
			this.$Router.push({
				path: '/pages/public/login'
			});
		},
		getUserProfile() {
			return new Promise((resolve, reject) => {
				uni.getUserProfile({
					desc: '用于完善会员资料',
					success: resolve,
					fail: reject
				});
			});
		},
		// 小程序，获取用户信息登录
		async getuserinfo(e) {
			try {
				const wechat = new Wechat();
				const profile = await this.getUserProfile();
				const token = await wechat.wxMiniProgramLogin(profile);
				this.$store.commit('FORCE_OAUTH', false);
				this.$store.commit('LOGIN_TIP', false);
				uni.setStorageSync('fromLogin', this.$Route);
				this.setTokenAndBack(token);
			} catch (error) {
				this.$tools.toast('未完成授权，请重试');
			}
		},
		// 小程序，取消登录
		closeAuth() {
			this.$store.commit('FORCE_OAUTH', false);
			this.$store.commit('LOGIN_TIP', false);
		}
	}
};
</script>

<style lang="scss" scoped>
// 登录提示
.modal-box {
	width: 100%;
	border-radius: var(--tt-radius-lg);
	background: #fff;
	position: relative;
	padding: 48rpx 36rpx 24rpx;
	box-sizing: border-box;
	text-align: center;

	.login-mark {
		width: 108rpx;
		height: 108rpx;
		margin: 0 auto 28rpx;
		border-radius: 50%;
		background: var(--tt-primary-soft);
		color: var(--tt-primary-strong);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48rpx;
	}

	.detail {
		.title1 {
			color: var(--tt-text);
			font-size: 35rpx;
			font-weight: bold;
		}

		.title2 {
			font-size: 28rpx;
			color: var(--tt-text-muted);
			padding-top: 20rpx;
		}
	}

	.btn-box {
		margin-top: 48rpx;

		.login-btn {
			width: 492rpx;
			height: 70rpx;
			background: var(--tt-primary);
			box-shadow: 0 8rpx 18rpx rgba(143, 152, 30, 0.2);
			border-radius: 35rpx;
			font-size: 28rpx;
			color: rgba(#fff, 0.9);
		}

		.close-btn {
			width: 492rpx;
			height: 70rpx;
			color: var(--tt-primary-strong);
			font-size: 26rpx;
			margin-top: 20rpx;
			background: none;
		}
	}
}

// 小程序登录提醒
/* #ifdef MP-WEIXIN */
.force-login-wrap {
	position: relative;
	width: 100%;
	min-height: 720rpx;
	overflow: hidden;
	border-radius: var(--tt-radius-lg);
	background: linear-gradient(180deg, var(--tt-primary-soft) 0%, #fff 42%);
	.force-login__content {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		.user-avatar {
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			overflow: hidden;
			margin-bottom: 40rpx;
			background: var(--tt-primary-soft);
			color: var(--tt-primary-strong);
			font-size: 72rpx;
		}
		.login-notice {
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(200, 150, 61, 1);
			line-height: 44rpx;
			width: 400rpx;
			text-align: center;
			margin-bottom: 80rpx;
		}
		.author-btn {
			width: 630rpx;
			height: 80rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
			border-radius: 40rpx;
			font-size: 30rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(255, 255, 255, 1);
		}
		.close-btn {
			width: 630rpx;
			height: 80rpx;
			margin-top: 30rpx;
			border-radius: 40rpx;
			border: 2rpx solid rgba(233, 180, 97, 1);
			background: none;
			font-size: 30rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(233, 180, 97, 1);
		}
	}
}
/* #endif */
</style>

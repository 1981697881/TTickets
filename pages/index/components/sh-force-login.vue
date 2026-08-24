<template>
	<!-- #ifdef MP-WEIXIN -->
	<view v-if="forceOauth" class="force-login-wrap">
		<image class="logo-bg" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/logo_bg.png" mode="aspectFill"></image>
		<view class="force-login__content y-f">
			<open-data class="user-avatar" type="userAvatarUrl"></open-data>
			<open-data class="user-name" type="userNickName"></open-data>
			<view class="login-notice">登录后即可选座购票、查看订单与会员权益</view>
			<button class="cu-btn author-btn" :loading="logging" :disabled="logging" @tap="onAuthTap">授权并查看</button>
			<button class="cu-btn close-btn" @tap="closeAuth">暂不授权</button>
		</view>
		<app-login-debug-modal />
	</view>
	<!-- #endif -->
</template>
<script>
import Wechat from '@/common/wechat/wechat';
import store from '@/common/store';
import { mapActions, mapState } from 'vuex';
import { handleLoginFailure } from '@/common/utils/auth.js';
export default {
	data() {
		return { logging: false };
	},
	computed: {
		...mapState({
			forceOauth: state => state.user.forceOauth
		})
	},
	methods: {
		...mapActions(['setTokenAndBack']),
		async onAuthTap() {
			if (this.logging) return;
			this.logging = true;
			try {
				var wechat = new Wechat();
				let token = await wechat.loginOnUserTap();
				store.commit('FORCE_OAUTH', false);
				store.commit('LOGIN_TIP', false);
				await this.setTokenAndBack(token);
			} catch (error) {
				await handleLoginFailure(error);
			} finally {
				this.logging = false;
			}
		},
		closeAuth() {
			store.commit('FORCE_OAUTH', false);
		}
	}
};
</script>

<style lang="scss">
.force-login-wrap {
	position: fixed;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	z-index: 11111;
	top: 0;
	background: linear-gradient(180deg, rgba(239, 196, 128, 1) 0%, rgba(248, 220, 165, 1) 25%, rgba(255, 255, 255, 1) 98%);
	.logo-bg {
		width: 640rpx;
		height: 300rpx;
	}
	.force-login__content {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 630rpx;
		.user-avatar {
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			overflow: hidden;
			margin-bottom: 40rpx;
		}
		.user-name {
			font-size: 35rpx;
			font-family: PingFang SC;
			font-weight: bold;
			color: rgba(132, 87, 8, 1);
			margin-bottom: 30rpx;
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
		.author-btn,
		.close-btn {
			width: 630rpx;
			height: 80rpx;
			border-radius: 40rpx;
			font-size: 30rpx;
			font-family: PingFang SC;
			font-weight: 500;
			box-sizing: border-box;
		}
		.author-btn {
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
			color: rgba(255, 255, 255, 1);
		}
		.author-btn::after {
			border: none;
		}
		.close-btn {
			margin-top: 30rpx;
			border: 2rpx solid rgba(233, 180, 97, 1);
			background: none;
			color: rgba(233, 180, 97, 1);
		}
		.close-btn::after {
			border: none;
		}
	}
}
</style>

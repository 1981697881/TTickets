<template>
	<view class="user-profile">
		<view class="user-head x-bc">
			<view class="user-identity x-f" @tap="jump('/pages/user/info')">
				<view class="head-img-wrap">
					<image class="head-img" :src="userInfo.avatarUrl || '/static/imgs/base_avatar.png'" mode="aspectFill"></image>
				</view>
				<view class="identity-copy">
					<text class="user-name one-t">{{ userInfo.username || '请登录' }}</text>
					<text class="user-hint" v-if="!userInfo.username">登录后查看账户与订单</text>
				</view>
			</view>
			<button class="code-btn x-c" v-if="balInfo && balInfo.custId" @tap.stop="jump('/pages/user/personal')" aria-label="打开我的二维码">
				<text class="cuIcon-qr_code"></text>
			</button>
		</view>
		<view class="notice-box x-bc" v-if="!userInfo.phoneNumber && userInfo.username">
			<view class="notice-copy x-f">
				<text class="cuIcon-safe notice-icon"></text>
				<text class="notice-detail one-t">绑定手机号，保障账户安全</text>
			</view>
			<app-wx-privacy-button
				mode="phone"
				inline
				btn-class="bind-phone"
				action-text="去绑定"
				@getphonenumber="bindPhone"
			/>
		</view>
	</view>
</template>

<script>
import { mapActions, mapState } from 'vuex';
export default {
	components: {},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo,
			balInfo: state => state.user.balInfo || {}
		})
	},
	props: {
		detail: {
			type: Object,
			default: () => ({})
		}
	},
	methods: {
		...mapActions(['getUserDetails']),
		jump(path, query) {
			this.$Router.push({
				path: path,
				query: query
			});
		},
		bindPhone(e) {
			if (!e.detail || !e.detail.encryptedData) return;
			this.$api('user.getWxMiniPhoneNumber', {
				sessionKey: uni.getStorageSync('session_key'),
				openid: uni.getStorageSync('openid'),
				encryptedData: e.detail.encryptedData,
				iv: e.detail.iv
			}).then(res => {
				if (res.flag) {
					this.getUserDetails();
				}
			});
		}
	}
};
</script>

<style lang="scss">
.user-profile { background: #fff; }

.user-head {
	min-height: 176rpx;
	padding: 20rpx 38rpx 30rpx;
	.user-identity { min-width: 0; flex: 1; }
	.head-img-wrap {
		width: 112rpx;
		height: 112rpx;
		padding: 5rpx;
		box-sizing: border-box;
		border: 2rpx solid rgba(169, 178, 56, 0.45);
		border-radius: 50%;
		background: #fff;
		margin-right: 26rpx;
	}
	.head-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: var(--tt-primary-soft);
	}
	.identity-copy { min-width: 0; }
	.user-name {
		display: block;
		max-width: 360rpx;
		font-size: 38rpx;
		font-weight: 700;
		line-height: 52rpx;
		color: var(--tt-text);
	}
	.user-hint {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		line-height: 32rpx;
		color: var(--tt-text-muted);
	}
	.code-btn {
		width: 72rpx;
		height: 72rpx;
		padding: 0;
		margin: 0;
		border: 0;
		border-radius: 50%;
		background: var(--tt-primary-soft);
		&::after { border: 0; }
		.cuIcon-qr_code { font-size: 40rpx; color: var(--tt-primary-strong); }
	}
}

.notice-box {
	min-height: 82rpx;
	margin: 0 30rpx 20rpx;
	padding: 0 22rpx 0 24rpx;
	box-sizing: border-box;
	background: #fbfcf4;
	border: 1rpx solid #e4e7c9;
	border-radius: var(--tt-radius-md);
	.notice-copy { min-width: 0; flex: 1; }
	.notice-icon { margin-right: 14rpx; font-size: 30rpx; color: var(--tt-primary-strong); }
	.notice-detail {
		font-size: 24rpx;
		line-height: 34rpx;
		color: var(--tt-text-secondary);
	}
	.bind-phone {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 110rpx;
		height: 56rpx;
		margin: 0 0 0 16rpx;
		padding: 0 18rpx;
		border: 0;
		background: transparent;
		font-size: 26rpx;
		font-weight: 600;
		color: var(--tt-primary-strong);
		&::after { border: 0; }
	}
}
</style>

<template>
	<!-- 钱包卡片 -->
	<view class="sh-wallet-box">
		<view class="wallet-item y-f" @tap="jump('/pages/user/wallet/index')">
				<text class="wallet-item__detail item-balance">{{ balInfo.Money || '0.00' }}</text>
				<text class="wallet-item__title">余额</text>
		</view>
		<view class="wallet-item y-f" @tap="jump('/pages/user/wallet/index')">
				<text class="wallet-item__detail item-score">{{ balInfo.Coins || '0' }}</text>
				<text class="wallet-item__title">游戏币</text>
		</view>
		<view class="wallet-item y-f" @tap="jump('/pages/user/wallet/index')">
				<text class="wallet-item__detail item-coupon">{{ balInfo.Tickets || '0' }}</text>
				<text class="wallet-item__title">彩票</text>
		</view>
		<view class="wallet-item y-f" @tap="jump('/pages/app/coupon/list')">
				<text class="wallet-item__detail item-coupon">{{ userInfo.couponCount || '0' }}</text>
				<text class="wallet-item__title">优惠券</text>
		</view>
	</view>
</template>

<script>
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	components: {},
	data() {
		return {
			platform: uni.getStorageSync('platform') //当前平台。
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo,
			balInfo: state => state.user.balInfo || {}
		})
	},
	methods: {
		jump(path, query) {
			this.$Router.push({
				path: path,
				query: query
			});
		}
	}
};
</script>

<style lang="scss">
// 钱包卡片
.sh-wallet-box {
	display: flex;
	background: #fff;
	min-height: 168rpx;
	position: relative;
	margin: 0 30rpx 42rpx;
	border: 1rpx solid var(--tt-border);
	border-radius: var(--tt-radius-lg);
	box-shadow: 0 8rpx 24rpx rgba(23, 24, 18, 0.035);
	.wallet-item {
		flex: 1;
		position: relative;
		min-width: 0;
		padding: 30rpx 4rpx 26rpx;
		box-sizing: border-box;
		&:not(:last-child)::after {
			content: '';
			position: absolute;
			top: 42rpx;
			right: 0;
			width: 1rpx;
			height: 78rpx;
			background: var(--tt-border);
		}
		.wallet-item__detail {
			max-width: 100%;
			font-size: 32rpx;
			font-weight: 700;
			line-height: 44rpx;
			color: var(--tt-primary-strong);
		}
		.wallet-item__title {
			font-size: 22rpx;
			font-weight: 400;
			line-height: 32rpx;
			color: var(--tt-text-secondary);
			margin-top: 8rpx;
		}
	}
}
</style>

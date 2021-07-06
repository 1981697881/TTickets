<template>
	<!-- 钱包卡片 -->
	<view class="sh-wallet-box x-f mb10">
		<view class="x-f wallet-left">
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
		<view class="wallet-item y-f wallet-right" @tap="jump('/pages/user/wallet/index')">
			<image class="cut-off--line" src="/static/imgs/user/cut_off_line.png" mode=""></image>
			<image class="wallet-img" src="/static/imgs/user/wallet.png" mode="aspectFill"></image>
			<text class="wallet-item__title">我的钱包</text>
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
			balInfo: state => state.user.balInfo
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
	background: #fff;
	height: 180rpx;
	position: relative;
	.wallet-left {
		flex: 4;
	}
	.wallet-right {
		position: relative;
		.cut-off--line {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			right: (750rpx/5) - 15rpx;
			width: 30rpx;
			height: 136rpx;
		}
	}
	.wallet-item {
		flex: 1;
		.wallet-img {
			width: 46rpx;
			height: 46rpx;
		}
		.wallet-item__detail {
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(168, 112, 13, 1);
		}
		.wallet-item__title {
			font-size: 24rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(153, 153, 153, 1);
			margin-top: 20rpx;
		}
		.item-balance::after {
			content: '元';
			font-size: 16rpx;
			margin-left: 4rpx;
		}
		.item-score::after {
			content: '个';
			font-size: 14rpx;
			margin-left: 4rpx;
		}
		.item-coupon::after {
			content: '张';
			font-size: 16rpx;
			margin-left: 4rpx;
		}
	}
}
</style>

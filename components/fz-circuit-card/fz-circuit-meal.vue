<template>
	<view v-if="detail" class="coin-package">
		<view class="coin-media">
			<image class="coin-image" src="/static/imgs/user/menu/arcade-coins.jpg" mode="aspectFit"></image>
		</view>
		<view class="coin-content">
			<text class="coin-name">{{ detail.goodsName }}</text>
			<text v-if="detail.goodsDescribe" class="coin-description">{{ detail.goodsDescribe }}</text>
			<view class="coin-footer">
				<view class="coin-price">
					<text class="currency">¥</text>
					<text>{{ detail.goodsPrice }}</text>
				</view>
				<view class="buy-button">购买</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'FzCircuitMeal',
	props: {
		detail: {
			type: Object,
			default: () => ({})
		},
		isTag: {
			type: [Boolean, String],
			default: false
		},
		tabId: {
			type: [String, Number],
			default: ''
		},
		colorItem: {
			type: String,
			default: ''
		}
	}
};
</script>

<style scoped lang="scss">
.coin-package {
	display: flex;
	align-items: stretch;
	gap: 24rpx;
	padding: 28rpx 0;
	background: #fff;
	border-bottom: 1rpx solid var(--tt-border);
}

.coin-media {
	width: 184rpx;
	height: 184rpx;
	flex: 0 0 184rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f7f1;
	border-radius: 24rpx;
	overflow: hidden;
}

.coin-image {
	width: 142rpx;
	height: 142rpx;
}

.coin-content {
	min-width: 0;
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 6rpx 0 2rpx;
}

.coin-name {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 44rpx;
	color: var(--tt-text);
}

.coin-description {
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: var(--tt-text-muted);
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.coin-footer {
	margin-top: auto;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 18rpx;
}

.coin-price {
	font-size: 42rpx;
	font-weight: 750;
	line-height: 52rpx;
	color: #ec6b20;
	white-space: nowrap;

	.currency {
		margin-right: 4rpx;
		font-size: 25rpx;
		font-weight: 650;
	}
}

.buy-button {
	min-width: 116rpx;
	height: 64rpx;
	padding: 0 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--tt-primary);
	border-radius: 999rpx;
	font-size: 26rpx;
	font-weight: 650;
	color: #fff;
	box-sizing: border-box;
}
</style>

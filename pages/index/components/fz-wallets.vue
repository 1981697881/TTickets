<template>
	<view class="order-card" @tap="openDetail">
		<view class="order-card__main">
			<view class="order-card__media" :class="`order-card__media--${imageVariant}`">
				<image v-if="img" class="order-card__image" :src="img" mode="aspectFill"></image>
				<view v-else class="order-card__placeholder x-c"><text class="cuIcon-pic"></text></view>
			</view>
			<view class="order-card__content">
				<text class="order-card__title one-t">{{ title || '未命名订单' }}</text>
				<text v-if="subtitle" class="order-card__subtitle one-t">{{ subtitle }}</text>
				<text v-if="date" class="order-card__date">{{ date }}</text>
			</view>
		</view>

		<view class="order-card__summary x-bc">
			<view class="order-card__quantity">
				<text class="order-card__label">数量</text>
				<text class="order-card__value">{{ quantity || 0 }} {{ quantityUnit }}</text>
			</view>
			<view class="order-card__amount">
				<text class="order-card__label">实付</text>
				<text class="order-card__price">￥{{ displayPrice }}</text>
			</view>
		</view>

		<button class="order-card__action" @tap.stop="openDetail">{{ actionText }}</button>
	</view>
</template>

<script>
export default {
	name: 'WalletCard',
	props: {
		img: { type: String, default: '' },
		title: { type: String, default: '' },
		subtitle: { type: String, default: '' },
		date: { type: String, default: '' },
		price: { type: [String, Number], default: '' },
		quantity: { type: [String, Number], default: 0 },
		quantityUnit: { type: String, default: '' },
		actionText: { type: String, default: '' },
		imageVariant: { type: String, default: 'poster' },
		detailPath: { type: String, default: '' },
		detailQuery: { type: Object, default: () => ({}) }
	},
	computed: {
		displayPrice() {
			return this.price === '' || this.price === null || this.price === undefined ? '0.00' : this.price;
		}
	},
	methods: {
		openDetail() {
			if (!this.detailPath) return;
			this.$Router.push({ path: this.detailPath, query: this.detailQuery });
		}
	}
};
</script>

<style scoped lang="scss">
.order-card {
	margin: 24rpx 30rpx;
	padding: 24rpx;
	box-sizing: border-box;
	background: var(--tt-surface);
	border: 1rpx solid var(--tt-border);
	border-radius: var(--tt-radius-lg);
	box-shadow: 0 8rpx 24rpx rgba(23, 24, 18, 0.035);
}

.order-card__main {
	display: flex;
	min-width: 0;
}

.order-card__media {
	flex: 0 0 170rpx;
	width: 170rpx;
	height: 220rpx;
	margin-right: 26rpx;
	overflow: hidden;
	border-radius: var(--tt-radius-md);
	background: var(--tt-primary-soft);
}

.order-card__media--product {
	flex-basis: 190rpx;
	width: 190rpx;
	height: 190rpx;
}

.order-card__image,
.order-card__placeholder {
	width: 100%;
	height: 100%;
}

.order-card__placeholder {
	font-size: 48rpx;
	color: var(--tt-primary-strong);
}

.order-card__content {
	display: flex;
	flex: 1;
	min-width: 0;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
}

.order-card__title {
	display: block;
	width: 100%;
	font-size: 32rpx;
	font-weight: 700;
	line-height: 46rpx;
	color: var(--tt-text);
}

.order-card__subtitle,
.order-card__date {
	display: block;
	width: 100%;
	margin-top: 16rpx;
	font-size: 25rpx;
	line-height: 36rpx;
	color: var(--tt-text-secondary);
}

.order-card__date { color: var(--tt-text-muted); }

.order-card__summary {
	min-height: 90rpx;
	margin-top: 24rpx;
	padding-top: 20rpx;
	border-top: 1rpx dashed var(--tt-border);
}

.order-card__quantity,
.order-card__amount {
	display: flex;
	align-items: baseline;
	min-width: 0;
}

.order-card__label {
	margin-right: 12rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: var(--tt-text-secondary);
}

.order-card__value {
	font-size: 27rpx;
	font-weight: 600;
	line-height: 38rpx;
	color: var(--tt-text);
}

.order-card__price {
	font-size: 34rpx;
	font-weight: 700;
	line-height: 44rpx;
	color: var(--tt-primary-strong);
}

.order-card__action {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 80rpx;
	min-height: 80rpx;
	margin: 4rpx 0 0;
	padding: 0 24rpx;
	border: 0;
	border-radius: var(--tt-radius-md);
	background: var(--tt-primary);
	font-size: 28rpx;
	font-weight: 700;
	line-height: 80rpx;
	color: #fff;
	&::after { border: 0; }
}

@media (max-width: 340px) {
	.order-card { margin-right: 22rpx; margin-left: 22rpx; padding: 20rpx; }
	.order-card__media { flex-basis: 142rpx; width: 142rpx; height: 190rpx; margin-right: 20rpx; }
	.order-card__media--product { flex-basis: 156rpx; width: 156rpx; height: 156rpx; }
	.order-card__title { font-size: 29rpx; }
	.order-card__subtitle,
	.order-card__date { margin-top: 10rpx; font-size: 23rpx; }
}
</style>

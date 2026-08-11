<template>
	<view class="activity-card" v-if="activity" @tap="routerTo(activity.posterUrl)">
		<image class="spread-image" :src="activityImage" mode="aspectFill" lazy-load></image>
		<view class="activity-card__body">
			<view class="activity-card__copy">
				<text class="activity-card__title one-t">{{ activity.posterName }}</text>
				<text v-if="activity.posterContent" class="activity-card__summary one-t">{{ activity.posterContent }}</text>
			</view>
			<view class="activity-card__status">正在进行</view>
		</view>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			routerTo: this.$tools.routerTo
		};
	},
	props: {
		detail: {
			type: Object,
			default: () => ({ list: [] })
		}
	},
	computed: {
		activity() {
			return this.detail.list && this.detail.list.length ? this.detail.list[0] : null;
		},
		activityImage() {
			const path = this.activity && this.activity.posterPhoto ? this.activity.posterPhoto : '';
			return /^https?:\/\//.test(path) ? path : 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/' + path;
		}
	},
	created() {},
	methods: {
		
	}
};
</script>

<style lang="scss">
.activity-card {
	background: #fff;
	margin: 0 30rpx 28rpx;
	border: 1rpx solid var(--tt-border);
	border-radius: 24rpx;
	box-shadow: 0 12rpx 32rpx rgba(25, 27, 18, 0.06);
	overflow: hidden;
}
.spread-image {
	display: block;
	width: 100%;
	height: 330rpx;
	background: var(--tt-primary-soft);
}
.activity-card__body {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24rpx;
	min-height: 138rpx;
	padding: 24rpx 26rpx;
}
.activity-card__copy { flex: 1; min-width: 0; }
.activity-card__title {
	display: block;
	font-size: 31rpx;
	font-weight: 700;
	line-height: 44rpx;
	color: var(--tt-text);
}
.activity-card__summary {
	display: block;
	margin-top: 8rpx;
	font-size: 23rpx;
	line-height: 34rpx;
	color: var(--tt-text-muted);
}
.activity-card__status {
	flex: 0 0 auto;
	padding: 13rpx 22rpx;
	border-radius: 30rpx;
	background: var(--tt-primary);
	font-size: 22rpx;
	line-height: 28rpx;
	color: #fff;
}
</style>

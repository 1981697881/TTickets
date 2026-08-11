<template>
	<view v-if="detail" class="machine-card" @tap="openDetail">
		<image class="machine-photo" :src="imageUrl" mode="aspectFill" lazy-load></image>
		<view class="machine-footer">
			<text class="machine-name">{{ detail.playName }}</text>
			<view class="detail-action">
				<text>查看详情</text>
				<text class="cuIcon-right"></text>
			</view>
		</view>
	</view>
</template>

<script>
const IMAGE_BASE_URL = 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/';

export default {
	name: 'FzImageCard',
	props: {
		detail: {
			type: Object,
			default: () => ({})
		},
		tabId: {
			type: [String, Number],
			default: ''
		},
		isTag: {
			type: [Boolean, String],
			default: false
		}
	},
	computed: {
		imageUrl() {
			const image = this.detail.playPhoto;
			if (!image) return '';
			return /^https?:\/\//.test(image) ? image : `${IMAGE_BASE_URL}${image}`;
		}
	},
	methods: {
		openDetail() {
			this.$Router.push({
				path: '/pages/cinema/machine/detail',
				query: { playId: this.detail.playId }
			});
		}
	}
};
</script>

<style scoped lang="scss">
.machine-card {
	width: 100%;
	padding: 26rpx 0 30rpx;
	background: #fff;
	border-bottom: 1rpx solid var(--tt-border);
}

.machine-photo {
	width: 100%;
	height: 380rpx;
	display: block;
	background: #f1f2ed;
	border-radius: 26rpx;
}

.machine-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24rpx;
	padding: 22rpx 10rpx 0;
}

.machine-name {
	min-width: 0;
	flex: 1;
	font-size: 34rpx;
	font-weight: 720;
	line-height: 48rpx;
	color: var(--tt-text);
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.detail-action {
	height: 64rpx;
	padding: 0 22rpx 0 26rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
	background: var(--tt-primary);
	border-radius: 999rpx;
	font-size: 25rpx;
	font-weight: 650;
	color: #fff;
	box-sizing: border-box;

	.cuIcon-right {
		font-size: 23rpx;
	}
}
</style>

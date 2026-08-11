<template>
	<view class="page_box machine-detail-page">
		<view v-if="isLoading" class="loading-box">
			<app-skeletons type="detail"></app-skeletons>
		</view>

		<scroll-view v-else-if="goodsInfo.playId" class="detail-scroll" scroll-y enable-back-to-top>
			<view class="detail-content">
				<view class="machine-gallery">
					<swiper v-if="imageUrls.length" class="gallery-swiper" circular @change="swiperChange">
						<swiper-item v-for="(img, index) in imageUrls" :key="`${img}-${index}`">
							<image class="gallery-image" :src="img" mode="aspectFill" lazy-load></image>
						</swiper-item>
					</swiper>
					<view v-else class="gallery-placeholder">
						<image src="/static/tabbar/game-active.png" mode="aspectFit"></image>
					</view>
					<view v-if="imageUrls.length" class="image-counter">{{ swiperCurrent + 1 }} / {{ imageUrls.length }}</view>
				</view>

				<text class="machine-name">{{ goodsInfo.playName }}</text>

				<view class="intro-heading">
					<view class="section-mark"></view>
					<text>机台简介</text>
				</view>
				<view class="rich-content">
					<uni-parser :html="goodsInfo.playTxt || '暂无机台介绍'"></uni-parser>
				</view>
			</view>
		</scroll-view>

		<view v-else class="empty-state">
			<image class="empty-icon" src="/static/tabbar/game-active.png" mode="aspectFit"></image>
			<text class="empty-title">未找到机台信息</text>
			<button class="retry-button" @tap="getGoodsDetail">重新加载</button>
		</view>

		<app-login-modal></app-login-modal>
		<app-notice-modal></app-notice-modal>
	</view>
</template>

<script>
const IMAGE_BASE_URL = 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/';

export default {
	data() {
		return {
			playId: '',
			goodsInfo: {},
			swiperCurrent: 0,
			isLoading: true
		};
	},
	computed: {
		imageUrls() {
			const images = Array.isArray(this.goodsInfo.playPosterphotoList)
				? this.goodsInfo.playPosterphotoList.filter(Boolean)
				: [];
			if (!images.length && this.goodsInfo.playPosterphotos) images.push(this.goodsInfo.playPosterphotos);
			if (!images.length && this.goodsInfo.playPhoto) images.push(this.goodsInfo.playPhoto);
			return images.map(image => /^https?:\/\//.test(image) ? image : `${IMAGE_BASE_URL}${image}`);
		}
	},
	onLoad(options) {
		this.playId = options?.playId || this.$Route?.query?.playId || '';
		this.getGoodsDetail();
	},
	methods: {
		swiperChange(event) {
			this.swiperCurrent = event.detail.current;
		},
		async getGoodsDetail() {
			this.isLoading = true;
			try {
				const res = await this.$api('cinema.playMessage', { playId: this.playId });
				if (res?.flag || res?.code === 1) {
					this.goodsInfo = res.data || {};
				} else {
					this.goodsInfo = {};
					res?.msg && this.$tools.toast(res.msg);
				}
			} catch (error) {
				this.goodsInfo = {};
				console.warn('[arcade] failed to load machine detail', error);
			} finally {
				this.isLoading = false;
			}
		}
	}
};
</script>

<style lang="scss">
.machine-detail-page {
	background: #fff;
}

.detail-scroll {
	flex: 1;
	height: 100%;
}

.detail-content {
	padding: 24rpx 28rpx 56rpx;
	background: #fff;
}

.machine-gallery {
	width: 100%;
	height: 470rpx;
	position: relative;
	overflow: hidden;
	background: #f1f2ed;
	border-radius: 28rpx;
}

.gallery-swiper,
.gallery-image,
.gallery-placeholder {
	width: 100%;
	height: 100%;
}

.gallery-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;

	image {
		width: 120rpx;
		height: 120rpx;
		opacity: 0.55;
	}
}

.image-counter {
	position: absolute;
	right: 20rpx;
	bottom: 18rpx;
	height: 46rpx;
	padding: 0 18rpx;
	display: flex;
	align-items: center;
	background: rgba(23, 24, 18, 0.72);
	border-radius: 999rpx;
	font-size: 23rpx;
	color: #fff;
}

.machine-name {
	display: block;
	padding: 28rpx 2rpx 24rpx;
	font-size: 40rpx;
	font-weight: 760;
	line-height: 56rpx;
	color: var(--tt-text);
}

.intro-heading {
	display: flex;
	align-items: center;
	gap: 14rpx;
	padding: 8rpx 2rpx 18rpx;
	font-size: 31rpx;
	font-weight: 700;
	color: var(--tt-text);
}

.section-mark {
	width: 7rpx;
	height: 34rpx;
	background: var(--tt-primary);
	border-radius: 999rpx;
}

.rich-content {
	padding: 0 2rpx;
	font-size: 28rpx;
	line-height: 1.9;
	color: var(--tt-text-secondary);

	:deep(img) {
		max-width: 100%;
		height: auto;
		display: block;
		border-radius: 18rpx;
	}

	:deep(p) {
		margin: 0 0 18rpx;
		line-height: 1.9;
	}
}

.loading-box {
	flex: 1;
	background: #fff;
}

.empty-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #fff;
}

.empty-icon {
	width: 112rpx;
	height: 112rpx;
	opacity: 0.5;
}

.empty-title {
	margin-top: 22rpx;
	font-size: 28rpx;
	color: var(--tt-text-secondary);
}

.retry-button {
	min-width: 180rpx;
	height: 72rpx;
	margin-top: 26rpx;
	padding: 0 30rpx;
	background: var(--tt-primary);
	border-radius: 999rpx;
	font-size: 26rpx;
	font-weight: 650;
	line-height: 72rpx;
	color: #fff;
}
</style>

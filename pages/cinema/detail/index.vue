<template>
	<view class="page_box movie-detail-page">
		<view v-if="isLoading" class="loading-box">
			<app-skeletons type="detail"></app-skeletons>
		</view>

		<scroll-view v-else-if="goodsInfo.filmId" class="detail-scroll" scroll-y enable-back-to-top>
			<view class="detail-content">
				<view class="movie-overview">
					<image class="movie-poster" :src="goodsInfo.filmPhoto" mode="aspectFill" lazy-load></image>
					<view class="overview-copy">
						<text class="movie-title">{{ goodsInfo.filmName }}</text>
						<view class="meta-list">
							<view v-if="goodsInfo.filmLong" class="meta-row">
								<text class="meta-label">时长</text>
								<text class="meta-value">{{ goodsInfo.filmLong }}分钟</text>
							</view>
							<view v-if="goodsInfo.filmSortid || goodsInfo.filmType" class="meta-row">
								<text class="meta-label">类型</text>
								<text class="meta-value">{{ goodsInfo.filmSortid || goodsInfo.filmType }}</text>
							</view>
							<view v-if="goodsInfo.filmDirector" class="meta-row">
								<text class="meta-label">导演</text>
								<text class="meta-value">{{ goodsInfo.filmDirector }}</text>
							</view>
							<view v-if="goodsInfo.dimensional" class="meta-row">
								<text class="meta-label">版本</text>
								<text class="meta-value">{{ goodsInfo.dimensional }}</text>
							</view>
						</view>
					</view>
				</view>

				<view v-if="goodsInfo.filmIntro" class="intro-section">
					<view class="section-heading">
						<view class="section-mark"></view>
						<text class="section-title">影片简介</text>
					</view>
					<mote-lines-divide
						class="intro-copy"
						:dt="goodsInfo.filmIntro"
						:line="5"
						expandText="展开"
						foldHint="收起"
					></mote-lines-divide>
				</view>

				<fz-detail-gallery :detail="goodsInfo" type="crew"></fz-detail-gallery>
				<fz-detail-gallery :detail="goodsInfo" type="still"></fz-detail-gallery>
			</view>
		</scroll-view>

		<view v-else class="error-state">
			<text class="error-title">影片信息暂不可用</text>
			<text class="error-caption">请稍后再试</text>
		</view>

		<view v-if="!isLoading && goodsInfo.filmId" class="detail-footer">
			<view class="home-action" @tap="goHome">
				<text class="cuIcon-home home-icon"></text>
				<text>电影首页</text>
			</view>
			<button v-if="!goodsInfo.activity" class="booking-button" @tap="openSchedules">立即订票</button>
		</view>

		<app-login-modal></app-login-modal>
		<app-notice-modal></app-notice-modal>
	</view>
</template>

<script>
import MoteLinesDivide from '@/components/mote-lines-divide/mote-lines-divide';
import fzDetailGallery from './children/fz-detail-gallery.vue';
import appSkeletons from '@/components/app-skeletons/app-skeletons.vue';

export default {
	components: {
		MoteLinesDivide,
		fzDetailGallery,
		appSkeletons
	},
	data() {
		return {
			filmId: '',
			goodsInfo: {},
			isLoading: true
		};
	},
	onLoad(options) {
		const routeQuery = this.$Route && this.$Route.query ? this.$Route.query : {};
		const query = options && Object.keys(options).length ? options : routeQuery;
		this.filmId = query.filmId || '';
		this.getMovieDetail();
	},
	onUnload() {
		if (this.filmId) uni.$emit('escUpload', { filmId: this.filmId });
	},
	methods: {
		goHome() {
			uni.switchTab({ url: '/pages/index/circuit' });
		},
		openSchedules() {
			if (!this.filmId) return;
			this.$Router.replace({ path: '/pages/cinema/index', query: { filmId: this.filmId } });
		},
		async getMovieDetail() {
			if (!this.filmId) {
				this.isLoading = false;
				return;
			}
			this.isLoading = true;
			try {
				const res = await this.$api('cinema.movieMessage', { filmId: this.filmId });
				if (res && (res.flag || res.code === 1)) {
					this.goodsInfo = { ...(res.data || {}), filmId: (res.data && res.data.filmId) || this.filmId };
					if (typeof this.setShareInfo === 'function') {
						this.setShareInfo({
							query: { url: `goods-${this.filmId}` },
							title: this.goodsInfo.filmName,
							image: this.goodsInfo.filmPhoto
						});
					}
				} else {
					this.goodsInfo = {};
					res && res.msg && this.$tools.toast(res.msg);
				}
			} catch (error) {
				this.goodsInfo = {};
				console.warn('[cinema] failed to load movie detail', error);
			} finally {
				this.isLoading = false;
			}
		}
	}
};
</script>

<style lang="scss">
.movie-detail-page {
	height: 100vh;
	background: #fff;
}

.loading-box,
.error-state {
	height: 100%;
}

.detail-scroll {
	height: 100%;
}

.detail-content {
	padding: 28rpx 30rpx calc(154rpx + constant(safe-area-inset-bottom));
	padding: 28rpx 30rpx calc(154rpx + env(safe-area-inset-bottom));
	background: #fff;
}

.movie-overview {
	display: flex;
	align-items: flex-start;
	gap: 32rpx;
}

.movie-poster {
	width: 250rpx;
	height: 350rpx;
	flex: 0 0 250rpx;
	display: block;
	border-radius: 20rpx;
	background: var(--tt-bg);
}

.overview-copy {
	min-width: 0;
	flex: 1;
	padding-top: 14rpx;
}

.movie-title {
	display: block;
	font-size: 40rpx;
	font-weight: 760;
	line-height: 54rpx;
	color: var(--tt-text);
}

.meta-list {
	margin-top: 30rpx;
}

.meta-row {
	display: flex;
	align-items: flex-start;
	gap: 18rpx;
	margin-top: 14rpx;
	font-size: 23rpx;
	line-height: 34rpx;
}

.meta-label {
	flex: 0 0 54rpx;
	color: var(--tt-text-muted);
}

.meta-value {
	min-width: 0;
	flex: 1;
	color: var(--tt-text-secondary);
}

.intro-section {
	padding-top: 42rpx;
}

.section-heading {
	display: flex;
	align-items: center;
	gap: 13rpx;
	margin-bottom: 20rpx;
}

.section-mark {
	width: 7rpx;
	height: 32rpx;
	border-radius: 6rpx;
	background: var(--tt-primary);
}

.section-title {
	font-size: 32rpx;
	font-weight: 720;
	line-height: 44rpx;
	color: var(--tt-text);
}

.intro-copy {
	font-size: 26rpx;
	line-height: 46rpx;
	color: var(--tt-text-secondary);
}

.intro-copy :deep(.content) {
	font-size: 26rpx;
	line-height: 46rpx;
	color: var(--tt-text-secondary);
}

.intro-copy :deep(.text-cyan) {
	color: var(--tt-primary-strong);
}

.detail-footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 80;
	display: flex;
	align-items: center;
	gap: 26rpx;
	min-height: 112rpx;
	padding: 16rpx 30rpx calc(16rpx + constant(safe-area-inset-bottom));
	padding: 16rpx 30rpx calc(16rpx + env(safe-area-inset-bottom));
	box-sizing: content-box;
	background: #fff;
	border-top: 1rpx solid var(--tt-border);
}

.home-action {
	width: 112rpx;
	flex: 0 0 112rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	font-size: 21rpx;
	line-height: 30rpx;
	color: var(--tt-text-secondary);
}

.home-icon {
	margin-bottom: 4rpx;
	font-size: 38rpx;
	color: var(--tt-text);
}

.booking-button {
	height: 78rpx;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0;
	padding: 0;
	border: 0;
	border-radius: 39rpx;
	background: var(--tt-primary);
	color: #fff;
	font-size: 29rpx;
	font-weight: 700;
	line-height: 78rpx;
}

.booking-button::after {
	display: none;
}

.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-bottom: 160rpx;
}

.error-title {
	font-size: 30rpx;
	font-weight: 650;
	color: var(--tt-text-secondary);
}

.error-caption {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: var(--tt-text-muted);
}

@media screen and (max-width: 340px) {
	.movie-poster {
		width: 220rpx;
		height: 308rpx;
		flex-basis: 220rpx;
	}

	.movie-overview {
		gap: 24rpx;
	}

	.movie-title {
		font-size: 36rpx;
	}
}
</style>

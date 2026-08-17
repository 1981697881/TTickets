<template>
	<view class="movie-row" @tap="jump('/pages/cinema/detail/index', { filmId: detail.filmId })">
		<view class="poster-box">
			<slot name="tag"></slot>
			<image class="poster" :src="detail.filmPhoto" mode="aspectFill" lazy-load></image>
		</view>

		<view class="movie-content">
			<text class="movie-title">{{ detail.filmName || '未命名影片' }}</text>
			<view v-if="scoreText" class="movie-score">
				<text class="score-value">{{ scoreText }}</text>
				<text class="score-unit">分</text>
			</view>
			<text class="movie-meta one-t">导演：{{ safeText(detail.filmDirector) }}</text>
			<text class="movie-meta one-t">主演：{{ safeText(detail.filmPlay) }}</text>
			<text class="movie-meta one-t">类型：{{ safeText(detail.filmSortid || detail.filmType) }}</text>
		</view>

		<view class="action-box">
			<button
				class="buy-btn"
				@tap.stop="jump('/pages/cinema/index', { filmId: detail.filmId })"
			>购票</button>
		</view>
	</view>
</template>

<script>
export default {
	name: 'FzUnmovieList',
	props: {
		detail: {
			type: Object,
			default: () => ({})
		}
	},
	computed: {
		scoreText() {
			const score = this.detail.score || this.detail.filmScore || this.detail.grade;
			if (score === undefined || score === null || score === '') return '';
			const value = Number(score);
			return Number.isFinite(value) ? value.toFixed(1) : String(score);
		}
	},
	methods: {
		safeText(value) {
			return typeof value === 'string' && value.trim() ? value.trim() : '--';
		},
		jump(path, params) {
			this.$Router.push({ path, query: params });
		}
	}
};
</script>

<style lang="scss">
.movie-row {
	display: flex;
	align-items: stretch;
	width: 100%;
	min-height: 298rpx;
	padding: 20rpx 0 26rpx;
	box-sizing: border-box;
	border-bottom: 1rpx solid var(--tt-border);
	background: #fff;
}

.poster-box {
	position: relative;
	flex: 0 0 180rpx;
	width: 180rpx;
	height: 252rpx;
	overflow: hidden;
	border-radius: 18rpx;
	background: var(--tt-bg);
}

.poster {
	width: 100%;
	height: 100%;
}

.movie-content {
	display: flex;
	flex: 1;
	min-width: 0;
	flex-direction: column;
	align-items: flex-start;
	padding: 4rpx 14rpx 0 28rpx;
}

.movie-title {
	display: block;
	max-width: 100%;
	font-size: 31rpx;
	line-height: 44rpx;
	font-weight: 700;
	color: var(--tt-text);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.movie-score {
	display: flex;
	align-items: baseline;
	height: 42rpx;
	margin: 12rpx 0 10rpx;
	color: var(--tt-primary-strong);
}

.score-value {
	font-size: 31rpx;
	line-height: 42rpx;
	font-weight: 600;
}

.score-unit {
	margin-left: 2rpx;
	font-size: 21rpx;
}

.movie-meta {
	display: block;
	max-width: 100%;
	font-size: 22rpx;
	line-height: 36rpx;
	color: var(--tt-text-muted);
}

.action-box {
	display: flex;
	flex: 0 0 104rpx;
	align-items: center;
	justify-content: flex-end;
}

.buy-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 104rpx;
	height: 58rpx;
	padding: 0;
	border: 0;
	border-radius: 30rpx;
	background: var(--tt-primary);
	color: #fff;
	font-size: 24rpx;
	line-height: 58rpx;
	font-weight: 600;

	&::after {
		display: none;
	}
}

@media screen and (max-width: 340px) {
	.movie-content {
		padding-left: 20rpx;
		padding-right: 8rpx;
	}

	.action-box {
		flex-basis: 94rpx;
	}

	.buy-btn {
		width: 94rpx;
	}
}
</style>

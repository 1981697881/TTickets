<template>
	<view class="page_box schedule-page">
		<app-safe-popup :model-value="modalName === 'RadioModal'" max-width="640rpx" @close="hideModal">
			<view class="phone-dialog">
				<text class="phone-dialog-title">联系客服</text>
				<view
					v-for="(phone, index) in servicePhones"
					:key="phone"
					class="phone-row"
					@tap="callPhone(phone)"
				>
					<text>客服电话 {{ index + 1 }}</text>
					<text class="phone-number">{{ phone }}</text>
				</view>
				<view v-if="!servicePhones.length" class="phone-empty">暂无客服电话</view>
			</view>
		</app-safe-popup>

		<view class="head_box">
			<view class="ci-header">
				<view class="header-info">
					<view class="cinema-title">{{ cinemaName || storeInfo.storeName || '影院信息加载中' }}</view>
					<view class="info-local">
						<view class="local-adr text-cut">{{ cinemaAddress || storeInfo.storeAddress || '正在获取影院地址' }}</view>
					</view>
				</view>
				<view class="locate-logo" @tap="showModal">
					<text class="cuIcon-service locate-icon"></text>
					<view>影院客服</view>
				</view>
			</view>

			<view class="backgroud" :style="backdropStyle"></view>

			<swiper
				v-if="swiperList.length"
				class="card-swiper"
				:current="activeItem"
				previous-margin="210rpx"
				next-margin="210rpx"
				:circular="false"
				:duration="300"
				@change="onCardSwiper"
				@animationfinish="onCardSwiperSettled"
			>
				<swiper-item
					v-for="(item, cindex) in swiperList"
					:key="item.filmId || cindex"
					:class="{ cur: cardCur === cindex }"
					@tap.stop="onClickSwiper(cindex)"
				>
					<view class="swiper-item">
						<view class="tag text-white" v-if="item.dimensional">{{ item.dimensional }}</view>
						<image
							class="swi-image"
							:src="getMoviePoster(item, cindex)"
							mode="aspectFill"
							lazy-load
							@error="markPosterFailed(item, cindex)"
						></image>
					</view>
				</swiper-item>
			</swiper>

			<view v-else class="movie-loading-placeholder">
				<image class="movie-loading-image" src="https://cfzx.gzfzdev.com/imgs/logo/logo.gif" mode="aspectFit"></image>
				<text>{{ isPageLoading ? '影片加载中...' : '暂无可售影片' }}</text>
			</view>

			<view v-if="swiperList.length" class="movie-info" @tap="openMovieDetail">
				<view class="info-name">{{ cardInfo.filmName || '影片信息' }}</view>
				<view class="info-detail">
					{{ movieMeta }}
					<text class="cuIcon-right"></text>
				</view>
			</view>

			<sh-date v-if="swiperList.length" ref="shDate" :movieDates="movieDates" @subClickFtn="selectDate"></sh-date>
			<view v-else class="date-loading-placeholder"></view>
		</view>

		<scroll-view
			class="scroll-box"
			:style="{ height: headHeight + 'px' }"
			scroll-y
			enable-back-to-top
			scroll-with-animation
			@scrolltolower="loadMore"
		>
			<view class="content-box">
				<view class="goods-list">
					<fz-circuit-minicard
						v-for="session in goodsList"
						:key="session.scheduleId || session.id"
						:detail="session"
						:isTag="true"
					></fz-circuit-minicard>
				</view>
				<app-empty v-if="!goodsList.length && !isLoading && !isPageLoading" :isFixed="false" :emptyData="emptyData"></app-empty>
				<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
				<view v-if="isLoading && !goodsList.length" class="schedule-loading">
					<image class="schedule-loading-image" src="https://cfzx.gzfzdev.com/imgs/common/loading.gif" mode="aspectFit"></image>
					<text>场次加载中...</text>
				</view>
			</view>
		</scroll-view>

		<app-login-modal></app-login-modal>
		<app-notice-modal></app-notice-modal>
	</view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import shDate from './children/sh-date.vue';
import FzCircuitMinicard from '@/components/fz-circuit-card/fz-circuit-minicard.vue';
import appEmpty from '@/components/app-empty/app-empty.vue';
import { normalizePage, mergeUnique, createRequestGate } from '@/common/utils/pagination';
import { getSystemInfoSafe } from '@/common/runtime/system-info';
import { createLoginRefreshMixin } from '@/common/mixins/login-refresh.js';

type MovieItem = {
	filmId?: string | number;
	filmName?: string;
	filmPhoto?: string;
	filmLong?: string | number;
	filmSortid?: string;
	filmDirector?: string;
	dimensional?: string;
	movieDates?: string[];
	[key: string]: unknown;
};

type ScheduleItem = {
	scheduleId?: string | number;
	id?: string | number;
	[key: string]: unknown;
};

export default defineComponent({
	name: 'CinemaSchedulePage',
	components: {
		shDate,
		FzCircuitMinicard,
		appEmpty
	},
	mixins: [createLoginRefreshMixin('onLoginRefresh')],
	data() {
		return {
			cardInfo: {} as MovieItem,
			img: '',
			cardCur: 0,
			activeItem: 0,
			cinemaName: '',
			cinemaAddress: '',
			cinemaList: [] as Record<string, unknown>[],
			modalName: null as string | null,
			swiperList: [] as MovieItem[],
			movieDates: [] as string[],
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '当前日期没有可观影场次，选择其他日期试试~'
			},
			headHeight: 0,
			goodsList: [] as ScheduleItem[],
			listParams: {
				filmId: null as string | number | null,
				cinemaId: null as string | number | null,
				cinemalinkId: null as string | number | null,
				keywords: '',
				showDatetime: '',
				page: 1
			},
			isLoading: false,
			isPageLoading: true,
			loadStatus: '',
			lastPage: 1,
			failedPosters: {} as Record<string, boolean>,
			pageVisible: false,
			pendingScheduleRefresh: false,
			scheduleRefreshTimer: 0 as number | ReturnType<typeof setTimeout>,
			seatExitEventBound: false,
			requestGate: createRequestGate()
		};
	},
	computed: {
		...mapState({
			storeInfo: (state: any) => state.user.storeInfo || {}
		}),
		servicePhones(): string[] {
			const list = (this as any).storeInfo?.customerServicePhoneList;
			return Array.isArray(list) ? list.filter(Boolean) : [];
		},
		movieMeta(): string {
			const info = this.cardInfo || {};
			return [
				info.filmLong ? `${info.filmLong}分钟` : '',
				info.filmSortid,
				info.filmDirector ? `导演：${info.filmDirector}` : ''
			].filter(Boolean).join(' | ');
		},
		backdropStyle(): string {
			if (!this.img) return '';
			return `background-image:url(${this.img})`;
		}
	},
	beforeUnmount() {
		this.requestGate.invalidate();
		if (this.scheduleRefreshTimer) clearTimeout(this.scheduleRefreshTimer as number);
		if (this.seatExitEventBound) {
			uni.$off('escUpload', this.onSeatPageExit);
			this.seatExitEventBound = false;
		}
	},
	mounted() {
		this.getScrHeight();
		if (!this.seatExitEventBound) {
			uni.$on('escUpload', this.onSeatPageExit);
			this.seatExitEventBound = true;
		}
	},
	onLoad(options: Record<string, any>) {
		const routeQuery = (this as any).$Route?.query || {};
		const query = options && Object.keys(options).length ? options : routeQuery;
		this.listParams.filmId = query.filmId || null;
		this.listParams.cinemaId = query.cinemaId || null;
		this.listParams.cinemalinkId = query.cinemalinkId || this.getStoredCinemaLinkId();
		this.listParams.keywords = query.keywords || '';
		this.getCinemaList();
	},
	onShow() {
		this.pageVisible = true;
		if (this.pendingScheduleRefresh) this.scheduleRefreshAfterTransition();
	},
	onHide() {
		this.pageVisible = false;
	},
	methods: {
		getStoredCinemaLinkId() {
			const store = (this as any).storeInfo || {};
			return store.cinemalinkId || store.cinemaLinkId || null;
		},
		shouldRefreshOnShow() {
			const hasToken = Boolean(uni.getStorageSync('token'));
			const hasLink = Boolean(this.listParams.cinemalinkId || this.getStoredCinemaLinkId());
			return hasToken && hasLink && !this.swiperList.length && !this.isLoading;
		},
		onLoginRefresh() {
			if (!this.listParams.cinemalinkId) {
				this.listParams.cinemalinkId = this.getStoredCinemaLinkId();
			}
			return this.getCinemaList();
		},
		getScrHeight() {
			getSystemInfoSafe({
				success: res => {
					// 头部约占用视口上半；与 0.5.5 sticky head + 下方滚动区一致
					this.headHeight = Math.max(280, (res.windowHeight || 667) - 360);
				}
			});
		},
		showModal() {
			this.modalName = 'RadioModal';
		},
		hideModal() {
			this.modalName = null;
		},
		callPhone(phone: string) {
			if (!phone) return;
			uni.makePhoneCall({ phoneNumber: String(phone) });
		},
		openMovieDetail() {
			if (!this.cardInfo.filmId) return;
			(this as any).$Router.push({
				path: '/pages/cinema/detail/index',
				query: { filmId: this.cardInfo.filmId }
			});
		},
		selectDate(value: { day: string }) {
			this.listParams.showDatetime = value.day;
			this.resetSessions();
			this.getGoodsList();
		},
		onCardSwiper(e: { detail: { current: number } }) {
			const index = e?.detail?.current ?? 0;
			if (!this.swiperList[index]) return;
			this.cardCur = index;
			this.activeItem = index;
		},
		onCardSwiperSettled(e: { detail: { current: number } }) {
			const index = e?.detail?.current ?? this.cardCur;
			const movie = this.swiperList[index];
			if (!movie) return;
			this.cardCur = index;
			this.activeItem = index;
			if (String(this.cardInfo?.filmId ?? '') === String(movie.filmId ?? '')) return;
			this.selectMovie(index);
		},
		onClickSwiper(index: number) {
			if (index === this.cardCur) {
				this.openMovieDetail();
				return;
			}
			// 只驱动 swiper；数据切换统一等 animationfinish，避免 change/current 互相回写导致横跳。
			this.activeItem = index;
		},
		selectMovie(index: number, shouldLoad = true) {
			const movie = this.swiperList[index];
			if (!movie) return;
			this.activeItem = index;
			this.cardCur = index;
			this.cardInfo = movie;
			this.img = this.getMoviePoster(movie, index);
			this.movieDates = Array.isArray(movie.movieDates) ? movie.movieDates : [];
			this.listParams.filmId = movie.filmId ?? null;
			this.listParams.showDatetime = this.movieDates[0] || '';
			this.resetSessions();
			this.$nextTick(() => {
				const dateRef = this.$refs.shDate as { getDateList?: () => void } | undefined;
				dateRef?.getDateList?.();
			});
			if (shouldLoad) this.getGoodsList();
		},
		getMoviePoster(movie: MovieItem, index: number) {
			const key = String(movie?.filmId ?? index);
			const origin = 'https://cfzx.gzfzdev.com';
			const fallback = `${origin}/movie/uploadFiles/image/zanwu.jpg`;
			if (this.failedPosters[key]) return fallback;
			const source = movie?.filmPhoto ? String(movie.filmPhoto) : '';
			if (!source) return fallback;
			if (/^https?:\/\//.test(source) || source.startsWith('data:') || source.startsWith('/static/')) return source;
			if (source.startsWith('//')) return `https:${source}`;
			if (source.startsWith('/')) return `${origin}${source}`;
			if (source.includes('/')) return `${origin}/${source}`;
			return `${origin}/movie/uploadFiles/image/${source}`;
		},
		markPosterFailed(movie: MovieItem, index: number) {
			const key = String(movie?.filmId ?? index);
			if (this.failedPosters[key]) return;
			this.failedPosters = { ...this.failedPosters, [key]: true };
		},
		resetSessions() {
			this.requestGate.invalidate();
			this.isLoading = false;
			this.listParams.page = 1;
			this.goodsList = [];
			this.lastPage = 1;
			this.loadStatus = '';
		},
		onSeatPageExit(data: { filmId?: string | number }) {
			if (!data?.filmId || String(data.filmId) !== String(this.listParams.filmId ?? '')) return;
			// 子页卸载发生在返回动画中，只记刷新意图，不在隐藏页立刻清空/重绘。
			this.pendingScheduleRefresh = true;
			if (this.pageVisible) this.scheduleRefreshAfterTransition();
		},
		scheduleRefreshAfterTransition() {
			if (this.scheduleRefreshTimer) clearTimeout(this.scheduleRefreshTimer as number);
			this.scheduleRefreshTimer = setTimeout(() => {
				this.scheduleRefreshTimer = 0;
				if (!this.pageVisible || !this.pendingScheduleRefresh) return;
				this.pendingScheduleRefresh = false;
				this.requestGate.invalidate();
				this.listParams.page = 1;
				// 保留现有场次到新数据返回，回退时不再白屏闪烁。
				this.getGoodsList({ silent: true });
			}, 180);
		},
		loadMore() {
			if (!this.isLoading && this.listParams.page < this.lastPage) {
				this.listParams.page += 1;
				this.getGoodsList();
			}
		},
		async getCinemaList() {
			this.isPageLoading = true;
			const requestedId = this.listParams.cinemalinkId || this.getStoredCinemaLinkId();
			try {
				const res = await (this as any).$api('cinema.locationList', {
					cinemalinkId: requestedId,
					filmId: this.listParams.filmId
				});
				const list = res && res.flag && Array.isArray(res.data) ? res.data : [];
				this.cinemaList = list;
				const cinema = list[0] || {};
				this.cinemaName = cinema.cinemaName || '';
				this.cinemaAddress = cinema.cinemaAddress || '';
				this.listParams.cinemalinkId = cinema.cinemalinkId || cinema.cinemaLinkId || requestedId;
			} catch (error) {
				console.warn('[cinema] failed to load unique cinema', error);
			}
			try {
				await this.getMoviesList();
			} finally {
				this.isPageLoading = false;
			}
		},
		async getMoviesList() {
			if (!this.listParams.cinemalinkId) return;
			try {
				const res = await (this as any).$api('cinema.locationMovies', {
					cinemalinkId: this.listParams.cinemalinkId
				});
				if (!res || !res.flag) return;
				this.swiperList = Array.isArray(res.data) ? res.data : normalizePage(res.data, 1).items;
				if (!this.swiperList.length) return;
				const requested = this.listParams.filmId;
				const index = requested
					? Math.max(0, this.swiperList.findIndex(item => String(item.filmId) === String(requested)))
					: 0;
				this.selectMovie(index, false);
				await this.getGoodsList();
			} catch (error) {
				console.warn('[cinema] failed to load cinema movies', error);
			}
		},
		async getGoodsList(options: { silent?: boolean } = {}) {
			if (!this.listParams.filmId || !this.listParams.cinemalinkId) return;
			const token = this.requestGate.begin();
			if (!token) return;
			this.isLoading = true;
			if (!options.silent) this.loadStatus = 'loading';
			const requestedPage = this.listParams.page;
			const requestedFilmId = this.listParams.filmId;
			const requestedDate = this.listParams.showDatetime;
			try {
				const res = await (this as any).$api('cinema.locationSchedules', { ...this.listParams });
				if (!this.requestGate.isLatest(token)) return;
				if (
					requestedFilmId !== this.listParams.filmId ||
					requestedDate !== this.listParams.showDatetime ||
					requestedPage !== this.listParams.page
				) {
					return;
				}
				if (res && res.flag) {
					const page = normalizePage(res.data, requestedPage);
					this.goodsList = requestedPage === 1
						? page.items
						: mergeUnique(this.goodsList, page.items, 'scheduleId', false);
					this.lastPage = page.lastPage;
					this.loadStatus = requestedPage < page.lastPage ? '' : 'over';
				}
			} catch (error) {
				if (this.requestGate.isLatest(token)) {
					this.loadStatus = '';
					console.warn('[cinema] failed to load schedules', error);
				}
			} finally {
				this.requestGate.end(token);
				if (this.requestGate.isLatest(token)) this.isLoading = false;
			}
		}
	}
});
</script>

<style lang="scss">
.schedule-page {
	min-height: 100vh;
	background: #fff;
}

.head_box {
	position: sticky;
	top: 0;
	z-index: 998;
	overflow: hidden;
	background: linear-gradient(#060210, #fff 20%);
}

.ci-header {
	display: flex;
	background: #fff;
	border-radius: 10rpx;
}

.header-info {
	width: 600rpx;
	padding: 20rpx;
}

.cinema-title {
	font-size: 36rpx;
	font-weight: 700;
	line-height: 50rpx;
	color: #1d2129;
}

.info-local {
	display: flex;
	padding: 8rpx 0;
}

.local-adr {
	width: 430rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #333;
}

.locate-logo {
	width: 150rpx;
	padding-top: 16rpx;
	border-radius: 0 10rpx 0 0;
	background: var(--tt-primary, #a9b238);
	color: #fff;
	text-align: center;
	font-size: 22rpx;
}

.locate-icon {
	display: block;
	margin: 0 auto 6rpx;
	font-size: 44rpx;
}

.backgroud {
	position: absolute;
	top: 160rpx;
	left: 0;
	width: 750rpx;
	height: 280rpx;
	background-repeat: no-repeat;
	background-position: 50% 50%;
	background-size: cover;
	opacity: 0.28;
	transform: scale(1.08);
	pointer-events: none;
}

.card-swiper {
	height: 280upx !important;
}

.card-swiper swiper-item,
.card-swiper uni-swiper-item {
	padding: 15rpx 0 30rpx !important;
	box-sizing: border-box;
}

.card-swiper .swiper-item {
	position: relative;
	width: 200rpx;
	height: 100%;
	overflow: hidden;
	margin: 0 auto;
	border-radius: 10rpx;
	transform: scale(0.9);
	transition: transform 0.2s ease;
}

.card-swiper .cur .swiper-item {
	transform: none;
}

.swi-image {
	width: 100%;
	height: 100%;
	display: block;
	border: 1px solid #acacac;
	border-radius: 10rpx;
}

.movie-loading-placeholder {
	height: 280rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	box-sizing: border-box;
	font-size: 23rpx;
	color: var(--tt-text-muted);
}

.movie-loading-image {
	width: 84rpx;
	height: 84rpx;
}

.date-loading-placeholder {
	height: 126rpx;
	box-sizing: border-box;
	border-top: 1rpx solid var(--tt-border);
	border-bottom: 1rpx solid var(--tt-border);
	background: #fff;
}

.tag {
	position: absolute;
	left: 10rpx;
	top: 10rpx;
	z-index: 22;
	width: 100rpx;
	height: 40rpx;
	padding: 0 10rpx;
	line-height: 40rpx;
	border-radius: 0 18rpx 18rpx 0;
	background: linear-gradient(132deg, #1c1c1c, #363636, #ecbe60);
	transform: scale(0.8);
	font-size: 20rpx;
	color: #fff;
}

.movie-info {
	width: 100%;
	height: 100rpx;
	text-align: center;
}

.info-name {
	font-size: 36rpx;
	font-weight: 700;
	line-height: 60rpx;
	color: #1d2129;
}

.info-detail {
	font-size: 24rpx;
	line-height: 34rpx;
	color: #888;
}

.scroll-box {
	width: 100%;
	background: #fff;
}

.content-box {
	padding: 0 24rpx calc(24rpx + constant(safe-area-inset-bottom));
	padding: 0 24rpx calc(24rpx + env(safe-area-inset-bottom));
}

.goods-list {
	width: 100%;
}

.schedule-loading {
	min-height: 220rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	font-size: 23rpx;
	color: var(--tt-text-muted);
}

.schedule-loading-image {
	width: 64rpx;
	height: 64rpx;
}

.phone-dialog {
	padding: 36rpx 32rpx 24rpx;
}

.phone-dialog-title {
	display: block;
	padding-bottom: 24rpx;
	font-size: 34rpx;
	font-weight: 720;
	color: #1d2129;
}

.phone-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 92rpx;
	border-top: 1rpx solid #eee;
	font-size: 26rpx;
	color: #555;
}

.phone-number {
	font-weight: 650;
	color: #8b4513;
}

.phone-empty {
	padding: 30rpx 0;
	text-align: center;
	font-size: 25rpx;
	color: #999;
}
</style>

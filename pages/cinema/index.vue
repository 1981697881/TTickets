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

		<scroll-view class="schedule-scroll" scroll-y enable-back-to-top @scrolltolower="loadMore">
			<view class="schedule-head">
				<view class="venue-bar">
					<view class="venue-copy">
						<text class="venue-name">{{ cinemaName || storeInfo.storeName || '影院信息加载中' }}</text>
						<text class="venue-address one-t">{{ cinemaAddress || storeInfo.storeAddress || '正在获取影院地址' }}</text>
					</view>
					<view class="service-action" @tap="showModal">
						<text class="cuIcon-service service-icon"></text>
						<text>影院客服</text>
					</view>
				</view>

				<view v-if="swiperList.length" class="movie-picker">
					<scroll-view class="poster-scroll" scroll-x scroll-with-animation :scroll-into-view="activePosterId" :show-scrollbar="false">
						<view class="poster-list">
							<view
								v-for="(movie, index) in swiperList"
								:id="`poster-${movie.filmId || index}`"
								:key="movie.filmId || index"
								class="poster-item"
								:class="{ active: index === activeItem }"
								@tap="selectMovie(index)"
							>
								<image class="poster-image" :src="getMoviePoster(movie, index)" mode="aspectFill" lazy-load @error="markPosterFailed(movie, index)"></image>
								<text class="poster-name one-t">{{ movie.filmName || '影片' }}</text>
							</view>
						</view>
					</scroll-view>

					<view class="movie-summary" @tap="openMovieDetail">
						<view class="movie-summary-copy">
							<text class="movie-name">{{ cardInfo.filmName }}</text>
							<text class="movie-meta one-t">{{ movieMeta }}</text>
						</view>
						<text class="cuIcon-right summary-arrow"></text>
					</view>

					<sh-date ref="shDate" :movieDates="movieDates" @subClickFtn="selectDate"></sh-date>
				</view>
			</view>

			<view class="session-section">
				<view class="section-heading">
					<view class="section-mark"></view>
					<text class="section-title">场次</text>
				</view>
				<view class="session-list">
					<fz-circuit-card
						v-for="session in goodsList"
						:key="session.scheduleId || session.id"
						:detail="session"
						:isTag="true"
					></fz-circuit-card>
				</view>
				<app-empty v-if="!goodsList.length && !isLoading" :isFixed="false" :emptyData="emptyData"></app-empty>
				<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
			</view>
			<app-load v-model="isLoading"></app-load>
		</scroll-view>

		<app-login-modal></app-login-modal>
		<app-notice-modal></app-notice-modal>
	</view>
</template>

<script>
import shDate from './children/sh-date.vue';
import fzCircuitCard from '@/components/fz-circuit-card/fz-circuit-minicard.vue';
import appEmpty from '@/components/app-empty/app-empty.vue';
import { mapState } from 'vuex';
import { normalizePage, mergeUnique } from '@/common/utils/pagination';

export default {
	components: {
		shDate,
		fzCircuitCard,
		appEmpty
	},
	data() {
		return {
			cardInfo: {},
			activeItem: 0,
			cinemaName: '',
			cinemaAddress: '',
			cinemaList: [],
			modalName: null,
			swiperList: [],
			movieDates: [],
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '当前日期没有可观影场次，选择其他日期试试~'
			},
			goodsList: [],
			listParams: {
				filmId: null,
				cinemaId: null,
				cinemalinkId: null,
				keywords: '',
				showDatetime: '',
				page: 1
			},
			isLoading: false,
			loadStatus: '',
			lastPage: 1,
			failedPosters: {}
		};
	},
	computed: {
		...mapState({
			storeInfo: state => state.user.storeInfo || {}
		}),
		servicePhones() {
			return Array.isArray(this.storeInfo.customerServicePhoneList)
				? this.storeInfo.customerServicePhoneList.filter(Boolean)
				: [];
		},
		movieMeta() {
			return [
				this.cardInfo.filmLong ? `${this.cardInfo.filmLong}分钟` : '',
				this.cardInfo.filmSortid,
				this.cardInfo.filmDirector ? `导演：${this.cardInfo.filmDirector}` : ''
			].filter(Boolean).join(' | ');
		},
		activePosterId() {
			const movie = this.swiperList[this.activeItem];
			return movie ? `poster-${movie.filmId || this.activeItem}` : '';
		}
	},
	onLoad(options) {
		const routeQuery = this.$Route && this.$Route.query ? this.$Route.query : {};
		const query = options && Object.keys(options).length ? options : routeQuery;
		this.listParams.filmId = query.filmId || null;
		this.listParams.cinemaId = query.cinemaId || null;
		this.listParams.cinemalinkId = query.cinemalinkId || this.getStoredCinemaLinkId();
		this.listParams.keywords = query.keywords || '';
		this.getCinemaList();
	},
	onShow() {
		uni.$once('escUpload', data => {
			if (!data || !data.filmId) return;
			const index = this.swiperList.findIndex(item => String(item.filmId) === String(data.filmId));
			if (index >= 0) this.selectMovie(index);
		});
	},
	methods: {
		getStoredCinemaLinkId() {
			return this.storeInfo.cinemalinkId || this.storeInfo.cinemaLinkId || null;
		},
		showModal() {
			this.modalName = 'RadioModal';
		},
		hideModal() {
			this.modalName = null;
		},
		callPhone(phone) {
			if (!phone) return;
			uni.makePhoneCall({ phoneNumber: String(phone) });
		},
		openMovieDetail() {
			if (!this.cardInfo.filmId) return;
			this.$Router.push({ path: '/pages/cinema/detail/index', query: { filmId: this.cardInfo.filmId } });
		},
		selectDate(value) {
			this.listParams.showDatetime = value.day;
			this.resetSessions();
			this.getGoodsList();
		},
		selectMovie(index, shouldLoad = true) {
			const movie = this.swiperList[index];
			if (!movie) return;
			this.activeItem = index;
			this.cardInfo = movie;
			this.movieDates = Array.isArray(movie.movieDates) ? movie.movieDates : [];
			this.listParams.filmId = movie.filmId;
			this.listParams.showDatetime = this.movieDates[0] || '';
			this.resetSessions();
			this.$nextTick(() => this.$refs.shDate && this.$refs.shDate.getDateList());
			if (shouldLoad) this.getGoodsList();
		},
		getMoviePoster(movie, index) {
			const key = String((movie && movie.filmId) || index);
			const origin = 'https://cfzx.gzfzdev.com';
			const fallback = `${origin}/movie/uploadFiles/image/zanwu.jpg`;
			if (this.failedPosters[key]) return fallback;
			const source = movie && movie.filmPhoto ? String(movie.filmPhoto) : '';
			if (!source) return fallback;
			if (/^https?:\/\//.test(source) || source.startsWith('data:') || source.startsWith('/static/')) return source;
			if (source.startsWith('//')) return `https:${source}`;
			if (source.startsWith('/')) return `${origin}${source}`;
			if (source.includes('/')) return `${origin}/${source}`;
			return `${origin}/movie/uploadFiles/image/${source}`;
		},
		markPosterFailed(movie, index) {
			const key = String((movie && movie.filmId) || index);
			if (this.failedPosters[key]) return;
			this.failedPosters = { ...this.failedPosters, [key]: true };
		},
		resetSessions() {
			this.listParams.page = 1;
			this.goodsList = [];
			this.lastPage = 1;
			this.loadStatus = '';
		},
		loadMore() {
			if (!this.isLoading && this.listParams.page < this.lastPage) {
				this.listParams.page += 1;
				this.getGoodsList();
			}
		},
		async getCinemaList() {
			const requestedId = this.listParams.cinemalinkId || this.getStoredCinemaLinkId();
			try {
				const res = await this.$api('cinema.locationList', {
					cinemalinkId: requestedId,
					filmId: this.listParams.filmId
				});
				const list = res && (res.flag || res.code === 1) && Array.isArray(res.data) ? res.data : [];
				this.cinemaList = list;
				const cinema = list[0] || {};
				this.cinemaName = cinema.cinemaName || '';
				this.cinemaAddress = cinema.cinemaAddress || '';
				this.listParams.cinemalinkId = cinema.cinemalinkId || cinema.cinemaLinkId || requestedId;
			} catch (error) {
				console.warn('[cinema] failed to load unique cinema', error);
			}
			await this.getMoviesList();
		},
		async getMoviesList() {
			if (!this.listParams.cinemalinkId) return;
			try {
				const res = await this.$api('cinema.locationMovies', { cinemalinkId: this.listParams.cinemalinkId });
				if (!res || (!res.flag && res.code !== 1)) return;
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
		async getGoodsList() {
			if (this.isLoading || !this.listParams.filmId || !this.listParams.cinemalinkId) return;
			this.isLoading = true;
			this.loadStatus = 'loading';
			try {
				const res = await this.$api('cinema.locationSchedules', { ...this.listParams });
				if (res && (res.flag || res.code === 1)) {
					const page = normalizePage(res.data, this.listParams.page);
					this.goodsList = mergeUnique(this.goodsList, page.items, 'scheduleId', this.listParams.page === 1);
					this.lastPage = page.lastPage;
					this.loadStatus = this.listParams.page < page.lastPage ? '' : 'over';
				}
			} catch (error) {
				this.loadStatus = '';
				console.warn('[cinema] failed to load schedules', error);
			} finally {
				this.isLoading = false;
			}
		}
	}
};
</script>

<style lang="scss">
.schedule-page {
	height: 100vh;
	background: #fff;
}

.schedule-scroll {
	height: 100%;
}

.schedule-head {
	position: relative;
	overflow: hidden;
	background: #fff;
}

.service-action {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 7rpx;
	font-size: 23rpx;
	font-weight: 600;
	color: var(--tt-primary-strong);
}

.service-icon {
	font-size: 29rpx;
}

.movie-name {
	font-size: 34rpx;
	font-weight: 740;
	line-height: 48rpx;
	color: var(--tt-text);
}

.movie-meta {
	max-width: 620rpx;
	font-size: 21rpx;
	line-height: 32rpx;
	color: var(--tt-text-muted);
}

.summary-arrow {
	font-size: 30rpx;
	color: var(--tt-text-muted);
}

.session-list {
	width: 100%;
}

.phone-dialog {
	padding: 36rpx 32rpx 24rpx;
}

.phone-dialog-title {
	display: block;
	padding-bottom: 24rpx;
	font-size: 34rpx;
	font-weight: 720;
	color: var(--tt-text);
}

.phone-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 92rpx;
	border-top: 1rpx solid var(--tt-border);
	font-size: 26rpx;
	color: var(--tt-text-secondary);
}

.phone-number {
	font-weight: 650;
	color: var(--tt-primary-strong);
}

.phone-empty {
	padding: 30rpx 0;
	text-align: center;
	font-size: 25rpx;
	color: var(--tt-text-muted);
}

/* 采用早期稳定的横向海报选择结构，避免 swiper 边距导致当前影片移出可视区。 */
.venue-bar {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 26rpx 30rpx 22rpx;
	background: #fff;
}

.venue-copy {
	min-width: 0;
	flex: 1;
	display: flex;
	flex-direction: column;
}

.venue-name {
	font-size: 31rpx;
	font-weight: 720;
	line-height: 44rpx;
	color: var(--tt-text);
}

.venue-address {
	margin-top: 5rpx;
	font-size: 21rpx;
	line-height: 32rpx;
	color: var(--tt-text-muted);
}

.movie-picker {
	background: #fff;
}

.poster-scroll {
	width: 100%;
	white-space: nowrap;
}

.poster-list {
	display: inline-flex;
	align-items: flex-start;
	gap: 20rpx;
	padding: 16rpx 30rpx 20rpx;
}

.poster-item {
	width: 136rpx;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
}

.poster-image {
	width: 132rpx;
	height: 184rpx;
	display: block;
	box-sizing: border-box;
	border: 4rpx solid transparent;
	border-radius: 14rpx;
	background: var(--tt-bg);
}

.poster-item.active .poster-image {
	border-color: var(--tt-primary);
}

.poster-name {
	width: 100%;
	margin-top: 10rpx;
	font-size: 21rpx;
	line-height: 32rpx;
	text-align: center;
	color: var(--tt-text-secondary);
}

.poster-item.active .poster-name {
	font-weight: 650;
	color: var(--tt-primary-strong);
}

.movie-summary {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 18rpx 30rpx 24rpx;
	background: #fff;
}

.movie-summary-copy {
	min-width: 0;
	flex: 1;
	display: flex;
	flex-direction: column;
}

.movie-summary .movie-name {
	font-size: 34rpx;
	font-weight: 740;
	line-height: 48rpx;
	color: var(--tt-text);
}

.movie-summary .movie-meta {
	margin-top: 5rpx;
	font-size: 21rpx;
	line-height: 32rpx;
	color: var(--tt-text-muted);
}

.session-section {
	padding: 0 30rpx calc(30rpx + env(safe-area-inset-bottom));
	background: #fff;
}

.section-heading {
	display: flex;
	align-items: center;
	gap: 13rpx;
	padding: 28rpx 0 8rpx;
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
</style>

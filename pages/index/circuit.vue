<template>
	<view class="page-box">
		<view class="content-box">
			<scroll-view class="scroll-box" scroll-y enable-back-to-top @scrolltolower="loadMore">
				<view class="head-box">
					<view class="cinema-summary">
						<view class="summary-copy">
							<text class="summary-title">{{ displayCinemaName }}</text>
							<text class="summary-address one-t">{{ displayCinemaAddress }}</text>
						</view>
					</view>

					<view class="hero-card">
						<image class="cinema-hero" src="/static/imgs/cinema/cinema-hero.jpg" mode="aspectFill" lazy-load></image>
						<view class="hero-copy">
							<text class="hero-title">光影之间</text>
							<text class="hero-title hero-title-second">遇见美好</text>
							<text class="hero-subtitle">与你共赴电影时光</text>
						</view>
					</view>
				</view>
				<view class="section-heading">
					<text class="section-title">正在热映</text>
					<text class="section-accent"></text>
				</view>

				<view class="goods-list">
					<fz-unmovie-list
						v-for="goods in goodsList"
						:key="goods.filmId"
						:detail="goods"
					></fz-unmovie-list>
				</view>

				<app-empty
					v-if="!goodsList.length && !isLoading"
					:isFixed="false"
					:emptyData="emptyData"
				></app-empty>
				<view v-if="goodsList.length" class="cu-load text-gray list-load" :class="loadStatus"></view>
				<app-load v-model="isLoading"></app-load>
			</scroll-view>
		</view>

		<app-float-btn></app-float-btn>
		<app-notice-modal></app-notice-modal>
		<app-login-modal></app-login-modal>
		<app-address-model @init="init"></app-address-model>
	</view>
</template>

<script>
import fzUnmovieList from './components/fz-unmovie-list.vue';
import appEmpty from '@/components/app-empty/app-empty.vue';
import { mapState } from 'vuex';
import tools from '@/common/utils/tools';
import { normalizePage } from '@/common/utils/pagination';
import { extractArray } from '@/common/utils/api-data';
import { createLoginRefreshMixin } from '@/common/mixins/login-refresh.js';

export default {
	components: {
		fzUnmovieList,
		appEmpty
	},
	mixins: [createLoginRefreshMixin('onLoginRefresh')],
	data() {
		return {
			cinemaName: '',
			cinemaAddress: '',
			cinemaList: [],
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '当前没有可观影影片，敬请期待~'
			},
			goodsList: [],
			searchVal: '',
			listParams: {
				filmId: null,
				cinemaId: null,
				cinemalinkId: null,
				keywords: '',
				page: 1,
				showDatetime: ''
			},
			isLoading: false,
			loadStatus: '',
			lastPage: 1
		};
	},
	computed: {
		...mapState({
			storeInfo: state => state.user.storeInfo || {}
		}),
		displayCinemaName() {
			return this.cinemaName || this.storeInfo.storeName || '影院信息加载中';
		},
		displayCinemaAddress() {
			return this.cinemaAddress || this.storeInfo.storeAddress || '正在获取影院地址';
		}
	},
	onLoad(options) {
		const routeQuery = this.$Route && this.$Route.query ? this.$Route.query : {};
		const query = options && Object.keys(options).length ? options : routeQuery;
		this.listParams.showDatetime = tools.getDayList('', 0).day;
		this.listParams.filmId = query.filmId || null;
		this.listParams.cinemaId = query.cinemaId || null;
		this.listParams.cinemalinkId = query.cinemalinkId || this.getStoredCinemaLinkId();
		this.listParams.keywords = query.keywords || '';
		this.searchVal = this.listParams.keywords;
		this.init();
	},
	methods: {
		getStoredCinemaLinkId() {
			let store = this.storeInfo || {};
			if (!store.cinemalinkId && !store.cinemaLinkId) {
				const cached = uni.getStorageSync('storeInfo');
				if (cached && (cached.cinemalinkId || cached.cinemaLinkId)) {
					this.$store.commit('STORE_INFO', cached);
					store = cached;
				}
			}
			return store.cinemalinkId || store.cinemaLinkId || null;
		},
		shouldRefreshOnShow() {
			const hasToken = Boolean(uni.getStorageSync('token'));
			const hasLink = Boolean(this.listParams.cinemalinkId || this.getStoredCinemaLinkId());
			return hasToken && hasLink && !this.goodsList.length && !this.isLoading;
		},
		onLoginRefresh() {
			if (!this.listParams.cinemalinkId) {
				this.listParams.cinemalinkId = this.getStoredCinemaLinkId();
			}
			return this.init();
		},
		async init() {
			this.listParams.page = 1;
			this.goodsList = [];
			this.lastPage = 1;
			const cachedLinkId = this.listParams.cinemalinkId || this.getStoredCinemaLinkId();
			if (cachedLinkId) {
				this.listParams.cinemalinkId = cachedLinkId;
				// 有缓存影院时：影片列表与影院信息并行，减少首屏等待
				await Promise.all([this.getCinemaList({ loadMovies: false }), this.getMoviesList()]);
				return;
			}
			await this.getCinemaList({ loadMovies: true });
		},
		loadMore() {
			if (!this.isLoading && this.listParams.page < this.lastPage) {
				this.listParams.page += 1;
				this.getMoviesList();
			}
		},
		async getCinemaList({ loadMovies = true } = {}) {
			const requestedCinemaLinkId = this.listParams.cinemalinkId || this.getStoredCinemaLinkId();
			try {
				const res = await this.$api('cinema.locationList', {
					cinemalinkId: requestedCinemaLinkId,
					filmId: this.listParams.filmId
				});
				// 0.5.5：res.flag + res.data 数组
				if (res && res.flag) {
					const list = Array.isArray(res.data) ? res.data : extractArray(res.data);
					this.cinemaList = list;
					if (list.length) {
						const cinema = list[0];
						this.cinemaName = cinema.cinemaName || '';
						this.cinemaAddress = cinema.cinemaAddress || '';
						this.listParams.cinemalinkId = cinema.cinemalinkId || cinema.cinemaLinkId || requestedCinemaLinkId;
					}
				}
			} catch (error) {
				console.warn('[cinema] failed to load cinema information', error);
			}

			if (loadMovies && this.listParams.cinemalinkId) {
				await this.getMoviesList();
			}
		},
		async getMoviesList() {
			if (this.isLoading || !this.listParams.cinemalinkId) return;
			this.isLoading = true;
			this.loadStatus = 'loading';
			try {
				// 0.5.5 不传 page；整表覆盖，并读取数组上的 last_page
				const res = await this.$api('cinema.locationMovies', {
					cinemalinkId: this.listParams.cinemalinkId
				});
				if (res && res.flag) {
					const page = normalizePage(res.data, this.listParams.page);
					this.goodsList = page.items;
					this.lastPage = page.lastPage;
					this.loadStatus = this.listParams.page < page.lastPage ? '' : 'over';
				}
			} catch (error) {
				this.loadStatus = '';
				console.warn('[cinema] failed to load movie list', error);
			} finally {
				this.isLoading = false;
			}
		}
	}
};
</script>

<style lang="scss">
.page-box {
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: #fff;
}

.head-box {
	padding: 28rpx 34rpx 22rpx;
	background: #fff;

	.cinema-summary {
		margin-bottom: 28rpx;
	}

	.summary-copy {
		min-width: 0;
		flex: 1;
	}

	.summary-title {
		display: block;
		max-width: 480rpx;
		font-size: 36rpx;
		line-height: 48rpx;
		font-weight: 700;
		color: var(--tt-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.summary-address {
		display: block;
		max-width: 100%;
		margin-top: 8rpx;
		font-size: 23rpx;
		line-height: 34rpx;
		color: var(--tt-text-muted);
	}

}

.hero-card {
	position: relative;
	height: 300rpx;
	overflow: hidden;
	border-radius: 24rpx;
	background: #202316;
}

.cinema-hero {
	width: 100%;
	height: 100%;
}

.hero-copy {
	position: absolute;
	left: 44rpx;
	top: 48rpx;
	display: flex;
	flex-direction: column;
	color: #e1e7a7;
}

.hero-title {
	font-family: STSong, SimSun, serif;
	font-size: 39rpx;
	line-height: 52rpx;
	letter-spacing: 4rpx;
}

.hero-title-second {
	margin-left: 40rpx;
}

.hero-subtitle {
	margin-top: 18rpx;
	font-size: 20rpx;
	line-height: 30rpx;
	letter-spacing: 3rpx;
	color: rgba(248, 248, 226, 0.88);
}

.content-box {
	flex: 1;
	min-height: 0;
	background: #fff;
}

.scroll-box {
	height: 100%;
}

.section-heading {
	padding: 24rpx 34rpx 22rpx;
}

.section-title {
	display: block;
	font-size: 36rpx;
	line-height: 52rpx;
	font-weight: 700;
	color: var(--tt-text);
}

.section-accent {
	display: block;
	width: 30rpx;
	height: 6rpx;
	margin-top: 12rpx;
	border-radius: 6rpx;
	background: var(--tt-primary);
}

.goods-list {
	padding: 0 34rpx;
}

.list-load {
	padding-bottom: calc(18rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(18rpx + env(safe-area-inset-bottom));
}

@media screen and (max-width: 340px) {
	.head-box {
		padding-left: 26rpx;
		padding-right: 26rpx;
	}

	.hero-card {
		height: 274rpx;
	}

	.goods-list,
	.section-heading {
		padding-left: 26rpx;
		padding-right: 26rpx;
	}
}
</style>

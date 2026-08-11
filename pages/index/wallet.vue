<template>
	<view class="page_box order-page">
		<view class="head_box order-tabs" role="tablist" aria-label="订单类型">
			<view
				class="order-tab"
				:class="{ 'order-tab--active': tabCurrent === tab.id }"
				v-for="tab in tabList"
				:key="tab.id"
				role="tab"
				:aria-selected="tabCurrent === tab.id"
				@tap="onTab(tab)"
			>
				<text class="order-tab__title">{{ tab.title }}</text>
				<text v-if="tabCurrent === tab.id" class="order-tab__indicator"></text>
			</view>
		</view>

		<view class="content_box">
			<scroll-view
				class="scroll-box order-scroll"
				scroll-y
				enable-back-to-top
				refresher-enabled
				:refresher-triggered="refresherTriggered"
				@refresherrefresh="refreshOrders"
				@scrolltolower="loadMore"
			>
				<wallet-list
					v-for="order in displayOrders"
					:key="order.key"
					:img="order.img"
					:title="order.title"
					:subtitle="order.subtitle"
					:date="order.date"
					:price="order.price"
					:quantity="order.quantity"
					:quantity-unit="order.quantityUnit"
					:action-text="order.actionText"
					:image-variant="order.imageVariant"
					:detail-path="order.detailPath"
					:detail-query="order.detailQuery"
				/>

				<app-empty v-if="!goodsList.length && !isLoading" :empty-data="emptyData" :is-fixed="false"></app-empty>
				<view v-if="goodsList.length" class="order-load-more">
					<text>{{ loadStatusText }}</text>
				</view>
				<view class="order-safe-bottom"></view>
			</scroll-view>
		</view>

		<app-load v-model="isLoading"></app-load>
		<app-float-btn></app-float-btn>
		<app-notice-modal></app-notice-modal>
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
import walletList from './components/fz-wallets.vue';
import appEmpty from '@/components/app-empty/app-empty.vue';
import { mapState } from 'vuex';
import { createRequestGate, mergeUnique, normalizePage } from '@/common/utils/pagination.js';

export default {
	components: { walletList, appEmpty },
	data() {
		return {
			isLoading: false,
			refresherTriggered: false,
			loadStatus: '',
			lastPage: 1,
			currentPage: 1,
			tabCurrent: 'ing',
			goodsList: [],
			requestGate: createRequestGate(),
			tabList: [
				{ id: 'ing', title: '电影票', status: '0' },
				{ id: 'nostart', title: '商品', status: '4' }
			]
		};
	},
	computed: {
		...mapState({
			storeInfo: state => state.user.storeInfo || {},
			balInfo: state => state.user.balInfo || {}
		}),
		emptyData() {
			return {
				img: '/static/imgs/empty/empty_goods.png',
				tip: this.tabCurrent === 'ing' ? '暂无可使用的电影票' : '暂无可兑换的商品订单'
			};
		},
		displayOrders() {
			return this.goodsList.map((item, index) => {
				if (this.tabCurrent === 'ing') {
					const confirmationId = item.confirmationId;
					return {
						key: `movie-${confirmationId || item.ticketId || index}`,
						img: item.filmPhoto || '',
						title: item.filmName || '',
						subtitle: item.hallName || '',
						date: item.showDatetime || '',
						price: item.ticketPayMoney,
						quantity: item.ticketCount,
						quantityUnit: '张',
						actionText: '立即取票',
						imageVariant: 'poster',
						detailPath: '/pages/wallet/index',
						detailQuery: { confirmationId }
					};
				}

				const orderId = item.OrderID;
				return {
					key: `product-${orderId || index}`,
					img: item.ImagePath || '',
					title: item.PName || '',
					subtitle: item.StatusName || '',
					date: item.Date || '',
					price: item.OrderAmount,
					quantity: item.OrderQty,
					quantityUnit: '件',
					actionText: '立即兑换',
					imageVariant: 'product',
					detailPath: '/pages/wallet/goodsIndex',
					detailQuery: { OrderID: orderId }
				};
			});
		},
		loadStatusText() {
			if (this.loadStatus === 'loading') return '加载中…';
			if (this.currentPage >= this.lastPage) return '— 没有更多了 —';
			return '上拉加载更多';
		}
	},
	onShow() {
		const type = this.$Route.query?.type;
		if (type === 'nostart' || type === 'ing') this.tabCurrent = type;
		this.resetAndFetch();
	},
	beforeUnmount() {
		this.requestGate.invalidate();
	},
	methods: {
		onTab(tab) {
			if (this.tabCurrent === tab.id) return;
			this.tabCurrent = tab.id;
			this.resetAndFetch();
		},
		refreshOrders() {
			this.refresherTriggered = true;
			this.resetAndFetch().finally(() => {
				this.refresherTriggered = false;
			});
		},
		resetAndFetch() {
			this.requestGate.invalidate();
			this.goodsList = [];
			this.currentPage = 1;
			this.lastPage = 1;
			this.loadStatus = '';
			return this.fetchOrders(true);
		},
		loadMore() {
			if (this.requestGate.active || this.currentPage >= this.lastPage) return;
			this.currentPage += 1;
			this.fetchOrders(false);
		},
		fetchOrders(reset) {
			const token = this.requestGate.begin();
			if (!token) return Promise.resolve();
			this.isLoading = reset;
			this.loadStatus = 'loading';
			const requestedTab = this.tabCurrent;
			const requestedPage = this.currentPage;
			const request = requestedTab === 'ing' ? this.fetchMovieOrders() : this.fetchProductOrders();

			return request
				.then(res => {
					if (!this.requestGate.isLatest(token) || requestedTab !== this.tabCurrent) return;
					const payload = requestedTab === 'ing' ? res.data : (res.data?.Data ?? res.data);
					const page = normalizePage(payload, this.currentPage);
					const key = requestedTab === 'ing' ? 'confirmationId' : 'OrderID';
					this.goodsList = mergeUnique(this.goodsList, page.items, key, reset);
					this.currentPage = page.page;
					this.lastPage = page.lastPage;
					this.loadStatus = this.currentPage >= this.lastPage ? 'over' : '';
				})
				.catch(() => {
					if (this.requestGate.isLatest(token)) {
						if (!reset) this.currentPage = Math.max(1, requestedPage - 1);
						this.loadStatus = '';
					}
				})
				.finally(() => {
					this.requestGate.end(token);
					this.isLoading = false;
				});
		},
		fetchMovieOrders() {
			return this.$api('wallet.lists', {
				openId: uni.getStorageSync('openid'),
				status: '0',
				page: this.currentPage
			});
		},
		fetchProductOrders() {
			return this.$api('goods.getMixPackageOrderList', {
				custId: this.balInfo.custId,
				placeId: this.storeInfo.v8PlaceId,
				V8Url: this.storeInfo.v8Url,
				status: 0,
				page: this.currentPage
			});
		}
	}
};
</script>

<style scoped lang="scss">
.order-page { background: var(--tt-bg); }

.order-tabs {
	display: flex;
	flex: 0 0 92rpx;
	height: 92rpx;
	background: rgba(255, 255, 255, 0.98);
}

.order-tab {
	position: relative;
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	height: 92rpx;
	color: var(--tt-text-secondary);
}

.order-tab__title {
	font-size: 29rpx;
	font-weight: 600;
	line-height: 42rpx;
}

.order-tab--active { color: var(--tt-primary-strong); }

.order-tab__indicator {
	position: absolute;
	left: 50%;
	bottom: 0;
	width: 72rpx;
	height: 6rpx;
	transform: translateX(-50%);
	border-radius: 6rpx 6rpx 0 0;
	background: var(--tt-primary);
}

.order-scroll { background: var(--tt-bg); }

.order-load-more {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 90rpx;
	font-size: 23rpx;
	line-height: 34rpx;
	color: var(--tt-text-muted);
}

.order-safe-bottom {
	height: calc(24rpx + env(safe-area-inset-bottom));
}

:deep(.empty-img) {
	width: 360rpx;
	height: 220rpx;
	margin-top: 120rpx;
}

:deep(.empty-text) {
	font-size: 25rpx;
	line-height: 38rpx;
	color: var(--tt-text-muted);
}
</style>

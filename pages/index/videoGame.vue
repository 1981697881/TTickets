<template>
	<view class="page_box arcade-page">
		<view class="content_box">
			<scroll-view class="scroll-box" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
				<view class="arcade-content">
					<view class="machine-entry" @tap="jump('/pages/cinema/machine/index')">
						<view class="machine-copy">
							<text class="machine-title">机台展示</text>
							<text class="machine-caption">查看门店热门设备</text>
							<view class="machine-action">
								<text>去查看</text>
								<text class="cuIcon-right"></text>
							</view>
						</view>
						<view class="machine-media">
							<image v-if="machineImage" class="machine-image" :src="machineImage" mode="aspectFill" lazy-load></image>
							<image v-else class="machine-placeholder" src="/static/tabbar/game-active.png" mode="aspectFit"></image>
						</view>
					</view>

					<view class="section-heading">
						<view class="section-mark"></view>
						<text class="section-title">在线购币</text>
					</view>

					<view class="coin-list">
						<view
							v-for="goods in goodsList"
							:key="goods.goodsId"
							class="coin-item"
							@tap="openPayment(goods)"
						>
							<fz-circuit-meal :detail="goods"></fz-circuit-meal>
						</view>
					</view>

					<view v-if="!isLoading && !goodsList.length" class="empty-state">
						<image class="empty-icon" src="/static/imgs/user/menu/arcade-coins.jpg" mode="aspectFit"></image>
						<text class="empty-title">暂无可购买的游戏币</text>
						<text class="empty-caption">请稍后再试</text>
					</view>
					<view v-if="goodsList.length" class="cu-load" :class="loadStatus"></view>
					<app-load v-model="isLoading"></app-load>
				</view>
			</scroll-view>
		</view>
		<view class="foot_box"></view>
		<app-float-btn></app-float-btn>
		<app-notice-modal></app-notice-modal>
		<app-login-modal></app-login-modal>
		<app-address-model @init="handleStoreReady"></app-address-model>
	</view>
</template>

<script>
import fzCircuitMeal from '@/components/fz-circuit-card/fz-circuit-meal.vue';
import { mapActions, mapState } from 'vuex';
import { normalizePage } from '@/common/utils/pagination';
import { createLoginRefreshMixin } from '@/common/mixins/login-refresh.js';

const IMAGE_BASE_URL = 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/';

export default {
	components: {
		fzCircuitMeal
	},
	mixins: [createLoginRefreshMixin('onLoginRefresh')],
	data() {
		return {
			listParams: {
				page: 1
			},
			isLoading: false,
			loadStatus: '',
			lastPage: 1,
			goodsList: [],
			machinePreview: {}
		};
	},
	computed: {
		...mapState({
			storeInfo: state => state.user.storeInfo || {}
		}),
		machineImage() {
			const image = this.machinePreview.playPhoto;
			if (!image) return '';
			return /^https?:\/\//.test(image) ? image : `${IMAGE_BASE_URL}${image}`;
		}
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['getUserBalance']),
		shouldRefreshOnShow() {
			return Boolean(uni.getStorageSync('token') && !this.goodsList.length && !this.isLoading);
		},
		onLoginRefresh() {
			return this.init();
		},
		async init() {
			this.listParams.page = 1;
			this.lastPage = 1;
			this.goodsList = [];
			await Promise.all([
				this.getGoodsList(),
				this.getMachinePreview(),
				Object.keys(this.storeInfo).length ? this.getUserBalance().catch(() => undefined) : Promise.resolve()
			]);
		},
		handleStoreReady() {
			this.init();
		},
		loadMore() {
			if (!this.isLoading && this.listParams.page < this.lastPage) {
				this.listParams.page += 1;
				this.getGoodsList();
			}
		},
		async getMachinePreview() {
			try {
				const res = await this.$api('cinema.playList');
				if (res && res.flag) {
					const page = normalizePage(res.data, 1);
					this.machinePreview = page.items[0] || {};
				}
			} catch (error) {
				this.machinePreview = {};
			}
		},
		async getGoodsList() {
			if (this.isLoading) return;
			this.isLoading = true;
			this.loadStatus = 'loading';
			try {
				// 0.5.5：不传 page，整表覆盖，读数组 last_page
				const res = await this.$api('goods.commodityList', { goodsType: 1 });
				if (res && res.flag) {
					const page = normalizePage(res.data, this.listParams.page);
					this.goodsList = page.items;
					this.lastPage = page.lastPage;
					this.loadStatus = this.listParams.page < page.lastPage ? '' : 'over';
				}
			} catch (error) {
				this.loadStatus = '';
				console.warn('[arcade] failed to load coin packages', error);
			} finally {
				this.isLoading = false;
			}
		},
		openPayment(goods) {
			const price = Number(goods && goods.goodsPrice);
			if (!goods || !goods.goodsId || !Number.isFinite(price) || price <= 0) {
				uni.showToast({ icon: 'none', title: '商品信息异常' });
				return;
			}
			this.jump('/pages/order/payment/chargeMoney', {
				goodsDescribe: goods.goodsDescribe,
				coinCount: goods.coinCount,
				goodsName: goods.goodsName,
				goodsPrice: price,
				goodsId: goods.goodsId,
				integral: goods.integral
			});
		},
		jump(path, params) {
			this.$Router.push({ path, query: params });
		}
	}
};
</script>

<style lang="scss">
.arcade-page {
	background: #fff;
}

.arcade-content {
	padding: 24rpx 28rpx 40rpx;
	background: #fff;
}

.machine-entry {
	min-height: 286rpx;
	display: flex;
	overflow: hidden;
	background: #fbfaf6;
	border: 1rpx solid var(--tt-border);
	border-radius: 28rpx;
	box-shadow: 0 12rpx 34rpx rgba(23, 24, 18, 0.05);
}

.machine-copy {
	width: 42%;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	padding: 30rpx 0 30rpx 30rpx;
	box-sizing: border-box;
}

.machine-title {
	font-size: 38rpx;
	font-weight: 750;
	line-height: 52rpx;
	color: var(--tt-text);
}

.machine-caption {
	margin-top: 12rpx;
	font-size: 23rpx;
	line-height: 34rpx;
	color: var(--tt-text-secondary);
}

.machine-action {
	min-width: 132rpx;
	height: 64rpx;
	margin-top: 28rpx;
	padding: 0 20rpx 0 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	background: var(--tt-primary);
	border-radius: 999rpx;
	font-size: 25rpx;
	font-weight: 650;
	color: #fff;
	box-sizing: border-box;

	.cuIcon-right {
		font-size: 24rpx;
	}
}

.machine-media {
	width: 58%;
	min-height: 286rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	background: var(--tt-primary-soft);
	border-radius: 48% 0 0 48%;
}

.machine-image {
	width: 100%;
	height: 100%;
}

.machine-placeholder {
	width: 112rpx;
	height: 112rpx;
}

.section-heading {
	display: flex;
	align-items: center;
	gap: 14rpx;
	padding: 42rpx 0 10rpx;
}

.section-mark {
	width: 7rpx;
	height: 34rpx;
	background: var(--tt-primary);
	border-radius: 999rpx;
}

.section-title {
	font-size: 34rpx;
	font-weight: 750;
	line-height: 48rpx;
	color: var(--tt-text);
}

.coin-list,
.coin-item {
	width: 100%;
}

.empty-state {
	min-height: 400rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: var(--tt-text-muted);
}

.empty-icon {
	width: 110rpx;
	height: 110rpx;
	opacity: 0.5;
}

.empty-title {
	margin-top: 20rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: var(--tt-text-secondary);
}

.empty-caption {
	margin-top: 6rpx;
	font-size: 23rpx;
}
</style>

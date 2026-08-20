<template>
	<view class="page_box goods-detail-page">
		<view class="content_box">
			<scroll-view class="scroll-box" scroll-y enable-back-to-top scroll-with-animation>
				<view class="group-wrap" v-if="hasDetail">
					<view class="group-box">
						<wallet-goods ref="walletInfo" :detail="walletInfo" :scan-id="OrderID"></wallet-goods>
					</view>
				</view>
				<app-empty v-else-if="!isLoading" :empty-data="emptyData" :is-fixed="false"></app-empty>
			</scroll-view>
		</view>

		<app-load v-model="isLoading"></app-load>
		<app-float-btn></app-float-btn>
		<app-notice-modal></app-notice-modal>
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
import walletGoods from '@/pages/wallet/children/wallet-goods.vue';
import appEmpty from '@/components/app-empty/app-empty.vue';
import { mapState } from 'vuex';

export default {
	name: 'GoodsOrderDetail',
	components: { walletGoods, appEmpty },
	data() {
		return {
			walletInfo: {},
			OrderID: '',
			isLoading: true,
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '未找到商品订单详情'
			}
		};
	},
	computed: {
		...mapState({
			storeInfo: state => state.user.storeInfo || {}
		}),
		hasDetail() {
			return Boolean(this.walletInfo?.Data?.length && this.walletInfo?.Data2?.length);
		}
	},
	onShow() {
		const orderId = this.$Route.query?.OrderID;
		if (!orderId) {
			this.isLoading = false;
			return;
		}
		this.OrderID = orderId;
		this.getOrderDetail().then(() => {
			this.$nextTick(() => {
				const info = this.$refs.walletInfo;
				if (info && typeof info.remakeCode === 'function') info.remakeCode();
			});
		});
	},
	onHide() {
		this.clearCode();
	},
	onUnload() {
		this.clearCode();
	},
	methods: {
		clearCode() {
			this.$nextTick(() => {
				if (this.$refs.walletInfo?.clearCode) this.$refs.walletInfo.clearCode();
			});
		},
		getOrderDetail() {
			this.isLoading = true;
			return this.$api('goods.getMixPackageOrderDetail', {
				orderID: this.OrderID,
				placeId: this.storeInfo.v8PlaceId,
				V8Url: this.storeInfo.v8Url
			})
				.then(res => {
					if (res.flag) {
						this.walletInfo = res.data || {};
					} else {
						this.walletInfo = {};
						uni.showToast({ icon: 'none', title: res.msg || '订单详情加载失败' });
					}
				})
				.catch(() => {
					this.walletInfo = {};
				})
				.finally(() => {
					this.isLoading = false;
				});
		}
	}
};
</script>

<style scoped lang="scss">
.goods-detail-page { background: var(--tt-bg); }

.group-box {
	width: calc(100% - 48rpx);
	max-width: 700rpx;
	min-height: 1000rpx;
	margin: 24rpx auto;
	overflow: hidden;
	background: #fff;
	border: 1rpx solid var(--tt-border);
	border-radius: var(--tt-radius-lg);
	box-shadow: var(--tt-shadow);
}

:deep(.empty-img) { width: 360rpx; height: 220rpx; margin-top: 160rpx; }
</style>

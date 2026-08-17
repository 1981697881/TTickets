<template>
	<view class="page_box machine-page">
		<view class="content_box">
			<scroll-view class="scroll-box" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
				<view class="machine-content">
					<view class="page-heading">
						<text class="page-title">热门机台</text>
						<text class="page-caption">查看设备介绍与玩法</text>
					</view>

					<view class="machine-list">
						<fz-image-card v-for="goods in goodsList" :key="goods.playId" :detail="goods"></fz-image-card>
					</view>

					<view v-if="!isLoading && !goodsList.length" class="empty-state">
						<image class="empty-icon" src="/static/tabbar/game-active.png" mode="aspectFit"></image>
						<text class="empty-title">暂无机台信息</text>
						<text class="empty-caption">请稍后再试</text>
					</view>
					<view v-if="goodsList.length" class="cu-load" :class="loadStatus"></view>
					<app-load v-model="isLoading"></app-load>
				</view>
			</scroll-view>
		</view>
		<view class="foot_box"></view>
		<app-notice-modal></app-notice-modal>
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
import fzImageCard from '@/components/fz-circuit-card/fz-image-card.vue';
import { normalizePage, mergeUnique } from '@/common/utils/pagination';

export default {
	components: {
		fzImageCard
	},
	data() {
		return {
			listParams: {
				page: 1
			},
			isLoading: false,
			loadStatus: '',
			lastPage: 1,
			goodsList: []
		};
	},
	mounted() {
		this.getGoodsList();
	},
	methods: {
		loadMore() {
			if (!this.isLoading && this.listParams.page < this.lastPage) {
				this.listParams.page += 1;
				this.getGoodsList();
			}
		},
		async getGoodsList() {
			if (this.isLoading) return;
			this.isLoading = true;
			this.loadStatus = 'loading';
			try {
				// 0.5.5：playList 不传 page；追加列表，读数组 last_page
				const res = await this.$api('cinema.playList');
				if (res && res.flag) {
					const page = normalizePage(res.data, this.listParams.page);
					this.goodsList = this.listParams.page === 1
						? page.items
						: mergeUnique(this.goodsList, page.items, 'playId', false);
					this.lastPage = page.lastPage;
					this.loadStatus = this.listParams.page < page.lastPage ? '' : 'over';
				}
			} catch (error) {
				this.loadStatus = '';
				console.warn('[arcade] failed to load machine list', error);
			} finally {
				this.isLoading = false;
			}
		}
	}
};
</script>

<style lang="scss">
.machine-page,
.machine-content {
	background: #fff;
}

.machine-content {
	min-height: 100%;
	padding: 24rpx 28rpx 40rpx;
}

.page-heading {
	display: flex;
	flex-direction: column;
	padding: 8rpx 2rpx 14rpx;
}

.page-title {
	font-size: 42rpx;
	font-weight: 760;
	line-height: 58rpx;
	color: var(--tt-text);
}

.page-caption {
	margin-top: 8rpx;
	font-size: 25rpx;
	line-height: 36rpx;
	color: var(--tt-text-secondary);
}

.machine-list {
	width: 100%;
}

.empty-state {
	min-height: 620rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: var(--tt-text-muted);
}

.empty-icon {
	width: 108rpx;
	height: 108rpx;
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

<template>
	<view class="list-box">
		<view class="head_box">
			<view class="" style="position:relative;z-index: 10; background: #fff;">
				<cu-custom :isBack="true">
					<block slot="backText">
						<view class="search-box flex align-center" @tap.stop>
							<input @confirm="onSearch" @input="onInput" confirm-type="搜索" class="search flex-sub" type="text" v-model="searchVal" placeholder="商品搜索" />
							<text v-show="searchVal" @tap="clearSearch" class="cuIcon-roundclosefill"></text>
						</view>
					</block>
				</cu-custom>
			</view>
			<view class="filter-item"><sh-filter @change="onFilter"></sh-filter></view>
		</view>
		<view class="content-box">
			<view class="goods-list x-f">
				<view class="goods-item" v-for="goods in goodsList" :key="goods.id"><app-goods-card :detail="goods" :isTag="true"></app-goods-card></view>
			</view>
			<!-- 空白页 -->
			<app-empty v-if="!goodsList.length && !isLoading" :emptyData="emptyData"></app-empty>
			<!-- 加载更多 -->
			<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
			<!-- load -->
			<app-load v-model="isLoading"></app-load>
		</view>
		<!-- 自定义底部导航 -->
		<app-tabbar></app-tabbar>
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
import shFilter from './children/sh-filter.vue';
import appGoodsCard from '@/components/app-goods-card/app-goods-card.vue';
import appEmpty from '@/components/app-empty/app-empty.vue';
import { normalizePage, mergeUnique } from '@/common/utils/pagination';
export default {
	components: {
		shFilter,
		appGoodsCard,
		appEmpty
	},
	data() {
		return {
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '暂无该商品，还有更多好货等着你噢~'
			},
			goodsList: [],
			searchVal: '',
			listParams: {
				category_id: 0,
				keywords: '',
				page: 1
			},
			isLoading: true, //loading和空白页。
			isPaging: false,
			requestToken: 0,
			searchTimer: null,
			loadStatus: '', //loading,over
			lastPage: 1
		};
	},
	computed: {},
	// 触底加载更多
	onReachBottom() {
		if (!this.isPaging && this.listParams.page < this.lastPage) {
			this.listParams.page += 1;
			this.getGoodsList();
		}
	},
	onLoad() {
		if (this.$Route.query.id) {
			this.listParams.category_id = this.$Route.query.id;
		}
		if (this.$Route.query.keywords) {
			this.listParams.keywords = this.$Route.query.keywords;
			this.searchVal = this.$Route.query.keywords;
		}
		this.getGoodsList();
	},
	beforeUnmount() {
		clearTimeout(this.searchTimer);
		this.requestToken += 1;
	},
	methods: {
		resetList() {
			this.requestToken += 1;
			this.isPaging = false;
			this.goodsList = [];
			this.listParams.page = 1;
			this.loadStatus = '';
		},
		onFilter(e) {
			this.listParams.order = e;
			this.resetList();
			this.getGoodsList();
		},
		// 键盘搜索
		onSearch() {
			let that = this;
			that.listParams.keywords = that.searchVal;
			this.resetList();
			that.getGoodsList();
		},
		// 输入防抖搜索
		onInput() {
			let that = this;
			that.listParams.category_id = 0;
			clearTimeout(this.searchTimer);
			this.searchTimer = setTimeout(() => {
				that.listParams.keywords = that.searchVal.trim();
				that.resetList();
				that.getGoodsList();
			}, 350);
		},
		// 清除搜索框
		clearSearch() {
			this.searchVal = '';
			this.listParams.keywords = '';
			this.resetList();
			this.getGoodsList();
		},
		// 商品列表
		async getGoodsList() {
			if (this.isPaging) return;
			const token = ++this.requestToken;
			this.isPaging = true;
			this.isLoading = this.listParams.page === 1;
			this.loadStatus = 'loading';
			try {
				const res = await this.$api('goods.lists', { ...this.listParams });
				if (token !== this.requestToken) return;
				if (res.code === 1 || res.flag) {
					const page = normalizePage(res.data, this.listParams.page);
					this.goodsList = mergeUnique(this.goodsList, page.items, 'id', this.listParams.page === 1);
					this.lastPage = page.lastPage;
					this.loadStatus = this.listParams.page < page.lastPage ? '' : 'over';
				}
			} finally {
				if (token === this.requestToken) {
					this.isLoading = false;
					this.isPaging = false;
				}
			}
		}
	}
};
</script>

<style lang="scss">
.head_box {
	position: -webkit-sticky;
	position: sticky;
	top: 0;
	z-index: 998;
	background: #fff;
}

.search-box {
	width: 661rpx;
	height: 60rpx;
	background: rgba(245, 245, 245, 1);
	border-radius: 30rpx;
	padding: 0 30rpx;
	// #ifdef MP
	width: 450rpx;

	// #endif
	.search {
		text-align: center;
		font-size: 28rpx;
	}

	.cuIcon-roundclosefill {
		color: #d5a65a;
		padding: 0 10rpx;
	}
}
.list-box {
	&:-webkit-scrollbar {
		width: 0;
		height: 0;
		color: transparent;
		display: none;
	}
}
.content-box {
	padding: 20rpx;
	width: 750rpx;
}

.goods-list {
	flex-wrap: wrap;

	.goods-item {
		margin-right: 20rpx;
		margin-bottom: 20rpx;

		&:nth-child(2n) {
			margin-right: 0;
		}
	}
}
</style>

<template>
	<view class="page_box">
		<view class="head_box">
			<view class="tab-box x-f">
				<view class="tab-item" @tap="onTab(tab.id)" :class="{ 'tab-active': tabCurrent === tab.id }" v-for="tab in tabList" :key="tab.id">
					<text class="tab-title">{{ tab.title }}</text>
					<text v-show="tabCurrent === tab.id" class="tab-triangle"></text>
				</view>
			</view>
		</view>
		<view class="content_box">
				<!-- <view class="goods-item" v-for="item in goodsList" :key="item.id">
					<fz-unmovie-list v-if="tabCurrent=='nostart'" :tabId="tabCurrent" :cardId="item.id" :title="item.title" :subtitle="item.subtitle" :img="item.image" :price="item.price" :originalPrice="item.original_price">
					</fz-unmovie-list>
				</view> -->
				<fz-cinema-list :tabId="tabCurrent" v-if="tabCurrent=='ended'">
				</fz-cinema-list>
				<fz-movie-list :tabId="tabCurrent" v-if="tabCurrent=='ing'">
				</fz-movie-list>
				<!-- 空白 -->
				<app-empty v-if="!goodsList.length && !isLoading" :emptyData="emptyData"></app-empty>
		</view>
		<view class="foot_box"></view>
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
import fzCinemaList from './children/fz-cinema-list.vue';
import fzUnmovieList from './children/fz-unmovie-list.vue';
import fzMovieList from './children/fz-movie-list.vue';
import seckillList from '@/csJson/seckillList.json';
export default {
	components: {
		fzCinemaList,
		fzUnmovieList,
		fzMovieList
	},
	data() {
		return {
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '暂无电影信息，敬请期待~'
			},
			isLoading: true,
			loadStatus: '', //loading,over
			lastPage: 1,
			currentPage: 1,
			tabCurrent: 'ended',
			goodsList: [],
			loading: false,
			tabList: [ 
				{
					id: 'ended',
					title: '正在热映'
				},
				{
					id: 'ing',
					title: '影院'
				},
				{
					id: 'nostart',
					title: '即将上映'
				}
			]
		};
	},
	computed: {},
	onLoad() {
		setTimeout(() => {
			this.loading = true;
		}, 500);
		this.getGoodsList();
	},
	mounted() {
	},
	methods: {
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		onTab(id) {
			this.tabCurrent = id;
			this.goodsList = [];
			this.currentPage = 1;
			this.getGoodsList();
		},
		// 百分比
		getProgress(sales, stock) {
			let unit = '';
			if (stock + sales > 0) {
				let num = (sales / (sales + stock)) * 100;
				unit = num.toFixed(2) + '%';
			} else {
				unit = '0%';
			}
			return unit;
		},
		// 加载更多
		loadMore() {
			if (this.currentPage < this.lastPage) {
				this.currentPage += 1;
				this.getGoodsList();
			}
		},
		// 列表
		getGoodsList() {
			let that = this;
			that.isLoading = true;
			that.loadStatus = 'loading';
			let res = seckillList;
			if (res.code === 1) {
				that.isLoading = false;
				that.goodsList = [...that.goodsList, ...res.data.data];
				that.lastPage = res.data.last_page;
				if (that.currentPage < res.data.last_page) {
					that.loadStatus = '';
				} else {
					that.loadStatus = 'over';
				}
			}
			/* that.$api('goods.seckillList', {
				type: that.tabCurrent,
				page: that.currentPage
			}).then(res => {
				console.log(JSON.stringify(res))
				if (res.code === 1) {
					that.isLoading = false;
					that.goodsList = [...that.goodsList, ...res.data.data];
					that.lastPage = res.data.last_page;
					if (that.currentPage < res.data.last_page) {
						that.loadStatus = '';
					} else {
						that.loadStatus = 'over';
					}
				}
			}); */
		}
	}
};
</script>

<style scoped lang="scss">
.tab-box {
	overflow: hidden;
	width: 100%;
	height: 84rpx;
	border: 1px solid #f8f8ff;
	.tab-item {
		flex: 1;
		line-height: 84rpx;
		text-align: center;
		background: #ffffff;
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 500;
		color: #999999;
		position: relative;
		border-right: 1rpx solid #fff;
		.tab-triangle {
			position: absolute;
			z-index: 2;
			bottom: 0;
			left: 42%;
			border-radius: 5rpx;
			width: 45rpx;
			height: 10rpx;
			background: red;
		}
	}
	.tab-active {
		color: #333333;
	}
}
.goods-item {
	position: relative;
	margin-bottom: 2rpx;
	.cu-progress {
		width: 225rpx;
		height: 16rpx;
		.progress--color {
			background: #e6b873;
		}
	}
	.progress-text {
		color: #999999;
		font-size: 20rpx;
		margin-left: 25rpx;
	}
	.fot-text{
		width: 100%;
		height: 70rpx;
		line-height: 70rpx;
		display: flex;
		.text-grey{
			width: 50%;
		}
		.fot-btn{
			text-align: right;
			width: 50%;
			height: 60rpx;
			.buy-btn {
				width: 140rpx;
				height: 60rpx;
				border-radius: 30rpx;
				font-size: 26rpx;
				font-family: PingFang SC;
				font-weight: 400;
				padding: 0;
			}
			.btn-end {
				background: linear-gradient(90deg, #C6E2FF, #B9D3EE);
				box-shadow: 1px 1px 1px 1px rgba(229, 138, 0, 0.22);
				color: white;
			}
			.btn-nostart {
				background: linear-gradient(90deg, #FFEC8B, #EEDC82);
				box-shadow: 1px 1px 1px 1px rgba(229, 138, 0, 0.22);
				color: #FF8247;
			}
			.btn-ing {
				background: linear-gradient(90deg, #FFF0F5, #FFE4E1);
				box-shadow: 1px 1px 1px 1px rgba(229, 138, 0, 0.22);
				color: rgba(238, 99, 99, 1);
			}
		}
	}
}
</style>

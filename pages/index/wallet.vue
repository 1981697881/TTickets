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
			<scroll-view scroll-y="true" enable-back-to-top @scrolltolower="loadMore" class="scroll-box">
				<view class="goods-item" v-for="item in goodsList" :key="item.id">
					<wallet-list :cardId="item.id" :title="item.title" :subtitle="item.subtitle" :img="item.image" :price="item.price" :originalPrice="item.original_price">
						<block slot="sell">
							<view class="x-f">
								<view class="cu-progress round sm">
									<view class="progress--color" :style="[{ width: loading ? getProgress(item.sales, item.stock) : '' }]"></view>
								</view>
								<view class="progress-text">已抢{{ getProgress(item.sales, item.stock) }}</view>
							</view>
						</block>
						<block slot="btn">
							<view class="fot-text">
								<view class="text-grey">
									共 <text class="text-black text-bold text-xl padding-xs"> 2 </text> 张
									</view>
								<view class="fot-btn">
								<button v-if="btnType[tabCurrent].color=='btn-end'" @tap.stop="jump('/pages/order/add-comment', {id: item.id})" class="cu-btn buy-btn" :class="btnType[tabCurrent].color">{{ btnType[tabCurrent].name }}</button>
								<button v-if="btnType[tabCurrent].color=='btn-ing'" @tap.stop="jump('/pages/wallet/detail/index', {id: item.id})" class="cu-btn buy-btn" :class="btnType[tabCurrent].color">{{ btnType[tabCurrent].name }}</button>
								<button v-if="btnType[tabCurrent].color=='btn-nostart'" @tap.stop="jump('/pages/wallet/detail/index', {id: item.id})" class="cu-btn buy-btn" :class="btnType[tabCurrent].color">{{ btnType[tabCurrent].name }}</button>
								</view>
							</view>
						</block>
					</wallet-list>
				</view>
				<!-- 空白 -->
				<shopro-empty v-if="!goodsList.length && !isLoading" :emptyData="emptyData"></shopro-empty>
				<!-- 加载更多 -->
				<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
				<!-- loading -->
				<shopro-load v-model="isLoading"></shopro-load>
			</scroll-view>
		</view>
		<view class="foot_box"></view>
		<!-- 自定义底部导航 -->
		<shopro-tabbar></shopro-tabbar>
		<!-- 关注弹窗 -->
		<shopro-float-btn></shopro-float-btn>
		<!-- 连续弹窗提醒 -->
		<shopro-notice-modal></shopro-notice-modal>
		<!-- 登录提示 -->
		<shopro-login-modal></shopro-login-modal>
	</view>
</template>

<script>
import walletList from '@/pages/wallet/list.vue';

import seckillList from '@/csJson/seckillList.json';
export default {
	components: {
		walletList,
		
	},
	data() {
		return {
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '暂无可使用票劵，快去逛逛吧~'
			},
			isLoading: true,
			loadStatus: '', //loading,over
			lastPage: 1,
			currentPage: 1,
			tabCurrent: 'ing',
			goodsList: [],
			loading: false,
			btnType: {
				ended: {
					name: '评价',
					color: 'btn-end'
				},
				ing: {
					name: '立即取票',
					color: 'btn-ing'
				},
				nostart: {
					name: '立即兑换',
					color: 'btn-nostart'
				}
			},
			tabList: [
				{
					id: 'ended',
					title: '已使用'
				},
				{
					id: 'ing',
					title: '电影票'
				},
				{
					id: 'nostart',
					title: '商品'
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
		// 秒杀列表
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
.head_box {
	background-color: #2b4055;
}
.tab-box {
	overflow: hidden;
	width: 100%;
	height: 84rpx;
	border: 1px solid #f8f8ff;
	border-radius: 40rpx 40rpx 0 0;
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
			background: #2b4055;
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

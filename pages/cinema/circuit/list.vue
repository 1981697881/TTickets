<template>
	<view class="page_box">
		<view class="head_box">
			<view style="position:relative;z-index: 10; background: #fff;">
				<cu-custom :isBack="true">
					<block slot="backText"></block>
					<block slot="content">{{ circuit }}</block>
				</cu-custom>
			</view>
			<swiper class="card-swiper" :current="activeItem" :class="dotStyle ? 'square-dot' : 'round-dot'" :circular="true" duration="500" @change="cardSwiper">
				<swiper-item v-for="(item, cindex) in swiperList" :key="cindex" :class="cardCur == cindex ? 'cur' : ''">
					<view class="swiper-item">
						<image :src="item.url" mode="aspectFill" v-if="item.type == 'image'"></image>
						<video :src="item.url" autoplay loop muted :show-play-btn="false" :controls="false" objectFit="cover" v-if="item.type == 'video'"></video>
						<view class="cir_group">
							<view class="cir_logo">
								<view class="tag" >{{item.dimensional}}</view>
								<image :src="item.filmPhoto" mode="aspectFill"></image>
							</view>
							<view class="text-white cir_detail">
								<view class="text-cut de_name">{{ item.filmName }}</view>
								<view class="de_pin">评分：暂无</view>
								<view class="text-orange de_info">{{ item.filmLong }}分钟 | {{ item.filmSortid }}</view>
								<view class="text-orange de_info">导演：{{ item.filmDirector }}</view>
								<view class="text-orange de_info">主演：{{ item.filmPlay }}</view>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
			<sh-date @subClickFtn="fatherMethod"></sh-date>
			<view class="filter-item"><sh-filter @change="onFilter"></sh-filter></view>
		</view>
		<scroll-view :style="{ height: headHeight + 'px' }" class="scroll-box" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
			<view class="content-box">
				<view class="goods-list x-f">
					<view class="goods-item" v-for="goods in goodsList" :key="goods.cinemaId"><fz-circuit-card :detail="goods" :filmId="listParams.filmId" tabId="ended" :isTag="true"></fz-circuit-card></view>
				</view>
				<!-- 空白页 -->
				<app-empty :isFixed="false" v-if="!goodsList.length && !isLoading" :emptyData="emptyData"></app-empty>
				<!-- 加载更多 -->
				<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
				<!-- load -->
				<app-load v-model="isLoading"></app-load>
			</view>
		</scroll-view>
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
import shFilter from '../children/sh-filter.vue';
import shDate from '../children/sh-date.vue';
import fzCircuitCard from '@/components/fz-circuit-card/fz-circuit-card.vue';
import appEmpty from '@/components/app-empty/app-empty.vue';
import { mapMutations, mapActions, mapState } from 'vuex';
import moreGoodList from '@/csJson/moreGoodList.json';
import tools from '@/common/utils/tools';
let timer = null;
export default {
	components: {
		shFilter,
		shDate,
		fzCircuitCard,
		appEmpty
	},
	data() {
		return {
			cardCur: 0,
			activeItem: 0,
			circuit: '',
			swiperList: [
				
			],
			dotStyle: false,
			towerStart: 0,
			direction: '',
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '当前选择地址附近，没有相关影院~'
			},
			goodsList: [],
			searchVal: '',
			headHeight: '0',
			listParams: {
				filmId: null,
				showDatetime: null,
				keywords: '',
				page: 1
			},
			isLoading: false, //loading和空白页。
			loadStatus: '', //loading,over
			lastPage: 1
		};
	},
	computed: {},
	// 触底加载更多
	onReachBottom() {
		if (this.listParams.page < this.lastPage) {
			this.listParams.page += 1;
			this.getGoodsList();
		}
	},
	mounted() {
		this.getScrHeight();
	},
	onLoad() {
		this.getMoviesList();
	},
	methods: {
		// 加载更多
		loadMore() {
			if (this.listParams.page < this.lastPage) {
				this.listParams.page += 1;
				this.getGoodsList();
			}
		},
		getScrHeight() {
			let me = this;
			uni.getSystemInfo({
				success: function(res) {
					// res - 各种参数
					let info = uni.createSelectorQuery().select('.head_box');
					info.boundingClientRect(function(data) {
						//data - 各种参数
						me.headHeight = res.windowHeight - data.height - 3;
					}).exec();
				}
			});
		},
		cardSwiper(e) {
			this.circuit = this.swiperList[e.detail.current].filmName;
			this.listParams.filmId = this.swiperList[e.detail.current].filmId;
			this.cardCur = e.detail.current;
			this.listParams.page = 1;
			this.goodsList = [];
			this.getGoodsList();
		},
		onFilter(e) {
			this.listParams.order = e;
			this.goodsList = [];
			this.listParams.page = 1;
			this.getGoodsList();
		},
		// 键盘搜索
		onSearch() {
			let that = this;
			that.listParams.keywords = that.searchVal;
			that.goodsList = [];
			this.listParams.page = 1;
			that.getGoodsList();
		},
		// 输入防抖搜索
		onInput() {
			let that = this;
			that.listParams.filmId = 0;
			// 输入不及时
			setTimeout(() => {
				that.listParams.keywords = that.searchVal;
			}, 0);
			// 防抖
			if (timer !== null) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => {
				that.goodsList = [];
				this.listParams.page = 1;
				that.getGoodsList();
			}, 1000);
		},
		// 清除搜索框
		clearSearch() {
			this.searchVal = '';
			this.listParams.keywords = '';
			this.listParams.page = 1;
			this.getGoodsList();
		},
		// 获取热映影片
		getMoviesList() {
			let that = this;
			that.$api('cinema.lists', {}).then(res => {
				if (res.flag) {
					that.swiperList = res.data;
					
					that.swiperList.forEach((item, index) => {
						if (item.filmId == that.$Route.query.filmId) {
							that.activeItem = index;
							that.circuit = item.filmName;
						}
					});
					that.listParams.showDatetime = tools.getDayList('', 0).day;
					if (typeof that.$Route.query.filmId != 'undefined') {
						that.listParams.filmId = that.$Route.query.filmId;
					} else {
						that.listParams.filmId = that.swiperList[0].filmId;
						that.circuit = that.swiperList[0].filmName;
					}
					if (that.$Route.query.keywords) {
						that.listParams.keywords = that.$Route.query.keywords;
						that.searchVal = that.$Route.query.keywords;
					}
					that.goodsList = [];
					that.getGoodsList();
				}
			});
		},
		fatherMethod(val) {
			this.listParams.showDatetime = val.day;
			this.goodsList = [];
			this.getGoodsList();
		},
		// 影城场次列表
		getGoodsList() {
			let that = this;
			that.isLoading = true;
			that.loadStatus = 'loading';
			that.$api('cinema.filmLists', that.listParams).then(res => {
				if (res.flag) {
					that.isLoading = false;
					that.goodsList = [...that.goodsList, ...res.data];
					that.lastPage = res.data.last_page;
					if (that.listParams.page < res.data.last_page) {
						that.loadStatus = '';
					} else {
						that.loadStatus = 'over';
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.card-swiper {
	height: 350upx !important;
}
.card-swiper uni-swiper-item {
	padding: 5px 0 15px !important;
}
.cir_group {
	width: 100%;
	height: 100%;
	background-color: red; /* 对于不支持渐变的浏览器*/
	background-image: linear-gradient(#2b4055, #5c92c1, #2b4055); /* 标准语法(必须是最后一个) */
	display: flex;
	.cir_logo {
		display: inline-flex;
		width: 40%;
		padding: 20rpx;
		image {
			border-radius: 15rpx;
			width: 100%;
		}
		.tag {
			position: absolute;
			left: 10rpx;
			top: 40rpx;
			z-index: 2;
			line-height: 30rpx;
			background: linear-gradient(132deg, rgba(28, 28, 28, 1), rgba(54, 54, 54, 1), rgba(236, 190, 96, 1));
			border-radius: 0px 18rpx 18rpx 0px;
			padding: 0 10rpx;
			-webkit-transform: scale(0.8);
			font-family: PingFang SC;
			color: white;
		}
	}
	.cir_detail {
		width: 60%;
		padding: 20rpx;
		padding-left: 0;
		font-family: PingFang SC;
		display: inline-block;
		.de_name {
			width: 100%;
			font-size: 40rpx;
			line-height: 60rpx;
		}
		.de_pin {
			line-height: 40rpx;
			width: 100%;
		}
		.de_info {
			line-height: 40rpx;
			width: 100%;
		}
	}
}
.tower-swiper .tower-item {
	transform: scale(calc(0.5 + var(--index) / 10));
	margin-left: calc(var(--left) * 100upx - 150upx);
	z-index: var(--index);
}
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
		width: 100%;
		margin-bottom: 20rpx;
	}
}
</style>

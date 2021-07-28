<template>
	<view style="height: auto;">
		<view class="head-box">
			<swiper v-if="tabId == 'ended'" class="card-swiper round-dot" :circular="true" :indicator-dots="false" duration="500" @change="cardSwiper">
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
			<sh-date v-if="tabId == 'ended'" @subClickFtn="fatherMethod"></sh-date>
			<view class="filter-item"><sh-filter @change="onFilter"></sh-filter></view>
		</view>
		<scroll-view :style="{ height: headHeight + 'px' }" class="scroll-box" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
			<view class="content-box">
				<view class="goods-list x-f">
					<view class="goods-item" v-for="goods in goodsList" :key="goods.cinemaId"><fz-circuit-card :detail="goods" :filmId="listParams.filmId" :tabId="tabId" :isTag="true"></fz-circuit-card></view>
				</view>
				<!-- 加载更多 -->
				<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
				<!-- load -->
				<app-load v-model="isLoading"></app-load>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import shFilter from './sh-filter.vue';
import shDate from './sh-date.vue';
import moreGoodList from '@/csJson/moreGoodList.json';
import tools from '@/common/utils/tools';
export default {
	components: {
		shFilter,
		shDate
	},
	data() {
		return {
			cardCur: 0,
			headHeight: '0',
			listParams: {
				filmId: null,
				showDatetime: null,
				keywords: '',
				page: 1
			},
			isLoading: false, //loading和空白页。
			loadStatus: '', //loading,over
			lastPage: 1,
			goodsList: [],
			swiperList: [
				
			]
		};
	},
	props: {
		tabId: ''
	},
	mounted() {
		this.getScrHeight();
		this.getMoviesList();
	},
	computed: {},
	created() {},
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
					let info = uni.createSelectorQuery().in(me).select('.head-box');
					info.boundingClientRect(function(data) {
						//data - 各种参数
						me.headHeight = res.windowHeight - data.height - 3 - 35;
					}).exec();
				}
			});
		},
		cardSwiper(e) {
			this.cardCur = e.detail.current;
			this.listParams.filmId = this.swiperList[e.detail.current].filmId;
			this.goodsList = [];
			this.listParams.page = 1;
			this.getGoodsList();
		},
		onFilter(e) {
			this.listParams.order = e;
			this.goodsList = [];
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
						}
					});
					that.circuit = that.swiperList[0].filmName;
					that.listParams.showDatetime = tools.getDayList('', 0).day;
					if (typeof that.$Route.query.filmId != 'undefined') {
						that.listParams.filmId = that.$Route.query.filmId;
					} else {
						that.listParams.filmId = that.swiperList[0].filmId;
					}
					if (that.$Route.query.keywords) {
						that.listParams.keywords = that.$Route.query.keywords;
						that.searchVal = that.$Route.query.keywords;
					}
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
		},
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({ path: path, query: parmas });
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
</style>

<template>
	<view class="page_box">
		<view class="head_box">
			<image class="logo-img" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/_20210531145946.jpg" mode="scaleToFill"></image>
		</view>
		<view class="content_box">
			<scroll-view :style="{ height: headHeight + 'px' }" class="scroll-box" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
				<view class="content-box">
					<view class="goods-list x-f">
						<view class="goods-item" v-for="goods in goodsList" :key="goods.filmId"><fz-unmovie-list :detail="goods" :isTag="true"></fz-unmovie-list></view>
					</view>
					<!-- 空白页 -->
					<app-empty :isFixed="false" v-if="!goodsList.length && !isLoading" :emptyData="emptyData"></app-empty>
					<!-- 加载更多 -->
					<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
					<!-- load -->
					<app-load v-model="isLoading"></app-load>
				</view>
			</scroll-view>
		</view>
		<!-- <view class="foot_box"></view> -->
		<!-- 自定义底部导航 -->
		<!-- <app-tabbar></app-tabbar> -->
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
		<!-- 门店选择 -->
		<app-address-model @init="init"></app-address-model>
	</view>
</template>

<script>
import fzUnmovieList from './components/fz-unmovie-list.vue';
import appEmpty from '@/components/app-empty/app-empty.vue';
import { mapMutations, mapActions, mapState } from 'vuex';
import tools from '@/common/utils/tools';
let timer = null;
export default {
	components: {
		fzUnmovieList,
		appEmpty
	},
	data() {
		return {
			cardCur: 0,
			activeItem: 0,
			Msg: '0',
			cinemaName: '',
			cinemaAddress: '',
			circuit: '',
			cinemaList: [],
			direction: '',
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '当前没有可观影影片,敬请期待~'
			},
			headHeight: '0',
			goodsList: [],
			searchVal: '',
			listParams: {
				filmId: null,
				cinemaId: null,
				keywords: '',
				page: 1
			},
			
			isLoading: false, //loading和空白页。
			loadStatus: '', //loading,over
			lastPage: 1
		};
	},
	computed: {
		...mapState({
			storeInfo: state => state.user.storeInfo,
		}),
	},
	// 触底加载更多
	onReachBottom() {
		if (this.listParams.page < this.lastPage) {
			this.listParams.page += 1;
			this.getGoodsList();
		}
	},
	mounted() {
		this.getScrHeight()
	},
	onLoad() {
		this.listParams.showDatetime = tools.getDayList('', 0).day;
		if (this.$Route.query.filmId) {
			this.listParams.filmId = this.$Route.query.filmId;
		} 
		if (this.$Route.query) {
			this.detail = this.$Route.query
			this.listParams.cinemaId = this.$Route.query.cinemaId;
		}
		if (this.$Route.query) {
			this.listParams.cinemalinkId = this.$Route.query.cinemalinkId;
		}else{
			this.listParams.cinemalinkId = this.storeInfo.cinemalinkId;
		}
		if (this.$Route.query.keywords) {
			this.listParams.keywords = this.$Route.query.keywords;
			this.searchVal = this.$Route.query.keywords;
		}
		
		/* this.init() */
	},
	methods: {
		...mapActions(['getUserBalance','getUserDetails']),
		init() {
			this.getCinemaList()
			this.getUserBalance()
		},
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({ path: path, query: parmas });
		},
		getScrHeight() {
			let me = this
			uni.getSystemInfo({
				success: function(res) {
					// res - 各种参数
					let info = uni.createSelectorQuery().select('.head_box');
					info.boundingClientRect(function(data) {
						//data - 各种参数
						me.headHeight = res.windowHeight - data.height;
					}).exec();
				}
			});
		},
		// 加载更多
		loadMore() {
			if (this.listParams.page < this.lastPage) {
				this.listParams.page += 1;
				this.getGoodsList();
			}
		},
		// 获取影城
		getCinemaList() {
			let that = this;
			that.$api('cinema.locationList', {cinemalinkId: that.storeInfo.cinemaLinkId, filmId: that.listParams.filmId }).then(res => {
				if (res.flag) {
					that.cinemaList = res.data;
					that.cinemaName = res.data[0].cinemaName;
					that.cinemaAddress = res.data[0].cinemaAddress;
					that.listParams.cinemalinkId = res.data[0].cinemalinkId
					that.getMoviesList();
				}
			});
		},// 获取影城影片
		getMoviesList() {
			let that = this;
			that.$api('cinema.locationMovies', {cinemalinkId: that.listParams.cinemalinkId,  }).then(res => {
				if (res.flag) {
					that.isLoading = false;
					that.goodsList = res.data;
					that.lastPage = res.data.last_page;
					if (that.listParams.page < res.data.last_page) {
						that.loadStatus = '';
					} else {
						that.loadStatus = 'over';
					}
				}
			});
		},	
	}
};
</script>

<style lang="scss">
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
.page_box {
	height: auto;
	display: inline-block;
}
.tag {
	position: absolute;
	left: 35rpx;
	top: 35rpx;
	z-index: 2;
	line-height: 30rpx;
	background: linear-gradient(132deg, rgba(28, 28, 28, 1), rgba(54, 54, 54, 1), rgba(236, 190, 96, 1));
	border-radius: 0px 18rpx 18rpx 0px;
	padding: 0 10rpx;
	font-size: 18rpx;
	font-family: PingFang SC;
	color: white;
}
.head_box {
	position: -webkit-sticky;
	position: sticky;
	top: 0;
	z-index: 998;
	background: linear-gradient(#060210, #fff 20%);
	.logo-img {
		top: 5rpx;
		height: 170rpx;
		width: 100%;
		box-shadow: 0 0 10rpx 0 #A5A5A5;
	}
	.ci-header {
		background: #fff;
		border-radius: 10rpx;
		display: inline-flex;
		.header-info {
			padding: 20rpx;
			width: 600rpx;
			.info-local {
				display: inline-flex;
				.local-adr {
					width: 430rpx;
				}
			}
		}
		.locate-logo {
			border-radius:0 10rpx 0 0;
			background-color: #8B4513;
			padding-top: 10rpx;
			width: 150rpx;
			color: #FFFFFF;
			text-align: center;
			.logo-img {
				top: 5rpx;
				width: 80rpx;
				height: 80rpx;
			}
		}
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
	width: 750rpx;
}
.goods-list {
	flex-wrap: wrap;
	.goods-item {
		width: 100%;
	}
}
</style>

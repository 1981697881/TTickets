<template>
	<view class="page_box">
		<view class="head_box">
			<view style="position:relative;z-index: 10; background: #fff;">
				<cu-custom :isBack="true">
					<block slot="backText"></block>
					<block slot="content">{{ circuit }}</block>
				</cu-custom>
			</view>
			<swiper class="card-swiper" :class="dotStyle ? 'square-dot' : 'round-dot'" :circular="true" duration="500" @change="cardSwiper">
				<swiper-item v-for="(item, cindex) in swiperList" :key="cindex" :class="cardCur == cindex ? 'cur' : ''">
					<view class="swiper-item">
						<image :src="item.url" mode="aspectFill" v-if="item.type == 'image'"></image>
						<video :src="item.url" autoplay loop muted :show-play-btn="false" :controls="false" objectFit="cover" v-if="item.type == 'video'"></video>
						<view class="cir_group" v-if="item.type == 'group'">
							<view class="cir_logo">
								<view class="tag" v-if="item.scrn === 'screen'">2D IMAX</view>
								<image :src="item.url" mode="aspectFill"></image>
							</view>
							<view class="text-white cir_detail">
								<view class="text-cut de_name">{{ item.name }}</view>
								<view class="de_pin">评分{{ item.score }} | 10.1万人想看</view>
								<view class="text-orange de_info">{{ item.time }} | {{ item.genre }}</view>
								<view class="text-orange de_info">导演：{{ item.direct }}</view>
								<view class="text-orange de_info">主演：{{ item.starring }}</view>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
			<sh-date></sh-date>
			<view class="filter-item"><sh-filter @change="onFilter"></sh-filter></view>
		</view>
		<scroll-view :style="{ height: headHeight + 'px' }" class="scroll-box" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
			<view class="content-box">
				<view class="goods-list x-f">
						<view class="goods-item" v-for="goods in goodsList" :key="goods.id"><fz-circuit-card :detail="goods" tabId='ended' :isTag="true"></fz-circuit-card></view>
				</view>
				<!-- 空白页 -->
				<shopro-empty :isFixed="false" v-if="!goodsList.length && !isLoading" :emptyData="emptyData"></shopro-empty>
				<!-- 加载更多 -->
				<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
				<!-- load -->
				<shopro-load v-model="isLoading"></shopro-load>
			</view>
		</scroll-view>
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
import shFilter from '../children/sh-filter.vue';
import shDate from '../children/sh-date.vue';
import fzCircuitCard from '@/components/fz-circuit-card/fz-circuit-card.vue';
import shoproEmpty from '@/components/shopro-empty/shopro-empty.vue';
import { mapMutations, mapActions, mapState } from 'vuex';
import moreGoodList from '@/csJson/moreGoodList.json';
let timer = null;
export default {
	components: {
		shFilter,
		shDate,
		fzCircuitCard,
		shoproEmpty
	},
	data() {
		return {
			cardCur: 0,
			circuit: '',
			swiperList: [
				{
					id: 0,
					name: '百鸟朝凤',
					score: '8.0',
					scrn: 'screen',
					genre: '剧情',
					time: '103分钟',
					direct: '吴天明',
					starring: '陶泽如 李岷城 嵇波',
					type: 'group',
					url: 'http://139.159.136.187:50080/uploadFiles/image/d02494f7a0c24790f2d10b4d5fc4b613.jpg'
				},
				{
					id: 1,
					name: '流浪地球',
					score: '7.0',
					time: '125 分钟',
					direct: '郭帆',
					genre: '科幻',
					starring: '吴京 屈楚萧 赵今麦',
					type: 'group',
					url: 'http://139.159.136.187:50080/uploadFiles/image/75932d4f57e9ad2f1af692bc4c8ab470.jpeg'
				},
				{
					id: 2,
					name: '我不是药神',
					score: '8.1',
					time: '116 分钟',
					genre: '剧情',
					direct: '文牧野',
					starring: '徐峥 周一围 王传君',
					type: 'group',
					url: 'http://139.159.136.187:50080/uploadFiles/image/340beba0ae805c0f9e8ad5928b0e2fdf.jpeg'
				}
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
				category_id: 0,
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
		this.getScrHeight()
	},
	onLoad() {
		this.circuit = this.swiperList[0].name;
		if (this.$Route.query.id) {
			this.listParams.category_id = this.$Route.query.id;
		}
		if (this.$Route.query.keywords) {
			this.listParams.keywords = this.$Route.query.keywords;
			this.searchVal = this.$Route.query.keywords;
		}
		this.getGoodsList();
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
			this.circuit = this.swiperList[e.detail.current].name;
			this.cardCur = e.detail.current;
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
			that.listParams.category_id = 0;
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
		// 商品列表
		getGoodsList() {
			let that = this;
			that.isLoading = true;
			that.loadStatus = 'loading';
			let res = moreGoodList;
			if (res.code === 1) {
				that.isLoading = false;
				that.goodsList = [...that.goodsList, ...res.data.data];
				that.lastPage = res.data.last_page;
				if (that.listParams.page < res.data.last_page) {
					that.loadStatus = '';
				} else {
					that.loadStatus = 'over';
				}
			}
			/* that.$api('goods.lists', that.listParams).then(res => {
				if (res.code === 1) {
					that.isLoading = false;
					that.goodsList = [...that.goodsList, ...res.data.data];
					that.lastPage = res.data.last_page;
					if (that.listParams.page < res.data.last_page) {
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

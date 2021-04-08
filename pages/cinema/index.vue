<template>
	<view class="page_box">
		<view class="head_box">
			<view class="ci-header">
				<view class="header-info">
					<view class="text-bold text-xxl padding-top">{{detail.cinemaName}}</view>
					<view class="info-local text-black padding-xs">
						<view class="local-adr text-cut">{{detail.cinemaAddress}}</view>
						<view>· 0.1km</view>
					</view>
					<view class="text-gray">好评度 88% {{detail.keysWord.toString()}}</view>
				</view>
				<view class="locate-logo"><image class="logo-img" src="../../static/dingweis.png" mode="aspectFill"></image></view>
			</view>
			<ynGallery
				:galleryheight="165"
				bkstart="#fff"
				bkend="#fff"
				:imgviewwidth="85"
				:imgviewheight="100"
				:showbadge="true"
				badegtype="trian"
				badegwidth="25"
				badegheight="25"
				:showdec="true"
				:images="swiperList"
				@clickimg="onclickimg"
			></ynGallery>
			<sh-date @subClickFtn="fatherMethod"></sh-date>
		</view>
		<scroll-view :style="{ height: headHeight + 'px' }" class="scroll-box" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
			<view class="content-box">
				<view class="goods-list x-f">
					<view class="goods-item" v-for="goods in goodsList" :key="goods.id"><fz-circuit-card :detail="goods" :isTag="true"></fz-circuit-card></view>
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
import shDate from './children/sh-date.vue';
import fzCircuitCard from '@/components/fz-circuit-card/fz-circuit-minicard.vue';
import appEmpty from '@/components/app-empty/app-empty.vue';
import { mapMutations, mapActions, mapState } from 'vuex';
import moreGoodList from '@/csJson/moreGoodList.json';
import ynGallery from '@/components/YnComponents/ynGallery/ynGallery.vue';
import tools from '@/common/utils/tools';
let timer = null;
export default {
	components: {
		shDate,
		ynGallery,
		fzCircuitCard,
		appEmpty
	},
	data() {
		return {
			Msg: '0',
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
					type: 'image',
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
					type: 'image',
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
					type: 'image',
					url: 'http://139.159.136.187:50080/uploadFiles/image/340beba0ae805c0f9e8ad5928b0e2fdf.jpeg'
				}
			],
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '当前选择日期,没有可观影影片,选择其他日期试试~'
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
	computed: {},
	// 触底加载更多
	onReachBottom() {
		console.log(111233);
		if (this.listParams.page < this.lastPage) {
			this.listParams.page += 1;
			this.getGoodsList();
		}
	},
	mounted() {
		this.getScrHeight()
	},
	onLoad() {
		this.setimgs();
		this.listParams.sessionsDate = tools.getDayList('', 0).day;
		this.circuit = this.swiperList[0].name;
		console.log(this.$Route.query)
		if (this.$Route.query.filmId) {
			this.listParams.filmId = this.$Route.query.filmId;
		} 
		if (this.$Route.query) {
			this.detail = this.$Route.query
			this.listParams.cinemaId = this.$Route.query.cinemaId;
		}
		if (this.$Route.query.keywords) {
			this.listParams.keywords = this.$Route.query.keywords;
			this.searchVal = this.$Route.query.keywords;
		}
		this.getMoviesList()
	},
	methods: {
		getScrHeight() {
			let me = this
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
		// 加载更多
		loadMore() {
			if (this.listParams.page < this.lastPage) {
				this.listParams.page += 1;
				this.getGoodsList();
			}
		},
		onclickimg(imgviewobj) {
			this.listParams.filmId = imgviewobj.filmId
			this.goodsList = [];
			this.getGoodsList();
			if (imgviewobj.index != undefined) this.Msg = `${imgviewobj.index}`;
		},
		setimgs() {
			var imgs = [];
			for (let i in this.testimgs) {
				let imgobj = {
					dec: '', //图像描述信息
					badeg: '', //角标文字
					badegcolor: '#000000', //角标颜色
					url: '', //图源
					dominant: '' //主色
				};
				imgobj.url = this.testimgs[i].url;
				imgobj.dominant = this.retcolor(); //随机主色
				imgobj.dec = i; //描述
				imgobj.badeg = i; //角标文字
				imgobj.badegcolor = i % 2 == 0 ? 'red' : 'LimeGreen'; //角标颜色
				imgs.push(imgobj);
			}
			this.testimgs = imgs;
		},
		retcolor() {
			let color = '#' + ('00000' + ((Math.random() * 0x1000000) << 0).toString(16)).substr(-6);
			return color;
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
			that.listParams.cinemaId = null;
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
		fatherMethod(val) {
			this.listParams.sessionsDate = val.day;
			this.goodsList = [];
			this.getGoodsList();
		},
		// 获取影城影片
		getMoviesList() {
			let that = this;
			that.$api('cinema.lists', {cinemaId: that.listParams.cinemaId, filmId: that.listParams.filmId }).then(res => {
				if (res.flag) {
					that.swiperList = res.data;
					if (that.$Route.query.filmId == '') {
						that.listParams.filmId = that.swiperList[0].filmId;
					} 
					console.log(that.listParams.filmId)
					that.getGoodsList();
				}
			});
		},
		// 商品列表
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
		// towerSwiper触摸开始
		TowerStart(e) {
			this.towerStart = e.touches[0].pageX;
		},

		// towerSwiper计算方向
		TowerMove(e) {
			this.direction = e.touches[0].pageX - this.towerStart > 0 ? 'right' : 'left';
		},

		// towerSwiper计算滚动
		TowerEnd(e) {
			let direction = this.direction;
			let list = this.swiperList;
			if (direction == 'right') {
				let mLeft = list[0].mLeft;
				let zIndex = list[0].zIndex;
				for (let i = 1; i < this.swiperList.length; i++) {
					this.swiperList[i - 1].mLeft = this.swiperList[i].mLeft;
					this.swiperList[i - 1].zIndex = this.swiperList[i].zIndex;
				}
				this.swiperList[list.length - 1].mLeft = mLeft;
				this.swiperList[list.length - 1].zIndex = zIndex;
			} else {
				let mLeft = list[list.length - 1].mLeft;
				let zIndex = list[list.length - 1].zIndex;
				for (let i = this.swiperList.length - 1; i > 0; i--) {
					this.swiperList[i].mLeft = this.swiperList[i - 1].mLeft;
					this.swiperList[i].zIndex = this.swiperList[i - 1].zIndex;
				}
				this.swiperList[0].mLeft = mLeft;
				this.swiperList[0].zIndex = zIndex;
			}
			this.direction = '';
			this.swiperList = this.swiperList;
		}
	}
};
</script>

<style lang="scss">
/* .tower-swiper {
	height: 350upx !important;
}
.tower-swiper uni-swiper-item {
	padding: 5px 0 15px !important;
} */
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
	background: linear-gradient(#060210, #fff 20%);
	.ci-header {
		margin: 20rpx;
		background: #fff;
		box-shadow: 1px 0px 1px 0px #ccc;
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
			padding: 18rpx;
			.logo-img {
				top: 30%;
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

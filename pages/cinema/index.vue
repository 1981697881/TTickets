<template>
	<view class="page_box">
		<view class="cu-modal" :class="modalName == 'RadioModal' ? 'show' : ''" @tap="hideModal">
			<view class="cu-dialog" @tap.stop="">
				<radio-group class="block" @change="RadioChange">
					<view class="cu-list menu text-left">
						<view class="cu-item" v-for="(item, index) in storeInfo.customerServicePhoneList" :key="index">
							<label class="flex justify-between align-center flex-sub">
								<view class="flex-sub" @tap="CallPhone(item)">客服电话 ({{ index+1 }}):{{ item }}</view>
							</label>
						</view>
					</view>
				</radio-group>
			</view>
		</view>
		<view class="head_box">
			<view class="ci-header">
				<view class="header-info">
					<view class="text-bold text-xxl">{{ cinemaName }}</view>
					<view class="info-local text-black padding-xs">
						<view class="local-adr text-cut">{{ cinemaAddress }}</view>
						<!-- <view>· 0.1km</view> -->
					</view>
					<!-- <view class="text-gray">好评度 88% {{detail.keysWord.toString() ||""}}</view> -->
				</view>
				<view class="locate-logo" @tap="showModal" data-target="RadioModal">
					<image class="logo-img" src="https://i.postimg.cc/YCNMFFBt/customer-service-96px-1187377-easyicon-net.png" mode="aspectFill"></image>
					<view>影院客服</view>
				</view>
			</view>
			<view class="backgroud" :style="'background:url(' + img + ')'"></view>
			<!-- <swiper class="card-swiper" :current="activeItem" :class="dotStyle ? 'square-dot' : 'round-dot'" :circular="true" duration="500" @change="cardSwiper">
				<swiper-item v-for="(item, cindex) in swiperList" :key="cindex" :class="cardCur == cindex ? 'cur' : ''" style="padding: 15rpx 0 30rpx">
					<view class="swiper-item">
						<image :src="item.url" mode="aspectFill" v-if="item.type == 'image'"></image>
						<video :src="item.url" autoplay loop muted :show-play-btn="false" :controls="false" objectFit="cover" v-if="item.type == 'video'"></video>
						<view class="cir_group">
							<view class="cir_logo" @tap="jump('/pages/cinema/detail/index', { filmId: item.filmId })">
								<view class="tag" >{{item.dimensional}}</view>
								<image :src="item.filmPhoto" mode="aspectFill"></image>
							</view>
							<view class="text-white cir_detail">
								<view class="text-cut de_name">{{ item.filmName }}</view>
								<view class="de_pin">评分：暂无</view>
								<view class="text-orange de_info">{{ item.filmLong || ''}}分钟 | {{ item.filmSortid || ''}}</view>
								<view class="text-orange de_info">导演：{{ item.filmDirector || '' }}</view>
								<view class="text-orange de_info">主演：{{ item.filmPlay || ''}}</view>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper> -->
			<swiper
				class="card-swiper"
				:current="activeItem"
				previous-margin="210rpx"
				:class="dotStyle ? 'square-dot' : 'round-dot'"
				:circular="false"
				duration="300"
				acceleration="true"
				@change="cardSwiper"
			>
				<swiper-item
					v-for="(item, cindex) in swiperList"
					@tap.stop="onClickSwiper(cindex)"
					:key="cindex"
					:class="cardCur == cindex ? 'cur' : ''"
					style="padding: 15rpx 0 30rpx"
				>
					<view class="swiper-item">
						<view class="tag text-white" v-if="item.dimensiona">{{ item.dimensional }}</view>
						<image class="swi-image" :src="item.filmPhoto" mode="aspectFill"></image>
					</view>
				</swiper-item>
			</swiper>
			<view class="movie-info" @tap="jump('/pages/cinema/detail/index', { filmId: cardInfo.filmId })">
				<view class="info-name text-bold text-xxl">{{ cardInfo.filmName }}</view>
				<view class="info-detaild text-gray">
					{{ cardInfo.filmLong }} 分钟 | {{ cardInfo.filmSortid }} | 导演:{{ cardInfo.filmDirector }}
					<text class="cuIcon-right"></text>
				</view>
			</view>
			<!-- <view class="backgroud" :style="'background:url('+img+')'">
					</view>
					<view class="header">
					  <u-swiper class="swiper-container" :options="swiperOption" ref="mySwiper">
					    <u-swiper-slide class="swiper-slide" v-for="(item, cindex) in swiperList" :key="cindex"><image :src="item.filmPhoto" mode="aspectFill"></image></u-swiper-slide>
					  </u-swiper>
					</view>
					<view class="movie-info" @tap="jump('/pages/cinema/detail/index', { filmId: cardInfo.filmId })">
						<view class="info-name text-bold text-xl">{{cardInfo.filmName}}</view>
						<view class="info-detaild text-grey">{{cardInfo.filmLong}} 分钟 | {{cardInfo.filmSortid}} | 导演:{{cardInfo.filmDirector}}<text class='cuIcon-right'></text></view>
					</view> -->
			<!-- <fz-gallery @clickSwiper="cardSwiper" ref="cardSwiper" :swiperList="swiperList" :cardInfo="cardInfo" :img="img"></fz-gallery> -->
			<sh-date ref='shDate' :movieDates="movieDates" @subClickFtn="fatherMethod"></sh-date>
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
/* import fzGallery from '@/components/fz-gallery/fz-gallery.vue'; */
import { mapMutations, mapActions, mapState } from 'vuex';
import moreGoodList from '@/csJson/moreGoodList.json';
import tools from '@/common/utils/tools';
let timer = null;
export default {
	components: {
		shDate,
		/* fzGallery, */
		/* uSwiper:Swiper,
		uSwiperSlide:SwiperSlide, */
		fzCircuitCard,
		appEmpty
	},
	data() {
		return {
			cardInfo: {
				filmDirector: '',
				filmId: '',
				filmLong: '',
				filmName: '',
				filmSortid: ''
			},
			img: '',
			cardCur: 0,
			activeItem: 0,
			Msg: '0',
			cinemaName: '',
			cinemaAddress: '',
			circuit: '',
			cinemaList: [],
			modalName: null,
			dotStyle: false,
			towerStart: 0,
			direction: '',
			PhoneList: [
				{
					Name: '客服电话(1)',
					Phone: '182-8809-0152'
				},
				{
					Name: '客服电话(2)',
					Phone: '189-8814-9921'
				}
			],
			swiperList: [],
			movieDates: [],
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
		this.getScrHeight();
	},
	onShow() {
		let that = this;
		uni.$once('escUpload', function(data) {
			that.listParams.filmId = data.filmId;
			that.getGoodsList(that.listParams);
		});
	},
	onLoad() {
		this.setimgs();
		if (this.$Route.query.filmId) {
			this.listParams.filmId = this.$Route.query.filmId;
		}
		if (this.$Route.query) {
			this.detail = this.$Route.query;
			this.listParams.cinemaId = this.$Route.query.cinemaId;
		}
		if (this.$Route.query) {
			this.listParams.cinemalinkId = this.$Route.query.cinemalinkId;
		}
		if (this.$Route.query.keywords) {
			this.listParams.keywords = this.$Route.query.keywords;
			this.searchVal = this.$Route.query.keywords;
		}
		this.getCinemaList();
	},
	methods: {
		onClickSwiper(cindex) {
			this.cardCur = cindex;
			this.activeItem = cindex;
		},
		cardSwiper(e) {
			if (this.swiperList.length > 0) {
				this.cardInfo = {
					filmDirector: this.swiperList[e.detail.current].filmDirector,
					filmLong: this.swiperList[e.detail.current].filmLong,
					filmId: this.swiperList[e.detail.current].filmId,
					filmName: this.swiperList[e.detail.current].filmName,
					filmSortid: this.swiperList[e.detail.current].filmSortid
				}
				this.movieDates = this.swiperList[e.detail.current].movieDates
				this.listParams.showDatetime = this.swiperList[e.detail.current].movieDates[0];
				this.circuit = this.swiperList[e.detail.current].filmName;
				this.listParams.filmId = this.swiperList[e.detail.current].filmId;
				this.img = this.swiperList[e.detail.current].filmPhoto;
				this.cardCur = e.detail.current;
				this.listParams.page = 1;
				this.goodsList = [];
				this.$nextTick(function(){
					this.$refs.shDate.getDateList()
				})
				this.getGoodsList();
			}
		},
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({ path: path, query: parmas });
		},
		//第二部分  模态框的显示与隐藏
		showModal(e) {
			this.modalName = e.currentTarget.dataset.target;
		},
		hideModal(e) {
			this.modalName = null;
		},
		/*拨打电话*/
		CallPhone(e) {
			uni.makePhoneCall({
				phoneNumber: e
			});
		},
		getScrHeight() {
			let me = this;
			uni.getSystemInfo({
				success: function(res) {
					// res - 各种参数
					let info = uni.createSelectorQuery().select('.head_box');
					info.boundingClientRect(function(data) {
						//data - 各种参数
						me.headHeight = res.windowHeight - data.height - 10;
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
		fatherMethod(val) {
			this.listParams.showDatetime = val.day;
			this.goodsList = [];
			this.getGoodsList();
		},
		// 获取影城
		getCinemaList() {
			let that = this;
			that.$api('cinema.locationList', { cinemalinkId: that.storeInfo.cinemaLinkId, filmId: that.listParams.filmId }).then(res => {
				if (res.flag) {
					that.cinemaList = res.data;
					that.cinemaName = res.data[0].cinemaName;
					that.cinemaAddress = res.data[0].cinemaAddress;
					that.listParams.cinemalinkId = res.data[0].cinemalinkId;
					that.getMoviesList();
				}
			});
		}, // 获取影城影片
		getMoviesList() {
			let that = this;
			that.$api('cinema.locationMovies', { cinemalinkId: that.listParams.cinemalinkId }).then(res => {
				if (res.flag) {
					that.swiperList = res.data;
					if (that.$Route.query.filmId == null) {
						that.listParams.filmId = that.swiperList[0].filmId;
						this.cardInfo = {
							filmDirector: that.swiperList[0].filmDirector,
							filmLong: that.swiperList[0].filmLong,
							filmId: that.swiperList[0].filmId,
							filmName: that.swiperList[0].filmName,
							filmSortid: that.swiperList[0].filmSortid
						};
						that.img = that.swiperList[0].filmPhoto;
						that.movieDates = that.swiperList[0].movieDates;
						that.listParams.showDatetime = that.swiperList[0].movieDates[0];
					} else {
						that.swiperList.forEach((item, index) => {
							if (that.$Route.query.filmId == item.filmId) {
								that.cardCur = index;
								that.activeItem = index;
								that.cardInfo = {
									filmDirector: item.filmDirector,
									filmLong: item.filmLong,
									filmId: item.filmId,
									filmName: item.filmName,
									filmSortid: item.filmSortid
								};
								that.img = item.filmPhoto;
								that.movieDates = item.movieDates;
								that.listParams.showDatetime = item.movieDates[0];
							}
						});
					}
					this.$nextTick(function(){
						this.$refs.shDate.getDateList()
					})
					that.getGoodsList();
				}
			});
		},
		// 场次列表
		getGoodsList() {
			let that = this;
			that.isLoading = true;
			that.loadStatus = 'loading';
			that.$api('cinema.locationSchedules', that.listParams).then(res => {
				if (res.flag) {
					that.isLoading = false;
					that.goodsList = [...res.data];
					that.lastPage = res.data.last_page;
					if (that.listParams.page < res.data.last_page) {
						that.loadStatus = '';
					} else {
						that.loadStatus = 'over';
					}
				}
			});
		}
		/* // towerSwiper触摸开始
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
		} */
	}
};
</script>

<style lang="scss">
.backgroud {
	width: 750rpx;
	height: 280rpx;
	background-size: 200% 200%;
	background-position: 50% 50%;
	background-repeat: no-repeat;
	-webkit-filter: blur(40rpx);
	position: absolute;
	top: 160rpx;
	left: 0;
}
.movie-info {
	width: 100%;
	height: 100rpx;
	text-align: center;
	.info-name {
		line-height: 60rpx;
	}
	.info-detail {
	}
}
.swi-image {
	border: 1px solid #acacac;
	border-radius: 10rpx;
}
.tag {
	position: absolute;
	left: 10rpx;
	width: 100rpx;
	height: 40rpx;
	top: 10rpx;
	z-index: 22;
	line-height: 40rpx;
	background: linear-gradient(132deg, rgba(28, 28, 28, 1), rgba(54, 54, 54, 1), rgba(236, 190, 96, 1));
	border-radius: 0px 18rpx 18rpx 0px;
	padding: 0 10rpx;
	-webkit-transform: scale(0.8);
	font-family: PingFang SC;
	color: white;
}
/* 指示点 */
.wx-swiper-dots .wx-swiper-dot {
	display: none;
}
.card-swiper {
	height: 280upx !important;
}
.card-swiper uni-swiper-item {
	padding: 0 !important;
	width: 200upx !important;
}
.card-swiper swiper-item {
	padding: 0 !important;
	width: 200upx !important;
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
		/* image {
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
		} */
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
.page_box {
	height: auto;
	display: inline-block;
}
/* .tag {
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
} */
.tower-swiper .tower-item {
	transform: scale(calc(0.5 + var(--index) / 10));
	margin-left: calc(var(--left) * 100upx - 150upx);
	z-index: var(--index);
}
.head_box {
	position: -webkit-sticky;
	position: sticky;
	top: 0;
	overflow: hidden;
	z-index: 998;
	background: linear-gradient(#060210, #fff 20%);
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
			border-radius: 0 10rpx 0 0;
			background-color: #8b4513;
			padding-top: 10rpx;
			width: 150rpx;
			color: #ffffff;
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

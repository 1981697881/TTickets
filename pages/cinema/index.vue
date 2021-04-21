<template>
	<view class="page_box">
		 <view class="cu-modal" :class="modalName=='RadioModal'?'show':''" @tap="hideModal">
			  	<view class="cu-dialog" @tap.stop="">
			  		<radio-group class="block" @change="RadioChange">
			  		<view class="cu-list menu text-left">
			  	<view class="cu-item" v-for="(item,index) in PhoneList">
			  	<label class="flex justify-between align-center flex-sub">
			  	<view class="flex-sub" @tap="CallPhone(item.Phone)">{{item.Name}}:{{item.Phone}}</view>
			  		</label>
			  			</view>
			  		</view>
			  	</radio-group>
			  </view>
		  </view>
		<view class="head_box">
			<view class="ci-header">
				<view class="header-info">
					<view class="text-bold text-xxl">{{cinemaName}}</view>
					<view class="info-local text-black padding-xs">
						<view class="local-adr text-cut">{{cinemaAddress}}</view>
						<!-- <view>· 0.1km</view> -->
					</view>
					<!-- <view class="text-gray">好评度 88% {{detail.keysWord.toString() ||""}}</view> -->
				</view>
				<view class="locate-logo" @tap="showModal" data-target="RadioModal">
					<image class="logo-img" src="https://i.postimg.cc/YCNMFFBt/customer-service-96px-1187377-easyicon-net.png" mode="aspectFill"></image>
					<view>影院客服</view>
					</view>
			</view>
			<ynGallery
				:galleryheight="165"
				bkstart="#C6E2FF"
				bkend="#828282"
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
			cinemaName: '',
			cinemaAddress: '',
			circuit: '',
			cinemaList: [],
			modalName:null,
			PhoneList: [{
				Name:'客服电话(1)',
				Phone: '182-8809-0152'
			},{
				Name:'客服电话(2)',
				Phone: '189-8814-9921'
			}],
			swiperList: [
				
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
		}
		if (this.$Route.query.keywords) {
			this.listParams.keywords = this.$Route.query.keywords;
			this.searchVal = this.$Route.query.keywords;
		}
		this.getCinemaList()
	},
	methods: {
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({ path: path, query: parmas });
		},
		//第二部分  模态框的显示与隐藏
		showModal(e) {
			this.modalName = e.currentTarget.dataset.target
		},
		hideModal(e) {
			this.modalName = null
		},
		/*拨打电话*/
		CallPhone(e){
		    uni.makePhoneCall({
				phoneNumber: e
			});
		},
		getScrHeight() {
			let me = this
			uni.getSystemInfo({
				success: function(res) {
					// res - 各种参数
					let info = uni.createSelectorQuery().select('.head_box');
					info.boundingClientRect(function(data) {
						//data - 各种参数
						me.headHeight = res.windowHeight - data.height - 35;
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
		fatherMethod(val) {
			this.listParams.showDatetime = val.day;
			this.goodsList = [];
			this.getGoodsList();
		},
		// 获取影城
		getCinemaList() {
			let that = this;
			that.$api('cinema.locationList', {cinemalinkId: that.listParams.cinemalinkId, filmId: that.listParams.filmId }).then(res => {
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
			that.$api('cinema.locationMovies', {cinemalinkId: that.listParams.cinemalinkId, filmId: that.listParams.filmId }).then(res => {
				if (res.flag) {
					that.swiperList = res.data;
					if (that.$Route.query.filmId == null) {
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
			that.$api('cinema.locationSchedules', that.listParams).then(res => {
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

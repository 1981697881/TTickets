<template>
	<view class="box">
		<cu-custom :isBack="true" bgColor="bg-gray">
			<block slot="backText"></block>
			<block slot="content">{{ goodsInfo.filmName }}</block>
		</cu-custom>
		<view class="load-box" v-if="goodsInfo.type != 'Movie'"><app-skeletons :type="'detail'"></app-skeletons></view>
		<view class="detail_box app-selector" v-else>
			<view class="detail-content">
				<view class="goodes_detail_swiper-box">
					<!-- 购买滚动提示 -->
					<sh-groupon-tip v-if="false"></sh-groupon-tip>
					<view class="carousel">
						<!-- <video controls :poster="goodsInfo.filmPhoto" object-fit="fill" class="swiper-image app-selector-rect" :src="goodsInfo.herald"></video> -->
						<image class="swiper-image app-selector-rect" :src="goodsInfo.filmPhoto" mode="aspectFill" lazy-load></image>
					</view>
					<!-- 详情轮播 -->
					<!-- <swiper class="carousel" circular @change="swiperChange">
						<swiper-item @tap="tools.previewImage(goodsInfo.images, swiperCurrent)" v-for="(img, index) in goodsInfo.images" :key="index" class="carousel-item">
							<image class="swiper-image app-selector-rect" :src="img" mode="aspectFill" lazy-load></image>
						</swiper-item>
					</swiper>
					<view v-if="goodsInfo.images" class="swiper-dots">{{ swiperCurrent + 1 }} / {{ goodsInfo.images.length }}</view> -->
				</view>
				<fz-detail-head :detail="goodsInfo"></fz-detail-head>
				<!-- 选项卡 -->
				<view class="sticky-box">
					<view class="tab-box x-f">
						<view class="tab-item y-f x-c" @tap="onTab(tab.id)" v-for="tab in tabList" :key="tab.id">
							<view class="tab-title">
								{{ tab.title }}
								<text v-if="tab.id == 'tab2'" class="comment-num">({{ commentNum }})</text>
							</view>
							<text class="tab-line" :class="{ 'line-active': tabCurrent === tab.id }"></text>
						</view>
					</view>
					<view class="tab-detail pb20">
						<view class="rich-box" v-show="tabCurrent === 'tab0'">
							<view class="box-about">
								<mote-lines-divide :dt="goodsInfo.filmIntro" :line="1" expandText="展开" foldHint="收起"/>
							</view>
							<view class="about-unline">
								<fz-detail-gallery :detail='goodsInfo' type='crew'></fz-detail-gallery>
							</view>
							<view class="about-unline">
								<fz-detail-gallery :detail='goodsInfo' type='still'></fz-detail-gallery>
							</view>
						</view>
						<view class="goods-size" v-if="tabCurrent === 'tab1'">
							<view class="table-box" v-if="goodsInfo.params && goodsInfo.params.length">
								<view class="t-tr x-f" v-for="t in goodsInfo.params" :key="t.title">
									<view class="t-head x-f">{{ t.title }}</view>
									<view class="t-detail">{{ t.content }}</view>
								</view>
							</view>
						</view>
						<view class="goods-comment" v-if="tabCurrent === 'tab2'">
							<block v-for="comment in commentList" :key="comment.id"><sh-comment :comment="comment"></sh-comment></block>
							<view class="empty-box x-c" v-if="!commentList.length"><app-empty :isFixed="false" :emptyData="emptyData"></app-empty></view>
							<view class="more-box x-c" v-if="commentList.length">
								<button class="cu-btn more-btn x-f" @tap="jump('/pages/goods/comment-list', { goodsId: goodsInfo.id })">
									查看全部
									<text class="cuIcon-right"></text>
								</button>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 其他商品foot -->
			<view class="detail-foot_box  x-f" v-if="!showSku && !showServe && detailType !== 'score'">
				<view class="left x-f">
					<view class="tools-item y-f" @tap="goHome">
						<image class="tool-img app-selector-circular" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/tab_home_sel.png" mode=""></image>
						<text class="tool-title app-selector-rect">首页</text>
					</view>
					<!-- <view class="tools-item y-f" @tap="onFavorite(goodsInfo.id)">
						<image
							class="tool-img"
							:src="Boolean(goodsInfo.favorite) ? 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/favorite_end.png' : 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/favorite.png'"
							mode=""
						></image>
						<text class="tool-title">收藏</text>
					</view> 
					<view class="tools-item y-f" @tap="onShare">
						<image class="tool-img" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/share.png" mode=""></image>
						<text class="tool-title">分享</text>
					</view> -->
				</view>
				<view class="detail-right">
					<view class="detail-btn-box x-ac" v-if="!goodsInfo.activity"><button class="cu-btn tool-btn pay-btn" @tap="jump('/pages/cinema/index', { filmId: filmId })">立即订票</button></view>
				</view>
			</view>
			<!-- 分享组件 -->
			<app-share v-model="showShare" :goodsInfo="goodsInfo" :posterType="'goods'"></app-share>
			<!-- 登录提示 -->
			<app-login-modal></app-login-modal>
			<!-- 骨架屏 -->
			<app-skeleton :showSkeleton="false"></app-skeleton>
			<!-- 自定义底部导航 -->
			<app-tabbar></app-tabbar>
			<!-- 关注弹窗 -->
			<!-- <app-float-btn></app-float-btn> -->
			<!-- 连续弹窗提醒 -->
			<app-notice-modal></app-notice-modal>
		</view>
	</view>
</template>
+
<script>
import MoteLinesDivide from "@/components/mote-lines-divide/mote-lines-divide"
import shGrouponTip from './children/sh-groupon-tip.vue';
import fzDetailHead from './children/fz-detail-head.vue';
import fzDetailGallery from './children/fz-detail-gallery.vue';
import shComment from '../children/sh-comment.vue';
import appSkeletons from '@/components/app-skeletons/app-skeletons.vue';
import appEmpty from '@/components/app-empty/app-empty.vue';
import { mapMutations, mapActions, mapState } from 'vuex';
import goodsDetail from '@/csJson/goodDetail.json';
import evaluate from '@/csJson/evaluate.json';
export default {
	components: {
		shGrouponTip,
		shComment,
		MoteLinesDivide,
		fzDetailHead,
		fzDetailGallery,
		appSkeletons,
		appEmpty
	},
	data() {
		return {
			videoImg: 'http://139.159.136.187:50080/uploadFiles/image/d02494f7a0c24790f2d10b4d5fc4b613.jpg',
			currentSkuText: '', //选中规格
			detailType: '',
			showShare: false,
			filmId: '',
			buyType: 'sku',
			grouponBuyType: 'alone', //拼团购买方式。
			showSku: false,
			showServe: false,
			tools: this.$tools,
			goodsInfo: {},
			commentList: [], //商品评价列表
			commentNum: 0, //商品评价总数
			favorite: false,
			activityRules: {},
			currentSkuList: [],
			confirmGoodsInfo: {},
			swiperCurrent: 0, //轮播下标
			tabCurrent: 'tab0',
			emptyData: {
				img: '/static/imgs/empty/comment_empty.png',
				tip: '暂无评价~'
			},
			tabList: [
				{
					id: 'tab0',
					title: '简介'
				},
				/* {
					id: 'tab1',
					title: '规格参数'
				}, */
				/* {
					id: 'tab2',
					title: '影评'
				} */
			]
		};
	},
	computed: {},
	onLoad() {
		const type = this.$Route.query.type;
		this.filmId = this.$Route.query.filmId
		this.detailType = type;
		switch (type) {
			case 'score':
				this.getScoreDetail();
				break;
			default:
				this.getGoodsDetail();
		}
	},
	onUnload(options){
		let that = this
		let params = {
				filmId: that.filmId
			}
		uni.$emit('escUpload',params)
	},
	onReady() {},
	methods: {
		onBack(){
			this.$Router.back();
		},
		getActivityRules(e) {
			if (e) {
				this.activityRules = JSON.parse(e);
			}
		},
		// 检测
		checkActivity(data, type) {
			if (data) {
				return !data.includes(type);
			}
			return true;
		},
		// 路由跳转
		jump(path, parmas) {
			this.showShare = false;
			this.$Router.replace({
				path: path,
				query: parmas
			});
		},
		// 回到首页
		goHome() {
			uni.switchTab({
				url: '/pages/index/index',
			})
		},
		// 轮播图切换
		swiperChange(e) {
			const index = e.detail.current;
			this.swiperCurrent = index;
		},
		// 选项卡
		onTab(id) {
			this.tabCurrent = id;
		},
		// 商品详情
		getGoodsDetail() {
			let that = this;
			that.$api('cinema.movieMessage', {
				filmId: that.$Route.query.filmId
			}).then(res => {
				if (res.flag) {
					that.goodsInfo = res.data;
					that.goodsInfo.type='Movie';
					that.getCommentList();
					that.setShareInfo({
						query: {
							url: 'goods-' + that.$Route.query.filmId
						},
						title: that.goodsInfo.title,
						image: that.goodsInfo.image
					});
				}else{
					that.$tools.toast(res.msg);
				}
			});
		},
		// 商品评论
		getCommentList() {
			let that = this;
			let res = evaluate;
			if (res.code === 1) {
				that.commentList = res.data.data;
				that.commentNum = res.data.total;
			}
			/* that.$api('goods_comment.list', {
				goods_id: that.goodsInfo.id,
				per_page: 3,
				type: 'all'
			}).then(res => {
				if (res.code === 1) {
					that.commentList = res.data.data;
					that.commentNum = res.data.total;
				}
			}); */
		},
		// 组件返回的type;
		changeType(e) {
			this.buyType = e;
		},
		// 组件返回的规格;
		getSkuText(e) {
			this.currentSkuText = e;
		},
		// 分享
		onShare() {
			this.showShare = true;
		},
		// 立即购买
		goPay() {
			if (Boolean(uni.getStorageSync('token'))) {
				this.buyType = 'buy';
				this.showSku = true;
			} else {
				this.$store.commit('LOGIN_TIP', true);
			}
		},
		// 收藏
		onFavorite(goodsId) {
			let that = this;
			that.$api('goods.favorite', {
				goods_id: goodsId
			}).then(res => {
				if (res.code === 1) {
					that.goodsInfo.favorite = res.data;
					that.$tools.toast(res.msg);
				}
			});
		}
	}
};
</script>

<style lang="scss">
.box {
	padding-bottom: 100rpx;
}
.box-about{
	padding: 30rpx;
	border-bottom: 1px solid #F8F8FF;
}
.about-unline{
	padding: 30rpx;
}
// 拼团玩法
.groupon-play {
	height: 94rpx;
	background: #fff;

	.title {
		font-size: 28rpx;
		color: #999;
	}

	.description {
		font-size: 28rpx;
		margin-left: 30rpx;
	}

	.cuIcon-right {
		margin-left: 20rpx;
	}
}

.load-box {
	/deep/.skeletons_box {
		z-index: 11;
	}
}

.detail-content {
	&::-webkit-scrollbar {
		width: 0;
		height: 0;
		color: transparent;
	}
}
.sticky-box {
	.tab-box {
		position: -webkit-sticky;
		position: sticky;
		top: 2.5rem;
		border-bottom: 1px solid #F8F8FF;
		z-index: 99;
	}
}

// 商品图片轮播

.goodes_detail_swiper-box {
	width: 750rpx;
	height: 400rpx;
	position: relative;
	.carousel {
		width: 750rpx;
		height: 100%;
	}

	.carousel-item {
		width: 750rpx;
		height: 100%;
	}

	.swiper-image {
		width: 750rpx;
		height: 100%;
		background: #ccc;
	}

	.swiper-dots {
		display: flex;
		position: absolute;
		right: 20rpx;
		bottom: 20rpx;
		line-height: 44rpx;
		border-radius: 22rpx;
		padding: 0 15rpx;
		background: rgba(#333, 0.3);
		font-size: 28rpx;
		color: rgba(#fff, 0.9);
	}
}

// 规格卡片
.sku-box {
	line-height: 82rpx;
	background: #fff;
	padding: 0 20rpx;
	margin: 20rpx 0;
	font-size: 28rpx;

	.title {
		color: #999;
		margin-right: 20rpx;
	}

	.cuIcon-right {
		color: #bfbfbf;
		font-size: 36rpx;
	}
}

.goods-title {
	font-size: 28rpx;
	font-weight: 500;
	line-height: 42rpx;
	background-color: #fff;
	padding-bottom: 10rpx;
	padding: 10rpx 20rpx;
}

.sub-title {
	padding: 0 20rpx;
	color: #a8700d;
	font-size: 24rpx;
	font-weight: 500;
	line-height: 42rpx;
	background-color: #fff;
	padding-bottom: 10rpx;
}

// 选项卡
.tab-box {
	height: 102rpx;
	background: #fff;
	border-bottom: 1rpx solid rgba(#dfdfdf, 0.8);
	margin-top: 20rpx;

	.tab-item {
		flex: 1;
		height: 100%;
		position: relative;
		font-size: 30rpx;
		font-weight: bold;

		.tab-line {
			width: 123rpx;
			height: 4rpx;
			left: 50%;
			bottom: 20rpx;
			transform: translateX(-50%);
			background: transparent;
			position: absolute;
			z-index: 2;
		}

		.line-active {
			background: rgba(168, 112, 13, 1);
		}
	}
}

.tab-detail {
	min-height: 300rpx;
	background: #fff;
	background: #fff;

	.rich-box {
		/deep/ img {
			display: block;
		}
	}

	.goods-size {
		padding-top: 30rpx;

		.table-box {
			width: 710rpx;
			margin: auto;
			background: rgba(255, 255, 255, 1);
			border: 1rpx solid rgba(223, 223, 223, 1);

			.t-tr {
				border-bottom: 1rpx solid rgba(223, 223, 223, 1);

				&:last-child {
					border-bottom: none;
				}

				.t-head {
					font-size: 26rpx;
					color: #999;
					flex: 1;
					padding: 15rpx 20rpx;
					height: 100%;
					border-right: 1rpx solid rgba(223, 223, 223, 1);
				}

				.t-detail {
					font-size: 26rpx;
					flex: 4;
					padding: 15rpx 20rpx;
					height: 100%;
				}
			}
		}
	}

	.goods-comment {
		padding-top: 30rpx;
		min-height: 300rpx;

		.more-box {
			height: 100rpx;
			background: #fff;

			.more-btn {
				width: 200rpx;
				height: 60rpx;
				border: 1rpx solid rgba(213, 166, 90, 1);
				border-radius: 30rpx;
				font-size: 26rpx;
				font-weight: 400;
				color: rgba(168, 112, 13, 1);
				padding: 0;
				background: #fff;

				.cuIcon-right {
					font-size: 30rpx;
					margin-left: 10rpx;
				}
			}
		}
	}
}
// 底部工具栏
.detail-foot_box {
	background: rgba(255, 255, 255, 1);
	border-top: 1rpx solid rgba(238, 238, 238, 1);
	width: 100%;
	position: fixed;
	bottom: 0;
	z-index: 999;
	.left,
	.detail-right {
		flex: 1;
		text-align: center;
	}
	.tools-item {
		flex: 1;
		.tool-img {
			width: 46rpx;
			height: 46rpx;
		}
		.tool-title {
			font-size: 22rpx;
			line-height: 22rpx;
			padding-top: 8rpx;
		}
	}

	.detail-btn-box {
		flex: 1;
		line-height: 100rpx;

		display: inline-block;
		.tool-btn {
			font-size: 28rpx;
			font-weight: 500;
			color: rgba(#fff, 0.9);
			width: 210rpx;
			border-radius: 35rpx;
			padding: 0;
			.price {
				font-size: 24rpx;
				font-weight: bold;
				color: rgba(#fff, 0.9);
			}

			.price-title {
				font-size: 20rpx;
				font-weight: 500;
				color: rgba(#fff, 0.9);
				padding-top: 8rpx;
			}
		}

		.add-btn {
			box-shadow: 0px 2rpx 5rpx 0px rgba(102, 103, 104, 0.46);
			background: linear-gradient(90deg, rgba(103, 104, 105, 1), rgba(82, 82, 82, 1));
		}

		.pay-btn {
			box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		}

		.seckill-btn {
			width: 432rpx;
			height: 70rpx;
			background: linear-gradient(93deg, rgba(208, 19, 37, 1), rgba(237, 60, 48, 1));
			box-shadow: 0px 7rpx 6rpx 0px rgba(#ed3c30, 0.22);
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(255, 255, 255, 1);
			border-radius: 35rpx;
			padding: 0;
			margin-right: 20rpx;
		}

		.seckilled-btn {
			width: 432rpx;
			height: 70rpx;
			background: rgba(221, 221, 221, 1);
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: #999999;
			border-radius: 35rpx;
			padding: 0;
			margin-right: 20rpx;
		}

		.groupon-btn {
			width: 210rpx;
			height: 70rpx;
			background: linear-gradient(90deg, rgba(254, 131, 42, 1), rgba(255, 102, 0, 1));
			box-shadow: 0px 7rpx 6rpx 0px rgba(255, 104, 4, 0.22);
			border-radius: 35rpx;
		}
	}
}
</style>

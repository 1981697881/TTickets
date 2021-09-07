<template>
	<view class="page_box">
		<view class="head_box">
			<view class="box-head bg-white sh-grid-box">
				<view class="tool-item y-f" @tap="jump('/pages/cinema/machine/index')">
					<image class="tool-img" src="https://i.postimg.cc/CLLJSwsf/d2b3a41f329684fe1233940e60a2fec4.png" mode="aspectFill"></image>
					<text class="item-title">机台展示</text>
				</view>
			</view>
			<view class="box-head margin-top bg-white flex flex-wrap justify-between align-center">
				<view class="padding-sm"><text class="text-xl text-bold text-orange">在线购币</text></view>
				<view class="padding-sm text-gray">游戏币全场通用</view>
			</view>
		</view>
		<view class="content_box">
			<scroll-view :style="{ height: hHeight + 'px' }" class="scroll-box bg-white" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
				<view class="content-box">
					<view class="goods-list x-f">
						<view
							class="goods-item"
							v-for="(goods, index) in goodsList"
							:key="index"
							@tap="
								jump('/pages/order/payment/chargeMoney', {
									goodsDescribe: goods.goodsDescribe,
									coinCount: goods.coinCount,
									goodsName: goods.goodsName,
									goodsPrice: goods.goodsPrice,
									goodsId: goods.goodsId,
									integral: goods.integral
								})
							"
						>
							<fz-circuit-meal :detail="goods" :colorItem="colorList[index].name" :tabId="tabId" :isTag="true"></fz-circuit-meal>
						</view>
					</view>
					<!-- 加载更多 -->
					<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
					<!-- load -->
					<app-load v-model="isLoading"></app-load>
				</view>
			</scroll-view>
		</view>
		<view class="foot_box"></view>
		<!-- 自定义底部导航 -->
		<!-- <app-tabbar></app-tabbar> -->
		<!-- 关注弹窗 -->
		<!-- <app-float-btn></app-float-btn> -->
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
		<!-- 门店选择 -->
		<app-address-model :init="init"></app-address-model>
	</view>
</template>

<script>
import moreGoodList from '@/csJson/moreGoodList.json';
import fzCircuitMeal from '@/components/fz-circuit-card/fz-circuit-meal.vue';
import AppPay from '@/common/app-pay';
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	components: {
		fzCircuitMeal
	},
	data() {
		return {
			hHeight: '0',
			listParams: {
				keywords: '',
				page: 1
			},
			payType: 'wechat',
			colorList: this.ColorList,
			isLoading: false, //loading和空白页。
			loadStatus: '', //loading,over
			lastPage: 1,
			goodsList: []
		};
	},
	props: {
		tabId: ''
	},
	mounted() {
		this.getScrHeight();
		this.init();
	},
	computed: {
		...mapState({
			balInfo: state => state.user.balInfo,
			userInfo: state => state.user.userInfo
		})
	},
	created() {},
	methods: {
		init() {
			this.getGoodsList();
		},
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
						me.hHeight = res.windowHeight - data.height;
					}).exec();
				}
			});
		},
		// 商品列表
		getGoodsList() {
			let me = this;
			let that = this;
			that.isLoading = true;
			that.loadStatus = 'loading';
			that.$api('goods.commodityList', { goodsType: 1 }).then(res => {
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
			this.$Router.push({
				path: path,
				query: parmas
			});
		}
	}
};
</script>

<style lang="scss">
// 宫格
.sh-grid-box {
	background: #fff;
	display: flex;
	flex-wrap: wrap;
	padding-bottom: 30rpx;

	.tool-item {
		width: (750rpx/3);
		.tool-img {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			// background: #ccc;
		}

		.item-title {
			font-size: 24rpx;
			font-family: PingFang SC;
			font-weight: 500;
			line-height: 24rpx;
			padding-top: 10rpx;
		}
	}
}
.card-swiper {
	height: 350upx !important;
}
.card-swiper uni-swiper-item {
	padding: 5px 0 15px !important;
}
.content-box {
	width: 750rpx;
}
.box-head {
	border-bottom: 1px solid #e8eacf;
}
.goods-list {
	flex-wrap: wrap;
	.goods-item {
		width: 100%;
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

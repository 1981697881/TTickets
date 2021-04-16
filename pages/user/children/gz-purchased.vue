<template>
	<view>
		<view class="head_box">
			<view class="filter-item"></view>
			<scroll-view :style="{ height: hHeight + 'px' }" class="scroll-box" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
				<view class="content-box">
					<view class="goods-list x-f">
						<view class="goods-item" v-for="goods in goodsList" :key="goods.cinemaId" >
							<app-orderlist :detail="goods"></app-orderlist>
						</view>
					</view>
					<!-- 加载更多 -->
					<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
					<!-- load -->
					<app-load v-model="isLoading"></app-load>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import moreGoodList from '@/csJson/moreGoodList.json';
import appOrderlist from '@/components/app-orderlist/app-orderlist.vue';
export default {
	components: {
		appOrderlist
	},
	data() {
		return {
			hHeight: '0',
			listParams: {
				keywords: '',
				page: 1
			},
			isLoading: false, //loading和空白页。
			loadStatus: '', //loading,over
			lastPage: 1,
			goodsList: []
		};
	},
	props: {
		tabId: '',
	},
	mounted() {
		this.getScrHeight();
		this.getGoodsList();
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
					let info = uni.createSelectorQuery().select('.head_box');
					info.boundingClientRect(function(data) {
						//data - 各种参数
						me.hHeight = res.windowHeight - data.height - 3 - 35;
					}).exec();
				}
			});
		},
		onFilter(e) {
			this.listParams.order = e;
			this.goodsList = [];
			this.listParams.page = 1;
			this.getGoodsList();
		},
		// 订单列表
		getGoodsList() {
			let that = this;
			that.isLoading = true;
			that.$api('user.cdKeysList', {
				openId: uni.getStorageSync('openid')
			}).then(res => {
				if (res.flag) {
					that.isLoading = false;
					that.goodsList = [...res.data];
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

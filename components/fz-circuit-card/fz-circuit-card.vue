<template>
	<view class="goods-box" v-if="detail" >
		<view class="content-box">
			<text v-if="isTag && detail.activity" class="tag-star"><text class="lg text-red cuIcon-favorfill"></text></text>
			<view class="cont_one">
				<view class="o_name">
					<text class="text-cut text-xl text-bold">广州WeChat影城广州店</text>
					<text class="tip" v-if="!(isTag && detail.activity)">上次来过</text>
				</view>
				<view class="o_price">
					<text>39</text>
					起
				</view>
			</view>
			<view class="cont_two">
				<view class="t_score text-yellow">好评度99% |</view>
				<view class="t_address"><text class="text-cut text-grey">白云区太和镇龙归镇龙岗路100号广场1楼</text></view>
				<view class="t_distance">1.0km</view>
			</view>
			<view class="flex flex-wrap">
				<view class="padding-xs" v-for="(item, tagindex) in ColorList" :key="tagindex" v-if="item.name != 'white'">
					<view class="cu-tag" :class="'line-' + item.name">{{ item.title }}</view>
				</view>
			</view>
		</view>
		<view class="swiper-box x-f">
			<swiper class="carousel" @change="swiperChange">
				<swiper-item v-for="(goods, swindex) in goodsList" :key="swindex" class="carousel-item">
					<view class="min-goods" @tap="jump('/pages/cinema/movie/list', { id: detail.id })">
						<view class="price-box">
							<view class="y-f text-white">
								<text class="text-xl seckill-current">15:35</text>
								<text class="text-xs seckill-current">国语 2D</text>
								<text class="text-xl original text-red">￥{{ detail.original_price }}</text>
							</view>
						</view>
						<view class="title"><slot name="titleText"></slot></view>
					</view>
				</swiper-item>
			</swiper>
		</view>
	</view>
</template>

<script>
export default {
	name: 'fzCircuitCard',
	components: {},
	data() {
		return {
			goodsList: [{},{},{},{},],
			swiperCurrent: 0,
			ColorList: [
				{
					title: '可退票',
					name: 'red',
					color: '#e54d42'
				},
				{
					title: '可改签',
					name: 'orange',
					color: '#f37b1d'
				},
				{
					title: '中国巨幕厅',
					name: 'yellow',
					color: '#fbbd08'
				},
				{
					title: '可停车',
					name: 'olive',
					color: '#8dc63f'
				}
			],
			tagPath: {
				groupon: '/static/imgs/groupon_tag.png',
				seckill: '/static/imgs/seckill_tag.png'
			}
		};
	},
	props: {
		isTag: {
			type: [Boolean, String],
			default: false
		},
		detail: {
			type: Object,
			default: null
		}
	},
	computed: {},
	methods: {
		swiperChange(e) {
			this.swiperCurrent = e.detail.current;
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

<style scoped lang="scss">
// 轮播

.swiper-box,
.carousel {
	width: 100%;
	height: 170rpx;
	position: relative;
	.carousel-item {
		width: auto !important;
		height: 100%;
		// padding: 0 28upx;
	}
}
.goods-box {
	width: 100%;
	background: #fff;
	padding-bottom: 20rpx;
	border-radius: 20rpx;
	overflow: hidden;
	.content-box {
		width: 100%;
		height: 200rpx;
		overflow: hidden;
		position: relative;
		padding: 20rpx;
		.cont_one {
			display: flex;
			.o_name {
				width: 570rpx;
				display: inline-flex;
			}
			.o_price {
				display: inline-flex;
				line-height: 56rpx;
				text {
					color: rgba(225, 33, 43, 1);
				}
				&:before {
					content: '￥';
					color: rgba(225, 33, 43, 1);
					font-size: 26rpx;
				}
			}
			.tip {
				width: 120rpx;
				line-height: 56rpx;
				background: rgba(246, 242, 234, 1);
				font-size: 22rpx;
				font-family: PingFang SC;
				font-weight: 400;
				color: rgba(168, 112, 13, 1);
			}
		}
		.cont_two {
			line-height: 56rpx;
			display: flex;
			.t_score {
				font-size: 22rpx;
				font-family: PingFang SC;
				font-weight: 400;
				display: inline-flex;
			}
			.t_address {
				width: 420rpx;
				display: inline-flex;
			}
			.t_distance {
				display: inline-flex;
			}
		}
		.tag-star {
			position: absolute;
			right: 0;
			top: 0;
			z-index: 2;
			width: 0;
			height: 0;
			border-top: 60upx solid #ffe4b5;
			border-left: 60upx solid transparent;
			text {
				top: -55upx;
				left: -32upx;
				position: absolute;
				z-index: 999;
				display: inline-block;
			}
		}
	}
	.min-goods {
		clear: both;
		width: 190rpx;
		margin: 20rpx;
		height: 130rpx;
		box-shadow: 5px 5px 5px #888888;
		line-height: 35rpx;
		margin-top: 0;
		border-radius: 10rpx;
		background: #696969;
		.price-box {
			width: 100%;
			margin-top: 10rpx;
			.seckill-current {
				padding-top: 10rpx;
				font-family: PingFang SC;
				font-weight: 400;
			}
			.original {
				font-size: 20rpx;
				font-family: PingFang SC;
				font-weight: 400;
				margin-left: 14rpx;
			}
			.cr_name {
				font-size: 20rpx;
			}
		}
		.tagb text {
			font-size: 22rpx;
			font-weight: bold;
		}
		.title {
			font-size: 26rpx;
		}
	}
}
</style>

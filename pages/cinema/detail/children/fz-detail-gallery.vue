<template>
	<view class="seckill-goods" v-if="showActivity">
		<view class="title-box x-bc">
			<text class="title" v-if="type == 'crew'">演职人员</text>
			<text class="title" v-else>剧照</text>
			<!-- <view class="group-people x-f">
				<text class="tip">更多</text>
				<text class="cuIcon-right"></text>
			</view> -->
		</view>
		<view v-if="type == 'crew'" class="goods-box swiper-box x-f">
			<swiper class="carousel" @change="swiperChange">
				<swiper-item v-for="(item, index) in detail.filmRoleVOS" :key="index" class="carousel-item"> 
					<view class="min-goods">
						<view :class="type=='still'?'img-boxt':'img-box'"><image class="img" :src="item.starPhotoUrl" mode="scaleToFill"></image></view>
						<view v-if="type == 'crew'" class="info-box">
							<view class="y-f">
								<text class="cr_name text-black text-cut">{{item.starName}}</text>
								<text class="text-gray seckill-current">{{item.roleType}}</text>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>
		<view v-else class="goods-box swiper-box x-f">
			<swiper class="carousel" @change="swiperChange">
				<swiper-item v-for="(item, index) in detail.photoArrays" :key="index" class="carousel-item">
					<view class="min-goods">
						<view :class="type=='still'?'img-boxt':'img-box'"><image class="img" :src="item" mode="scaleToFill"></image></view>
					</view>
				</swiper-item>
			</swiper>
		</view>
	</view>
</template>

<script>
import seckill from '@/csJson/seckill.json';
import {
	API_URL
} from '@/env'
export default {
	components: {},
	data() {
		return {
			header: API_URL,
			time: {}, //倒计时
			goodsList: [],
			swiperCurrent: 0,
			showActivity: true //是否显示活动。
		};
	},
	props: {
		detail: {
			type: Object,
			default: null
		},
		type: {
			type: String,
			default: 'still'
		}
	},
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

<style lang="scss">
// 轮播

.swiper-box{
	border-radius: 20rpx;
	width: 700rpx;
	
}
.carousel {
	width: 100%;
	height: 300rpx;
	.carousel-item {
		width: auto !important;
		// padding: 0 28upx;
		.min-goods {
			margin-right: 20rpx;
			background: #fff;
			.img-box {
				width: 152rpx;
				height: 190rpx;
				overflow: hidden;
				position: relative;
				.tag {
					position: absolute;
					left: 0;
					top: 0rpx;
					z-index: 2;
					line-height: 30rpx;
					background: linear-gradient(132deg, rgba(28, 28, 28, 1), rgba(54, 54, 54, 1), rgba(236, 190, 96, 1));
					border-radius: 0px 18rpx 18rpx 0px;
					padding: 0 10rpx;
					font-size: 18rpx;
					font-family: PingFang SC;
					color: white;
				}
				.tagb {
					position: absolute;
					left: 0;
					bottom: 0rpx;
					z-index: 2;
					line-height: 35rpx;
					border-radius: 0px 18rpx 18rpx 0px;
					padding: 0 10rpx;
					font-size: 20rpx;
					font-family: PingFang SC;
					color: white;
				}
				.img {
					width: 100%;
					height: 100%;
					border-radius: 10rpx;
					background-color: #ccc;
				}
			}
			.img-boxt {
				width: 300rpx;
				height: 190rpx;
				overflow: hidden;
				position: relative;
				.tag {
					position: absolute;
					left: 0;
					top: 0rpx;
					z-index: 2;
					line-height: 30rpx;
					background: linear-gradient(132deg, rgba(28, 28, 28, 1), rgba(54, 54, 54, 1), rgba(236, 190, 96, 1));
					border-radius: 0px 18rpx 18rpx 0px;
					padding: 0 10rpx;
					font-size: 18rpx;
					font-family: PingFang SC;
					color: white;
				}
				.tagb {
					position: absolute;
					left: 0;
					bottom: 0rpx;
					z-index: 2;
					line-height: 35rpx;
					border-radius: 0px 18rpx 18rpx 0px;
					padding: 0 10rpx;
					font-size: 20rpx;
					font-family: PingFang SC;
					color: white;
				}
				.img {
					display: inline-block;
					width: 100%;
					height: 100%;
					border-radius: 10rpx;
					background-color: #ccc;
				}
			}
			.info-box {
				width: 100%;
				margin-top: 10rpx;
				.original {
					font-size: 20rpx;
					font-weight: 400;
					text-decoration: line-through;
					color: rgba(153, 153, 153, 1);
					margin-left: 14rpx;
				}
				.cr_name {
					width: 150rpx;
					text-align: center;
					font-size: 33rpx;
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

	.swiper-image {
		width: 100%;
		height: 100%;
		// border-radius: 10upx;
		background: #ccc;
	}
}

.swiper-dots {
	display: flex;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	bottom: 0rpx;
	z-index: 66;

	.dot {
		width: 45rpx;
		height: 3rpx;
		background: #eee;
		border-radius: 50%;
		margin-right: 10rpx;
	}

	.dot-active {
		width: 45rpx;
		height: 3rpx;
		background: #a8700d;
		border-radius: 50%;
		margin-right: 10rpx;
	}
}
// 今日必拼+限时抢购
.seckill-goods {
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;

	.title-box {
		padding-bottom: 20rpx;

		.title {
			font-size: 32rpx;
			font-weight: bold;
		}

		.group-people {
			.tip {
				font-size: 28rpx;
				padding-left: 30rpx;
				color: #666;
			}

			.cuIcon-right {
				font-size: 30rpx;
				line-height: 28rpx;
				color: #666;
			}
		}
	}

	.goods-box {
		.goods-item {
			margin-right: 22rpx;
			&:nth-child(4n) {
				margin-right: 0;
			}
		}
	}
}
</style>

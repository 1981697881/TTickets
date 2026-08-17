<template>
	<view class="goods-box" v-if="detail" >
		<view class="content-box" @tap="jump('/pages/cinema/index', info)">
			<text v-if="isTag && detail.activity" class="tag-star"><text class="lg text-red cuIcon-favorfill"></text></text>
			<view class="cont_one">
				<view class="o_name">
					<text class="text-cut text-xl text-bold">{{detail.cinemaName}}</text>
					<text class="tip" v-if="(isTag && detail.activity)">上次来过</text>
				</view>
				<view class="o_price">
					<text>{{detail.prices}}</text>
					起
				</view>
			</view>
			<view class="cont_two">
				<view class="t_score text-yellow">好评度99% |</view>
				<view class="t_address"><text class="text-cut text-grey">{{detail.cinemaAddress}}</text></view>
				<view class="t_distance">1.0km</view>
			</view>
			<view class="flex flex-wrap">
				<template v-for="(item, tagindex) in cinemaKeysWord" :key="tagindex">
					<view class="padding-xs" v-if="item && item.name && item.name !== 'white'">
						<view class="cu-tag radius" :class="'line-' + item.name">{{ item.title }}</view>
					</view>
				</template>
			</view>
		</view>
		<view class="swiper-box x-f" v-if="tabId=='ended'">
			<swiper class="carousel" @change="swiperChange">
				<swiper-item v-for="(goods, swindex) in detail.scheduleVOS" :key="swindex" class="carousel-item">
					<view class="min-goods" @tap="jump('/pages/cinema/movie/list', { scheduleId: goods.scheduleId,schedulekey:goods.schedulekey,language: goods.language,dimensional: goods.dimensional,filmName:goods.filmName,showDatetime: goods.showDatetime})">
						<view class="price-box">
							<view class="y-f text-black">
								<text class="text-bold seckill-current">{{ formatShowTime(goods.showDatetime) }}</text>
								<text class="seckill-lau text-grey">{{goods.language}} {{goods.dimensional}}</text>
								<text class="original text-red">￥{{ goods.standardprice }}</text>
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
import { DEFAULT_COLOR_LIST } from '@/common/runtime/platform.js';

export default {
	name: 'fzCircuitCard',
	components: {},
	data() {
		return {
			goodsList: [],
			swiperCurrent: 0,
			info: {},
			cinemaKeysWord: [],
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
		tabId: '',
		filmId: {
			type: String,
			default: ''
		},
		detail: {
			type: Object,
			default: null
		}
	},
	watch: {
		detail: {
			immediate: true,
			handler(value) {
				this.buildCardData(value);
			}
		}
	},
	methods: {
		getColorList() {
			const list = (this.ColorList && this.ColorList.length ? this.ColorList : DEFAULT_COLOR_LIST) || [];
			return Array.isArray(list) && list.length ? list : DEFAULT_COLOR_LIST;
		},
		buildCardData(detail) {
			if (!detail || typeof detail !== 'object') {
				this.info = {};
				this.cinemaKeysWord = [];
				return;
			}
			const info = { ...detail };
			delete info.marshallinDetail;
			delete info.schedules;
			delete info.cinemaContact;
			delete info.status;
			delete info.cinemaKeysWord;
			delete info.cinemaMessage;
			delete info.cinemaPhone;
			delete info.cinemaTel;
			delete info.createDatetime;
			delete info.editDatetime;
			delete info.scheduleVOS;
			info.filmId = this.filmId;

			const colorList = this.getColorList();
			const keywords = Array.isArray(info.keysWord) ? info.keysWord : [];
			this.cinemaKeysWord = keywords
				.map((title, index) => {
					const color = colorList[index % colorList.length];
					if (!color || !color.name) return null;
					return {
						name: color.name,
						title
					};
				})
				.filter(Boolean);
			info.keysWord = keywords;
			this.info = info;
		},
		formatShowTime(value) {
			const text = String(value || '');
			return text.length >= 16 ? text.substring(11, 16) : '--:--';
		},
		swiperChange(e) {
			this.swiperCurrent = e.detail.current;
		},
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
		height: auto;
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
		background: #F8F8FF;
		box-shadow: 0px 1px 1px 0px #ccc;
		line-height: 35rpx;
		margin-top: 0;
		border-radius: 10rpx;
		.price-box {
			width: 100%;
			margin-top: 10rpx;
			padding-left: 10rpx;
			.y-f{
				.seckill-current {
					width: 100%;
					padding-top: 5rpx;
					font-family: PingFang SC;
				}.seckill-lau {
					width: 100%;
					padding-top: 5rpx;
					margin-left: -18rpx;
					-webkit-transform: scale(0.9);
					font-family: PingFang SC;
				}
				.original {
					width: 100%;
					margin-left: -18rpx;
					-webkit-transform: scale(0.9);
					padding-top: 5rpx;
					font-family: PingFang SC;
				}
				.cr_name {
					font-size: 20rpx;
				}
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

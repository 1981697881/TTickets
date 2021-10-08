<template>
	<view class="goods-box" v-if="detail">
		<view class="content-box" @tap="jump('/pages/cinema/movie/list', { sectionId: detail.sectionId,scheduleId: detail.scheduleId,schedulekey:detail.scheduleKey,language: detail.language,dimensional: detail.dimensional,filmName:detail.filmName,filmId:detail.filmId,showDatetime:detail.showDatetime,hallId:detail.hallId,hallName:detail.hallName || ''})">
			<text v-if="isTag && detail.status" class="tag-star"><text class="lg text-red cuIcon-favorfill"></text></text>
			<view class="cont_one">
				<view><text class="text-xl text-bold">{{detail.showDatetime.substring(11,16)}}</text></view>
				<view><text class="text-gray">{{endDateTime}}</text></view>
			</view>
			<view class="cont_two">
				<view><text class="text-xs text-bold">{{detail.language}} {{detail.dimensional}}</text></view>
				<view><text class="text-gray">{{detail.hallName}}</text></view>
			</view>
			<view class="cont_three">
				<view class="o_price">会员{{detail.settleprice.replace('.00','')}}元</view>
				<view class="text-olive text-xs">￥{{detail.standardprice.replace('.00','')}}</view>
			</view>
			<view class="cont_four"><button class="cu-btn bg-pink round ">购票</button></view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'fzCircuitMiniCard',
	components: {},
	data() {
		return {
			goodsList: [],
			swiperCurrent: 0,
			platform: uni.getStorageSync('platform'),
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
	computed:{
		endDateTime:function () {
		  let that = this
		  return that.$tools.dateFormat('HH:MM', new Date(Date.parse(that.detail.showDatetime.replace(/-/g,'/'))+Number(that.detail.duration*60000))) 
		}
	},
	created() {
	},
	methods: {
		swiperChange(e) {
			this.swiperCurrent = e.detail.current;
		},
		// 路由跳转
		jump(path, parmas) {
			console.log(parmas)
			this.$Router.push({
				path: path,
				query: parmas
			});
		}
	}
};
</script>

<style scoped lang="scss">
.o_price {
	color: rgba(225, 33, 43, 1);
	/* &:before {
		content: '￥';
		color: rgba(225, 33, 43, 1);
		font-size: 26rpx;
	} */
}
.o_price2 {
	&:before {
		content: '￥';
		font-size: 26rpx;
	}
}
.goods-box {
	width: 100%;
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	.content-box {
		width: 100%;
		overflow: hidden;
		position: relative;
		padding: 20rpx;
		display: flex;
		font-family: PingFang SC;
		flex-direction: row;
		.cont_one {
			width: 170rpx;
		}
		.cont_two {
			padding-top: 8rpx;
			width: 200rpx;
		}
		.cont_three {
			text-align: right;
			width: 230rpx;
		}
		.cont_four {
			padding-top: 20rpx;
			text-align: right;
			width: 200rpx;
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
}
</style>

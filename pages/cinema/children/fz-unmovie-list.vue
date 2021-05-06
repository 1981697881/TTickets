<template>
	<view class="activity-goods-box x-bc" >
		<view class="img-box" @tap="jump('/pages/cinema/detail/index', { filmId: detail.filmId })">
			<slot name="tag"></slot>
			<image class="img" :src="detail.filmPhoto" mode="scaleToFill"></image>
		</view>
		<view class="goods-right y-bc" @tap="jump('/pages/cinema/detail/index', { filmId: detail.filmId })">
			<view class="title text-bold text-xl">{{ detail.filmName }}</view>
			<!-- <view class="tip">暂无评分</view> -->
			<view class="slod-end text-gray">导演：{{detail.filmDirector.trim()}}</view>
			<view class="slod-end text-gray">主演：{{detail.filmPlay.trim()}}</view>
			<view class="slod-end text-gray">类型：{{detail.filmSortid}}</view>
		</view>
		<view class="btn-right" >
			<button class="cu-btn buy-btn bg-orange" @tap="jump('/pages/cinema/index', { filmId: detail.filmId })">购票</button>
		</view>
	</view>
</template>

<script>
export default {
	name: 'shoproActivityCard',
	components: {},
	data() {
		return {};
	},
	props: {
		detail: {
			type: Object,
			default: null
		}
	},
	mounted() {
	},
	computed: {},
	created() {},
	methods: {
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({ path: path, query: parmas });
		}
	}
};
</script>

<style lang="scss">
.activity-goods-box {
	margin: 20rpx;
	height: 280rpx;
	box-shadow: 1px 2px 2px 2px #CCCCCC;
	border-radius: 10rpx;
	background: #fff;
	flex-wrap: wrap;
	.img-box {
		padding: 0px 20rpx 20rpx 20rpx;
		padding-bottom: 0;
		width: 200rpx;
		overflow: hidden;
		position: relative;
		.img {
			width: 200rpx;
			box-shadow: 2px 2px 2px 2px #CCCCCC;
			border-radius: 15rpx;
			height: 220rpx;
			background-color: #ccc;
		}
	}
	.goods-right {
		width: 350rpx;
		min-height: 230rpx;
		position: relative;
		align-items: flex-start;
		position: relative;
		.title { 
			line-height: 50rpx;
		}
		.tip {
			color: #a8700d;
		}
	}
	.btn-right{
		padding-right: 15rpx;
	}
}
.activity-goods-box:nth-child(odd){
	margin-bottom: 0;
}
</style>

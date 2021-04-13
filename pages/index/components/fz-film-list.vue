<template>
	<view class="min-goods">
		<view class="img-box" @tap="jump('/pages/cinema/detail/index', { filmId: detail.filmId })">
			<view class="tag" v-if="detail.type === 'Movie'">{{detail.dimensional}}</view>
			<view class="tagb" v-if="detail.type === 'Movie'">评分: <text>{{ detail.score|| '暂无' }}</text></view>
			<image class="img" :src="detail.filmPhoto" mode="scaleToFill"></image>
		</view>
		<view class="price-box">
			<view class="y-f" @tap="jump('/pages/cinema/circuit/list', { filmId: detail.filmId })" v-if="detail.type === 'Movie'">
				<view class="text-cut cr_name ">{{ detail.filmName}}</view>
				<view class="seckill-current"><button class="cu-btn bg-red round sm">购票</button></view>
			</view>
			<view class="y-f" v-else>
				<text class="seckill-current">￥{{ detail.type === 'Movie' ? detail.groupon_price : detail.price }}</text>
				<text class="original">￥{{ detail.original_price }}</text>
			</view>
		</view>
		<view class="title"><slot name="titleText"></slot></view>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {};
	},
	props: {
		detail: Object
	},
	computed: {},
	methods: {
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({ path: path, query: parmas });
		}
	}
};
</script>

<style lang="scss">
.min-goods {
	width: 152rpx;
	background: #fff;
	.img-box {
		width: 152rpx;
		height: 200rpx;
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
	.price-box {
		width: 100%;
		margin-top: 10rpx;
		.seckill-current {
			font-size: 30rpx;
			font-weight: 500;
			color: rgba(225, 33, 43, 1);
		}
		.original {
			font-size: 20rpx;
			font-weight: 400;
			text-decoration: line-through;
			color: rgba(153, 153, 153, 1);
			margin-left: 14rpx;
		}
		.cr_name {
			max-width: 150rpx;
			font-size: 20rpx;
		}
	}
	.tagb text{
		font-size: 22rpx;
		font-weight: bold;
	}
	.title {
		font-size: 26rpx;
	}
}
</style>

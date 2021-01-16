<template>
	<view class="ci-header">
		<view class="locate-logo">
			<view class="tag">2D IMAX</view>
			<image class="logo-img" src="http://139.159.136.187:50080/uploadFiles/image/d02494f7a0c24790f2d10b4d5fc4b613.jpg" mode="scaleToFill"></image>
		</view>
		<view class="header-info">
			<view class="text-bold text-xxl padding-top">百鸟朝凤</view>
			<view class="info-text text-gray">128分钟 / 剧情 / 中国大陆</view>
			<view class="info-text text-gray">2020-12-31 18:00 在中国大陆上映</view>
		</view>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {
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
.ci-header {
	background: white;
	border-radius: 40rpx 40rpx 0 0;
	width: 100%;
	display: inline-flex;
	.header-info {
		padding-top: 15rpx;
		.info-text{
			padding-top: 15rpx;
			margin-left: -15rpx;
			font-family: PingFang SC;
			-webkit-transform: scale(0.9);
		}
	}
	.locate-logo {
		position: relative;
		padding: 30rpx;
		.tag {
			position: absolute;
			left: 20rpx;
			top: 35rpx;
			z-index: 2;
			line-height: 30rpx;
			background: linear-gradient(132deg, rgba(28, 28, 28, 1), rgba(54, 54, 54, 1), rgba(236, 190, 96, 1));
			border-radius: 0px 18rpx 18rpx 0px;
			padding: 0 10rpx;
			font-family: PingFang SC;
			color: white;
			-webkit-transform: scale(0.8);
		}
		.logo-img {
			width: 180rpx;
			height: 220rpx;
			border-radius: 10rpx;
		}
	}
}
</style>

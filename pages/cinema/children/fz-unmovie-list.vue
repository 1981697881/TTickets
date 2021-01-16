<template>
	<view class="activity-goods-box x-bc" @tap="jump('/pages/wallet/detail/index', { id: cardId })">
		<view class="img-box">
			<slot name="tag"></slot>
			<image class="img" :src="img" mode="scaleToFill"></image>
		</view>
		<view class="goods-right y-bc" >
			<view class="title text-bold text-xl">{{ title }}</view>
			<view class="tip">暂无评分</view>
			<view class="slod-end text-gray">导演：凌雪松</view>
			<view class="slod-end text-gray">主演：郭秋成 李艳</view>
			<view class="slod-end text-gray">下周一上映</view>
		</view>
		<view class="btn-right" >
			<button class="cu-btn buy-btn bg-blue">预售</button>
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
		cardId: 0,
		img: '',
		title: '',
		subtitle: '',
		price: '',
		tabId: '',
		originalPrice: ''
	},
	mounted() {
		console.log(this.tabId)
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
	margin: 30rpx;
	height: 280rpx;
	box-shadow: 1px 2px 2px 2px #f6f6f6;
	border-radius: 10rpx;
	background: #fff;
	flex-wrap: wrap;
	.img-box {
		padding: 20rpx;
		padding-bottom: 0;
		width: 200rpx;
		overflow: hidden;
		position: relative;
		.img {
			width: 200rpx;
			border-radius: 15rpx;
			height: 200rpx;
			background-color: #ccc;
		}
	}
	.goods-right {
		padding: 20rpx;
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
</style>

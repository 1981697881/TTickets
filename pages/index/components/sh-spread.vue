<template>
	<view class="adv-box mx20 mb10">
		<!-- 模板1-->
		<view class="x-f" v-if="detail.style == 1">
			<image src="https://i.postimg.cc/gj3t4Fwr/u-1942294908-891367187-fm-26-gp-0.jpg" mode="scaleToFill"></image>
		</view>
		<view class="box-fot flex flex-wrap justify-between ">
			<view class="fot-left">
				<view class="text-xl padding-xs text-black text-bold">电影推荐</view>
				<view class="padding-xs">04/01/2021 00:00</view>
			</view>
			<view class="fot-right">
				<button class="cu-btn round sm bg-blue margin-right">正在进行</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {};
	},
	props: {
		detail: {}
	},
	computed: {},
	created() {},
	methods: {
		// 路由跳转
		jump(path) {
			this.$tools.routerTo(path);
		}
	}
};
</script>

<style lang="scss">
.adv-box {
	background-color: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	.box-fot{
		height: 150rpx;
		.fot-left{}
		.fot-right{
			line-height: 130rpx;
		}
	}
	image {
		width:710rpx;
		height: 220rpx;
		// background-color: #ccc;
	}
}
</style>

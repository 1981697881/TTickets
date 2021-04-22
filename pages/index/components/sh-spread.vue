<template>
	<view class="adv-box mx20 mb10" @tap="routerTo('https://mp.weixin.qq.com/s/gCc876ut4AtVd59JM_xY0w')">
		<!-- 模板1-->
		<view class="x-f" v-if="detail.style == 1">
			<image src="https://i.postimg.cc/C1yRTTzZ/20210422191833.png" mode="scaleToFill" lazy-load></image>
		</view>
		<view class="box-fot flex flex-wrap justify-between " >
			<view class="fot-left">
				<view class="text-xl padding-xs text-black text-bold">电影推荐</view>
				<view class="padding-xs">05/01/2021 00:00</view>
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
		return {
			routerTo: this.$tools.routerTo
		};
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
		height: 350rpx;
		// background-color: #ccc;
	}
}
</style>

<template>
	<view class="adv-box mb10" v-if="detail" @tap="jump('/pages/cinema/machine/detail', {playId: detail.playId})">
		<!-- 模板1 -->
		<view class="x-f x-image">
			<image :src='"https://cfzx.gzfzdev.com/movie/uploadFiles/image/"+detail.playPhoto' mode="scaleToFill" lazy-load></image>
		</view>
		<view class="box-fot flex flex-wrap justify-between " >
			<view class="fot-left">
				<view class="text-xl padding-left  text-red text-bold">{{detail.playName}}</view>
			</view>
			<view class="fot-right">
				<button class="cu-btn round  lines-blue sm shadow margin-right">机台简介</button>
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
		detail: {
			type: Object,
			default: {}
		}
	},
	computed: {},
	created() {
		console.log(this.detail)
	},
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

<style lang="scss">
.adv-box {
	background-color: #fff;
	border-radius: 20rpx;
	margin-left: 30rpx;
	margin-right: 30rpx;
	margin-top: 30rpx;
	overflow: hidden;
	position: relative;
	box-shadow: -1px 1px 1px 1px #FAB6B6;
	.box-fot{
		height: 80rpx;
		.fot-left{
			line-height: 80rpx;
			text-shadow: 1px 1px 1px #CCCCCC;
			font-style:italic;
		}
		.fot-right{
			line-height: 80rpx;
		}
	}
	.x-image{
		height: 250rpx;
		position: relative;
	}
	image {
		width:100%;
		height: 250rpx;
		z-index: 99;
		position: absolute;
		// background-color: #ccc;
	}
}
</style>

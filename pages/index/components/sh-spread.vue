<template>
	<view class="adv-box mb10" v-if="detail.list.length>0" @tap="routerTo(detail.list[0].posterUrl)">
		<!-- 模板1-->
		<view class="x-f">
			<image :src="'https://cfzx.gzfzdev.com/movie/uploadFiles/image/'+detail.list[0].posterPhoto" mode="scaleToFill" lazy-load></image>
		</view>
		<view class="box-fot flex flex-wrap justify-between " >
			<view class="fot-left">
				<view class="text-xl padding-xs text-black text-bold">{{detail.list[0].posterName}}</view>
				<view class="padding-xs">{{detail.list[0].posterContent}}</view>
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
		width:100%;
		height: 350rpx;
		// background-color: #ccc;
	}
}
</style>

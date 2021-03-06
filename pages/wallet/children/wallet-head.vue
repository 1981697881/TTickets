<template>
	<view class="group-head">
		<view class="head-title"><text></text></view>
		<view class="head-buttitle"><text></text></view>
		<view class="head-btn" v-if="detail.state=='end'">
			<view><button @tap.stop="jump('/pages/order/add-comment', { id: detail.id })" class="cu-btn buy-btn">评价影片</button></view>
			<view><button @tap.stop="jump('/pages/order/add-comment', { id: detail.id })" class="cu-btn buy-btn">评价影院</button></view>
		</view>
		<view class="head-btnt" v-if="detail.state=='restEnd'">
			<view><button @tap.stop="jump('/pages/order/add-comment', { id: detail.id })" class="cu-btn buy-btn">查看退款</button></view>
		</view>
	</view>
</template>

<script>
export default {
	components: {},
	
	data() {
		return {
			TabCur: 0,
			scrollLeft: 0
		};
	},
	methods: {
		tabSelect(e) {
			this.TabCur = e.currentTarget.dataset.id;
			this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
		}
	},
	props: {
		detail: {
			type: Object,
			default: null
		},
	},
	
};
</script>

<style scoped lang="scss">
.group-head {
	width: 100%;
	padding: 40rpx;
	.head-title {
		text-align: center;
		font-size: 40rpx;
		line-height: 90rpx;
		font-family: PingFang SC;
		font-weight: 550;
		color: rgba(255, 255, 255, 1);
	}
	.head-buttitle {
		text-align: center;
		font-size: 30rpx;
		line-height: 50rpx;
		font-family: PingFang SC;
		color: #F8F8FF;
	}
	.head-btn {
		display: flex;
		flex-wrap: wrap;
		padding-top: 20rpx;
		view{
			display: inline-flex;
			justify-content: center;
			width: 50%;
			button {
				align-items: center;
				background: none;
				color: #F8F8FF;
				border-radius: 30rpx;
				border: 1px solid #F8F8FF;
			}
		}
		
	}
	.head-btnt{
		padding-top: 20rpx;
		width: 100%;
		view{
			text-align: center;
			button {
				background: none;
				color: #eeeed1;
				border-radius: 30rpx;
				border: 1px solid #eeeed1;
			}
		}
	}
		
}
</style>

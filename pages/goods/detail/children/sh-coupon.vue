<template>
	<!-- 详情优惠券轮播 -->
	<view class="category-box app-selector-rect">
		<swiper class="swiper-box" @change="onSwiper" circular :autoplay="false" :interval="3000" :duration="1000">
			<swiper-item v-for="(c, index) in couponList" :key="c.id">
				<view class="tab-list x-c"><app-coupon :couponData="c" :state="0"></app-coupon></view>
			</swiper-item>
		</swiper>
		<view class="category-dots">
			<text :class="categoryCurrent === index ? 'category-dot-active' : 'category-dot'" v-for="(dot, index) in couponList.length" :key="index"></text>
		</view>
	</view>
</template>

<script>
import appCoupon from '@/components/app-coupon/app-coupon.vue';
export default {
	components: {
		appCoupon
	},
	data() {
		return {
			categoryCurrent: 0 //分类轮播下标
		};
	},
	props: {
		couponList: {}
	},
	computed: {},
	onLoad() {},
	methods: {
		// 轮播
		onSwiper(e) {
			this.categoryCurrent = e.detail.current;
		}
	}
};
</script>

<style lang="scss">
.category-box {
	padding-top: 20rpx;
	background: #fff;
}
.category-box,
.swiper-box {
	position: relative;
	height: 220rpx;
	margin-bottom: 20rpx;
	.tab-list {
		/deep/.coupon-wrap {
			width: 710rpx;
		}
	}

	.category-dots {
		display: flex;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: 15rpx;

		.category-dot {
			width: 40rpx;
			height: 3rpx;
			background: #eeeeee;
			margin-right: 10rpx;
		}

		.category-dot-active {
			width: 40rpx;
			height: 3rpx;
			background: #a8700d;
			margin-right: 10rpx;
		}
	}
}
</style>

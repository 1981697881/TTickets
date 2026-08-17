<template>
	<!-- 轮播 -->
	<view class="banner-swiper-box" v-if="detail.list && detail.list.length">
		<swiper class="banner-carousel app-selector-rect" circular @change="swiperChange" :autoplay="detail.list.length > 1" :interval="4200">
			<swiper-item v-for="(item, index) in detail.list" :key="index" class="carousel-item " @tap="routerTo(item.path)">
				<image class="swiper-image " :src="item.image" mode="scaleToFill" lazy-load></image>
			</swiper-item>
		</swiper>
		<view class="banner-swiper-dots">
			<text :class="swiperCurrent === index ? 'banner-dot-active' : 'banner-dot'" v-for="(dot, index) in detail.list.length" :key="index"></text>
		</view>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			swiperCurrent: 0, //轮播下标
			routerTo: this.$tools.routerTo
		};
	},
	props: {
		detail: {
			type: Object,
			default: () => ({ list: [] })
		}
	},
	methods: {
		swiperChange(e) {
			this.swiperCurrent = e.detail.current;
		},
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
// 轮播
.banner-swiper-box {
	background: transparent;
	margin: 28rpx 30rpx 34rpx;
	overflow: hidden;
	border-radius: 26rpx;
	box-shadow: 0 14rpx 38rpx rgba(25, 27, 18, 0.09);
}

.banner-swiper-box,
.banner-carousel {
	width: calc(100vw - 60rpx);
	height: 360rpx;
	position: relative;

	.carousel-item {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.swiper-image {
		width: 100%;
		height: 100%;
		border-radius: 26rpx;
	}
}

.banner-swiper-dots {
	display: flex;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	bottom: 18rpx;
	z-index: 66;

	.banner-dot {
		width: 10rpx;
		height: 10rpx;
		background: rgba(255, 255, 255, 0.75);
		border-radius: 10rpx;
		margin-right: 10rpx;
	}

	.banner-dot-active {
		width: 28rpx;
		height: 10rpx;
		background: var(--tt-primary);
		border-radius: 10rpx;
		margin-right: 10rpx;
	}
}
</style>

<template>
	<!-- 轮播 -->
	<view class="banner-swiper-box" v-if="detail.list && detail.list.length">
		<canvas canvas-id="colorThief" class="hide-canvas"></canvas>
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
import colorThief from 'miniapp-color-thief';

export default {
	components: {},
	data() {
		return {
			swiperCurrent: 0, //轮播下标
			webviewId: 0,
			routerTo: this.$tools.routerTo
		};
	},
	props: {
		detail: {
			type: Object,
			default: () => ({ list: [] })
		}
	},
	computed: {},
	created() {
		/* this.initBgColor(); */
	},
	methods: {
		// 轮播切换
		swiperChange(e) {
			this.swiperCurrent = e.detail.current;
			/* this.initBgColor(); */
		},
		// 初始化背景颜色，轮播图没滚动前
		initBgColor() {
			if (this.detail.list[this.swiperCurrent].bgcolor) {
				let bgcolor = this.detail.list[this.swiperCurrent].bgcolor;
			} else {
				let bgcolor = '';
			}
			this.$emit('getbgcolor', bgcolor);
		},
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
.hide-canvas {
	position: fixed !important;
	top: -99999upx;
	left: -99999upx;
	z-index: -99999;
}

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

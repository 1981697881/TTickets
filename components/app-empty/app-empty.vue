<template>
	<view class="y-f" :class="{ 'app-empty': isFixed }">
		<image v-if="safeEmpty.img" class="empty-img" :src="safeEmpty.img" mode="aspectFill"></image>
		<view class="empty-text">{{ safeEmpty.tip }}</view>
		<view class="btn-box" v-if="safeEmpty.path">
			<button class="cu-btn empty-btn" @tap="tools.routerTo(safeEmpty.path)">{{ safeEmpty.pathText }}</button>
		</view>
	</view>
</template>

<script>
const DEFAULT_EMPTY = {
	img: '/static/imgs/empty/empty_goods.png',
	tip: '暂无数据',
	path: '',
	pathText: '去看看'
};

export default {
	name: 'appEmpty',
	components: {},
	data() {
		return {
			tools: this.$tools
		};
	},
	props: {
		emptyData: {
			type: Object,
			default: () => ({ ...DEFAULT_EMPTY })
		},
		isFixed: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		safeEmpty() {
			const raw = this.emptyData && typeof this.emptyData === 'object' ? this.emptyData : {};
			return {
				img: raw.img || DEFAULT_EMPTY.img,
				tip: raw.tip || DEFAULT_EMPTY.tip,
				path: raw.path || '',
				pathText: raw.pathText || DEFAULT_EMPTY.pathText
			};
		}
	},
	methods: {}
};
</script>

<style lang="scss">
.app-empty {
	position: fixed;
	z-index: 11;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
.empty-img {
	width: 540rpx;
	height: 290rpx;
}
.empty-text {
	font-size: 26rpx;
	color: #999;
}
.btn-box {
	margin-top: 100rpx;
	.empty-btn {
		width: 320rpx;
		height: 70rpx;
		background: linear-gradient(90deg, var(--tt-primary, #a9b238), var(--tt-primary-strong, #8f981e));
		border-radius: 35rpx;
		font-size: 28rpx;
		color: rgba(#fff, 0.9);
	}
}
</style>

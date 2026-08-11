<template>
	<view class="cu-load load-modal" v-if="loadModal">
		<!-- <view class="cuIcon-emojifill text-orange"></view> -->
		<image class="load-img" src="/static/imgs//logo/logo.gif" mode="aspectFit"></image>
		<view class="locad-text">加载中...</view>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {};
	},
	props: {
		modelValue: { default: undefined },
		value: { default: undefined }
	},
	emits: ['update:modelValue', 'input'],
	computed: {
		loadModal: {
			get() {
				return this.modelValue === undefined ? this.value : this.modelValue;
			},
			set(val) {
				this.$emit('update:modelValue', val);
				this.$emit('input', val);
			}
		}
	},
	methods: {}
};
</script>

<style lang="scss">
.cu-load.load-modal {
	box-shadow: none;
	background: none;
	&:after {
		content: none;
	}
	.locad-text {
		color: #666;
	}
	.load-img {
		width: 80rpx;
		height: 80rpx;
	}
}
</style>

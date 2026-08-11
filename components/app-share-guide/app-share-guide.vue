<template>
	<app-safe-popup v-model="showModal" plain max-width="640rpx">
		<view class="cu-dialog1">
			<image class="guide-img" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/share_guide.png" mode=""></image>
		</view>
	</app-safe-popup>
</template>

<script>
export default {
	name: 'appShareGuide',
	components: {},
	data() {
		return {};
	},
	props: {
		modelValue: { type: Boolean, default: undefined },
		value: {},
		modalType: {
			type: String,
			default: ''
		}
	},
	computed: {
		showModal: {
			get() {
				return this.modelValue === undefined ? Boolean(this.value) : this.modelValue;
			},
			set(val) {
				this.$emit('update:modelValue', val);
				this.$emit('input', val);
			}
		}
	},
	methods: {
		hideModal() {
			this.showModal = false;
		}
	}
};
</script>

<style lang="scss">
.guide-img {
	width: 580rpx;
	height: 430rpx;
}
.cu-dialog1 {
	vertical-align: top;
}
</style>

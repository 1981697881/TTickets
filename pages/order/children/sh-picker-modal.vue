<template>
	<app-safe-popup v-model="showModal" type="bottom" aria-label="选择优惠券">
		<view class="modal-box">
			<view class="modal-head x-bc">
				<text></text>
				<text class="head-title">选择优惠券</text>
				<text class="cuIcon-roundclosefill" @tap="hideModal"></text>
			</view>
			<view class="modal-content">
				<label class="radio-item x-bc" @tap="selCoupon(0)">
					<text class="coupon-title">不使用优惠券</text>
					<radio class="orange coupon-radio" :class="{ checked: radioId === 0 }" :checked="radioId === 0"></radio>
				</label>
				<label class="radio-item x-bc" v-for="(radio, index) in pickerData.couponList" :key="radio.user_coupons_id" @tap="selCoupon(index + 1)">
					<text class="coupon-title">{{ radio.name }}:{{ `满${radio.enough}减${radio.amount}` }}</text>
					<radio class="orange coupon-radio" :class="{ checked: radioId === index + 1 }" :checked="radioId === index + 1"></radio>
				</label>
			</view>
			<view class="modal-foot x-c"><button class="cu-btn serve-btn" @tap="saveCoupon">确定</button></view>
		</view>
	</app-safe-popup>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			radioId: 0
		};
	},
	props: {
		modelValue: { type: Boolean, default: undefined },
		value: {},
		pickerData: {}
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
		},
		selCoupon(index) {
			this.radioId = index;
			this.$emit('changeCoupon', this.radioId - 1);
		},
		saveCoupon() {
			this.showModal = false;
		}
	}
};
</script>

<style lang="scss" scoped>
.modal-box {
	width: 100%;
	height: 700rpx;
	max-height: 100%;
	display: flex;
	flex-direction: column;
	border-radius: 30rpx 30rpx 0 0;
	background: #fff;
	padding: 30rpx;
	box-sizing: border-box;
	overflow: hidden;

	.serve-btn {
		width: 100%;
		height: 80rpx;
		margin: 0;
		background: var(--tt-primary, #a9b238);
		border-radius: 40rpx;
		color: rgba(#fff, 0.9);
	}

	.modal-head {
		flex-shrink: 0;
		margin-bottom: 30rpx;

		.head-title {
			font-size: 32rpx;
			font-weight: bold;
		}

		.cuIcon-roundclosefill {
			font-size: 34rpx;
			color: #e0e0e0;
		}
	}

	.modal-content {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		.radio-item {
			width: 100%;
			padding: 10rpx 0;
			.coupon-title {
				font-size: 28rpx;
			}
			.coupon-radio {
				transform: scale(0.8);
			}
		}
	}
	.modal-foot {
		flex-shrink: 0;
		padding-top: 24rpx;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}
	:deep(.uni-radio-input-checked) {
		background-color: #f37b1d !important;
		border: #f37b1d !important;
	}
}
</style>

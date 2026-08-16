<template>
	<app-safe-popup v-model="showModal" type="bottom" aria-label="选择优惠券">
			<view class="modal-box page_box">
				<view class="modal-head x-bc">
					<text></text>
					<text class="head-title">选择优惠券</text>
					<text class="cuIcon-roundclosefill" @tap="hideModal"></text>
				</view>
				<view class="modal-content content_box y-f">
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
	width: 750rpx;
	height: 700rpx;
	height: min(700rpx, calc(100vh - 120rpx));
	height: min(700rpx, calc(100dvh - 120rpx));
	display: flex;
	flex-direction: column;
	border-radius: 30rpx 30rpx 0 0;
	background: #fff;
	padding: 30rpx;
	box-sizing: border-box;

	.serve-btn {
		width: 690rpx;
		height: 80rpx;
		background: linear-gradient(90deg, rgba(240, 199, 133, 1), rgba(246, 214, 157, 1));
		border-radius: 40rpx;
		color: rgba(#fff, 0.9);
		margin-top: 40rpx;
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
	.modal-foot { flex-shrink: 0; }
	:deep(.uni-radio-input-checked) {
		background-color: #f37b1d !important;
		border: #f37b1d !important;
	}
}
</style>

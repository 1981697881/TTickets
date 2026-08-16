<template>
	<view class="modal-content content_box y-f" >
		<label class="radio-item x-bc" @tap="selCoupon(0)" v-if="pickerData.length>0">
			<text class="coupon-title">不使用优惠券</text>
			<radio class="orange coupon-radio" :class="{ checked: radioId === 0 }" :checked="radioId === 0"></radio>
		</label>
		<label class="radio-item x-bc" v-if="pickerData.length>0" v-for="(radio, index) in pickerData" :key="radio.id || index" @tap="selCoupon(index + 1)">
			<view class="coupon-copy">
				<text class="coupon-title">{{ radio.couponName }}：{{ `满${radio.fullPrice}减${radio.reducePrice}` }}</text>
				<text class="coupon-validity" v-if="couponValidity(radio)">有效期：{{ couponValidity(radio) }}</text>
			</view>
			<radio class="orange coupon-radio" :class="{ checked: radioId === index + 1 }" :checked="radioId === index + 1"></radio>
		</label>
		<!-- 空白页 -->
		<app-empty :isFixed="false" v-if="pickerData.length==0" :emptyData="emptyData"></app-empty>
	</view>
</template>
<script>
export default {
	components: {},
	data() {
		return {
			isLoading: false, //loading和空白页。
			radioId: 0,
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '抱歉，当前没有可用优惠券~'
			},
		};
	},
	props: {
		value: {},
		pickerData: {
			type: Array,
			default: () => []
		}
	},
	computed: {
		
	},
	methods: {
		formatDate(value) {
			if (value === null || value === undefined || value === '') return '';
			const text = String(value);
			const matched = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
			if (matched) {
				return `${matched[1]}-${matched[2].padStart(2, '0')}-${matched[3].padStart(2, '0')}`;
			}
			const numeric = Number(value);
			const date = new Date(Number.isFinite(numeric) ? (numeric < 1000000000000 ? numeric * 1000 : numeric) : value);
			if (Number.isNaN(date.getTime())) return '';
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${date.getFullYear()}-${month}-${day}`;
		},
		couponValidity(coupon) {
			const start = this.formatDate(coupon.startDate || coupon.startTime);
			const end = this.formatDate(coupon.endDate || coupon.endTime);
			if (start && end) return `${start} 至 ${end}`;
			return end || start;
		},
		resetCouponList(){
			this.radioId = 0
		},
		selCoupon(index) {
			this.radioId = index;
			this.$emit('changeCoupon', this.radioId - 1);
		},
	}
};
</script>

<style lang="scss">
.modal-content {
	padding: 15rpx;
		.radio-item {
			width: 100%;
			min-height: 104rpx;
			padding: 14rpx 4rpx;
			border-bottom: 1rpx solid var(--tt-border);
			.coupon-copy {
				min-width: 0;
				flex: 1;
				display: flex;
				flex-direction: column;
			}
			.coupon-title {
				font-size: 28rpx;
			}
			.coupon-validity {
				margin-top: 8rpx;
				font-size: 22rpx;
				line-height: 32rpx;
				color: var(--tt-text-muted);
			}
			.coupon-radio {
				transform: scale(0.8);
			}
		}
	}
	.uni-radio-input-checked {
		background-color: #f37b1d !important;
		border: #f37b1d !important;
	}
</style>

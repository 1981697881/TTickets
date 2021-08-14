<template>
	<view class="modal-content content_box y-f" >
		<label class="radio-item x-bc" @tap="selCoupon(0)" v-if="pickerData.length>0">
			<text class="coupon-title">不使用优惠券</text>
			<radio class="orange coupon-radio" :class="{ checked: radioId === 0 }" :checked="radioId === 0"></radio>
		</label>
		<label class="radio-item x-bc" v-if="pickerData.length>0" v-for="(radio, index) in pickerData" :key="radio.index" @tap="selCoupon(index + 1)">
			<text class="coupon-title">{{ radio.couponName }}:{{ `满${radio.fullPrice}减${radio.reducePrice}` }}</text>
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
			default: []
		}
	},
	computed: {
		
	},
	methods: {
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
			padding: 10rpx 0;
			.coupon-title {
				font-size: 28rpx;
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

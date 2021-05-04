<template>
	<view class="modal-content content_box y-f">
		<!-- <label class="radio-item x-bc" @tap="selCoupon(0)" v-if="pickerData.length>0">
			<text class="coupon-title">不使用抵用券</text>
			<radio class="orange coupon-radio" :class="{ checked: radioId === 0 }" :checked="radioId === 0"></radio>
		</label> -->
		<checkbox-group class="check-box">
			<label class="radio-item x-bc" v-if="pickerData.length>0" v-for="(radio, index) in pickerData" :key="radio.id" @tap="selCoupon(index)">
				<text class="coupon-title">{{ radio.couponName }}</text>
				<checkbox class="orange coupon-radio" :class="{ checked: checkId.includes(index) }" :checked="checkId.includes(index)"></checkbox>
			</label>
		</checkbox-group>
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
			checkId: [],
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '抱歉，当前没有可用抵用券~'
			},
		};
	},
	props: {
		value: {},
		
		pickerData: {
			type: Array,
			default: []
		},
		hallLength: {
			type: Number,
			default: 0
		}
	},
	computed: {
		
	},
	methods: {
		selCoupon(index) {
			let that = this
			if(that.checkId.length>0){
				console.log(that.hallLength)
				console.log(that.checkId.length)
				console.log(that.checkId.length<=that.hallLength)
				if(that.checkId.length<=that.hallLength){
					if(that.checkId.indexOf(index)==-1){
						that.checkId.push(index)
					}else{
						that.checkId.splice(that.checkId.indexOf(index),1)
					}
				}else{
					return uni.showToast({
						title: '最多只能选择'+that.hallLength+'张抵用券',
						duration: 1000
					});
				}
			}else{
				that.checkId.push(index)
			}
			this.$emit('changeCouponGroup', that.checkId);
		},
	}
};
</script>

<style lang="scss">
	
.modal-content {
	padding: 15rpx;
	.check-box{
		width: 100%;
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
	}
	.uni-radio-input-checked {
		background-color: #f37b1d !important;
		border: #f37b1d !important;
	}
</style>

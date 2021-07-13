<template>
	<view class="modal-content content_box y-f">
		<!-- <label class="radio-item x-bc" @tap="selCoupon(0)" v-if="pickerData.length>0">
			<text class="coupon-title">不使用抵用券</text>
			<radio class="orange coupon-radio" :class="{ checked: radioId === 0 }" :checked="radioId === 0"></radio>
		</label> -->
		<checkbox-group class="check-box" @change="selCoupon">
			<label class="radio-item x-bc" v-if="pickerData.length > 0" v-for="(radio, index) in pickerData" :key="index">
				<text class="coupon-title">{{ radio.couponName }}<text class="text-red padding-left">(需补{{ radio.couponId == '2'? '0': hallImbalance}}元)</text></text>
				<checkbox
					class="orange coupon-radio"
					:value="radio.id.toString()"
					:disabled="radio.disabled"
					:class="{ checked: checkArray.includes(radio.id.toString()) }"
					:checked="checkArray.includes(radio.id.toString())"
				></checkbox>
			</label>
		</checkbox-group>
		<!-- 空白页 -->
		<app-empty :isFixed="false" v-if="pickerData.length == 0" :emptyData="emptyData"></app-empty>
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
				tip: '抱歉，当前没有可用抵用券~'
			}
		};
	},
	props: {
		value: {},
		pickerData: {
			type: Array,
			default: []
		},
		checkArray: {
			type: Array,
			default: []
		},
		hallLength: {
			type: Number,
			default: 0
		},
		hallImbalance: {
			type: Number,
			default: 0
		}
	},
	mounted() {
		
	},
	created() {
		this.pickerData.forEach((element, index) => {
			// 不包含选中项时禁用组件
			console.log(this.checkArray)
			if (this.checkArray.indexOf(element.id.toString()) == -1) {
				element.disabled = true;
			}
		});
	},
	computed: {},
	methods: {
		resetCouponList(){
			this.pickerData.forEach((element, index) => {
				element.disabled = false;
			});
			this.$forceUpdate()
		},
		selCoupon(e) {
			let that = this;
			// 判断选中项长度是否超过指定长度
			if (that.hallLength <= e.detail.value.length) {
				// 取出最后一位选中项的值
				// 禁用其余复选框
				const checked = e.detail.value;
				this.pickerData.forEach((element, index) => {
					// 不包含选中项时禁用组件
					if (checked.indexOf(element.id.toString()) == -1) {
						element.disabled = true;
					}
				});
				if(e.detail.value.length > that.hallLength){
					const lastChecked = e.detail.value.pop();
					 // 获取所有复选框标签的dom的集合
					const labels = document.getElementsByClassName('uni-label-pointer');
					// 判断选中项的标签
					labels.forEach(element => {
						if (element.innerText == lastChecked) {
							// 获取到选中项标签中关闭选中样式的集合
							const lastInput = element.getElementsByClassName('uni-checkbox-input');
							// 定时器延时清除,实时清除的话,dom元素还未生成
								that.$nextTick(()=>{
									lastInput[0].classList.remove('uni-checkbox-input-checked');
								})
						}
					});
				}
				// 提示用户
				that.$tools.toast('最多选择' + that.hallLength + '张抵用券');
			} else {
				// 还原复选框状态
				this.pickerData.forEach(element => {
					element.disabled = false;
				});
			}
			that.$emit('changeCouponGroup', e.detail.value);
			/* if (that.checkId.length > 0) {
				if (that.checkId.length < that.hallLength) {
					if (that.checkId.indexOf(index) == -1) {
						that.checkId.push(index);
					} else {
						that.checkId.splice(that.checkId.indexOf(index), 1);
					}
				} else {
					that.pickerData.forEach((item, index) => {
						console.log(that.checkId.indexOf(item));
						if (that.checkId.indexOf(item) == -1) {
							item.disable = true;
						}
					});
				}
			} else {
				that.checkId.push(index);
			}
			console.log(that.checkId);
			this.$emit('changeCouponGroup', that.checkId); */
		},
	}
};
</script>

<style lang="scss">
.modal-content {
	padding: 15rpx;
	.check-box {
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

<template>
	<view class="bank-wrap">
		<view class="form-box">
				<view class="form-item flex align-center justify-between">
						<view class="x-f">
							<view class="item-title">兑换码:</view>
							<input class="item-input flex-sub" type="text" v-model="code.value" placeholder="请输入兑换码" placeholder-class="pl-input" />
						</view>
						<button class="cu-btn code-btn" @tap.stop="getCode"><text class="cuIcon-scan"></text></button>
				</view>
		</view>
		<view class="btn-box flex align-center justify-center"><button class="cu-btn confirem-btn" @tap="exchange">兑换</button></view>
	</view>
</template>

<script>
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	components: {},
	props: {
		exchangeCode: {
			type: Object,
			default: {}
		},
	},
	data() {
		return {
			code: {
				status: false,
				value: ''
			},
			type: '',
			phone: ''
		};
	},
	computed: {},
	onLoad() {},
	mounted() {
		this.code.value = this.exchangeCode.exchangeCode
		this.type = this.exchangeCode.type
	},
	methods: {
		...mapActions(['getUserInfo']),
		//兑换
		exchange() {
			let that = this;
			console.log(that.type)
			if(that.type =='exchangeCode'){
				that.$api('user.exchangeCdKey', {
					openId: uni.getStorageSync('openid'),
					memberCdkeyShare: that.code.value
				}).then(res => {
					if (res.flag) {
						that.code.value= ''
						that.$tools.toast('兑换成功');
						/* that.getUserInfo(); */
					}else{
						that.$tools.toast(res.msg);
					}
				});
			}else if(that.type =='exchangeTCode'){
				that.$api('user.getLimitCoupon', {
					openId: uni.getStorageSync('openid'),
					exchangeCode: that.code.value
				}).then(res => {
					if (res.flag) {
						that.code.value= ''
						that.$tools.toast('兑换成功');
						/* that.getUserInfo(); */
					}else{
						that.$tools.toast(res.msg);
					}
				});
			}
		},
		GetRequest(urlStr) {
			if (typeof urlStr == 'undefined') {
				var url = decodeURI(location.search); //获取url中"?"符后的字符串
			} else {
				var url = '?' + urlStr.split('?')[1];
			}
			var theRequest = new Object();
			if (url.indexOf('?') != -1) {
				var str = url.substr(1);
				var strs = str.split('&');
				for (var i = 0; i < strs.length; i++) {
					theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
				}
			}
			return theRequest;
		},
		getCode() {
			let that = this
			uni.scanCode({
				success: function(res) {
					if (typeof that.GetRequest(res.result).exchangeCode != "undefined") {
						that.type = 'exchangeCode'
						that.code.value = that.GetRequest(res.result).exchangeCode
					}
					if(typeof that.GetRequest(res.result).exchangeTCode != "undefined"){
						that.type = 'exchangeTCode' 
						that.code.value = that.GetRequest(res.result).exchangeTCode
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.form-box {
	background: #fff;
	border-radius: 10rpx;
	.form-item {
		height: 96rpx;
		border-bottom: 1rpx solid rgba(#dfdfdf, 0.9);
		padding: 0 25rpx;
		position: relative;
		.item-title {
			color: #333;
			font-size: 28rpx;
			font-weight: 600;
		}
		.item-input {
			font-size: 28rpx;
			color: #333;
			padding-left: 20rpx;
			width: 300rpx;
		}
		.pl-input {
			color: #999;
		}
		.code-btn {
			background: none;
			font-size: 28rpx;
			color: #a8700d;
			position: absolute;
			top: 50%;
			padding: 0;
			transform: translateY(-50%);
			right: 30rpx;
		}
	}
}
.notice {
	color: #999;
	font-size: 24rpx;
	padding: 0 25rpx;
	height: 90rpx;
}
.btn-box {
	margin-top: 60rpx;
	.confirem-btn {
		width: 710rpx;
		height: 80rpx;
		background: linear-gradient(90deg, rgba(133, 180, 97, 1), rgba(218, 204, 137, 1));
		border: 1rpx solid rgba(238, 238, 238, 1);
		border-radius: 40rpx;
		font-size: 30rpx;
		color: rgba(#fff, 0.9);
	}
}
</style>

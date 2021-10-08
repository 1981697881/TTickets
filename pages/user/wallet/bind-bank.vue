<template>
	<view class="bank-wrap">
		<view class="head_box">
			<cu-custom :isBack="true">
				<block slot="backText"></block>
				<block slot="content">绑定会员卡</block>
			</cu-custom>
		</view>
		<view class="form-box">
			<u-form :model="bankInfo" :rules="rules" ref="uForm" :errorType="errorType">
				<u-form-item class="flex justify-between" :labelStyle="labelStyle" label-width="130" label-position="left" label="卡号:" prop="WechatNo">
					<u-input style="float: left;width: 500rpx;" placeholder="请输入卡号" :placeholderStyle="placeholderStyle" v-model="bankInfo.WechatNo" type="text"></u-input>
					<button class="cu-btn code-btn" @tap.stop="getCode"><text class="cuIcon-unfold"></text></button>
				</u-form-item>
				<u-select value-name="Number" label-name="Number" v-model="show" mode="single-column" :list="cardslist" @confirm="confirm"></u-select>
				<u-form-item class="flex justify-between" :labelStyle="labelStyle" label-width="130" label-position="left" label="手机号:" prop="phone">
					<u-input
						style="float: left;width: 500rpx;"
						disabled
						placeholder="请输入手机号"
						:placeholderStyle="placeholderStyle"
						v-model="bankInfo.phone"
						type="text"
					></u-input>
					<button class="cu-btn code-btn" open-type="getPhoneNumber" @getphonenumber="bindPhone"><text class="cuIcon-mobile"></text></button>
				</u-form-item>
				<u-form-item class="flex justify-between" :labelStyle="labelStyle" label-width="130" label-position="left" label="密码:" prop="password">
					<u-input class="pw-input" placeholder="请输入密码" :placeholderStyle="placeholderStyle" v-model="bankInfo.password" type="password"></u-input>
				</u-form-item>
			</u-form>
		</view>
		<view class="notice flex align-center">请填写本人的会员卡信息</view>
		<view class="btn-box flex align-center justify-center"><button class="cu-btn confirem-btn" @tap="editBankInfo">确定</button></view>
	</view>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
	components: {},
	data() {
		return {
			bankInfo: {
				WechatNo: '',
				phone: '',
				password: '',
				WechatId: '',
				PublicOpenID: ''
			},
			show: false,
			cardslist: [],
			labelStyle: {
				'font-size': '28rpx',
				'font-weight': '500',
				color: '#333'
			},
			placeholderStyle: 'font-size: 28rpx;color:#c4c4c4;',
			errorType: ['message'],
			rules: {
				WechatNo: [
					{
						required: true,
						message: '请输入卡号',
						trigger: ['change', 'blur']
					}
				],
				phone: [
					{
						required: true,
						message: '请点击右侧图标，授权手机号码',
						trigger: ['change', 'blur']
					}
				],
				password: [
					{
						required: true,
						message: '请输入密码',
						trigger: ['change', 'blur']
					}
				]
			}
		};
	},
	onReady() {
		this.$refs.uForm.setRules(this.rules);
	},
	computed: {
		...mapState({
			userinfo: state => state.user.userInfo,
			 storeInfo: state => state.user.storeInfo,
			balInfo: state => state.user.balInfo
		})
	},
	onLoad(option) {
		if (JSON.stringify(option) != '{}') {
			this.bankInfo.WechatId = option.WechatId;
			this.bankInfo.PublicOpenID = option.PublicOpenID;
		}
		this.bankInfo.phone = this.userinfo.phoneNumber;
		this.getBankInfo();
	},
	methods: {
		...mapActions(['getUserDetails', 'getUserBalance']),
		confirm(e) {
			this.bankInfo.WechatNo = e[0].value;
		},
		bindPhone(e) {
			let me = this;
			me.$api('user.getWxMiniPhoneNumber', {
				sessionKey: uni.getStorageSync('session_key'),
				openid: uni.getStorageSync('openid'),
				encryptedData: e.detail.encryptedData,
				iv: e.detail.iv
			}).then(res => {
				if (res.flag) {
					this.bankInfo.phone = res.data;
					me.getUserDetails();
				}
			});
		},
		getCode() {
			let that = this;
			that.show = true;
			/* uni.scanCode({
				success: function(res) {
					that.bankInfo.WechatNo = res.result;
				}
			}); */
		},
		//获取银行卡信息
		getBankInfo() {
			let that = this;
			that.$api('user.getCustomerList', { 
				phone: that.bankInfo.phone,
				placeId: that.storeInfo.v8PlaceId,
				V8Url: that.storeInfo.v8Url,
				returnWechat: true }).then(res => {
				if (res.flag) {
					if (res.data.Data) {
						that.cardslist = res.data.Data;
					}
				}
			});
		},
		//修改会员卡信息
		editBankInfo() {
			let that = this;
			that.$refs.uForm.validate(valid => {
				if (valid) {
					that.bankInfo.placeId = that.storeInfo.v8PlaceId
					that.bankInfo.V8Url = that.storeInfo.v8Url
					that.$api('user.memberBindSimple', that.bankInfo).then(res => {
						console.log(res);
						if (res.flag) {
							let msgData = JSON.parse(res.msg);
							if(msgData.success){
								that.getUserDetails();
								uni.showToast({
									title: msgData.MsgText,
									icon: 'success',
									duration: 2000,
									mask: true,
									success: function() {
										that.$Router.back();
										// #ifdef H5
										window.history.back(-1);
										// #endif
									}
								});
							}else{
								that.$tools.toast(msgData.MsgText);
							}
						} else {
							that.$tools.toast(res.msg);
						}
					});
				} else {
					that.$tools.toast('请完善表单');
				}
			});
		}
	}
};
</script>

<style lang="scss">
.pw-input {
	.u-input {
		input {
			width: 500rpx !important;
		}
	}
}
.head_box {
	background: linear-gradient(125deg, rgba(139, 196, 128, 1) 0%, rgba(148, 120, 165, 1) 100%);
	position: relative;
	color: white;
}
.u-form-item {
	margin: 0 20rpx 0 20rpx !important;
}
.form-box {
	background: #fff;
	.form-item {
		height: 96rpx;
		border-bottom: 1rpx solid rgba(#dfdfdf, 0.9);
		padding: 0 25rpx;
		.item-title {
			color: #333;
			font-size: 28rpx;
			font-weight: 600;
		}
		.item-input {
			font-size: 28rpx;
			color: #333;
			padding-left: 20rpx;
		}
		.pl-input {
			color: #999;
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
	.confirem-btn {
		width: 710rpx;
		height: 80rpx;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		border: 1rpx solid rgba(238, 238, 238, 1);
		border-radius: 40rpx;
		font-size: 30rpx;
		color: rgba(#fff, 0.9);
	}
}
</style>

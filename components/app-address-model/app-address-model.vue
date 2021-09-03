<template>
	<!-- #ifdef MP-WEIXIN  -->
	<view class="force-login-wrap page_box">
		<view class="head_box"></view>
		<view class="content_box">
			<view class="address-list" v-for="address in addressList" :key="address.id" @tap="useAddress(address)">
				<view class="top x-f">
					<text class="name">{{ address.consignee }}</text>
					<text class="phone">{{ address.phone }}</text>
					<text class="tag" v-if="address.is_default === '1'">默认</text>
				</view>
				<view class="detail">{{ address.province_name }}{{ address.city_name }}{{ address.area_name }}{{ address.address }}</view>
				<button class="cu-btn set-btn" @tap.stop="jump('/pages/user/address/edit', { id: address.id })">编辑</button>
			</view>
		</view>
	</view>
	<!-- #endif  -->
</template>

<script>
import Wechat from '@/common/wechat/wechat';
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	components: {},
	data() {
		return {
			addressList: [],
			screenShot: uni.getStorageSync('screenShot')
		};
	},
	props: {
		value: {},
		modalType: {
			type: String,
			default: ''
		}
	},
	onShow() {
		this.getAddressList();
	},
	created() {
		console.log(this.showLogin) 
		console.log(this.screenShot)
	},
	computed: {
		...mapState({
			showLoginTip: state => state.user.showLoginTip,
			forceOauth: state => state.user.forceOauth
		}),
		showLogin: {
			get() {
				return this.showLoginTip;
			},
			set(val) {
				this.$store.commit('LOGIN_TIP', val);
			}
		}
	},
	methods: {
		...mapActions(['setTokenAndBack']),
		
		getAddressList() {
			this.$api('address.list').then(res => {
				if (res.code === 1) {
					this.addressList = res.data;
				}
			});
		}
	}
};
</script>

<style lang="scss">
.address-list {
	padding: 40rpx;
	position: relative;
	background: #fff;
	margin-bottom: 20rpx;

	.name,
	.phone {
		font-size: 30rpx;
		font-weight: 600;
	}

	.phone {
		margin: 0 20rpx;
	}

	.tag {
		background: rgba(233, 191, 113, 0.2);
		border-radius: 6rpx;
		padding: 0 16rpx;
		line-height: 38rpx;
		color: #a8700d;
		font-size: 22rpx;
	}

	.detail {
		margin-top: 25rpx;
		width: 543rpx;
		font-size: 26rpx;
		font-family: PingFang SC;
		font-weight: 400;
		color: rgba(153, 153, 153, 1);
		line-height: 40rpx;
	}

	.set-btn {
		background: none;
		position: absolute;
		font-size: 26rpx;
		color: #a8700d;
		top: 40rpx;
		right: 20rpx;
	}
}

.foot_box {
	padding: 20rpx;
	.sync-wxaddress {
		flex: 1;
		height: 80rpx;
		background: rgba(255, 255, 255, 1);
		border-radius: 40rpx;
		.cuIcon-weixin {
			color: #1ea907;
			margin-right: 10rpx;
			font-size: 40rpx;
		}
	}
	.add-btn {
		height: 80rpx;
		flex: 1;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		border: 1rpx solid rgba(238, 238, 238, 1);
		border-radius: 40rpx;
		color: rgba(#fff, 0.9);
	}
}
// 小程序登录提醒
/* #ifdef MP-WEIXIN */
.force-login-wrap {
	position: fixed;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	z-index: 11111;
	top: 0;
	background: linear-gradient(180deg, rgba(239, 196, 128, 1) 0%, rgba(248, 220, 165, 1) 25%, rgba(255, 255, 255, 1) 98%);
}
/* #endif */
</style>

<template>
	<!-- #ifdef MP-WEIXIN  -->
	<view class="force-login-wrap page_box" v-if="Object.keys(storeInfo).length == 0 && Object.keys(storeInfo).length == 1">
		<view class="head_box"></view>
		<view class="content_box" :style="'margin-top:'+marginTop">
			<view class="address-list" v-for="(address,index) in addressList" :key="address.id" @tap="useAddress(address)">
				<view class="top x-f">
					<text class="name">{{ address.storeName }}</text>
					<text class="phone text-sm text-yellow" v-if="index==0">最近</text>
				</view>
				<view class="detail">{{address.storeAddress}}</view>
				<text class="cu-btn set-btn text-cut">{{address.distance}} km</text>
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
		},marginTop: {
			type: String,
			default: ''
		},
	},
	created() {
		this.getAddressList();
	},
	computed: {
		...mapState({
			showLoginTip: state => state.user.showLoginTip,
			storeInfo: state => state.user.storeInfo,
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
		useAddress(val){
			this.$store.commit('STORE_INFO', val);
			 this.$emit('init');
		},
		getAddressList() {
			let that = this;
			uni.getLocation({
			  type: 'gcj02',
			  success: function(res) {
				that.$api('storesForm',{
			      longitude: res.longitude,
			      latitude: res.latitude,
			    }).then(reso => {
					if (reso.flag) {
						if(reso.data.length == 1){
							that.$store.commit('STORE_INFO', reso.data[0]);
							 that.$emit('init');
						}
						that.addressList = reso.data;
					}
				});
			  },
			})
			
		}
	}
};
</script>

<style lang="scss">
.address-list {
	padding: 20rpx;
	position: relative;
	background: #fff;
	/* margin-bottom: 20rpx; */
	margin: 10rpx;
	border-radius: 5rpx;
	box-shadow: 0px 0px 1px 1px #CCCCCC;	
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
	position: absolute;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	z-index: 999;
	top: 0;
	/* background: linear-gradient(180deg, rgba(239, 196, 128, 1) 0%, rgba(248, 220, 165, 1) 25%, rgba(255, 255, 255, 1) 98%); */
}
/* #endif */
</style>

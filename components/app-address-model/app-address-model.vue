<template>
	<!-- #ifdef MP-WEIXIN  -->
	<view class="force-login-wrap page_box" v-if="!hasStore && addressList.length">
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
import { extractArray } from '@/common/utils/api-data';
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
		if (!this.hasStore) this.getAddressList();
	},
	computed: {
		...mapState({
			showLoginTip: state => state.user.showLoginTip,
			storeInfo: state => state.user.storeInfo,
			forceOauth: state => state.user.forceOauth
		}),
		hasStore() {
			const info = this.storeInfo || {};
			const hasIdentity = Boolean(info.id || info.storeId || info.storeName);
			const hasBusinessLink = Boolean(info.cinemaLinkId || info.cinemalinkId || (info.v8PlaceId && info.v8Url));
			return hasIdentity && hasBusinessLink;
		},
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
			const that = this;
			const loadStores = location => {
				that.$api('storesForm', location || {}).then(reso => {
					// 0.5.5：必须 flag，data 为门店数组
					if (!reso || !reso.flag) return;
					const list = Array.isArray(reso.data) ? reso.data : extractArray(reso.data);
					if (list.length === 1) {
						that.$store.commit('STORE_INFO', list[0]);
						that.$emit('init');
					}
					that.addressList = list;
				}).catch(() => undefined);
			};
			uni.getLocation({
			  type: 'gcj02',
			  success: function(res) {
				loadStores({
			      longitude: res.longitude,
			      latitude: res.latitude,
				});
			  },
			  fail() {
				loadStores({});
			  }
			})
			
		}
	}
};
</script>

<style lang="scss" scoped>
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
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow-x: hidden;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
	z-index: 10900;
	padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
	background: var(--tt-bg);
}
/* #endif */
</style>

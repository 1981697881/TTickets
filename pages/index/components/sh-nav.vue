<template>
	<view class="sh-user-menu-box mb10">
		<app-safe-popup v-model="phonePopupVisible" max-width="640rpx">
			<view class="phone-dialog">
				<view class="phone-dialog__title">联系客服</view>
				<view class="phone-dialog__hint">选择客服电话后直接拨打</view>
				<view class="block" v-if="servicePhones.length">
					<view class="cu-list menu text-left">
						<view class="cu-item phone-row" v-for="(item, index) in servicePhones" :key="item">
							<label class="flex justify-between align-center flex-sub">
								<view class="flex-sub" @tap="callPhone(item)">客服电话 {{ index + 1 }}<text class="phone-number">{{ item }}</text></view>
							</label>
						</view>
					</view>
				</view>
				<view class="phone-empty" v-else>当前门店暂未配置客服电话</view>
			</view>
		</app-safe-popup>
		<view class="menu-list-box">
			<view class="menu-list-title">常用服务</view>
			<view class="menu-list-panel">
				<view class="menu-item x-bc" v-for="(nav, index) in navList" :key="nav.path || index" @tap="onCheck(nav)">
					<view class="x-f">
						<view class="item-icon x-c"><image v-if="nav.image" class="item-img" :src="nav.image" mode="aspectFit"></image></view>
						<text class="item-title">{{ nav.name }}</text>
					</view>
					<text class="cuIcon-right item-arrow"></text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
export default {
	components: {},
	data() {
		return {
			phonePopupVisible: false
		};
	},
	props: {
		detail: {
			type: Object,
			default: () => ({ list: [] })
		}
	},
	computed: {
		...mapState({
			storeInfo: state => state.user.storeInfo || {}
		}),
		servicePhones() {
			return (this.storeInfo.customerServicePhoneList || []).filter(Boolean);
		},
		navList() {
			return this.detail.list || [];
		}
	},
	methods: {
		showModal() {
			this.phonePopupVisible = true;
		},
		callPhone(phoneNumber) {
			uni.makePhoneCall({
				phoneNumber
			});
		},
		onCheck(data) {
			let that = this;
			if (data.path_type == 2) {
				this.showModal();
			} else if (data.path_type == 3) {
				uni.navigateToMiniProgram({
					appId: 'wx181a62e86068b2a7', //测试wxe16a10c527a8e244
					path: 'pages/main/index?share=path&path=/pages_home/exchange-gift/index',
					extraData: {},
					envVersion: 'release',
					success(res) {
						console.log(res);
						// 打开成功
					},
					fail(error) {
						if (!String(error.errMsg || '').includes('cancel')) {
							uni.showToast({ title: '正在打开本地积分商城', icon: 'none' });
							that.jump(data);
						}
					}
				});
			} else if (data.path_type == 4) {
				uni.scanCode({
					onlyFromCamera: true,
					success: function(res) {
						that.$tools.routerTo(res.result);
					}
				});
			} else {
				this.jump(data);
			}
		},
		jump(data) {
			this.$tools.routerTo(data.path);
		}
	}
};
</script>

<style lang="scss">
// 宫格
.tools-box {
	background: #fff;
	display: flex;
	flex-wrap: wrap;
	padding-bottom: 40rpx;
	margin-bottom: 20rpx;

	.tool-item {
		width: 187.5rpx;
		padding-top: 40rpx;

		.tool-img {
			width: 44rpx;
			height: 44rpx;
			// background: #ccc;
		}

		.item-title {
			font-size: 24rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(153, 153, 153, 1);
			line-height: 24rpx;
			padding-top: 30rpx;
		}
	}
}
// 列表
.menu-list-box {
	margin: 0 30rpx 20rpx;
	.menu-list-title {
		margin-bottom: 20rpx;
		font-size: 32rpx;
		font-weight: 700;
		line-height: 44rpx;
		color: var(--tt-text);
	}
	.menu-list-panel {
		overflow: hidden;
		border: 1rpx solid var(--tt-border);
		border-radius: var(--tt-radius-lg);
		box-shadow: 0 8rpx 24rpx rgba(23, 24, 18, 0.035);
	}
	.menu-item {
		min-height: 106rpx;
		padding: 0 26rpx;
		background: #fff;
		border-bottom: 1rpx solid var(--tt-border);
		.item-icon {
			width: 60rpx;
			height: 60rpx;
			margin-right: 20rpx;
			border-radius: 50%;
			background: #fff;
		}
		.item-img {
			width: 54rpx;
			height: 54rpx;
			border-radius: 12rpx;
		}

		.item-title {
			font-size: 28rpx;
			font-weight: 500;
			color: var(--tt-text);
			line-height: 40rpx;
		}
		.item-arrow {
			font-size: 28rpx;
			color: var(--tt-text-muted);
		}
	}
	.menu-item:last-child { border-bottom: 0; }
}
.phone-dialog {
	padding: 36rpx 32rpx 32rpx;
	background: #fff;
	border-radius: var(--tt-radius-lg);
	.phone-dialog__title {
		font-size: 32rpx;
		font-weight: 700;
		line-height: 44rpx;
		color: var(--tt-text);
	}
	.phone-dialog__hint { margin: 8rpx 0 24rpx; font-size: 23rpx; color: var(--tt-text-muted); }
	.phone-row { min-height: 88rpx; border-top: 1rpx solid var(--tt-border); color: var(--tt-text); }
	.phone-number { display: block; margin-top: 4rpx; color: var(--tt-primary-strong); }
	.phone-empty { padding: 32rpx 0 20rpx; text-align: center; font-size: 24rpx; color: var(--tt-text-muted); }
}
</style>

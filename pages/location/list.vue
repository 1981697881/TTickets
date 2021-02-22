<template>
	<view class="page_box">
		<view :style="{height:statusBarHeight+'px'}" style="width: 100%;"></view>
			<popup-layer ref="popupRef" :direction="'right'">
				<view style="width:750upx;height: 100%;">
					<citySelect @back_city="back_city"></citySelect>
				</view>
			</popup-layer>
		<view class="foot_box"></view>
		<!-- 自定义底部导航 -->
		<app-tabbar></app-tabbar>
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
import appCoupon from '@/components/app-coupon/app-coupon.vue';
import citySelect from '@/components/linzq-citySelect/linzq-citySelect.vue';
import popupLayer from '@/components/popup-layer/popup-layer.vue';
export default {
	components: {
		appCoupon,
		citySelect,
		popupLayer
	},
	data() {
		return {
			statusBarHeight: this.statusBarHeight, //状态栏高度，在main.
			stateCurrent: 0,
			couponList: []
		};
	},
	onLoad(){
	},
	computed: {},
	mounted() {
		this.$refs.popupRef.show();
	},
	methods: {
		back_city(e) {
			if (e !== 'no') {
				this.region = e.cityName;
				this.$refs.popupRef.close();
			} else {
				this.$refs.popupRef.close();
			}
		},
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		}
	}
};
</script>
<style scoped>
	.height {
		height: var(--status-bar-height);
	}
</style>
<style lang="scss">
.page_box {
	background: #fff;
}
.coupon-nav {
	background: #fff;
	height: 100rpx;

	.nav-item {
		flex: 1;

		.item-title {
			font-size: 30rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(51, 51, 51, 1);
			line-height: 76rpx;
		}

		.nav-line {
			width: 120rpx;
			height: 4rpx;
			background: #fff;
		}

		.line-active {
			background: rgba(230, 184, 115, 1);
		}
	}
}
.coupon-list {
	margin: 30rpx 20rpx;
}
</style>

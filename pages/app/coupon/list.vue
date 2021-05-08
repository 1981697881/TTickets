<template>
	<view class="page_box">
		<view class="head_box">
			<view class="coupon-nav x-f">
				<view class="nav-item y-f" v-for="nav in couponsState" :key="nav.id" @tap="onNav(nav.id)">
					<view class="item-title">{{ nav.title }}</view>
					<text class="nav-line" :class="{ 'line-active': stateCurrent === nav.id }"></text>
				</view>
			</view>
		</view>
		<view class="content_box">
			<view class="coupon-list" v-for="(c,index) in couponList" :key="index" @tap="toCouponDetail(c)"><app-coupon :state="stateCurrent" :couponData="c"></app-coupon></view>
		</view>
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
import prompt from '@/csJson/prompt.json';
export default {
	components: {
		appCoupon
	},
	data() {
		return {
			stateCurrent: 0,
			listParams:{
				couponType: 0,
				openId: uni.getStorageSync('openid'),
				status: 0
			},
			couponsState: [
				{
					id: 0,
					title: '抵用券'
				},
				{
					id: 1,
					title: '优惠券'
				},
				{
					id: 2,
					title: '已使用'
				},
				{
					id: 3,
					title: '已失效'
				}
			],
			couponList: []
		};
	},
	computed: {},
	onLoad() {
		this.getCouponList();
	},
	methods: {
		onNav(id) {
			this.stateCurrent = id;
			this.couponList = [];
			if(this.stateCurrent==0){
				this.listParams.couponType = 0
				this.listParams.status = 0
			}else if(this.stateCurrent==1){
				this.listParams.couponType = 1
				this.listParams.status = 0
			}else if(this.stateCurrent==2){
				delete this.listParams.couponType
				this.listParams.status = 1
			}else{
				delete this.listParams.couponType
				this.listParams.status = 2
			}	
			this.getCouponList();
		},
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		getCouponList() {
			let that = this;
			/* let res = prompt
			if (res.code === 1) {
				that.couponList = res.data;
			} */
			that.$api('coupons.list', that.listParams).then(res => {
				if (res.flag) {
					that.couponList = res.data;
				}
			});
		},

		//跳转优惠券详情
		toCouponDetail(data) {
			this.jump('/pages/app/coupon/detail', data);
			/* if (data.user_coupons_id) {
				this.jump('/pages/app/coupon/detail', { id: data.id, userCouponId: data.user_coupons_id });
			} else {
				this.jump('/pages/app/coupon/detail', { id: data.id });
			} */
		}
	}
};
</script>

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

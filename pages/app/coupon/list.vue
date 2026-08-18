<template>
	<view class="page_box user-subpage user-coupon-page">
		<view class="head_box">
			<view class="coupon-nav x-f">
				<view class="nav-item y-f" v-for="nav in couponsState" :key="nav.id" @tap="onNav(nav.id)">
					<view class="item-title" :class="{ 'is-active': stateCurrent === nav.id }">{{ nav.title }}</view>
					<text class="nav-line" :class="{ 'line-active': stateCurrent === nav.id }"></text>
				</view>
			</view>
		</view>
		<view class="content_box">
			<view v-if="!couponList.length" class="coupon-empty">暂无优惠券</view>
			<view class="coupon-list" v-for="(c, index) in couponList" :key="index" @tap="toCouponDetail(c)">
				<app-coupon :state="stateCurrent" :couponData="c" @getCouponList="getCouponIssueList"></app-coupon>
			</view>
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
export default {
	components: {
		appCoupon
	},
	data() {
		return {
			stateCurrent: 4,
			listParams: {
				couponType: 0,
				openId: uni.getStorageSync('openid'),
				status: 0
			},
			couponsState: [
				{
					id: 4,
					title: '领券中心'
				},
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
		this.getCouponIssueList();
	},
	methods: {
		onNav(id) {
			this.stateCurrent = id;
			this.couponList = [];
			if (this.stateCurrent == 0) {
				this.listParams.couponType = 0;
				this.listParams.status = 0;
				this.getCouponList();
			} else if (this.stateCurrent == 1) {
				this.listParams.couponType = null;
				this.listParams.status = 0;
				this.getCouponList();
			} else if (this.stateCurrent == 2) {
				delete this.listParams.couponType;
				this.listParams.status = 1;
				this.getCouponList();
			} else if (this.stateCurrent == 4) {
				this.getCouponIssueList();
			} else {
				delete this.listParams.couponType;
				this.listParams.status = 2;
				this.getCouponList();
			}
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
		getCouponIssueList() {
			let that = this;
			that.$api('coupons.couponIssueList', that.listParams).then(res => {
				if (res.flag) {
					that.couponList = res.data;
				}
			});
		},
		//跳转优惠券详情
		toCouponDetail(val) {
			let obj = {};
			let data = { ...val };
			data.stateCurrent = this.stateCurrent;
			data.startDate = this.parseCouponDate(data.startDate);
			data.endDate = this.parseCouponDate(data.endDate);
			obj.detail = JSON.stringify([data]);
			this.jump('/pages/app/coupon/detail', obj);
			/* if (data.user_coupons_id) {
				this.jump('/pages/app/coupon/detail', { id: data.id, userCouponId: data.user_coupons_id });
			} else {
				this.jump('/pages/app/coupon/detail', { id: data.id });
			} */
		},
		parseCouponDate(value) {
			if (value === null || value === undefined || value === '') return value;
			if (typeof value === 'number') return value;

			const timestamp = Date.parse(String(value).replace(/-/g, '/'));
			return Number.isNaN(timestamp) ? value : timestamp;
		}
	}
};
</script>

<style lang="scss">
@import '@/static/style/user-center.scss';

.user-coupon-page {
	background: var(--tt-bg);
}

.user-coupon-page .head_box {
	position: sticky;
	top: 0;
	z-index: 8;
	background: rgba(255, 255, 255, 0.97);
	border-bottom: 1rpx solid var(--tt-border);
}

.coupon-nav {
	height: 88rpx;
	background: transparent;
	padding: 0 8rpx;
	box-sizing: border-box;
}

.coupon-nav .nav-item {
	flex: 1;
	min-width: 0;
}

.coupon-nav .item-title {
	max-width: 100%;
	overflow: hidden;
	font-size: 24rpx;
	font-weight: 500;
	line-height: 64rpx;
	color: var(--tt-text-secondary);
	text-align: center;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.coupon-nav .nav-item .nav-line {
	width: 36rpx;
	height: 6rpx;
	border-radius: 999rpx;
	background: transparent;
}

.coupon-nav .nav-item .line-active {
	background: var(--tt-primary);
}

.coupon-nav .item-title.is-active {
	color: var(--tt-primary-strong);
	font-weight: 700;
}

.user-coupon-page .content_box {
	padding: 20rpx 24rpx calc(40rpx + var(--tt-safe-bottom));
}

.coupon-list {
	margin: 0 0 18rpx;
}

.coupon-empty {
	padding: 120rpx 24rpx;
	font-size: 26rpx;
	color: var(--tt-text-muted);
	text-align: center;
}
</style>

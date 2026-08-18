<template>
	<view class="page_box user-subpage user-coupon-detail-page">
		<view class="head_box">
			<cu-custom :isBack="true">
				<block slot="backText">优惠券详情</block>
				<block slot="content"></block>
			</cu-custom>
		</view>
		<view class="content_box">
			<scroll-view
				class="scroll-box"
				scroll-y
				scroll-with-animation
				enable-back-to-top
				:scroll-into-view="scrollId"
				@scroll="onScroll"
			>
				<view class="coupon-sheet">
					<view class="coupon-sheet__hero">
						<view class="coupon-mark">券</view>
						<text class="coupon-name">{{ couponTitle }}</text>
						<text v-if="couponRule" class="coupon-rule">{{ couponRule }}</text>
						<text class="coupon-period">有效期 {{ couponPeriod }}</text>
					</view>
					<view class="coupon-sheet__cut">
						<view class="coupon-sheet__notch coupon-sheet__notch--left"></view>
						<view class="coupon-sheet__dash"></view>
						<view class="coupon-sheet__notch coupon-sheet__notch--right"></view>
					</view>
					<view class="coupon-sheet__body">
						<text class="coupon-section-title">优惠券说明</text>
						<text class="coupon-section-text">{{ couponDesc }}</text>
					</view>
				</view>
				<view class="coupon-goods" v-if="couponGoods.length">
					<view class="coupon-goods-title x-f" id="couponGoods">适用商品</view>
					<view class="goods-list" v-for="goods in couponGoods" :key="goods.id">
						<app-mini-card :detail="goods"></app-mini-card>
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="foot_box"></view>
		<app-tabbar></app-tabbar>
		<app-float-btn></app-float-btn>
		<app-notice-modal></app-notice-modal>
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
	import appMiniCard from '@/components/app-mini-card/app-mini-card.vue';
	
	export default {
		components: {
			appMiniCard
		},
		data() {
			return {
				couponDetail: {},
				tools: this.$tools,
				couponGoods: [],
				scrollId: '',
				nowTime: new Date().getTime(),
				options: {},
				btnStatusText: {
					no_use: '立即使用',
					used: '已使用',
					expired: '已失效',
					no_can_use: '暂不可用'
				},
				btnStataus: ''
			};
		},
		computed: {
			couponTitle() {
				return this.options.couponName || this.options.cname || '优惠券';
			},
			couponRule() {
				if (this.options.deductionAmount) return `升级影厅需补 ${this.options.deductionAmount} 元差额`;
				if (this.options.reducePrice) return `满${this.options.reducePrice}元可用`;
				if (this.options.useMinPrice) return `满${this.options.useMinPrice}元可用`;
				return '';
			},
			couponPeriod() {
				const start = this.formatDate(this.options.startDate);
				const end = this.formatDate(this.options.endDate);
				if (!start && !end) return '以实际规则为准';
				return `${start} 至 ${end}`;
			},
			couponDesc() {
				return this.options.description || '暂无更多说明';
			}
		},
		onLoad() {
			this.options = JSON.parse(this.$Route.query.detail)[0];
			/* this.getCouponDetail();
			this.getCouponGoods(); */
		},
		methods: {
			formatDate(value) {
				if (value === null || value === undefined || value === '') return '';
				if (typeof this.$tools.dateFormat === 'function' && (value instanceof Date || typeof value === 'number')) {
					return this.$tools.dateFormat('YYYY-mm-dd', new Date(value));
				}
				const raw = String(value).replace(/-/g, '/');
				const date = new Date(raw);
				if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
				return this.$tools.dateFormat('YYYY-mm-dd', date);
			},
			// 领取优惠劵
			getCoupon() {
				let that = this;
				that.$api('coupons.get', {
					id: that.$Route.query.id
				}).then(res => {
					if (res.code === 1) {
						that.$tools.toast(res.msg);
						this.options.userCouponId = res.data.id;
						that.getCouponDetail();
					}
				});
			},
			// 优惠券详情
			getCouponDetail() {
				let that = this;
				that.$api('coupons.detail', {
					id: that.$Route.query.id,
					user_coupons_id: that.options.userCouponId
				}).then(res => {
					if (res.code === 1) {
						that.couponDetail = res.data;
						if (res.data.status_code) {
							this.btnStataus = res.data.status_code;
						}
					}
				});
			},
			// 适用商品
			getCouponGoods() {
				let that = this;
				that.$api('coupons.goods', {
					id: that.$Route.query.id
				}).then(res => {
					if (res.code === 1) {
						that.couponGoods = res.data.data;
					}
				});
			},
			onScroll() {
				this.scrollId = '';
			},
			goScroll() {
				if (!this.options.userCouponId) {
					this.getCoupon();
				} else {
					if (this.couponDetail.goods_ids === '0' && this.btnStataus == 'no_use') {
						this.$Router.push({
							path: '/pages/goods/list'
						});
					}
					this.scrollId = 'couponGoods';
				}
			}
		}
	};
</script>

<style lang="scss">
@import '@/static/style/user-center.scss';

.user-coupon-detail-page {
	background: var(--tt-bg);
}

.user-coupon-detail-page .head_box {
	background: transparent;
	border-bottom: 0;
}

.user-coupon-detail-page .content_box {
	padding: 12rpx 28rpx calc(40rpx + var(--tt-safe-bottom));
}

.coupon-sheet {
	overflow: hidden;
	background: var(--tt-surface);
	border: 1rpx solid var(--tt-border);
	border-radius: var(--tt-radius-lg);
	box-shadow: var(--tt-shadow);
}

.coupon-sheet__hero {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 32rpx 36rpx;
	background: linear-gradient(180deg, var(--tt-primary-soft) 0%, #fff 72%);
}

.coupon-mark {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 88rpx;
	height: 88rpx;
	margin-bottom: 22rpx;
	border-radius: 50%;
	background: var(--tt-primary);
	color: #fff;
	font-size: 32rpx;
	font-weight: 700;
	letter-spacing: 2rpx;
}

.coupon-name {
	max-width: 100%;
	font-size: 40rpx;
	font-weight: 720;
	line-height: 56rpx;
	color: var(--tt-text);
	text-align: center;
}

.coupon-rule,
.coupon-period {
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 36rpx;
	color: var(--tt-text-secondary);
	text-align: center;
}

.coupon-sheet__cut {
	position: relative;
	display: flex;
	align-items: center;
	height: 32rpx;
	background: #fff;
}

.coupon-sheet__dash {
	flex: 1;
	height: 0;
	margin: 0 28rpx;
	border-top: 2rpx dashed var(--tt-border);
}

.coupon-sheet__notch {
	position: absolute;
	top: 50%;
	width: 28rpx;
	height: 28rpx;
	border-radius: 50%;
	background: var(--tt-bg);
	transform: translateY(-50%);
}

.coupon-sheet__notch--left {
	left: -14rpx;
	box-shadow: inset -1rpx 0 0 var(--tt-border);
}

.coupon-sheet__notch--right {
	right: -14rpx;
	box-shadow: inset 1rpx 0 0 var(--tt-border);
}

.coupon-sheet__body {
	padding: 8rpx 32rpx 40rpx;
}

.coupon-section-title {
	display: block;
	margin-bottom: 12rpx;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: var(--tt-text);
}

.coupon-section-text {
	display: block;
	font-size: 24rpx;
	line-height: 38rpx;
	color: var(--tt-text-secondary);
	white-space: pre-wrap;
	word-break: break-word;
}

.coupon-goods {
	margin-top: 20rpx;
	padding: 8rpx 24rpx 20rpx;
	background: var(--tt-surface);
	border: 1rpx solid var(--tt-border);
	border-radius: var(--tt-radius-md);
	box-shadow: var(--tt-shadow);
}

.coupon-goods-title {
	height: 80rpx;
	font-size: 30rpx;
	font-weight: 700;
	color: var(--tt-text);
}

.goods-list {
	padding: 20rpx 0;
	border-bottom: 1rpx solid var(--tt-border);

	&:last-child {
		border-bottom: 0;
	}
}
</style>

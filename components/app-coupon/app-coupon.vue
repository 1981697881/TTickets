<template>
	<view v-if="couponData" class="coupon-ticket" :class="{ 'is-expired': isExpired, 'is-used': isUsed }">
		<view class="coupon-ticket__main">
			<text class="coupon-ticket__title">{{ titleText }}</text>
			<text v-if="ruleText" class="coupon-ticket__rule">{{ ruleText }}</text>
			<text class="coupon-ticket__date">有效期 {{ dateText }}</text>
		</view>
		<view class="coupon-ticket__side">
			<button
				class="coupon-ticket__btn"
				:disabled="isExpired || isClaimed"
				@tap.stop="onAction"
			>
				{{ actionText }}
			</button>
			<text v-if="remainText" class="coupon-ticket__remain">{{ remainText }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'appCoupon',
	components: {},
	data() {
		return {
			tools: this.$tools
		};
	},
	props: {
		state: {}, //0:立即领取，1：去使用，2：查看详情，3：已失效。
		couponData: {}
	},
	computed: {
		isExpired() {
			return Number(this.state) === 3;
		},
		isUsed() {
			return Number(this.state) === 2;
		},
		isCenter() {
			return Number(this.state) === 4;
		},
		isClaimed() {
			return this.isCenter && Number(this.couponData.getStatus) !== 0;
		},
		titleText() {
			const data = this.couponData || {};
			return data.couponName || data.cname || data.couponPrice || '优惠券';
		},
		ruleText() {
			const data = this.couponData || {};
			if (this.isCenter) {
				return data.useMinPrice != null ? `满${data.useMinPrice}元可用` : '';
			}
			if (Number(data.couponId) === 1) return '除普通厅外需补差价';
			if (Number(data.couponId) === 2) return '全场影厅通用';
			if (data.fullPrice != null) return `满${data.fullPrice}元可用`;
			if (data.useMinPrice != null) return `满${data.useMinPrice}元可用`;
			return '';
		},
		dateText() {
			const data = this.couponData || {};
			return `${this.shortDate(data.startDate)} 至 ${this.shortDate(data.endDate)}`;
		},
		remainText() {
			if (!this.isCenter || this.couponData.remainCount == null) return '';
			return `仅剩${this.couponData.remainCount}张`;
		},
		actionText() {
			if (this.isExpired) return '已失效';
			if (this.isUsed) return '已使用';
			if (this.isCenter) return this.isClaimed ? '已领取' : '立即领取';
			return '查看详情';
		}
	},
	methods: {
		shortDate(value) {
			if (value === null || value === undefined || value === '') return '--';
			const text = String(value).trim();
			if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(text)) return text.slice(0, 10).replace(/\//g, '-');
			const date = new Date(typeof value === 'number' ? value : text.replace(/-/g, '/'));
			if (Number.isNaN(date.getTime())) return text.slice(0, 10);
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${date.getFullYear()}-${month}-${day}`;
		},
		onAction() {
			if (this.isCenter && !this.isClaimed) {
				this.getCoupon();
			}
		},
		getCoupon() {
			let that = this;
			let params = this.couponData
			params.openId = uni.getStorageSync('openid')
			that.$api('coupons.get', params).then(res => {
				if (res.flag) {
					that.$tools.toast(res.msg);
					that.$emit('getCouponList')
				}else{
					that.$tools.toast(res.msg);
				}
			});
		}
	}
};
</script>

<style lang="scss">
.coupon-ticket {
	display: flex;
	align-items: stretch;
	min-height: 176rpx;
	overflow: hidden;
	background: var(--tt-surface);
	border: 1rpx solid var(--tt-border);
	border-radius: var(--tt-radius-md);
	box-shadow: var(--tt-shadow);
}

.coupon-ticket__main {
	min-width: 0;
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 24rpx 8rpx 24rpx 28rpx;
}

.coupon-ticket__title {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: var(--tt-text);
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.coupon-ticket__rule,
.coupon-ticket__date {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: var(--tt-text-secondary);
}

.coupon-ticket__date {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.coupon-ticket__side {
	position: relative;
	flex: 0 0 176rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20rpx 16rpx;
}

.coupon-ticket__side::before {
	content: '';
	position: absolute;
	left: 0;
	top: 18rpx;
	bottom: 18rpx;
	border-left: 2rpx dashed var(--tt-border);
}

.coupon-ticket__btn {
	width: 132rpx;
	height: 52rpx;
	min-height: 52rpx;
	margin: 0;
	padding: 0;
	background: var(--tt-primary);
	border-radius: 999rpx;
	font-size: 22rpx;
	font-weight: 600;
	line-height: 52rpx;
	color: #fff;
}

.coupon-ticket__btn[disabled] {
	background: #d9dbd1;
	color: #fff;
}

.coupon-ticket__remain {
	margin-top: 10rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: var(--tt-primary-strong);
}

.coupon-ticket.is-expired,
.coupon-ticket.is-used {
	background: #f3f4f0;
}

.coupon-ticket.is-expired .coupon-ticket__title,
.coupon-ticket.is-used .coupon-ticket__title,
.coupon-ticket.is-expired .coupon-ticket__rule,
.coupon-ticket.is-used .coupon-ticket__rule,
.coupon-ticket.is-expired .coupon-ticket__date,
.coupon-ticket.is-used .coupon-ticket__date {
	color: var(--tt-text-muted);
}

.coupon-ticket.is-expired .coupon-ticket__remain {
	color: var(--tt-text-muted);
}
</style>

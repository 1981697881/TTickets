<template>
	<view class="" v-if="couponData">
		<!-- 未领取，已领取 -->
		<view class="coupon-wrap" v-if="state === 4">
			<view class="coupon-item x-bc">
				<view class="coupon-left y-start ">
					<view class="sum-box">
						<text class="unit">￥</text>
						<text class="sum">{{ couponData.couponPrice }}</text>
						<text class="sub">{{ couponData.cname }}</text>
					</view>
					<view class="notice">满{{ couponData.useMinPrice }}元可用</view>
					<view class="notice">领取日期：{{couponData.startTime}} 至 {{couponData.endTime}}</view>
				</view>
				<view class="coupon-right y-f">
					<button class="cu-btn get-btn" v-if="couponData.getStatus ==0" @tap.stop="getCoupon">立即领取</button>
					<button class="cu-btn get-btn bg-gray" v-else>已领取</button>
					<view class="surplus-num">仅剩{{ couponData.remainCount }}张</view>
				</view>
			</view>
		</view>
		<view class="coupon-wrap" v-if="state === 0">
			<view class="coupon-item x-bc">
				<view class="coupon-left y-start ">
					<view class="sum-box">
						<text class="sub">{{ couponData.couponName }}</text>
					</view>
					<view class="notice" v-if="couponData.couponId==1">使用提醒：除普通厅外需补差价</view>
					<view class="notice" v-if="couponData.couponId==2">使用提醒：全场影厅通用</view>
					<view class="notice">有效期：{{couponData.startDate}} 至 {{couponData.endDate}}</view><!-- 2021-05-05 至 2022-05-05 -->
				</view>
				<view class="coupon-right y-f">
					<button class="cu-btn get-btn" v-if="state === 0">查看详情</button>
				</view>
			</view>
		</view>
		<view class="coupon-wrap" v-if="state === 1">
			<view class="coupon-item x-bc">
				<view class="coupon-left y-start ">
					<view class="sum-box">
						<text class="unit">￥</text>
						<text class="miso-font sum">{{ couponData.fullPrice }}</text>
						<text class="sub">{{ couponData.couponName }}</text>
					</view>
					<view class="notice">满{{ couponData.fullPrice }}元可用</view>
					<view class="notice">有效期：{{couponData.startDate}} 至 {{couponData.endDate}}</view>
				</view>
				<view class="coupon-right y-f">
					<button class="cu-btn get-btn" v-if="state === 1">查看详情</button>
				</view>
			</view>
		</view>
		<view class="coupon-wrap" v-if="state === 2">
			<view class="coupon-item x-bc">
				<view class="coupon-left y-start ">
					<view class="coupon-left y-start ">
						<view class="sum-box">
							<text class="miso-font sum">{{ couponData.fullPrice }}</text>
							<text class="sub">{{ couponData.couponName }}</text>
						</view>
						<view class="notice" v-if="couponData.couponId==1">使用提醒：除普通厅外需补差价</view>
						<view class="notice" v-else-if="couponData.couponId==2">使用提醒：全场影厅通用</view>
						<view class="notice" v-else>满{{ couponData.fullPrice }}元可用</view>
						<view class="notice">有效期：{{couponData.startDate}} 至 {{couponData.endDate}}</view><!-- 2021-05-05 至 2022-05-05 -->
					</view>
				</view>
				<view class="coupon-right y-f">
					<button class="cu-btn get-btn" v-if="state === 2">查看详情</button>
				</view>
			</view>
		</view>
		<!-- 失效 -->
		<view class="close-wrap" v-if="state === 3">
			<view class="coupon-item x-f">
				<view class="coupon-left y-start ">
					<view class="sum-box">
						<text class="unit">￥</text>
						<text class="miso-font sum">{{ couponData.fullPrice }}</text>
						<text class="sub">{{ couponData.couponName }}</text>
					</view>
					<view class="notice">有效期：{{couponData.startDate}} 至 {{couponData.endDate}}</view>
				</view>
				<view class="coupon-right y-f">
					<button class="cu-btn get-btn">已失效</button>
					<view class="surplus-num"></view>
				</view>
			</view>
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
	computed: {},
	methods: {
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
// 未领取，已领取
.coupon-wrap {
	background: url('https://cfzx.gzfzdev.com/movie/uploadFiles/image/coupon_bg1.png') no-repeat;
	background-size: 100% 100%;
	position: relative;
	border-radius: 10rpx;
	width: 710rpx;
	.coupon-item {
		width: 100%;
		height: 168rpx;
		border-radius: 10rpx;

		.coupon-left {
			height: 100%;
			justify-content: center;
			padding-left: 40rpx;

			.unit {
				font-size: 24rpx;
				color: #4f3a1e;
			}

			.sum {
				font-size: 55rpx;
				font-weight: bold;
				color: #4f3a1e;
				line-height: 55rpx;
				padding-right: 10rpx;
			}

			.sub {
				font-size: 26rpx;
				color: #4f3a1e;
			}

			.notice {
				font-size: 22rpx;
				color: #a8700d;
				margin-top: 6rpx;
				padding-right: 44rpx;
			}
		}

		.coupon-right {
			height: 100%;
			width: 220rpx;
			justify-content: center;
			align-items: center;

			.get-btn {
				width: 142rpx;
				height: 54rpx;
				background: linear-gradient(90deg, rgba(45, 34, 17, 1), rgba(84, 62, 32, 1));
				box-shadow: 0px 2rpx 5rpx 0px rgba(206, 158, 106, 0.46);
				border-radius: 27rpx;
				padding: 0;
				font-size: 24rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(239, 197, 130, 1);
			}

			.surplus-num {
				font-size: 22rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(168, 112, 13, 1);
				margin-top: 14rpx;
			}
		}
	}
}

// 失效
.close-wrap {
	position: relative;
	border-radius: 10rpx;
	background: url('https://cfzx.gzfzdev.com/movie/uploadFiles/image/coupon_bg2.png') no-repeat;
	background-size: 100% 100%;

	.coupon-item {
		width: 100%;
		height: 168rpx;
		border-radius: 10rpx;

		.coupon-left {
			height: 100%;
			width: 480rpx;
			justify-content: center;
			padding-left: 40rpx;

			.unit {
				font-size: 24rpx;
				color: #838383;
			}

			.sum {
				font-size: 55rpx;
				font-weight: bold;
				color: #838383;
				line-height: 55rpx;
				padding-right: 10rpx;
			}

			.sub {
				font-size: 26rpx;
				color: #838383;
			}

			.notice {
				font-size: 22rpx;
				color: #a6a6a6;
			}
		}

		.coupon-right {
			height: 100%;
			flex: 1;
			justify-content: center;

			.get-btn {
				width: 142rpx;
				height: 54rpx;
				border-radius: 27rpx;
				background: #fff;
				padding: 0;
				font-size: 24rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: #838383;
			}

			.surplus-num {
				font-size: 22rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(168, 112, 13, 1);
				margin-top: 14rpx;
			}
		}
	}
}
</style>

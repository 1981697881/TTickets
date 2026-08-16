<template>
	<view class="">
		<view class="goods-box x-start">
			<image class="goods-img" :src="movieImage" mode="aspectFill"></image>
			<view class="y-start">
				<view class="goods-title more-t">
					<view class="item-title">{{ safeHall.hallName || '影厅信息' }}</view>
					<view class="item-time">
						<text class="time cuIcon-time" v-if="isPast">{{ timeText }}</text>
						<text class="time" v-else>{{ timeText }}</text>
					</view>
				</view>
				<slot name="tipTag">{{ checkTime.week || '' }} {{ safeSchedule.showDatetime || '' }} ({{ safeSchedule.dimensional || '' }})</slot>
				<view class="size-tip">{{ safeDetail.cinemaName || '' }}</view>
				<slot name="goodsBottom">
					<view class="price">￥{{ safeDetail.money || 0 }}</view>
				</slot>
			</view>
		</view>
	</view>
</template>

<script>
import tools from '@/common/utils/tools'
export default {
	name: 'appMiniCard',
	components: {},
	data() {
		return {
			timer: null,
			checkTime: {
				week: ''
			},
			timeText: '',
			isPast: true, //是否显示订单倒计时。
			routerTo: this.$Router,
			orderStatus: {
				seckill: '/static/imgs/seckill_tag.png',
				groupon: '/static/imgs/groupon_tag.png'
			}
		};
	},
	props: {
		detail: {
			type: Object,
			default: () => ({})
		},
		sku: {},
		type: ''
	},
	mounted() {
		this.clearTime();
		this.countDown();
		this.initDate(this.safeSchedule.showDatetime);
	},
	beforeUnmount() {
		this.clearTime();
	},
	computed: {
		safeDetail() {
			return this.detail && typeof this.detail === 'object' ? this.detail : {};
		},
		safeSchedule() {
			return this.safeDetail.schedule && typeof this.safeDetail.schedule === 'object' ? this.safeDetail.schedule : {};
		},
		safeHall() {
			return this.safeDetail.locationHall && typeof this.safeDetail.locationHall === 'object' ? this.safeDetail.locationHall : {};
		},
		movieImage() {
			const image = this.safeDetail.filmPhoto || '';
			if (/^https?:\/\//.test(image) || image.startsWith('/')) return image;
			return `https://cfzx.gzfzdev.com/movie/uploadFiles/image/${image}`;
		}
	},
	methods: {
		clearTime(){
			if (this.timer) clearInterval(this.timer);
			this.timer = null;
		},
		initDate(dval) {
			const target = this.parseLocalDate(dval);
			if (!target) return;
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
			const offset = Math.round((targetDay.getTime() - today.getTime()) / 86400000);
			const obj = tools.getDayList('', offset);
			if (offset === 0) obj.week = '今天';
			else if (offset === 1) obj.week = '明天';
			else if (offset === 2) obj.week = '后天';
			this.checkTime = obj;
		},
		parseLocalDate(value) {
			if (!value) return null;
			if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
			if (typeof value === 'number') {
				const date = new Date(value);
				return Number.isNaN(date.getTime()) ? null : date;
			}
			const match = String(value).match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
			if (!match) return null;
			const date = new Date(
				Number(match[1]),
				Number(match[2]) - 1,
				Number(match[3]),
				Number(match[4] || 0),
				Number(match[5] || 0),
				Number(match[6] || 0)
			);
			return Number.isNaN(date.getTime()) ? null : date;
		},
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		num(n) {
			return n < 10 ? '0' + n : '' + n;
		},
		// 倒计时
		countDown() {
			let that = this;
			let maxtime = 10 * 30;
			this.timer = setInterval(() => {
				if (maxtime >= 0) {
					let minutes = Math.floor(maxtime / 60);
					let seconds = Math.floor(maxtime % 60);
					that.timeText = `${that.num(minutes)}:${that.num(seconds)}`;
					--maxtime;
				} else {
					this.clearTime();
					that.timeText = '订单已过期!';
					that.isPast = false;
					 that.$emit('overTime')
				}
			}, 1000);
		}
	}
};
</script>

<style lang="scss">
.goods-box {
	position: relative;
	.goods-img {
		height: 180rpx;
		width: 200rpx;
		box-shadow: 2px 2px 2px 2px #CCCCCC;
		background-color: #ccc;
		margin-right: 25rpx;
	}
	.order-goods__tag {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 3;
		width: 60rpx;
		height: 30rpx;
	}
	.goods-title {
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 500;
		height: 60rpx;
		color: rgba(51, 51, 51, 1);
		width: 450rpx;
		line-height: 40rpx;
		display: flex;
		margin-bottom: 10rpx;
	}
	.item-title {
		font-size: 40rpx;
		font-weight: bold;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.size-tip {
		line-height: 45rpx;
		// background: #f4f4f4;
		// padding: 0 16rpx;
		font-size: 24rpx;
		color: #666;
	}
	.sub-tip {
		width: 480rpx;
		line-height: 45rpx;
		// background: #F6F2EA;
		font-size: 24rpx;
		color: #a8700d;
		margin: 10rpx 0;
	}

	.price {
		color: #e1212b;
	}
}
// order
.goods-box {
	.order-right {
		height: 180rpx;
	}
	.order-tip {
		font-size: 24rpx;
		font-family: PingFang SC;
		font-weight: 400;
		color: rgba(153, 153, 153, 1);
		width: 450rpx;
		margin-bottom: 20rpx;
		.order-num {
			margin-right: 10rpx;
		}
	}

	.order-goods {
		width: 480rpx;

		.status-btn {
			background: none;
			height: 32rpx;
			border: 1rpx solid rgba(207, 169, 114, 1);
			border-radius: 15rpx;
			font-size: 20rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(168, 112, 13, 1);
			padding: 0 10rpx;
			margin-left: 20rpx;
			background: rgba(233, 183, 102, 0.16);
		}
		.order-price {
			font-size: 26rpx;
			font-family: PingFang SC;
			font-weight: 600;
			color: rgba(51, 51, 51, 1);
		}
	}
}
</style>

<template>
	<view v-if="detail" class="session-row" @tap="openSeats">
		<view class="time-column">
			<text class="start-time">{{ startTime }}</text>
			<text class="end-time">{{ endTime }}散场</text>
		</view>

		<view class="hall-column">
			<text class="format">{{ formatText }}</text>
			<text class="hall one-t">{{ detail.hallName || '影厅待定' }}</text>
		</view>

		<view class="price-column">
			<text class="member-price"><text class="currency">¥</text>{{ memberPrice }}</text>
			<text v-if="standardPrice" class="standard-price">标准价 ¥{{ standardPrice }}</text>
		</view>

		<button class="buy-button" @tap.stop="openSeats">购票</button>
	</view>
</template>

<script>
export default {
	name: 'FzCircuitMiniCard',
	props: {
		isTag: {
			type: [Boolean, String],
			default: false
		},
		detail: {
			type: Object,
			default: () => ({})
		}
	},
	computed: {
		startTime() {
			const value = this.detail.showDatetime || '';
			return value.length >= 16 ? value.substring(11, 16) : '--:--';
		},
		endTime() {
			const value = this.detail.showDatetime || '';
			if (!value || !this.detail.duration) return '--:--';
			const time = new Date(Date.parse(value.replace(/-/g, '/')) + Number(this.detail.duration) * 60000);
			return Number.isNaN(time.getTime()) ? '--:--' : this.$tools.dateFormat('HH:MM', time);
		},
		formatText() {
			return [this.detail.language, this.detail.dimensional].filter(Boolean).join(' ') || '版本待定';
		},
		memberPrice() {
			return this.formatPrice(this.detail.settleprice);
		},
		standardPrice() {
			return this.formatPrice(this.detail.standardprice, '');
		}
	},
	methods: {
		formatPrice(value, fallback = '--') {
			if (value === undefined || value === null || value === '') return fallback;
			return String(value).replace(/\.00$/, '');
		},
		openSeats() {
			const detail = this.detail;
			this.$Router.push({
				path: '/pages/cinema/movie/list',
				query: {
					sectionId: detail.sectionId,
					scheduleId: detail.scheduleId,
					schedulekey: detail.scheduleKey,
					language: detail.language,
					dimensional: detail.dimensional,
					filmName: detail.filmName,
					filmId: detail.filmId,
					showDatetime: detail.showDatetime,
					hallId: detail.hallId,
					hallName: detail.hallName || ''
				}
			});
		}
	}
};
</script>

<style scoped lang="scss">
.session-row {
	width: 100%;
	min-height: 142rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 24rpx 22rpx;
	box-sizing: border-box;
	background: #fff;
	border: 1rpx solid var(--tt-border);
	border-radius: 20rpx;
	box-shadow: 0 8rpx 24rpx rgba(23, 24, 18, 0.05);
	margin-bottom: 16rpx;
}

.time-column,
.hall-column,
.price-column {
	display: flex;
	min-width: 0;
	flex-direction: column;
}

.time-column {
	flex: 0 0 122rpx;
}

.start-time {
	font-size: 38rpx;
	font-weight: 720;
	line-height: 48rpx;
	color: var(--tt-text);
}

.end-time,
.hall,
.standard-price {
	margin-top: 7rpx;
	font-size: 21rpx;
	line-height: 30rpx;
	color: var(--tt-text-muted);
}

.hall-column {
	flex: 1;
}

.format {
	font-size: 24rpx;
	font-weight: 620;
	line-height: 36rpx;
	color: var(--tt-text);
}

.price-column {
	flex: 0 0 118rpx;
	align-items: flex-end;
}

.member-price {
	font-size: 31rpx;
	font-weight: 720;
	line-height: 42rpx;
	color: var(--tt-danger);
}

.currency {
	margin-right: 2rpx;
	font-size: 22rpx;
}

.standard-price {
	white-space: nowrap;
}

.buy-button {
	width: 100rpx;
	height: 58rpx;
	flex: 0 0 100rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0;
	padding: 0;
	border: 0;
	border-radius: 30rpx;
	background: #e85d74;
	color: #fff;
	font-size: 24rpx;
	font-weight: 650;
	line-height: 58rpx;
}

.buy-button::after {
	display: none;
}

@media screen and (max-width: 340px) {
	.session-row {
		gap: 12rpx;
	}

	.time-column {
		flex-basis: 108rpx;
	}

	.price-column {
		flex-basis: 104rpx;
	}

	.buy-button {
		width: 88rpx;
		flex-basis: 88rpx;
	}
}
</style>

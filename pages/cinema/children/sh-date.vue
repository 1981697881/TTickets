<template>
	<scroll-view class="date-strip" scroll-x scroll-with-animation :scroll-left="scrollLeft" show-scrollbar="false">
		<view class="date-list">
			<view
				v-for="(item, index) in detail"
				:key="item.day || index"
				class="date-item"
				:class="{ active: index === tabCurrent }"
				@tap="selectDate(index)"
			>
				<text class="date-week">{{ item.week }}</text>
				<text class="date-value">{{ item.date }}</text>
			</view>
		</view>
	</scroll-view>
</template>

<script>
import tools from '@/common/utils/tools';

export default {
	name: 'ShDate',
	props: {
		movieDates: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			tabCurrent: 0,
			detail: [],
			scrollLeft: 0
		};
	},
	methods: {
		selectDate(index) {
			if (!this.detail[index]) return;
			this.tabCurrent = index;
			this.scrollLeft = Math.max(0, (index - 1) * 74);
			this.$emit('subClickFtn', { day: this.detail[index].day });
		},
		getDateList() {
			this.tabCurrent = 0;
			this.scrollLeft = 0;
			const available = new Set(this.movieDates || []);
			const dates = [];
			for (let index = 0; index < 15; index += 1) {
				const item = tools.getDayList('', index);
				if (!available.has(item.day)) continue;
				if (index === 0) item.week = '今天';
				if (index === 1) item.week = '明天';
				if (index === 2) item.week = '后天';
				dates.push(item);
			}
			this.detail = dates;
		}
	}
};
</script>

<style scoped lang="scss">
.date-strip {
	width: 100%;
	background: #fff;
	border-top: 1rpx solid var(--tt-border);
	border-bottom: 1rpx solid var(--tt-border);
	white-space: nowrap;
}

.date-list {
	display: inline-flex;
	align-items: stretch;
	gap: 10rpx;
	padding: 18rpx 28rpx;
}

.date-item {
	min-width: 116rpx;
	height: 88rpx;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 16rpx;
	box-sizing: border-box;
	border-radius: 14rpx;
	color: var(--tt-text-secondary);
}

.date-item.active {
	background: var(--tt-primary);
	color: #fff;
}

.date-week {
	font-size: 25rpx;
	font-weight: 650;
	line-height: 34rpx;
}

.date-value {
	margin-top: 2rpx;
	font-size: 21rpx;
	line-height: 30rpx;
}
</style>

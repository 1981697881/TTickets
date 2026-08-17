<template>
	<view class="fz-seat-map-root">
		<!-- 缩略图：只画有效座位点，避免大影厅双层全量节点 -->
		<view class="seat-thumbnail" v-if="thumbnailVisible && thumbDots.length">
			<view class="thumb-grid" :style="{ width: thumbWidth + 'px', height: thumbHeight + 'px' }">
				<view
					v-for="dot in thumbDots"
					:key="dot.key"
					class="thumb-dot"
					:class="dot.cls"
					:style="dot.style"
				></view>
				<view class="thumb-viewport" :style="thumbViewportStyle"></view>
			</view>
		</view>

		<movable-area class="seat-map" :style="areaStyle">
			<movable-view
				class="seat-movable"
				:style="{ width: boxWidth + 'px', height: contentHeight + 'px', background: 'transparent' }"
				:inertia="true"
				:scale="true"
				:scale-min="scaleMin"
				:scale-max="2"
				direction="all"
				@change="onMove"
				@scale="onScale"
			>
				<view class="screen-wrap" :style="{ height: screenHeadHeight + 'px' }">
					<view class="screen-glow"></view>
					<view class="screen-arc"></view>
					<text class="screen-label">银幕中央</text>
				</view>

				<view v-if="mArr.length" class="row-rail-inner" :style="{ top: screenHeadHeight + 'px' }">
					<view class="row-rail-bar">
						<view
							v-for="(rowLabel, index) in mArr"
							:key="`rail-${index}`"
							class="row-rail-item"
							:style="{ height: seatSize + 'px', marginBottom: seatRowGap + 'px' }"
						>
							<text v-if="rowLabel">{{ rowLabel }}</text>
						</view>
					</view>
				</view>

				<view
					class="seat-center-line"
					:style="{ top: screenHeadHeight + 'px', height: Math.max(0, gridHeight) + 'px' }"
				></view>

				<view v-if="bestZoneVisible" class="best-zone-box" :style="bestZoneBoxStyle">
					<text class="best-zone-tip">最佳观影区</text>
				</view>

				<view
					v-if="seatArray.length"
					class="seat-rows"
					:style="{ width: boxWidth + 'px', height: gridHeight + 'px' }"
				>
					<view
						v-for="item in visibleSeatItems"
						:key="item.key"
						class="seat-cell"
						:class="{ 'is-active': item.seat.type === 1 }"
						:style="item.style"
						@tap="$emit('choose', { row: item.row, col: item.col, seat: item.seat })"
					>
						<image
							class="seat-image"
							:class="{ 'is-sold': item.seat.type === 2, 'is-maintenance': item.seat.type === 3 }"
							:src="seatIconByType[item.seat.type]"
							mode="aspectFit"
						></image>
					</view>
				</view>
				<view v-else class="seat-empty">暂无可选座位</view>
			</movable-view>
		</movable-area>
	</view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { getSystemInfoSyncSafe } from '@/common/runtime/system-info';

type SeatCell = {
	type: number;
	sid: string;
	money?: number | string;
	rowNum?: string | number;
	columnNum?: string | number;
};

type VisibleSeatItem = {
	key: string;
	row: number;
	col: number;
	seat: SeatCell;
	style: Record<string, string>;
};

type ThumbDot = {
	key: string;
	cls: string;
	style: Record<string, string>;
};

/** 座位总数超过该值时启用视口裁剪（小厅全量绝对定位即可） */
const CULL_SEAT_THRESHOLD = 120;
const CULL_BUFFER = 2;

export default defineComponent({
	name: 'FzSeatMap',
	emits: ['choose'],
	props: {
		seatArray: {
			type: Array as PropType<SeatCell[][]>,
			default: () => []
		},
		mArr: {
			type: Array as PropType<Array<string | number>>,
			default: () => []
		},
		seatIcons: {
			type: Object as PropType<Record<string, string>>,
			required: true
		},
		seatRow: { type: Number, default: 0 },
		seatCol: { type: Number, default: 0 },
		seatSize: { type: Number, default: 0 },
		seatRowGap: { type: Number, default: 10 },
		boxWidth: { type: Number, default: 375 },
		screenHeadHeight: { type: Number, default: 86 },
		scaleMin: { type: Number, default: 1 },
		areaStyle: {
			type: Object as PropType<Record<string, string>>,
			default: () => ({})
		},
		bestZoneVisible: { type: Boolean, default: false },
		bestZoneBoxStyle: {
			type: Object as PropType<Record<string, string>>,
			default: () => ({ display: 'none' })
		}
	},
	data() {
		return {
			moveX: 0,
			moveY: 0,
			scale: 1,
			viewportWidth: 375,
			viewportHeight: 420,
			thumbnailShow: false,
			thumbnailHideTimer: 0 as number | ReturnType<typeof setTimeout>,
			_moveRaf: 0 as number,
			_scaleRaf: 0 as number,
			_pendingMove: null as { x: number; y: number } | null,
			_pendingScale: null as { scale: number } | null
		};
	},
	computed: {
		seatIconByType(): Record<number, string> {
			return {
				0: this.seatIcons.unselected,
				1: this.seatIcons.selected,
				2: this.seatIcons.bought,
				3: this.seatIcons.lockwei
			};
		},
		gridHeight(): number {
			if (!(this.seatRow > 0) || !(this.seatSize > 0)) return 0;
			return this.seatRow * (this.seatSize + this.seatRowGap);
		},
		contentHeight(): number {
			return Math.max(360, this.screenHeadHeight + this.gridHeight + 50);
		},
		gridOffsetX(): number {
			const gridWidth = this.seatCol * this.seatSize;
			return Math.max(0, (this.boxWidth - gridWidth) / 2);
		},
		seatCount(): number {
			return Math.max(0, this.seatRow * this.seatCol);
		},
		useViewportCull(): boolean {
			return this.seatCount > CULL_SEAT_THRESHOLD || this.scale > 1.05;
		},
		visibleRange(): { rowStart: number; rowEnd: number; colStart: number; colEnd: number } {
			const lastRow = Math.max(0, this.seatRow - 1);
			const lastCol = Math.max(0, this.seatCol - 1);
			if (!this.useViewportCull || !(this.seatSize > 0)) {
				return { rowStart: 0, rowEnd: lastRow, colStart: 0, colEnd: lastCol };
			}
			const scale = Math.max(this.scale, 0.01);
			const left = -this.moveX / scale;
			const top = -this.moveY / scale;
			const right = left + this.viewportWidth / scale;
			const bottom = top + this.viewportHeight / scale;
			const cellH = this.seatSize + this.seatRowGap;
			const cellW = this.seatSize;
			const offsetX = this.gridOffsetX;
			const gridTop = this.screenHeadHeight;
			const rowStart = Math.max(0, Math.floor((top - gridTop) / cellH) - CULL_BUFFER);
			const rowEnd = Math.min(lastRow, Math.ceil((bottom - gridTop) / cellH) + CULL_BUFFER);
			const colStart = Math.max(0, Math.floor((left - offsetX) / cellW) - CULL_BUFFER);
			const colEnd = Math.min(lastCol, Math.ceil((right - offsetX) / cellW) + CULL_BUFFER);
			return { rowStart, rowEnd, colStart, colEnd };
		},
		visibleSeatItems(): VisibleSeatItem[] {
			const list: VisibleSeatItem[] = [];
			const { rowStart, rowEnd, colStart, colEnd } = this.visibleRange;
			if (!(this.seatSize > 0) || rowEnd < rowStart || colEnd < colStart) return list;
			const cellH = this.seatSize + this.seatRowGap;
			const offsetX = this.gridOffsetX;
			const size = this.seatSize;
			for (let row = rowStart; row <= rowEnd; row++) {
				const line = this.seatArray[row];
				if (!line) continue;
				for (let col = colStart; col <= colEnd; col++) {
					const seat = line[col];
					if (!seat || seat.type < 0) continue;
					list.push({
						key: seat.sid || `s-${row}-${col}`,
						row,
						col,
						seat,
						style: {
							width: `${size}px`,
							height: `${size}px`,
							left: `${offsetX + col * size}px`,
							top: `${row * cellH}px`
						}
					});
				}
			}
			return list;
		},
		thumbWidth(): number {
			return Math.max(72, Math.min(120, this.seatCol * 4));
		},
		thumbHeight(): number {
			return Math.max(48, Math.min(90, this.seatRow * 4));
		},
		thumbDots(): ThumbDot[] {
			const dots: ThumbDot[] = [];
			if (!(this.seatRow > 0) || !(this.seatCol > 0)) return dots;
			const w = 100 / this.seatCol;
			const h = 100 / this.seatRow;
			for (let r = 0; r < this.seatArray.length; r++) {
				const line = this.seatArray[r];
				if (!line) continue;
				for (let c = 0; c < line.length; c++) {
					const seat = line[c];
					if (!seat || seat.type < 0) continue;
					dots.push({
						key: seat.sid || `td-${r}-${c}`,
						cls: this.thumbClass(seat),
						style: {
							width: `${Math.max(w - 0.4, 0.8)}%`,
							height: `${Math.max(h - 0.4, 0.8)}%`,
							left: `${c * w}%`,
							top: `${r * h}%`
						}
					});
				}
			}
			return dots;
		},
		thumbViewportStyle(): Record<string, string> {
			const scale = Math.max(this.scale, 0.01);
			const width = Math.min(100, 100 / scale);
			const height = Math.min(100, 100 / scale);
			const left = Math.min(100 - width, Math.max(0, (-this.moveX / (this.boxWidth * scale)) * 100));
			const top = Math.min(100 - height, Math.max(0, (-this.moveY / (this.contentHeight * scale)) * 100));
			return {
				width: `${width}%`,
				height: `${height}%`,
				left: `${left}%`,
				top: `${top}%`
			};
		},
		thumbnailVisible(): boolean {
			return this.thumbnailShow && this.scale > 1.02;
		}
	},
	watch: {
		seatArray() {
			this.$nextTick(() => this.measureViewport());
		},
		boxWidth() {
			this.viewportWidth = this.boxWidth || this.viewportWidth;
		}
	},
	mounted() {
		const info = getSystemInfoSyncSafe();
		this.viewportWidth = this.boxWidth || Number(info.windowWidth) || 375;
		this.viewportHeight = Math.max(280, Math.floor(Number(info.windowHeight || 667) * 0.48));
		this.$nextTick(() => this.measureViewport());
	},
	beforeUnmount() {
		this.clearGestureTimers();
	},
	methods: {
		measureViewport() {
			uni
				.createSelectorQuery()
				.in(this)
				.select('.seat-map')
				.boundingClientRect((rect: any) => {
					const box = Array.isArray(rect) ? rect[0] : rect;
					if (!box) return;
					if (box.width) this.viewportWidth = Number(box.width);
					if (box.height) this.viewportHeight = Number(box.height);
				})
				.exec();
		},
		clearGestureTimers() {
			if (this.thumbnailHideTimer) clearTimeout(this.thumbnailHideTimer as number);
			if (this._moveRaf) cancelAnimationFrame(this._moveRaf);
			if (this._scaleRaf) cancelAnimationFrame(this._scaleRaf);
			this.thumbnailHideTimer = 0;
			this._moveRaf = 0;
			this._scaleRaf = 0;
			this._pendingMove = null;
			this._pendingScale = null;
		},
		thumbClass(seat: SeatCell) {
			if (!seat || seat.type === -1) return 'is-empty';
			if (seat.type === 1) return 'is-selected';
			if (seat.type === 2) return 'is-sold';
			if (seat.type === 3) return 'is-locked';
			return 'is-free';
		},
		scheduleThumbnailHide() {
			if (this.thumbnailHideTimer) clearTimeout(this.thumbnailHideTimer as number);
			this.thumbnailHideTimer = setTimeout(() => {
				this.thumbnailShow = false;
			}, 1200);
		},
		onScale(e: { detail: { scale: number; x?: number; y?: number } }) {
			this.thumbnailShow = true;
			this.scheduleThumbnailHide();
			this._pendingScale = e.detail;
			if (this._scaleRaf) return;
			this._scaleRaf = requestAnimationFrame(() => {
				this._scaleRaf = 0;
				const detail = this._pendingScale;
				this._pendingScale = null;
				if (!detail) return;
				const w = this.boxWidth * 0.5;
				const s = 1 - detail.scale;
				this.moveX = w * s;
				this.scale = detail.scale;
			}) as unknown as number;
		},
		onMove(e: { detail: { x: number; y: number; source?: string } }) {
			this.thumbnailShow = true;
			this.scheduleThumbnailHide();
			this._pendingMove = { x: e.detail.x, y: e.detail.y };
			if (this._moveRaf) return;
			this._moveRaf = requestAnimationFrame(() => {
				this._moveRaf = 0;
				const detail = this._pendingMove;
				this._pendingMove = null;
				if (!detail) return;
				this.moveX = detail.x;
				this.moveY = detail.y;
			}) as unknown as number;
		}
	}
});
</script>

<style lang="scss" scoped>
.fz-seat-map-root {
	position: absolute;
	inset: 0;
	pointer-events: none;
}

.seat-map {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	width: 100%;
	height: auto;
	background: #f1f2f4;
	pointer-events: auto;
}

.seat-movable {
	background: transparent !important;
}

.row-rail-inner {
	position: absolute;
	left: 10rpx;
	z-index: 3;
	pointer-events: none;
}

.row-rail-bar {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 32rpx;
	box-sizing: border-box;
	border-radius: 16rpx;
	background: rgba(45, 48, 56, 0.38);
	overflow: hidden;
}

.row-rail-item {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	box-sizing: border-box;
}

.row-rail-item text {
	font-size: 18rpx;
	line-height: 1;
	color: rgba(255, 255, 255, 0.92);
	text-align: center;
}

.seat-thumbnail {
	position: absolute;
	top: 18rpx;
	right: 20rpx;
	z-index: 22;
	padding: 8rpx;
	border-radius: 12rpx;
	background: rgba(255, 255, 255, 0.92);
	box-shadow: 0 8rpx 24rpx rgba(24, 28, 36, 0.16);
	pointer-events: none;
}

.thumb-grid {
	position: relative;
	overflow: hidden;
	border-radius: 6rpx;
	background: #eef0f3;
}

.thumb-dot {
	position: absolute;
	border-radius: 1px;
	box-sizing: border-box;
}

.thumb-dot.is-free {
	background: #cfd3d9;
}
.thumb-dot.is-selected {
	background: #a3ad34;
}
.thumb-dot.is-sold {
	background: #b0b4bb;
}
.thumb-dot.is-locked {
	background: #9aa0aa;
}

.thumb-viewport {
	position: absolute;
	box-sizing: border-box;
	border: 2rpx solid #ff5f57;
	border-radius: 4rpx;
	pointer-events: none;
}

.screen-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	box-sizing: border-box;
	padding-top: 12rpx;
	position: relative;
}

.screen-glow {
	position: absolute;
	top: 8rpx;
	left: 50%;
	width: 520rpx;
	height: 48rpx;
	transform: translateX(-50%);
	background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0));
	pointer-events: none;
}

.screen-arc {
	width: 460rpx;
	height: 36rpx;
	border-top: 6rpx solid #d0d5dc;
	border-radius: 50% 50% 0 0;
	background: linear-gradient(180deg, rgba(213, 217, 224, 0.4), rgba(247, 248, 250, 0));
	box-shadow: 0 -5rpx 14rpx rgba(92, 101, 116, 0.08);
}

.screen-label {
	margin-top: 4rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	letter-spacing: 4rpx;
	color: #9aa0aa;
}

.best-zone-box {
	position: absolute;
	z-index: 2;
	box-sizing: border-box;
	border: 2rpx dashed rgba(232, 140, 140, 0.55);
	border-radius: 8rpx;
	background: transparent;
	pointer-events: none;
}

.best-zone-tip {
	position: absolute;
	top: -28rpx;
	left: 50%;
	transform: translateX(-50%);
	padding: 0 10rpx;
	font-size: 18rpx;
	line-height: 24rpx;
	letter-spacing: 1rpx;
	color: rgba(214, 128, 128, 0.88);
	white-space: nowrap;
	background: #f1f2f4;
}

.seat-center-line {
	position: absolute;
	left: 50%;
	z-index: 0;
	width: 0;
	border-left: 1px dashed rgba(164, 169, 178, 0.45);
	transform: translateX(-50%);
}

.seat-rows {
	position: relative;
	z-index: 1;
}

.seat-cell {
	position: absolute;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.seat-image {
	width: 86%;
	height: 86%;
	display: block;
}

.seat-image.is-sold,
.seat-image.is-maintenance {
	opacity: 0.92;
}

.seat-cell.is-active {
	transform: scale(1.06);
}

.seat-empty {
	padding: 80rpx 0;
	text-align: center;
	font-size: 26rpx;
	color: #9aa0aa;
}
</style>

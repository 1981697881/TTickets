<template>
	<view class="fz-seat-map-root">
		<!-- scale-area：双指缩放可在整个座位视口识别，不限于按住座位格 -->
		<movable-area class="seat-map" :scale-area="true" :style="areaStyle">
			<movable-view
				class="seat-movable"
				:style="{ width: contentWidth + 'px', height: contentHeight + 'px', background: 'transparent' }"
				:x="moveX"
				:y="moveY"
				:scale-value="scale"
				:animation="false"
				:inertia="true"
				:scale="true"
				:scale-min="effectiveScaleMin"
				:scale-max="3"
				direction="all"
				@change="onMove"
				@scale="onScale"
			>
				<view class="screen-wrap" :style="{ height: screenHeadHeight + 'px', width: contentWidth + 'px' }">
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
					:style="{ top: screenHeadHeight + 'px', height: Math.max(0, gridHeight) + 'px', left: contentWidth / 2 + 'px' }"
				></view>

				<view v-if="bestZoneVisible" class="best-zone-box" :style="bestZoneBoxStyle">
					<text class="best-zone-tip">最佳观影区</text>
				</view>

				<view
					v-if="seatArray.length"
					class="seat-rows"
					:style="{ width: contentWidth + 'px', height: gridHeight + 'px' }"
				>
					<view
						v-for="item in visibleSeatItems"
						:key="item.key"
						class="seat-cell"
						:class="{ 'is-active': item.seat.type === 1 || selectedSidSet[item.seat.sid] }"
						:style="item.style"
						@tap.stop="onSeatTap(item.row, item.col, item.seat)"
					>
						<image
							class="seat-image"
							:class="{ 'is-sold': item.seat.type === 2, 'is-maintenance': item.seat.type === 3 }"
							:src="seatIconSrc(item.seat)"
							mode="aspectFit"
						></image>
					</view>
				</view>
				<view v-else class="seat-empty">暂无可选座位</view>
			</movable-view>
		</movable-area>

		<!-- 必须叠在座位层之上，否则点不到；选座后高亮已选点 -->
		<view
			v-if="thumbnailVisible"
			class="seat-thumbnail"
			@touchstart.stop.prevent="onThumbTouchStart"
			@touchmove.stop.prevent="onThumbTouchMove"
			@touchend.stop.prevent="onThumbTouchEnd"
			@tap.stop.prevent="onThumbTap"
		>
			<view class="thumb-screen"></view>
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

/** 小程序逻辑层无 window.requestAnimationFrame，用 setTimeout 兜底 */
function scheduleFrame(fn: () => void): number {
	const raf =
		typeof requestAnimationFrame === 'function'
			? requestAnimationFrame
			: (typeof globalThis !== 'undefined' &&
					typeof (globalThis as any).requestAnimationFrame === 'function' &&
					(globalThis as any).requestAnimationFrame) ||
			  null;
	if (raf) return raf(fn) as number;
	return setTimeout(fn, 16) as unknown as number;
}

function cancelFrame(id: number) {
	if (!id) return;
	const caf =
		typeof cancelAnimationFrame === 'function'
			? cancelAnimationFrame
			: (typeof globalThis !== 'undefined' &&
					typeof (globalThis as any).cancelAnimationFrame === 'function' &&
					(globalThis as any).cancelAnimationFrame) ||
			  null;
	if (caf) {
		caf(id);
		return;
	}
	clearTimeout(id);
}

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
		selectedCount: { type: Number, default: 0 },
		/** 已选座位 id，用于缩略图高亮（不依赖深层 type 变更） */
		selectedSids: {
			type: Array as PropType<string[]>,
			default: () => []
		},
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
			_pendingMove: null as { x: number; y: number } | null,
			_thumbRect: null as { left: number; top: number; width: number; height: number } | null,
			_thumbDriving: false,
			seatEpoch: 0
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
		selectedSidSet(): Record<string, boolean> {
			const map: Record<string, boolean> = {};
			(this.selectedSids || []).forEach(id => {
				if (id) map[String(id)] = true;
			});
			return map;
		},
		selectedKey(): string {
			return (this.selectedSids || []).join('|');
		},
		gridHeight(): number {
			if (!(this.seatRow > 0) || !(this.seatSize > 0)) return 0;
			return this.seatRow * (this.seatSize + this.seatRowGap);
		},
		/** 座位网格实际宽度（可能大于视口，才能左右拖） */
		gridWidth(): number {
			if (!(this.seatCol > 0) || !(this.seatSize > 0)) return this.boxWidth;
			return this.seatCol * this.seatSize;
		},
		contentWidth(): number {
			// 比视口略宽一点时才有横向拖动余量；网格更宽时以网格为准
			const pad = 24;
			return Math.max(this.viewportWidth || this.boxWidth, this.gridWidth + pad);
		},
		contentHeight(): number {
			// 不再强制 min 360，避免小厅下方大片空白
			const bottomPad = 28;
			return Math.max(
				this.viewportHeight || 0,
				this.screenHeadHeight + this.gridHeight + bottomPad
			);
		},
		gridOffsetX(): number {
			return Math.max(0, (this.contentWidth - this.gridWidth) / 2);
		},
		needsPan(): boolean {
			const vw = this.viewportWidth || this.boxWidth;
			const vh = this.viewportHeight || 0;
			return this.contentWidth > vw + 2 || this.contentHeight > vh + 2 || this.scale > 1.02;
		},
		effectiveScaleMin(): number {
			const vw = this.viewportWidth || this.boxWidth;
			// 至少能略缩小；大厅可缩到整厅入屏，保证 pinch 有双向行程
			let min = Math.min(Number(this.scaleMin) || 1, 0.85);
			if (this.gridWidth > vw && this.gridWidth > 0) {
				min = Math.min(min, Math.max(0.5, (vw - 16) / this.gridWidth));
			}
			return Math.max(0.5, min);
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
			// 强制依赖选座变化，避免仅改 seat.type 时缩略图不刷新
			void this.selectedKey;
			void this.selectedCount;
			void this.seatEpoch;
			const dots: ThumbDot[] = [];
			if (!(this.seatRow > 0) || !(this.seatCol > 0)) return dots;
			const w = 100 / this.seatCol;
			const h = 100 / this.seatRow;
			const selected = this.selectedSidSet;
			for (let r = 0; r < this.seatArray.length; r++) {
				const line = this.seatArray[r];
				if (!line) continue;
				for (let c = 0; c < line.length; c++) {
					const seat = line[c];
					if (!seat || seat.type < 0) continue;
					const sid = String(seat.sid || '');
					const isSelected = Boolean(sid && selected[sid]) || seat.type === 1;
					dots.push({
						key: `${sid || `td-${r}-${c}`}-${isSelected ? 1 : seat.type}`,
						cls: isSelected ? 'is-selected' : this.thumbClass(seat),
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
			void this.moveX;
			void this.moveY;
			void this.scale;
			const scale = Math.max(this.scale, 0.01);
			const vw = this.viewportWidth || this.boxWidth;
			const vh = this.viewportHeight || 1;
			const gw = Math.max(this.gridWidth, 1);
			const gh = Math.max(this.gridHeight, 1);
			const gridLeft = this.gridOffsetX;
			const gridTop = this.screenHeadHeight;

			const visLeft = -this.moveX / scale;
			const visTop = -this.moveY / scale;
			const visRight = visLeft + vw / scale;
			const visBottom = visTop + vh / scale;

			const leftPct = ((Math.max(visLeft, gridLeft) - gridLeft) / gw) * 100;
			const topPct = ((Math.max(visTop, gridTop) - gridTop) / gh) * 100;
			const rightPct = ((Math.min(visRight, gridLeft + gw) - gridLeft) / gw) * 100;
			const bottomPct = ((Math.min(visBottom, gridTop + gh) - gridTop) / gh) * 100;

			const width = Math.max(8, Math.min(100, rightPct - leftPct));
			const height = Math.max(8, Math.min(100, bottomPct - topPct));
			const left = Math.max(0, Math.min(100 - width, leftPct));
			const top = Math.max(0, Math.min(100 - height, topPct));
			return {
				width: `${width}%`,
				height: `${height}%`,
				left: `${left}%`,
				top: `${top}%`
			};
		},
		thumbnailVisible(): boolean {
			if (!this.seatArray.length) return false;
			return this.thumbnailShow || this.selectedCount > 0 || this.needsPan || this.scale > 1.02;
		}
	},
	watch: {
		seatArray() {
			this.seatEpoch += 1;
			this.$nextTick(() => this.measureViewport());
		},
		selectedCount(n: number) {
			if (n > 0) {
				this.thumbnailShow = true;
				this.seatEpoch += 1;
			}
		},
		selectedKey() {
			this.thumbnailShow = true;
			this.seatEpoch += 1;
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
			if (this._moveRaf) cancelFrame(this._moveRaf);
			this.thumbnailHideTimer = 0;
			this._moveRaf = 0;
			this._pendingMove = null;
		},
		thumbClass(seat: SeatCell) {
			if (!seat || seat.type === -1) return 'is-empty';
			if (seat.type === 1) return 'is-selected';
			if (seat.type === 2) return 'is-sold';
			if (seat.type === 3) return 'is-locked';
			return 'is-free';
		},
		seatIconSrc(seat: SeatCell) {
			if (!seat) return this.seatIcons.unselected;
			if (seat.sid && this.selectedSidSet[String(seat.sid)]) return this.seatIcons.selected;
			return this.seatIconByType[seat.type] || this.seatIcons.unselected;
		},
		onSeatTap(row: number, col: number, seat: SeatCell) {
			this.thumbnailShow = true;
			this.seatEpoch += 1;
			this.$emit('choose', { row, col, seat });
			// 等父组件更新 selectedCount / selectedSids 后再决定是否收起
			this.$nextTick(() => this.scheduleThumbnailHide());
		},
		scheduleThumbnailHide() {
			if (this.thumbnailHideTimer) clearTimeout(this.thumbnailHideTimer as number);
			if (this.selectedCount > 0 || this.needsPan || this._thumbDriving) {
				this.thumbnailHideTimer = 0;
				return;
			}
			this.thumbnailHideTimer = setTimeout(() => {
				this.thumbnailShow = false;
			}, 1800);
		},
		clampMove(x: number, y: number, scale = this.scale) {
			const vw = this.viewportWidth || this.boxWidth;
			const vh = this.viewportHeight || 1;
			const minX = Math.min(0, vw - this.contentWidth * scale);
			const minY = Math.min(0, vh - this.contentHeight * scale);
			return {
				x: Math.min(0, Math.max(minX, x)),
				y: Math.min(0, Math.max(minY, y))
			};
		},
		jumpToThumbPoint(clientX: number, clientY: number) {
			const apply = (rect: { left: number; top: number; width: number; height: number }) => {
				if (!rect.width || !rect.height) return;
				const rx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
				const ry = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
				const scale = Math.max(this.scale, 0.01);
				const vw = this.viewportWidth || this.boxWidth;
				const vh = this.viewportHeight || 1;
				// 缩略图点对应座位网格坐标，主图滚到该点居中
				const targetX = this.gridOffsetX + rx * this.gridWidth;
				const targetY = this.screenHeadHeight + ry * this.gridHeight;
				const next = this.clampMove(vw / 2 - targetX * scale, vh / 2 - targetY * scale, scale);
				// 微信 movable-view：连续同值赋值可能不生效，先微偏移再设目标
				this.moveX = next.x + 0.01;
				this.moveY = next.y + 0.01;
				this.$nextTick(() => {
					this.moveX = next.x;
					this.moveY = next.y;
				});
				this.thumbnailShow = true;
			};
			if (this._thumbRect && this._thumbRect.width) {
				apply(this._thumbRect);
				return;
			}
			uni
				.createSelectorQuery()
				.in(this)
				.select('.thumb-grid')
				.boundingClientRect((rect: any) => {
					const box = Array.isArray(rect) ? rect[0] : rect;
					if (!box || !box.width) return;
					this._thumbRect = {
						left: Number(box.left) || 0,
						top: Number(box.top) || 0,
						width: Number(box.width) || 0,
						height: Number(box.height) || 0
					};
					apply(this._thumbRect);
				})
				.exec();
		},
		onThumbTap(e: any) {
			const t = (e.detail && (e.detail.x != null || e.detail.y != null) ? e.detail : null) ||
				(e.touches && e.touches[0]) ||
				(e.changedTouches && e.changedTouches[0]);
			if (!t) return;
			const x = t.clientX != null ? t.clientX : t.x;
			const y = t.clientY != null ? t.clientY : t.y;
			if (x == null || y == null) return;
			this._thumbDriving = true;
			this._thumbRect = null;
			this.jumpToThumbPoint(x, y);
			this._thumbDriving = false;
		},
		onThumbTouchStart(e: any) {
			this._thumbDriving = true;
			this.thumbnailShow = true;
			const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
			if (!t) return;
			this._thumbRect = null;
			this.jumpToThumbPoint(t.clientX, t.clientY);
		},
		onThumbTouchMove(e: any) {
			const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
			if (!t) return;
			this.jumpToThumbPoint(t.clientX, t.clientY);
		},
		onThumbTouchEnd() {
			this._thumbDriving = false;
			this.scheduleThumbnailHide();
		},
		onScale(e: { detail: { scale: number; x?: number; y?: number } }) {
			if (this._thumbDriving) return;
			const detail = e.detail || ({} as { scale: number; x?: number; y?: number });
			const nextScale = Number(detail.scale);
			if (!(nextScale > 0)) return;
			// 必须同步回写 scale-value，否则 Vue 仍绑旧值会把双指缩放打回 1
			this.scale = nextScale;
			this.thumbnailShow = true;
			this.scheduleThumbnailHide();
			// 缩放过程中不要强行改 x/y（会与原生手势打架）；位置交给 @change
		},
		onMove(e: { detail: { x: number; y: number; source?: string } }) {
			if (this._thumbDriving) return;
			const source = e.detail && e.detail.source;
			// 忽略 setData 回写；缩放时 source 可能为空，仍需同步坐标
			if (source === 'out-of-bounds' || source === 'touch-out-of-bounds') {
				return;
			}
			if (source && source !== 'touch' && source !== 'friction' && source !== '') {
				return;
			}
			this.thumbnailShow = true;
			this.scheduleThumbnailHide();
			const x = e.detail.x;
			const y = e.detail.y;
			if (typeof x !== 'number' || typeof y !== 'number') return;
			this._pendingMove = { x, y };
			if (this._moveRaf) return;
			this._moveRaf = scheduleFrame(() => {
				this._moveRaf = 0;
				const detail = this._pendingMove;
				this._pendingMove = null;
				if (!detail) return;
				this.moveX = detail.x;
				this.moveY = detail.y;
			});
		}
	}
});
</script>

<style lang="scss" scoped>
.fz-seat-map-root {
	position: absolute;
	inset: 0;
	pointer-events: auto;
}

.seat-map {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	width: 100%;
	height: 100%;
	background: #f1f2f4;
	z-index: 1;
	pointer-events: auto;
	overflow: hidden;
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
	top: 16rpx;
	left: 16rpx;
	z-index: 999;
	padding: 0;
	border: 0;
	border-radius: 4rpx;
	overflow: hidden;
	background: rgba(40, 44, 52, 0.9);
	box-shadow: none;
	pointer-events: auto;
}

.thumb-screen {
	height: 6rpx;
	margin: 8rpx 12rpx 4rpx;
	border-radius: 3rpx;
	background: var(--tt-primary, #a9b238);
	opacity: 0.85;
}

.thumb-grid {
	position: relative;
	overflow: hidden;
	margin: 0 8rpx 8rpx;
	border-radius: 0;
	background: transparent;
}

.thumb-dot {
	position: absolute;
	border-radius: 1px;
	box-sizing: border-box;
}

.thumb-dot.is-free {
	background: rgba(255, 255, 255, 0.55);
}
.thumb-dot.is-selected {
	background: var(--tt-primary, #a9b238);
}
.thumb-dot.is-sold {
	background: #e45b5b;
}
.thumb-dot.is-locked {
	background: #9aa0aa;
}

.thumb-viewport {
	position: absolute;
	z-index: 2;
	box-sizing: border-box;
	border: 2rpx solid #ff4d4f;
	border-radius: 2rpx;
	background: rgba(255, 77, 79, 0.12);
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
	background: radial-gradient(
		ellipse at center,
		rgba(169, 178, 56, 0.28),
		rgba(169, 178, 56, 0)
	);
	pointer-events: none;
}

.screen-arc {
	width: 460rpx;
	height: 36rpx;
	border-top: 6rpx solid var(--tt-primary, #a9b238);
	border-radius: 50% 50% 0 0;
	background: linear-gradient(
		180deg,
		rgba(169, 178, 56, 0.22),
		rgba(241, 242, 244, 0)
	);
	box-shadow: 0 -5rpx 14rpx rgba(143, 152, 30, 0.12);
}

.screen-label {
	margin-top: 4rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	letter-spacing: 4rpx;
	color: var(--tt-primary-strong, #8f981e);
	font-weight: 600;
}

.best-zone-box {
	position: absolute;
	z-index: 1;
	box-sizing: border-box;
	border: 2rpx dashed rgba(232, 140, 140, 0.55);
	border-radius: 8rpx;
	background: transparent;
	pointer-events: none;
}

/* 文案放在框内顶部，避免压住框外上一排座位 */
.best-zone-tip {
	position: absolute;
	top: 6rpx;
	left: 50%;
	transform: translateX(-50%);
	z-index: 0;
	padding: 0 10rpx;
	font-size: 18rpx;
	line-height: 24rpx;
	letter-spacing: 2rpx;
	color: rgba(214, 128, 128, 0.95);
	white-space: nowrap;
	background: rgba(241, 242, 244, 0.92);
	border-radius: 6rpx;
	pointer-events: none;
}

.seat-center-line {
	position: absolute;
	z-index: 0;
	width: 0;
	border-left: 1px dashed rgba(164, 169, 178, 0.45);
	transform: translateX(-50%);
}

.seat-rows {
	position: relative;
	z-index: 2;
}

.seat-cell {
	position: absolute;
	z-index: 2;
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

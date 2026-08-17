<template>
	<view class="seat-page">
		<view class="seat-canvas">
			<view class="seat-summary">
				<view class="summary-title-row">
					<text class="summary-film">{{ head.filmName || '影片信息' }}</text>
					<text v-if="head.hallName" class="summary-hall">{{ head.hallName }}</text>
				</view>
				<view class="summary-meta">
					<text class="summary-session" :class="{ 'is-non-today': sessionDayAlert.show }">{{ sessionDisplayText }}</text>
					<text v-if="head.language || head.dimensional" class="summary-version">{{ versionText }}</text>
				</view>
			</view>

			<view v-if="sessionDayAlert.show" class="session-day-alert" :class="{ 'is-expired': sessionDayAlert.dayOffset < 0 }">
				<text class="session-day-alert__tag">{{ sessionDayAlert.title }}</text>
				<text class="session-day-alert__text">{{ sessionDayAlert.detail }}</text>
			</view>

			<view class="seat-legend">
				<view class="legend-item"><image class="legend-seat-image" :src="seatIcons.unselected" mode="aspectFit"></image><text>可选</text></view>
				<view class="legend-item"><image class="legend-seat-image" :src="seatIcons.selected" mode="aspectFit"></image><text>已选</text></view>
				<view class="legend-item"><image class="legend-seat-image is-sold" :src="seatIcons.bought" mode="aspectFit"></image><text>已售</text></view>
				<view class="legend-item"><image class="legend-seat-image is-maintenance" :src="seatIcons.lockwei" mode="aspectFit"></image><text>维修</text></view>
			</view>

			<view class="seat-map-slot" :style="seatMapAreaStyle">
				<fz-seat-map
					:seat-array="seatArray"
					:m-arr="mArr"
					:seat-icons="seatIcons"
					:seat-row="seatRow"
					:seat-col="seatCol"
					:seat-size="seatSize"
					:seat-row-gap="seatRowGap"
					:box-width="boxWidth"
					:screen-head-height="screenHeadHeight"
					:scale-min="scaleMin"
					:selected-count="SelectNum"
					:selected-sids="selectedSeatSids"
					:best-zone-visible="bestZoneVisible"
					:best-zone-box-style="bestZoneBoxStyle"
					@choose="onSeatChoose"
				/>
			</view>

			<view class="seat-bottom-bar">
				<view class="seat-actions">
					<view class="recommend-row" v-if="SelectNum === 0">
						<text class="action-label">推荐选座</text>
						<view
							class="recommend-chip"
							v-for="(n, numindex) in 4"
							:key="n"
							@tap="smartChoose(numindex + 1)"
						>
							{{ numindex + 1 }}人
						</view>
					</view>
					<view class="selected-row" v-else>
						<text class="action-label">已选 {{ SelectNum }} 座</text>
						<scroll-view class="selected-scroll" scroll-x :show-scrollbar="false" :enable-flex="true">
							<view class="selected-chip-track">
								<view class="selected-chip" v-for="(optItem, optindex) in optArr" :key="optItem.sid || optindex" @tap="removeSelectedSeat(optItem)">
									<text>{{ optItem.rowNum }}排{{ optItem.columnNum }}座</text>
									<text class="chip-close">×</text>
								</view>
							</view>
						</scroll-view>
					</view>
					<view class="submit-row">
						<view v-if="SelectNum > 0" class="price-summary">
							<text class="total-price">¥{{ displayTotalPrice }}</text>
							<text class="price-tip">{{ SelectNum }}张 · 含服务费</text>
						</view>
						<button
							:disabled="isSubOrder || SelectNum === 0"
							class="seat-submit"
							:class="{ active: SelectNum > 0 }"
							@tap="buySeat"
						>
							{{ isSubOrder ? '正在锁座...' : SelectNum > 0 ? '确认选座' : '请先选择座位' }}
						</button>
					</view>
				</view>
			</view>
		</view>
		<app-login-modal></app-login-modal>
		<view class="cu-load load-modal" v-if="loadModal">
			<view class="cuIcon-emojifill text-orange"></view>
			<view class="gray-text">加载中...</view>
		</view>
	</view>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'vuex';
import { getSafeAreaInsets, getSystemInfoSafe } from '@/common/runtime/system-info';
import {
	formatSessionDisplay,
	getNonTodaySessionAlert,
	isSessionStarted
} from '@/common/utils/session-date';
import FzSeatMap from './children/fz-seat-map.vue';
import { createLoginRefreshMixin } from '@/common/mixins/login-refresh.js';

type SeatCell = {
	type: number;
	sid: string;
	money?: number | string;
	rowNum?: string | number;
	columnNum?: string | number;
};

type SeatHead = {
	filmName?: string | null;
	language?: string | null;
	dimensional?: string | null;
	hallType?: string | null;
	hallName?: string | null;
	showDatetime?: string | null;
	scheduleId?: string | number | null;
	schedulekey?: string | number | null;
	sessionsStarttime?: string | null;
	filmId?: string | number | null;
	[key: string]: unknown;
};

export default defineComponent({
	name: 'CinemaSeatSelectPage',
	components: {
		FzSeatMap
	},
	mixins: [createLoginRefreshMixin('onLoginRefresh', { refreshOnShow: false })],
	data() {
		return {
			// 用运行时路径，避免模板字面量被 Vite 编成 /assets/*.hash（dev 常缺文件）
			seatIcons: {
				unselected: '/static/imgs/seat/unselected.png',
				selected: '/static/imgs/seat/selected.png',
				bought: '/static/imgs/seat/bought.png',
				lockwei: '/static/imgs/seat/lockwei.png'
			},
			loadModal: false,
			isSubOrder: false,
			filmId: '' as string | number,
			scaleMin: 1,
			boxWidth: 400,
			screenHeadHeight: 86,
			seatRowGap: 10,
			seatArray: [] as SeatCell[][],
			seatRow: 0,
			seatCol: 0,
			seatSize: 0,
			SelectNum: 0,
			safeBottom: 0,
			listParams: {
				scheduleId: null as string | number | null,
				schedulekey: null as string | number | null,
				scheduleKey: null as string | number | null,
				hallId: null as string | number | null,
				sectionId: null as string | number | null
			},
			head: {
				filmName: null,
				language: null,
				dimensional: null,
				hallType: null,
				hallName: null,
				showDatetime: null,
				scheduleId: null,
				schedulekey: null,
				sessionsStarttime: null
			} as SeatHead,
			totalPrice: 0,
			minRow: 0,
			minCol: 0,
			seatList: [] as any[],
			mArr: [] as Array<string | number>,
			optArr: [] as SeatCell[],
			isEsc: true,
			bestZoneBoxStyle: { display: 'none' } as Record<string, string>
		};
	},
	computed: {
		...mapState({
			storeInfo: (state: any) => state.user.storeInfo
		}),
		versionText(): string {
			return [this.head.language, this.head.dimensional].filter(Boolean).join(' ');
		},
		displayTotalPrice(): string {
			const amount = Number(this.totalPrice);
			if (!Number.isFinite(amount)) return '0';
			return amount % 1 === 0 ? String(amount) : amount.toFixed(2);
		},
		seatMapBottom(): string {
			const base = this.SelectNum > 0 ? 300 : 260;
			const safe = Math.max(0, this.safeBottom);
			return `calc(${base}rpx + ${safe}px)`;
		},
		seatMapAreaStyle(): Record<string, string> {
			return {
				bottom: this.seatMapBottom,
				top: this.sessionDayAlert.show ? '276rpx' : '192rpx'
			};
		},
		bestZoneVisible(): boolean {
			return this.seatRow > 3 && this.seatCol > 4 && this.seatSize > 0 && this.bestZoneBoxStyle.display !== 'none';
		},
		selectedSeatSids(): string[] {
			return (this.optArr || []).map(item => String(item.sid || '')).filter(Boolean);
		},
		sessionRawTime(): string {
			return String(this.head.showDatetime || this.head.sessionsStarttime || '');
		},
		sessionDisplayText(): string {
			return formatSessionDisplay(this.sessionRawTime);
		},
		sessionDayAlert(): { show: boolean; dayOffset: number | null; title: string; detail: string } {
			return getNonTodaySessionAlert(this.sessionRawTime);
		}
	},
	onShow() {
		const that = this;
		uni.showLoading({ title: '加载中' });
		uni.$once('escLoack', (data: Record<string, unknown>) => {
			that.isEsc = false;
			that.isSubOrder = false;
			(that as any).$api('cinema.escSeats', data).then((res: any) => {
				if (res.flag) that.initData();
			});
		});
		if (that.isEsc) {
			that.SelectNum = 0;
			that.totalPrice = 0;
			that.optArr = [];
			that.isSubOrder = false;
			that.initData();
		}
	},
	onUnload() {
		uni.$emit('escUpload', { filmId: this.filmId });
	},
	onLoad(options: Record<string, any>) {
		this.isSubOrder = false;
		const routeQuery = (this as any).$Route?.query || {};
		const query = this.decodeRouteQuery({ ...routeQuery, ...(options || {}) });
		this.head = { ...this.head, ...query };
		this.filmId = query.filmId || '';
		this.listParams.scheduleId = query.scheduleId;
		this.listParams.hallId = query.hallId;
		this.listParams.schedulekey = query.schedulekey;
		this.listParams.scheduleKey = query.schedulekey;
		this.listParams.sectionId = query.sectionId;
		const insets = getSafeAreaInsets();
		this.safeBottom = insets.bottom || 0;
		getSystemInfoSafe({
			success: e => {
				this.boxWidth = e.windowWidth || e.screenWidth || 375;
				this.safeBottom = getSafeAreaInsets().bottom || this.safeBottom;
				if (this.seatCol > 0) {
					const usable = Math.max(200, this.boxWidth - 28);
					const naturalSize = Math.floor(usable / this.seatCol);
					this.seatSize = Math.max(16, Math.min(34, naturalSize));
					this.updateBestZoneBox();
				}
				// #ifdef H5
				this.scaleMin = 0.95;
				// #endif
			}
		});
	},
	methods: {
		...mapActions(['getUserBalance']),
		onLoginRefresh() {
			return this.initData();
		},
		onSeatChoose(payload: { row: number; col: number; seat: SeatCell }) {
			this.handleChooseSeat(payload.row, payload.col, payload.seat);
		},
		decodeRouteValue(value: unknown) {
			if (typeof value !== 'string') return value;
			let result = value;
			for (let count = 0; count < 3; count += 1) {
				try {
					const decoded = decodeURIComponent(result);
					if (decoded === result) break;
					result = decoded;
				} catch (error) {
					break;
				}
			}
			return result;
		},
		decodeRouteQuery(query: Record<string, any>) {
			return Object.keys(query || {}).reduce((result: Record<string, any>, key) => {
				result[key] = this.decodeRouteValue(query[key]);
				return result;
			}, {});
		},
		initData() {
			const that = this;
			(that as any).$api('cinema.seatsLists', this.listParams).then((res: any) => {
				if (res.flag) {
					that.SelectNum = 0;
					that.totalPrice = 0;
					that.optArr = [];
					const arr = res.data && Array.isArray(res.data.scheduleSeats) ? res.data.scheduleSeats : [];
					if (!arr.length) {
						that.seatList = [];
						that.seatArray = [];
						that.seatRow = 0;
						that.seatCol = 0;
						uni.hideLoading();
						return;
					}
					let row = 0;
					let col = 0;
					let minCol = parseInt(arr[0].x, 10);
					let minRow = parseInt(arr[0].y, 10);
					for (const item of arr) {
						minRow = parseInt(item.y, 10) < minRow ? parseInt(item.y, 10) : minRow;
						minCol = parseInt(item.x, 10) < minCol ? parseInt(item.x, 10) : minCol;
						row = parseInt(item.y, 10) > row ? parseInt(item.y, 10) : row;
						col = parseInt(item.x, 10) > col ? parseInt(item.x, 10) : col;
					}
					that.isEsc = true;
					that.seatList = arr;
					that.seatRow = row - minRow + 1;
					that.seatCol = col - minCol + 3;
					that.minRow = minRow;
					that.minCol = minCol - 1;
					that.initSeatArray();
					uni.hideLoading();
					if ((res.data.tipSwitch == '0' && res.data.dimensional == '3D') || (res.data.tipSwitch4d == '0' && res.data.dimensional == '4D')) {
						(that as any).$tools.toast(res.data.tipMessage, 'none', { duration: 2500 });
					}
				} else {
					uni.hideLoading();
					uni.showToast({ icon: 'none', title: res.msg });
				}
			}).catch(() => {
				uni.hideLoading();
				that.seatArray = [];
			});
		},
		initSeatArray() {
			const seatArray = Array(this.seatRow)
				.fill(0)
				.map(() =>
					Array(this.seatCol).fill(0).map(() => ({
						type: -1,
						sid: '',
						rowNum: '',
						columnNum: ''
					}))
				);
			this.seatArray = seatArray;
			// 保证整厅横向尽量入屏；过小不低于 16，过大不超过 34
			const usable = Math.max(200, (this.boxWidth || 375) - 28);
			const naturalSize = this.seatCol > 0 ? Math.floor(usable / this.seatCol) : 28;
			this.seatSize = Math.max(16, Math.min(34, naturalSize));
			this.initNonSeatPlace();
		},
		initNonSeatPlace() {
			const seat = this.seatList.slice();
			const arr = this.seatArray;
			for (const num in seat) {
				let status = 3;
				if (seat[num].status === '') status = 0;
				else if (seat[num].status === '-1') status = -1;
				else if (seat[num].status === 'locked' || seat[num].status === 'selled') status = 2;
				arr[parseInt(seat[num].y, 10) - this.minRow][parseInt(seat[num].x, 10) - this.minCol] = {
					type: status,
					sid: seat[num].seatId,
					money: seat[num].standardprice,
					rowNum: seat[num].rowId,
					columnNum: seat[num].columnId
				};
			}
			const mArr: Array<string | number> = [];
			for (const row of arr) {
				let m: string | number = '';
				for (const n of row) {
					if (n.sid) m = n.rowNum as string | number;
				}
				mArr.push(m || '');
			}
			this.mArr = mArr;
			this.updateBestZoneBox();
		},
		updateBestZoneBox() {
			if (!(this.seatRow > 3 && this.seatCol > 4 && this.seatSize > 0)) {
				this.bestZoneBoxStyle = { display: 'none' };
				return;
			}

			// 以真实有座格子为边界（忽略矩阵左右/前后空白垫格）
			let minSeatRow = this.seatRow;
			let maxSeatRow = -1;
			let minSeatCol = this.seatCol;
			let maxSeatCol = -1;
			for (let r = 0; r < this.seatArray.length; r++) {
				const row = this.seatArray[r];
				if (!row) continue;
				row.forEach((seat, col) => {
					if (seat && seat.sid) {
						minSeatRow = Math.min(minSeatRow, r);
						maxSeatRow = Math.max(maxSeatRow, r);
						minSeatCol = Math.min(minSeatCol, col);
						maxSeatCol = Math.max(maxSeatCol, col);
					}
				});
			}
			if (maxSeatRow < minSeatRow || maxSeatCol < minSeatCol) {
				this.bestZoneBoxStyle = { display: 'none' };
				return;
			}

			/**
			 * 淘票票 / 猫眼常见做法（接口通常无区域字段，前端几何估算）：
			 * - 纵向：银幕方向「中间偏前」——落在有座进深约 22%～52%（避开最前几排与后区）
			 * - 横向：居中约 60% 座区（左右各裁约 20%）
			 * - 与「推荐选座」独立：框只做视觉引导，不改选座算法
			 */
			const rowSpan = maxSeatRow - minSeatRow + 1;
			const colSpan = maxSeatCol - minSeatCol + 1;
			let rowStart = minSeatRow + Math.floor(rowSpan * 0.22);
			let rowEnd = minSeatRow + Math.ceil(rowSpan * 0.52) - 1;
			let colStart = minSeatCol + Math.floor(colSpan * 0.2);
			let colEnd = minSeatCol + Math.ceil(colSpan * 0.8) - 1;

			// 至少覆盖 2 排 × 4 座，避免小厅框过碎
			if (rowEnd - rowStart < 1) {
				rowEnd = Math.min(maxSeatRow, rowStart + 1);
			}
			if (colEnd - colStart < 3) {
				const mid = Math.floor((minSeatCol + maxSeatCol) / 2);
				colStart = Math.max(minSeatCol, mid - 2);
				colEnd = Math.min(maxSeatCol, colStart + 3);
			}
			rowStart = Math.max(minSeatRow, Math.min(rowStart, maxSeatRow));
			rowEnd = Math.max(rowStart, Math.min(rowEnd, maxSeatRow));
			colStart = Math.max(minSeatCol, Math.min(colStart, maxSeatCol));
			colEnd = Math.max(colStart, Math.min(colEnd, maxSeatCol));

			const cell = this.seatSize;
			const gap = this.seatRowGap;
			const screenH = this.screenHeadHeight;
			const gridWidth = this.seatCol * cell;
			const contentWidth = Math.max(this.boxWidth, gridWidth + 24);
			const gridLeft = (contentWidth - gridWidth) / 2;
			// 框顶预留文案带，避免「最佳观影区」压到上一排座位
			const tipBand = 16;
			const top = screenH + rowStart * (cell + gap) - tipBand;
			const height = Math.max(cell, (rowEnd - rowStart + 1) * (cell + gap) - gap + 4) + tipBand;
			const left = gridLeft + colStart * cell - 2;
			const width = Math.max(cell, (colEnd - colStart + 1) * cell + 4);

			this.bestZoneBoxStyle = {
				top: `${top}px`,
				left: `${left}px`,
				width: `${width}px`,
				height: `${height}px`
			};
		},
		resetSeat() {
			this.SelectNum = 0;
			this.totalPrice = 0;
			this.optArr = [];
			for (let i = 0; i < this.seatRow; i++) {
				for (let j = 0; j < this.seatCol; j++) {
					if (this.seatArray[i][j].type === 1) this.seatArray[i][j].type = 0;
				}
			}
		},
		buySeat() {
			const that = this;
			if (that.isSubOrder || that.SelectNum === 0) return;
			const seatIds = that.optArr.map(item => item.sid).filter(Boolean);
			if (!seatIds.length || seatIds.length !== that.SelectNum) {
				uni.showToast({ icon: 'none', title: '座位选择异常，请重新选座' });
				return;
			}
			if (isSessionStarted(that.sessionRawTime)) {
				uni.showToast({ icon: 'none', title: '电影已开场，无法再购票' });
				return;
			}
			if (!that.listParams.scheduleId || !that.listParams.schedulekey) {
				uni.showToast({ icon: 'none', title: '场次信息缺失，请返回重选' });
				return;
			}
			that.isSubOrder = true;
			that.loadModal = true;
			(that as any).$api('cinema.lockSeats', {
				openId: uni.getStorageSync('openid'),
				seatIdList: seatIds,
				scheduleId: this.listParams.scheduleId,
				storeId: (this as any).storeInfo.id,
				scheduleKey: this.listParams.schedulekey,
				openIdNotNull: 0
			}).then((res: any) => {
				if (res.flag) {
					that.getUserBalance();
					that.loadModal = false;
					const result = { ...res.data };
					if (result.filmPhoto == null) delete result.filmPhoto;
					result.schedule = JSON.stringify(result.schedule);
					result.seats = JSON.stringify(result.seats);
					result.locationHall = JSON.stringify(result.locationHall);
					that.jump('/pages/order/reserve', result);
				} else {
					uni.showToast({ icon: 'none', title: res.msg || '锁座失败' });
					that.loadModal = false;
					that.isSubOrder = false;
				}
			}).catch(() => {
				uni.showToast({ icon: 'none', title: '锁座失败，请重试' });
				that.loadModal = false;
				that.isSubOrder = false;
			});
		},
		jump(path: string, params: Record<string, unknown>) {
			(this as any).$Router.push({ path, query: params });
		},
		handleChooseSeat(row: number, col: number, seat: SeatCell) {
			if (!seat || !this.seatArray[row] || !this.seatArray[row][col]) return;
			const cell = this.seatArray[row][col];
			const seatValue = cell.type;
			if (seatValue === 2 || seatValue === -1 || seatValue === 3) return;
			if (seatValue === 1) {
				cell.type = 0;
				this.SelectNum--;
				this.totalPrice = this.totalPrice - 1 * Number(seat.money);
				this.getOptArr(cell, 0);
			} else if (seatValue === 0) {
				if (this.optArr.length <= 3) {
					cell.type = 1;
					this.SelectNum++;
					this.totalPrice = this.totalPrice + 1 * Number(seat.money);
					this.getOptArr(cell, 1);
				} else {
					uni.showToast({ icon: 'none', title: '一次只可选择4个座位' });
				}
			}
		},
		removeSelectedSeat(item: SeatCell) {
			for (let row = 0; row < this.seatArray.length; row++) {
				const col = this.seatArray[row].findIndex(seat => seat.sid === item.sid);
				if (col >= 0) {
					this.handleChooseSeat(row, col, this.seatArray[row][col]);
					return;
				}
			}
		},
		getOptArr(item: SeatCell, type: number) {
			if (type === 1) {
				this.optArr.push(item);
				return;
			}
			this.optArr = this.optArr.filter(v => v.sid !== item.sid);
		},
		smartChoose(num: number) {
			this.resetSeat();
			const rowStart = parseInt(String((this.seatRow - 1) / 2), 10) + 1;
			const backResult = this.searchSeatByDirection(rowStart, this.seatRow - 1, num);
			if (backResult.length > 0) {
				this.chooseSeat(backResult);
				this.SelectNum += num;
				return;
			}
			const forwardResult = this.searchSeatByDirection(rowStart - 1, 0, num);
			if (forwardResult.length > 0) {
				this.chooseSeat(forwardResult);
				this.SelectNum += num;
				return;
			}
			uni.showToast({ icon: 'none', title: '暂无连续的推荐座位' });
		},
		searchSeatByDirection(fromRow: number, toRow: number, num: number) {
			const currentDirectionSearchResult: Array<{ result: number[][]; offset: number }> = [];
			const largeRow = fromRow > toRow ? fromRow : toRow;
			const smallRow = fromRow > toRow ? toRow : fromRow;
			for (let i = smallRow; i <= largeRow; i++) {
				let tempRowResult: number[][] = [];
				let minDistanceToMidLine = Infinity;
				for (let j = 0; j <= this.seatCol - num; j++) {
					if (this.checkRowSeatContinusAndEmpty(i, j, j + num - 1)) {
						const resultMidPos = parseInt(String(j + num / 2), 10);
						const distance = Math.abs(parseInt(String(this.seatCol / 2), 10) - resultMidPos);
						if (distance < minDistanceToMidLine) {
							minDistanceToMidLine = distance;
							tempRowResult = this.generateRowResult(i, j, j + num - 1);
						}
					}
				}
				currentDirectionSearchResult.push({ result: tempRowResult, offset: minDistanceToMidLine });
			}
			const isBackDir = fromRow < toRow;
			let finalResult: number[][] = [];
			let minDistanceToMid = Infinity;
			const list = isBackDir ? currentDirectionSearchResult : currentDirectionSearchResult.slice().reverse();
			list.forEach(item => {
				if (item.offset < minDistanceToMid) {
					finalResult = item.result;
					minDistanceToMid = item.offset;
				}
			});
			return finalResult;
		},
		checkRowSeatContinusAndEmpty(rowNum: number, startPos: number, endPos: number) {
			for (let i = startPos; i <= endPos; i++) {
				if (!this.seatArray[rowNum] || this.seatArray[rowNum][i].type !== 0) return false;
			}
			return true;
		},
		generateRowResult(row: number, startPos: number, endPos: number) {
			const result: number[][] = [];
			for (let i = startPos; i <= endPos; i++) result.push([row, i]);
			return result;
		},
		chooseSeat(result: number[][]) {
			for (let i = 0; i < result.length; i++) {
				const cell = this.seatArray[result[i][0]][result[i][1]];
				cell.type = 1;
				this.totalPrice = this.totalPrice + 1 * Number(cell.money);
				this.optArr.push(cell);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
/* 固定信息区，中间座位区自适应剩余高度。 */
.seat-page,
.seat-canvas {
	width: 100%;
	height: 100vh;
	overflow: hidden;
	background: #f6f7f8;
}

.seat-summary {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 20;
	height: 120rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 14rpx 28rpx;
	box-sizing: border-box;
	background: rgba(255, 255, 255, 0.98);
	border-bottom: 0;
	box-shadow: 0 4rpx 18rpx rgba(24, 28, 36, 0.04);
}

.summary-title-row,
.summary-meta {
	display: flex;
	align-items: center;
	min-width: 0;
}

.summary-film {
	min-width: 0;
	max-width: 470rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 31rpx;
	font-weight: 700;
	line-height: 44rpx;
	color: #1d2129;
}

.summary-hall {
	flex: 0 1 auto;
	max-width: 240rpx;
	margin-left: 12rpx;
	padding: 3rpx 12rpx;
	overflow: hidden;
	border-radius: 8rpx;
	background: #f1f2f4;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 21rpx;
	line-height: 30rpx;
	color: #69707d;
}

.summary-meta {
	margin-top: 4rpx;
	font-size: 23rpx;
	line-height: 32rpx;
	color: #7a808c;
}

.summary-version {
	flex: 0 0 auto;
	margin-left: 16rpx;
	color: #4d5562;
}

.summary-session {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.summary-session.is-non-today {
	color: #c45c12;
	font-weight: 700;
}

.session-day-alert {
	position: fixed;
	top: 192rpx;
	left: 24rpx;
	right: 24rpx;
	z-index: 20;
	display: flex;
	align-items: flex-start;
	gap: 14rpx;
	padding: 16rpx 20rpx;
	box-sizing: border-box;
	border-radius: 16rpx;
	background: #fff6e8;
	border: 1rpx solid #f0b35a;
	box-shadow: 0 8rpx 20rpx rgba(196, 92, 18, 0.12);
}

.session-day-alert.is-expired {
	background: #fff1f0;
	border-color: #f0a0a0;
	box-shadow: 0 8rpx 20rpx rgba(216, 74, 74, 0.12);
}

.session-day-alert__tag {
	flex: 0 0 auto;
	padding: 4rpx 12rpx;
	border-radius: 999rpx;
	background: #c45c12;
	color: #fff;
	font-size: 20rpx;
	line-height: 28rpx;
	font-weight: 700;
}

.session-day-alert.is-expired .session-day-alert__tag {
	background: var(--tt-danger);
}

.session-day-alert__text {
	min-width: 0;
	flex: 1;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #8a4b12;
	font-weight: 600;
}

.session-day-alert.is-expired .session-day-alert__text {
	color: #a33b3b;
}

.seat-legend {
	position: fixed;
	top: 120rpx;
	left: 0;
	right: 0;
	z-index: 19;
	height: 72rpx;
	min-height: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 36rpx;
	margin: 0;
	box-sizing: border-box;
	background: rgba(255, 255, 255, 0.94);
	border-bottom: 1rpx solid #eceef1;
}

.legend-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #858b96;
}

.legend-seat-image {
	width: 30rpx;
	height: 30rpx;
	display: block;
}

.seat-map-slot {
	position: fixed;
	left: 0;
	right: 0;
	z-index: 10;
	width: 100%;
	background: #f1f2f4;
}

.seat-bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: var(--window-bottom, 0);
	z-index: 30;
	width: 100%;
	overflow: hidden;
	border-radius: 28rpx 28rpx 0 0;
	background: #fff;
	box-shadow: 0 -10rpx 32rpx rgba(31, 35, 43, 0.1);
}

.seat-actions {
	padding: 22rpx 28rpx calc(22rpx + constant(safe-area-inset-bottom));
	padding: 22rpx 28rpx calc(22rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
}

.recommend-row,
.selected-row {
	height: 64rpx;
	display: flex;
	align-items: center;
	margin-bottom: 18rpx;
	overflow: hidden;
}

.action-label {
	flex: 0 0 auto;
	margin-right: 16rpx;
	font-size: 24rpx;
	font-weight: 600;
	color: #4e5561;
}

.recommend-chip {
	width: 88rpx;
	height: 52rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 12rpx;
	box-sizing: border-box;
	border: 1rpx solid #dfe2e6;
	border-radius: 27rpx;
	background: #fff;
	font-size: 23rpx;
	color: #555c68;
}

.selected-scroll {
	height: 54rpx;
	min-width: 0;
	flex: 1;
	width: 0;
	overflow: hidden;
}

.selected-chip-track {
	display: inline-flex;
	flex-direction: row;
	flex-wrap: nowrap;
	align-items: center;
	height: 54rpx;
	white-space: nowrap;
}

.selected-chip {
	height: 54rpx;
	display: inline-flex;
	flex: 0 0 auto;
	align-items: center;
	margin-right: 12rpx;
	padding: 0 14rpx;
	box-sizing: border-box;
	border: 1rpx solid rgba(143, 152, 30, 0.28);
	border-radius: 10rpx;
	background: var(--tt-primary-soft, #f6f7df);
	font-size: 22rpx;
	color: var(--tt-primary-strong, #77800f);
	white-space: nowrap;
}

.chip-close {
	margin-left: 9rpx;
	font-size: 26rpx;
	color: #979d61;
}

.submit-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.price-summary {
	width: 174rpx;
	flex: 0 0 174rpx;
	display: flex;
	flex-direction: column;
}

.total-price {
	font-size: 36rpx;
	font-weight: 750;
	line-height: 42rpx;
	color: #e54d59;
}

.price-tip {
	font-size: 19rpx;
	line-height: 26rpx;
	color: #9aa0aa;
}

.seat-submit {
	height: 84rpx;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0;
	padding: 0 28rpx;
	border: 0;
	border-radius: 44rpx;
	background: #d9dce1;
	box-shadow: none;
	font-size: 29rpx;
	font-weight: 700;
	line-height: 84rpx;
	color: #fff;
}

.seat-submit.active {
	background: linear-gradient(135deg, var(--tt-primary, #a3ad34), var(--tt-primary-strong, #7d8615));
	box-shadow: 0 9rpx 20rpx rgba(126, 136, 18, 0.22);
}

.seat-submit::after {
	display: none;
}

.seat-submit[disabled] {
	background: #d9dce1;
	color: #fff;
	opacity: 1;
}
</style>

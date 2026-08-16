<template>
	<view class="seat-page">
		<view class="seat-canvas">
			<view class="seat-summary">
				<view class="summary-title-row">
					<text class="summary-film">{{ head.filmName || '影片信息' }}</text>
					<text v-if="head.hallName" class="summary-hall">{{ head.hallName }}</text>
				</view>
				<view class="summary-meta">
					<text class="summary-session">{{ sessionDisplayText }}</text>
					<text v-if="head.language || head.dimensional" class="summary-version">{{ head.language }} {{ head.dimensional }}</text>
				</view>
			</view>

			<view class="seat-legend">
				<view class="legend-item"><image class="legend-seat-image" src="/static/unselected.png" mode="aspectFit"></image><text>可选</text></view>
				<view class="legend-item"><image class="legend-seat-image" src="/static/selected.png" mode="aspectFit"></image><text>已选</text></view>
				<view class="legend-item"><image class="legend-seat-image is-sold" src="/static/bought.png" mode="aspectFit"></image><text>已售</text></view>
				<view class="legend-item"><image class="legend-seat-image is-maintenance" src="/static/lockwei.png" mode="aspectFit"></image><text>维修</text></view>
			</view>

			<movable-area class="seat-map">
				<movable-view
					:style="{ width: boxWidth + 'px', height: seatContentHeight + 'px' }"
					:inertia="true"
					:scale="true"
					:scale-min="scaleMin"
					:scale-max="2"
					direction="all"
					@change="onMove"
					@scale="onScale"
				>
					<view class="screen-wrap">
						<view class="screen-arc"></view>
						<text class="screen-label">银幕中央</text>
					</view>
					<view class="seat-center-line" :style="{ height: Math.max(0, seatRow * (seatSize + 10)) + 'px' }"></view>
					<view v-if="seatArray.length" class="seat-rows">
						<view v-for="(item, index) in seatArray" :key="index" class="seat-row" :style="{ width: boxWidth + 'px', height: seatSize + 'px' }">
							<text class="row-number">{{ mArr[index] }}</text>
							<view
								v-for="(seat, col) in item"
								:key="col"
								class="seat-cell"
								:style="{ width: seatSize + 'px', height: seatSize + 'px' }"
								@tap="handleChooseSeat(index, col, seat)"
							>
								<image v-if="seat && seat.type === 0" class="seat-image" src="/static/unselected.png" mode="aspectFit"></image>
								<image v-else-if="seat && seat.type === 1" class="seat-image" src="/static/selected.png" mode="aspectFit"></image>
								<image v-else-if="seat && seat.type === 2" class="seat-image is-sold" src="/static/bought.png" mode="aspectFit"></image>
								<image v-else-if="seat && seat.type === 3" class="seat-image is-maintenance" src="/static/lockwei.png" mode="aspectFit"></image>
							</view>
						</view>
					</view>
					<view v-else class="seat-empty">暂无可选座位</view>
				</movable-view>
			</movable-area>

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
						<scroll-view class="selected-scroll" scroll-x :show-scrollbar="false">
							<view class="selected-chip" v-for="(optItem, optindex) in optArr" :key="optItem.sid || optindex" @tap="removeSelectedSeat(optItem)">
								<text>{{ optItem.rowNum }}排{{ optItem.columnNum }}座</text>
								<text class="chip-close">×</text>
							</view>
						</scroll-view>
					</view>
					<view class="submit-row">
						<view v-if="SelectNum > 0" class="price-summary">
							<text class="total-price">¥{{ totalPrice }}</text>
							<text class="price-tip">含服务费</text>
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
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
		<view class="cu-load load-modal" v-if="loadModal">
			<view class="cuIcon-emojifill text-orange"></view>
			<view class="gray-text">加载中...</view>
		</view>
	</view>
</template>
<script>
/*
 *特别声明：
 * 该页面的逻辑及思路来自作者[houzisbw](https://github.com/houzisbw)的vue选座项目github地址[点击](https://github.com/houzisbw/MeiTuanCinemaSmartChoose)。
 * 本人只针对uni-app做了样式及逻辑适配。
 * 感谢原作者[houzisbw](https://github.com/houzisbw), 如有侵权, 请举报
 *
 */
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	data() {
		return {
			loadModal: false,
			isSubOrder: false,
			filmId: '',
			//缩略图是否显示
			topthumbnail: 0, // 单位rem
			leftthumbnail: 0, // 单位rem
			thumbnailShow: true,
			scaleMin: 1, //h5端为解决1无法缩小问题，设为0.95
			boxWidth: 400, //屏幕宽度px
			space: ' ', //空格
			seatArray: [], //影院座位的二维数组,-1为非座位，0为未购座位，1为已选座位(绿色),2为已购座位(红色),一维行，二维列
			seatRow: 0, //影院座位行数
			seatCol: 0, //影院座位列数
			seatSize: 0, //座位尺寸
			SelectNum: 0, //选择座位数
			listParams: {
				scheduleId: null,
				schedulekey: null
			},
			head: {
				filmName: null,
				language: null,
				dimensional: null,
				hallType: null,
				showDatetime: null,
				scheduleId: null,
				schedulekey: null,
				sessionsStarttime: null
			},
			totalPrice: 0, //总价
			moveX: 0, //水平移动偏移量
			scale: 1, //放大倍数
			minRow: 0, //从第几行开始排座位
			minCol: 0, //从第几列开始排座位
			showTis: true, //显示选座提示
			seatList: [], //接口获取的原始位置
			mArr: [], //排数提示
			optArr: [], //选中的座位数组。
			isWXAPP: false,
			isEsc: true
		};
	},
	computed: {
		...mapState({
			storeInfo: state => state.user.storeInfo,
		}),
		aPrice() {
			return this.SelectNum * 36;
		},
		rpxNum() {
			return this.boxWidth / 750;
		},
		pxNum() {
			return 750 / this.boxWidth;
		},
		seatContentHeight() {
			return Math.max(360, 86 + this.seatRow * (this.seatSize + 10) + 50);
		},
		sessionDisplayText() {
			const raw = this.head.showDatetime || this.head.sessionsStarttime || '';
			if (!raw) return '场次时间加载中';
			const match = String(raw).match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2}))?/);
			if (!match) {
				const timeMatch = String(raw).match(/(\d{1,2}):(\d{2})/);
				return timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}场` : String(raw);
			}
			const year = Number(match[1]);
			const month = Number(match[2]);
			const day = Number(match[3]);
			const hour = String(match[4] || '0').padStart(2, '0');
			const minute = String(match[5] || '00').padStart(2, '0');
			const target = new Date(year, month - 1, day);
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const dayOffset = Math.round((target.getTime() - today.getTime()) / 86400000);
			const weekText = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][target.getDay()];
			const dateText = `${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日`;
			if (dayOffset === 0) return `今天 · ${hour}:${minute}场`;
			if (dayOffset === 1) return `明天 ${dateText} ${weekText} · ${hour}:${minute}场`;
			if (dayOffset === 2) return `后天 ${dateText} ${weekText} · ${hour}:${minute}场`;
			return `${dateText} ${weekText} · ${hour}:${minute}场`;
		}
	},
	onShow() {
		let that = this;

		uni.showLoading({ title: '加载中' });
		uni.$once('escLoack', function(data) {
			that.isEsc = false;
			that.isSubOrder = false;
			that.$api('cinema.escSeats', data).then(res => {
				if (res.flag) {
					that.initData();
				}
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
		let that = this;
		let params = {
			filmId: that.filmId
		};
		uni.$emit('escUpload', params);
	},
	onLoad(options) {
		this.isSubOrder = false;
		const routeQuery = this.$Route && this.$Route.query ? this.$Route.query : {};
		const query = this.decodeRouteQuery({ ...routeQuery, ...(options || {}) });
		this.head = { ...this.head, ...query };
		this.filmId = query.filmId || '';
		this.listParams.scheduleId = query.scheduleId;
		this.listParams.hallId = query.hallId;
		this.listParams.schedulekey = query.schedulekey;
		this.listParams.scheduleKey = query.schedulekey;
		this.listParams.sectionId = query.sectionId;
		//获取宽度
		uni.getSystemInfo({
			success: e => {
				this.boxWidth = e.windowWidth || e.screenWidth || 375;
				if (this.seatCol > 0) {
					const naturalSize = parseInt(this.boxWidth / (this.seatCol + 1), 10);
					this.seatSize = Math.max(20, Math.min(34, naturalSize));
				}
				//#ifdef H5
				this.scaleMin = 0.95;
				//#endif
			}
		});
		/* this.initData(); */
	},
	methods: {
		...mapActions(['getUserBalance']),
		decodeRouteValue(value) {
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
		decodeRouteQuery(query) {
			return Object.keys(query || {}).reduce((result, key) => {
				result[key] = this.decodeRouteValue(query[key]);
				return result;
			}, {});
		},
		// 根据影厅的大小缩放比例(需要把影厅全部显示出来)
		seatScale: function() {
			let seatScaleX = 1;
			let seatScaleY = 1;
			seatScaleX = this.seatAreaWidthRem / this.seatBoxWidth;
			seatScaleY = this.seatAreaHeightRem / this.seatBoxHeight;
			return seatScaleX < seatScaleY ? seatScaleX : seatScaleY;
		},
		thumbnailBackgroud: function(seatItem) {
			if (seatItem.type === 1) {
				return 'green';
			} else if (seatItem.type === 2) {
				return 'red';
			} else if (seatItem.type === 0) {
				return 'white';
			}
		},
		initData: function() {
			let that = this;
			//假数据说明：sid座位编号，rowNum-行号，columnNum-纵号，y-Y坐标，x-X坐标，status-状态
			let row = 0;
			let col = 0;
			/* that.$api('cinema.SchedulesSoldSeats', this.listParams).then(reso => {
				if (reso.flag) { */
			that.$api('cinema.seatsLists', this.listParams).then(res => {
				if (res.flag) {
					that.SelectNum = 0;
					that.totalPrice = 0;
					that.optArr = [];
					let arr = res.data && Array.isArray(res.data.scheduleSeats) ? res.data.scheduleSeats : [];
					if (!arr.length) {
						that.seatList = [];
						that.seatArray = [];
						that.seatRow = 0;
						that.seatCol = 0;
						uni.hideLoading();
						return;
					}
					let minCol = parseInt(arr[0].x);
					let minRow = parseInt(arr[0].y);
					for (let i of arr) {
						minRow = parseInt(i.y) < minRow ? parseInt(i.y) : minRow;
						minCol = parseInt(i.x) < minCol ? parseInt(i.x) : minCol;
						row = parseInt(i.y) > row ? parseInt(i.y) : row;
						col = parseInt(i.x) > col ? parseInt(i.x) : col;
					}
					that.isEsc = true;
					that.seatList = arr;
					that.seatRow = row - minRow + 1;
					that.seatCol = col - minCol + 3;
					that.minRow = minRow;
					that.minCol = minCol - 1;
					that.initSeatArray();
					uni.hideLoading();
					/* if (that.head.dimensional == '3D' || that.head.dimensional == '4D') {
						that.$tools.toast('请自备3D眼镜或影院前台购买','none',{duration: 2500});
					} */
					//判断影厅和影片类型
					if ((res.data.tipSwitch == '0' && res.data.dimensional=='3D') || (res.data.tipSwitch4d == '0' && res.data.dimensional=='4D')) {
						that.$tools.toast(res.data.tipMessage,'none',{duration: 2500});
					}
				} else {
					uni.hideLoading();
					uni.showToast({
						icon: 'none',
						title: res.msg
					});
				}
			}).catch(() => {
				uni.hideLoading();
				that.seatArray = [];
			});
			/* } else {
					uni.showToast({
						icon: 'none',
						title: reso.msg
					});
				} 
			});*/
		},
		//初始座位数组
		initSeatArray: function() {
			let seatArray = Array(this.seatRow)
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
			const naturalSize = parseInt((this.boxWidth || 375) / (this.seatCol + 1), 10);
			this.seatSize = Math.max(20, Math.min(34, naturalSize));
			this.initNonSeatPlace();
		},
		//初始化是座位的地方
		initNonSeatPlace: function() {
			let seat = this.seatList.slice();
			let arr = this.seatArray.slice();
			for (let num in seat) {
				let status = 3; //-1为非座位，0为未购座位，1为已选座位(绿色),2为已购座位(红色)
				if (seat[num].status === '') {
					status = 0;
				} else if (seat[num].status === '-1') {
					status = -1;
				} else if (seat[num].status === 'locked' || seat[num].status === 'selled') {
					status = 2;
				}
				arr[parseInt(seat[num].y) - this.minRow][parseInt(seat[num].x) - this.minCol] = {
					type: status,
					sid: seat[num].seatId,
					money: seat[num].standardprice,
					rowNum: seat[num].rowId,
					columnNum: seat[num].columnId
				};
			}
			this.seatArray = arr.slice();
			let mArr = [];
			for (let i in arr) {
				let m = '';
				for (let n of arr[i]) {
					if (n.sid) {
						m = n.rowNum;
					}
				}
				if (m) {
					mArr.push(m);
				} else {
					mArr.push('');
				}
			}
			this.mArr = mArr;
		},
		//放大缩小事件
		onScale: function(e) {
			this.showTis = false;
			// this.moveX=-e.detail.x
			let w = this.boxWidth * 0.5;
			let s = 1 - e.detail.scale;
			this.moveX = w * s;
			this.scale = e.detail.scale;
			if (s > 0 || s === 0) {
				this.showTis = true;
			}
		},
		// scale的倒数
		scalereciprocal: function() {
			return 1 / this.scale;
		},
		//移动事件
		onMove: function(e) {
			this.thumbnailShow = true;
			this.showTis = false;
			this.moveX = e.detail.x;
		},
		//重置座位
		resetSeat: function() {
			this.SelectNum = 0;
			this.totalPrice = 0;
			this.optArr = [];
			//将所有已选座位的值变为0
			let oldArray = this.seatArray.slice();
			for (let i = 0; i < this.seatRow; i++) {
				for (let j = 0; j < this.seatCol; j++) {
					if (oldArray[i][j].type === 1) {
						oldArray[i][j].type = 0;
					}
				}
			}
			this.seatArray = oldArray;
		},
		//选定且购买座位
		buySeat: function() {
			let that = this;

			if (this.SelectNum === 0) {
				return;
			}
			that.isSubOrder = true;
			let oldArray = [];
			for (let i = 0; i < this.seatRow; i++) {
				for (let j = 0; j < this.seatCol; j++) {
					if (this.seatArray[i][j].type === 1) {
						oldArray.push(this.seatArray[i][j].sid);
					}
				}
			}
			that.$api('cinema.lockSeats', {
				openId: uni.getStorageSync('openid'),
				seatIdList: oldArray,
				scheduleId: this.listParams.scheduleId,
				storeId: this.storeInfo.id,
				scheduleKey: this.listParams.schedulekey,
				openIdNotNull: 0
			}).then(res => {
				that.loadModal = true;
				if (res.flag) {
					that.getUserBalance();
					that.loadModal = false;
					let result = { ...res.data };
					if (result.filmPhoto == null) {
						delete result.filmPhoto;
					}
					result.schedule = JSON.stringify(result.schedule);
					result.seats = JSON.stringify(result.seats);
					result.locationHall = JSON.stringify(result.locationHall);
					that.jump('/pages/order/reserve', result);
				} else {
					uni.showToast({
						icon: 'none',
						title: res.msg
					});
					that.loadModal = false;
					that.isSubOrder = false;
				}
			});
		},
		jump: function(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		//处理座位选择逻辑
		handleChooseSeat: function(row, col, seat) {
			if (!seat || !this.seatArray[row] || !this.seatArray[row][col]) return;
			let seatValue = this.seatArray[row][col].type;
			let newArray = this.seatArray;
			//如果是已购座位，直接返回
			if (seatValue === 2 || seatValue === -1) return;
			//如果是已选座位点击后变未选
			if (seatValue === 1) {
				newArray[row][col].type = 0;
				this.SelectNum--;
				this.totalPrice = this.totalPrice - 1 * Number(seat.money);
				this.getOptArr(newArray[row][col], 0);
			} else if (seatValue === 0) {
				if (this.optArr.length <= 3) {
					newArray[row][col].type = 1;
					this.SelectNum++;
					this.totalPrice = this.totalPrice + 1 * Number(seat.money);
					this.getOptArr(newArray[row][col], 1);
				} else {
					uni.showToast({
						icon: 'none',
						title: '一次只可选择4个座位'
					});
				}
			}
			//必须整体更新二维数组，Vue无法检测到数组某一项更新,必须slice复制一个数组才行
			this.seatArray = newArray.slice();
		},
		removeSelectedSeat(item) {
			for (let row = 0; row < this.seatArray.length; row++) {
				const col = this.seatArray[row].findIndex(seat => seat.sid === item.sid);
				if (col >= 0) {
					this.handleChooseSeat(row, col, this.seatArray[row][col]);
					return;
				}
			}
		},
		//处理已选座位数组
		getOptArr: function(item, type) {
			let optArr = this.optArr;
			if (type === 1) {
				optArr.push(item);
			} else if (type === 0) {
				let arr = [];
				optArr.forEach(v => {
					if (v.sid !== item.sid) {
						arr.push(v);
					}
				});
				optArr = arr;
			}
			this.optArr = optArr.slice();
		},
		//推荐选座,参数是推荐座位数目，
		smartChoose: function(num) {
			// 先重置
			this.resetSeat();
			//找到影院座位水平垂直中间位置的后一排
			let rowStart = parseInt((this.seatRow - 1) / 2, 10) + 1;
			//先从中间排往后排搜索
			let backResult = this.searchSeatByDirection(rowStart, this.seatRow - 1, num);
			if (backResult.length > 0) {
				this.chooseSeat(backResult);
				this.SelectNum += num;
				return;
			}
			//再从中间排往前排搜索
			let forwardResult = this.searchSeatByDirection(rowStart - 1, 0, num);
			if (forwardResult.length > 0) {
				this.chooseSeat(forwardResult);
				this.SelectNum += num;
				return;
			}
			//提示用户无合法位置可选
			uni.showToast({ icon: 'none', title: '暂无连续的推荐座位' });
		},

		//搜索函数,参数:fromRow起始行，toRow终止行,num推荐座位数
		searchSeatByDirection: function(fromRow, toRow, num) {
			/*
			 * 推荐座位规则
			 * (1)初始状态从座位行数的一半处的后一排的中间开始向左右分别搜索，取离中间最近的，如果满足条件，
			 *    记录下该结果离座位中轴线的距离，后排搜索完成后取距离最小的那个结果座位最终结果，优先向后排进行搜索，
			 *    后排都没有才往前排搜，前排逻辑同上
			 *
			 * (2)只考虑并排且连续的座位，不能不在一排或者一排中间有分隔
			 *
			 * */

			/*
			 * 保存当前方向搜索结果的数组,元素是对象,result是结果数组，offset代表与中轴线的偏移距离
			 * {
			 *   result:Array([x,y])
			 *   offset:Number
			 * }
			 *
			 */
			let currentDirectionSearchResult = [];

			let largeRow = fromRow > toRow ? fromRow : toRow,
				smallRow = fromRow > toRow ? toRow : fromRow;

			for (let i = smallRow; i <= largeRow; i++) {
				//每一排的搜索,找出该排里中轴线最近的一组座位
				let tempRowResult = [],
					minDistanceToMidLine = Infinity;
				for (let j = 0; j <= this.seatCol - num; j++) {
					//如果有合法位置
					if (this.checkRowSeatContinusAndEmpty(i, j, j + num - 1)) {
						//计算该组位置距离中轴线的距离:该组位置的中间位置到中轴线的距离
						let resultMidPos = parseInt(j + num / 2, 10);
						let distance = Math.abs(parseInt(this.seatCol / 2) - resultMidPos);
						//如果距离较短则更新
						if (distance < minDistanceToMidLine) {
							minDistanceToMidLine = distance;
							//该行的最终结果
							tempRowResult = this.generateRowResult(i, j, j + num - 1);
						}
					}
				}
				//保存该行的最终结果
				currentDirectionSearchResult.push({
					result: tempRowResult,
					offset: minDistanceToMidLine
				});
			}

			//处理后排的搜索结果:找到距离中轴线最短的一个
			//注意这里的逻辑需要区分前后排，对于后排是从前往后，前排则是从后往前找
			let isBackDir = fromRow < toRow;
			let finalReuslt = [],
				minDistanceToMid = Infinity;
			if (isBackDir) {
				//后排情况,从前往后
				currentDirectionSearchResult.forEach(item => {
					if (item.offset < minDistanceToMid) {
						finalReuslt = item.result;
						minDistanceToMid = item.offset;
					}
				});
			} else {
				//前排情况，从后往前找
				currentDirectionSearchResult.reverse().forEach(item => {
					if (item.offset < minDistanceToMid) {
						finalReuslt = item.result;
						minDistanceToMid = item.offset;
					}
				});
			}
			//直接返回结果
			return finalReuslt;
		},
		/*辅助函数，判断每一行座位从i列到j列是否全部空余且连续
		 *
		 */
		checkRowSeatContinusAndEmpty: function(rowNum, startPos, endPos) {
			let isValid = true;
			for (let i = startPos; i <= endPos; i++) {
				if (this.seatArray[rowNum][i].type !== 0) {
					isValid = false;
					break;
				}
			}
			return isValid;
		},
		//辅助函数：返回每一行的某个合理位置的座位数组
		generateRowResult: function(row, startPos, endPos) {
			let result = [];
			for (let i = startPos; i <= endPos; i++) {
				result.push([row, i]);
			}
			return result;
		},
		//辅助函数:智能推荐的选座操作
		chooseSeat: function(result) {
			let opt = this.optArr;
			let oldArray = this.seatArray.slice();
			for (let i = 0; i < result.length; i++) {
				//选定座位
				oldArray[result[i][0]][result[i][1]].type = 1;
				this.totalPrice = this.totalPrice + 1 * Number(oldArray[result[i][0]][result[i][1]].money);
				this.optArr.push(oldArray[result[i][0]][result[i][1]]);
			}
			this.seatArray = oldArray;
		}
	}
};
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

.seat-map {
	position: fixed;
	top: 192rpx;
	left: 0;
	right: 0;
	bottom: calc(272rpx + env(safe-area-inset-bottom));
	width: 100%;
	height: auto;
	background:
		radial-gradient(circle at 50% 0, rgba(255, 255, 255, 0.96) 0, rgba(248, 249, 250, 0.88) 42%, #f1f2f4 100%);
}

.screen-wrap {
	height: 86px;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-sizing: border-box;
	padding-top: 20rpx;
}

.screen-arc {
	width: 430rpx;
	height: 36rpx;
	border-top: 6rpx solid #d8dce2;
	border-radius: 50% 50% 0 0;
	background: linear-gradient(180deg, rgba(213, 217, 224, 0.34), rgba(247, 248, 250, 0));
	box-shadow: 0 -5rpx 14rpx rgba(92, 101, 116, 0.08);
}

.screen-label {
	margin-top: 8rpx;
	font-size: 20rpx;
	line-height: 30rpx;
	letter-spacing: 3rpx;
	color: #9aa0aa;
}

.seat-center-line {
	position: absolute;
	top: 86px;
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

.seat-row {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 10px;
}

.row-number {
	position: absolute;
	left: 13rpx;
	top: 50%;
	min-width: 30rpx;
	height: 30rpx;
	padding: 0 5rpx;
	box-sizing: border-box;
	border-radius: 15rpx;
	background: rgba(81, 87, 98, 0.64);
	text-align: center;
	font-size: 18rpx;
	line-height: 30rpx;
	color: #fff;
	transform: translateY(-50%);
}

.seat-cell {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.seat-image {
	width: 88%;
	height: 88%;
	display: block;
}

.seat-image.is-sold,
.legend-seat-image.is-sold {
	filter: grayscale(1);
	opacity: 0.44;
}

.seat-image.is-maintenance,
.legend-seat-image.is-maintenance {
	filter: grayscale(0.85);
	opacity: 0.66;
}

.seat-empty {
	padding-top: 90rpx;
	text-align: center;
	font-size: 25rpx;
	color: #9aa0aa;
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
	padding: 22rpx 28rpx calc(22rpx + env(safe-area-inset-bottom));
}

.recommend-row,
.selected-row {
	height: 64rpx;
	display: flex;
	align-items: center;
	margin-bottom: 18rpx;
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
	min-width: 0;
	flex: 1;
	width: 1px;
	white-space: nowrap;
}

.selected-chip {
	height: 54rpx;
	display: inline-flex;
	align-items: center;
	margin-right: 12rpx;
	padding: 0 14rpx;
	box-sizing: border-box;
	border: 1rpx solid rgba(143, 152, 30, 0.28);
	border-radius: 10rpx;
	background: var(--tt-primary-soft, #f6f7df);
	font-size: 22rpx;
	color: var(--tt-primary-strong, #77800f);
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

<template>
	<view class="page_box reserve-page">
		<view v-if="orderReady" class="reserve-content">
			<view v-if="sessionDayAlert.show" class="session-day-alert" :class="{ 'is-expired': sessionDayAlert.dayOffset < 0 }">
				<text class="session-day-alert__tag">{{ sessionDayAlert.title }}</text>
				<text class="session-day-alert__text">{{ sessionDayAlert.detail }}</text>
			</view>
			<!-- 电影票信息使用页面专用结构，避免通用商品卡片固定宽度造成溢出。 -->
			<view class="reserve-card reserve-movie-card">
				<view class="reserve-movie-main">
					<image class="reserve-poster" :src="moviePoster" mode="aspectFill"></image>
					<view class="reserve-movie-copy">
						<view class="reserve-title-row">
							<text class="reserve-movie-title">{{ filmTitle }}</text>
							<view class="reserve-countdown">
								<text class="cuIcon-time"></text>
								<text>{{ countdownText }}</text>
							</view>
						</view>
						<text class="reserve-session" :class="{ 'is-non-today': sessionDayAlert.show }">{{ showDateText }}</text>
						<view class="reserve-meta-row">
							<text v-if="versionText" class="reserve-version">{{ versionText }}</text>
							<text class="reserve-hall">{{ hallName }}</text>
						</view>
						<scroll-view v-if="seatList.length" class="reserve-seat-scroll" scroll-x :show-scrollbar="false">
							<view class="reserve-seat-chip" v-for="(item, index) in seatList" :key="item.seatId || index">
								{{ item.rowId }}排{{ item.columnId }}座
							</view>
						</scroll-view>
					</view>
				</view>
				<view class="reserve-ticket-summary">
					<view class="reserve-rules">
						<text class="reserve-rule">不可改签</text>
						<text class="reserve-rule">不可退票</text>
					</view>
					<text class="reserve-original">共{{ seatCount }}张 · 原价 ¥{{ originalTotal }}</text>
				</view>
			</view>

			<!-- 优惠券 -->
			<view class="reserve-card reserve-row" @tap="selCoupon">
				<text class="reserve-row-title">优惠券</text>
				<view class="reserve-row-value">
					<text :class="couponCount > 0 ? 'reserve-accent' : 'reserve-muted'">{{ couponCount > 0 ? pickerData.title : '暂无优惠券' }}</text>
					<text class="cuIcon-right reserve-arrow"></text>
				</view>
			</view>
			<radio-group @change="selPay" class="reserve-card reserve-pay-card">
				<label class="reserve-pay-row">
					<view class="reserve-pay-copy">
						<image class="reserve-pay-icon" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/wx_pay.png" mode="aspectFit"></image>
						<text class="reserve-pay-name">微信支付</text>
					</view>
					<radio value="wechat" :class="{ checked: payType === 'wechat' }" class="reserve-radio orange" :checked="payType === 'wechat'"></radio>
				</label>
				<label class="reserve-pay-row">
					<view class="reserve-pay-copy">
						<image class="reserve-pay-icon" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/wallet_pay.png" mode="aspectFit"></image>
						<view class="reserve-pay-text">
							<text class="reserve-pay-name">余额支付</text>
							<text class="reserve-balance">余额 ¥{{ balanceMoney }}{{ balanceInsufficient ? '，余额不足' : '' }}</text>
						</view>
					</view>
					<radio
						value="wallet"
						:class="{ checked: payType === 'wallet' }"
						:disabled="balanceInsufficient"
						class="reserve-radio orange"
						:checked="payType === 'wallet'"
					></radio>
				</label>
			</radio-group>
			<!-- 手机号码 -->
			<view class="reserve-card reserve-row">
				<text class="reserve-row-title">手机号码</text>
				<view class="reserve-row-value" v-if="phoneNumber">
					<text class="reserve-accent">{{ phoneNumber }}</text>
				</view>
				<view v-else class="reserve-row-value">
					<text class="reserve-muted">未绑定手机号</text>
					<button class="reserve-phone-button" open-type="getPhoneNumber" @getphonenumber="bindPhone">获取</button>
				</view>
			</view>
			<!-- 购票须知 -->
			<view class="reserve-card reserve-notice">
				<view class="reserve-notice-title">购票须知</view>
				<view class="reserve-notice-detail">
					<view>1.由于设备故障等不可抗力因素，存在少量场次取消的情况下，会进行退票退款</view>
					<view>2.由于影院系统不稳定等因素，存在出票失败的情况，会进行退款</view>
					<view>3.取票码可以在“票夹-电影票”中查看</view>
					<view>4.会员订票优惠仅在使用余额购票时体现，微信支付则按正常票价支付</view>
				</view>
			</view>
		</view>
		<view v-else class="order-placeholder">
			<text class="cuIcon-info order-placeholder-icon"></text>
			<text>订单信息不完整，请返回重新选座</text>
		</view>
		<view v-if="orderReady" class="reserve-footer">
			<view class="reserve-footer-total">
				<text class="reserve-footer-count">共{{ seatCount }}张</text>
				<view class="reserve-footer-price">
					<text>合计：</text>
					<text class="reserve-footer-amount">¥{{ payableTotal }}</text>
				</view>
			</view>
			<button class="reserve-submit" @tap="combuy" :disabled="isSubOrder">
				<text v-if="isSubOrder" class="cuIcon-loading2 cuIconfont-spin"></text>
				{{ isSubOrder ? '处理中...' : '立即购买' }}
			</button>
		</view>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
		<app-modal v-model="showExpressType" modalType="bottom-modal">
			<template #modalContent>
				<!-- 选择优惠券：勿用 page_box，否则 min-height:100% + space-between 会把确定挤出可视区 -->
				<view class="express-type coupon-sheet">
					<view class="express-type__head">
						<view class="express-type__head-nav" v-for="(nav, index) in expressType" :key="nav.id" @tap="changeExpressType(nav.value)">
							<text class="head-nav__title" :class="{ 'head-nav__title--active': expressTypeCur === nav.value }">{{ nav.title }}</text>
							<view :class="expressClass" v-show="expressTypeCur === nav.value"></view>
						</view>
					</view>
					<view class="express-type__content">
						<fz-group-card
							ref="groupCard"
							:checkArray="couponArray"
							:hallImbalance="hallImbalance"
							@changeCouponGroup="changeCouponGroup"
							:hallLength="hallLength"
							:pickerData="groupCouponsList"
							v-if="expressTypeCur == 'express'"
						></fz-group-card>
						<fz-coupon-card ref="couponCard" @changeCoupon="changeCoupon" :pickerData="pickerData.couponList" v-if="expressTypeCur == 'selfetch'"></fz-coupon-card>
					</view>
					<view class="express-type__bottom">
						<button class="cu-btn cancel-btn" @tap="hideExpressType">取消</button>
						<button class="cu-btn save-btn" @tap="saveExpressType">确定</button>
					</view>
				</view>
			</template>
		</app-modal>
	</view>
</template>

<script>
import fzGroupCard from './children/fz-group-card.vue';
import fzCouponCard from './children/fz-coupon-card.vue';
import AppPay from '@/common/app-pay';
import { mapActions, mapState } from 'vuex';
import { formatSessionDisplay, getNonTodaySessionAlert, isSessionStarted, parseShowDatetime } from '@/common/utils/session-date';
import { createLoginRefreshMixin } from '@/common/mixins/login-refresh.js';
import { ensureLoggedIn } from '@/common/utils/auth.js';
export default {
	components: {
		fzGroupCard,
		fzCouponCard
	},
	mixins: [createLoginRefreshMixin('onLoginRefresh')],
	data() {
		return {
			orderTimer: null,
			remainingSeconds: 600,
			showPicker: false,
			showGroup: false,
			isSubOrder: false,
			ifCdkeyPay: false,
			hallImbalance: 0,
			hallLength: 0,
			cashPay: true,
			pickerData: {
				title: '选择优惠券',
				couponList: []
			},
			isPast: true, //是否显示订单倒计时。
			isAndroid: uni.getStorageSync('isAndroid'),
			platform: uni.getStorageSync('platform'),
			payType: 'wechat',
			from: '',
			orderType: '',
			goodsTitle: '',
			grouponBuyType: 'alone',
			grouponId: 0,
			perGoodsList: {
				schedule: {},
				locationHall: {},
				seats: []
			}, //确认单订单
			orderPre: {},
			couponId: 0,
			ticketPaymoney: 0,
			preferentialAmount: 0,
			groupCouponsList: [],
			couponArray: [],
			cart: [],
			couponPrice: 0,
			getFocus: false, //获取焦点。
			checkTime: {},
			showExpressType: false, //优惠券弹窗
			expressTypeCur: 'express',
			inExpressType: [], //当前商品支持的配送方式。
			expressTypeMap: {
				express: '抵用券',
				selfetch: 'express'
			},
			expressType: [
				//快递方式
				{
					id: 'e1',
					title: '抵用券',
					value: 'express'
				},
				{
					id: 'e2',
					title: '优惠券',
					value: 'selfetch'
				}
			],
			current: 0,
			isProtocol: true, //自提协议。
			selfPhone: 0, //编辑手机号
			getFocus: false, //获取焦点。
			checkType: '自提',
			checkTime: {},
			checkTimeCur: 0, //默认选中时间。
			checkTimeId: 'c1', //锚点用
			checkDayCur: 0, //默认日期
			hasLocation: false, //是否已经授权过
			lat: 0,
			goodsPrice: 0,
			lng: 0
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo,
			storeInfo: state => state.user.storeInfo,
			balInfo: state => state.user.balInfo
		}),
		expressClass() {
			let cl = 'head-nav--active';
			const { expressType, expressTypeCur } = this;
			if (expressTypeCur === 0) {
				cl = 'head-nav__left--active';
			}
			if (expressTypeCur === expressType.length - 1) {
				cl = 'head-nav__right--active';
			}
			return cl;
		},
		orderReady() {
			return Object.keys(this.scheduleInfo).length > 0 && Array.isArray(this.seatList);
		},
		scheduleInfo() {
			const schedule = this.perGoodsList && this.perGoodsList.schedule;
			return schedule && typeof schedule === 'object' && !Array.isArray(schedule) ? schedule : {};
		},
		hallInfo() {
			const hall = this.perGoodsList && this.perGoodsList.locationHall;
			return hall && typeof hall === 'object' && !Array.isArray(hall) ? hall : {};
		},
		seatList() {
			return this.perGoodsList && Array.isArray(this.perGoodsList.seats) ? this.perGoodsList.seats : [];
		},
		seatCount() {
			return this.seatList.length;
		},
		filmTitle() {
			return this.scheduleInfo.filmName || (this.perGoodsList && this.perGoodsList.filmName) || '影片信息';
		},
		moviePoster() {
			const source = (this.perGoodsList && this.perGoodsList.filmPhoto) || this.scheduleInfo.filmPhoto || '';
			if (/^https?:\/\//.test(source) || String(source).startsWith('/')) return source;
			return source
				? `https://cfzx.gzfzdev.com/movie/uploadFiles/image/${source}`
				: 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/zanwu.jpg';
		},
		showDateText() {
			return formatSessionDisplay(this.scheduleInfo.showDatetime) || '场次时间待确认';
		},
		sessionDayAlert() {
			return getNonTodaySessionAlert(this.scheduleInfo.showDatetime);
		},
		versionText() {
			return [this.scheduleInfo.language, this.scheduleInfo.dimensional].filter(Boolean).join(' ');
		},
		hallName() {
			return this.hallInfo.hallName || this.scheduleInfo.hallName || '影厅信息待确认';
		},
		originalTotal() {
			return this.formatMoney(Number(this.scheduleInfo.standardprice || 0) * this.seatCount);
		},
		payableTotal() {
			return this.formatMoney(this.ticketPaymoney || 0);
		},
		couponCount() {
			const normalCount = this.pickerData && Array.isArray(this.pickerData.couponList) ? this.pickerData.couponList.length : 0;
			const groupCount = Array.isArray(this.groupCouponsList) ? this.groupCouponsList.length : 0;
			return normalCount + groupCount;
		},
		phoneNumber() {
			return this.userInfo && this.userInfo.phoneNumber ? this.userInfo.phoneNumber : '';
		},
		balanceMoney() {
			const value = this.balInfo && this.balInfo.Money != null ? Number(this.balInfo.Money) : 0;
			return Number.isFinite(value) ? value.toFixed(2) : '0.00';
		},
		walletPayableTotal() {
			return Math.max(0, Number(this.scheduleInfo.settleprice || 0) * this.seatCount - Number(this.preferentialAmount || 0));
		},
		balanceInsufficient() {
			return Number(this.balanceMoney) < this.walletPayableTotal;
		},
		countdownText() {
			const seconds = Math.max(0, Number(this.remainingSeconds) || 0);
			const minuteText = String(Math.floor(seconds / 60)).padStart(2, '0');
			const secondText = String(seconds % 60).padStart(2, '0');
			return `${minuteText}:${secondText}`;
		}
	},
	watch: {},
	onHide() {
		let that = this;
		if (!that.orderReady) return;
		that.clearOrderTimer();
		that.isSubOrder = true;
		let seats = [];
		that.perGoodsList.seats.forEach(item => {
			let obj = {};
			obj.seatId = item.seatId;
			seats.push(obj);
		});
		let params = {
			scheduleId: that.perGoodsList.scheduleId,
			lockOrderId: that.perGoodsList.lockOrderId,
			seats: seats
		};
		if (!that.$isPreviewApi) {
			uni.$emit('escLoack', params);
		}
	},
	onUnload(options) {
		let that = this;
		if (!that.orderReady) return;
		that.clearOrderTimer();
		that.isSubOrder = true;
		let seats = [];
		that.perGoodsList.seats.forEach(item => {
			let obj = {};
			obj.seatId = item.seatId;
			seats.push(obj);
		});
		let params = {
			scheduleId: that.perGoodsList.scheduleId,
			lockOrderId: that.perGoodsList.lockOrderId,
			seats: seats
		};
		uni.$emit('escLoack', params);
	},
	onBackPress(options) {
		if (options && options.from == 'backbutton') {
			uni.showModal({
				title: '提示',
				content: '还没付款，是否退出',
				success: res => {
					if (res.confirm) {
						this.escOrder();
						uni.showToast({
							title: '用户点击确定',
							duration: 1000
						});
					} else if (res.cancel) {
						uni.showToast({
							title: '用户点击取消',
							duration: 1000
						});
					}
					uni.navigateBack({
						delta: 1
					});
				}
			});
			return true; //阻止默认返回行为
		}
	},
	async onLoad(options) {
		this.options = options;
		const optionQuery = options || {};
		const routeQuery = this.$Route && this.$Route.query ? this.$Route.query : {};
		const routeHasOrder = Boolean(routeQuery.schedule || routeQuery.seats);
		const query = routeHasOrder ? { ...optionQuery, ...routeQuery } : { ...routeQuery, ...optionQuery };
		if (query.openid) {
			//检测到回传openid
			uni.setStorageSync('openid', query.openid);
		}
		if (Object.keys(query).length) {
			const schedule = this.parseRouteJSON(query.schedule, {});
			const locationHall = this.parseRouteJSON(query.locationHall, {});
			const seats = this.parseRouteJSON(query.seats, []);
			if (schedule.showDatetime) {
				try {
					schedule.showDatetime = decodeURIComponent(schedule.showDatetime);
				} catch (error) {
					schedule.showDatetime = String(schedule.showDatetime);
				}
			}
			this.perGoodsList = {
				...query,
				schedule,
				locationHall,
				seats: Array.isArray(seats) ? seats : []
			};
			this.hallLength = this.perGoodsList.seats.length;
			this.hallImbalance = Number(locationHall.hallImbalance || 0);
			this.ticketPaymoney = Math.max(0, Number(schedule.standardprice || 0) * this.perGoodsList.seats.length);
		}
		/* this.goodsList = JSON.parse(this.$Route.query.goodsList); 
		this.from = this.$Route.query.from;
		this.orderType = this.$Route.query.orderType;
		this.grouponBuyType = this.$Route.query.grouponBuyType;
		this.grouponId = this.$Route.query.grouponId;*/
		this.initDate();
		if (!this.orderReady) {
			this.$tools.toast('订单信息不完整，请重新选择座位');
			return;
		}
		this.getGoodsList();
		this.getGroupCoupons();
		this.getCoupons();
		this.startOrderTimer();
	},
	onShow() {
		/* this.$isPreviewApi = true */
		// 支付取消 / 接口失败返回后允许再次点击
		if (this.orderReady) this.isSubOrder = false;
		if (!ensureLoggedIn()) return;
		this.getUserBalance().catch(() => null);
	},
	methods: {
		...mapActions(['getUserDetails', 'getUserBalance']),
		onLoginRefresh() {
			if (!this.orderReady) return;
			return this.getUserBalance().catch(() => null);
		},
		formatMoney(value) {
			const amount = Number(value);
			if (!Number.isFinite(amount)) return '0.00';
			return amount % 1 === 0 ? String(amount) : amount.toFixed(2);
		},
		// 0.5.5：选座确认页拉取可加购套餐
		getGoodsList() {
			const me = this;
			if (!me.storeInfo || !me.storeInfo.v8PlaceId || !me.storeInfo.v8Url) return;
			me.$api('goods.lists', {
				custId: me.balInfo && me.balInfo.custId,
				placeId: me.storeInfo.v8PlaceId,
				V8Url: me.storeInfo.v8Url
			}).then(res => {
				if (res && res.flag) {
					me.cart = Array.isArray(res.data?.Data) ? res.data.Data : [];
				}
			}).catch(() => undefined);
		},
		radioChange(evt) {
			for (let i = 0; i < this.cart.length; i++) {
				if (String(this.cart[i].PackageId) === String(evt.detail.value)) {
					this.current = evt.detail.value;
					this.goodsTitle = `${this.cart[i].PackageName}(${this.cart[i].PackageAmount})元`;
					this.goodsPrice = this.cart[i].PackageAmount;
					break;
				}
			}
		},
		startOrderTimer() {
			this.clearOrderTimer();
			this.orderTimer = setInterval(() => {
				if (this.remainingSeconds <= 1) {
					this.remainingSeconds = 0;
					this.clearOrderTimer();
					this.isPast = false;
					this.escOrder();
					return;
				}
				this.remainingSeconds -= 1;
			}, 1000);
		},
		clearOrderTimer() {
			if (this.orderTimer) clearInterval(this.orderTimer);
			this.orderTimer = null;
		},
		parseRouteJSON(value, fallback) {
			if (value && typeof value === 'object') return value;
			if (typeof value !== 'string' || !value) return fallback;
			let candidate = value;
			for (let attempt = 0; attempt < 3; attempt++) {
				try {
					return JSON.parse(candidate);
				} catch (error) {
					try {
						const decoded = decodeURIComponent(candidate);
						if (decoded === candidate) break;
						candidate = decoded;
					} catch (decodeError) {
						break;
					}
				}
			}
			return fallback;
		},
		parseLocalDate(value) {
			return parseShowDatetime(value);
		},
		resetCouponCard(type = this.expressTypeCur) {
			this.$nextTick(() => {
				const ref = type === 'express' ? this.$refs.groupCard : this.$refs.couponCard;
				if (ref && typeof ref.resetCouponList === 'function') ref.resetCouponList();
			});
		},
		async changeExpressType(cur) {
			this.expressTypeCur = cur;
			this.getFocus = false;
			this.couponArray = [];
			this.couponId = 0;
			this.couponPrice = 0;
			this.resetCouponCard(cur);
			this.calculateBenefits();
		},
		// 显示弹窗
		async onSelExpressType(goods) {
			this.showExpressType = true;
		},
		// 关闭弹窗
		hideExpressType() {
			this.showExpressType = false;
		},
		// 保存方式
		saveExpressType() {
			this.showExpressType = false;
		},
		combuy() {
			let that = this;
			if (that.isSubOrder || !that.orderReady) return;
			if (!ensureLoggedIn()) return;
			if (!that.seatCount) {
				this.$tools.toast('座位信息缺失，请返回重新选座');
				return;
			}
			if (!parseShowDatetime(that.scheduleInfo.showDatetime)) {
				this.$tools.toast('场次时间格式异常，请重新选择场次');
				return;
			}
			if (isSessionStarted(that.scheduleInfo.showDatetime)) {
				uni.showToast({
					icon: 'none',
					title: '电影已开场，无法再购票'
				});
				return;
			}
			if (that.ticketPaymoney == 0 && this.couponArray.length > 0) {
				let ticketList = [];
				that.seatList.forEach(item => {
					let obj = {};
					obj.seatId = item.seatId;
					obj.ticketFee = item.ticketfee;
					obj.ticketPrice = item.lowestprice;
					ticketList.push(obj);
				});
				if (that.ticketPaymoney == 0) {
					that.ifCdkeyPay = true;
					if (that.phoneNumber) {
						that.isSubOrder = true;
						that.confirmOrder(ticketList);
					} else {
						uni.showToast({
							icon: 'none',
							title: '手机号码为必填项'
						});
					}
				} else {
					if (that.payType == 'wallet') {
						that.blanBuy(ticketList);
					} else {
						that.confirmPay(ticketList);
					}
				}
			} else {
				that.ifCdkeyPay = false;
				if (that.payType == 'wallet') {
					let ticketList = [];
					that.seatList.forEach((item, index) => {
						let obj = {};
						if (index + 1 > that.couponArray.length) {
							obj.seatId = item.seatId;
							obj.ticketFee = item.ticketfee;
							obj.ticketPrice = item.settleprice;
						} else {
							obj.seatId = item.seatId;
							obj.ticketFee = item.ticketfee;
							obj.ticketPrice = item.lowestprice;
						}
						ticketList.push(obj);
					});
					that.blanBuy(ticketList);
				} else {
					let ticketList = [];
					that.seatList.forEach((item, index) => {
						let obj = {};
						if (index + 1 > that.couponArray.length) {
							obj.seatId = item.seatId;
							obj.ticketFee = item.ticketfee;
							obj.ticketPrice = item.standardprice;
						} else {
							obj.seatId = item.seatId;
							obj.ticketFee = item.ticketfee;
							obj.ticketPrice = item.lowestprice;
						}
						ticketList.push(obj);
					});
					that.confirmPay(ticketList);
				}
			}
		},
		selPay(e) {
			let that = this;
			that.couponArray = [];
			that.couponId = 0;
			that.couponPrice = 0;
			that.resetCouponCard();
			if (e.detail.value == 'wallet') {
				let countPrce = Math.max(0, Number(that.scheduleInfo.settleprice || 0) * that.seatCount - that.preferentialAmount);
				if (Number(countPrce) <= Number(that.balanceMoney)) {
					that.payType = e.detail.value;
					that.ticketPaymoney = countPrce;
				} else {
					uni.showToast({
						icon: 'none',
						title: '余额不足以支付本次费用，请选择其他支付方式'
					});
				}
			} else {
				that.payType = e.detail.value;
				that.ticketPaymoney = Math.max(0, Number(that.scheduleInfo.standardprice || 0) * that.seatCount - that.preferentialAmount);
			}
			this.getCoupons();
			//切换支付方式重新计算优惠
			that.calculateBenefits(that.couponArray);
		},
		bindPhone(e) {
			let me = this;
			me.$api('user.getWxMiniPhoneNumber', {
				sessionKey: uni.getStorageSync('session_key'),
				openid: uni.getStorageSync('openid'),
				encryptedData: e.detail.encryptedData,
				iv: e.detail.iv
			}).then(res => {
				if (res.flag) {
					me.getUserDetails();
					/* uni.setStorageSync('phone', res.data);
					me.jump('/pages/user/edit-phone', { fromType: 'bind', phone: res.data }); */
				}
			});
		},
		// 发起支付
		confirmPay(confirmParam) {
			let that = this;
			if (that.isSubOrder) return;
			if (!(that.ticketPaymoney > 0)) {
				uni.showToast({
					icon: 'none',
					title: '金额不能为零'
				});
				return;
			}
			if (!that.phoneNumber) {
				uni.showToast({
					icon: 'none',
					title: '手机号码为必填项'
				});
				return;
			}
			that.isSubOrder = true;
			let params = {
				ticketId: that.perGoodsList.ticketId,
				ticketPaymoney: that.ticketPaymoney
			};
			try {
				new AppPay(that.payType, that.perGoodsList, null, params, 1, confirmParam, that.couponArray, that.couponId);
			} catch (error) {
				that.isSubOrder = false;
				uni.showToast({ icon: 'none', title: '发起支付失败，请重试' });
			}
		},
		jump(path, parmas) {
			this.$Router.replace({
				path: path,
				query: parmas
			});
		},
		initDate() {
			let week = {
				0: '周日',
				1: '周一',
				2: '周二',
				3: '周三',
				4: '周四',
				5: '周五',
				6: '周六'
			};
			let now = new Date().getTime();
			let today = this.$tools.timestamp(now / 1000);
			let tomorrow = this.$tools.timestamp((now + 86400000) / 1000);
			let aftertomorrow = this.$tools.timestamp((now + 172800000) / 1000);
			let week1 = week[new Date().getDay()];
			let week2 = week[new Date(now + 86400000).getDay()];
			let week3 = week[new Date(now + 172800000).getDay()];
			let obj = {
				day: [
					{
						title: '今天（' + week1 + '）',
						value: today
					},
					{
						title: '明天（' + week2 + '）',
						value: tomorrow
					},
					{
						title: '后天（' + week3 + '）',
						value: aftertomorrow
					}
				],
				time: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
			};
			this.checkTime = obj;
		},
		escOrder() {
			this.clearOrderTimer();
			let that = this;
			that.isSubOrder = true;
			let seats = [];
			that.perGoodsList.seats.forEach(item => {
				let obj = {};
				obj.seatId = item.seatId;
				seats.push(obj);
			});
			that.$api('cinema.escSeats', {
				scheduleId: that.perGoodsList.scheduleId,
				lockOrderId: that.perGoodsList.lockOrderId,
				seats: seats
			});
		},
		//确认订单
		confirmOrder(array) {
			let that = this;
			that.isSubOrder = true;
			uni.$off('escLoack');
			this.$api('cinema.confirmOrder', {
				lockOrderId: this.perGoodsList.lockOrderId,
				scheduleId: this.perGoodsList.scheduleId,
				scheduleKey: this.perGoodsList.scheduleKey,
				mobile: this.phoneNumber,
				ticketList: array,
				couponId: that.couponId,
				ifCdkeyPay: that.ifCdkeyPay,
				Ids: that.couponArray
			}).then(res => {
				if (res.flag) {
					that.$isPreviewApi = false;
					uni.hideLoading();
					that.jump('/pages/order/ticket', res.data);
				} else {
					that.isSubOrder = false;
					uni.hideLoading();
					uni.showModal({
						title: '提示',
						content: res.msg || '确认订单失败'
					});
				}
			}).catch(() => {
				that.isSubOrder = false;
				uni.hideLoading();
				uni.showToast({ icon: 'none', title: '确认订单失败，请重试' });
			});
		}, //余额购买
		blanBuy(confirmParam) {
			let that = this;
			uni.showLoading({ title: '出票中~~为了避免购票失败，请勿退出！' });
			if (that.phoneNumber) {
				that.isSubOrder = true;
				let params = {
					ticketId: that.perGoodsList.ticketId,
					qty: that.ticketPaymoney + '',
					custId: that.balInfo.custId,
					placeId: that.storeInfo.v8PlaceId,
					V8Url: that.storeInfo.v8Url, 
					storeId: that.storeInfo.id,
					note: '[使用' + that.ticketPaymoney + '预存款购买电影票]',
					phoneNumber: that.phoneNumber
				};
				this.$api('user.deduction', params).then(res => {
					if (res.flag) {
						that.confirmOrder(confirmParam);
					} else {
						that.isSubOrder = false;
						uni.hideLoading();
						uni.showToast({
							icon: 'none',
							title: res.msg || '扣款失败'
						});
					}
				}).catch(() => {
					that.isSubOrder = false;
					uni.hideLoading();
					uni.showToast({ icon: 'none', title: '扣款失败，请重试' });
				});
			} else {
				that.isSubOrder = false;
				uni.hideLoading();
				uni.showToast({
					icon: 'none',
					title: '手机号码为必填项'
				});
			}
		},
		// 可用优惠券
		getCoupons() {
			let that = this;
			that.$api('coupons.list', {
				couponType: 2,
				openId: uni.getStorageSync('openid'),
				status: 0,
				payType: that.payType == 'wechat' ? 1 : 0,
				scheduleId: that.perGoodsList.scheduleId,
				seatCount: that.seatCount
			}).then(res => {
				if (res.flag) {
					that.pickerData.couponList = Array.isArray(res.data) ? res.data : [];
					that.pickerData.title = '可用优惠券(' + (Number(that.pickerData.couponList.length) + Number(that.groupCouponsList.length)) + '张)';
				}
			});
		}, // 可用团体票
		getGroupCoupons() {
			let that = this;
			that.$api('coupons.list', {
				couponType: 0,
				openId: uni.getStorageSync('openid'),
				status: 0
			}).then(res => {
				if (res.flag) {
					that.groupCouponsList = Array.isArray(res.data) ? res.data : [];
					that.pickerData.title = '可用优惠券(' + (Number(that.pickerData.couponList.length) + Number(that.groupCouponsList.length)) + '张)';
					/* if (that.groupCouponsList.length > 0) {
						if (that.perGoodsList.seats.length > that.groupCouponsList.length) {
							that.pickerData.title = '可用优惠券(' + that.groupCouponsList.length + '张)';
						} else {
							that.pickerData.title = '可用优惠券(' + that.perGoodsList.seats.length + '张)';
						}
					} */
				}
			});
		},
		// 选择优惠券
		selCoupon() {
			if (this.couponCount > 0) {
				this.showExpressType = true;
			} else {
				this.$tools.toast('暂无优惠券');
			}
		},
		changeCoupon(index) {
			this.couponArray = [];
			this.couponId = 0;
			if (index >= 0 && this.pickerData.couponList[index]) {
				this.couponId = this.pickerData.couponList[index].id;
				this.couponPrice = this.pickerData.couponList[index].reducePrice;
				this.calculateBenefits();
			} else {
				this.couponId = 0;
				this.pickerData.title = '选择优惠券';
			}
		},
		//计算团体票优惠
		calculateBenefits(val = []) {
			let that = this;
			let countPrice = 0;
			const selectedCoupons = Array.isArray(val) ? val : [];
			if (that.expressTypeCur == 'express') {
				selectedCoupons.forEach(item => {
					that.groupCouponsList.forEach((items, index) => {
						if (item == items.id) {
							if (that.payType == 'wallet') {
								if (items.couponId == '2') {
									countPrice += Number(that.scheduleInfo.settleprice || 0);
								} else {
									countPrice += Number(that.scheduleInfo.settleprice || 0);
									countPrice = countPrice - Number(that.hallImbalance);
								}
							} else {
								if (items.couponId == '2') {
									countPrice += Number(that.scheduleInfo.standardprice || 0);
								} else {
									countPrice += Number(that.scheduleInfo.standardprice || 0);
									countPrice = countPrice - Number(that.hallImbalance);
								}
							}
						}
					});
				});
			} else {
				countPrice = Number(that.couponPrice);
			}
			if (that.payType == 'wallet') {
				this.ticketPaymoney = Math.max(0, Number(that.scheduleInfo.settleprice || 0) * that.seatCount - countPrice);
			} else {
				this.ticketPaymoney = Math.max(0, Number(that.scheduleInfo.standardprice || 0) * that.seatCount - countPrice);
			}
			if (countPrice == 0) {
				this.pickerData.title = '选择优惠券';
			} else {
				this.pickerData.title = '-￥' + countPrice;
			}
			this.preferentialAmount = countPrice;
		},
		changeCouponGroup(val) {
			let that = this;
			const selected = Array.isArray(val) ? val : [];
			this.couponArray = [];
			that.couponId = 0;
			if (selected.length > 0) {
				this.couponArray = selected;
				that.calculateBenefits(selected);
			} else {
				this.couponArray = [];
				that.calculateBenefits(selected);
				this.pickerData.title = '选择优惠券';
			}
		},
		// 更改提交数据
		changeGoodsList() {
			this.goodsList.forEach(goods => {
				if (goods.goods_id == this.currentGoodsId && this.currentSkuId == goods.sku_price_id) {
					goods.dispatch_type = this.expressTypeCur;
					goods.dispatch_phone = this.selfPhone;
					goods.dispatch_date = this.checkTime['day'][this.checkDayCur].value + ' ' + this.checkTime['time'][this.checkTimeCur] + ':00';
					if (this.expressTypeCur == 'selfetch') {
						goods.store_id = this.storeInfo.id;
					}
					goods.checkDayCur = this.checkDayCur;
					goods.checkTimeCur = this.checkTimeCur;
				}
			});
		},
		// 格式日期
		check(type, index) {
			if (type == 'time') {
				this.checkTimeCur = index;
				this.checkTimeId = this.checkTime['time'][index].split(':')[[0]];
			}
			if (type == 'day') {
				this.checkDayCur = index;
			}
		},
		// 是否同意协议
		checkProtocol() {
			this.isProtocol = !this.isProtocol;
		}
	}
};
</script>

<style lang="scss">
.checkout-page {
	background: var(--tt-bg);
}

.checkout-content {
	padding: 24rpx 24rpx 32rpx;
}

.checkout-card {
	box-sizing: border-box;
	background: var(--tt-surface);
	border: 1rpx solid var(--tt-border);
	border-radius: var(--tt-radius-md);
	box-shadow: var(--tt-shadow);
}

.add-address-box {
	height: 100rpx;
	background: #fff;
	position: relative;
	.address-bg {
		position: absolute;
		bottom: 0;
		height: 8rpx;
		width: 100%;
	}
	.select-notice {
		font-weight: 400;
		color: rgba(153, 153, 153, 1);
		line-height: 40rpx;
	}
}
.address-list {
	padding: 40rpx;
	background: #fff;
	position: relative;
	.address-bg {
		position: absolute;
		bottom: 0;
		height: 8rpx;
		width: 750rpx;
		left: 50%;
		transform: translateX(-50%);
	}

	.name,
	.phone {
		font-size: 30rpx;
		font-weight: 500;
	}

	.phone {
		margin: 0 20rpx;
	}

	.tag {
		background: rgba(233, 191, 113, 0.2);
		border-radius: 6rpx;
		padding: 0 16rpx;
		line-height: 38rpx;
		color: #a8700d;
		font-size: 22rpx;
	}

	.detail {
		.address {
			margin-top: 25rpx;
			width: 543rpx;
			font-size: 26rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(153, 153, 153, 1);
			line-height: 40rpx;
		}
	}
}
// 备注
.remark-box {
	margin-top: 20rpx;
	background: #fff;
	padding: 25rpx;
	.item-input {
		flex: 1;
		text-align: end;
		font-size: 28rpx;
	}
	.input-pl {
		color: #c4c4c4;
	}
}
.pay-box {
	margin: 0 0 20rpx;
	overflow: hidden;
	.pay-item {
		height: 104rpx;
		padding: 0 30rpx;
		font-size: 28rpx;
		background: #fff;
		width: 100%;
		box-sizing: border-box;
		border-bottom: 1rpx solid var(--tt-border);
		&:last-child {
			border-bottom: none;
		}

		.pay-radio {
			transform: scale(0.8);
		}

		.pay-img {
			width: 44rpx;
			height: 44rpx;
			// background: #ccc;
			margin-right: 25rpx;
		}
	}
}
// 商品卡片
.goods-list {
	background: #fff;
	position: relative;
	margin: 0 0 20rpx;
	overflow: hidden;
	:deep(.goods-title) {
		width: 460rpx !important;
	}
	.goods-card {
		padding: 26rpx;
	}
	.goods-price {
		font-size: 30rpx;
		font-weight: 500;
		width: 480rpx;
		.goods-num {
			padding: 8rpx 0 0;
			width: 80%;
			float: left;
			font-size: 28rpx;
			color: var(--tt-text-muted);
			text {
				padding-left: 10rpx;
			}
		}
		.goods-hald {
			float: left;
		}
	}
}

.item-list {
	min-height: 104rpx;
	background: #fff;
	padding: 0 28rpx;

	.item-title {
		font-size: 28rpx;
		font-weight: 600;
		color: var(--tt-text);
		margin-right: 20rpx;
	}

	.detail {
		font-size: 28rpx;
		color: #333;
	}

	.price {
		font-size: 26rpx;
		color: var(--tt-danger);
		margin-right: 20rpx;
	}
	.sel-coupon {
		font-size: 26rpx;
		color: var(--tt-text-muted);
		margin-right: 20rpx;
	}
	.cuIcon-right {
		color: #c4c4c4;
	}
}
.logistic,
.price-box,
.remark-box,
.score,
.coupon {
	border-top: 1rpx solid rgba(#dfdfdf, 0.5);
}
.coupon,
.phone {
	margin: 0 0 20rpx;
}
.goods {
	margin: 20rpx;
	border-radius: 15rpx 15rpx 0 0;
	border-bottom: 1rpx solid rgba(#dfdfdf, 0.5);
	box-shadow: 1px 1px 1px #c0c0c0;
}
.goods-tier {
	height: 300rpx;
	width: auto;
	margin: 0 20rpx 20rpx 20rpx;
	border-radius: 0 0 15rpx 15rpx;
	box-shadow: 1px 1px 1px #c0c0c0;
}
.notice {
	margin: 0;
	background: #fff;
	padding: 0 28rpx 22rpx;
	display: inline-block;
	.notice-title {
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		font-weight: 700;
		border-bottom: 1rpx solid var(--tt-border);
	}
	.notice-detail {
		padding-top: 14rpx;
		font-size: 24rpx;
		color: var(--tt-text-secondary);
		view {
			line-height: 42rpx;
			margin-bottom: 6rpx;
		}
	}
}
.border-top {
	border-top: 1rpx solid rgba(#dfdfdf, 0.5);
}

.foot_box {
	min-height: 112rpx;
	padding: 10rpx 24rpx calc(10rpx + constant(safe-area-inset-bottom));
	padding: 10rpx 24rpx calc(10rpx + env(safe-area-inset-bottom));
	justify-content: flex-end;
	background-color: #fff;
	border-top: 1rpx solid var(--tt-border);
	box-shadow: 0 -10rpx 28rpx rgba(23, 24, 18, 0.07);

	.num {
		font-size: 26rpx;
		color: #999;
	}

	.all-money {
		margin: 0 24rpx 0 16rpx;

		.price {
			color: var(--tt-danger);
			font-size: 34rpx;
			font-weight: 700;
		}
	}

	.sub-btn {
		width: 220rpx;
		height: 76rpx;
		background: var(--tt-primary);
		box-shadow: 0 8rpx 18rpx rgba(143, 152, 30, 0.2);
		border-radius: 40rpx;
		font-size: 28rpx;
		color: #fff;
	}
}
// 弹窗之配送方式
// 配送方式
.express-type {
	width: 100%;
	max-width: 750rpx;
	background-color: #fff;
	border-radius: 30rpx 30rpx 0 0;
	height: 760rpx;
	max-height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-sizing: border-box;
	.express-type__head {
		flex-shrink: 0;
		width: 100%;
		height: 74rpx;
		background: var(--tt-primary-soft);
		@include tt-flex($align: center);
		border-radius: 20rpx 20rpx 0 0;
		&-nav {
			flex: 1;
			@include tt-flex($align: center, $justify: center);
			position: relative;
			height: 100%;
		}
		.head-nav--active {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: 0;
			background: #fff;
			width: 100%;
			height: 80rpx;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0px 0px;
			&::after {
				content: '';
				display: block;
				width: 40rpx;
				height: 80rpx;
				position: absolute;
				transform: skewX(20deg);
				background: #fff;
				border-top-right-radius: 20rpx;
				top: 0;
				right: -15rpx;
			}
			&::before {
				content: '';
				display: block;
				width: 40rpx;
				height: 80rpx;
				position: absolute;
				transform: skewX(-20deg);
				background: #fff;
				border-top-left-radius: 20rpx;
				top: 0;
				left: -15rpx;
			}
		}
		.head-nav__left--active {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: 0;
			background: #fff;
			width: 100%;
			height: 74rpx;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0px 0px;
			&::after {
				content: '';
				display: block;
				width: 40rpx;
				height: 74rpx;
				position: absolute;
				transform: skewX(20deg);
				background: #fff;
				border-top-right-radius: 20rpx;
				top: 0;
				right: -15rpx;
			}
		}
		.head-nav__right--active {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: 0;
			background: #fff;
			width: 100%;
			height: 74rpx;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0px 0px;
			&::before {
				content: '';
				display: block;
				width: 40rpx;
				height: 74rpx;
				position: absolute;
				transform: skewX(-20deg);
				background: #fff;
				border-top-left-radius: 20rpx;
				top: 0;
				left: -15rpx;
			}
		}
		.head-nav__title {
			font-size: 24rpx;
			font-weight: 500;
			color: #666;
			position: relative;
			z-index: 6;
		}
		.head-nav__title--active {
			color: var(--tt-primary-strong);
			font-size: 26rpx;
		}
	}
	.express-type__content {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		.empty-address {
			height: 120rpx;
			padding: 0 25rpx;
			@include tt-flex($justify: null, $align: center, $direction: null, $warp: null, $warpAlign: null);
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(153, 153, 153, 1);
		}
		// 无定位
		.location-box {
			height: 500rpx;
			justify-content: center;
			.nolocation-img {
				width: 74rpx;
				height: 90rpx;
				margin-bottom: 40rpx;
			}
			.location-title {
				font-size: 35rpx;
				font-family: PingFang SC;
				font-weight: bold;
				color: rgba(70, 53, 27, 1);
				margin-bottom: 20rpx;
			}
			.location-tip {
				font-size: 28rpx;
				font-family: PingFang SC;
				font-weight: 400;
				color: rgba(153, 153, 153, 1);
				margin-bottom: 40rpx;
			}
			.open-location {
				width: 492rpx;
				height: 70rpx;
				background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
				box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
				border-radius: 35rpx;
				font-size: 28rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(255, 255, 255, 1);
			}
		}
		
	}
	.express-type__bottom {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		box-sizing: border-box;
		width: 100%;
		min-height: 110rpx;
		padding: 16rpx 30rpx calc(16rpx + constant(safe-area-inset-bottom));
		padding: 16rpx 30rpx calc(16rpx + env(safe-area-inset-bottom));
		background: #fff;
		.cancel-btn,
		.save-btn {
			flex: 1;
			width: auto;
			min-width: 0;
			height: 74rpx;
			margin: 0;
			padding: 0;
			border-radius: 37rpx;
			font-size: 28rpx;
			font-weight: 400;
			line-height: 74rpx;
		}
		.cancel-btn {
			background: #eef0e8;
			color: rgba(51, 51, 51, 1);
		}
		.save-btn {
			background: var(--tt-primary, #a9b238);
			color: #fff;
		}
	}
}
// 选择配送给时间
.checkTime-box {
	background: rgba(255, 255, 255, 1);
	border-radius: 20rpx 20rpx 0px 0px;
	height: 720rpx;
	.checkTime-head {
		font-size: 32rpx;
		font-family: PingFang SC;
		font-weight: 500;
		color: rgba(51, 51, 51, 1);
		line-height: 100rpx;
		position: relative;
		.cuIcon-roundclosefill {
			color: #e0e0e0;
			position: absolute;
			top: 30rpx;
			right: 30rpx;
			line-height: 30rpx;
			font-size: 40rpx;
		}
	}
	.checkTime-foot {
		height: 100rpx;
		.save-btn {
			width: 690rpx;
			height: 80rpx;
			background: linear-gradient(90deg, rgba(240, 199, 133, 1), rgba(246, 214, 157, 1));
			border-radius: 40rpx;
			font-size: 30rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(255, 255, 255, 1);
		}
	}
	.checkTime-content {
		@include tt-flex($justify: between, $align: center, $direction: null, $warp: null, $warpAlign: null);
		.checkTime-content__left {
			height: 100%;
			width: 190rpx;
			background: #f5f5f5;
			.left-item {
				font-size: 26rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(51, 51, 51, 1);
				height: 100rpx;
				width: 100%;
			}
		}
		.checkTime-content__right {
			flex: 1;
			height: 100%;
			overflow-y: auto;
			.right-item {
				font-size: 26rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(51, 51, 51, 1);
				width: 100%;
				text-align: center;
				border-bottom: 1rpx solid rgba(#dfdfdf, 0.6);
				margin: 0 30rpx;
				line-height: 100rpx;
			}
		}
		.item--active {
			font-size: 26rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(168, 112, 13, 1) !important;
			background-color: #fff;
		}
	}
}
.express-type {
	width: 100%;
	max-width: 750rpx;
	background-color: #fff;
	border-radius: 30rpx 30rpx 0 0;
	height: 760rpx;
	max-height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-sizing: border-box;
	.express-type__head {
		flex-shrink: 0;
		width: 100%;
		height: 74rpx;
		background: var(--tt-primary-soft);
		@include tt-flex($align: center);
		border-radius: 20rpx 20rpx 0 0;
		&-nav {
			flex: 1;
			@include tt-flex($align: center, $justify: center);
			position: relative;
			height: 100%;
		}
		.head-nav--active {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: 0;
			background: #fff;
			width: 100%;
			height: 80rpx;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0px 0px;
			&::after {
				content: '';
				display: block;
				width: 40rpx;
				height: 80rpx;
				position: absolute;
				transform: skewX(20deg);
				background: #fff;
				border-top-right-radius: 20rpx;
				top: 0;
				right: -15rpx;
			}
			&::before {
				content: '';
				display: block;
				width: 40rpx;
				height: 80rpx;
				position: absolute;
				transform: skewX(-20deg);
				background: #fff;
				border-top-left-radius: 20rpx;
				top: 0;
				left: -15rpx;
			}
		}
		.head-nav__left--active {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: 0;
			background: #fff;
			width: 100%;
			height: 74rpx;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0px 0px;
			&::after {
				content: '';
				display: block;
				width: 40rpx;
				height: 74rpx;
				position: absolute;
				transform: skewX(20deg);
				background: #fff;
				border-top-right-radius: 20rpx;
				top: 0;
				right: -15rpx;
			}
		}
		.head-nav__right--active {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: 0;
			background: #fff;
			width: 100%;
			height: 74rpx;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0px 0px;
			&::before {
				content: '';
				display: block;
				width: 40rpx;
				height: 74rpx;
				position: absolute;
				transform: skewX(-20deg);
				background: #fff;
				border-top-left-radius: 20rpx;
				top: 0;
				left: -15rpx;
			}
		}
		.head-nav__title {
			font-size: 24rpx;
			font-weight: 500;
			color: #666;
			position: relative;
			z-index: 6;
		}
		.head-nav__title--active {
			color: var(--tt-primary-strong);
			font-size: 26rpx;
		}
	}
	.express-type__content {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		.empty-address {
			height: 120rpx;
			padding: 0 25rpx;
			@include tt-flex($justify: null, $align: center, $direction: null, $warp: null, $warpAlign: null);
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(153, 153, 153, 1);
		}
		// 无定位
		.location-box {
			height: 500rpx;
			justify-content: center;
			.nolocation-img {
				width: 74rpx;
				height: 90rpx;
				margin-bottom: 40rpx;
			}
			.location-title {
				font-size: 35rpx;
				font-family: PingFang SC;
				font-weight: bold;
				color: rgba(70, 53, 27, 1);
				margin-bottom: 20rpx;
			}
			.location-tip {
				font-size: 28rpx;
				font-family: PingFang SC;
				font-weight: 400;
				color: rgba(153, 153, 153, 1);
				margin-bottom: 40rpx;
			}
			.open-location {
				width: 492rpx;
				height: 70rpx;
				background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
				box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
				border-radius: 35rpx;
				font-size: 28rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(255, 255, 255, 1);
			}
		}
		
	}
	.express-type__bottom {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		box-sizing: border-box;
		width: 100%;
		min-height: 110rpx;
		padding: 16rpx 30rpx calc(16rpx + constant(safe-area-inset-bottom));
		padding: 16rpx 30rpx calc(16rpx + env(safe-area-inset-bottom));
		background: #fff;
		.cancel-btn,
		.save-btn {
			flex: 1;
			width: auto;
			min-width: 0;
			height: 74rpx;
			margin: 0;
			padding: 0;
			border-radius: 37rpx;
			font-size: 28rpx;
			font-weight: 400;
			line-height: 74rpx;
		}
		.cancel-btn {
			background: #eef0e8;
			color: rgba(51, 51, 51, 1);
		}
		.save-btn {
			background: var(--tt-primary, #a9b238);
			color: #fff;
		}
	}
}
.goods-box {
	position: relative;
	margin: 10rpx;
	width: 680rpx;
	.goods-img {
		height: 180rpx;
		width: 180rpx;
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
		color: rgba(51, 51, 51, 1);
		width: 450rpx;
		line-height: 40rpx;
		margin-bottom: 10rpx;
	}

	.size-tip {
		line-height: 40rpx;
		// background: #f4f4f4;
		// padding: 0 16rpx;
		font-size: 24rpx;
		color: #666;
	}
	.sub-tip {
		width: 480rpx;
		line-height: 40rpx;
		// background: #F6F2EA;
		font-size: 24rpx;
		color: #a8700d;
		margin: 10rpx 0;
	}

	.price {
		color: #e1212b;
	}
}

.reserve-page {
	height: 100vh;
	min-height: 0;
	overflow: hidden;
	background: var(--tt-bg, #f5f6f2);
}

.reserve-content {
	min-height: 0;
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 24rpx 24rpx 32rpx;
	box-sizing: border-box;
	-webkit-overflow-scrolling: touch;
}

.session-day-alert {
	display: flex;
	align-items: flex-start;
	gap: 14rpx;
	margin-bottom: 20rpx;
	padding: 18rpx 20rpx;
	box-sizing: border-box;
	border-radius: 16rpx;
	background: #fff6e8;
	border: 1rpx solid #f0b35a;
}

.session-day-alert.is-expired {
	background: #fff1f0;
	border-color: #f0a0a0;
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
	background: var(--tt-danger, #d84a4a);
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

.reserve-card {
	width: 100%;
	box-sizing: border-box;
	background: #fff;
	border: 1rpx solid var(--tt-border, #e9ebe4);
	border-radius: 20rpx;
	box-shadow: 0 8rpx 24rpx rgba(31, 35, 24, 0.05);
}

.reserve-movie-card,
.reserve-pay-card,
.reserve-row {
	margin-bottom: 20rpx;
}

.reserve-movie-card {
	overflow: hidden;
}

.reserve-movie-main {
	display: flex;
	align-items: flex-start;
	width: 100%;
	min-width: 0;
	padding: 24rpx;
	box-sizing: border-box;
}

.reserve-poster {
	width: 152rpx;
	height: 210rpx;
	flex: 0 0 152rpx;
	display: block;
	border-radius: 12rpx;
	background: #eef0eb;
	box-shadow: 0 5rpx 14rpx rgba(23, 24, 18, 0.12);
}

.reserve-movie-copy {
	min-width: 0;
	flex: 1;
	margin-left: 22rpx;
	overflow: hidden;
}

.reserve-title-row {
	display: flex;
	align-items: flex-start;
	width: 100%;
	min-width: 0;
}

.reserve-movie-title {
	min-width: 0;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 31rpx;
	font-weight: 750;
	line-height: 44rpx;
	color: var(--tt-text, #20231c);
}

.reserve-countdown {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 5rpx;
	margin-left: 12rpx;
	padding: 4rpx 10rpx;
	border-radius: 18rpx;
	background: #fff5f2;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #e65b4e;
}

.reserve-session {
	display: block;
	max-width: 100%;
	margin-top: 9rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 24rpx;
	line-height: 34rpx;
	color: var(--tt-text-secondary, #60665a);
}

.reserve-session.is-non-today {
	color: #c45c12;
	font-weight: 700;
}

.reserve-meta-row {
	display: flex;
	align-items: center;
	min-width: 0;
	margin-top: 9rpx;
	font-size: 22rpx;
	line-height: 32rpx;
}

.reserve-version {
	flex: 0 0 auto;
	margin-right: 12rpx;
	padding: 2rpx 9rpx;
	border-radius: 6rpx;
	background: var(--tt-primary-soft, #f3f5db);
	color: var(--tt-primary-strong, #747e10);
}

.reserve-hall {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--tt-text-muted, #92978d);
}

.reserve-seat-scroll {
	width: 100%;
	height: 48rpx;
	margin-top: 11rpx;
	white-space: nowrap;
}

.reserve-seat-chip {
	height: 42rpx;
	display: inline-flex;
	align-items: center;
	margin-right: 9rpx;
	padding: 0 11rpx;
	box-sizing: border-box;
	border-radius: 7rpx;
	background: #f4f5f2;
	font-size: 20rpx;
	line-height: 42rpx;
	color: #62685e;
}

.reserve-ticket-summary {
	min-height: 82rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	padding: 16rpx 24rpx;
	box-sizing: border-box;
	border-top: 1rpx solid var(--tt-border, #eceee8);
}

.reserve-rules {
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.reserve-rule {
	flex: 0 0 auto;
	padding: 3rpx 9rpx;
	border-radius: 6rpx;
	background: #fff1ef;
	font-size: 19rpx;
	line-height: 29rpx;
	color: #e95b51;
}

.reserve-original {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 22rpx;
	line-height: 32rpx;
	color: var(--tt-text-secondary, #646a60);
}

.reserve-row {
	min-height: 96rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	padding: 18rpx 26rpx;
}

.reserve-row-title {
	flex: 0 0 auto;
	font-size: 27rpx;
	font-weight: 650;
	line-height: 38rpx;
	color: var(--tt-text, #20231c);
}

.reserve-row-value {
	min-width: 0;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 12rpx;
	font-size: 24rpx;
	line-height: 34rpx;
}

.reserve-accent {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--tt-danger, #eb5757);
}

.reserve-muted {
	color: var(--tt-text-muted, #969b92);
}

.reserve-arrow {
	font-size: 30rpx;
	color: #b5bab1;
}

.reserve-pay-card {
	display: block;
	overflow: hidden;
}

.reserve-pay-row {
	width: 100%;
	min-height: 104rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 18rpx;
	padding: 18rpx 26rpx;
	box-sizing: border-box;
	border-bottom: 1rpx solid var(--tt-border, #eceee8);
}

.reserve-pay-row:last-child {
	border-bottom: 0;
}

.reserve-pay-copy {
	min-width: 0;
	flex: 1;
	display: flex;
	align-items: center;
}

.reserve-pay-icon {
	width: 44rpx;
	height: 44rpx;
	flex: 0 0 44rpx;
	margin-right: 20rpx;
}

.reserve-pay-text {
	min-width: 0;
	display: flex;
	flex-direction: column;
}

.reserve-pay-name {
	font-size: 26rpx;
	line-height: 36rpx;
	color: var(--tt-text, #20231c);
}

.reserve-balance {
	margin-top: 2rpx;
	font-size: 20rpx;
	line-height: 29rpx;
	color: var(--tt-text-muted, #92978d);
}

.reserve-radio {
	flex: 0 0 auto;
	transform: scale(0.82);
}

.reserve-phone-button {
	min-width: 88rpx;
	min-height: 52rpx;
	height: 52rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0;
	padding: 0 18rpx;
	border: 1rpx solid var(--tt-danger, #eb5757);
	border-radius: 27rpx;
	background: #fff;
	font-size: 22rpx;
	line-height: 50rpx;
	color: var(--tt-danger, #eb5757);
}

.reserve-phone-button::after {
	display: none;
}

.reserve-notice {
	margin-bottom: 24rpx;
	padding: 0 26rpx 24rpx;
}

.reserve-notice-title {
	height: 82rpx;
	display: flex;
	align-items: center;
	border-bottom: 1rpx solid var(--tt-border, #eceee8);
	font-size: 28rpx;
	font-weight: 700;
	color: var(--tt-text, #20231c);
}

.reserve-notice-detail {
	padding-top: 15rpx;
	font-size: 23rpx;
	line-height: 40rpx;
	color: var(--tt-text-secondary, #686e64);
}

.reserve-notice-detail view {
	margin-bottom: 8rpx;
}

.reserve-footer {
	width: 100%;
	min-height: 108rpx;
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 18rpx;
	padding: 12rpx 24rpx calc(12rpx + constant(safe-area-inset-bottom));
	padding: 12rpx 24rpx calc(12rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
	background: rgba(255, 255, 255, 0.98);
	border-top: 1rpx solid var(--tt-border, #e8eae5);
	box-shadow: 0 -9rpx 28rpx rgba(26, 29, 21, 0.08);
}

.reserve-footer-total {
	min-width: 0;
	flex: 1;
	display: flex;
	align-items: baseline;
}

.reserve-footer-count {
	flex: 0 0 auto;
	font-size: 21rpx;
	color: var(--tt-text-muted, #92978d);
}

.reserve-footer-price {
	min-width: 0;
	display: flex;
	align-items: baseline;
	margin-left: 13rpx;
	font-size: 24rpx;
	color: var(--tt-text-secondary, #60665a);
}

.reserve-footer-amount {
	font-size: 34rpx;
	font-weight: 750;
	line-height: 44rpx;
	color: var(--tt-danger, #eb5757);
}

.reserve-submit {
	width: 216rpx;
	min-height: 76rpx;
	height: 76rpx;
	flex: 0 0 216rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0;
	padding: 0;
	border: 0;
	border-radius: 39rpx;
	background: var(--tt-primary, #a3ad34);
	box-shadow: 0 8rpx 18rpx rgba(143, 152, 30, 0.2);
	font-size: 27rpx;
	font-weight: 700;
	line-height: 76rpx;
	color: #fff;
}

.reserve-submit[disabled] {
	background: #cfd2c7;
	color: #fff;
	opacity: 1;
}

.reserve-submit::after {
	display: none;
}

.order-placeholder {
	height: 70vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 18rpx;
	font-size: 26rpx;
	color: var(--tt-text-muted, #999);
}

.order-placeholder-icon {
	font-size: 60rpx;
	color: var(--tt-primary, #9aa52d);
}
</style>

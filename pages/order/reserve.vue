<template>
	<view class="page_box">
		<view class="content_box">
			<!-- 确认订单商品卡片 -->
			<view class="goods-list">
				<view class="goods-card">
					<app-mini-card @overTime="escOrder" ref="appMini" :detail="perGoodsList" :type="'sku'">
						<block slot="goodsBottom">
							<view class="goods-price">
								<view class="goods-hald">
									<text>{{ perGoodsList.schedule.filmName }} ({{perGoodsList.schedule.language}})</text>
								</view>
								<view class="goods-num">
									<text v-for="(item, index) in perGoodsList.seats" :key="index">{{ item.rowId }}排{{ item.columnId }}座</text>
								</view>
							</view>
						</block>
					</app-mini-card>
				</view>
				<view class="logistic item-list x-bc">
					<view class="x-f">
						<text class="cuIcon-roundcheck text-red padding-xs">不可改签</text>
						<text class="cuIcon-roundclose text-red padding-xs">不可退票</text>
					</view>
					<view class="x-f">
						<view class="detail">共{{perGoodsList.seats.length}}张 原价 ￥{{Number(perGoodsList.schedule.standardprice) *Number(perGoodsList.seats.length)}}</view>
					</view>
				</view>
			</view>
			<!-- 优惠券 -->
			<view class="coupon x-bc item-list">
				<view class="item-title">优惠券</view>
				<view class="x-f" @tap="selCoupon">
					<text class="price" v-if="groupCouponsList.length">{{ pickerData.title }}</text>
					<text class="sel-coupon" v-else>暂无优惠券</text>
					<text class="cuIcon-right"></text>
				</view>
			</view>
			<radio-group @change="selPay" class="pay-box">
				<label class="x-bc pay-item">
					<view class="x-f">
						<image class="pay-img" src="https://i.postimg.cc/bw6zsHsf/wx-pay.png" mode=""></image>
						<text>微信支付</text>
					</view>
					<radio value="wechat" :class="{ checked: payType === 'wechat' }" class=" pay-radio orange" :checked="payType === 'wechat'"></radio>
				</label>
				<label class="x-bc pay-item">
					<view class="x-f">
						<image class="pay-img" src="https://i.postimg.cc/QdN88nNq/wallet-pay.png" mode=""></image>
						<text>
							余额支付
							<text class="text-red padding-left">{{ balInfo.Money == 0 || balInfo.Money == null ? '余额不足' : '' }}({{ balInfo.Money || '0.00' }})</text>
						</text>
					</view>
					<radio
						value="wallet"
						:class="{ checked: payType === 'wallet' }"
						:disabled="balInfo.Money == 0 || balInfo.Money == null ? true : false"
						class="pay-radio orange"
						:checked="payType === 'wallet'"
					></radio>
				</label>
			</radio-group>
			<!-- 手机号码 -->
			<view class="phone x-bc item-list">
				<view class="item-title">手机号码</view>
				<view class="x-f" v-if="userInfo.phoneNumber">
					<text class="price">{{ userInfo.phoneNumber }}</text>
				</view>
				<view v-else class="x-f">
					<text class="sel-coupon">无手机号码</text>
					<button class="cu-btn round lines-red" open-type="getPhoneNumber" @getphonenumber="bindPhone">获取</button>
				</view>
			</view>
			<!-- 购票须知 -->
			<view class="notice x-bc">
				<view class="notice-title">购票须知</view>
				<view class="notice-detail">
					<view>1.由于设备故障灯不可抗力因素，存在少量场次取消的情况下，会进行退票退款</view>
					<view>2.由于影院系统不稳定等因素，存在出票失败的情况，会进行退款</view>
					<view>3.取票码可以在“票夹-电影票”中查看</view>
				</view>
			</view>
		</view>
		<view class="foot_box x-f">
			<text class="num">共1件</text>
			<view class="all-money">
				<text>合计：</text>
				<text class="price">￥{{ticketPaymoney || '0.00' }}</text>
				</view>
			<button class="cu-btn sub-btn bg-red" @tap="combuy" :disabled="isSubOrder">
				<text v-if="isSubOrder" class="cuIcon-loading2 cuIconfont-spin"></text>
				立即购买
			</button>
		</view>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
		<app-modal v-model="showExpressType" :modalType="'bottom-modal'">
			<block slot="modalContent">
				<!-- 选择优惠券 -->
				<view class="express-type page_box">
					<view class="express-type__head head-box">
						<view class="express-type__head-nav" v-for="(nav, index) in expressType" :key="nav.id" @tap="changeExpressType(nav.value)">
							<text class="head-nav__title" :class="{ 'head-nav__title--active': expressTypeCur === nav.value }">{{ nav.title }}</text>
							<view :class="expressClass" v-show="expressTypeCur === nav.value"></view>
						</view>
					</view>
					<view class="express-type__content content_box">
						<fz-group-card
							ref="groupCard"
							:checkArray="couponArray"
							:hallImbalance="hallImbalance"
							@changeCouponGroup="changeCouponGroup"
							:hallLength="hallLength"
							:pickerData="groupCouponsList"
							v-if="expressTypeCur == 'express'"
						></fz-group-card>
						<!-- <fz-coupon-card :pickerData="groupCouponsList" v-if="expressTypeCur == 'selfetch'"></fz-coupon-card> -->
					</view>
					<view class="express-type__bottom x-bc">
						<button class="cu-btn cancel-btn" @tap="hideExpressType">取消</button>
						<button class="cu-btn save-btn" @tap="saveExpressType">确定</button>
					</view>
				</view>
			</block>
		</app-modal>
	</view>
</template>

<script>
import appMiniCard from '@/components/fz-mini-card/fz-mini-card.vue';
import fzGroupCard from './children/fz-group-card.vue';
import fzCouponCard from './children/fz-coupon-card.vue';
import AppPay from '@/common/app-pay';
import { mapMutations, mapActions, mapState } from 'vuex';
// #ifdef H5
import wxsdk from '@/common/wechat/sdk';
// #endif
// #ifdef APP-PLUS
import permision from '@/common/permission.js';
// #endif
import goods from '@/csJson/scoreList.json';
export default {
	components: {
		appMiniCard,
		fzGroupCard,
		fzCouponCard
	},
	data() {
		return {
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
			grouponBuyType: 'alone',
			grouponId: 0,
			perGoodsList: {}, //确认单订单
			orderPre: {},
			couponId: 0,
			ticketPaymoney: 0,
			preferentialAmount: 0,
			groupCouponsList: [
				
			],
			couponArray: [],
			couponPrice: '选择优惠券',
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
			lng: 0
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo,
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
		}
		/* ticketPaymoney(){
			console.log('進入')
			let that = this
			return Number(that.perGoodsList.schedule.standardprice) *Number(that.perGoodsList.seats.length)
		} */
	},
	watch: {},
	onHide() {
		console.log('页面隐藏');
		let that = this;
		that.$refs.appMini.clearTime()
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
		console.log('页面关闭');
		that.$refs.appMini.clearTime()
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
		console.log('触发返回');
		if (e.from == 'backbutton') {
			uni.showModal({
				title: '提示',
				content: '还没付款，是否退出',
				success: function(res) {
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
		let that = this
		if (options.openid) {
			//检测到回传openid
			uni.setStorageSync('openid', options.openid);
		}
		if (this.$Route.query) {
			this.perGoodsList = { ...this.$Route.query };
			this.perGoodsList.schedule = JSON.parse(this.$Route.query.schedule);
			this.perGoodsList.schedule.showDatetime = decodeURI(this.perGoodsList.schedule.showDatetime);
			this.perGoodsList.locationHall = JSON.parse(this.perGoodsList.locationHall);				this.perGoodsList.seats = JSON.parse(this.perGoodsList.seats);
			this.hallLength = this.perGoodsList.seats.length;
			this.hallImbalance = this.perGoodsList.locationHall.hallImbalance;
			this.ticketPaymoney = Number(this.perGoodsList.schedule.standardprice) * Number(this.perGoodsList.seats.length);
		}
		/* this.goodsList = JSON.parse(this.$Route.query.goodsList); 
		this.from = this.$Route.query.from;
		this.orderType = this.$Route.query.orderType;
		this.grouponBuyType = this.$Route.query.grouponBuyType;
		this.grouponId = this.$Route.query.grouponId;*/
		
		this.initDate();
		this.getGroupCoupons();
	},
	onShow() {
		/* this.$isPreviewApi = true */
	},
	methods: {
		...mapActions(['getUserDetails']),
		async changeExpressType(cur) {
			this.expressTypeCur = cur;
			this.getFocus = false;
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
			let that = this
			if(new Date().getTime()<new Date(Date.parse(that.perGoodsList.schedule.showDatetime.replace(/-/g,'/'))).getTime()){
				if(that.ticketPaymoney == 0 && this.couponArray.length>0){
						let ticketList = []
						that.perGoodsList.seats.forEach(item => {
							let obj = {};
							obj.seatId = item.seatId;
							obj.ticketFee = item.ticketfee;
							obj.ticketPrice = item.lowestprice;
							ticketList.push(obj);
						});
						if(that.ticketPaymoney == 0){
							that.ifCdkeyPay = true
							if (that.userInfo.phoneNumber) {
								that.isSubOrder = true;
								that.confirmOrder(ticketList);
							} else {
								uni.showToast({
									icon: 'none',
									title: '手机号码为必填项'
								});
							}
						}else{
							if (that.payType == 'wallet') {
								that.blanBuy(ticketList);
							} else {
								that.confirmPay(ticketList);
							}
						}
				}else{
					that.ifCdkeyPay = false
					if (that.payType == 'wallet') {
						let ticketList = []
						that.perGoodsList.seats.forEach((item,index) => {
							let obj = {};
							if(index+1>that.couponArray.length){
								obj.seatId = item.seatId;
								obj.ticketFee = item.ticketfee;
								obj.ticketPrice = item.settleprice;
							}else{
								obj.seatId = item.seatId;
								obj.ticketFee = item.ticketfee;
								obj.ticketPrice = item.lowestprice;
							}
							ticketList.push(obj);
						});
						that.blanBuy(ticketList);
					} else {
						let ticketList = []
						that.perGoodsList.seats.forEach((item,index)=>{
							let obj = {}
							if(index+1>that.couponArray.length){
								obj.seatId = item.seatId;
								obj.ticketFee = item.ticketfee;
								obj.ticketPrice = item.standardprice;
							}else{
								obj.seatId = item.seatId;
								obj.ticketFee = item.ticketfee;
								obj.ticketPrice = item.lowestprice;
							}
							ticketList.push(obj)
						})
						that.confirmPay(ticketList);
					}
				}
			}else{
				that.isSubOrder = true;
				uni.showToast({
					icon: 'none',
					title: '电影已开场，无法再购票'
				});
			}
			
		},
		selPay(e) {
			let that = this;
			if (e.detail.value == 'wallet') {
				let countPrce = Number(that.perGoodsList.schedule.settleprice) * Number(that.perGoodsList.seats.length) - that.preferentialAmount;
				if (Number(countPrce) <= Number(that.balInfo.Money)) {
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
				that.ticketPaymoney = Number(that.perGoodsList.schedule.standardprice) * Number(that.perGoodsList.seats.length) - that.preferentialAmount;
			}
			//切换支付方式重新计算优惠
			that.calculateBenefits(that.couponArray)
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
				}
			});
		},
		// 发起支付
		confirmPay(confirmParam) {
			let that = this;
			if (that.ticketPaymoney > 0) {
				if (that.userInfo.phoneNumber) {
					let params = {
						ticketId: that.perGoodsList.ticketId,
						ticketPaymoney: that.ticketPaymoney
					};
					let pay = new AppPay(that.payType, that.perGoodsList, null, params, 1,confirmParam,that.couponArray);
					that.isSubOrder = true;
					/* that.confirmOrder() */
				} else {
					uni.showToast({
						icon: 'none',
						title: '手机号码为必填项'
					});
				}
			} else {
				uni.showToast({
					icon: 'none',
					title: '金额不能为零'
				});
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
			console.log('进入取消订单流程');
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
			}).then(res => {
				if (res.flag) {
					console.log(res);
				}
			});
		},
		//确认订单
		confirmOrder(array) {
			let that = this;
			let ticketList = [];
			that.isSubOrder = true;
			uni.$off('escLoack');
			this.$api('cinema.confirmOrder', {
				lockOrderId: this.perGoodsList.lockOrderId,
				scheduleId: this.perGoodsList.scheduleId,
				scheduleKey: this.perGoodsList.scheduleKey,
				mobile: this.userInfo.phoneNumber,
				ticketList: array,
				ifCdkeyPay: that.ifCdkeyPay,
				Ids: that.couponArray
			}).then(res => {
				if (res.flag) {
					that.$isPreviewApi =  false
					uni.hideLoading();
					/* uni.showToast({
						icon: 'none',
						title: res.msg
					}) */
					that.jump('/pages/index/wallet', res.data);
				} else {
					uni.showToast({
						icon: 'none',
						title: res.msg
					});
				}
			});
		}, //余额购买
		blanBuy(confirmParam) {
			let ticketList = [];
			let that = this;
			uni.showLoading({ title: '出票中~~为了避免购票失败，请勿退出！' });
			if (that.userInfo.phoneNumber) {
				that.isSubOrder = true;
				let params = {
					ticketId: that.perGoodsList.ticketId,
					qty: that.ticketPaymoney + '',
					custId: that.balInfo.custId,
					phoneNumber: that.userInfo.phoneNumber
				};
				this.$api('user.deduction', params).then(res => {
					if (res.flag) {
						that.confirmOrder(confirmParam);
					} else {
						uni.showToast({
							icon: 'none',
							title: res.msg
						});
					}
				});
			} else {
				uni.showToast({
					icon: 'none',
					title: '手机号码为必填项'
				});
			}
		},
		// 订单信息
		getPre() {
			let that = this;
			let res = goods;
			if (res.code === 1) {
				that.orderPre = res.data;
				that.perGoodsList = res.data.data;
				that.perGoodsList.map(item => {
					item.selType = item.dispatch_type;
					that.goodsList.forEach(goods => {
						if (item.goods_id == goods.goods_id && item.sku_price_id == goods.sku_price_id) {
							goods.dispatch_type = item.dispatch_type;
							if (item.store_id) {
								goods.store_id = item.store_id;
							}
						}
					});
				});
			}
			/* that.$api('order.pre', {
				goods_list: that.goodsList,
				from: that.from,
				address_id: that.addressId,
				coupons_id: that.couponId,
				order_type: that.orderType,
				buy_type: that.grouponBuyType,
				groupon_id: that.grouponId
			}).then(res => {
				if (res.code === 1) {
					that.orderPre = res.data;
					that.perGoodsList = res.data.new_goods_list
					that.perGoodsList.map(item =>{
						item.selType = item.dispatch_type;
						that.goodsList.forEach(goods =>{
							if(item.goods_id == goods.goods_id && item.sku_price_id == goods.sku_price_id){
								goods.dispatch_type = item.dispatch_type;
								
								if(item.store_id){
									goods.store_id = item.store_id;
								}
							}
						})
					})
				}
			}); */
		},
		// 可用优惠券
		getCoupons() {
			let that = this;
			let res = prompt;
			if (res.code === 1) {
				that.pickerData.couponList = res.data;
			}
			/* that.$api('order.coupons', {
				goods_list: that.goodsList,
				from: that.from,
				address_id: that.addressId,
				coupons_id: that.couponId,
				order_type: that.orderType
			}).then(res => {
				if (res.code === 1) {
					that.pickerData.couponList = res.data;
				}
			}); */
		}, // 可用团体票
		getGroupCoupons() {
			let that = this;
			that.$api('coupons.list', {
				couponType: 0,
				openId: uni.getStorageSync('openid'),
				status: 0
			}).then(res => {
				if (res.flag) {
					that.groupCouponsList = res.data;
				}
			});
		},
		// 选择优惠券
		selCoupon() {
			if (this.groupCouponsList.length) {
				this.showExpressType = true;
			} else {
				this.$tools.toast('暂无优惠券');
			}
		},
		changeCoupon(index) {
			if (index >= 0) {
				this.couponId = this.pickerData.couponList[index].user_coupons_id;
				this.pickerData.title = '-￥' + this.pickerData.couponList[index].amount;
				this.getPre();
			} else {
				this.couponId = 0;
				this.pickerData.title = '选择优惠券';
				this.getPre();
			}
		},
		//计算优惠
		calculateBenefits(val){
			let that = this
			let countPrice = 0;
		val.forEach(item => {
			that.groupCouponsList.forEach((items, index) => {
				if (item == items.id) {
					if (that.payType == 'wallet') {
						if (items.couponId == '2') {
							countPrice += Number(that.perGoodsList.schedule.settleprice);
						} else {
							countPrice += Number(that.perGoodsList.schedule.settleprice);
							countPrice = countPrice - Number(that.hallImbalance);
						}
					} else {
						if (items.couponId == '2') {
							countPrice += Number(that.perGoodsList.schedule.standardprice);
						} else {
							countPrice += Number(that.perGoodsList.schedule.standardprice);
							countPrice = countPrice - Number(that.hallImbalance);
						}
					}
				}
			});
		});
		if (that.payType == 'wallet') {
			this.ticketPaymoney = Number(that.perGoodsList.schedule.settleprice) * Number(that.perGoodsList.seats.length) - countPrice;
		} else {
			this.ticketPaymoney = Number(that.perGoodsList.schedule.standardprice) * Number(that.perGoodsList.seats.length) - countPrice;
		}
		this.pickerData.title = '-￥' + countPrice;
		this.preferentialAmount = countPrice
		},
		changeCouponGroup(val) {
			let that = this;
			if (val.length > 0) {
				this.couponArray = val;
				that.calculateBenefits(val)
			} else {
				this.couponArray = [];
				that.calculateBenefits(val)
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
	margin: 20rpx;
	.pay-item {
		height: 90rpx;
		padding: 0 30rpx;
		font-size: 26rpx;
		background: #fff;
		width: 710rpx;
		border-bottom: 1rpx solid #eeeeee;
		&:last-child {
			border-bottom: none;
		}

		.pay-radio {
			transform: scale(0.8);
		}

		.pay-img {
			width: 40rpx;
			height: 40rpx;
			// background: #ccc;
			margin-right: 25rpx;
		}
	}
}
// 商品卡片
.goods-list {
	background: #fff;
	position: relative;
	margin: 20rpx;
	border-radius: 15rpx;
	box-shadow: 1px 1px 1px #c0c0c0;
	/deep/ .goods-title {
		width: 460rpx !important;
	}
	.goods-card {
		padding: 30rpx;
	}
	.goods-price {
		font-size: 30rpx;
		font-weight: 500;
		width: 480rpx;
		.goods-num {
			padding-left: 10rpx;
			width: 80%;
			float: left;
			font-size: 28rpx;
			color: #c4c4c4;
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
	height: 100rpx;
	background: #fff;
	padding: 0 25rpx;

	.item-title {
		font-size: 28rpx;
		margin-right: 20rpx;
	}

	.detail {
		font-size: 28rpx;
		color: #333;
	}

	.price {
		font-size: 26rpx;
		color: #e1212b;
		margin-right: 20rpx;
	}
	.sel-coupon {
		font-size: 26rpx;
		color: #c4c4c4;
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
	margin: 20rpx;
	border-radius: 15rpx;
	box-shadow: 1px 1px 1px #c0c0c0;
}
.notice {
	margin: 20rpx;
	border-radius: 15rpx;
	box-shadow: 1px 1px 1px #c0c0c0;
	background: #fff;
	padding: 0 25rpx;
	display: inline-block;
	.notice-title {
		height: 80rpx;
		line-height: 80rpx;
		font-size: 35rpx;
		font-weight: bold;
		border-bottom: 1px solid #eeeed1;
	}
	.notice-detail {
		padding-top: 10rpx;
		view {
			line-height: 50rpx;
		}
	}
}
.border-top {
	border-top: 1rpx solid rgba(#dfdfdf, 0.5);
}

.foot_box {
	height: 100rpx;
	padding: 0 25rpx;
	justify-content: flex-end;
	background-color: #fff;

	.num {
		font-size: 26rpx;
		color: #999;
	}

	.all-money {
		margin: 0 60rpx 0 20rpx;

		.price {
			color: #e1212b;
		}
	}

	.sub-btn {
		width: 210rpx;
		height: 70rpx;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
		border-radius: 35rpx;
		font-size: 28rpx;
		color: #fff;
	}
}
// 弹窗之配送方式
// 配送方式
.express-type {
	width: 750rpx;
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	height: 700rpx;
	overflow: visible;
	.express-type__head {
		width: 100%;
		height: 74rpx;
		background: #f8e3bd;
		@include flex($align: center);
		border-radius: 20rpx 20rpx 0 0;
		&-nav {
			width: (750rpx/4);
			@include flex($align: center, $justify: center);
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
			color: #a8700d;
			font-size: 26rpx;
		}
	}
	.express-type__content {
		.empty-address {
			height: 120rpx;
			padding: 0 25rpx;
			@include flex($justify: null, $align: center, $direction: null, $warp: null, $warpAlign: null);
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
		// 快递
		.express-address {
			position: relative;
			padding: 30rpx 25rpx;
			background: url('http://shopro.7wpp.com/imgs/address_bg.png') no-repeat;
			background-size: 430rpx 300rpx;
			background-position: top right;
			.express-top {
				margin-bottom: 20rpx;
				width: 550rpx;
				text-align: left;
				.address {
					font-size: 28rpx;
					font-family: PingFang SC;
					font-weight: 500;
					color: rgba(51, 51, 51, 1);
					line-height: 40rpx;
					text-align: left;
				}
				.dispatch-notice {
					font-size: 28rpx;
					font-family: PingFang SC;
					font-weight: 500;
					color: rgba(51, 51, 51, 1);
					line-height: 40rpx;
					text-align: left;
				}
				.address-location {
					@include flex($justify: center, $align: center, $direction: column, $warp: null, $warpAlign: null);
					position: absolute;
					right: 60rpx;
					top: 30rpx;
					.location-img {
						width: 80rpx;
						height: 90rpx;
					}
					.location-text {
						font-size: 18rpx;
						font-family: PingFang SC;
						font-weight: 500;
						color: rgba(51, 51, 51, 1);
					}
				}
				.tag {
					background: rgba(233, 191, 113, 0.2);
					border-radius: 6rpx;
					padding: 0 16rpx;
					line-height: 38rpx;
					color: #a8700d;
					font-size: 22rpx;
					margin-right: 20rpx;
				}
				.tag1 {
					background: rgba(53, 190, 105, 0.2);
					border-radius: 6rpx;
					padding: 0 16rpx;
					line-height: 38rpx;
					color: #1bbc50;
					font-size: 22rpx;
					margin-right: 20rpx;
				}
				.address-guide {
					position: absolute;
					right: 25rpx;
					top: 40rpx;
					color: #999999;
				}
			}

			.express-content {
				@include flex($justify: null, $align: center, $direction: null, $warp: null, $warpAlign: null);
				margin-bottom: 20rpx;
				.box-line {
					width: 1rpx;
					height: 61rpx;
					border-left: 1rpx solid rgba(238, 238, 238, 1);
					margin: 0 40rpx;
				}
				.phone-box1 {
					.name,
					.phone {
						font-size: 26rpx;
						font-family: PingFang SC;
						font-weight: 400;
						color: rgba(102, 102, 102, 1);
					}

					.phone {
						margin-left: 20rpx;
					}
				}
				.time-box,
				.phone-box {
					text-align: left;
					.box-title {
						font-size: 24rpx;
						font-family: PingFang SC;
						font-weight: 400;
						color: #666;
						padding-bottom: 10rpx;
					}
					.box-text {
						font-size: 24rpx;
						font-family: PingFang SC;
						font-weight: 500;
						color: #333;
					}
					.edit-phone {
						width: 160rpx;
						font-size: 24rpx;
						font-family: PingFang SC;
						font-weight: 500;
						color: #333;
					}
					.box-icon {
						font-size: 28rpx;
						color: #999;
						display: inline-block;
						width: 40rpx;
						text-align: center;
						line-height: 40rpx;
					}
				}
			}
			.express-bottom {
				.protocol-checkbox {
					transform: scale(0.7);
				}
				.protocol {
					font-size: 24rpx;
					font-family: PingFang SC;
					font-weight: 400;
					color: rgba(102, 102, 102, 1);
					.protocol-text {
						color: #6487a4;
					}
				}
			}
		}
	}
	.express-type__bottom {
		height: 90rpx;
		padding: 0 30rpx;
		.cancel-btn {
			width: 335rpx;
			height: 74rpx;
			background: rgba(238, 238, 238, 1);
			border-radius: 37rpx;
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(51, 51, 51, 1);
		}
		.save-btn {
			width: 335rpx;
			height: 74rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			border-radius: 37rpx;
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(255, 255, 255, 1);
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
		@include flex($justify: between, $align: center, $direction: null, $warp: null, $warpAlign: null);
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
	width: 750rpx;
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	height: 700rpx;
	overflow: visible;
	.express-type__head {
		width: 100%;
		height: 74rpx;
		background: #f8e3bd;
		@include flex($align: center);
		border-radius: 20rpx 20rpx 0 0;
		&-nav {
			width: (750rpx/4);
			@include flex($align: center, $justify: center);
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
			color: #a8700d;
			font-size: 26rpx;
		}
	}
	.express-type__content {
		.empty-address {
			height: 120rpx;
			padding: 0 25rpx;
			@include flex($justify: null, $align: center, $direction: null, $warp: null, $warpAlign: null);
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
		// 快递
		.express-address {
			position: relative;
			padding: 30rpx 25rpx;
			background: url('http://shopro.7wpp.com/imgs/address_bg.png') no-repeat;
			background-size: 430rpx 300rpx;
			background-position: top right;
			.express-top {
				margin-bottom: 20rpx;
				width: 550rpx;
				text-align: left;
				.address {
					font-size: 28rpx;
					font-family: PingFang SC;
					font-weight: 500;
					color: rgba(51, 51, 51, 1);
					line-height: 40rpx;
					text-align: left;
				}
				.dispatch-notice {
					font-size: 28rpx;
					font-family: PingFang SC;
					font-weight: 500;
					color: rgba(51, 51, 51, 1);
					line-height: 40rpx;
					text-align: left;
				}
				.address-location {
					@include flex($justify: center, $align: center, $direction: column, $warp: null, $warpAlign: null);
					position: absolute;
					right: 60rpx;
					top: 30rpx;
					.location-img {
						width: 80rpx;
						height: 90rpx;
					}
					.location-text {
						font-size: 18rpx;
						font-family: PingFang SC;
						font-weight: 500;
						color: rgba(51, 51, 51, 1);
					}
				}
				.tag {
					background: rgba(233, 191, 113, 0.2);
					border-radius: 6rpx;
					padding: 0 16rpx;
					line-height: 38rpx;
					color: #a8700d;
					font-size: 22rpx;
					margin-right: 20rpx;
				}
				.tag1 {
					background: rgba(53, 190, 105, 0.2);
					border-radius: 6rpx;
					padding: 0 16rpx;
					line-height: 38rpx;
					color: #1bbc50;
					font-size: 22rpx;
					margin-right: 20rpx;
				}
				.address-guide {
					position: absolute;
					right: 25rpx;
					top: 40rpx;
					color: #999999;
				}
			}

			.express-content {
				@include flex($justify: null, $align: center, $direction: null, $warp: null, $warpAlign: null);
				margin-bottom: 20rpx;
				.box-line {
					width: 1rpx;
					height: 61rpx;
					border-left: 1rpx solid rgba(238, 238, 238, 1);
					margin: 0 40rpx;
				}
				.phone-box1 {
					.name,
					.phone {
						font-size: 26rpx;
						font-family: PingFang SC;
						font-weight: 400;
						color: rgba(102, 102, 102, 1);
					}

					.phone {
						margin-left: 20rpx;
					}
				}
				.time-box,
				.phone-box {
					text-align: left;
					.box-title {
						font-size: 24rpx;
						font-family: PingFang SC;
						font-weight: 400;
						color: #666;
						padding-bottom: 10rpx;
					}
					.box-text {
						font-size: 24rpx;
						font-family: PingFang SC;
						font-weight: 500;
						color: #333;
					}
					.edit-phone {
						width: 160rpx;
						font-size: 24rpx;
						font-family: PingFang SC;
						font-weight: 500;
						color: #333;
					}
					.box-icon {
						font-size: 28rpx;
						color: #999;
						display: inline-block;
						width: 40rpx;
						text-align: center;
						line-height: 40rpx;
					}
				}
			}
			.express-bottom {
				.protocol-checkbox {
					transform: scale(0.7);
				}
				.protocol {
					font-size: 24rpx;
					font-family: PingFang SC;
					font-weight: 400;
					color: rgba(102, 102, 102, 1);
					.protocol-text {
						color: #6487a4;
					}
				}
			}
		}
	}
	.express-type__bottom {
		height: 90rpx;
		padding: 0 30rpx;
		.cancel-btn {
			width: 335rpx;
			height: 74rpx;
			background: rgba(238, 238, 238, 1);
			border-radius: 37rpx;
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(51, 51, 51, 1);
		}
		.save-btn {
			width: 335rpx;
			height: 74rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			border-radius: 37rpx;
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(255, 255, 255, 1);
		}
	}
}
</style>

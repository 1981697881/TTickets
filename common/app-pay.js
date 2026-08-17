import api from '@/common/request/index'
import store from '@/common/store'
import tools from '@/common/utils/tools'
// #ifdef H5
import wxsdk from '@/common/wechat/sdk'
import Wechat from '@/common/wechat/wechat'
// #endif
import Router from '@/common/router';
import globalState from '@/common/runtime/globals'
import {
	mapMutations,
	mapActions,
	mapState
} from 'vuex';

export default class AppPay {


	//						wxOfficialAccount			wxMiniProgram			App						H5
	// 			wechat			公众号JSSDK支付				小程序支付			微信开放平台支付			H5网页支付
	//			alipay			复制网址						复制网址				支付宝开放平台支付		    直接跳转链接
	// 			wallet			v							v					v						v


	constructor(payment, order, url = "pay.prepay", params, reType = 0, confirmParam = {}, couponArray = [], couponId) {
		this.payment = payment;
		this.order = order;
		this.reType = reType;
		this.couponArray = couponArray;
		this.couponId = couponId;
		this.confirmParam = confirmParam;
		this.url = url || "pay.prepay";
		this.params = params
		this.platform = uni.getStorageSync('platform');
		let payMehod = this.getPayMethod();
		payMehod();

	}

	getPayMethod() {
		var payMethod = {
			'wxOfficialAccount': {
				'wechat': () => {
					this.wxOfficialAccountPay()
				},
				'alipay': () => {
					this.copyPayLink()
				},
				'wallet': () => {
					this.walletPay()
				}
			},
			'wxMiniProgram': {
				'wechat': () => {
					this.wxMiniProgramPay()
				},
				'alipay': () => {
					this.copyPayLink()
				},
				'wallet': () => {
					this.walletPay()
				}
			},
			'App': {
				'wechat': () => {
					this.wechatPay()
				},
				'alipay': () => {
					this.aliPay()
				},
				'wallet': () => {
					this.walletPay()
				},
			},
			'H5': {
				'wechat': () => {
					this.wechatWapPay()
				},
				'alipay': () => {
					this.goToPayLink()
				},
				'wallet': () => {
					this.walletPay()
				},
			},
		}
		console.log(this.platform)
		return payMethod[this.platform][this.payment];
	}



	prepay() {
		uni.showLoading({
			title: '支付中',
			mask: true
		});
		return new Promise((resolve, reject) => {
			const that = this;

			if (uni.getStorageSync('openid')) {
				that.params.openId = uni.getStorageSync('openid');
			}
			api(that.url, that.params).then(res => {
				if (res.flag) {
					if (res.data === 'no_openid') {
						uni.hideLoading();
						uni.showModal({
							title: '微信支付',
							content: '点击确定后请再次使用微信支付',
							success: function(modalRes) {
								if (modalRes.confirm) {
									//静默获取openid
									let wechat = new Wechat();
									wechat.wxOfficialAccountBaseLogin();
								}
								reject(new Error('no_openid'));
							},
							fail: () => {
								reject(new Error('no_openid'));
							}
						});
					} else {
						uni.hideLoading();
						resolve(res);
					}
				} else {
					uni.hideLoading();
					uni.showToast({
						title: res.msg || '支付失败',
						icon: 'none'
					});
					reject(res || new Error('prepay_failed'));
				}
			}).catch(err => {
				uni.hideLoading();
				uni.showToast({
					title: '支付请求失败，请重试',
					icon: 'none'
				});
				reject(err);
			});
		});
	}



	async wxOfficialAccountPay() {
		let that = this;
		try {
			let result = await this.prepay();
			wxsdk.wxpay(result.data, (res) => {
				if (res.errMsg == "chooseWXPay:ok") {
					Router.replace({
						path: '/pages/order/payment/result',
						query: {
							orderSn: that.order.order_sn,
							type: that.payment,
							pay: 1
						}
					});
				} else if (res.errMsg === 'chooseWXPay:cancel') {
					//取消支付

				} else {
					Router.replace({
						path: '/pages/order/payment/result',
						query: {
							orderSn: that.order.order_sn,
							type: that.payment,
							pay: 0
						}
					});
				}
			});
		} catch (e) {
			// prepay 失败已 toast，页面 onShow 会复位按钮
		}
	}
	//

	async wechatWapPay() {
		let that = this;
		try {
			let result = await this.prepay();
			if (result.code === 1) {
				var url = result.data.pay_data.match(/url\=\'(\S*)\'/);
				let reg = new RegExp('&amp;', 'g') //g代表全部
				let newUrl = url[1].replace(reg, '&');
				let domain = uni.getStorageSync('sysInfo').domain; //域名需要https
				let params = encodeURIComponent(
					`${domain}/pages/order/payment/result?orderSn=${that.order.order_sn}&type=${that.payment}&pay=1`
					)
				window.location.href = newUrl + '&redirect_url=' + params;
			}
		} catch (e) {}
	}

	async wxMiniProgramPay() {
		let that = this;
		let result;
		try {
			result = await this.prepay();
		} catch (e) {
			globalState.isPreviewApi = false;
			return;
		}
		let payData = result.data;
		globalState.isPreviewApi = true
		uni.requestPayment({
			provider: 'wxpay',
			timeStamp: payData.timeStamp,
			nonceStr: payData.nonceStr,
			package: payData.package,
			signType: payData.signType,
			paySign: payData.paySign,
			success: function(res) {
				let orderResult
				if (that.reType == 1) {
					orderResult = {
						...that.order
					};
					orderResult.schedule = JSON.stringify(orderResult.schedule)
					orderResult.seats = JSON.stringify(orderResult.seats)
					orderResult.locationHall = JSON.stringify(orderResult.locationHall)
				} else {
					orderResult = {
						...that.order
					};
				}
				uni.$off('escLoack')
				if (that.reType == 1) {
					/* let ticketList = []
					that.order.seats.forEach((item)=>{
						let obj = {}
						obj.seatId = item.seatId
						obj.ticketFee = item.ticketfee
						obj.ticketPrice = item.standardprice
						ticketList.push(obj)
					}) */
					api('cinema.confirmOrder', {
						lockOrderId: that.order.lockOrderId,
						scheduleId: that.order.scheduleId,
						scheduleKey: that.order.scheduleKey,
						mobile: store.state.user.userInfo.phoneNumber,
						ticketList: that.confirmParam,
						Ids: that.couponArray,
						couponId: that.couponId,
						ifCdkeyPay: false,
					}).then(rescin => {
						if (rescin.flag) {
							globalState.isPreviewApi = false
							Router.replace({
								path: '/pages/order/payment/result',
								query: {
									orderSn: orderResult,
									params: that.params,
									url: that.url,
									type: that.payment,
									pay: 1,
									reType: that.reType
								}
							});
						} else {
							uni.showToast({
								icon: 'none',
								title: rescin.msg
							})
						}
					});
				} else if (that.reType == 2) {
					api('goods.veCoin', {
						qty: that.order.coinCount,
						custId: store.state.user.balInfo.custId,
						placeId: store.state.user.storeInfo.v8PlaceId,	
						V8Url: store.state.user.storeInfo.v8Url,
						storeId: store.state.user.storeInfo.id,
						phoneNumber: store.state.user.userInfo.phoneNumber
					}).then(resve => {
						if (resve.flag) {
							api('goods.veIntegral', {
								qty: that.order.integral,
								custId: store.state.user.balInfo.custId,
								placeId: store.state.user.storeInfo.v8PlaceId,
								V8Url: store.state.user.storeInfo.v8Url,
								storeId: store.state.user.storeInfo.id,
								phoneNumber: store.state.user.userInfo.phoneNumber
							}).then(resal => {
								if (resal.flag) {
									store.dispatch('getUserBalance')
									uni.showToast({
										title: '购买成功',
										icon: 'success',
										duration: 2000,
										mask: true,
										success: function() {
											setTimeout(function() {
												uni.switchTab({
													url: '/pages/index/videoGame',
												})
											}, 2000);
										}
									});
								}
							});
						}
					});

				} else if (that.reType == 3) {
					api('user.recharge', {
						custId: store.state.user.balInfo.custId,
						qty: that.params.rechargeMoney,
						placeId: store.state.user.storeInfo.v8PlaceId,
						storeId: store.state.user.storeInfo.id,
						V8Url: store.state.user.storeInfo.v8Url,
						phoneNumber: store.state.user.userInfo.phoneNumber,
					}).then(resch => {
						if (resch.flag) {
							uni.showToast({
								icon: 'none',
								title: '充值成功'
							})
							store.dispatch('getUserBalance')
						} else {
							uni.showToast({
								icon: 'none',
								title: resch.msg
							})
						}
					});

				} else if (that.reType == 4) {
					that.confirmParam.orderNo = payData.outTradeNo
					api('goods.depositMixPackage', that.confirmParam).then(rescin => {
						if (rescin.flag) {
							globalState.isPreviewApi = false
							Router.replace({
								path: '/pages/order/payment/result',
								query: {
									orderSn: orderResult,
									params: that.params,
									url: that.url,
									type: that.payment,
									pay: 1,
									reType: that.reType
								}
							});
						} else {
							uni.showToast({
								icon: 'none',
								title: rescin.msg
							})
						}
					});

				} else {
					Router.replace({
						path: '/pages/order/payment/result',
						query: {
							orderSn: orderResult,
							params: that.params,
							url: that.url,
							type: that.payment,
							pay: 1,
							reType: that.reType
						}
					});
				}

			},
			fail: function(err) {
				console.log(err)
				if (err.errMsg !== "requestPayment:fail cancel") {
					Router.replace({
						path: '/pages/order/payment/result',
						query: {
							orderSn: that.order,
							params: that.params,
							url: that.url,
							type: that.payment,
							pay: 0
						}
					});
				} else {
					console.log('关闭支付')
					globalState.isPreviewApi = false
				}
			}
		});
	}

	async walletPay() {
		let that = this;
		try {
			let result = await this.prepay();
			if (result.code === 1) {
				Router.replace({
					path: '/pages/order/payment/result',
					query: {
						orderSn: that.order.order_sn,
						type: that.payment,
						pay: 1
					}
				});
			}
		} catch (e) {}
	}

	async copyPayLink() {
		let that = this;
		try {
			let result = await this.prepay();
			if (result.code === 1) {
			//引入showModal 点击确认 复制链接；
			uni.showModal({
				title: '支付宝支付',
				content: '复制链接到外部浏览器',
				confirmText: '复制链接',
				success: (res) => {
					if (res.confirm) {
						uni.setClipboardData({
							data: result.data.pay_data,
							success: function(data) {
								//#ifdef H5
								tools.toast('已复制到剪切板');
								//#endif
							},
							fail: function(err) {},
							complete: function(res) {}
						});

					} else if (res.cancel) {

					}
				}
			})
			}
		} catch (e) {}
	}

	async goToPayLink() {
		let that = this;
		try {
			let result = await this.prepay();
			if (result.code === 1) {
				window.location = result.data.pay_data;
			}
		} catch (e) {}
	}

	async aliPay() {
		let that = this;
		try {
			let result = await this.prepay();
			if (result.code === 1) {
				uni.requestPayment({
					provider: 'alipay',
					orderInfo: result.data.pay_data, //支付宝订单数据
					success: function(res) {
						Router.replace({
							path: '/pages/order/payment/result',
							query: {
								orderSn: that.order.order_sn,
								type: that.payment,
								pay: 1
							}
						});
					},
					fail: function(err) {
						if (err.errMsg !== "requestPayment:fail cancel") {
							Router.replace({
								path: '/pages/order/payment/result',
								query: {
									orderSn: that.order.order_sn,
									type: that.payment,
									pay: 0
								}
							});
						}
					}
				});
			}
		} catch (e) {}
	}

	async wechatPay() {
		let that = this;
		try {
			let result = await this.prepay();
			if (result.code === 1) {
				uni.requestPayment({
					provider: 'wxpay',
					orderInfo: JSON.parse(result.data.pay_data), //微信订单数据(官方说是string。实测为object)
					success: function(res) {
						Router.replace({
							path: '/pages/order/payment/result',
							query: {
								orderSn: that.order.order_sn,
								type: that.payment,
								pay: 1
							}
						});
					},
					fail: function(err) {
						if (err.errMsg !== "requestPayment:fail cancel") {
							Router.replace({
								path: '/pages/order/payment/result',
								query: {
									orderSn: that.order.order_sn,
									type: that.payment,
									pay: 0
								}
							});
						}
					}
				});
			}
		} catch (e) {}
	}

}

// 用户数据模块
import api from '@/common/request/index'
import store from '@/common/store'
import router from '@/common/router.js'
import tools from '@/common/utils/tools'
import { normalizeAuthToken } from '@/common/mixins/login-refresh.js'
import { isAuthDeniedPayload, promptLogin } from '@/common/utils/auth.js'

import {
	USER_INFO,
	LOGIN_TIP,
	BAL_INFO,
	ORDER_NUMBER,
	MESSAGE_IDS,
	STORE_INFO,
	OUT_LOGIN,
	// #ifdef MP-WEIXIN
	FORCE_OAUTH,
	// #endif
} from '../types.js'
const state = {
	userInfo: uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo') : {},
	showLoginTip: false,
	orderNum: {},
	balInfo: uni.getStorageSync('balInfo') || {},
	storeInfo: uni.getStorageSync('storeInfo') || {},
	// #ifdef MP-WEIXIN
	forceOauth: false,
	// #endif
	messageIds: {}, //小程序订阅消息模板ids

}

const actions = {
	//设置token并返回上次页面；同页授权时只发 login-success 刷新，不强制跳转
	async setTokenAndBack({
		commit
	}, tokenPayload) {
		const token = normalizeAuthToken(tokenPayload);
		if (!token) {
			uni.showToast({ icon: 'none', title: '登录凭证异常，请重试' });
			return;
		}
		uni.setStorageSync('token', token);
		commit('LOGIN_TIP', false);
		// #ifdef MP-WEIXIN
		commit('FORCE_OAUTH', false);
		uni.showTabBar();
		// #endif
		try {
			await store.dispatch('getUserDetails');
			await store.dispatch('getUserBalance').catch(() => undefined);
		} catch (e) {
			// 详情失败不阻断；页面仍可凭 token 继续
		}
		uni.$emit('login-success', { token });

		const fromLogin = uni.getStorageSync('fromLogin');
		if (fromLogin && fromLogin.path) {
			uni.removeStorageSync('fromLogin');
			// 同路径授权：留在当前页，交给 login-success / onShow 刷新
			try {
				const pages = getCurrentPages();
				const cur = pages && pages.length ? pages[pages.length - 1] : null;
				const curRoute = cur && cur.route ? `/${cur.route}` : '';
				const target = String(fromLogin.path || '').split('?')[0];
				if (curRoute && target && (curRoute === target || curRoute.endsWith(target.replace(/^\//, '')))) {
					return;
				}
			} catch (e) {}
			tools.routerTo(fromLogin.path, fromLogin.query, true);
			return;
		}
		// 登录页完成登录且无回跳地址 → 回首页；弹窗授权则留在当前页
		try {
			const pages = getCurrentPages();
			const cur = pages && pages.length ? pages[pages.length - 1] : null;
			const route = cur && cur.route ? String(cur.route) : '';
			if (route.includes('public/login')) {
				router.replaceAll('/pages/index/index');
			}
		} catch (e) {}
	},

	// 获取用户信息
	getUserInfo({
		commit
	}) {
		return new Promise((resolve, reject) => {
			api('user.info').then(res => {
				store.dispatch('getCartList')
				commit('LOGIN_TIP', false);
				commit('USER_INFO', res.data);
				uni.setStorageSync('userInfo', res.data);
				store.dispatch('getOrderNum');
				//添加推广记录
				let share_id = uni.getStorageSync('share_id');
				let url = uni.getStorageSync('url');
				let shareParams = {};
				// if(share_id && res.data.id >share_id) {
				if (share_id) {
					shareParams.share_id = share_id;
					shareParams.url = url;
					api('share.add', shareParams).then(res => {
						if (res.code === 1) {
							uni.removeStorageSync('share_id');
							uni.removeStorageSync('url');
						}
					})
				}
				resolve(res)

			}).catch(e => {
				reject(e)
			})
		})
	},
	// 获取用户信息-普通
	getUserDetails({
		commit
	}) {
		return new Promise((resolve, reject) => {
			api('user.member',{openId: uni.getStorageSync('openid')}).then(res => {
				if(res.flag){
					commit('LOGIN_TIP', false);
					commit('USER_INFO', res.data);
					uni.setStorageSync('userInfo', res.data);
				}else{
					if (isAuthDeniedPayload(res) || !uni.getStorageSync('token')) {
						promptLogin();
					}
				}
				resolve(res)
			}).catch(e => {
				reject(e)
			})
		})
	},// 获取用户余额
	getUserBalance({
		commit,
		state
	}) {
		return new Promise((resolve, reject) => {
			const storeInfo = state.storeInfo || {};
			const userInfo = state.userInfo || {};
			// 无门店 / 未登录时不打接口，也不清空本地余额缓存（真机重编译后避免「像未授权」）
			if (!uni.getStorageSync('token')) {
				resolve({ flag: false, message: 'no token' });
				return;
			}
			if (!storeInfo.v8PlaceId || !storeInfo.v8Url) {
				const cached = uni.getStorageSync('storeInfo');
				if (cached && cached.v8PlaceId && cached.v8Url) {
					commit('STORE_INFO', cached);
				} else {
					resolve({ flag: false, message: 'no store' });
					return;
				}
			}
			const latestStore = state.storeInfo || {};
			api('user.balance2', {
				placeId: latestStore.v8PlaceId,
				V8Url: latestStore.v8Url,
				WechatId: userInfo.wechatId,
				PublicOpenID: userInfo.publicOpenId
			}).then(res => {
				if (res.flag) {
					const balInfo = res.data?.[0] || {};
					commit('BAL_INFO', balInfo);
					uni.setStorageSync('balInfo', balInfo);
				} else {
					commit('BAL_INFO', {});
					uni.setStorageSync('balInfo', {});
				}
				resolve(res);
			}).catch(e => {
				// 网络失败保留缓存余额，避免整页像未登录
				reject(e);
			});
		});
	},
	// 订单信息
	getOrderNum({
		commit
	}) {
		return new Promise((resolve, reject) => {
			api('order.statusNum').then(res => {
				commit('ORDER_NUMBER', res.data);
				resolve(res)
			}).catch(e => {
				reject(e)
			})
		})
	},
	// 获取订阅消息模板ids;
	getMessageIds({
		commit
	}, type) {
		return new Promise((resolve, reject) => {
			api('messageIds').then(res => {
				commit('MESSAGE_IDS', res.data);
				let typeName = []; //模板键
				let obj = res.data; //模板对象
				let arr = []; //模板ids
				switch (type) {
					case 'result': //支付成功后
						typeName = ['order_sended']
						break;
					case 'grouponResult': //拼团支付成功后
						typeName = ['groupon_success', 'groupon_fail', 'order_sended']
						break;
					case 'aftersale': //点击售后
						typeName = ['refund_agree', 'aftersale_change', 'wallet_change']
						break;
					case 'wallet': //提现提醒
						typeName = ['score_change', 'wallet_apply', 'wallet_change']
						break;
					case 'store': //门店新订单通知
						typeName = ['store_order_new']
						break;
					default:
						typeName = []
						break;
				}
				typeName.forEach(item => {
					obj[item] && arr.push(obj[item])
				})
				arr.length && uni.requestSubscribeMessage({
					tmplIds: arr,
					success: (res) => {
						console.log(res);
					},
					fail: (err) => {
						console.log(err);
					}

				});
				resolve(res)
			}).catch(e => {
				reject(e)
			})
		})
	},
}

const mutations = {
	// 小程序订阅消息模板ids
	[MESSAGE_IDS](state, data) {
		state.messageIds = data
	},
	[USER_INFO](state, data) {
		state.userInfo = data
	},[BAL_INFO](state, data) {
		state.balInfo = data || {}
	},[STORE_INFO](state, data) {
		state.storeInfo = data || {}
		if (data && Object.keys(data).length) {
			uni.setStorageSync('storeInfo', data)
		} else {
			uni.removeStorageSync('storeInfo')
		}
	},
	[LOGIN_TIP](state, data) {
		state.showLoginTip = data
	},
	[ORDER_NUMBER](state, data) {
		state.orderNum = data
	},
	// #ifdef MP-WEIXIN
	[FORCE_OAUTH](state, data) {
		state.forceOauth = data
		data ? uni.hideTabBar() : uni.showTabBar();
	},
	// #endif

	[OUT_LOGIN](state, data) {
		uni.removeStorageSync('token');
		uni.removeStorageSync('session_key');
		uni.removeStorageSync('openid');
		uni.removeStorageSync('userInfo');
		// 门店/影院选择与登录无关，登出时保留，避免电影页授权后丢 cinemalinkId
		uni.removeStorageSync('cartNum');
		store.commit('USER_INFO', {});
		store.commit('CART_LIST', []);
		store.commit('CART_NUM');
		store.commit('ORDER_NUMBER', {});
	},

}

const getters = {

}

export default {
	state,
	mutations,
	actions,
	getters
}

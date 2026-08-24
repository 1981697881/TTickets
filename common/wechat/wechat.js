import api from '@/common/request/index'
import store from '@/common/store'
import router from '@/common/router'
import { attachLoginDebug, buildLoginDebug } from '@/common/utils/login-debug.js'
import {
	API_URL
} from '@/env'

// #ifdef MP-WEIXIN
const mpUpdateState = {
	inited: false,
	ready: false,
	showing: false,
	manager: null
};

function showMiniProgramUpdateModal() {
	if (!mpUpdateState.ready || mpUpdateState.showing || !mpUpdateState.manager) return;
	mpUpdateState.showing = true;
	uni.showModal({
		title: '更新提示',
		content: '新版本已经准备好，是否重启应用？',
		confirmText: '立即重启',
		cancelText: '稍后',
		success(res) {
			mpUpdateState.showing = false;
			if (res.confirm) {
				mpUpdateState.manager.applyUpdate();
			}
		},
		fail() {
			mpUpdateState.showing = false;
		}
	});
}

function initMiniProgramUpdateManager() {
	if (mpUpdateState.inited || !uni.canIUse('getUpdateManager')) return;
	mpUpdateState.inited = true;
	const updateManager = uni.getUpdateManager();
	mpUpdateState.manager = updateManager;

	// 监听必须立即注册；放在 onCheckForUpdate 里会偶发错过 onUpdateReady
	updateManager.onUpdateReady(() => {
		mpUpdateState.ready = true;
		showMiniProgramUpdateModal();
	});

	updateManager.onUpdateFailed(() => {
		uni.showModal({
			title: '更新提示',
			content: '新版本下载失败，请关闭小程序后重新打开；仍无法更新时可删除小程序再搜索进入。',
			showCancel: false
		});
	});
}
// #endif

export default class Wechat {
	async login() {
		let token = '';
		if (router.$Route.path.indexOf('public/login') == -1) {
			uni.setStorageSync('fromLogin', router.$Route);
		}
		// #ifdef MP-WEIXIN
		store.commit('FORCE_OAUTH', true);
		// #endif
		// #ifdef H5
		this.wxOfficialAccountLogin();
		// #endif
		// #ifdef APP-PLUS
		token = await this.wxOpenPlatformLogin();
		return token;
		// #endif
	}
	// #ifdef H5

	wxOfficialAccountLogin() {
		let oUrl = window.location.href;
		window.location = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + store.state.init.initData.wechat.appid +
			`&redirect_uri=${API_URL}user/wxOfficialAccountLogin&response_type=code&scope=snsapi_userinfo&state=` +
			oUrl;
		throw 'stop';
	}
	//临时登录获取OpenId 不入库不绑定用户
	wxOfficialAccountBaseLogin() {
		let oUrl = window.location.href;
		//首次进入 没有登录 保存
		window.location = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + store.state.init.initData.wechat.appid +
			`&redirect_uri=${API_URL}user/wxOfficialAccountBaseLogin&response_type=code&scope=snsapi_base&state=` +
			oUrl;
		throw 'stop';
	}
	// #endif

	wxOpenPlatformLogin() {
		let that = this;
		return new Promise((resolve, reject) => {
			uni.login({
				provider: 'weixin',
				success: function(loginRes) {
					if (loginRes.errMsg === "login:ok") {
						let authResult = loginRes.authResult;
						uni.getUserProfile({
							provider: 'weixin',
							success: function(infoRes) {
								if (infoRes.errMsg === "getUserProfile:ok") {
									let userInfo = infoRes.userInfo;
									api('user.wxOpenPlatformLogin', {
										authResult: authResult,
										userInfo: userInfo
									}).then(res => {
										if (res.code === 1) {
											resolve(res.data.token);
										}
									});
								}
							},
							fail: function(res) {
								api('dev.debug', {
									info: res
								})
							}
						});
					}
				},
				fail: function(res) {
					api('dev.debug', {
						info: res
					})
				}
			});
		});
	}

	// #ifdef MP-WEIXIN
	async _exchangeLoginCode(code, steps = []) {
		const request = { code };
		let res;
		try {
			res = await api('user.getWxMiniProgramSessionKey', { code });
		} catch (e) {
			throw attachLoginDebug(e, buildLoginDebug('memberAuthorize', {
				request,
				steps,
				raw: e
			}));
		}
		if (!res.flag || !res.data?.session_key) {
			throw attachLoginDebug(new Error(res.msg || '获取微信会话失败'), buildLoginDebug('memberAuthorize', {
				request,
				response: res,
				steps
			}));
		}
		uni.setStorageSync('session_key', res.data.session_key);
		if (res.data.openid) uni.setStorageSync('openid', res.data.openid);
		steps.push({ step: 'memberAuthorize', ok: true, openid: res.data.openid || '' });
		return res.data.session_key;
	}

	getWxMiniProgramSessionKey(options = {}) {
		return new Promise((resolve, reject) => {
			const login = () => {
				uni.login({
					success: info => {
						this._exchangeLoginCode(info.code).then(resolve).catch(reject);
					},
					fail: reject
				});
			};

			if (options.force) {
				login();
				return;
			}

			const sessionKey = uni.getStorageSync('session_key');
			if (!sessionKey) {
				login();
				return;
			}

			uni.checkSession({
				success: () => resolve(sessionKey),
				fail: login
			});
		});
	}

	async wxMiniProgramLogin(payload = {}, steps = []) {
		const sessionKey = uni.getStorageSync('session_key') || await this.getWxMiniProgramSessionKey();
		const openid = uni.getStorageSync('openid');
		// 新登录：仅依赖 openid/session；encryptedData 可选（兼容旧后台）
		const request = {
			sessionKey,
			openid,
			codeLogin: true,
			encryptedData: payload.encryptedData || '',
			iv: payload.iv || '',
			signature: payload.signature || '',
			rawData: payload.rawData || '',
			userInfo: payload.userInfo || null
		};
		let res;
		try {
			res = await api('user.wxMiniProgramLogin', request);
		} catch (err) {
			throw attachLoginDebug(err, buildLoginDebug('memberLogin', {
				request,
				profile: payload.userInfo || null,
				steps,
				raw: err
			}));
		}

		if (!res.flag) {
			throw attachLoginDebug(new Error(res.msg || '微信登录失败'), buildLoginDebug('memberLogin', {
				request,
				response: res,
				profile: payload.userInfo || null,
				steps
			}));
		}
		steps.push({ step: 'memberLogin', ok: true });
		const data = res.data;
		if (typeof data === 'string') return data;
		if (data && typeof data === 'object') {
			return data.token || data.accessToken || data.access_token || data;
		}
		return data;
	}

	/**
	 * 一次点击登录（与常见小程序一致）：uni.login → 换 session → memberLogin。
	 * 不再调 getUserProfile（该接口需用户手势且新版本几乎只返回「微信用户」）。
	 */
	async loginOnUserTap() {
		const steps = [];
		try {
			const code = await new Promise((resolve, reject) => {
				uni.login({
					success: res => {
						steps.push({ step: 'uni.login', ok: true, errMsg: res.errMsg });
						resolve(res.code);
					},
					fail: err => {
						reject(attachLoginDebug(
							new Error(err?.errMsg || '微信登录码获取失败'),
							buildLoginDebug('uni.login', { steps, raw: err })
						));
					}
				});
			});

			await this._exchangeLoginCode(code, steps);
			return await this.wxMiniProgramLogin({}, steps);
		} catch (error) {
			if (!error.loginDebug) {
				throw attachLoginDebug(error, buildLoginDebug('loginOnUserTap', { steps, raw: error }));
			}
			error.loginDebug.steps = steps;
			throw error;
		}
	}

	/** @deprecated 保留兼容；新流程请用 loginOnUserTap */
	async loginAfterUserProfile(profile) {
		const steps = [];

		if (profile && profile.errMsg === 'getUserProfile:ok') {
			steps.push({
				step: 'getUserProfile',
				ok: true,
				errMsg: profile.errMsg,
				nickName: profile.userInfo?.nickName
			});
			try {
				const code = await new Promise((resolve, reject) => {
					uni.login({
						success: res => {
							steps.push({ step: 'uni.login', ok: true, errMsg: res.errMsg });
							resolve(res.code);
						},
						fail: err => {
							reject(attachLoginDebug(
								new Error(err?.errMsg || '微信登录码获取失败'),
								buildLoginDebug('uni.login', { steps, raw: err })
							));
						}
					});
				});
				await this._exchangeLoginCode(code, steps);
				return await this.wxMiniProgramLogin(profile, steps);
			} catch (error) {
				if (!error.loginDebug) {
					throw attachLoginDebug(error, buildLoginDebug('loginAfterUserProfile', { steps, raw: error }));
				}
				error.loginDebug.steps = steps;
				throw error;
			}
		}

		return this.loginOnUserTap();
	}

	/** 小程序更新后本地 session/token 会过期，checkSession 仍可能成功 */
	resetSessionIfUpdated() {
		let stamp = '';
		try {
			const mp = typeof wx !== 'undefined' && wx.getAccountInfoSync
				? wx.getAccountInfoSync().miniProgram
				: {};
			stamp = `${mp.version || ''}|${mp.envVersion || ''}`;
		} catch (e) {
			stamp = '';
		}
		if (!stamp || stamp === '|') return;
		const prev = uni.getStorageSync('mp_release_stamp');
		if (prev && prev !== stamp) {
			uni.removeStorageSync('token');
			uni.removeStorageSync('session_key');
			uni.removeStorageSync('openid');
		}
		uni.setStorageSync('mp_release_stamp', stamp);
	}

	// 小程序更新：启动注册监听；回前台时若已下载完成则再弹一次
	checkMiniProgramUpdate() {
		initMiniProgramUpdateManager();
		if (mpUpdateState.ready) {
			showMiniProgramUpdateModal();
		}
	}
	// #endif


}

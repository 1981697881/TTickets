import api from '@/common/request/index'
import store from '@/common/store'
import router from '@/common/router'
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
	async _exchangeLoginCode(code) {
		const res = await api('user.getWxMiniProgramSessionKey', { code });
		if (!res.flag || !res.data?.session_key) {
			throw new Error(res.msg || '获取微信会话失败');
		}
		uni.setStorageSync('session_key', res.data.session_key);
		if (res.data.openid) uni.setStorageSync('openid', res.data.openid);
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

	async wxMiniProgramLogin(e) {
		if (e?.errMsg !== 'getUserProfile:ok') {
			throw new Error(e?.errMsg || '未获得微信用户授权');
		}

		const sessionKey = uni.getStorageSync('session_key') || await this.getWxMiniProgramSessionKey();
		const res = await api('user.wxMiniProgramLogin', {
			sessionKey,
			openid: uni.getStorageSync('openid'),
			encryptedData: e.encryptedData,
			iv: e.iv,
			signature: e.signature
		});

		if (!res.flag) throw new Error(res.msg || '微信登录失败');
		const data = res.data;
		if (typeof data === 'string') return data;
		if (data && typeof data === 'object') {
			return data.token || data.accessToken || data.access_token || data;
		}
		return data;
	}

	/** uni.login 后立刻调 getUserProfile，再换 session_key，避免手势失效和会话错位 */
	async loginWithUserProfile(getProfile) {
		const code = await new Promise((resolve, reject) => {
			uni.login({
				success: res => resolve(res.code),
				fail: err => reject(new Error(err?.errMsg || '微信登录码获取失败'))
			});
		});
		const profilePromise = getProfile();
		await this._exchangeLoginCode(code);
		const profile = await profilePromise;
		return this.wxMiniProgramLogin(profile);
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

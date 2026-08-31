import store from '@/common/store';
import { normalizeAuthToken } from '@/common/mixins/login-refresh.js';
import { isPrivacyDeniedError, promptPrivacyRetry } from '@/common/utils/privacy.js';
import { showLoginDebugModal } from '@/common/utils/login-debug.js';

let lastPromptAt = 0;

/** tabBar 页面路径（与 pages.json 保持一致，不含前导 /） */
const TAB_BAR_PATHS = [
	'pages/index/circuit',
	'pages/index/recharge',
	'pages/index/index',
	'pages/menu/menu',
	'pages/index/user'
];

function normalizeRoutePath(route) {
	return String(route || '').replace(/^\//, '');
}

/** 当前是否为 tabBar 页（非 tab 页调 hide/showTabBar 会报错） */
export function isTabBarPage() {
	try {
		const pages = getCurrentPages();
		const cur = pages && pages.length ? pages[pages.length - 1] : null;
		const route = normalizeRoutePath(cur && (cur.route || cur.$page?.fullPath));
		return TAB_BAR_PATHS.includes(route.split('?')[0]);
	} catch (e) {
		return false;
	}
}

export function safeHideTabBar(options = {}) {
	if (!isTabBarPage()) return;
	try {
		uni.hideTabBar({ animation: false, ...options, fail() {} });
	} catch (e) {}
}

export function safeShowTabBar(options = {}) {
	if (!isTabBarPage()) return;
	try {
		uni.showTabBar({ animation: false, ...options, fail() {} });
	} catch (e) {}
}

export function hasAuthToken() {
	return Boolean(normalizeAuthToken(uni.getStorageSync('token')));
}

/** 是否已有可用登录态（与界面「请登录」一致：必须有用户名或手机号） */
export function isLoggedIn() {
	if (!hasAuthToken()) return false;
	const info = (store.state && store.state.user && store.state.user.userInfo) || {};
	return Boolean(info.username || info.phoneNumber);
}

/** 清掉微信会话与登录态。门店缓存保留。 */
export function clearAuthSession() {
	uni.removeStorageSync('token');
	uni.removeStorageSync('session_key');
	uni.removeStorageSync('openid');
}

/** 后端业务码：未登录 / 登录失效 / 权限不足 */
export function isAuthDeniedPayload(payload) {
	if (!payload || typeof payload !== 'object') return false;
	const status = Number(payload.status != null ? payload.status : payload.code);
	if (status === 20010 || status === 401) return true;
	const msg = String(payload.msg || payload.message || '');
	return payload.flag === false && /未登录|权限不足|登录失效|登录过期/.test(msg);
}

function openLoginModal() {
	lastPromptAt = Date.now();
	store.commit('LOGIN_TIP', true);
	store.commit('FORCE_OAUTH', true);
}

/** 弹出授权窗（可重复调用；已展示时去重，关闭后允许再次弹出） */
export function promptLogin() {
	const state = store.state && store.state.user ? store.state.user : {};
	if (state.forceOauth || state.showLoginTip) return false;
	const now = Date.now();
	if (now - lastPromptAt < 600) return false;
	openLoginModal();
	return false;
}

/** 用户主动点击「请登录」等：强制弹出，不受去重/残留状态影响 */
export function forcePromptLogin() {
	const state = store.state && store.state.user ? store.state.user : {};
	if (state.forceOauth || state.showLoginTip) {
		store.commit('FORCE_OAUTH', false);
		store.commit('LOGIN_TIP', false);
		setTimeout(() => openLoginModal(), 30);
		return false;
	}
	openLoginModal();
	return false;
}

/** 已登录返回 true；否则弹授权并返回 false */
export function ensureLoggedIn() {
	if (isLoggedIn()) return true;
	// 有 token 但无用户信息：清掉无效会话再弹窗
	if (hasAuthToken()) clearAuthSession();
	return promptLogin();
}

export function formatLoginError(error) {
	const msg = String((error && (error.message || error.errMsg)) || '');
	if (isPrivacyDeniedError(error) || /privacy|隐私/i.test(msg)) {
		return '请先同意隐私保护指引后再授权';
	}
	if (/getUserProfile|用户取消|auth deny|未获得|cancel/i.test(msg)) {
		return '未完成授权，请重试';
	}
	return msg || '登录失败，请重试';
}

/** 登录失败时：隐私拒绝走引导弹窗，其它展示调试弹窗（含请求与 openid） */
export async function handleLoginFailure(error, toastFn) {
	if (isPrivacyDeniedError(error)) {
		await promptPrivacyRetry();
		return;
	}
	showLoginDebugModal(error);
	const title = formatLoginError(error);
	if (typeof toastFn === 'function') {
		toastFn(title);
	} else {
		uni.showToast({ icon: 'none', title });
	}
}

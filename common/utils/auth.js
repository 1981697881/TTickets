import store from '@/common/store';
import { normalizeAuthToken } from '@/common/mixins/login-refresh.js';

let lastPromptAt = 0;

export function hasAuthToken() {
	return Boolean(normalizeAuthToken(uni.getStorageSync('token')));
}

/** 后端业务码：未登录 / 登录失效 / 权限不足 */
export function isAuthDeniedPayload(payload) {
	if (!payload || typeof payload !== 'object') return false;
	const status = Number(payload.status != null ? payload.status : payload.code);
	if (status === 20010 || status === 401) return true;
	const msg = String(payload.msg || payload.message || '');
	return payload.flag === false && /未登录|权限不足|登录失效|登录过期/.test(msg);
}

/** 弹出授权窗（可重复调用，短时间去重） */
export function promptLogin() {
	const now = Date.now();
	if (now - lastPromptAt < 1200) return false;
	lastPromptAt = now;
	store.commit('LOGIN_TIP', true);
	// #ifdef MP-WEIXIN
	store.commit('FORCE_OAUTH', true);
	// #endif
	return false;
}

/** 已登录返回 true；否则弹授权并返回 false */
export function ensureLoggedIn() {
	if (hasAuthToken()) return true;
	return promptLogin();
}

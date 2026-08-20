import store from '@/common/store';
import { normalizeAuthToken } from '@/common/mixins/login-refresh.js';
import { isPrivacyDeniedError, promptPrivacyRetry } from '@/common/utils/privacy.js';

let lastPromptAt = 0;

export function hasAuthToken() {
	return Boolean(normalizeAuthToken(uni.getStorageSync('token')));
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

/** 登录失败时：隐私拒绝走引导弹窗，其它走 toast */
export async function handleLoginFailure(error, toastFn) {
	if (isPrivacyDeniedError(error)) {
		await promptPrivacyRetry();
		return;
	}
	const title = formatLoginError(error);
	if (typeof toastFn === 'function') {
		toastFn(title);
	} else {
		uni.showToast({ icon: 'none', title });
	}
}

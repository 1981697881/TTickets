function safeStringify(value) {
	try {
		return JSON.stringify(value, null, 2);
	} catch (e) {
		return String(value);
	}
}

function getErrorMessage(error) {
	return String((error && (error.message || error.errMsg)) || '') || '登录失败，请重试';
}

function getDeviceInfo() {
	try {
		const sys = uni.getSystemInfoSync();
		return {
			model: sys.model,
			system: sys.system,
			platform: sys.platform,
			wechatVersion: sys.version,
			SDKVersion: sys.SDKVersion,
			brand: sys.brand
		};
	} catch (e) {
		return {};
	}
}

/** 构建单步调试信息 */
export function buildLoginDebug(step, extra = {}) {
	return {
		step,
		openid: uni.getStorageSync('openid') || '',
		sessionKey: uni.getStorageSync('session_key') || '',
		hasToken: Boolean(uni.getStorageSync('token')),
		time: new Date().toISOString(),
		device: getDeviceInfo(),
		...extra
	};
}

/** 给 Error 挂上 loginDebug，便于上层统一展示 */
export function attachLoginDebug(error, debug) {
	const err = error instanceof Error ? error : new Error(String(error?.message || error || '登录失败'));
	if (!err.loginDebug) {
		err.loginDebug = debug;
	} else {
		err.loginDebug = { ...err.loginDebug, ...debug };
	}
	return err;
}

export function formatLoginDebugText(error) {
	const debug = (error && error.loginDebug) || {};
	const lines = [];
	lines.push(`【错误】${getErrorMessage(error)}`);
	if (debug.step) lines.push(`【步骤】${debug.step}`);
	lines.push(`【openid】${debug.openid || '(空)'}`);
	lines.push(`【session_key】${debug.sessionKey || '(空)'}`);
	if (debug.hasToken != null) lines.push(`【本地token】${debug.hasToken ? '有' : '无'}`);
	if (debug.request != null) lines.push(`【请求】\n${safeStringify(debug.request)}`);
	if (debug.response != null) lines.push(`【响应】\n${safeStringify(debug.response)}`);
	if (debug.profile != null) lines.push(`【用户资料】\n${safeStringify(debug.profile)}`);
	if (debug.steps && debug.steps.length) lines.push(`【流程】\n${safeStringify(debug.steps)}`);
	if (debug.raw != null) lines.push(`【原始错误】\n${safeStringify(debug.raw)}`);
	if (debug.device) lines.push(`【设备】\n${safeStringify(debug.device)}`);
	if (debug.time) lines.push(`【时间】${debug.time}`);
	return lines.join('\n\n');
}

const EVENT_NAME = 'login-debug-show';

/** 触发全局调试弹窗（由 app-login-debug-modal 监听） */
export function showLoginDebugModal(error) {
	const summary = getErrorMessage(error);
	const detail = formatLoginDebugText(error);
	uni.$emit(EVENT_NAME, {
		summary,
		detail,
		debug: (error && error.loginDebug) || {}
	});
}

export const LOGIN_DEBUG_EVENT = EVENT_NAME;

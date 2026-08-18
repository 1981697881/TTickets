import Request from './request'
import apiList from './appApi'
import { hasAuthToken, isAuthDeniedPayload, promptLogin } from '@/common/utils/auth.js'

export default function api(url, data = {}) {
	const request = new Request();
	let api = getApiObj(url);
	request.interceptor.request((config, cancel) => { /* 请求之前拦截器 */
		if (api.auth) {
			if (!hasAuthToken()) {
				promptLogin();
				cancel('暂未登录,已阻止此次API请求~');
				return config;
			}
		}
		if (hasAuthToken()) {
			config.header.authorization = uni.getStorageSync('token');
		}
		return config
	});

	request.interceptor.response((response) => { /* 请求之后拦截器 */
		const data = response.data || {};
		if (data.code === 0) {
			uni.showToast({
				title: data.msg || '请求出错,稍后重试',
				icon: 'none',
				duration: 1000,
				mask: true
			});
		}

		// HTTP 401，或业务码 20010「未登录或权限不足」
		if (data.code === 401 || isAuthDeniedPayload(data)) {
			uni.removeStorageSync('token');
			promptLogin();
		}
		return response
	}, (response) => {
		const data = (response && response.data) || {};
		if (data.code === 401 || isAuthDeniedPayload(data)) {
			uni.removeStorageSync('token');
			promptLogin();
		}
		return response
	})

	return request.request({
		url: api.url,
		data,
		method: api.method
	})

}

function getApiObj(url) {
	let apiArray = url.split(".");
	let api = apiList;
	apiArray.forEach(v => {
		api = api[v];
	});
	return api;
}

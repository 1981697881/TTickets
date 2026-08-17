/**
 * 登录成功后刷新约定：
 * - setTokenAndBack 成功后 uni.$emit('login-success')
 * - 页面用本 mixin 挂 onLoginRefresh，或自行 $on
 */

export function normalizeAuthToken(payload) {
	if (payload == null) return '';
	if (typeof payload === 'string') return payload.trim();
	if (typeof payload === 'object') {
		const token =
			payload.token ||
			payload.accessToken ||
			payload.access_token ||
			payload.authorization ||
			'';
		return typeof token === 'string' ? token.trim() : '';
	}
	return '';
}

/**
 * @param {() => void | Promise<void>} refreshFn 登录成功或回页后需要重新拉数的方法
 * @param {{ refreshOnShow?: boolean }} [options]
 */
export function createLoginRefreshMixin(refreshFnName = 'onLoginRefresh', options = {}) {
	const refreshOnShow = options.refreshOnShow !== false;
	return {
		data() {
			return {
				_loginRefreshBound: false,
				_lastLoginRefreshAt: 0
			};
		},
		methods: {
			_runLoginRefresh(reason = 'event') {
				const fn = this[refreshFnName];
				if (typeof fn !== 'function') return;
				const now = Date.now();
				// 防抖：授权弹窗关闭后可能 event + onShow 连打
				if (now - this._lastLoginRefreshAt < 600) return;
				this._lastLoginRefreshAt = now;
				try {
					const result = fn.call(this, reason);
					if (result && typeof result.then === 'function') {
						result.catch(() => undefined);
					}
				} catch (e) {
					// ignore
				}
			},
			_onLoginSuccessEvent() {
				this._runLoginRefresh('login-success');
			}
		},
		onShow() {
			if (!refreshOnShow) return;
			const token = uni.getStorageSync('token');
			if (!token) return;
			// 有 token 且页面定义了刷新钩子时，由页面自行判断是否缺数据；
			// 这里只在「刚授权」场景由 event 驱动；onShow 调用轻量检查钩子
			if (typeof this.shouldRefreshOnShow === 'function') {
				if (this.shouldRefreshOnShow()) this._runLoginRefresh('onShow');
			}
		},
		mounted() {
			if (this._loginRefreshBound) return;
			this._loginRefreshBound = true;
			uni.$on('login-success', this._onLoginSuccessEvent);
		},
		beforeUnmount() {
			if (!this._loginRefreshBound) return;
			this._loginRefreshBound = false;
			uni.$off('login-success', this._onLoginSuccessEvent);
		},
		// 兼容部分页面仍用 beforeDestroy
		beforeDestroy() {
			if (!this._loginRefreshBound) return;
			this._loginRefreshBound = false;
			uni.$off('login-success', this._onLoginSuccessEvent);
		}
	};
}

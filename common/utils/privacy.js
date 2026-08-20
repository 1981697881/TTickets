/**
 * 微信小程序隐私授权。
 * 未同意隐私指引时，getUserProfile 等接口会直接失败。
 * 用户点「拒绝」后，约 10 秒内再调接口不会弹窗，只会直接失败；之后可再次调起。
 */

export function isPrivacyDeniedError(error) {
	const msg = String((error && (error.message || error.errMsg)) || '');
	return /privacy|隐私|disagree|deny|拒绝/i.test(msg);
}

export function requirePrivacyAuthorize() {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		const api = typeof wx !== 'undefined' && wx.requirePrivacyAuthorize
			? wx.requirePrivacyAuthorize.bind(wx)
			: (typeof uni !== 'undefined' && uni.requirePrivacyAuthorize
				? uni.requirePrivacyAuthorize.bind(uni)
				: null);

		if (!api) {
			resolve(true);
			return;
		}

		api({
			success: () => resolve(true),
			fail: err => {
				const msg = String(err?.errMsg || '');
				if (/cancel|deny|disagree|拒绝|privacy/i.test(msg)) {
					reject(new Error('请先同意隐私保护指引'));
				} else {
					reject(new Error(msg || '请先同意隐私保护指引'));
				}
			}
		});
		// #endif
		// #ifndef MP-WEIXIN
		resolve(true);
		// #endif
	});
}

/** 打开微信后台配置的《隐私保护指引》页面（只读，同意仍需点授权按钮） */
export function openPrivacyContract() {
	return new Promise(resolve => {
		// #ifdef MP-WEIXIN
		const open = (typeof wx !== 'undefined' && wx.openPrivacyContract)
			|| (typeof uni !== 'undefined' && uni.openPrivacyContract);
		if (!open) {
			resolve(false);
			return;
		}
		open.call(typeof wx !== 'undefined' && wx.openPrivacyContract ? wx : uni, {
			success: () => resolve(true),
			fail: () => resolve(false)
		});
		// #endif
		// #ifndef MP-WEIXIN
		resolve(false);
		// #endif
	});
}

/**
 * 用户拒绝隐私后的引导：说明可再次点击授权；可跳转查看指引。
 * 返回 true 表示用户点了「我知道了」（准备再点授权）。
 */
export function promptPrivacyRetry() {
	return new Promise(resolve => {
		uni.showModal({
			title: '需要同意隐私保护指引',
			content: '您已拒绝隐私协议，登录前需先同意。请再次点击「授权并查看」；若刚拒绝过，请稍等几秒再试。',
			confirmText: '查看指引',
			cancelText: '我知道了',
			success: async res => {
				if (res.confirm) {
					await openPrivacyContract();
				}
				resolve(Boolean(res.confirm || res.cancel));
			},
			fail: () => resolve(false)
		});
	});
}

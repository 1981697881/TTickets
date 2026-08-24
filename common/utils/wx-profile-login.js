/**
 * getUserProfile 必须由用户 @tap 同步触发。
 * open-type="agreePrivacyAuthorization" 的回调不算 TAP，不能在里面调 getUserProfile。
 */

export function getPrivacyNeedAuthorization() {
	return new Promise(resolve => {
		// #ifdef MP-WEIXIN
		const api =
			(typeof wx !== 'undefined' && wx.getPrivacySetting) ||
			(typeof uni !== 'undefined' && uni.getPrivacySetting);
		if (!api) {
			resolve(false);
			return;
		}
		api.call(typeof wx !== 'undefined' && wx.getPrivacySetting ? wx : uni, {
			success: res => resolve(Boolean(res?.needAuthorization)),
			fail: () => resolve(false)
		});
		// #endif
		// #ifndef MP-WEIXIN
		resolve(false);
		// #endif
	});
}

/** 在 @tap 同步栈里立刻调起，禁止放在任何异步回调之后 */
export function invokeGetUserProfile() {
	return new Promise((resolve, reject) => {
		uni.getUserProfile({
			desc: '用于完善会员资料',
			success: resolve,
			fail: err => reject(new Error(err?.errMsg || '用户取消授权'))
		});
	});
}

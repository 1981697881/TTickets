/**
 * 兼容微信新基础库：优先用拆分 API，避免 getSystemInfo(Sync) 废弃告警。
 * uni 框架 vendor 的 getSystemTheme 仍可能调用旧 API，构建后由 vite 插件 patch。
 */

function mergeSystemParts() {
	const windowInfo = typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : {};
	const deviceInfo = typeof uni.getDeviceInfo === 'function' ? uni.getDeviceInfo() : {};
	const appBaseInfo = typeof uni.getAppBaseInfo === 'function' ? uni.getAppBaseInfo() : {};
	const systemSetting = typeof uni.getSystemSetting === 'function' ? uni.getSystemSetting() : {};

	return {
		...deviceInfo,
		...appBaseInfo,
		...systemSetting,
		...windowInfo,
		windowWidth: windowInfo.windowWidth,
		windowHeight: windowInfo.windowHeight,
		statusBarHeight: windowInfo.statusBarHeight,
		safeArea: windowInfo.safeArea,
		safeAreaInsets: windowInfo.safeAreaInsets,
		screenWidth: windowInfo.screenWidth,
		screenHeight: windowInfo.screenHeight,
		pixelRatio: windowInfo.pixelRatio,
		platform: deviceInfo.platform || appBaseInfo.platform,
		system: deviceInfo.system,
		brand: deviceInfo.brand,
		model: deviceInfo.model,
		SDKVersion: appBaseInfo.SDKVersion,
		language: appBaseInfo.language,
		version: appBaseInfo.version,
		theme: appBaseInfo.theme
	};
}

export function getSystemInfoSyncSafe() {
	try {
		if (typeof uni !== 'undefined' && typeof uni.getWindowInfo === 'function') {
			return mergeSystemParts();
		}
	} catch (e) {
		// fall through
	}
	if (typeof uni !== 'undefined' && typeof uni.getSystemInfoSync === 'function') {
		return uni.getSystemInfoSync();
	}
	return {};
}

export function getSystemInfoSafe(options = {}) {
	const { success, fail, complete } = options || {};
	try {
		const info = getSystemInfoSyncSafe();
		if (typeof success === 'function') success(info);
		if (typeof complete === 'function') complete(info);
		return Promise.resolve(info);
	} catch (error) {
		if (typeof fail === 'function') fail(error);
		if (typeof complete === 'function') complete(error);
		return Promise.reject(error);
	}
}

/** 统一安全区 insets（优先新 API，兼容旧字段） */
export function getSafeAreaInsets() {
	const info = getSystemInfoSyncSafe();
	const insets = info.safeAreaInsets || {};
	const safeArea = info.safeArea || {};
	const screenHeight = Number(info.screenHeight || info.windowHeight || 0);
	const top =
		Number(insets.top) ||
		Number(info.statusBarHeight) ||
		(safeArea.top != null ? Number(safeArea.top) : 0) ||
		0;
	const bottom =
		Number(insets.bottom) ||
		(safeArea.bottom != null && screenHeight
			? Math.max(0, screenHeight - Number(safeArea.bottom))
			: 0) ||
		0;
	const left = Number(insets.left) || Number(safeArea.left) || 0;
	const right =
		Number(insets.right) ||
		(safeArea.right != null && info.screenWidth
			? Math.max(0, Number(info.screenWidth) - Number(safeArea.right))
			: 0) ||
		0;
	return { top, right, bottom, left };
}

/** 是否 iOS（优先新 API） */
export function isIOSPlatform() {
	const info = getSystemInfoSyncSafe();
	const platform = String(info.platform || '').toLowerCase();
	const system = String(info.system || '').toLowerCase();
	return platform === 'ios' || system.includes('ios');
}

/** 当前运行平台字符串 */
export function getPlatformName() {
	const info = getSystemInfoSyncSafe();
	return String(info.platform || info.osName || '').toLowerCase();
}

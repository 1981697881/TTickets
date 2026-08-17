import { STATIC_CDN } from '@/env.js';

/**
 * 业务图片统一放在 /static/imgs/ 下。
 * STATIC_CDN 指向线上 imgs 根目录时：
 *   /static/imgs/seat/a.png → https://xxx/imgs/seat/a.png
 * tabBar / colorui / font / style 必须留在主包，不要走此方法。
 *
 * @example staticUrl('imgs/seat/unselected.png')
 * @example staticUrl('/static/imgs/logo/logo.gif')
 */
export function staticUrl(path: string): string {
	const raw = String(path || '')
		.trim()
		.replace(/\\/g, '/');

	if (!raw) return '';

	const cdn = String(STATIC_CDN || '').replace(/\/+$/, '');
	const underImgs = raw
		.replace(/^\/+/, '')
		.replace(/^static\//, '')
		.replace(/^imgs\//, '');

	if (cdn) {
		return `${cdn}/${underImgs}`;
	}

	const withImgs = raw
		.replace(/^\/+/, '')
		.replace(/^static\//, '');
	return `/static/${withImgs.startsWith('imgs/') ? withImgs : `imgs/${withImgs}`}`;
}

/** 是否已启用远程静态资源（启用后构建可不再打进主包 imgs） */
export function isStaticCdnEnabled(): boolean {
	return Boolean(String(STATIC_CDN || '').trim());
}

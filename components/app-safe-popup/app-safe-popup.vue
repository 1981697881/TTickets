<template>
	<!-- 微信：仅居中弹窗尝试 root-portal；底部/侧滑不用，避免百分比高度与页脚错位 -->
	<!-- #ifdef MP-WEIXIN -->
	<root-portal v-if="visible && usePortal">
		<view
			class="safe-popup"
			:class="popupClass"
			:style="hostStyle"
			role="dialog"
			aria-modal="true"
			:aria-label="ariaLabel"
			@touchmove.stop.prevent="noop"
		>
			<view class="safe-popup__mask" @tap="onMaskTap" @touchmove.stop.prevent="noop"></view>
			<view class="safe-popup__panel" :class="{ 'safe-popup__panel--plain': plain }" :style="panelStyle" @tap.stop>
				<slot></slot>
			</view>
		</view>
	</root-portal>
	<view
		v-else-if="visible"
		class="safe-popup"
		:class="popupClass"
		:style="hostStyle"
		role="dialog"
		aria-modal="true"
		:aria-label="ariaLabel"
		@touchmove.stop.prevent="noop"
	>
		<view class="safe-popup__mask" @tap="onMaskTap" @touchmove.stop.prevent="noop"></view>
		<view class="safe-popup__panel" :class="{ 'safe-popup__panel--plain': plain }" :style="panelStyle" @tap.stop>
			<slot></slot>
		</view>
	</view>
	<!-- #endif -->

	<!-- #ifndef MP-WEIXIN -->
	<view
		v-if="visible"
		class="safe-popup"
		:class="popupClass"
		:style="hostStyle"
		role="dialog"
		aria-modal="true"
		:aria-label="ariaLabel"
		@touchmove.stop.prevent="noop"
	>
		<view class="safe-popup__mask" @tap="onMaskTap" @touchmove.stop.prevent="noop"></view>
		<view class="safe-popup__panel" :class="{ 'safe-popup__panel--plain': plain }" :style="panelStyle" @tap.stop>
			<slot></slot>
		</view>
	</view>
	<!-- #endif -->
</template>

<script>
import { getSystemInfoSyncSafe } from '@/common/runtime/system-info';

let bodyScrollLockCount = 0;
let lockedScrollY = 0;
let bodyStyleSnapshot = null;

function compareVersion(v1, v2) {
	const a = String(v1 || '0').split('.').map(n => parseInt(n, 10) || 0);
	const b = String(v2 || '0').split('.').map(n => parseInt(n, 10) || 0);
	const len = Math.max(a.length, b.length);
	for (let i = 0; i < len; i += 1) {
		const x = a[i] || 0;
		const y = b[i] || 0;
		if (x > y) return 1;
		if (x < y) return -1;
	}
	return 0;
}

function detectRootPortalSupport() {
	// #ifndef MP-WEIXIN
	return false;
	// #endif
	// #ifdef MP-WEIXIN
	try {
		const info = getSystemInfoSyncSafe();
		const sdk = info.SDKVersion || info.hostSDKVersion || '0';
		return compareVersion(sdk, '2.25.2') >= 0;
	} catch (error) {
		return false;
	}
	// #endif
}

function lockBodyScroll() {
	if (typeof document === 'undefined' || typeof window === 'undefined' || !document.body) return false;
	bodyScrollLockCount += 1;
	if (bodyScrollLockCount > 1) return true;

	const body = document.body;
	lockedScrollY = window.scrollY || 0;
	bodyStyleSnapshot = {
		overflow: body.style.overflow,
		position: body.style.position,
		top: body.style.top,
		left: body.style.left,
		right: body.style.right,
		width: body.style.width,
		paddingRight: body.style.paddingRight
	};

	const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
	body.style.overflow = 'hidden';
	body.style.position = 'fixed';
	body.style.top = `-${lockedScrollY}px`;
	body.style.left = '0';
	body.style.right = '0';
	body.style.width = '100%';
	if (scrollbarWidth) body.style.paddingRight = `${scrollbarWidth}px`;
	return true;
}

function unlockBodyScroll() {
	if (typeof document === 'undefined' || typeof window === 'undefined' || !document.body || bodyScrollLockCount <= 0) return;
	bodyScrollLockCount -= 1;
	if (bodyScrollLockCount > 0 || !bodyStyleSnapshot) return;

	const body = document.body;
	Object.assign(body.style, bodyStyleSnapshot);
	window.scrollTo(0, lockedScrollY);
	bodyStyleSnapshot = null;
	lockedScrollY = 0;
}

export default {
	name: 'AppSafePopup',
	props: {
		modelValue: { type: Boolean, default: undefined },
		value: { type: Boolean, default: undefined },
		type: { type: String, default: 'center' },
		maskClosable: { type: Boolean, default: true },
		plain: { type: Boolean, default: false },
		lockScroll: { type: Boolean, default: true },
		preferPortal: { type: Boolean, default: true },
		zIndex: { type: [Number, String], default: 11000 },
		maxWidth: { type: String, default: '640rpx' },
		ariaLabel: { type: String, default: '弹窗' }
	},
	emits: ['update:modelValue', 'input', 'close', 'mask-click'],
	data() {
		return {
			bodyScrollLocked: false,
			portalSupported: detectRootPortalSupport()
		};
	},
	computed: {
		visible() {
			return this.modelValue === undefined ? Boolean(this.value) : Boolean(this.modelValue);
		},
		// 底部/侧滑弹层禁止 portal，否则内部 height:100%/页脚常错位
		usePortal() {
			return this.preferPortal && this.portalSupported && this.type === 'center';
		},
		popupClass() {
			return [`safe-popup--${this.type}`, { 'safe-popup--plain': this.plain }];
		},
		hostStyle() {
			return { zIndex: Number(this.zIndex) || 11000 };
		},
		panelStyle() {
			if (['center', 'left', 'right'].includes(this.type)) {
				return { maxWidth: this.maxWidth };
			}
			return {};
		}
	},
	watch: {
		visible: {
			immediate: true,
			handler(value) {
				this.syncBodyScrollLock(value);
			}
		},
		lockScroll() {
			this.syncBodyScrollLock(this.visible);
		}
	},
	mounted() {
		this.syncBodyScrollLock(this.visible);
		// #ifdef H5
		if (typeof document !== 'undefined') document.addEventListener('keydown', this.onKeydown);
		// #endif
	},
	beforeUnmount() {
		this.releaseBodyScrollLock();
		// #ifdef H5
		if (typeof document !== 'undefined') document.removeEventListener('keydown', this.onKeydown);
		// #endif
	},
	methods: {
		noop() {},
		syncBodyScrollLock(visible) {
			// #ifdef H5
			if (visible && this.lockScroll && !this.bodyScrollLocked) {
				this.bodyScrollLocked = lockBodyScroll();
			} else if ((!visible || !this.lockScroll) && this.bodyScrollLocked) {
				this.releaseBodyScrollLock();
			}
			// #endif
		},
		releaseBodyScrollLock() {
			if (!this.bodyScrollLocked) return;
			this.bodyScrollLocked = false;
			unlockBodyScroll();
		},
		onKeydown(event) {
			if (event.key === 'Escape' && this.visible && this.maskClosable) this.close();
		},
		close() {
			this.$emit('update:modelValue', false);
			this.$emit('input', false);
			this.$emit('close');
		},
		onMaskTap() {
			this.$emit('mask-click');
			if (this.maskClosable) this.close();
		}
	}
};
</script>

<style lang="scss" scoped>
.safe-popup {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	box-sizing: border-box;
	overflow: hidden;
}

.safe-popup__mask {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.55);
	opacity: 1;
}

.safe-popup__panel {
	position: relative;
	z-index: 2;
	width: calc(100% - 64rpx);
	max-height: 80%;
	min-height: 0;
	overflow-x: hidden;
	overflow-y: auto;
	box-sizing: border-box;
	background-color: #fff;
	border-radius: 24rpx;
	-webkit-overflow-scrolling: touch;
}

.safe-popup__panel--plain,
.safe-popup--plain .safe-popup__panel {
	background-color: transparent;
	border-radius: 0;
}

.safe-popup--center {
	align-items: center;
	justify-content: center;
	padding: 48rpx 32rpx;
	padding-top: calc(48rpx + constant(safe-area-inset-top));
	padding-top: calc(48rpx + env(safe-area-inset-top));
	padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}

.safe-popup--bottom {
	align-items: flex-end;
	justify-content: center;
}

.safe-popup--top {
	align-items: flex-start;
	justify-content: center;
}

/* 底部/顶部：面板自身不滚动，由内部 content 区域滚动，保证页脚按钮始终可见 */
.safe-popup--bottom .safe-popup__panel,
.safe-popup--top .safe-popup__panel {
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 750rpx;
	max-height: 85%;
	margin: 0 auto;
	overflow: hidden;
	background-color: #fff;
}

.safe-popup--bottom .safe-popup__panel {
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	border-radius: 30rpx 30rpx 0 0;
}

.safe-popup--top .safe-popup__panel {
	padding-top: constant(safe-area-inset-top);
	padding-top: env(safe-area-inset-top);
	border-radius: 0 0 30rpx 30rpx;
}

.safe-popup--left,
.safe-popup--right {
	align-items: stretch;
}

.safe-popup--left {
	justify-content: flex-start;
}

.safe-popup--right {
	justify-content: flex-end;
}

.safe-popup--left .safe-popup__panel,
.safe-popup--right .safe-popup__panel {
	display: flex;
	flex-direction: column;
	width: 80%;
	max-width: 640rpx;
	height: 100%;
	max-height: none;
	overflow: hidden;
	border-radius: 0;
	background-color: #fff;
}

/* #ifdef H5 */
.safe-popup__mask {
	animation: safe-popup-fade 180ms ease-out both;
}

.safe-popup--center .safe-popup__panel {
	animation: safe-popup-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.safe-popup--bottom .safe-popup__panel {
	animation: safe-popup-up 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.safe-popup--top .safe-popup__panel {
	animation: safe-popup-down 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes safe-popup-fade {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes safe-popup-in {
	from { opacity: 0; transform: scale(0.96) translateY(12rpx); }
	to { opacity: 1; transform: none; }
}

@keyframes safe-popup-up {
	from { transform: translateY(100%); }
	to { transform: translateY(0); }
}

@keyframes safe-popup-down {
	from { transform: translateY(-100%); }
	to { transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
	.safe-popup__mask,
	.safe-popup__panel {
		animation: none;
	}
}
/* #endif */
</style>

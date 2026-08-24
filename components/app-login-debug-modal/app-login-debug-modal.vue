<template>
	<app-safe-popup v-model="visible" max-width="680rpx" aria-label="授权调试信息">
		<view class="debug-modal">
			<view class="debug-modal__title">授权异常</view>
			<view class="debug-modal__summary">{{ summary }}</view>
			<scroll-view class="debug-modal__scroll" scroll-y :show-scrollbar="true">
				<text class="debug-modal__text" selectable>{{ detail }}</text>
			</scroll-view>
			<view class="debug-modal__actions">
				<button class="cu-btn debug-modal__btn debug-modal__btn--copy" @tap="onCopy">复制详情</button>
				<button class="cu-btn debug-modal__btn debug-modal__btn--close" @tap="onClose">关闭</button>
			</view>
		</view>
	</app-safe-popup>
</template>

<script>
import { LOGIN_DEBUG_EVENT } from '@/common/utils/login-debug.js';

export default {
	name: 'appLoginDebugModal',
	data() {
		return {
			visible: false,
			summary: '',
			detail: ''
		};
	},
	created() {
		uni.$on(LOGIN_DEBUG_EVENT, this.onShow);
	},
	beforeUnmount() {
		uni.$off(LOGIN_DEBUG_EVENT, this.onShow);
	},
	methods: {
		onShow(payload = {}) {
			this.summary = payload.summary || '登录失败';
			this.detail = payload.detail || '';
			this.visible = true;
		},
		onClose() {
			this.visible = false;
		},
		onCopy() {
			if (!this.detail) return;
			uni.setClipboardData({
				data: this.detail,
				success: () => {
					uni.showToast({ title: '已复制', icon: 'success' });
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.debug-modal {
	width: 100%;
	box-sizing: border-box;
	padding: 36rpx 28rpx 28rpx;
	background: #fff;
	border-radius: var(--tt-radius-lg);
}

.debug-modal__title {
	font-size: 34rpx;
	font-weight: 600;
	color: var(--tt-text);
	text-align: center;
	margin-bottom: 16rpx;
}

.debug-modal__summary {
	font-size: 28rpx;
	color: #c45656;
	line-height: 1.5;
	margin-bottom: 20rpx;
	word-break: break-all;
}

.debug-modal__scroll {
	max-height: 52vh;
	margin-bottom: 24rpx;
	padding: 20rpx;
	box-sizing: border-box;
	background: #f7f8fa;
	border-radius: 12rpx;
}

.debug-modal__text {
	display: block;
	font-size: 22rpx;
	line-height: 1.6;
	color: #333;
	white-space: pre-wrap;
	word-break: break-all;
	font-family: Consolas, 'Courier New', monospace;
}

.debug-modal__actions {
	display: flex;
	gap: 20rpx;
}

.debug-modal__btn {
	flex: 1;
	height: 72rpx;
	border-radius: 36rpx;
	font-size: 28rpx;
}

.debug-modal__btn--copy {
	background: var(--tt-primary);
	color: #fff;
}

.debug-modal__btn--close {
	background: #f2f3f5;
	color: var(--tt-text);
}
</style>

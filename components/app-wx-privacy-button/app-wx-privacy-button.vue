<template>
	<!--
		手机号：open-type 组合 getPhoneNumber|agreePrivacyAuthorization，一次点击完成隐私+取号。
		登录已改为 loginOnUserTap，不再走本组件的 profile 模式。
	-->
	<!-- #ifdef MP-WEIXIN -->
	<view class="wx-privacy-host" :class="[hostClass, { 'wx-privacy-host--inline': inline }]">
		<button
			v-if="mode === 'phone'"
			:id="actionId"
			:class="btnClass"
			:style="btnStyle"
			open-type="getPhoneNumber|agreePrivacyAuthorization"
			@getphonenumber="onGetPhoneNumber"
			@agreeprivacyauthorization="onPrivacyAgreed"
		>
			<slot>{{ actionText }}</slot>
		</button>
		<button
			v-else-if="needPrivacy"
			:id="privacyId"
			:class="btnClass"
			:style="btnStyle"
			open-type="agreePrivacyAuthorization"
			@agreeprivacyauthorization="onPrivacyAgreed"
		>
			<slot name="privacy">{{ privacyText }}</slot>
		</button>
		<button
			v-else
			:id="actionId"
			:class="btnClass"
			:style="btnStyle"
			@tap="onActionTap"
		>
			<slot>{{ actionText }}</slot>
		</button>
	</view>
	<!-- #endif -->
	<!-- #ifndef MP-WEIXIN -->
	<view class="wx-privacy-host" :class="[hostClass, { 'wx-privacy-host--inline': inline }]">
		<button :id="actionId" :class="btnClass" :style="btnStyle" @tap="onActionTap">
			<slot>{{ actionText }}</slot>
		</button>
	</view>
	<!-- #endif -->
</template>

<script>
import { getPrivacyNeedAuthorization } from '@/common/utils/wx-profile-login.js';

export default {
	name: 'appWxPrivacyButton',
	props: {
		/** phone: 一次点击取号；profile: 仅作兜底（登录请用 loginOnUserTap） */
		mode: {
			type: String,
			default: 'profile'
		},
		btnClass: {
			type: [String, Array, Object],
			default: ''
		},
		hostClass: {
			type: [String, Array, Object],
			default: ''
		},
		/** 行内按钮（如「我的」绑手机条），不占满整行 */
		inline: {
			type: Boolean,
			default: false
		},
		btnStyle: {
			type: [String, Object],
			default: ''
		},
		privacyText: {
			type: String,
			default: '同意隐私保护指引'
		},
		actionText: {
			type: String,
			default: '授权'
		},
		privacyTip: {
			type: String,
			default: ''
		},
		privacyId: {
			type: String,
			default: ''
		},
		actionId: {
			type: String,
			default: ''
		},
		active: {
			type: Boolean,
			default: true
		}
	},
	emits: ['action', 'getphonenumber', 'privacy-agreed', 'privacy-change'],
	data() {
		return {
			needPrivacy: false
		};
	},
	watch: {
		active: {
			immediate: true,
			handler(val) {
				if (val && this.mode !== 'phone') this.refreshPrivacyNeed();
			}
		}
	},
	created() {
		if (this.mode !== 'phone') this.refreshPrivacyNeed();
	},
	methods: {
		async refreshPrivacyNeed() {
			// #ifdef MP-WEIXIN
			this.needPrivacy = await getPrivacyNeedAuthorization();
			this.$emit('privacy-change', this.needPrivacy);
			// #endif
			// #ifndef MP-WEIXIN
			this.needPrivacy = false;
			// #endif
		},
		onPrivacyAgreed() {
			this.needPrivacy = false;
			this.$emit('privacy-agreed');
			this.$emit('privacy-change', false);
			if (this.privacyTip) {
				uni.showToast({ icon: 'none', title: this.privacyTip });
			}
		},
		onActionTap(e) {
			if (this.mode === 'phone') return;
			this.$emit('action', e);
		},
		onGetPhoneNumber(e) {
			this.$emit('getphonenumber', e);
		}
	}
};
</script>

<style lang="scss">
.wx-privacy-host {
	width: 100%;
	display: flex;
	justify-content: center;
	box-sizing: border-box;
}

.wx-privacy-host--inline {
	width: auto;
	flex: 0 0 auto;
	justify-content: flex-end;
}

button.author-btn {
	width: 100%;
	max-width: 630rpx;
	height: 80rpx;
	margin: 0;
	padding: 0 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1)) !important;
	box-shadow: 0 7rpx 6rpx 0 rgba(229, 138, 0, 0.22);
	border-radius: 40rpx;
	border: none !important;
	font-size: 30rpx;
	font-weight: 500;
	line-height: 1.2;
	color: #fff !important;
}

button.author-btn::after {
	border: none;
}

/* 我的页 - 绑定手机号 */
button.bind-phone {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 110rpx;
	height: 56rpx;
	margin: 0 0 0 16rpx;
	padding: 0 18rpx;
	border: 0 !important;
	border-radius: 0;
	background: transparent !important;
	font-size: 26rpx;
	font-weight: 600;
	line-height: 1;
	color: var(--tt-primary-strong, #8f981e) !important;
}

button.bind-phone::after {
	border: none;
}

/* 订票页 - 获取手机号 */
button.reserve-phone-button {
	min-width: 88rpx;
	height: 52rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0;
	padding: 0 18rpx;
	border: 1rpx solid var(--tt-danger, #eb5757) !important;
	border-radius: 27rpx;
	background: #fff !important;
	font-size: 22rpx;
	line-height: 1;
	color: var(--tt-danger, #eb5757) !important;
}

button.reserve-phone-button::after {
	border: none;
}
</style>

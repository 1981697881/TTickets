<template>
	<view class="wrap-box user-page">
		<view class="tab-page-nav">
			<view class="tab-page-status"></view>
			<view class="tab-page-bar"><text>我的</text></view>
		</view>
		<view class="user-box">
			<block v-if="template.length" v-for="(item, index) in template" :key="item.id || index">
				<sh-menu v-if="item.type === 'menu'" :detail="item.content" :menu="item.content.style" :imgW="94"></sh-menu>
				<sh-userinfo v-if="item.type === 'user'" :detail="item.content"></sh-userinfo>
				<sh-nav v-if="item.type === 'nav-list'" :detail="item.content"></sh-nav>
				<sh-wallet v-if="item.type === 'wallet-card'" :detail="item.content"></sh-wallet>
				<sh-grid v-if="item.type === 'grid-list'" :detail="item.content"></sh-grid>
				<!-- #ifdef MP-WEIXIN -->
				<sh-live v-if="item.type === 'live' && HAS_LIVE" :detail="item.content"></sh-live>
				<!-- #endif -->
			</block>
			<view class="foot_box">
				<view class="copyright y-f" v-if="info">
					<view class="code1">{{ info.copyright[0] }}</view>
					<view class="code2">{{ info.copyright[1] }} {{ info.version }}</view>
				</view>
			</view>
			<app-float-btn></app-float-btn>
			<app-notice-modal></app-notice-modal>
			<app-address-model @init="init" :marginTop="'150rpx'"></app-address-model>
		</view>
		<!-- 必须在页面根节点，且显式注册，避免 easycom/overflow 导致弹窗不显示 -->
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
import shMenu from './components/sh-menu.vue';
import shNav from './components/sh-nav.vue';
import shUserinfo from './components/sh-userinfo.vue';
import shWallet from './components/sh-wallet.vue';
import shGrid from './components/sh-grid.vue';
import appNoticeModal from '@/components/app-notice-modal/app-notice-modal.vue';
import appLoginModal from '@/components/app-login-modal/app-login-modal.vue';
import { mapActions, mapState } from 'vuex';
import { ensureLoggedIn, safeShowTabBar } from '@/common/utils/auth.js';

export default {
	components: {
		shMenu,
		shNav,
		shUserinfo,
		shWallet,
		shGrid,
		appNoticeModal,
		appLoginModal
	},
	data() {
		return {
			initPromise: null
		};
	},
	computed: {
		...mapState({
			initData: state => state.init.initData,
			template: state => state.init.templateData?.user || []
		}),
		info() {
			if (this.initData) {
				return this.initData.info;
			}
		}
	},
	onPullDownRefresh() {
		this.init();
	},
	onLoad() {},
	onShow() {
		// #ifdef MP-WEIXIN
		safeShowTabBar();
		// #endif
		if (!ensureLoggedIn()) return;
		this.init();
	},
	methods: {
		...mapActions(['getUserDetails', 'getUserBalance']),
		init() {
			if (this.initPromise) return this.initPromise;
			this.initPromise = Promise.all([
				this.getUserDetails().catch(() => null),
				this.getUserBalance().catch(() => null)
			])
				.finally(() => {
					this.initPromise = null;
					uni.stopPullDownRefresh();
				});
			return this.initPromise;
		}
	}
};
</script>

<style lang="scss">
.user-page {
	min-height: 100vh;
	background: #fff;
}

.tab-page-nav {
	position: relative;
	z-index: 10;
	background: rgba(255, 255, 255, 0.98);
	border-bottom: 1rpx solid var(--tt-border);
}

.tab-page-status {
	height: var(--status-bar-height);
	/* #ifdef H5 */
	height: 44rpx;
	/* #endif */
}

.tab-page-bar {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 34rpx;
	font-weight: 700;
	color: var(--tt-text);
}

.user-box {
	overflow-x: hidden;
	position: relative;
	min-height: 100vh;
	background: #fff;
}

.foot_box {
	padding: 42rpx 24rpx calc(var(--window-bottom) + 34rpx);
}

.copyright {
	color: var(--tt-text-muted);
	text-align: center;

	.code1 {
		font-size: 22rpx;
		line-height: 34rpx;
	}

	.code2 {
		font-size: 20rpx;
		line-height: 32rpx;
		margin-top: 2rpx;
	}
}
</style>

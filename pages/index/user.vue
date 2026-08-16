<template>
	<view class="wrap-box user-page">
		<view class="tab-page-nav">
			<view class="tab-page-status"></view>
			<view class="tab-page-bar"><text>我的</text></view>
		</view>
		<view class="user-box">
			<block v-if="template.length" v-for="(item, index) in template" :key="item.id || index">
				<!-- 菜单 -->
				<sh-menu v-if="item.type === 'menu'" :detail="item.content" :menu="item.content.style" :imgW="94"></sh-menu>
				<!-- 个人信息 -->
				<sh-userinfo v-if="item.type === 'user'" :detail="item.content"></sh-userinfo>
				<!-- 订单统计暂未启用，不渲染概念稿中的虚拟状态入口 -->
				<!-- 功能列表 -->
				<sh-nav v-if="item.type === 'nav-list'" :detail="item.content"></sh-nav>
				<!-- 钱包 -->
				<sh-wallet v-if="item.type === 'wallet-card'" :detail="item.content"></sh-wallet>
				<!-- 九宫格列表 -->
				<sh-grid v-if="item.type === 'grid-list'" :detail="item.content"></sh-grid>
				<!-- 直播 -->
				<!-- #ifdef MP-WEIXIN -->
				<sh-live v-if="item.type === 'live' && HAS_LIVE" :detail="item.content"></sh-live>
				<!-- #endif -->
			</block>
			<!-- 版本号 -->
			<view class="foot_box">
				<view class="copyright y-f" v-if="info">
					<view class="code1">{{ info.copyright[0] }}</view>
					<view class="code2">{{ info.copyright[1] }} {{ info.version }}</view>
				</view>
			</view>
			<!-- 关注弹窗 -->
			<app-float-btn></app-float-btn>
			<!-- 连续弹窗提醒 -->
			<app-notice-modal></app-notice-modal>
			<!-- 登录提示 -->
			<app-login-modal></app-login-modal>
			<!-- 门店选择 -->
			<app-address-model @init="init" :marginTop="'150rpx'"></app-address-model>
		</view>
		<!-- 自定义底部导航 -->
		<!-- <app-tabbar></app-tabbar> -->
	</view>
</template>

<script>
import shMenu from './components/sh-menu.vue';
import shNav from './components/sh-nav.vue';
import shUserinfo from './components/sh-userinfo.vue';
import shWallet from './components/sh-wallet.vue';
import shGrid from './components/sh-grid.vue';
import appNoticeModal from '@/components/app-notice-modal/app-notice-modal.vue';
import { mapActions, mapState } from 'vuex';
export default {
	components: {
		shMenu,
		shNav,
		shUserinfo,
		shWallet,
		shGrid,
		appNoticeModal
	},
	data() {
		return {
			initPromise: null
		};
	},
	computed: {
		...mapState({
			initData: state => state.init.initData, //初始化数据
			template: state => state.init.templateData?.user || [] //模板数据
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
		/* this.$store.commit('CART_NUM'); */
		this.init();
	},
	methods: {
		...mapActions(['getUserDetails', 'getUserBalance']),
		// 初始化
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

// 微信登录蒙层
.login-box {
	position: fixed;
	z-index: 9999;
	width: 100%;
	height: 100%;
	background: none;
}

// 顶部
.transtion-head {
	height: 120rpx;
	background: #fff;
	width: 100%;
	position: fixed;
	top: 0;
	z-index: 99;
	transition: all 0.2s linear;
	transform: translateY(-120rpx);
	border-bottom: 1rpx solid #f2f2f2;
}

.transtion-head--active {
	height: 120rpx;
	background: #fff;
	width: 100%;
	position: fixed;
	top: 0;
	z-index: 99;
	transition: all 0.2s linear;
	transform: translateY(0rpx);
	border-bottom: 1rpx solid #f2f2f2;
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

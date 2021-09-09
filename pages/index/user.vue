<template>
	<view class="wrap-box">
		
		<view class="user-box">
			<block v-if="template.length" v-for="(item, index) in template" :key="index">
				<!-- 菜单 -->
				<sh-menu v-if="item.type === 'menu'" :detail="item.content" :menu="item.content.style" :imgW="94"></sh-menu>
				<!-- 个人信息 -->
				<sh-userinfo v-if="item.type === 'user'" :detail="item.content"></sh-userinfo>
				<!-- 订单卡片 -->
				<!-- <sh-order v-if="item.type === 'order-card'" :detail="item.content"></sh-order> -->
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
import Wechat from '@/common/wechat/wechat';
import shMenu from './components/sh-menu.vue';
import shAdv from './components/sh-adv.vue';
import shRichtext from './components/sh-richtext.vue';
import shNav from './components/sh-nav.vue';
import shUserinfo from './components/sh-userinfo.vue';
import shOrder from './components/sh-order.vue';
import shWallet from './components/sh-wallet.vue';
import shGrid from './components/sh-grid.vue';
import shTitleCard from './components/sh-title-card.vue';
import appNoticeModal from '@/components/app-notice-modal/app-notice-modal.vue';
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	components: {
		shMenu,
		shAdv,
		shRichtext,
		shNav,
		shUserinfo,
		shOrder,
		shWallet,
		shGrid,
		shTitleCard,
		appNoticeModal
	},
	data() {
		return {
			platform: uni.getStorageSync('platform'), //当前平台。
			isRefresh: false, //更新
			scrollTop: 0, //页面滚动距离
			bgcolor: ''
		};
	},
	computed: {
		...mapState({
			initData: state => state.init.initData, //初始化数据
			template: state => state.init.templateData.user, //模板数据
			userInfo: state => state.user.userInfo,
			/* orderNum: state => state.user.orderNum,
			cartNum: state => state.cart.cartNum, */
			forceOauth: state => state.user.forceOauth
		}),
		info() {
			if (this.initData) {
				return this.initData.info;
			}
		},
		popupUser() {
			if (this.initData.popup) {
				return this.initData.popup.content.user;
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
		...mapActions(['getUserDetails','getUserBalance']),/* , 'getOrderNum' */
		// 初始化
		init() {
			return Promise.all([this.getUserDetails(),this.getUserBalance()])/* , this.getOrderNum() */
				.then(() => {
					uni.stopPullDownRefresh();
				})
				.catch(() => {
					uni.stopPullDownRefresh();
				});
		},

		jump(path, query) {
			this.$Router.push({
				path: path,
				query: query
			});
		},
		getbgcolor(e) {
			this.bgcolor = e;
		}
	}
};
</script>

<style lang="scss">
.user-box {
	overflow-x: hidden;
	position: relative;
	overflow-y: auto;
	// height: 100%;
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
	padding-top: 0rpx;
	padding-bottom: calc(var(--window-bottom) + 30px);
	margin-bottom: 50rpx;
}

.copyright {
	color: #999;

	.code1 {
		font-size: 24rpx;
	}

	.code2 {
		font-size: 20rpx;
		margin-top: 10rpx;
	}
}
</style>

<template>
	<view class="page_box">
		<view class="head_box"></view>
		<view class="content_box"><uni-parser :html="richText.aboutMessage"></uni-parser></view>
		<view class="foot_box"></view>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
		<!-- 自定义底部导航 -->
		<app-tabbar></app-tabbar>
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			richText: ''
		};
	},
	computed: {},
	onLoad() {
		this.init();
	},
	methods: {
		init() {
			return Promise.all([this.getRichText()]);
		},
		getRichText() {
			if(this.$Route.query.type == 1){
				this.$api('faq.About').then(res => {
					this.richText = res.data[0];
					uni.setNavigationBarTitle({
						title: res.data[0].aboutName
					});
				});
			}
		}
	}
};
</script>

<style lang="scss">
.content_box {
	background: #fff;
	padding: 30rpx;
}
</style>

<template>
	<view class="page_box">
		<view class="content_box">
			<scroll-view class="scroll-box" scroll-y enable-back-to-top scroll-with-animation>
				<view class="group-wrap">
					<view class="group-box">
						<gz-info :detail="walletInfo"></gz-info>
					</view>
				</view>
				<!-- loading -->
				<app-load v-model="isLoading"></app-load>
			</scroll-view>
		</view>
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
	
import gzInfo from './children/gz-info.vue';
export default {
	components: {
		gzInfo
	},
	data() {
		return {
			walletInfo: {
				
			},
			isLoading: false,
			loadStatus: '', //loading,over
			lastPage: 1,
			currentPage: 1,
			grouponList: []
		};
	},
	onLoad() {
		if(this.$Route.query){
			this.memberCdkeyId = this.$Route.query.memberCdkeyId
			this.getOrderDetail()
		}
	},
	computed: {},
	methods: {
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		getOrderDetail(){
			let that = this;
			that.$api('user.CdKeyDetails', {
				memberCdkeyId : that.memberCdkeyId,
			}).then(res => {
				if (res.flag) {
					that.walletInfo = res.data;
				}
			});
		},
	}
};
</script>

<style lang="scss">
.page_box {
	background:linear-gradient(90deg, rgba(123, 120, 97, 1), rgba(238, 204, 137, 1), rgba(208, 174, 137, 1));
}
.page_box_shops {
	background-color: #FF5164;
}
.group-box {
	width: 700rpx;
	/* box-shadow: 1px 1px 2px 2px #FFF5EE; */
	border-radius: 20rpx;
	margin: 0 auto;
	margin-top: 10rpx;
	min-height: 1000rpx;
}
</style>

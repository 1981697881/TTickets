<template>
	<view class="page_box">
		<view class="content_box">
			<scroll-view class="scroll-box" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
				<view class="group-wrap">
					<wallet-head :detail="walletInfo"></wallet-head>
					<view class="group-box">
						<wallet-info :detail="walletInfo"></wallet-info>
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
import walletHead from '@/pages/wallet/children/wallet-head.vue';
import walletInfo from '@/pages/wallet/children/wallet-info.vue';
export default {
	components: {
		walletHead,
		walletInfo
	},
	data() {
		return {
			walletInfo: {
				id: '123',
				type: 'movie', //movie 电影票 goods商品票
				state: 'ing', //end 已结束，ing 进行中 restEnd已退款 restIng退款中
				title: '1天后开场',
				butTitle: '是否购票成功以订单信息为准',
				circuit: '',
				endTime: '',
				ingTime: '',
				resetEndTime: '',
				resetTime: ''
			},
			isLoading: false,
			loadStatus: '', //loading,over
			lastPage: 1,
			currentPage: 1,
			grouponList: []
		};
	},
	onLoad() {
		/* this.getGrouponList(); */
	},
	onPullDownRefresh() {},
	computed: {},
	methods: {
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		// 加载更多
		loadMore() {
			if (this.currentPage < this.lastPage) {
				this.currentPage += 1;
				this.getGrouponList();
			}
		},
		// 拼团列表
		getGrouponList() {
			let that = this;
			that.isLoading = true;
			that.loadStatus = 'loading';
			that.$api('goods.grouponList', {
				page: that.currentPage
			}).then(res => {
				if (res.code === 1) {
					that.isLoading = false;
					that.grouponList = [...that.grouponList, ...res.data.data];
					// that.grouponList=[];
					that.lastPage = res.data.last_page;
					if (that.currentPage < res.data.last_page) {
						that.loadStatus = '';
					} else {
						that.loadStatus = 'over';
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.page_box {
	background-color: #03afff;
}
.page_box_shops {
	background-color: #FF5164;
}
.group-box {
	width: 700rpx;
	box-shadow: 1px 2px 2px 2px #03afff;
	border-radius: 20rpx;
	margin: 0 auto;
	min-height: 1000rpx;
}
</style>

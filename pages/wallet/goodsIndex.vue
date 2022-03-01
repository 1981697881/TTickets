<template>
	<view class="page_box">
		<view class="content_box">
			<scroll-view class="scroll-box" scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
				<view class="group-wrap">
					<!-- <wallet-head :detail="walletInfo"></wallet-head> -->
					<view class="group-box">
						<wallet-goods ref="walletInfo" :detail="walletInfo" :scanId="confirmationId"></wallet-goods>
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
import walletGoods from '@/pages/wallet/children/wallet-goods.vue';
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	components: {
		walletHead,
		walletGoods
	},
	data() {
		return {
			walletInfo: {
				/* id: '123',
				type: 'movie', //movie 电影票 goods商品票
				state: 'ing', //end 已结束，ing 进行中 restEnd已退款 restIng退款中
				title: '1天后开场',
				butTitle: '是否购票成功以订单信息为准',
				circuit: '',
				endTime: '',
				ingTime: '',
				resetEndTime: '',
				resetTime: '' */
			},
			OrderID: '',
			isLoading: false,
			loadStatus: '', //loading,over
			lastPage: 1,
			currentPage: 1,
			grouponList: []
		};
	},
	onShow() {
		let that = this
		console.log(this.$Route.query)
		if(that.$Route.query){
			that.orderID = that.$Route.query.OrderID
			that.getOrderDetail()
		}
	},
	onHide() {
		let that = this;
		that.$nextTick(function(){
			that.$refs.walletInfo.clearCode()
		})
	},
	onUnload() {
		let that = this;
		that.$nextTick(function(){
			that.$refs.walletInfo.clearCode()
		})
	},
	onPullDownRefresh() {},
	computed: {
		...mapState({
			storeInfo: state => state.user.storeInfo,
		}),
	},
	methods: {
		// 加载更多
		loadMore() {
			if (this.currentPage < this.lastPage) {
				this.currentPage += 1;
			}
		},
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		getOrderDetail(){
			let that = this;
			that.$api('goods.getMixPackageOrderDetail', {
				orderID : that.orderID,
				placeId: that.storeInfo.v8PlaceId,
				V8Url: that.storeInfo.v8Url, 
			}).then(res => {
				if (res.flag) {
					that.walletInfo = res.data;
				}else{
					uni.showToast({
						icon: 'none',
						title: res.msg
					})
					
				}
			});
		},
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

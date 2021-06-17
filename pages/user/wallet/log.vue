<template>
	<view class="container">
		<view class="wallet-list x-f" v-for="(item,index) in walletList" :key="index">
			<!-- <image class="head-img" :src="item.avatar" mode=""></image> -->
			<view class="list-content y-f">
				<view class="title-box x-bc">
					<text class="title padding-left one-t">{{ item.transactionType == 1?'充值':'消费' }}</text>
					<view class="money">
						<text v-if="item.transactionType == 1" class="add">+{{ item.qty }}</text>
						<text v-else class="minus">-{{ item.qty }}</text>
					</view>
				</view>
				<view class="tip-box x-bc">
					<text class="time padding-left">{{ item.createDatetime }}</text>
					<text class="from">交易{{item.status==0?'成功':'失败'}}</text>
				</view>
			</view>
		</view>
		<view v-if="walletList.length" class="cu-load text-gray" :class="loadStatus"></view>
	</view>
</template>

<script>
	import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	components: {},
	data() {
		return {
			tools: this.$tools,
			isBottom: false,
			walletList: [],
			loadStatus: '', //loading,over
			currentPage: 1,
			lastPage: 1
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo
		})
	},
	onLoad() {
		this.getWalletLog();
	},
	onReachBottom() {
		if (this.currentPage < this.lastPage) {
			this.currentPage += 1;
			this.getWalletLog();
		}
	},
	methods: {
		// 钱包明细
		getWalletLog() {
			let that = this;
			that.loadStatus = 'loading';
			that.$api('user.transactionLogDorRList', {
				phoneNumber: that.userInfo.phoneNumber
			}).then(res => {
				if (res.flag) {
					that.walletList = [...that.walletList, ...res.data];
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
page {
	background: #fff;
}

.container {
	border-top: 1rpx solid #f5f5f5;
}

.wallet-list {
	width: 750rpx;

	.head-img {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: #ccc;
		margin: 30rpx;
	}

	.list-content {
		height: 160rpx;
		justify-content: space-between;
		align-items: flex-start;
		flex: 1;
		padding: 30rpx 30rpx 30rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.title-box,
	.tip-box {
		width: 100%;
	}

	.title {
		font-size: 30rpx;
		width: 400rpx;
	}

	.money {
		font-size: 34rpx;
		font-weight: bold;

		.add {
			color: #d89f64;
		}

		.minus {
			color: #000;
		}
	}

	.time {
		color: #999;
		font-size: 26rpx;
	}
}
</style>

<template>
	<view class="page_box">
		<!-- <view class="head_box">
			<view class="tab-box x-f">
				<view class="tab-item" @tap="onTab(tab.id)" :class="{ 'tab-active': tabCurrent === tab.id }" v-for="tab in tabList" :key="tab.id">
					<text class="tab-title">{{ tab.title }}</text>
					<text v-show="tabCurrent === tab.id" class="tab-triangle"></text>
				</view>
			</view>
		</view> -->
		<view class="content_box">
			<gz-exchange :tabId="tabCurrent" :exchangeCode="exchange" v-if="tabCurrent == 'ended'"></gz-exchange>
			<gz-purchase :tabId="tabCurrent" v-if="tabCurrent == 'ing'"></gz-purchase>
			<gz-purchased :tabId="tabCurrent" v-if="tabCurrent == 'nostart'"></gz-purchased>
		</view>
		<view class="foot_box"></view>
		<!-- 自定义底部导航 -->
		<app-tabbar></app-tabbar>
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
	</view>
</template>
<script>
import gzExchange from './children/gz-exchange.vue';
import gzPurchased from './children/gz-purchased.vue';
import gzPurchase from './children/gz-purchase.vue';
export default {
	components: {
		gzExchange,
		gzPurchased,
		gzPurchase
	},
	data() {
		return {
			emptyData: {
				img: '/static/imgs/empty/empty_goods.png',
				tip: '暂无团体票，敬请期待~'
			},
			isLoading: true,
			loadStatus: '', //loading,over
			lastPage: 1,
			currentPage: 1,
			exchangeCode: '',
			tabCurrent: 'ended',
			goodsList: [],
			exchange:{
				type: '',
				exchangeCode: ''
			},
			loading: false,
			tabList: [
				{
					id: 'ended',
					title: '兑换'
				}
				/* {
					id: 'ing',
					title: '购买'
				},
				{
					id: 'nostart',
					title: '已购买'
				} */
			]
		};
	},
	computed: {},
	onLoad(options) {
		let that = this;
		let q = decodeURIComponent(options.q);
		if (typeof that.GetRequest(q).exchangeCode != "undefined") {
			that.exchange.type = 'exchangeCode'
			that.exchange.exchangeCode = that.GetRequest(q).exchangeCode
		}
		if(typeof that.GetRequest(q).exchangeTCode != "undefined"){
			that.exchange.type = 'exchangeTCode' 
			that.exchange.exchangeCode = that.GetRequest(q).exchangeTCode
		}
	},
	mounted() {},
	methods: {
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		GetRequest(urlStr) {
			if (typeof urlStr == 'undefined') {
				var url = decodeURI(location.search); //获取url中"?"符后的字符串
			} else {
				var url = '?' + urlStr.split('?')[1];
			}
			var theRequest = new Object();
			if (url.indexOf('?') != -1) {
				var str = url.substr(1);
				var strs = str.split('&');
				for (var i = 0; i < strs.length; i++) {
					theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
				}
			}
			return theRequest;
		},
		onTab(id) {
			this.tabCurrent = id;
			this.goodsList = [];
			this.currentPage = 1;
		},
		// 百分比
		getProgress(sales, stock) {
			let unit = '';
			if (stock + sales > 0) {
				let num = (sales / (sales + stock)) * 100;
				unit = num.toFixed(2) + '%';
			} else {
				unit = '0%';
			}
			return unit;
		},
		// 加载更多
		loadMore() {
			if (this.currentPage < this.lastPage) {
				this.currentPage += 1;
			}
		}
	}
};
</script>

<style scoped lang="scss">
.tab-box {
	overflow: hidden;
	width: 100%;
	height: 84rpx;
	border: 1px solid #f8f8ff;
	.tab-item {
		flex: 1;
		line-height: 84rpx;
		text-align: center;
		background: #ffffff;
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 500;
		color: #999999;
		position: relative;
		border-right: 1rpx solid #fff;
		.tab-triangle {
			position: absolute;
			z-index: 2;
			bottom: 0;
			left: 42%;
			border-radius: 5rpx;
			width: 45rpx;
			height: 10rpx;
			background: red;
		}
	}
	.tab-active {
		color: #333333;
	}
}
.goods-item {
	position: relative;
	margin-bottom: 2rpx;
	.cu-progress {
		width: 225rpx;
		height: 16rpx;
		.progress--color {
			background: #e6b873;
		}
	}
	.progress-text {
		color: #999999;
		font-size: 20rpx;
		margin-left: 25rpx;
	}
	.fot-text {
		width: 100%;
		height: 70rpx;
		line-height: 70rpx;
		display: flex;
		.text-grey {
			width: 50%;
		}
		.fot-btn {
			text-align: right;
			width: 50%;
			height: 60rpx;
			.buy-btn {
				width: 140rpx;
				height: 60rpx;
				border-radius: 30rpx;
				font-size: 26rpx;
				font-family: PingFang SC;
				font-weight: 400;
				padding: 0;
			}
			.btn-end {
				background: linear-gradient(90deg, #c6e2ff, #b9d3ee);
				box-shadow: 1px 1px 1px 1px rgba(229, 138, 0, 0.22);
				color: white;
			}
			.btn-nostart {
				background: linear-gradient(90deg, #ffec8b, #eedc82);
				box-shadow: 1px 1px 1px 1px rgba(229, 138, 0, 0.22);
				color: #ff8247;
			}
			.btn-ing {
				background: linear-gradient(90deg, #fff0f5, #ffe4e1);
				box-shadow: 1px 1px 1px 1px rgba(229, 138, 0, 0.22);
				color: rgba(238, 99, 99, 1);
			}
		}
	}
}
</style>

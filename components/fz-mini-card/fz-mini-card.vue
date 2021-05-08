<template>
	<view class="">
		<view class="goods-box x-start">
			<image class="goods-img" :src="'https://cfzx.gzfzdev.com/movie/uploadFiles/image/'+detail.filmPhoto" mode="aspectFill"></image>
			<view class="y-start">
				<view class="goods-title more-t">
					<view class="item-title">{{ detail.locationHall.hallName }}</view>
					<view class="item-time">
						<text class="time cuIcon-time" v-if="isPast">{{ timeText }}</text>
						<text class="time" v-else>{{ timeText }}</text>
					</view>
				</view>
				<slot name="tipTag">{{checkTime.week || ''}} {{detail.schedule.showDatetime}} ({{detail.schedule.dimensional}})</slot>
				<view class="size-tip">{{detail.cinemaName}}</view>
				<slot name="goodsBottom">
					<view class="price">￥{{ detail.money }}</view>
				</slot>
			</view>
		</view>
	</view>
</template>

<script>
let timer;
import tools from '@/common/utils/tools'
export default {
	name: 'appMiniCard',
	components: {},
	data() {
		return {
			checkTime: {
				week: ''
			},
			timeText: '',
			isPast: true, //是否显示订单倒计时。
			routerTo: this.$Router,
			orderStatus: {
				seckill: '/static/imgs/seckill_tag.png',
				groupon: '/static/imgs/groupon_tag.png'
			}
		};
	},
	props: {
		detail: {
			type: Object,
			default: null
		},
		sku: {},
		type: ''
	},
	mounted() {
		clearInterval(timer);
		timer = null
		this.countDown();
		this.initDate(this.detail.schedule.showDatetime);
	},
	created() {
		
	},
	onHide() {
		
	},
	computed: {},
	methods: {
		clearTime(){
			clearInterval(timer);
			timer = null
		},
		initDate(dval) {
			let that = this
			let date =new Date()
			let year=date.getFullYear();
			let month=date.getMonth()+1;
			let lastDay=new Date(dval).getDate() - new Date().getDate() +1
			for(let i = 0;i<lastDay;i++){
				let obj = tools.getDayList('',i)
				if(i==0){
					obj.week = '今天'
					that.checkTime = obj
				}else if(i==1){
					obj.week = '明天'
					that.checkTime = obj
				}else if(i==2){
					obj.week = '后天'
					that.checkTime = obj
				}else{
					that.checkTime = obj
				}
			}
		},
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		num(n) {
			return n < 10 ? '0' + n : '' + n;
		},
		// 倒计时
		countDown() {
			let that = this;
			let maxtime = 10 * 30;
			timer = setInterval(() => {
				if (maxtime >= 0) {
					let minutes = Math.floor(maxtime / 60);
					let seconds = Math.floor(maxtime % 60);
					that.timeText = `${that.num(minutes)}:${that.num(seconds)}`;
					--maxtime;
				} else {
					clearInterval(timer);
					timer = null
					console.log('订单过期')
					that.timeText = '订单已过期!';
					that.isPast = false;
					 that.$emit('overTime')
				}
			}, 1000);
		}
	}
};
</script>

<style lang="scss">
.goods-box {
	position: relative;
	.goods-img {
		height: 180rpx;
		width: 200rpx;
		box-shadow: 2px 2px 2px 2px #CCCCCC;
		background-color: #ccc;
		margin-right: 25rpx;
	}
	.order-goods__tag {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 3;
		width: 60rpx;
		height: 30rpx;
	}
	.goods-title {
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 500;
		height: 60rpx;
		color: rgba(51, 51, 51, 1);
		width: 450rpx;
		line-height: 40rpx;
		display: flex;
		margin-bottom: 10rpx;
	}
	.item-title {
		font-size: 40rpx;
		font-weight: bold;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.size-tip {
		line-height: 45rpx;
		// background: #f4f4f4;
		// padding: 0 16rpx;
		font-size: 24rpx;
		color: #666;
	}
	.sub-tip {
		width: 480rpx;
		line-height: 45rpx;
		// background: #F6F2EA;
		font-size: 24rpx;
		color: #a8700d;
		margin: 10rpx 0;
	}

	.price {
		color: #e1212b;
	}
}
// order
.goods-box {
	.order-right {
		height: 180rpx;
	}
	.order-tip {
		font-size: 24rpx;
		font-family: PingFang SC;
		font-weight: 400;
		color: rgba(153, 153, 153, 1);
		width: 450rpx;
		margin-bottom: 20rpx;
		.order-num {
			margin-right: 10rpx;
		}
	}

	.order-goods {
		width: 480rpx;

		.status-btn {
			background: none;
			height: 32rpx;
			border: 1rpx solid rgba(207, 169, 114, 1);
			border-radius: 15rpx;
			font-size: 20rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(168, 112, 13, 1);
			padding: 0 10rpx;
			margin-left: 20rpx;
			background: rgba(233, 183, 102, 0.16);
		}
		.order-price {
			font-size: 26rpx;
			font-family: PingFang SC;
			font-weight: 600;
			color: rgba(51, 51, 51, 1);
		}
	}
}
</style>

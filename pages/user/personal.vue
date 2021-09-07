<template>
	<view class="content">
		<image class="bg_img" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/invite_poster.png" mode=""></image>
		<view class="poster-box y-f">
			<view class="share-box">
				<view class="share-list-box">
					<tki-qrcode
						ref="userCode"
						:cid="cid"
						class="img"
						:val="scanId"
						:size="size"
						:unit="unit"
						:icon="icon"
						:iconSize="iconsize"
						:lv="lv"
						:onval="onval"
						:loadMake="loadMake"
						@result="qrR"
					/>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
import { BASE_URL } from '@/env.js';
import tkiQrcode from '@/components/tki-qrcode/tki-qrcode.vue';
import { mapMutations, mapActions, mapState } from 'vuex';
let timer;
export default {
	components: {
		tkiQrcode
	},
	data() {
		return {
			cid: 'userCode',
			ifShow: true,
			val: '', // 要生成的二维码值
			size: 400, // 二维码大小
			unit: 'upx', // 单位
			icon: '/static/imgs/logo/basicprofile.png', // 二维码图标
			iconsize: 40, // 二维码图标大小
			lv: 3, // 二维码容错级别 ， 一般不用设置，默认就行
			onval: true, // val值变化时自动重新生成二维码
			loadMake: true, // 组件加载完成后自动生成二维码
			src: '', // 二维码生成后的图片地址或base64
			poster: {},
			qrShow: false,
			scanId: '',
		};
	},
	props: {},
	computed: {
		...mapState({
			 storeInfo: state => state.user.storeInfo,
			balInfo: state => state.user.balInfo
		})
	},
	async onShow() {
		clearInterval(timer);
		timer = null
		let that = this;
		this.scanId = ''
		await that.getScanCode();
	},
	onHide() {
		let that = this;
		console.log('隐藏')
		this.scanId = ''
		clearInterval(timer);
		timer = null
		that.$nextTick(function(){
			that.$refs.userCode._clearCode()
		})
	},
	onUnload() {
		let that = this;
		console.log('卸载')
		this.scanId = ''
		clearInterval(timer);
		timer = null
		that.$nextTick(function(){
			that.$refs.userCode._clearCode()
		})
	},
	methods: {
		// 倒计时
		countDown() {
			let that = this;
			let maxtime = that.timer;
			console.log(maxtime)	
			timer = setInterval(() => {
				if (maxtime >= 0) {
					--maxtime;
				} else {
					that.getScanCode()
				}
			}, 1000);
		},
		getScanCode() {
			let that = this;
			that.$api('user.getCustPayQrCode', { 
				placeId: that.storeInfo.v8PlaceId,				V8Url: that.storeInfo.v8Url, 
				CustID: that.balInfo.custId,
				}).then(res => {
				if (res.flag) {
					that.$set(that,'scanId',res.data.Data)
					that.timer = Number(res.data.Data2) * 60;
					/* that.countDown() */
					
				}
			});
		},
		qrR(res) {
			this.src = res;
		}
	}
};
</script>

<style lang="scss">
.content {
	position: relative;
	width: 100%;
	height: 1350rpx;

	.bg_img {
		width: 100%;
		height: 100%;
	}

	.poster-box {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		top: 50rpx;

		.posterImage {
			width: 660rpx;
		}
	}
}

.share-box {
	width: 750rpx;
	border-radius: 30rpx;
	margin-top: 60rpx;
}
</style>

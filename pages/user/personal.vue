<template>
	<view class="content user-subpage user-qr-page">
		<image class="bg_img" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/invite_poster.png" mode=""></image>
		<view class="poster-box y-f">
			<view class="share-box">
				<view class="qr-title">会员付款码</view>
				<view class="qr-subtitle">向工作人员出示二维码即可识别会员账户</view>
				<view class="share-list-box">
					<view class="qr-wrap">
						<tki-qrcode
							ref="userCode"
							:cid="cid"
							class="img"
							:val="scanId"
							:size="size"
							:unit="unit"
							:lv="lv"
							:onval="onval"
							:loadMake="loadMake"
							@result="qrR"
						/>
						<image v-if="scanId" class="qr-center-logo" :src="icon" mode="aspectFill"></image>
					</view>
				</view>
				<view class="qr-safe-tip"><text class="cuIcon-safe"></text> 请勿将付款码截图发送给他人</view>
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
			icon: '/static/qrcode/logo.png', // 二维码中心 logo，必须留在主包
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
		timer = null;
		this.scanId = '';
		await this.getScanCode();
	},
	onHide() {
		clearInterval(timer);
		timer = null;
		this.scanId = '';
		this.clearCode();
	},
	onUnload() {
		clearInterval(timer);
		timer = null;
		this.scanId = '';
		this.clearCode();
	},
	methods: {
		clearCode() {
			this.$nextTick(() => {
				const qr = this.$refs.userCode;
				if (qr && typeof qr._clearCode === 'function') qr._clearCode();
			});
		},
		countDown() {
			let maxtime = this.timer;
			timer = setInterval(() => {
				if (maxtime >= 0) {
					--maxtime;
				} else {
					this.getScanCode();
				}
			}, 1000);
		},
		getScanCode() {
			return this.$api('user.getCustPayQrCode', {
				placeId: this.storeInfo.v8PlaceId,
				V8Url: this.storeInfo.v8Url,
				CustID: this.balInfo.custId
			}).then(res => {
				if (res.flag) {
					this.scanId = res.data.Data || '';
					this.timer = Number(res.data.Data2) * 60;
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
@import '@/static/style/user-center.scss';
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

<template>
	<view>
		<view class="sh-userinfo-box" :style="{ backgroundColor: detail.color }">
			<view class="user-bg"></view>
			<view class="head-wrap">
				<view class="titleNav pad">
					<view class="status-bar"></view>
					<text class="nav-title x-f"></text>
				</view>
				<view class="user-head x-bc">
					<view class="x-f">
						<!-- 微信小程序 -->
						<view class="info-box">
							<view class="x-f">
								<view class="head-img-wrap">
									<image
										class="head-img"
										@tap.stop="jump('/pages/user/info')"
										:src="userInfo.avatarUrl || '/static/imgs/base_avatar.png'"
										mode="aspectFill"
									></image>
									<block v-if="platform !== 'H5'">
										<button v-if="platform === 'wxMiniProgram'" @click="refreshWechatUser" class="cu-btn refresh-btn x-c">
											<text class="cuIcon-refresh" :class="{ 'refresh-rotate': isRefresh }"></text>
										</button>
										<button v-if="platform === 'wxOfficialAccount'" @tap="refreshWechatUser" class="cu-btn refresh-btn x-c">
											<text class="cuIcon-refresh" :class="{ 'refresh-rotate': isRefresh }"></text>
										</button>
									</block>
								</view>
								<text @tap.stop="jump('/pages/user/info')" class="user-name one-t">{{ userInfo.username || '请登录~' }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<button class="code-btn x-c" v-if="balInfo.custId" @tap.stop="jump('/pages/user/personal')" aria-label="打开我的二维码">
				<text class="cuIcon-qr_code"></text>
			</button>
		</view>
		<!-- 绑定手机 -->
		<view class="notice-box x-bc pad" v-if="!userInfo.phoneNumber && userInfo.username">
			<view class="notice-detail one-t">点击绑定手机号，确保账户安全</view>
			<button class="bindPhone cu-btn" open-type="getPhoneNumber" @getphonenumber="bindPhone">去绑定</button>
		</view>
	</view>
</template>

<script>
import { mapActions, mapState } from 'vuex';
export default {
	components: {},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo,
		})
	},
	props: {
		detail: {
			type: Object,
			default: () => ({})
		}
	},
	methods: {
		...mapActions(['getUserDetails']),
		jump(path, query) {
			this.$Router.push({
				path: path,
				query: query
			});
		},
		// 更新信息
		onRefresh() {
			const that = this;
			that.isRefresh = true;
			setTimeout(() => {
				that.isRefresh = false;
			}, 200);
		},
		refreshWechatUser(e) {
			const that = this;
			this.onRefresh();
			if (this.platform === 'wxOfficialAccount') {
				let wechat = new Wechat();
				wechat.login();
			} else if (this.platform === 'wxMiniProgram') {
				uni.getUserProfile({
					desc: 'Wexin', // 这个参数是必须的
					success: res => {
						that.$store.commit('FORCE_OAUTH', true);
					},fail: (err) => {
						    // 获取失败，可能用户拒绝授权，尝试引导用户到设置页面
						    if (err.errMsg.indexOf('user deny') > -1) {
						      uni.showModal({
						        title: '提示',
						        content: '需要获取您的信息，请确认授权',
						        success: (modalRes) => {
						          if (modalRes.confirm) {
						            // 引导用户到设置页面
						            uni.openSetting();
						          }
						        }
						      });
						    }
						  }
				});
			}
		},
		bindPhone(e) {
			let me = this;
			me.$api('user.getWxMiniPhoneNumber', {
				sessionKey: uni.getStorageSync('session_key'),
				openid: uni.getStorageSync('openid'),
				encryptedData: e.detail.encryptedData,
				iv: e.detail.iv
			}).then(res => {
				if (res.flag) {
					me.getUserDetails();
				}
			});
		}
	}
};
</script>

<style lang="scss">
.user-profile { background: #fff; }

.user-nav {
	background: #fff;
	.status-bar {
		height: var(--status-bar-height);
		/* #ifdef H5 */
		height: 44rpx;
		/* #endif */
	}
	.user-nav__bar {
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.user-nav__title {
		font-size: 34rpx;
		font-weight: 700;
		line-height: 48rpx;
		color: var(--tt-text);
	}
}

.user-head {
	min-height: 176rpx;
	padding: 20rpx 38rpx 30rpx;
	.user-identity { min-width: 0; flex: 1; }
	.head-img-wrap {
		width: 112rpx;
		height: 112rpx;
		padding: 5rpx;
		box-sizing: border-box;
		border: 2rpx solid rgba(169, 178, 56, 0.45);
		border-radius: 50%;
		background: #fff;
		margin-right: 26rpx;
	}
	.head-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: var(--tt-primary-soft);
	}
	.identity-copy { min-width: 0; }
	.user-name {
		display: block;
		max-width: 360rpx;
		font-size: 38rpx;
		font-weight: 700;
		line-height: 52rpx;
		color: var(--tt-text);
	}
	.user-hint {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		line-height: 32rpx;
		color: var(--tt-text-muted);
	}
	.code-btn {
		width: 72rpx;
		height: 72rpx;
		padding: 0;
		margin: 0;
		border: 0;
		border-radius: 50%;
		background: var(--tt-primary-soft);
		&::after { border: 0; }
		.cuIcon-qr_code { font-size: 40rpx; color: var(--tt-primary-strong); }
	}
}

.notice-box {
	min-height: 82rpx;
	margin: 0 30rpx 20rpx;
	padding: 0 22rpx 0 24rpx;
	box-sizing: border-box;
	background: #fbfcf4;
	border: 1rpx solid #e4e7c9;
	border-radius: var(--tt-radius-md);
	.notice-copy { min-width: 0; flex: 1; }
	.notice-icon { margin-right: 14rpx; font-size: 30rpx; color: var(--tt-primary-strong); }
	.notice-detail {
		font-size: 24rpx;
		line-height: 34rpx;
		color: var(--tt-text-secondary);
	}
	.bind-phone {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 110rpx;
		height: 56rpx;
		margin: 0 0 0 16rpx;
		padding: 0 18rpx;
		border: 0;
		background: transparent;
		font-size: 26rpx;
		font-weight: 600;
		color: var(--tt-primary-strong);
		&::after { border: 0; }
	}
}
</style>

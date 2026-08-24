<template>
	<view class="container user-subpage user-profile-page">
		<view class="user-list x-bc">
			<text class="list-name">头像</text>
			<!-- #ifdef MP-WEIXIN -->
			<button class="avatar-btn x-f" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
				<image class="avatar" :src="displayAvatar" mode="aspectFill"></image>
				<text class="cuIcon-right"></text>
			</button>
			<!-- #endif -->
			<!-- #ifndef MP-WEIXIN -->
			<view class="x-f" @tap="onChooseImg">
				<image class="avatar" :src="displayAvatar" mode="aspectFill"></image>
				<text class="cuIcon-right"></text>
			</view>
			<!-- #endif -->
		</view>
		<view class="user-list x-bc">
			<text class="list-name">昵称</text>
			<view class="x-f nick-wrap">
				<!-- #ifdef MP-WEIXIN -->
				<input
					class="list-val"
					type="nickname"
					:value="userData.username"
					placeholder="点击填写昵称"
					placeholder-class="nick-ph"
					@blur="onNickBlur"
					@change="onNickChange"
					@nicknamereview="onNicknameReview"
				/>
				<!-- #endif -->
				<!-- #ifndef MP-WEIXIN -->
				<input class="list-val" v-model="userData.username" placeholder="请输入昵称" placeholder-class="nick-ph" />
				<!-- #endif -->
				<text class="cuIcon-right"></text>
			</view>
		</view>
		<picker style="width: 750rpx;" mode="date" :value="userData.birthday" :start="startDate" :end="endDate" @change="onDateChange">
			<view class="user-list x-bc">
				<text class="list-name">生日</text>
				<view class="x-f">
					<text class="list-val">{{ userData.birthday || startDate }}</text>
					<text class="cuIcon-right"></text>
				</view>
			</view>
		</picker>
		<view class="user-list x-bc">
			<text class="list-name">修改手机号</text>
			<view class="x-f">
				<text class="list-val">{{ userData.phoneNumber || '未绑定' }}</text>
				<text class="cuIcon-right"></text>
			</view>
		</view>
		<view class="btn-box flex align-center justify-center">
			<button class="cu-btn confirem-btn" :loading="saving" :disabled="saving" @tap="editUserInfo">保存</button>
		</view>
		<app-tabbar></app-tabbar>
		<app-float-btn></app-float-btn>
		<app-notice-modal></app-notice-modal>
		<app-login-modal></app-login-modal>
	</view>
</template>

<script>
import { mapActions, mapState } from 'vuex';
export default {
	data() {
		return {
			userData: {
				username: '',
				avatarUrl: '',
				avatar: '',
				birthday: '',
				phoneNumber: ''
			},
			saving: false,
			uploading: false
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo
		}),
		displayAvatar() {
			return this.userData.avatarUrl || this.userData.avatar || '/static/imgs/base_avatar.png';
		},
		startDate() {
			return this.getDate('start');
		},
		endDate() {
			return this.getDate('end');
		}
	},
	onLoad() {
		this.syncFromStore();
	},
	onShow() {
		this.syncFromStore();
	},
	methods: {
		...mapActions(['getUserInfo', 'getUserDetails']),
		syncFromStore() {
			const info = this.userInfo || {};
			this.userData = {
				username: info.username || info.nickname || '',
				avatarUrl: info.avatarUrl || info.avatar || '',
				avatar: info.avatar || info.avatarUrl || '',
				birthday: info.birthday || '',
				phoneNumber: info.phoneNumber || ''
			};
		},
		getDate(type) {
			const date = new Date();
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			let day = date.getDate();
			if (type === 'start') year = year - 60;
			month = month > 9 ? month : '0' + month;
			day = day > 9 ? day : '0' + day;
			return `${year}-${month}-${day}`;
		},
		onDateChange(e) {
			this.userData.birthday = e.detail.value;
		},
		onNickBlur(e) {
			const val = (e?.detail?.value ?? this.userData.username ?? '').trim();
			this.userData.username = val;
		},
		onNickChange(e) {
			const val = (e?.detail?.value ?? '').trim();
			if (val) this.userData.username = val;
		},
		onNicknameReview() {
			// 微信昵称审核回调，通过后再保存即可
		},
		/** 微信头像：临时路径 → 上传 → 永久 URL */
		async onChooseAvatar(e) {
			const tempPath = e?.detail?.avatarUrl;
			if (!tempPath) return;
			this.userData.avatarUrl = tempPath;
			if (this.uploading) return;
			this.uploading = true;
			try {
				const res = await this.$tools.uploadImage('index/upload', tempPath);
				const url = res?.full_url || res?.url || '';
				if (url) {
					this.userData.avatar = url;
					this.userData.avatarUrl = url;
				}
			} catch (err) {
				uni.showToast({ icon: 'none', title: '头像上传失败，请重试' });
			} finally {
				this.uploading = false;
			}
		},
		onChooseImg() {
			this.$tools.chooseImage(1).then(paths => {
				return this.$tools.uploadImage('index/upload', paths[0]);
			}).then(res => {
				const url = res?.full_url || res?.url || '';
				if (url) {
					this.userData.avatar = url;
					this.userData.avatarUrl = url;
				}
			}).catch(() => {
				uni.showToast({ icon: 'none', title: '头像上传失败，请重试' });
			});
		},
		async editUserInfo() {
			if (this.saving || this.uploading) {
				uni.showToast({ icon: 'none', title: this.uploading ? '头像上传中…' : '保存中…' });
				return;
			}
			const nickname = (this.userData.username || '').trim();
			const avatarUrl = (this.userData.avatar || this.userData.avatarUrl || '').trim();
			const openid = uni.getStorageSync('openid') || '';
			const isDefaultAvatar = !avatarUrl || avatarUrl.includes('/static/imgs/base_avatar');
			if (!nickname) {
				uni.showToast({ icon: 'none', title: '请填写昵称' });
				return;
			}
			if (!openid) {
				uni.showToast({ icon: 'none', title: '未获取到 openid，请重新登录' });
				return;
			}
			this.saving = true;
			try {
				const payload = {
					nickname,
					username: nickname,
					birthday: this.userData.birthday || '',
					openid,
					openId: openid
				};
				if (!isDefaultAvatar) {
					payload.avatar = avatarUrl;
					payload.avatarUrl = avatarUrl;
				}
				const res = await this.$api('user.editMember', payload);
				const ok = res?.flag === true || res?.code === 1;
				if (!ok) {
					uni.showToast({ icon: 'none', title: res?.msg || '保存失败' });
					return;
				}
				this.$tools.toast('修改信息成功');
				await Promise.all([
					this.getUserInfo?.().catch?.(() => null),
					this.getUserDetails?.().catch?.(() => null)
				]);
				setTimeout(() => this.$Router.back(), 800);
			} catch (e) {
				uni.showToast({ icon: 'none', title: '保存失败，请重试' });
			} finally {
				this.saving = false;
			}
		}
	}
};
</script>

<style lang="scss">
@import '@/static/style/user-center.scss';
.user-list {
	background: #fff;
	height: 100rpx;
	border-bottom: 1rpx solid #f6f6f6;
	padding: 0 20rpx;

	.list-name {
		font-size: 28rpx;
	}

	.avatar-btn {
		margin: 0;
		padding: 0;
		background: transparent;
		border: none;
		line-height: 1;
		&::after {
			border: none;
		}
	}

	.avatar {
		width: 67rpx;
		height: 67rpx;
		border-radius: 50%;
		background: #f2f2f2;
	}

	.cuIcon-right {
		margin-left: 25rpx;
	}

	.nick-wrap {
		flex: 1;
		justify-content: flex-end;
		min-width: 0;
	}

	.list-val {
		color: #999;
		font-size: 28rpx;
		text-align: right;
		flex: 1;
		min-width: 0;
	}

	.nick-ph {
		color: #ccc;
	}
}

.btn-box {
	margin-top: 60rpx;

	.confirem-btn {
		width: 710rpx;
		height: 80rpx;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		border: 1rpx solid rgba(238, 238, 238, 1);
		border-radius: 40rpx;
		font-size: 30rpx;
		color: rgba(#fff, 0.9);
	}
}
</style>

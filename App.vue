<script>
import { mapMutations, mapActions, mapState } from 'vuex';
import Wechat from './common/wechat/wechat';
import store from '@/common/store';
import api from '@/common/request/index';
import { DEFAULT_COLOR_LIST } from '@/common/runtime/platform';
import { getSystemInfoSafe } from '@/common/runtime/system-info';

export default {
	methods: {
		//应用初始化,获取模板,获取页面路由,获取用户信息,保存用户Token并返回初始进入页面
		...mapActions(['getAppInit', 'getTemplate', 'getRoutes', 'getUserInfo', 'setTokenAndBack', 'getLocation']),
		// 获取系统栏高度
		async setAppInfo() {
			let that = this;
			let platform = '';
			return new Promise((resolve, reject) => {
				getSystemInfoSafe({
					success: function(e) {
						that.StatusBar = e.statusBarHeight;
						// #ifdef H5
						that.CustomBar = e.statusBarHeight + 45;
						if (that.$wxsdk.isWechat()) {
							platform = 'wxOfficialAccount';
						} else {
							platform = 'H5';
						}
						// #endif
						// #ifdef APP-PLUS
						platform = 'App';
						if (e.platform == 'android') {
							uni.setStorageSync('isAndroid', true);
							that.CustomBar = e.statusBarHeight + 50;
						} else {
							that.CustomBar = e.statusBarHeight + 45;
							uni.setStorageSync('isAndroid', false);
						}
						// #endif
						// #ifdef MP-WEIXIN
						platform = 'wxMiniProgram';
						new Wechat().getWxMiniProgramSessionKey();
						let custom = wx.getMenuButtonBoundingClientRect();
						that.Custom = custom;
						that.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
						// #endif
						uni.setStorageSync('platform', platform);
						resolve(platform);
					},
					fail: reject
				});
			});
		},
		// 自动登录
		async autoLogin(data) {
			let initData = data;
			var wechat = new Wechat();
			if (initData.wechat.autologin && !uni.getStorageSync('token')) {
				// #ifdef H5
				uni.setStorageSync('appid', initData.wechat.appid);
				let token = await wechat.login();
				this.setTokenAndBack(token);
				// #endif
				// #ifdef MP-WEIXIN
				wechat.login();
				// #endif
				this.getUserInfo()
			}
		},
		async getAppLocal() {
			return new Promise((resolve, reject) => {
				let coords = {};
				uni.getLocation({
					type: 'wgs84',
					geocode: true,
					success: function(res) {
						coords.longitude = res.longitude;
						coords.latitude = res.latitude;
						resolve(coords);
					}
				});
			})
		}
	},
	onLaunch: async function(options) {
		// 色板已在 platform 默认注入；此处再写一次保证与旧逻辑一致
		this.ColorList = DEFAULT_COLOR_LIST.slice();
		//获取坐标
		if (options?.query?.mode === 'save') {
			//截图模式
			uni.setStorageSync('screenShot', true);
			uni.setStorageSync('shop_id', options.query.shop_id);
		}
		// #ifdef MP-WEIXIN
		if (options.scene !== 1154) {
			var wechat = new Wechat();
			wechat.resetSessionIfUpdated();
			wechat.checkMiniProgramUpdate();
		}
		// #endif
		await this.setAppInfo();
		/* let local = await this.getAppLocal();
		await this.getLocation(local); */
		// 真机重编译后 Vuex 初始可能丢门店，启动时再灌一次本地缓存
		try {
			const cachedStore = uni.getStorageSync('storeInfo');
			if (cachedStore && typeof cachedStore === 'object' && Object.keys(cachedStore).length) {
				this.$store.commit('STORE_INFO', cachedStore);
			}
			const cachedBal = uni.getStorageSync('balInfo');
			if (cachedBal && typeof cachedBal === 'object') {
				this.$store.commit('BAL_INFO', cachedBal);
			}
			const cachedUser = uni.getStorageSync('userInfo');
			if (cachedUser && typeof cachedUser === 'object' && Object.keys(cachedUser).length) {
				this.$store.commit('USER_INFO', cachedUser);
			}
		} catch (e) {}
		// 模板缓存秒开 + init 并行；登录/路由不挡首屏
		const [, init] = await Promise.all([
			this.getTemplate(options),
			this.getAppInit(options)
		]);
		this.autoLogin(init.data);
		this.getRoutes();
	},
	onShow: function() {
		this.$store.commit('CART_NUM');
		// #ifdef MP-WEIXIN
		new Wechat().checkMiniProgramUpdate();
		// #endif
	},
	onHide: function() {
		console.log('小程序关闭')
		let that = this
			uni.$once('escLoack',function(data){
				console.log(123)
				api('cinema.escSeats', data).then(res => {
					if (res.flag) {
						console.log('释放座位');
					}
				});
			    })
	}
};
</script>

<style lang="scss">
@import 'static/colorui/main.css';
@import 'static/colorui/icon.css';
@import 'uview-plus/index.scss';
@import 'static/style/design-system.scss';
@import 'static/style/overlay-system.scss';
@import 'static/style/_theme.scss';
// user-center.scss 仅用户分包页使用，已下沉到各 user-subpage，避免进主包 app.wxss
// 其他scss集成在uni.scss,(变量,class,minix)

uni-radio:not([disabled]) .uni-radio-input:hover,
uni-checkbox:not([disabled]) .uni-checkbox-input:hover {
	border-color: #ccc !important;
}

page {
	-webkit-overflow-scrolling: touch; //ios滑动不流畅
	height: 100%;
	background: var(--tt-bg);
	width: 100%;
	font-size: 30upx;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif;
	word-break: break-all; //英文文本不换行
	color: var(--tt-text);
}
::-webkit-scrollbar {
	width: 0;
	height: 0;
	color: transparent;
	display: none;
}
</style>

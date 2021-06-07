<script>
import Vue from 'vue';
import { mapMutations, mapActions, mapState } from 'vuex';
import Wechat from './common/wechat/wechat';
import store from '@/common/store';
import api from '@/common/request/index'
export default {
	methods: {
		//应用初始化,获取模板,获取页面路由,获取用户信息,保存用户Token并返回初始进入页面
		...mapActions(['getAppInit', 'getTemplate', 'getRoutes', 'getUserInfo', 'setTokenAndBack', 'getLocation']),
		// 获取系统栏高度
		async setAppInfo() {
			let that = this;
			let platform = '';
			return new Promise((resolve, reject) => {
				uni.getSystemInfo({
					success: function(e) {
						Vue.prototype.StatusBar = e.statusBarHeight;
						// #ifdef H5
						Vue.prototype.CustomBar = e.statusBarHeight + 45;
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
							Vue.prototype.CustomBar = e.statusBarHeight + 50;
						} else {
							Vue.prototype.CustomBar = e.statusBarHeight + 45;
							uni.setStorageSync('isAndroid', false);
						}
						// #endif

						// #ifdef MP-WEIXIN
						platform = 'wxMiniProgram';
						new Wechat().getWxMiniProgramSessionKey();
						let custom = wx.getMenuButtonBoundingClientRect();
						Vue.prototype.Custom = custom;
						Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
						// #endif
						uni.setStorageSync('platform', platform);
						resolve(platform);
					}
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
		Vue.prototype.ColorList = [{
				title: '嫣红',
				name: 'red',
				color: '#e54d42'
			},
			{
				title: '桔橙',
				name: 'orange',
				color: '#f37b1d'
			},
			{
				title: '明黄',
				name: 'yellow',
				color: '#fbbd08'
			},
			{
				title: '橄榄',
				name: 'olive',
				color: '#8dc63f'
			},
			{
				title: '森绿',
				name: 'green',
				color: '#39b54a'
			},
			{
				title: '天青',
				name: 'cyan',
				color: '#1cbbb4'
			},
			{
				title: '海蓝',
				name: 'blue',
				color: '#0081ff'
			},
			{
				title: '姹紫',
				name: 'purple',
				color: '#6739b6'
			},
			{
				title: '木槿',
				name: 'mauve',
				color: '#9c26b0'
			},
			{
				title: '桃粉',
				name: 'pink',
				color: '#e03997'
			},
			{
				title: '棕褐',
				name: 'brown',
				color: '#a5673f'
			},
			{
				title: '玄灰',
				name: 'grey',
				color: '#8799a3'
			},
			{
				title: '草灰',
				name: 'gray',
				color: '#aaaaaa'
			},
			{
				title: '墨黑',
				name: 'black',
				color: '#333333'
			},
			{
				title: '雅白',
				name: 'white',
				color: '#ffffff'
			},
		]
		//获取坐标
		if (options.query.mode === 'save') {
			//截图模式
			uni.setStorageSync('screenShot', true);
			uni.setStorageSync('shop_id', options.query.shop_id);
		}
		// #ifdef MP-WEIXIN
		if (options.scene !== 1154) {
			var wechat = new Wechat();
			wechat.checkMiniProgramUpdate();
		}
		// #endif
		await this.setAppInfo();
		/* let local = await this.getAppLocal();
		await this.getLocation(local); */
		await this.getTemplate(options);
		let init = await this.getAppInit(options);
		await this.autoLogin(init.data);
		await this.getRoutes();
	},
	onShow: function() {
		this.$store.commit('CART_NUM');
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
@import 'uview-ui/index.scss';
// 其他scss集成在uni.scss,(变量,class,minix)

uni-radio:not([disabled]) .uni-radio-input:hover,
uni-checkbox:not([disabled]) .uni-checkbox-input:hover {
	border-color: #ccc !important;
}

page {
	-webkit-overflow-scrolling: touch; //ios滑动不流畅
	height: 100%;
	background: #f6f6f6;
	width: 100%;
	font-size: 30upx;
	font-family: NotoSansHans-Bold;
	word-break: break-all; //英文文本不换行
	color: #333;
}
::-webkit-scrollbar {
	width: 0;
	height: 0;
	color: transparent;
	display: none;
}
</style>

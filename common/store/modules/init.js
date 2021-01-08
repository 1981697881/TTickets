// 初始化数据模块
import api from '@/common/request/index'
import store from '@/common/store'
import Router from '@/common/router';
import init from '@/csJson/init.json';
import template from '@/csJson/template.json';
import {
	INIT_DATA,
	PAGE_ROUTES,
	CART_NUM,
	LOC_CITY,
	TEMPLATE_DATA
} from '../types.js'
const state = {
	initData: {},
	city: [],
	routes: [],
	addons: uni.getStorageSync('addons') ? uni.getStorageSync('addons') : [], //插件列表
	templateData: uni.getStorageSync('templateData') ? uni.getStorageSync('templateData') : {},
	hasTemplate:true//是否有初始化数据
}

const actions = {
	//获取定位
	getLocation({
		commit 
	}, options) {
		return new Promise((resolve, reject) => {
			 let URL = 'https://apis.map.qq.com/ws/geocoder/v1/?location=';
			 let key = 'OKYBZ-EF4AJ-OJFFM-KJOVL-GFN5S-4MBY3'; //你申请的开发者密钥（Key）  一般放在后台获取过来
			 let getAddressUrl = URL + options.latitude + ',' + options.longitude + `&key=${key}`;
			 wx.request({
			 	url: getAddressUrl,
			 	success: result => {
			 		let Res_Data = result.data.result;
					 commit('LOC_CITY', {'cityName':Res_Data.address_component.city.replace('市','')});
			 		 resolve(Res_Data)
			 	}
			 });
		})
	},
	getAppInit({
		commit
	}, options) {
		uni.setStorageSync('mode', 'product');
		return new Promise((resolve, reject) => {
			let res = init
			commit('INIT_DATA', res.data);
			uni.setStorageSync('sysInfo', res.data.info);
			uni.setStorageSync('shareInfo', res.data.share);
			uni.setStorageSync('addons', res.data.addons)
			 resolve(res)
			 //初始化请求
			/* api('init').then(res => {
				commit('INIT_DATA', res.data);
				uni.setStorageSync('sysInfo', res.data.info);
				uni.setStorageSync('shareInfo', res.data.share);
				uni.setStorageSync('addons', res.data.addons)
				console.log(JSON.stringify(res))
				resolve(res)
			}).catch(e => {
				reject(e)
			}) */
		})
	},
	// 同步前端路由
	getRoutes({
		commit
	}) {
		return new Promise((resolve, reject) => {
			resolve('')
			/* api('dev.asyncLink', {
				data: ROUTES
			}).then(res => {
				commit('PAGE_ROUTES', res.data);
				resolve(res)
			}).catch(e => {
				reject(e)
			}) */
		})
	},
	// 模板信息
	getTemplate({
		commit
	}, options = {}) {
		var params = {};
		return new Promise((resolve, reject) => {
			//请求预览商城模板
			if (options.query && options.query.shop_id) {
				params.shop_id = options.query.shop_id;
			}
			if (options.query && options.query.custom_id) {
				Router.replace({
					path: '/pages/index/view',
					query: {
						id: options.query.custom_id,
					}
				});
			}
			let res = template
			uni.setStorageSync('templateData', res.data);
			commit('TEMPLATE_DATA', res.data);
			if(res.code == 0){
				commit('hasTemplate', false);
			}
			resolve(res)
			/* api('template', params).then(res => {
				uni.setStorageSync('templateData', res.data);
				commit('TEMPLATE_DATA', res.data);
				if(res.code == 0){
					commit('hasTemplate', false);
				}
				resolve(res)
			}).catch(e => {
				reject(e)
			}) */
		})
	},
}

const mutations = {
	[PAGE_ROUTES](state, data) {
		state.routes = data
	},
	[LOC_CITY](state, data) {
		state.city = data
	},
	[INIT_DATA](state, data) {
		state.initData = data
	},
	[TEMPLATE_DATA](state, data) {
		state.templateData = data
	},
	hasTemplate(state, data) {
		state.hasTemplate = data
	},
	// 弹窗一次的话，关闭的时候删除数据。
	delPopup(state, path) {
		uni.removeStorageSync('templateData');
		let templateData = state.templateData
		templateData.popup[0].content.list.forEach(item => {
			if (item.page.includes(path)) {
				let index = item.page.indexOf(path);
				item.page.splice(index, 1)
			}
		})
		uni.setStorageSync('templateData', templateData);
		state.templateData = templateData;
	}
}

const getters = {

}

export default {
	state,
	mutations,
	actions,
	getters
}

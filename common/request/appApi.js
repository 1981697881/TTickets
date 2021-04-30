/**
 * 接口列表文件
 */
export default {
	/** 初始化 ↓ **/
	init: {
		url: 'web/index/init',
		auth: false,
		method: 'GET',
		// desc: '初始化数据',
	},
	posterList:{
		url: 'web/app/api/posterList',
		auth: false,
		method: 'POST',
		// desc: '获取广告轮播',
	},
	menuList:{
		url: 'web/app/api/menuList',
		auth: false,
		method: 'POST',
		// desc: '获取菜单',
	},
	/** 上传图片 ↓ **/
	upload: {
		url: 'web/index/upload',
		auth: true,
		method: 'POST',
		// desc: '上传',
	},

	/** 上传Base64图片 ↓ **/
	uploadBase64: {
		url: 'web/index/uploadBase64',
		auth: false,
		method: 'POST',
		// desc: '上传Base64位图片',
	},

	/** 消息订阅模板 ↓ **/
	messageIds: {
		url: 'web/notification/template',
		auth: true,
		method: 'GET',
		// desc: '订阅消息模板ids',
	},

	/** 模板信息 ↓ **/
	template: {
		url: 'web/index/template',
		auth: false,
		method: 'GET',
		// desc: '模板信息',
	},
	/** 自定义模板页面 ↓ **/
	custom: {
		url: 'web/index/custom',
		auth: false,
		method: 'GET',
		// desc: '自定义模板页面',
	},

	/** 直播 ↓ **/
	live: {
		url: 'web/live',
		auth: false,
		method: 'GET',
		// desc: '直播列表',
	},
	/** 微信Jssdk ↓ **/
	wechat: {
		jssdk: {
			url: 'web/wechat/jssdk',
			auth: false,
			method: 'POST',
			// desc: '微信Jssdk',
		},
	},
	/** 签到 ↓ **/
	user_sign: {
		index: {
			url: 'web/user_sign/index',
			auth: true,
			method: 'GET',
			// desc: '签到记录',
		},
		sign: {
			url: 'web/user_sign/sign',
			auth: true,
			method: 'POST',
			// desc: '签到',
		}
	},

	/** 同步路由 ↓ **/
	dev: {
		asyncLink: {
			url: 'web/index/asyncLink',
			auth: false,
			method: 'POST',
			// desc: '路由表',
		},
		asyncDecorateScreenShot: {
			url: 'web/index/asyncDecorateScreenShot',
			auth: false,
			method: 'POST',
			// desc: '更新店铺装修截图',
		},
		asyncBannerBgColor: {
			url: 'web/index/asyncBannerBgColor',
			auth: false,
			method: 'POST',
			// desc: '路由表',
		},
		debug: {
			url: 'web/index/debugLog',
			auth: false,
			method: 'POST',
		}
	},

	/** 富文本  ↓ **/
	richtext: {
		url: 'web/index/richtext',
		auth: false,
		method: 'GET',
		// desc: '富文本数据',
	},

	/** 三级分类 ↓ **/
	category: {
		url: 'web/category',
		auth: false,
		method: 'GET',
		// desc: '三级分类',
	},
	/** 二级分类 ↓ **/
	categoryGoods: {
		url: 'web/category/goods',
		auth: false,
		method: 'GET',
		// desc: '点餐用',
	},

	/** 积分商城 ↓ **/
	score: {
		list: {
			url: 'web/score_goods_sku_price/index',
			auth: false,
			method: 'GET',
			// desc: '积分商品列表',
		},
		detail: {
			url: 'web/score_goods_sku_price/detail',
			auth: false,
			method: 'GET',
			// desc: '积分详情',
		},
	},

	/** 商户 ↓ **/
	store: {
		list: {
			url: 'web/store/index',
			auth: true,
			method: 'GET',
			// desc: '商户列表，不需要storeId',
		},
		info: {
			url: 'web/store.store/index',
			auth: true,
			method: 'GET',
			// desc: '商户信息',
		},
		order: {
			url: 'web/store.order/index',
			auth: true,
			method: 'GET',
			// desc: '商户订单',
		},
		orderDetail: {
			url: 'web/store.order/detail',
			auth: true,
			method: 'GET',
			// desc: '订单详情',
		},
		orderSend: {
			url: 'web/store.order/send',
			auth: true,
			method: 'POST',
			// desc: '订单发货',
		},
		orderConfirm: {
			url: 'web/store.order/confirm',
			auth: true,
			method: 'POST',
			// desc: '核销订单',
		},
	},

	/** 商品评论 ↓ **/
	goods_comment: {
		list: {
			url: 'web/goods_comment/index',
			auth: false,
			method: 'GET',
			// desc: '商品评论列表',
		},
		type: {
			url: 'web/goods_comment/type',
			auth: false,
			method: 'GET',
			// desc: '商品评论分类',
		},
	},
	/** 票夹 ↓ **/
	wallet:{
		lists: {
			url: 'web/memberTicket/userTicketForm',
			auth: true,
			method: 'POST',
			// desc: '票劵列表',
		},
		detail: {
			url: 'web/FH/getTicketInfo',
			auth: true,
			method: 'POST',
			// desc: '票劵详情',
		},
	},
	/** 影讯 ↓ **/
	cinema: {
		lists: {
			url: 'web/app/api/hotMovieList',
			auth: false,
			method: 'POST',
			// desc: '影片列表',
		},
		filmLists: {
			url: 'web/app/api/schedulesByMovie',
			auth: false,
			method: 'POST',
			// desc: '影片的影城和场次',
		},
		seatsLists: {
			url: 'web/app/api/scheduleSeats',
			auth: false,
			method: 'POST',
			// desc: '座位列表',
		},
		SchedulesSoldSeats: {
			url: 'web/app/api/downloadScheduleSoldSeats',
			auth: false,
			method: 'POST',
			// desc: '场次座位状态',
		},lockSeats: {
			url: 'web/FH/lockSeats',
			auth: true,
			method: 'POST',
			// desc: '锁位',
		},
		confirmOrder: {
			url: 'web/FH/confirmOrder',
			auth: true,
			method: 'POST',
			// desc: '确认订单',
		},
		escSeats: {
			url: 'web/FH/releaseSeats',
			auth: true,
			method: 'POST',
			// desc: '取消锁位',
		},
		studios: {
			url: 'web/app/api/locations',
			auth: false,
			method: 'POST',
			// desc: '影城',
		},locationList: {
			url: 'web/app/api/locationList',
			auth: false,
			method: 'POST',
			// desc: '影城',
		},
		locationMovies: {
			url: 'web/app/api/locationMovies',
			auth: false,
			method: 'POST',
			// desc: '影城下的影片',
		},
		locationSchedules: {
			url: 'web/app/api/locationSchedules',
			auth: false,
			method: 'POST',
			// desc: '影城下影片的场次',
		},
		movieMessage: {
			url: 'web/app/api/movieMessage',
			auth: false,
			method: 'POST',
			// desc: '影片详情',
		},
	},
	/** 商品 ↓ **/
	goods: {
		lists: {
			url: 'web/goods/lists',
			auth: false,
			method: 'GET',
			// desc: '商品列表',
		},commodityList: {
			url: 'web/app/api/commodityList',
			auth: false,
			method: 'POST',
			// desc: '卖品列表',
		},payGoodsMoney: {
			url: 'web/WeChat/payGoodsMoney',
			auth: true,
			method: 'POST',
			// desc: '卖品支付',
		},payCoinMoney: {
			url: 'web/WeChat/payCoinMoney',
			auth: true,
			method: 'POST',
			// desc: '游戏币支付',
		},veCoin: {
			url: 'web/V8/Coin',
			auth: true,
			method: 'POST',
			// desc: '游戏币充值',
		},veIntegral: {
			url: 'web/V8/Integral',
			auth: true,
			method: 'POST',
			// desc: '积分充值',
		},memberGoodsList: {
			url: 'web/memberGoods/memberGoodsList',
			auth: true,
			method: 'POST',
			// desc: '商品订单列表',
		},
		seckillList: {
			url: 'web/goods/seckillList',
			auth: false,
			method: 'GET',
			// desc: '秒杀列表',
		},
		activity: {
			url: 'web/goods/activity',
			auth: false,
			method: 'GET',
			// desc: '活动商品',
		},
		myGroupon: {
			url: 'web/activity_groupon/myGroupon',
			auth: true,
			method: 'GET',
			// desc: '我的拼团',
		},
		grouponDetail: {
			url: 'web/activity_groupon/detail',
			auth: true,
			method: 'GET',
			// desc: '拼团详情',
		},
		grouponItem: {
			url: 'web/activity_groupon/index',
			auth: false,
			method: 'GET',
			// desc: '拼购列表',
		},
		grouponList: {
			url: 'web/goods/grouponList',
			auth: false,
			method: 'GET',
			// desc: '拼团商品列表',
		},
		detail: {
			url: 'web/goods/detail',
			auth: false,
			method: 'GET',
			// desc: '商品详情',
		},
		favorite: {
			url: 'web/goods/favorite',
			auth: true,
			method: 'POST',
			// desc: '商品收藏',
		},
		favoriteList: {
			url: 'web/goods/favoriteList',
			auth: true,
			method: 'GET',
			// desc: '商品收藏列表',
		},
		viewList: {
			url: 'web/goods/viewList',
			auth: true,
			method: 'GET',
			// desc: '足迹列表',
		},
		viewDelete: {
			url: 'web/goods/viewDelete',
			auth: true,
			method: 'POST',
			// desc: '删除足迹',
		},
		storeAddress: {
			url: 'web/goods/store',
			auth: true,
			method: 'GET',
			// desc: '商品支持的自提点',
		},
	},

	/** 用户 ↓ **/
	user: {
		info: {
			url: 'web/user',
			auth: true,
			method: 'GET',
			// desc: '用户信息',
		},balance: {
			url: 'web/V8/Balance',
			auth: true,
			method: 'POST',
			// desc: '用户余额',
		},deduction: {
			url: 'web/V8/Deduction',
			auth: true,
			method: 'POST',
			// desc: '用户余额操作',
		},recharge: {
			url: 'web/V8/Recharge',
			auth: true,
			method: 'POST',
			// desc: 'v8用户充值',
		},payRecharge: {
			url: 'web/WeChat/payRechargeMoney',
			auth: true,
			method: 'POST',
			// desc: '用户充值生成预付订单',
		},
		member: {
			url: 'web/member/loginMember',
			auth: true,
			method: 'POST',
			// desc: '用户信息',
		},
		transactionLogDorRList: {
			url: 'web/transactionLog/transactionLogDorRList',
			auth: true,
			method: 'POST',
			// desc: '用户钱包账单列表',
		},

		profile: {
			url: 'web/user/profile',
			auth: true,
			method: 'POST',
			// desc: '修改用户信息',
		},

		changemobile: {
			url: 'web/user/changemobile',
			auth: true,
			method: 'POST',
			// desc: '修改手机号',
		},

		changepwd: {
			url: 'web/user/changepwd',
			auth: true,
			method: 'POST',
			// desc: '修改密码',
		},

		resetpwd: {
			url: 'web/user/resetpwd',
			auth: false,
			method: 'POST',
			// desc: '重置密码',
		},

		mobileLogin: {
			url: 'web/user/mobileLogin',
			auth: false,
			method: 'POST',
			// desc: '手机验证码登录',
		},

		accountLogin: {
			url: 'web/user/accountLogin',
			auth: false,
			method: 'POST',
			// desc: '账号密码登录',
		},

		getWxMiniProgramSessionKey: {
			url: 'web/weChat/memberAuthorize',
			auth: false,
			method: 'POST',
			// desc: '获取用户session_key',
		},
		getWxMiniPhoneNumber: {
			url: 'web/phone/phoneNumber',
			auth: false,
			method: 'POST',
			// desc: '获取用户手机号码',
		},

		wxMiniProgramLogin: {
			url: 'web/weChat/memberLogin',
			auth: false,
			method: 'POST',
			// desc: '微信小程序登录',
		},

		wxOpenPlatformLogin: {
			url: 'web/user/wxOpenPlatformLogin',
			auth: false,
			method: 'POST',
			// desc: '微信APP登录',
		},

		register: {
			url: 'web/user/register',
			auth: false,
			method: 'POST',
			// desc: '用户注册',
		},
		forgot: {
			url: 'web/user/forgot',
			auth: false,
			method: 'POST',
			// desc: '忘记密码',
		},
		cdKeyList: {
			url: 'web/cdkey/cdKeyList',
			auth: true,
			method: 'POST',
			//desc: '团体票列表',
		},cdKeysList: {
			url: 'web/memberCdkey/CdKeys',
			auth: true,
			method: 'POST',
			//desc: '已购买团体票列表',
		},CdKeyDetails: {
			url: 'web/memberCdkeyDetail/CdKeyDetails',
			auth: true,
			method: 'POST',
			//desc: '团体票详情',
		},
		exchangeCdKey: {
			url: 'web/memberCdkeyDetail/exchangeCdKey',
			auth: true,
			method: 'POST',
			//desc: '团体票兑换',
		},
		payCdKeyMoney: {
			url: 'web/WeChat/payCdKeyMoney',
			auth: true,
			method: 'POST',
			//desc: '团体票购买',
		},
	},

	/** 分享 ↓ **/
	share: {
		add: {
			url: 'web/share/add',
			auth: false,
			method: 'POST',
			// desc: '添加分享记录',
		}
	},

	/** 位置 ↓ **/
	address: {
		area: {
			url: 'web/address/area',
			auth: false,
			method: 'GET',
			// desc: '省市区',
		},
		list: {
			url: 'web/address',
			auth: true,
			method: 'GET',
			// desc: '地址列表',
		},
		edit: {
			url: 'web/address/edit',
			auth: true,
			method: 'POST',
			// desc: '修改地址',
		},
		defaults: {
			url: 'web/address/defaults',
			auth: true,
			method: 'GET',
			// desc: '默认地址',
		},
		info: {
			url: 'web/address/info',
			auth: true,
			method: 'GET',
			// desc: '地址详情',
		},
		del: {
			url: 'web/address/del',
			auth: true,
			method: 'POST',
			// desc: '删除',
		},
	},

	/** 短信 ↓ **/
	sms: {
		send: {
			url: 'web/sms/send',
			auth: false,
			method: 'POST',
			// desc: '发送短信',
		},
	},

	/** 常见问题 ↓ **/
	faq: {
		list: {
			url: 'web/faq',
			auth: false,
			method: 'GET',
			// desc: '常见问题列表',
		},
	},

	/** 意见反馈 ↓ **/
	feedback: {
		type: {
			url: 'web/feedback/type',
			auth: true,
			method: 'GET',
			// desc: '意见反馈类型',
		},
		add: {
			url: 'web/feedback/add',
			auth: true,
			method: 'POST',
			// desc: '提交意见',
		},
	},

	/** 购物车 ↓ **/
	cart: {
		index: {
			url: 'web/cart',
			auth: true,
			method: 'POST',
			// desc: '购物车商品列表',
		},
		add: {
			url: 'web/cart/add',
			auth: true,
			method: 'POST',
			// desc: '添加购物车',
		},

		edit: {
			url: 'web/cart/edit',
			auth: true,
			method: 'POST',
			// desc: '编辑购物车',
		},
	},

	/** 订单 ↓ **/
	order: {
		index: {
			url: 'web/order/index',
			auth: true,
			method: 'GET',
			// desc: '订单列表',
		},
		pre: {
			url: 'web/order/pre',
			auth: true,
			method: 'POST',
			// desc: '预备提交订单',
		},
		createOrder: {
			url: 'web/order/createOrder',
			auth: true,
			method: 'POST',
			// desc: '提交订单',
		},
		detail: {
			url: 'web/order/detail',
			auth: true,
			method: 'GET',
			// desc: '订单详情',
		},
		itemDetail: {
			url: 'web/order/itemDetail',
			auth: true,
			method: 'GET',
			// desc: '订单商品详情',
		},
		confirm: {
			url: 'web/order/confirm',
			auth: true,
			method: 'POST',
			// desc: '确认收货',
		},
		refund: {
			url: 'web/order/refund',
			auth: true,
			method: 'POST',
			// desc: '申请退款',
		},
		cancel: {
			url: 'web/order/cancel',
			auth: true,
			method: 'POST',
			// desc: '取消订单',
		},
		statusNum: {
			url: 'web/order/statusNum',
			auth: true,
			method: 'GET',
			// desc: '订单dot',
		},
		comment: {
			url: 'web/order/comment',
			auth: true,
			method: 'POST',
			// desc: '评价商品',
		},
		coupons: {
			url: 'web/order/coupons',
			auth: true,
			method: 'POST',
			// desc: '商品可用优惠券',
		},
		aftersale: {
			url: 'web/order_aftersale/aftersale',
			auth: true,
			method: 'POST',
			// desc: '申请售后',
		},
		aftersaleList: {
			url: 'web/order_aftersale/index',
			auth: true,
			method: 'GET',
			// desc: '售后列表',
		},
		aftersaleDetail: {
			url: 'web/order_aftersale/detail',
			auth: true,
			method: 'GET',
			// desc: '售后列表详情',
		},
		deleteOrder: {
			url: 'web/order/delete',
			auth: true,
			method: 'POST',
			// desc: '删除订单',
		},
		deleteAftersaleOrder: {
			url: 'web/order_aftersale/delete',
			auth: true,
			method: 'POST',
			// desc: '删除售后订单',
		},
		cancelAftersaleOrder: {
			url: 'web/order_aftersale/cancel',
			auth: true,
			method: 'POST',
			// desc: '取消售后订单',
		},
		expressList: {
			url: 'web/order_express/index',
			auth: true,
			method: 'GET',
			// desc: '包裹列表',
		},
		expressDetail: {
			url: 'web/order_express/detail',
			auth: true,
			method: 'GET',
			// desc: '包裹详情',
		},
		/* itemDetail: {
			url: 'web/order/itemDetail',
			auth: true,
			method: 'GET',
			// desc: '订单商品详情',
		} */
	},

	/** 支付 ↓ **/
	pay: {
		prepay: {
			url: 'web/WeChat/payMoney',
			auth: true,
			method: 'POST',
			// desc: '发起支付',
		},
	},

	/** 提现 ↓ **/
	user_wallet_apply: {
		apply: {
			url: 'web/user_wallet_apply/apply',
			auth: true,
			method: 'POST',
			// desc: '申请提现',
		},
		rule: {
			url: 'web/user_wallet_apply/rule',
			auth: true,
			method: 'GET',
			// desc: '体现规则',
		}

	},

	/** 钱包明细 ↓ **/
	user_wallet_log: {
		url: 'web/user_wallet_log',
		auth: true,
		method: 'GET',
		// desc: '钱包明细',
	},

	/** 银行卡 ↓ **/
	user_bank: {
		info: {
			url: 'web/user_bank/info',
			auth: true,
			method: 'GET',
			// desc: '银行卡信息',
		},
		edit: {
			url: 'web/user_bank/edit',
			auth: true,
			method: 'POST',
			// desc: '编辑银行卡信息',
		}
	},

	/** 评论 ↓ **/
	comment: {
		submit: {
			url: 'web/comment/submit',
			auth: true,
			method: 'POST',
			// desc: '提交评论',
		},
		list: {
			url: 'web/comment/list',
			auth: true,
			method: 'GET',
			// desc: '评论列表',
		}
	},

	/** 优惠券 ↓ **/
	coupons: {
		list: {
			url: 'web/memberCouponDetail/list',
			auth: true,
			method: 'POST',
			// desc: '个人中心优惠券列表',
		},
		lists: {
			url: 'web/coupons/lists',
			auth: false,
			method: 'GET',
			// desc: '首页优惠券',
		},
		get: {
			url: 'web/coupons/get',
			auth: true,
			method: 'GET',
			// desc: '领取',
		},
		detail: {
			url: 'web/coupons/detail',
			auth: true,
			method: 'GET',
			// desc: '购物券详情',
		},
		goods: {
			url: 'web/coupons/goods',
			auth: true,
			method: 'GET',
			// desc: '适用商品',
		}
	},


};

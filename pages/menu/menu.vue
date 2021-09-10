<template>
	<view>
		<view class="container" v-if="!loading">
			<view class="main" v-if="goods.length">
				<view class="nav">
					<view class="coupon">
						<text class="title">小食和商品</text>
						<view class="iconfont iconarrow-right"></view>
					</view>
				</view>
				<view class="content">
					<!-- <scroll-view class="menus" :scroll-into-view="menuScrollIntoView" scroll-with-animation scroll-y>
						<view class="wrapper">
							<view
								class="menu"
								:id="`menu-${item.id}`"
								:class="{ current: item.id === currentCateId }"
								v-for="(item, index) in goods"
								:key="index"
								@tap="handleMenuTap(item.id)"
							>
								<text>{{ item.name }}</text>
								<view class="dot" v-show="menuCartNum(item.id)">{{ menuCartNum(item.id) }}</view>
							</view>
						</view>
					</scroll-view> -->
					<!-- goods list begin -->
					<scroll-view class="goods" scroll-with-animation scroll-y :scroll-top="cateScrollTop" @scroll="handleGoodsScroll">
						<view class="wrapper">
							<!-- <swiper class="ads" id="ads" autoplay :interval="3000" indicator-dots>
								<swiper-item v-for="(item, index) in ads" :key="index"><image :src="item.image"></image></swiper-item>
							</swiper> -->
							<view class="list">
								<!-- category begin -->
								<view class="category" >
									<view class="items">
										<!-- 商品 begin  "-->
										<view class="good" v-for="(good, key) in goods" :key="key">
											<image @tap="jump('/pages/menu/detail', { PackageId: good.PackageId })" :src="good.ImagePath|| 'https://cfzx.gzfzdev.com/movie/uploadFiles/image/zanwu.jpg'" class="image"></image>
											<view class="right">
												<text class="name">{{good.PackageName}}</text>
												<text class="tips">{{good.Note}}</text>
												<view class="price_and_action">
													<text class="price">￥{{ good.PackageAmount }} <text class="price text-gray" style="text-decoration:line-through">￥{{ good.OriginalPrice }}</text></text> 
													<view class="btn-group">
														销量:<text class="text-red padding-right">{{good.SaleQty}}</text>
														<button class="cu-btn cuIcon sm round shadow bg-orange" @tap="toPay(good)">
															<text class="cuIcon-cart"></text>
														</button>
													</view>
													<!-- <view class="btn-group" v-if="good.use_property">
														<button  class="btn property_btn bg-green" hover-class="none" size="mini" @tap="showGoodDetailModal(item, good)">
															选规格
														</button>
														<view class="dot" v-show="goodCartNum(good.goodsId)">{{ goodCartNum(good.goodsId) }}</view>
													</view>
													<view class="btn-group" v-else>
														<button
															type="default"
															v-show="goodCartNum(good.goodsId)"
															plain
															class="btn reduce_btn cuIcon"
															size="mini"
															hover-class="none"
															@tap="handleReduceFromCart('', good)"
														>
															<view class="cuIcon-move"></view>
														</button>
														<view class="number" v-show="goodCartNum(good.goodsId)">{{ goodCartNum(good.goodsId) }}</view>
														<button class="btn add_btn cuIcon bg-green" size="min" hover-class="none" @tap="handleAddToCart('', good, 1)">
															<view class="cuIcon-add"></view>
														</button>
													</view> -->
												</view>
											</view>
										</view>
										<!-- 商品 end -->
									</view>
								</view>
								<!-- category end -->
							</view>
						</view>
					</scroll-view>
					<!-- goods list end -->
				</view>
				<!-- content end -->
				<!-- 购物车栏 begin -->
				<view class="cart-box" v-if="cart.length > 0">
					<view class="mark">
						<image src="/static/imgs/menu/cart.png" class="cart-img" @tap="openCartPopup"></image>
						<view class="tag">{{ getCartGoodsNumber }}</view>
					</view>
					<view class="price">￥{{ getCartGoodsPrice }}</view>
					<button type="primary" class="pay-btn" @tap="toPay" :disabled="disabledPay">{{ disabledPay ? `差${spread}元起送` : '去结算' }}</button>
				</view>
				<!-- 购物车栏 end -->
			</view>
			<!-- 商品详情模态框 begin -->
			<modal :show="goodDetailModalVisible" class="good-detail-modal" color="#5A5B5C" width="90%" custom padding="0rpx" radius="12rpx">
				<view class="cover">
					<image v-if="good.images" :src="good.images" class="image"></image>
					<view class="btn-group">
						<image src="/static/imgs/menu/share-good.png"></image>
						<image src="/static/imgs/menu/close.png" @tap="closeGoodDetailModal"></image>
					</view>
				</view>
				<scroll-view class="detail" scroll-y>
					<view class="wrapper">
						<view class="basic">
							<view class="name">{{ good.name }}</view>
							<view class="tips">{{ good.content }}</view>
						</view>
						<view class="properties" v-if="good.use_property">
							<view class="property" v-for="(item, index) in good.property" :key="index">
								<view class="title">
									<text class="name">{{ item.name }}</text>
									<view class="desc" v-if="item.desc">({{ item.desc }})</view>
								</view>
								<view class="values">
									<view
										class="value"
										v-for="(value, key) in item.values"
										:key="key"
										:class="{ default: value.is_default }"
										@tap="changePropertyDefault(index, key)"
									>
										{{ value.value }}
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="action">
					<view class="left">
						<view class="price">￥{{ good.price }}</view>
						<view class="props" v-if="getGoodSelectedProps(good)">{{ getGoodSelectedProps(good) }}</view>
					</view>
					<view class="btn-group">
						<button type="default" plain class="btn" size="mini" hover-class="none" @tap="handlePropertyReduce"><view class="iconfont iconsami-select"></view></button>
						<view class="number">{{ good.number }}</view>
						<button type="primary" class="btn" size="min" hover-class="none" @tap="handlePropertyAdd"><view class="iconfont iconadd-select"></view></button>
					</view>
				</view>
				<view class="add-to-cart-btn" @tap="handleAddToCartInModal"><view>加入购物车</view></view>
			</modal>
			<!-- 商品详情模态框 end -->
			<!-- 购物车详情popup -->
			<!-- <popup-layer direction="top" :show-pop="cartPopupVisible" class="cart-popup">
				<template slot="content">
					<view class="top"><text @tap="handleCartClear">清空</text></view>
					<scroll-view class="cart-list" scroll-y>
						<view class="wrapper">
							<view class="item" v-for="(item, index) in cart" :key="index">
								<view class="left">
									<view class="name">{{ item.goodsName }}</view>
									<view class="props"></view>
								</view>
								<view class="center">
									<text>￥{{ item.goodsPrice }}</text>
								</view>
								<view class="right">
									<button type="default" plain size="mini" class="btn cuIcon" hover-class="none" @tap="handleCartItemReduce(index)">
										<view class="cuIcon-move"></view>
									</button>
									<view class="number">{{ item.goodsCount }}</view>
									<button type="primary" class="btn cuIcon" size="min" hover-class="none" @tap="handleCartItemAdd(index)">
										<view class="cuIcon-add"></view>
									</button>
								</view>
							</view>
							<view class="item" v-if="orderType == 'takeout' && store.packing_fee">
								<view class="left"><view class="name">包装费</view></view>
								<view class="center">
									<text>￥{{ parseFloat(store.packing_fee) }}</text>
								</view>
								<view class="right invisible">
									<button type="default" plain size="mini" class="btn cuIcon" hover-class="none"><view class="cuIcon-move"></view></button>
									<view class="number">1</view>
									<button type="primary" class="btn cuIcon" size="min" hover-class="none"><view class="cuIcon-add"></view></button>
								</view>
							</view>
						</view>
					</scroll-view>
				</template>
			</popup-layer> -->
			<!-- 购物车详情popup -->
		</view>
		<view class="loading" v-else><image src="/static/imgs/loading.gif"></image></view>
		<view class="foot_box"></view>
		<!-- 自定义底部导航 -->
		<!-- <app-tabbar></app-tabbar> -->
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
		<!-- 门店选择 -->
		<app-address-model @init="init"></app-address-model>
	</view>
</template>

<script>
import modal from '@/components/modal/modal';
import popupLayer from '@/components/popup-layer/popup-layer';
import goods from '@/csJson/goods.js';
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';

export default {
	components: {
		modal,
		popupLayer
	},
	data() {
		return {
			goods: [], //所有商品
			ads: [
				{ image: 'http://139.159.136.187:50080/uploadFiles/image/32a545c356d8054f42612132a3535d31.jpeg' },
			],
			loading: true,
			currentCateId: 6905, //默认分类
			cateScrollTop: 0,
			menuScrollIntoView: '',
			cart: [], //购物车
			goodDetailModalVisible: false, //是否饮品详情模态框
			good: {}, //当前饮品
			category: {}, //当前饮品所在分类
			cartPopupVisible: false,
			routerTo: this.$tools.routerTo,
			sizeCalcState: false,
			payType: 'wechat',
			orderType: 'dinein',
			address: '123',
			store: '1'
		};
	},
	async onShow() {
		let that = this
		await this.getUserDetails();
		
		await this.init();
	},
	/* async onLoad() {
		await this.init();
	}, */
	computed: {
		...mapState({
			balInfo: state => state.user.balInfo,
			userInfo: state => state.user.userInfo,
			 storeInfo: state => state.user.storeInfo,
		}),
		goodCartNum() {
			//计算单个饮品添加到购物车的数量
			return goodsId =>
				this.cart.reduce((acc, cur) => {
					if (cur.goodsId === goodsId) {
						return (acc += cur.goodsCount);
					}
					return acc;
				}, 0);
		},
		menuCartNum() {
			return goodsId =>
				this.cart.reduce((acc, cur) => {
					if (cur.goodsId === goodsId) {
						return (acc += cur.goodsCount);
					}
					return acc;
				}, 0);
		},
		getCartGoodsNumber() {
			//计算购物车总数
			return this.cart.reduce((acc, cur) => acc + cur.goodsCount, 0);
		},
		getCartGoodsPrice() {
			//计算购物车总价
			return this.cart.reduce((acc, cur) => acc + cur.goodsCount * cur.goodsPrice, 0);
		},
		disabledPay() {
			//是否达到起送价
			return this.orderType == 'takeout' && this.getCartGoodsPrice < this.store.min_price ? true : false;
		},
		spread() {
			//差多少元起送
			if (this.orderType != 'takeout') return;
			return parseFloat((this.store.min_price - this.getCartGoodsPrice).toFixed(2));
		}
	},
	methods: {
		...mapActions(['getUserBalance','getUserDetails']),
		// 初始化
		async init() {
			//页面初始化
			this.loading = true;
			let me = this;
			await this.getUserBalance();
			this.goods = {}
			me.$api('goods.lists', {
				custId: me.balInfo.custId,
				placeId: me.storeInfo.v8PlaceId,
				V8Url: me.storeInfo.v8Url,
			}).then(res => {
				if (res.flag) {
					this.goods = res.data.Data;
				}
			});
			this.loading = false;
			this.cart = uni.getStorageSync('cart') || [];
		},
		takout() {
			if (this.orderType == 'takeout') return;
			uni.navigateTo({
				url: '/pages/address/address?is_choose=true'
			});
		},
		handleMenuTap(id) {
			//点击菜单项事件
			if (!this.sizeCalcState) {
				this.calcSize();
			}
			this.currentCateId = id;
			this.$nextTick(() => (this.cateScrollTop = this.goods.find(item => item.id == id).top));
		},
		handleGoodsScroll({ detail }) {
			//商品列表滚动事件
			if (!this.sizeCalcState) {
				this.calcSize();
			}
			const { scrollTop } = detail;
			let tabs = this.goods.filter(item => item.top <= scrollTop).reverse();
			if (tabs.length > 0) {
				this.currentCateId = tabs[0].id;
			}
		},
		calcSize() {
			let h = 10;

			let view = uni.createSelectorQuery().select('#ads');
			view.fields(
				{
					size: true
				},
				data => {
					h += Math.floor(data.height);
				}
			).exec();

			this.goods.forEach(item => {
				let view = uni.createSelectorQuery().select(`#cate-${item.id}`);
				view.fields(
					{
						size: true
					},
					data => {
						item.top = h;
						h += data.height;
						item.bottom = h;
					}
				).exec();
			});
			this.sizeCalcState = true;
		},
		handleAddToCart(cate, good, num) {
			//添加到购物车
			const index = this.cart.findIndex(item => {
				if (good.use_property) {
					return item.goodsId === good.goodsId && item.props_text === good.props_text;
				} else {
					return item.goodsId === good.goodsId;
				}
			});
			if (index > -1) {
				this.cart[index].goodsCount += num;
			} else {
				this.cart.push({
					goodsId: good.goodsId,
					goodsName: good.goodsName,
					goodsPrice: good.goodsPrice,
					goodsCount: num,
				});
			}
		},
		handleReduceFromCart(item, good) {
			const index = this.cart.findIndex(item => item.goodsId === good.goodsId);
			this.cart[index].goodsCount -= 1;
			if (this.cart[index].goodsCount <= 0) {
				this.cart.splice(index, 1);
			}
		},
		showGoodDetailModal(item, good) {
			this.good = JSON.parse(JSON.stringify({ ...good, number: 1 }));
			this.category = JSON.parse(JSON.stringify(item));
			this.goodDetailModalVisible = true;
		},
		closeGoodDetailModal() {
			//关闭饮品详情模态框
			this.goodDetailModalVisible = false;
			this.category = {};
			this.good = {};
		},
		changePropertyDefault(index, key) {
			//改变默认属性值
			this.good.property[index].values.forEach(value => this.$set(value, 'is_default', 0));
			this.good.property[index].values[key].is_default = 1;
			this.good.number = 1;
		},
		getGoodSelectedProps(good, type = 'text') {
			//计算当前饮品所选属性
			if (good.use_property) {
				let props = [];
				good.property.forEach(({ values }) => {
					values.forEach(value => {
						if (value.is_default) {
							props.push(type === 'text' ? value.value : value.id);
						}
					});
				});
				return type === 'text' ? props.join('，') : props;
			}
			return '';
		},
		handlePropertyAdd() {
			this.good.number += 1;
		},
		handlePropertyReduce() {
			if (this.good.number === 1) return;
			this.good.number -= 1;
		},
		handleAddToCartInModal() {
			const product = Object.assign({}, this.good, { props_text: this.getGoodSelectedProps(this.good), props: this.getGoodSelectedProps(this.good, 'id') });
			this.handleAddToCart(this.category, product, this.good.number);
			this.closeGoodDetailModal();
		},
		openCartPopup() {
			//打开/关闭购物车列表popup
			this.cartPopupVisible = !this.cartPopupVisible;
		},
		handleCartClear() {
			//清空购物车
			uni.showModal({
				title: '提示',
				content: '确定清空购物车么',
				success: ({ confirm }) => {
					if (confirm) {
						this.cartPopupVisible = false;
						this.cart = [];
						uni.removeStorageSync('cart');
					}
				}
			});
		},
		handleCartItemAdd(index) {
			this.cart[index].number += 1;
		},
		handleCartItemReduce(index) {
			if (this.cart[index].number === 1) {
				this.cart.splice(index, 1);
			} else {
				this.cart[index].number -= 1;
			}
			if (!this.cart.length) {
				this.cartPopupVisible = false;
			}
		},
		toPay(good) {
			uni.showLoading({ title: '加载中' });
			/* uni.setStorageSync('cart', JSON.parse(JSON.stringify(this.cart))) */
			this.$Router.push({
				path: '/pages/menu/pay', 
				query: {
					pay: JSON.stringify([{
					packageId: good.PackageId,
					ImagePath: good.ImagePath,
					PackageName: good.PackageName,
					Note: good.Note,
					goodsCount: 1,
					PackageAmount: good.PackageAmount,
					OriginalPrice: good.OriginalPrice,
					}])
				}
			});
			uni.hideLoading();
		},
		// 路由跳转
		jump(path, parmas) {
			this.showShare = false;
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
	}
};
</script>

<style lang="scss" scoped>
@import '~@/pages/menu/menu.scss';
</style>

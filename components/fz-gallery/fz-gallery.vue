<template>
	<view>
		<view class="backgroud" :style="'background:url('+img+')'">
				</view>
				<view class="header">
				  <Swiper class="swiper-container" :options="swiperOption" ref="mySwiper">
				    <swiper-slide class="swiper-slide" v-for="(item, cindex) in swiperList" :key="cindex"><image :src="item.filmPhoto" mode="aspectFill"></image></swiper-slide>
				  </Swiper>
				</view>
				<view class="movie-info" @tap="jump('/pages/cinema/detail/index', { filmId: cardInfo.filmId })">
					<view class="info-name text-bold text-xl">{{cardInfo.filmName}}</view>
					<view class="info-detaild text-grey">{{cardInfo.filmLong}} 分钟 | {{cardInfo.filmSortid}} | 导演:{{cardInfo.filmDirector}}<text class='cuIcon-right'></text></view>
				</view>
	</view>
</template>

<script>
/* import "swiper/dist/css/swiper.css"; */
/* import 'swiper/swiper.scss'; */
let vmt = null;
export default {
	props: {
		swiperList: {
			type: Array,
			default: []
		},
		cardInfo: {
			type: Object,
			default: null
		},
		img: {
			type: String,
			default: ''
		},
	},
	data() {
		return {
			swiperOption: {
					slideToClickedSlide: true,
					centeredSlides : true,
					slidesPerView : 3,
					observer: true,
					observerParents: true,
					width:300,
					on: {
						slideChangeTransitionEnd:()=>{
							/* vmt.$nextTick(() => {
								vmt.cardSwiper(vmt.$refs.mySwiper.$swiper.activeIndex);
							}) */
						}
					}
			      },
				  
		}
	},
	created() {
		vmt = this
	},
	methods: {
		cardSwiper(e){
			/* this.$emit('clickSwiper',e); */
		},
		toSwiper(e){
			/* vmt.$nextTick(() => {
				vmt.$refs.mySwiper.$swiper.slideTo(e)
			}) */
		}
	}
}
</script>

<style lang="scss">
.movie-info{
	width: 100%;
	height: 100rpx;
	text-align: center;
	.info-name{
		line-height: 70rpx;
	}
	.info-detail{
		
	}
}
.backgroud{
	 width: 750rpx;
	 height: 350rpx;
	 background-size: 200% 200%;
	 background-position: 50% 50%;
	 background-repeat: no-repeat;
	 -webkit-filter:blur(40rpx);
	 position:absolute;
	 top: 160rpx;
	 left: 0;
 }
 .header{
	 width: 750rpx;
	 height: 350rpx;
	 background:rgba(0,0,0,0.1);
	 position: relative;
	top: 0;
	left: 0;
	z-index: 100;
	overflow-x: hidden;
 }
 .swiper-container{
	 width: 750rpx;
	 height: 350rpx;
 }
 .swiper-slide{
	position: relative;
	width: 200rpx;
 }
 .swiper-slide image{
 	 position: absolute;
 	 width: 180rpx;
 	 height: 230rpx;
 	 bottom: 40rpx;
 	 left: 60rpx;
 }
 .swiper-slide-active image{
	border: 1px solid #acacac;
	 animation: mymove 0.6s forwards;
	 transform-origin: 0 300rpx 0;
	 border-radius: 10rpx;
 }
 
 @keyframes mymove{
 	from{
		transform: scale(1,1) translateZ(0px);
	}
 	to{
		transform: scale(1.1,1.1) translateZ(0px);
	}
 }
</style>

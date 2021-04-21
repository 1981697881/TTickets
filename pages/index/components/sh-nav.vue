<template>
	<view class="sh-user-menu-box mb10">
		<view class="cu-modal" :class="modalName=='RadioModal'?'show':''" @tap="hideModal">
					  	<view class="cu-dialog" @tap.stop="">
					  		<radio-group class="block" @change="RadioChange">
					  		<view class="cu-list menu text-left">
					  	<view class="cu-item" v-for="(item,index) in PhoneList">
					  	<label class="flex justify-between align-center flex-sub">
					  	<view class="flex-sub" @tap="CallPhone(item.Phone)">{{item.Name}}:{{item.Phone}}</view>
					  		</label>
					  			</view>
					  		</view>
					  	</radio-group>
					  </view>
		 </view>
		<view class="menu-list-box">
			<view class="menu-item x-bc" v-for="(nav, index) in detail.list" :key="index" @tap="onCheck(nav)">
				<view class="x-f">
					<image v-if="nav.image" class="item-img" :src="nav.image" mode=""></image>
					<text class="item-title">{{ nav.name }}</text>
				</view>
				<text class="cuIcon-right item-arrow"></text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			modalName:null,
			PhoneList: [{
				Name:'客服电话(1)',
				Phone: '182-8809-0152'
			},{
				Name:'客服电话(2)',
				Phone: '189-8814-9921'
			}],
		};
	},
	props: {
		detail: {
			type: Object,
			default: null
		}
	},
	computed: {},
	methods: {
		//第二部分  模态框的显示与隐藏
		showModal(e) {
			this.modalName = e
		},
		hideModal(e) {
			this.modalName = null
		},
		/*拨打电话*/
		CallPhone(e){
		    uni.makePhoneCall({
				phoneNumber: e
			});
		},
		onCheck(data){
			if(data.path_type ==2){
				this.showModal('RadioModal')
			}else{
				this.jump(data)
			}
			
		},
		jump(data) {
			this.$tools.routerTo(data.path);
		}
	}
};
</script>

<style lang="scss">
// 宫格
.tools-box {
	background: #fff;
	display: flex;
	flex-wrap: wrap;
	padding-bottom: 40rpx;
	margin-bottom: 20rpx;

	.tool-item {
		width: (750rpx/4);
		padding-top: 40rpx;

		.tool-img {
			width: 44rpx;
			height: 44rpx;
			// background: #ccc;
		}

		.item-title {
			font-size: 24rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(153, 153, 153, 1);
			line-height: 24rpx;
			padding-top: 30rpx;
		}
	}
}
// 列表
.menu-list-box {
	.menu-item {
		height: 100rpx;
		padding: 0 30rpx;
		background: #fff;
		border-bottom: 1rpx solid #f3f3f3;
		.item-img {
			width: 44rpx;
			height: 44rpx;
			margin-right: 20rpx;
			// background: #ccc;
		}

		.item-title {
			font-size: 24rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(153, 153, 153, 1);
			line-height: 24rpx;
		}
		.item-arrow {
			color: rgba(153, 153, 153, 1);
		}
	}
}
</style>

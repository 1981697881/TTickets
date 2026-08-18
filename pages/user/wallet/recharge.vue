<template>
	<view class="page_box"></view>
</template>

<script>
/**
 * 兼容旧路径：底部「充值」已迁到主包 tab pages/index/recharge
 * （分包页不能作为 tabBar）
 */
export default {
	onLoad() {
		uni.switchTab({ url: '/pages/index/recharge' });
	},
	onShow() {
		uni.switchTab({ url: '/pages/index/recharge' });
	}
};
</script>

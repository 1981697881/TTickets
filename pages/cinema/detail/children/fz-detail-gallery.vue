<template>
	<view v-if="items.length" class="gallery-section">
		<text class="gallery-title">{{ type === 'crew' ? '演职人员' : '剧照' }}</text>
		<scroll-view class="gallery-scroll" scroll-x show-scrollbar="false">
			<view class="gallery-list" :class="{ 'still-list': type === 'still' }">
				<view v-for="(item, index) in items" :key="item.key || index" class="gallery-item">
					<image
						class="gallery-image"
						:class="type === 'still' ? 'still-image' : 'crew-image'"
						:src="item.image"
						:mode="type === 'still' ? 'aspectFill' : 'aspectFill'"
						lazy-load
					></image>
					<template v-if="type === 'crew'">
						<text class="person-name one-t">{{ item.name || '演职人员' }}</text>
						<text v-if="item.role" class="person-role one-t">{{ item.role }}</text>
					</template>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	name: 'FzDetailGallery',
	props: {
		detail: {
			type: Object,
			default: () => ({})
		},
		type: {
			type: String,
			default: 'still'
		}
	},
	computed: {
		items() {
			if (this.type === 'crew') {
				const list = Array.isArray(this.detail.filmRoleVOS) ? this.detail.filmRoleVOS : [];
				return list.filter(item => item && item.starPhotoUrl).map((item, index) => ({
					key: item.starId || `${item.starName || 'person'}-${index}`,
					image: item.starPhotoUrl,
					name: item.starName,
					role: item.roleType
				}));
			}
			const list = Array.isArray(this.detail.photoArrays) ? this.detail.photoArrays : [];
			return list.filter(Boolean).map((image, index) => ({ key: `${image}-${index}`, image }));
		}
	}
};
</script>

<style scoped lang="scss">
.gallery-section {
	padding-top: 34rpx;
}

.gallery-title {
	display: block;
	font-size: 32rpx;
	font-weight: 720;
	line-height: 44rpx;
	color: var(--tt-text);
}

.gallery-scroll {
	width: 100%;
	margin-top: 20rpx;
	white-space: nowrap;
}

.gallery-list {
	display: inline-flex;
	align-items: flex-start;
	gap: 18rpx;
	padding-right: 28rpx;
}

.gallery-item {
	width: 144rpx;
	display: inline-flex;
	flex-direction: column;
}

.still-list .gallery-item {
	width: 286rpx;
}

.gallery-image {
	display: block;
	background: var(--tt-bg);
	border-radius: 16rpx;
}

.crew-image {
	width: 144rpx;
	height: 188rpx;
}

.still-image {
	width: 286rpx;
	height: 180rpx;
}

.person-name {
	margin-top: 11rpx;
	font-size: 23rpx;
	font-weight: 650;
	line-height: 32rpx;
	color: var(--tt-text);
}

.person-role {
	margin-top: 2rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: var(--tt-text-muted);
}
</style>

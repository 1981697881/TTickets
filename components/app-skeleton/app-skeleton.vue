<template>
	<view v-if="showSkeleton" class="app-skeleton-box" :style="{ width: skeletonWidth, height: skeletonHeight, backgroundColor: skeletonBgColor }">
		<view
			class="app-skeleton__type"
			v-for="(item, index) in skeletonElements"
			:key="index"
			:style="{
				width: item.width + 'px',
				height: item.height + 'px',
				left: item.left + 'px',
				top: item.top + 'px',
				backgroundColor: elementBgColor,
				borderRadius: getRadius(item.skeletonType, borderRadius)
			}"
		></view>
	</view>
</template>

<script>
export default {
	name: 'appSkeleton',
	data() {
		return {
			skeletonWidth: 375,
			skeletonHeight: 800,
			skeletonElements: []
		};
	},
	props: {
		showSkeleton: {
			type: Boolean,
			default: false
		},
		selector: {
			type: String,
			default: 'app-selector'
		},
		skeletonBgColor: {
			type: String,
			default: '#fff'
		},
		elementBgColor: {
			type: String,
			default: '#F3F3F1'
		},
		skeletonType: {
			type: Array,
			default() {
				return ['rect', 'circular', 'fillet'];
			}
		},
		borderRadius: {
			type: String,
			default: '16rpx'
		}
	},
	created() {
		const res = uni.getSystemInfoSync();
		this.skeletonWidth = res.windowWidth + 'px';
		this.skeletonHeight = res.windowHeight + 'px';
	},
	mounted() {
		setTimeout(() => {
			this.selectorQuery();
		}, 500);
	},

	methods: {
		getRadius(type, val) {
			let radius = '0';
			if (type == 'circular') {
				radius = '50%';
			} else if (type == 'fillet') {
				radius = val;
			}
			return radius;
		},
		async selectorQuery() {
			let skeletonType = this.skeletonType || [];
			let nodes = [];
			for (let item of skeletonType) {
				let className = `.${item}`;
				if (~'rect_circular_fillet'.indexOf(item)) {
					// #ifdef MP-WEIXIN
					className = `.${this.selector} >>> .${this.selector}-${item}`;
					// #endif
					// #ifndef MP-WEIXIN
					className = `.${this.selector}-${item}`;
					// #endif
				}
				await this.nodesRef(className).then(res => {
					res.map(d => {
						d.skeletonType = item;
					});
					nodes = nodes.concat(res);
				});
			}
			this.skeletonElements = nodes;
		},
		async nodesRef(className) {
			let that = this;
			return await new Promise((resolve, reject) => {
				uni.createSelectorQuery()
					.selectAll(className)
					.boundingClientRect(res => {
						if (res) {
							resolve(res);
						} else {
							reject(res);
						}
					})
					.exec();
			});
		}
	}
};
</script>

<style lang="scss">
.app-skeleton-box {
	position: fixed;
	z-index: 99999;
	overflow: hidden;
	left: 0;
	top: 0;
	.app-skeleton__type {
		position: absolute;
	}
}
</style>

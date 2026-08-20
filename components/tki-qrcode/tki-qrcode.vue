<template>
	<view class="tki-qrcode">
		<!-- #ifndef MP-ALIPAY -->
		<canvas class="tki-qrcode-canvas" :canvas-id="cid" :style="{width:cpSize+'px',height:cpSize+'px'}" />
		<!-- #endif -->
		<!-- #ifdef MP-ALIPAY -->
		<canvas :id="cid" :width="cpSize" :height="cpSize" class="tki-qrcode-canvas" />
		<!-- #endif -->
		<image v-show="show && result" :src="result" :style="{width:cpSize+'px',height:cpSize+'px'}" />
	</view>
</template>

<script>
import QRCode from './qrcode.js';

export default {
	name: 'tki-qrcode',
	props: {
		cid: {
			type: String,
			default: 'tki-qrcode-canvas'
		},
		size: {
			type: Number,
			default: 200
		},
		unit: {
			type: String,
			default: 'upx'
		},
		show: {
			type: Boolean,
			default: true
		},
		val: {
			type: String,
			default: ''
		},
		background: {
			type: String,
			default: '#ffffff'
		},
		foreground: {
			type: String,
			default: '#000000'
		},
		pdground: {
			type: String,
			default: '#000000'
		},
		icon: {
			type: String,
			default: ''
		},
		iconSize: {
			type: Number,
			default: 40
		},
		lv: {
			type: Number,
			default: 3
		},
		onval: {
			type: Boolean,
			default: true
		},
		loadMake: {
			type: Boolean,
			default: true
		},
		usingComponents: {
			type: Boolean,
			default: true
		},
		showLoading: {
			type: Boolean,
			default: false
		},
		loadingText: {
			type: String,
			default: '二维码生成中'
		}
	},
	data() {
		return {
			result: '',
			_qrInstance: null,
			_makeTimer: null
		};
	},
	computed: {
		cpSize() {
			if (this.unit === 'upx') {
				return uni.upx2px(this.size);
			}
			return this.size;
		}
	},
	watch: {
		val(n, o) {
			if (!this.onval) return;
			if (n === o || this._empty(n)) return;
			this._scheduleMake();
		}
	},
	mounted() {
		if (this.loadMake && !this._empty(this.val)) {
			this._scheduleMake(100);
		}
	},
	beforeUnmount() {
		this._clearTimer();
		this._clearCode();
	},
	methods: {
		_scheduleMake(delay = 0) {
			this._clearTimer();
			this._makeTimer = setTimeout(() => {
				this._makeTimer = null;
				this._makeCode();
			}, delay);
		},
		_clearTimer() {
			if (this._makeTimer) {
				clearTimeout(this._makeTimer);
				this._makeTimer = null;
			}
		},
		_makeCode() {
			if (this._empty(this.val)) return;
			const that = this;
			this._qrInstance = new QRCode({
				context: that,
				canvasId: that.cid,
				usingComponents: that.usingComponents,
				showLoading: that.showLoading,
				loadingText: that.loadingText,
				text: that.val,
				size: that.cpSize,
				background: that.background,
				foreground: that.foreground,
				pdground: that.pdground,
				correctLevel: that.lv,
				image: that.icon,
				imageSize: that.iconSize,
				cbResult(res) {
					that._result(res);
				}
			});
		},
		_clearCode() {
			this._clearTimer();
			this._result('');
			if (this._qrInstance && typeof this._qrInstance.clear === 'function') {
				try {
					this._qrInstance.clear();
				} catch (e) {}
			}
			this._qrInstance = null;
		},
		_saveCode() {
			if (!this.result) return;
			uni.saveImageToPhotosAlbum({
				filePath: this.result,
				success() {
					uni.showToast({
						title: '二维码保存成功',
						icon: 'success',
						duration: 2000
					});
				}
			});
		},
		_result(res) {
			this.result = res;
			this.$emit('result', res);
		},
		_empty(v) {
			const tp = typeof v;
			if (tp === 'number' && String(v) === '') return true;
			if (tp === 'undefined') return true;
			if (tp === 'object') {
				return v == null || JSON.stringify(v) === '{}' || JSON.stringify(v) === '[]';
			}
			if (tp === 'string') {
				return v === '' || v === 'undefined' || v === 'null' || v === '{}' || v === '[]';
			}
			return false;
		}
	}
};
</script>

<style>
.tki-qrcode {
	text-align: center;
	position: relative;
}
.tki-qrcode-canvas {
	position: fixed;
	top: -99999upx;
	left: -99999upx;
	z-index: -99999;
}
</style>

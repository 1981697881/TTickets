<template>
  <app-safe-popup
    :model-value="visible"
    :type="popupType"
    max-width="750rpx"
    :mask-closable="autoClose"
    @update:modelValue="onVisibleChange"
  >
    <view class="popup-content" :class="`popup-content--${direction}`" @tap.stop>
      <slot name="content"></slot>
      <slot></slot>
    </view>
  </app-safe-popup>
</template>

<script>
import AppSafePopup from '@/components/app-safe-popup/app-safe-popup.vue';

export default {
  name: 'PopupLayer',
  components: { AppSafePopup },
  props: {
    modelValue: { type: Boolean, default: undefined },
    showPop: { type: Boolean, default: false },
    direction: { type: String, default: 'top' },
    autoClose: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'closeCallBack'],
  data() {
    return { internalVisible: false };
  },
  computed: {
    visible() {
      return this.modelValue === undefined ? (this.showPop || this.internalVisible) : this.modelValue;
    },
    popupType() {
      return ['top', 'bottom', 'left', 'right'].includes(this.direction) ? this.direction : 'center';
    }
  },
  watch: {
    showPop(value) { this.internalVisible = value; }
  },
  mounted() {
    this.internalVisible = this.showPop;
  },
  methods: {
    show() {
      this.internalVisible = true;
      this.$emit('update:modelValue', true);
      this.$emit('change', true);
    },
    close() {
      this.internalVisible = false;
      this.$emit('update:modelValue', false);
      this.$emit('change', false);
      this.$emit('closeCallBack', null);
    },
    onVisibleChange(value) {
      if (value) this.show();
      else this.close();
    }
  }
};
</script>

<style lang="scss" scoped>
.popup-content {
  width: 100%;
  max-height: calc(100vh - 180rpx);
  overflow: auto;
  box-sizing: border-box;
  background: #fff;
  -webkit-overflow-scrolling: touch;
}

.popup-content--left,
.popup-content--right {
  height: 100%;
  max-height: 100%;
}
</style>

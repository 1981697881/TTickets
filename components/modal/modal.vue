<template>
  <app-safe-popup :model-value="show" :mask-closable="maskClosable" @mask-click="handleClickCancel">
    <view class="modal-box" :style="{ width, padding, borderRadius: radius }">
      <slot v-if="custom"></slot>
      <template v-else>
        <view v-if="title" class="modal-title">{{ title }}</view>
        <view class="modal-content" :class="{ mtop: !title }" :style="{ color, fontSize: `${size}rpx` }">
          <slot>{{ content }}</slot>
        </view>
        <view class="modalBtn-box" :class="{ 'flex-column': button.length !== 2 }">
          <button
            v-for="(item, index) in button"
            :key="index"
            class="modal-btn"
            :class="[
              `${item.type || 'primary'}${item.plain ? '-outline' : ''}`,
              { 'btn-width': button.length !== 2, mbtm: button.length > 2, 'circle-btn': shape === 'circle' },
              `btn-${item.size || 'default'}`
            ]"
            :data-index="index"
            @tap="handleClick"
          >
            {{ item.text || '确定' }}
          </button>
        </view>
      </template>
    </view>
  </app-safe-popup>
</template>

<script>
import AppSafePopup from '@/components/app-safe-popup/app-safe-popup.vue';

export default {
  name: 'Modal',
  components: { AppSafePopup },
  props: {
    show: { type: Boolean, default: false },
    custom: { type: Boolean, default: false },
    width: { type: String, default: '84%' },
    padding: { type: String, default: '40rpx' },
    radius: { type: String, default: '24rpx' },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    color: { type: String, default: '#686a61' },
    size: { type: Number, default: 28 },
    shape: { type: String, default: 'square' },
    button: {
      type: Array,
      default: () => [
        { text: '取消', type: 'primary', plain: true },
        { text: '确定', type: 'primary', plain: false }
      ]
    },
    maskClosable: { type: Boolean, default: true },
    fadein: { type: Boolean, default: false }
  },
  emits: ['click', 'cancel'],
  methods: {
    handleClick(e) {
      if (this.show) this.$emit('click', { index: Number(e.currentTarget.dataset.index) });
    },
    handleClickCancel() {
      if (this.maskClosable) this.$emit('cancel');
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-box {
  max-width: 100%;
  max-height: calc(100vh - 180rpx);
  overflow: auto;
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 24rpx 80rpx rgba(16, 17, 13, 0.24);
}

.modal-title {
  padding-top: 8rpx;
  color: #171812;
  font-size: 34rpx;
  font-weight: 650;
  text-align: center;
}

.modal-content { padding: 28rpx 0 48rpx; }
.mtop { margin-top: 20rpx; }
.mbtm { margin-bottom: 24rpx; }

.modalBtn-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.flex-column { flex-direction: column; }

.modal-btn {
  width: 48%;
  min-height: 76rpx;
  margin: 0;
  padding: 0 28rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  line-height: 76rpx;
}

.btn-width { width: 100%; }
.btn-lg { font-size: 32rpx; }
.btn-sm { font-size: 24rpx; }
.circle-btn { border-radius: 999rpx; }

.primary { background: #a9b238; color: #fff; }
.primary-outline { background: #fff; color: #8f981e; border: 1rpx solid #a9b238; }
.danger, .red { background: #d84a4a; color: #fff; }
.danger-outline, .red-outline { background: #fff; color: #d84a4a; border: 1rpx solid #d84a4a; }
.warning { background: #e58b26; color: #fff; }
.green { background: #2e9d62; color: #fff; }
.gray { background: #f0f1ed; color: #686a61; }
.white { background: #fff; color: #171812; border: 1rpx solid #e8e9e3; }
</style>

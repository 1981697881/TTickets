<template>
  <app-safe-popup
    :model-value="showModal"
    :type="isBottom ? 'bottom' : 'center'"
    :mask-closable="maskClosable"
    :plain="plain"
    :max-width="maxWidth"
    @update:modelValue="updateVisible"
    @close="onClose"
  >
    <!-- Vue3：具名插槽；兼容旧写法 slot="modalContent" -->
    <slot name="modalContent"></slot>
    <slot></slot>
  </app-safe-popup>
</template>

<script>
import AppSafePopup from '@/components/app-safe-popup/app-safe-popup.vue';

export default {
  name: 'AppModal',
  inheritAttrs: false,
  components: { AppSafePopup },
  props: {
    modelValue: { type: Boolean, default: undefined },
    value: { type: Boolean, default: undefined },
    modalType: { type: String, default: '' },
    maskClosable: { type: Boolean, default: true },
    /** 底部弹层默认不透明，避免内容高度/页脚错位 */
    plain: { type: Boolean, default: false },
    maxWidth: { type: String, default: '640rpx' }
  },
  emits: ['update:modelValue', 'input', 'close'],
  computed: {
    showModal() {
      return this.modelValue === undefined ? Boolean(this.value) : Boolean(this.modelValue);
    },
    isBottom() {
      return String(this.modalType || '').includes('bottom');
    }
  },
  methods: {
    updateVisible(value) {
      this.$emit('update:modelValue', value);
      this.$emit('input', value);
      if (!value) this.$store.commit('LOGIN_TIP', false);
    },
    onClose() {
      this.$emit('close');
    }
  }
};
</script>

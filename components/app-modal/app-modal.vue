<template>
  <app-safe-popup
    :model-value="showModal"
    :type="isBottom ? 'bottom' : 'center'"
    :mask-closable="maskClosable"
    plain
    @update:modelValue="updateVisible"
    @close="onClose"
  >
    <slot name="modalContent"></slot>
    <slot></slot>
  </app-safe-popup>
</template>

<script>
import AppSafePopup from '@/components/app-safe-popup/app-safe-popup.vue';

export default {
  name: 'AppModal',
  components: { AppSafePopup },
  props: {
    modelValue: { type: Boolean, default: undefined },
    value: { type: Boolean, default: undefined },
    modalType: { type: String, default: '' },
    maskClosable: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'input', 'close'],
  computed: {
    showModal() {
      return this.modelValue === undefined ? Boolean(this.value) : Boolean(this.modelValue);
    },
    isBottom() {
      return this.modalType.includes('bottom');
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

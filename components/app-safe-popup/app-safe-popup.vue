<template>
  <root-portal>
    <view
      v-if="visible"
      class="safe-popup"
      :class="[`safe-popup--${type}`, { 'safe-popup--plain': plain }]"
      :style="{ zIndex }"
      role="dialog"
      aria-modal="true"
      :aria-label="ariaLabel"
    >
      <view class="safe-popup__mask" @tap="onMaskTap" @touchmove.stop.prevent="preventScroll"></view>
      <view class="safe-popup__panel" :style="panelStyle" @tap.stop @touchmove.stop>
        <slot></slot>
      </view>
    </view>
  </root-portal>
</template>

<script>
let bodyScrollLockCount = 0;
let lockedScrollY = 0;
let bodyStyleSnapshot = null;

function lockBodyScroll() {
  if (typeof document === 'undefined' || typeof window === 'undefined' || !document.body) return false;
  bodyScrollLockCount += 1;
  if (bodyScrollLockCount > 1) return true;

  const body = document.body;
  lockedScrollY = window.scrollY || 0;
  bodyStyleSnapshot = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    paddingRight: body.style.paddingRight
  };

  const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${lockedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  if (scrollbarWidth) body.style.paddingRight = `${scrollbarWidth}px`;
  return true;
}

function unlockBodyScroll() {
  if (typeof document === 'undefined' || typeof window === 'undefined' || !document.body || bodyScrollLockCount <= 0) return;
  bodyScrollLockCount -= 1;
  if (bodyScrollLockCount > 0 || !bodyStyleSnapshot) return;

  const body = document.body;
  Object.assign(body.style, bodyStyleSnapshot);
  window.scrollTo(0, lockedScrollY);
  bodyStyleSnapshot = null;
  lockedScrollY = 0;
}

export default {
  name: 'AppSafePopup',
  props: {
    modelValue: { type: Boolean, default: undefined },
    value: { type: Boolean, default: undefined },
    type: { type: String, default: 'center' },
    maskClosable: { type: Boolean, default: true },
    plain: { type: Boolean, default: false },
    lockScroll: { type: Boolean, default: true },
    zIndex: { type: [Number, String], default: 11000 },
    maxWidth: { type: String, default: '640rpx' },
    ariaLabel: { type: String, default: '弹窗' }
  },
  emits: ['update:modelValue', 'input', 'close', 'mask-click'],
  data() {
    return { bodyScrollLocked: false };
  },
  computed: {
    visible() {
      return this.modelValue === undefined ? Boolean(this.value) : Boolean(this.modelValue);
    },
    panelStyle() {
      return ['center', 'left', 'right'].includes(this.type) ? { maxWidth: this.maxWidth } : {};
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(value) {
        this.syncBodyScrollLock(value);
      }
    },
    lockScroll() {
      this.syncBodyScrollLock(this.visible);
    }
  },
  mounted() {
    this.syncBodyScrollLock(this.visible);
    if (typeof document !== 'undefined') document.addEventListener('keydown', this.onKeydown);
  },
  beforeUnmount() {
    this.releaseBodyScrollLock();
    if (typeof document !== 'undefined') document.removeEventListener('keydown', this.onKeydown);
  },
  methods: {
    preventScroll() {},
    syncBodyScrollLock(visible) {
      if (visible && this.lockScroll && !this.bodyScrollLocked) {
        this.bodyScrollLocked = lockBodyScroll();
      } else if ((!visible || !this.lockScroll) && this.bodyScrollLocked) {
        this.releaseBodyScrollLock();
      }
    },
    releaseBodyScrollLock() {
      if (!this.bodyScrollLocked) return;
      this.bodyScrollLocked = false;
      unlockBodyScroll();
    },
    onKeydown(event) {
      if (event.key === 'Escape' && this.visible && this.maskClosable) this.close();
    },
    close() {
      this.$emit('update:modelValue', false);
      this.$emit('input', false);
      this.$emit('close');
    },
    onMaskTap() {
      this.$emit('mask-click');
      if (this.maskClosable) this.close();
    }
  }
};
</script>

<style lang="scss" scoped>
.safe-popup {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  inset: 0;
  display: flex;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  box-sizing: border-box;
  isolation: isolate;
}

.safe-popup__mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  inset: 0;
  background: rgba(16, 17, 13, 0.58);
  animation: safe-popup-fade 180ms ease-out both;
}

.safe-popup__panel {
  position: relative;
  z-index: 1;
  width: calc(100vw - 64rpx);
  max-height: calc(100vh - 160rpx);
  max-height: calc(100dvh - 160rpx);
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
  animation: safe-popup-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.safe-popup--center {
  align-items: center;
  justify-content: center;
  padding: calc(constant(safe-area-inset-top) + 32rpx) 32rpx calc(constant(safe-area-inset-bottom) + 32rpx);
  padding: calc(env(safe-area-inset-top) + 32rpx) 32rpx calc(env(safe-area-inset-bottom) + 32rpx);
}

.safe-popup--bottom {
  align-items: flex-end;
  justify-content: center;
}

.safe-popup--top {
  align-items: flex-start;
  justify-content: center;
}

.safe-popup--bottom .safe-popup__panel {
  width: 100%;
  max-width: 750rpx;
  max-height: calc(100vh - env(safe-area-inset-top) - 80rpx);
  max-height: calc(100dvh - env(safe-area-inset-top) - 80rpx);
  margin: 0 auto;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  animation-name: safe-popup-up;
}

.safe-popup--top .safe-popup__panel {
  width: 100%;
  max-width: 750rpx;
  max-height: calc(100vh - env(safe-area-inset-bottom) - 80rpx);
  max-height: calc(100dvh - env(safe-area-inset-bottom) - 80rpx);
  margin: 0 auto;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: #fff;
  border-radius: 0 0 30rpx 30rpx;
  animation-name: safe-popup-down;
}

.safe-popup--left,
.safe-popup--right {
  align-items: stretch;
}

.safe-popup--left { justify-content: flex-start; }
.safe-popup--right { justify-content: flex-end; }

.safe-popup--left .safe-popup__panel,
.safe-popup--right .safe-popup__panel {
  width: 100%;
  height: 100%;
  max-height: none;
  background: #fff;
}

.safe-popup--left .safe-popup__panel { animation-name: safe-popup-from-left; }
.safe-popup--right .safe-popup__panel { animation-name: safe-popup-from-right; }

.safe-popup--plain .safe-popup__panel { background: transparent; }

@keyframes safe-popup-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes safe-popup-in { from { opacity: 0; transform: scale(0.96) translateY(12rpx); } to { opacity: 1; transform: none; } }
@keyframes safe-popup-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes safe-popup-down { from { transform: translateY(-100%); } to { transform: translateY(0); } }
@keyframes safe-popup-from-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes safe-popup-from-right { from { transform: translateX(100%); } to { transform: translateX(0); } }

/* #ifdef H5 */
@media (prefers-reduced-motion: reduce) {
  .safe-popup__mask,
  .safe-popup__panel { animation: none; }
}
/* #endif */
</style>

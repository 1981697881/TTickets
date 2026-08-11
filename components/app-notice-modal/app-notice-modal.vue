<template>
  <app-safe-popup
    v-if="currentPopup && !screenShot"
    :model-value="showModal"
    :mask-closable="true"
    plain
    @close="hideModal(currentPopup)"
  >
    <view class="notice-modal" @tap.stop="changePopup(currentPopup.path)">
      <image class="notice-modal__image" :src="currentPopup.image" mode="widthFix"></image>
      <button class="notice-modal__close" aria-label="关闭" @tap.stop="hideModal(currentPopup)">×</button>
    </view>
  </app-safe-popup>
</template>

<script>
import { mapState } from 'vuex';
import AppSafePopup from '@/components/app-safe-popup/app-safe-popup.vue';

export default {
  name: 'AppNoticeModal',
  components: { AppSafePopup },
  data() {
    return {
      popupCurrent: 0,
      showModal: true,
      screenShot: uni.getStorageSync('screenShot'),
      advanceTimer: null
    };
  },
  computed: {
    ...mapState({ templateData: state => state.init.templateData.popup }),
    popupData() {
      return this.templateData?.[0]?.content;
    },
    currentPath() {
      const pages = getCurrentPages();
      return pages.length ? `/${pages[pages.length - 1].route}` : '';
    },
    newPopupList() {
      const list = this.popupData?.list || [];
      return list.filter(item => Array.isArray(item.page) && item.page.includes(this.currentPath));
    },
    currentPopup() {
      return this.newPopupList[this.popupCurrent] || null;
    }
  },
  beforeUnmount() {
    clearTimeout(this.advanceTimer);
  },
  methods: {
    hideModal(popup) {
      clearTimeout(this.advanceTimer);
      this.showModal = false;
      if (popup?.style == 1) this.$store.commit('delPopup', this.currentPath);
      this.advanceTimer = setTimeout(() => {
        this.popupCurrent += 1;
        this.showModal = Boolean(this.currentPopup);
      }, 180);
    },
    changePopup(path) {
      this.hideModal(this.currentPopup);
      if (path) this.$tools.routerTo(path, null);
    }
  }
};
</script>

<style lang="scss" scoped>
.notice-modal {
  position: relative;
  width: 610rpx;
  max-width: 100%;
}

.notice-modal__image {
  display: block;
  width: 100%;
  border-radius: 24rpx;
  box-shadow: 0 24rpx 80rpx rgba(0, 0, 0, 0.25);
}

.notice-modal__close {
  position: absolute;
  left: 50%;
  bottom: -104rpx;
  width: 72rpx;
  min-height: 72rpx;
  margin: 0;
  padding: 0;
  transform: translateX(-50%);
  border: 2rpx solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 48rpx;
  font-weight: 300;
  line-height: 66rpx;
}
</style>

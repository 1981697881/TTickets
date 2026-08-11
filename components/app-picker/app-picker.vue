<template>
  <app-safe-popup :model-value="showPicker" type="bottom" @update:modelValue="pickerCancel">
    <view class="app-picker-content">
      <view class="app-picker__hd">
        <button class="app-picker__action app-picker__cancel" @tap="pickerCancel">取消</button>
        <text class="app-picker__title">选择地区</text>
        <button class="app-picker__action" :style="{ color: themeColor }" @tap="pickerConfirm">确定</button>
      </view>
      <picker-view indicator-style="height: 44px;" class="app-picker-view" :value="pickerValue" @change="pickerChange">
        <picker-view-column>
          <view v-for="(item, index) in provinceDataList" :key="index" class="picker-item">{{ item.label }}</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="(item, index) in cityDataList" :key="index" class="picker-item">{{ item.label }}</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="(item, index) in areaDataList" :key="index" class="picker-item">{{ item.label }}</view>
        </picker-view-column>
      </picker-view>
    </view>
  </app-safe-popup>
</template>

<script>
import AppSafePopup from '@/components/app-safe-popup/app-safe-popup.vue';

export default {
  components: { AppSafePopup },
  props: {
    pickerValueDefault: { type: Array, default: () => [0, 0, 0] },
    pickerData: { type: Object, default: () => ({}) },
    themeColor: { type: String, default: '#8f981e' }
  },
  data() {
    return {
      pickerValue: [0, 0, 0],
      provinceDataList: [],
      cityDataList: [],
      areaDataList: [],
      pcaData: {},
      showPicker: false
    };
  },
  watch: {
    pickerValueDefault: { handler() { this.init(); }, deep: true }
  },
  created() { this.init(); },
  methods: {
    async init() {
      const res = Object.keys(this.pickerData).length ? { data: this.pickerData } : await this.$api('address.area');
      this.pcaData = res.data || {};
      this.provinceDataList = this.pcaData.provinceData || [];
      this.pickerValue = this.clampValue(this.pickerValueDefault);
      this.refreshColumns();
    },
    clampValue(value) {
      const next = [...(value || [0, 0, 0])];
      next[0] = Math.min(Math.max(Number(next[0]) || 0, 0), Math.max((this.pcaData.provinceData?.length || 1) - 1, 0));
      next[1] = Math.min(Math.max(Number(next[1]) || 0, 0), Math.max((this.pcaData.cityData?.[next[0]]?.length || 1) - 1, 0));
      next[2] = Math.min(Math.max(Number(next[2]) || 0, 0), Math.max((this.pcaData.areaData?.[next[0]]?.[next[1]]?.length || 1) - 1, 0));
      return next;
    },
    refreshColumns() {
      const [province, city] = this.pickerValue;
      this.cityDataList = this.pcaData.cityData?.[province] || [];
      this.areaDataList = this.pcaData.areaData?.[province]?.[city] || [];
    },
    show() { this.showPicker = true; },
    showPickerView() { this.show(); },
    pickerCancel() {
      this.showPicker = false;
      this.emitValue('onCancel');
    },
    pickerConfirm() {
      this.showPicker = false;
      this.emitValue('onConfirm');
    },
    pickerChange(e) {
      const next = [...(e.detail?.value || [0, 0, 0])];
      if (this.pickerValue[0] !== next[0]) {
        next[1] = 0;
        next[2] = 0;
      } else if (this.pickerValue[1] !== next[1]) {
        next[2] = 0;
      }
      this.pickerValue = this.clampValue(next);
      this.refreshColumns();
      this.emitValue('onChange');
    },
    emitValue(name) {
      const province = this.provinceDataList[this.pickerValue[0]];
      const city = this.cityDataList[this.pickerValue[1]];
      const area = this.areaDataList[this.pickerValue[2]];
      this.$emit(name, {
        label: [province?.label, city?.label, area?.label].filter(Boolean).join('-'),
        value: [...this.pickerValue],
        cityCode: area?.value
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.app-picker-content { width: 100%; background: #fff; }
.app-picker__hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96rpx;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #e8e9e3;
}
.app-picker__title { color: #171812; font-size: 30rpx; font-weight: 600; }
.app-picker__action {
  min-width: 112rpx;
  min-height: 72rpx;
  margin: 0;
  padding: 0 16rpx;
  background: transparent;
  color: #8f981e;
  font-size: 28rpx;
  line-height: 72rpx;
}
.app-picker__cancel { color: #686a61; }
.app-picker-view { width: 100%; height: 520rpx; background: #fff; }
.picker-item {
  overflow: hidden;
  padding: 0 12rpx;
  color: #171812;
  font-size: 30rpx;
  line-height: 44px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

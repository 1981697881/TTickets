const systemInfo = typeof uni !== 'undefined' && uni.getSystemInfoSync ? uni.getSystemInfoSync() : {};

const platformState = {
  statusBarHeight: systemInfo.statusBarHeight || 0,
  StatusBar: systemInfo.statusBarHeight || 0,
  CustomBar: (systemInfo.statusBarHeight || 0) + 44,
  Custom: null,
  ColorList: []
};

export function installPlatformGlobals(target) {
  ['StatusBar', 'CustomBar', 'Custom', 'ColorList'].forEach(key => {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      get: () => platformState[key],
      set: value => {
        platformState[key] = value;
      }
    });
  });
}

export default platformState;

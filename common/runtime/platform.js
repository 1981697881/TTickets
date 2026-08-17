import { getSystemInfoSyncSafe } from '@/common/runtime/system-info';

const systemInfo = getSystemInfoSyncSafe();

/** ColorUI 标签色板，需在 App.onLaunch 前即可用，避免组件挂载时为空 */
export const DEFAULT_COLOR_LIST = [
  { title: '嫣红', name: 'red', color: '#e54d42' },
  { title: '桔橙', name: 'orange', color: '#f37b1d' },
  { title: '明黄', name: 'yellow', color: '#fbbd08' },
  { title: '橄榄', name: 'olive', color: '#8dc63f' },
  { title: '森绿', name: 'green', color: '#39b54a' },
  { title: '天青', name: 'cyan', color: '#1cbbb4' },
  { title: '海蓝', name: 'blue', color: '#0081ff' },
  { title: '姹紫', name: 'purple', color: '#6739b6' },
  { title: '木槿', name: 'mauve', color: '#9c26b0' },
  { title: '桃粉', name: 'pink', color: '#e03997' },
  { title: '棕褐', name: 'brown', color: '#a5673f' },
  { title: '玄灰', name: 'grey', color: '#8799a3' },
  { title: '草灰', name: 'gray', color: '#aaaaaa' },
  { title: '墨黑', name: 'black', color: '#333333' },
  { title: '雅白', name: 'white', color: '#ffffff' }
];

const platformState = {
  statusBarHeight: systemInfo.statusBarHeight || 0,
  StatusBar: systemInfo.statusBarHeight || 0,
  CustomBar: (systemInfo.statusBarHeight || 0) + 44,
  Custom: null,
  ColorList: DEFAULT_COLOR_LIST.slice()
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

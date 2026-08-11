import App from './App';
import { createSSRApp } from 'vue';
import uviewPlus from 'uview-plus';
import store from '@/common/store';
import cuCustom from '@/static/colorui/components/cu-custom.vue';
import router from '@/common/router';
import tools from '@/common/utils/tools';
import api from '@/common/request/index';
import appShare from '@/common/mixins/app-share';
import platformState, { installPlatformGlobals } from '@/common/runtime/platform';
import * as pagination from '@/common/utils/pagination';
import globalState from '@/common/runtime/globals';
import { API_URL } from './env.js';
// #ifdef H5
import wxsdk from '@/common/wechat/sdk';
// #endif

export function createApp() {
  const app = createSSRApp(App);

  app.use(store);
  app.use(uviewPlus);
  app.mixin(appShare);
  app.component('cu-custom', cuCustom);

  const globals = app.config.globalProperties;
  globals.$store = store;
  globals.$api = api;
  globals.$tools = tools;
  globals.$Router = router;
  Object.defineProperty(globals, '$Route', { get: () => router.$Route });
  Object.defineProperty(globals, '$isPreviewApi', {
    configurable: true,
    get: () => globalState.isPreviewApi,
    set: value => { globalState.isPreviewApi = Boolean(value); }
  });
  globals.$API_URL = API_URL;
  globals.$pagination = pagination;
  globals.statusBarHeight = platformState.statusBarHeight;
  installPlatformGlobals(globals);

  // #ifdef H5
  globals.$wxsdk = wxsdk;
  // #endif

  return { app };
}

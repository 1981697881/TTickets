/// <reference types="@dcloudio/types" />
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export default component;
}

declare module '@/env.js' {
  export const BASE_URL: string;
  export const API_URL: string;
  export const HAS_LIVE: boolean | number | string;
  export const STATIC_CDN: string;
}

import store from '@/common/store';
import routeMeta from '@/common/router/route-meta';

const TAB_ROUTES = new Set([
  '/pages/index/circuit',
  '/pages/menu/menu',
  '/pages/index/index',
  '/pages/index/videoGame',
  '/pages/index/user'
]);

const routePayloads = new Map();
const tabQueries = new Map();
let payloadSeed = 0;

function normalizePath(path = '') {
  const clean = String(path).split('?')[0];
  return clean.startsWith('/') ? clean : `/${clean}`;
}

function safeDecode(value) {
  if (value == null || typeof value !== 'string') return value;
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch (_) {}
  if (/^[\[{]/.test(decoded)) {
    try { return JSON.parse(decoded); } catch (_) {}
  }
  return decoded;
}

function currentRoute() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  const page = pages[pages.length - 1];
  const path = normalizePath(page?.route || '');
  const options = { ...(page?.options || {}) };
  const token = options.__rt;
  delete options.__rt;
  const decoded = Object.fromEntries(Object.entries(options).map(([key, value]) => [key, safeDecode(value)]));
  const query = token && routePayloads.has(token) ? routePayloads.get(token) : { ...(tabQueries.get(path) || {}), ...decoded };
  return { path, query, fullPath: path };
}

function createUrl(path, query = {}) {
  const entries = Object.entries(query || {}).filter(([, value]) => value !== undefined && value !== null);
  if (!entries.length) return path;
  const token = `r${Date.now().toString(36)}${(payloadSeed++).toString(36)}`;
  routePayloads.set(token, query);
  const pairs = entries.map(([key, value]) => {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    return `${encodeURIComponent(key)}=${encodeURIComponent(serialized)}`;
  });
  pairs.push(`__rt=${token}`);
  return `${path}?${pairs.join('&')}`;
}

function canNavigate(path) {
  const meta = routeMeta[path];
  if (!meta?.auth) return true;
  const hasUser = Boolean(uni.getStorageSync('userInfo'));
  if (!hasUser) store.commit('LOGIN_TIP', true);
  return hasUser;
}

function parseSearch(search) {
  if (!search) return {};
  return search.split('&').reduce((query, pair) => {
    const [key, value = ''] = pair.split('=');
    if (key) query[safeDecode(key)] = safeDecode(value);
    return query;
  }, {});
}

function toRoute(input) {
  if (typeof input === 'string') {
    const [path, search = ''] = input.split('?');
    return { path: normalizePath(path), query: parseSearch(search) };
  }
  return { path: normalizePath(input?.path || input?.url || ''), query: input?.query || {} };
}

function push(input) {
  const route = toRoute(input);
  if (!canNavigate(route.path)) return Promise.resolve(false);
  if (TAB_ROUTES.has(route.path)) {
    tabQueries.set(route.path, route.query);
    return new Promise((resolve, reject) => uni.switchTab({ url: route.path, success: resolve, fail: reject }));
  }
  return new Promise((resolve, reject) => uni.navigateTo({ url: createUrl(route.path, route.query), success: resolve, fail: reject }));
}

function replace(input) {
  const route = toRoute(input);
  if (!canNavigate(route.path)) return Promise.resolve(false);
  if (TAB_ROUTES.has(route.path)) {
    tabQueries.set(route.path, route.query);
    return new Promise((resolve, reject) => uni.switchTab({ url: route.path, success: resolve, fail: reject }));
  }
  return new Promise((resolve, reject) => uni.redirectTo({ url: createUrl(route.path, route.query), success: resolve, fail: reject }));
}

function back(delta = 1) {
  const actualDelta = typeof delta === 'object' ? delta.delta || 1 : delta;
  return new Promise((resolve, reject) => uni.navigateBack({ delta: actualDelta, success: resolve, fail: reject }));
}

const router = {
  push,
  replace,
  replaceAll(input) {
    const route = toRoute(input);
    if (!canNavigate(route.path)) return Promise.resolve(false);
    return new Promise((resolve, reject) => uni.reLaunch({ url: createUrl(route.path, route.query), success: resolve, fail: reject }));
  },
  back,
  get $Route() { return currentRoute(); }
};

export default router;

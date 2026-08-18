import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import fs from 'node:fs';
import path from 'node:path';

const sourceExtensions = /\.(?:vue|js|ts|json|scss|css|wxml|wxss)$/i;
const staticAssetPattern =
  /(?:(?:@\/|\/|\.\.\/|\.\/)+)?static\/[A-Za-z0-9_./@+-]+\.(?:png|jpe?g|gif|webp|svg|ttf|woff2?)/gi;
const ignoredDirectories = new Set(['node_modules', 'dist', 'unpackage', '.tmp', '.git']);
const hashedAssetPattern =
  /\/assets\/([A-Za-z0-9_.@+-]+\.(?:png|jpe?g|gif|webp|svg|ttf|woff2?))/g;

/** 必须留在主包：tabBar / 样式字体 / 二维码中心 logo（canvas 不能画 CDN 图） */
const LOCAL_STATIC_PREFIXES = ['static/tabbar/', 'static/colorui/', 'static/font/', 'static/style/', 'static/qrcode/'];

function readStaticCdn(inputDir) {
  const envPath = path.join(inputDir, 'env.js');
  if (!fs.existsSync(envPath)) return '';
  const code = fs.readFileSync(envPath, 'utf8');
  const match = code.match(/export\s+const\s+STATIC_CDN\s*=\s*['"]([^'"]*)['"]/);
  return String(match?.[1] || '')
    .trim()
    .replace(/\/+$/, '');
}

function isLocalOnlyStatic(assetPath) {
  const normalized = assetPath.replace(/^\/+/, '');
  return LOCAL_STATIC_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function collectReferencedStaticAssets(inputDir) {
  const assets = new Set();

  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (ignoredDirectories.has(entry.name)) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(file);
      } else if (sourceExtensions.test(entry.name)) {
        const source = fs.readFileSync(file, 'utf8');
        for (const match of source.matchAll(staticAssetPattern)) {
          assets.add(
            match[0].replace(/^(?:@\/|\/|\.\.\/|\.\/)+/, '').replace(/\/{2,}/g, '/')
          );
        }
      }
    }
  }

  visit(inputDir);
  return assets;
}

function collectStaticFileMap(staticDir) {
  /** @type {Map<string, string[]>} */
  const map = new Map();

  function visit(directory, urlBase) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath, `${urlBase}/${entry.name}`);
        continue;
      }
      const url = `${urlBase}/${entry.name}`.replace(/\/{2,}/g, '/');
      const list = map.get(entry.name) || [];
      list.push(url);
      map.set(entry.name, list);
    }
  }

  visit(staticDir, '/static');
  return map;
}

function stripViteHash(fileName) {
  let match = fileName.match(/^(.+)\.([a-f0-9]{8})\.([^.]+)$/i);
  if (match) return `${match[1]}.${match[3]}`;
  match = fileName.match(/^(.+)-([A-Za-z0-9_-]{8})\.([^.]+)$/);
  if (match) return `${match[1]}.${match[3]}`;
  return fileName;
}

function resolveStaticUrl(fileName, staticMap) {
  const originalName = stripViteHash(fileName);
  const candidates = staticMap.get(originalName) || [];
  if (!candidates.length) return null;
  return candidates.sort((a, b) => a.length - b.length)[0];
}

function isMpOutput(outputDir) {
  const platform = process.env.UNI_PLATFORM || '';
  return platform.startsWith('mp') || /[\\/]mp-[^\\/]+$/i.test(outputDir);
}

function copyReferencedStaticAssets(inputDir, outputDir, options = {}) {
  const cdn = options.cdn || '';
  for (const asset of collectReferencedStaticAssets(inputDir)) {
    // 启用 CDN 后：业务图（主要是 imgs）不再打进主包
    if (cdn && !isLocalOnlyStatic(asset)) continue;

    const source = path.resolve(inputDir, asset);
    const destination = path.resolve(outputDir, asset);
    const relativeSource = path.relative(inputDir, source);
    const relativeDestination = path.relative(outputDir, destination);

    if (
      relativeSource.startsWith('..') ||
      path.isAbsolute(relativeSource) ||
      relativeDestination.startsWith('..') ||
      path.isAbsolute(relativeDestination)
    ) {
      throw new Error(`Invalid static asset path: ${asset}`);
    }
    if (!fs.existsSync(source)) {
      throw new Error(`Missing static asset: ${asset}`);
    }

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
}

function toCdnAssetUrl(localUrl, cdn) {
  const relative = String(localUrl || '')
    .replace(/\\/g, '/')
    .replace(/^\/?static\/imgs\//, '')
    .replace(/^\/?imgs\//, '')
    .replace(/^\/?static\//, '')
    .replace(/^\/+/, '');
  return `${String(cdn).replace(/\/+$/, '')}/${relative}`;
}

function rewriteOutputToCdn(outputDir, cdn) {
  if (!cdn) return;

  const textExt = /\.(?:js|json|wxml|wxss|css|html|vue)$/i;
  const cdnBase = String(cdn).replace(/\/+$/, '');

  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
        continue;
      }
      if (!textExt.test(entry.name)) continue;
      let code = fs.readFileSync(fullPath, 'utf8');
      // /static/imgs/xxx -> https://cdn/imgs/xxx （CDN 根即 imgs 目录）
      const next = code
        .replace(/(["'`])\/static\/imgs\/([^"'`]+)\1/g, `$1${cdnBase}/$2$1`)
        .replace(/(["'`])static\/imgs\/([^"'`]+)\1/g, `$1${cdnBase}/$2$1`);
      if (next !== code) fs.writeFileSync(fullPath, next);
    }
  }

  visit(outputDir);
}

function removePackagedImgs(outputDir, cdn) {
  if (!cdn) return;
  const imgsDir = path.join(outputDir, 'static', 'imgs');
  if (fs.existsSync(imgsDir)) {
    fs.rmSync(imgsDir, { recursive: true, force: true });
  }
}

function patchMpAssetsJs(inputDir, outputDir, cdn) {
  const assetsJsPath = path.join(outputDir, 'common', 'assets.js');
  if (!fs.existsSync(assetsJsPath)) return false;

  const staticMap = collectStaticFileMap(path.join(inputDir, 'static'));
  let code = fs.readFileSync(assetsJsPath, 'utf8');
  const hashedNames = new Set();

  code = code.replace(hashedAssetPattern, (full, fileName) => {
    hashedNames.add(fileName);
    const localUrl = resolveStaticUrl(fileName, staticMap);
    if (!localUrl) return full;
    if (cdn && !isLocalOnlyStatic(localUrl.replace(/^\//, ''))) {
      return toCdnAssetUrl(localUrl, cdn);
    }
    return localUrl;
  });

  if (cdn) {
    const cdnBase = String(cdn).replace(/\/+$/, '');
    code = code
      .replace(/(["'`])\/static\/imgs\/([^"'`]+)\1/g, `$1${cdnBase}/$2$1`)
      .replace(/(["'`])static\/imgs\/([^"'`]+)\1/g, `$1${cdnBase}/$2$1`);
  }

  fs.writeFileSync(assetsJsPath, code);

  if (!cdn) {
    for (const fileName of hashedNames) {
      const localUrl = resolveStaticUrl(fileName, staticMap);
      if (!localUrl) continue;
      const source = path.join(inputDir, localUrl.replace(/^\//, ''));
      const destination = path.join(outputDir, 'assets', fileName);
      if (!fs.existsSync(source)) continue;
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
    }
  }

  return true;
}

function patchVendorDeprecatedSystemInfo(outputDir) {
  if (!isMpOutput(outputDir)) return false;
  const vendorPath = path.join(outputDir, 'common', 'vendor.js');
  if (!fs.existsSync(vendorPath)) return false;
  let code = fs.readFileSync(vendorPath, 'utf8');
  const before = code;
  // 开发未压缩：getAppBaseInfo 已取到 theme 后仍调用 getSystemInfoSync
  code = code.replace(
    /function getSystemTheme\(\)\s*\{[\s\S]*?return normalizeThemeMode\(theme2\);\s*\}/,
    `function getSystemTheme() {
  let theme2 = "light";
  try {
    if (typeof index$1 !== "undefined" && typeof index$1.getAppBaseInfo === "function") {
      const appBaseInfo = index$1.getAppBaseInfo() || {};
      if (appBaseInfo.theme) {
        return normalizeThemeMode(appBaseInfo.theme);
      }
    } else if (typeof index$1 !== "undefined" && typeof index$1.getSystemInfoSync === "function") {
      const systemInfo2 = index$1.getSystemInfoSync() || {};
      if (systemInfo2.theme) theme2 = systemInfo2.theme;
    }
  } catch (e2) {
    theme2 = "light";
  }
  return normalizeThemeMode(theme2);
}`
  );
  // 生产压缩：有 getAppBaseInfo 时不再回落 getSystemInfoSync（会触发废弃告警）
  code = code.replace(
    /typeof ([A-Za-z_$][\w$]*)\.getAppBaseInfo\)\{const ([A-Za-z_$][\w$]*)=\1\.getAppBaseInfo\(\)\|\|\{\};\2\.theme&&\(([A-Za-z_$][\w$]*)=\2\.theme\)\}if\(void 0!==\1&&"function"==typeof \1\.getSystemInfoSync\)\{const ([A-Za-z_$][\w$]*)=\1\.getSystemInfoSync\(\)\|\|\{\};\4\.theme&&\(\3=\4\.theme\)\}/g,
    'typeof $1.getAppBaseInfo){const $2=$1.getAppBaseInfo()||{};$2.theme&&($3=$2.theme)}else if(void 0!==$1&&"function"==typeof $1.getSystemInfoSync){const $4=$1.getSystemInfoSync()||{};$4.theme&&($3=$4.theme)}'
  );
  if (code === before) return false;
  fs.writeFileSync(vendorPath, code);
  return true;
}

function copyStaticAssets() {
  let config;

  return {
    name: 'ttickets:copy-static-assets',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    writeBundle() {
      const inputDir = path.resolve(process.env.UNI_INPUT_DIR || config.root);
      const outputDir = path.resolve(process.env.UNI_OUTPUT_DIR || config.build.outDir);
      const cdn = readStaticCdn(inputDir);
      copyReferencedStaticAssets(inputDir, outputDir, { cdn });
      patchVendorDeprecatedSystemInfo(outputDir);
      rewriteOutputToCdn(outputDir, cdn);
      removePackagedImgs(outputDir, cdn);
    }
  };
}

/**
 * 1) 把 common/assets.js 里的 /assets/*.hash 指回 /static（或 CDN）
 * 2) 未开 CDN 时把原图拷到 assets/ 兜底
 */
function fixMpHashedAssets() {
  let config;
  let watching = false;
  /** @type {fs.FSWatcher | null} */
  let watcher = null;
  let patchTimer = null;

  function dirs() {
    const inputDir = path.resolve(process.env.UNI_INPUT_DIR || config.root);
    const outputDir = path.resolve(process.env.UNI_OUTPUT_DIR || config.build.outDir);
    return { inputDir, outputDir };
  }

  function patch() {
    const { inputDir, outputDir } = dirs();
    if (!isMpOutput(outputDir)) return;
    const cdn = readStaticCdn(inputDir);
    copyReferencedStaticAssets(inputDir, outputDir, { cdn });
    patchMpAssetsJs(inputDir, outputDir, cdn);
    patchVendorDeprecatedSystemInfo(outputDir);
    rewriteOutputToCdn(outputDir, cdn);
    removePackagedImgs(outputDir, cdn);
  }

  function schedulePatch() {
    if (patchTimer) clearTimeout(patchTimer);
    patchTimer = setTimeout(() => {
      patchTimer = null;
      patch();
    }, 50);
  }

  function ensureWatch() {
    if (watching || !config?.build?.watch) return;
    const { outputDir } = dirs();
    if (!isMpOutput(outputDir)) return;
    watching = true;

    const commonDir = path.join(outputDir, 'common');
    fs.mkdirSync(commonDir, { recursive: true });

    try {
      watcher?.close();
      watcher = fs.watch(commonDir, { persistent: false }, (_event, filename) => {
        if (!filename || filename === 'assets.js' || String(filename).endsWith('assets.js')) {
          schedulePatch();
        }
      });
    } catch {
      // ignore
    }

    [0, 100, 300, 800].forEach((ms) => setTimeout(patch, ms));
  }

  return {
    name: 'ttickets:fix-mp-hashed-assets',
    enforce: 'post',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    writeBundle() {
      patch();
      ensureWatch();
    },
    closeBundle() {
      patch();
      ensureWatch();
      [0, 120, 400].forEach((ms) => setTimeout(patch, ms));
    }
  };
}

export default defineConfig({
  plugins: [
    uni({
      vueOptions: {
        template: {
          transformAssetUrls: {
            includeAbsolute: false,
            tags: {}
          }
        }
      }
    }),
    copyStaticAssets(),
    fixMpHashedAssets()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'color-functions', 'import']
      }
    }
  },
  build: {
    target: 'es2018',
    cssCodeSplit: true
  }
});

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'dist', 'build', 'mp-weixin');
const ignored = new Set(['node_modules', 'uview-ui', 'unpackage', 'dist', '.tmp', '.git']);
const limit = 2 * 1024 * 1024;
const failures = [];
const staticAssetPattern = /(?:(?:@\/|\/|\.\.\/|\.\/)+)?static\/[A-Za-z0-9_./@+-]+\.(?:png|jpe?g|gif|webp|svg|ttf|woff2?)/gi;

function walk(dir, predicate = () => true, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, predicate, files);
    else if (predicate(file)) files.push(file);
  }
  return files;
}

function sizeOf(files) {
  return files.reduce((total, file) => total + fs.statSync(file).size, 0);
}

function formatMiB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(3)} MiB`;
}

function collectReferencedStaticAssets() {
  const assets = new Set();
  for (const file of walk(root, file => /\.(?:vue|js|ts|json|scss|css)$/i.test(file))) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(staticAssetPattern)) {
      assets.add(match[0].replace(/^(?:@\/|\/|\.\.\/|\.\/)+/, ''));
    }
  }
  return assets;
}

if (!fs.existsSync(output)) {
  failures.push('Missing dist/build/mp-weixin. Run npm run build:mp-weixin first.');
} else {
  const app = JSON.parse(fs.readFileSync(path.join(output, 'app.json'), 'utf8'));
  const project = JSON.parse(fs.readFileSync(path.join(output, 'project.config.json'), 'utf8'));
  const appWxss = fs.readFileSync(path.join(output, 'app.wxss'), 'utf8');
  const outputFiles = walk(output);
  const subRoots = (app.subPackages || []).map(item => item.root.replaceAll('/', path.sep));
  const mainFiles = outputFiles.filter(file => {
    const relative = path.relative(output, file);
    return !subRoots.some(subRoot => relative === subRoot || relative.startsWith(`${subRoot}${path.sep}`));
  });
  const mainSize = sizeOf(mainFiles);
  const routeCount = (app.pages || []).length + (app.subPackages || []).reduce((sum, item) => sum + item.pages.length, 0);

  console.log(`Routes: ${routeCount}`);
  console.log(`Main package: ${formatMiB(mainSize)}`);
  if (routeCount !== 73) failures.push(`Expected 73 routes, found ${routeCount}.`);
  if (mainSize > limit) failures.push(`Main package exceeds 2 MiB: ${formatMiB(mainSize)}.`);
  if (!/^wx[a-f0-9]{16}$/i.test(project.appid || '')) failures.push('Missing or invalid WeChat AppID.');
  if (/@media\s*\(prefers-reduced-motion:[^)]+\)/.test(appWxss)) {
    failures.push('app.wxss contains a Web-only prefers-reduced-motion query.');
  }

  for (const asset of collectReferencedStaticAssets()) {
    if (!fs.existsSync(path.join(root, asset))) {
      failures.push(`Referenced static asset is missing: ${asset}.`);
    } else if (!fs.existsSync(path.join(output, asset))) {
      failures.push(`Referenced static asset was not emitted: ${asset}.`);
    }
  }

  for (const [index, item] of (app.tabBar?.list || []).entries()) {
    for (const field of ['iconPath', 'selectedIconPath']) {
      const asset = item[field];
      if (!asset) {
        failures.push(`tabBar.list[${index}].${field} is missing.`);
        continue;
      }

      const assetPath = path.resolve(output, asset);
      const relativeAsset = path.relative(output, assetPath);
      if (relativeAsset.startsWith('..') || path.isAbsolute(relativeAsset)) {
        failures.push(`tabBar.list[${index}].${field} points outside the build output: ${asset}.`);
      } else if (!fs.existsSync(assetPath)) {
        failures.push(`tabBar.list[${index}].${field} was not emitted: ${asset}.`);
      }
    }
  }

  for (const pack of app.subPackages || []) {
    const packRoot = pack.root.replaceAll('/', path.sep);
    const packFiles = outputFiles.filter(file => {
      const relative = path.relative(output, file);
      return relative === packRoot || relative.startsWith(`${packRoot}${path.sep}`);
    });
    const packSize = sizeOf(packFiles);
    console.log(`${pack.root}: ${formatMiB(packSize)}`);
    if (packSize > limit) failures.push(`${pack.root} exceeds 2 MiB: ${formatMiB(packSize)}.`);
  }
}

for (const file of walk(root, file => /\.(vue|js|ts)$/.test(file))) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  if (/cathctouchmove|catchtouchmove/.test(source)) failures.push(`${relative}: legacy touchmove attribute.`);
  if (/class\s*=\s*["'][^"']*\bcu-modal\b/.test(source)) failures.push(`${relative}: raw ColorUI modal.`);
  if (/\$emit\(\s*["']input["']/.test(source) && !/modelValue/.test(source)) {
    failures.push(`${relative}: legacy v-model emit without modelValue support.`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Release readiness failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log('Release readiness check passed.');
}

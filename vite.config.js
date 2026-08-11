import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import fs from 'node:fs';
import path from 'node:path';

const sourceExtensions = /\.(?:vue|js|ts|json|scss|css)$/i;
const staticAssetPattern = /(?:(?:@\/|\/|\.\.\/|\.\/)+)?static\/[A-Za-z0-9_./@+-]+\.(?:png|jpe?g|gif|webp|svg|ttf|woff2?)/gi;
const ignoredDirectories = new Set(['node_modules', 'dist', 'unpackage', '.tmp', '.git']);

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
          assets.add(match[0].replace(/^(?:@\/|\/|\.\.\/|\.\/)+/, ''));
        }
      }
    }
  }

  visit(inputDir);
  return assets;
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
      for (const asset of collectReferencedStaticAssets(inputDir)) {
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
  };
}

export default defineConfig({
  plugins: [uni(), copyStaticAssets()],
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

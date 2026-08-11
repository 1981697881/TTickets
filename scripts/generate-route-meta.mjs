import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'jsonc-parser';

const root = process.cwd();
const pagesFile = path.join(root, 'pages.json');
const outputFile = path.join(root, 'common', 'router', 'route-meta.js');
const config = parse(fs.readFileSync(pagesFile, 'utf8'));
const routeMeta = {};

for (const page of config.pages || []) {
  routeMeta[`/${page.path}`] = page.meta || {};
}

for (const pack of config.subPackages || []) {
  for (const page of pack.pages || []) {
    routeMeta[`/${pack.root}/${page.path}`] = page.meta || {};
  }
}

const output = `// Auto-generated from pages.json. Do not edit manually.\nexport default ${JSON.stringify(routeMeta, null, 2)};\n`;
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, output, 'utf8');
console.log(`Generated ${Object.keys(routeMeta).length} route metadata entries.`);

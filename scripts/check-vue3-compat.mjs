import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignored = new Set(['node_modules', 'unpackage', 'dist', '.tmp', '.git', 'uview-ui']);
const rules = [
  ['legacy Vue constructor', /new\s+Vue\s*\(/g],
  ['legacy Vue.use', /Vue\.use\s*\(/g],
  ['legacy destroy hook', /\b(beforeDestroy|destroyed)\s*\(/g],
  ['legacy .sync modifier', /\.sync\s*=/g],
  ['legacy deep selector', /\/deep\//g],
  ['legacy this.$set helper', /\bthis\.\$set\s*\(/g],
  ['legacy this.$delete helper', /\bthis\.\$delete\s*\(/g],
  ['legacy slot-scope attribute', /\bslot-scope\s*=/g],
  ['legacy filters option', /\bfilters\s*:\s*\{/g],
  ['legacy functional option', /\bfunctional\s*:\s*true/g]
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(vue|js|ts)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let findings = 0;
for (const file of walk(root)) {
  const source = fs.readFileSync(file, 'utf8');
  for (const [label, pattern] of rules) {
    const matches = source.match(pattern);
    if (!matches?.length) continue;
    findings += matches.length;
    console.warn(`${path.relative(root, file)}: ${label} (${matches.length})`);
  }
}

if (findings) {
  console.error(`Vue 3 compatibility check found ${findings} remaining item(s).`);
  process.exitCode = 1;
} else {
  console.log('Vue 3 compatibility check passed.');
}

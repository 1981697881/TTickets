import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignored = new Set(['node_modules', 'unpackage', '.git', 'uview-ui']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(vue|js)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(root)) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before
    .replace(/\bbeforeDestroy\s*\(/g, 'beforeUnmount(')
    .replace(/\bdestroyed\s*\(/g, 'unmounted(')
    .replace(/:([\w-]+)\.sync=/g, ':$1=')
    .replace(/\/deep\/\s*([^\n{]+)\s*\{/g, (_, selector) => `:deep(${selector.trim()}) {`);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed += 1;
  }
}

console.log(`Migrated Vue 3 syntax in ${changed} file(s).`);

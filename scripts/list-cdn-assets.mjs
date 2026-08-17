import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imgsDir = path.join(root, 'static', 'imgs');

function walk(dir, base = '') {
	const rows = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const rel = path.posix.join(base, entry.name);
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) rows.push(...walk(full, rel));
		else rows.push(rel);
	}
	return rows;
}

if (!fs.existsSync(imgsDir)) {
	console.error('static/imgs not found');
	process.exit(1);
}

const files = walk(imgsDir);
const total = files.reduce((sum, rel) => sum + fs.statSync(path.join(imgsDir, rel)).size, 0);

console.log(`CDN upload root: static/imgs  (${files.length} files, ${(total / 1024).toFixed(1)} KB)`);
console.log('Remote path should mirror: {STATIC_CDN}/imgs/...');
console.log('Keep local (do NOT upload as CDN-only): static/tabbar, static/colorui, static/font, static/style');
console.log('---');
for (const file of files) {
	console.log(`imgs/${file}`);
}

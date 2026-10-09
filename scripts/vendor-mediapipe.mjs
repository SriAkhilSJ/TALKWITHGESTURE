import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', '@mediapipe', 'hands');
const dest = join(root, 'public', 'mediapipe', 'hands');

if (!existsSync(src)) {
  console.warn('vendor-mediapipe: @mediapipe/hands not installed yet, skipping');
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
for (const entry of readdirSync(src)) {
  if (entry === 'package.json' || entry === 'README.md') continue;
  cpSync(join(src, entry), join(dest, entry), { recursive: true });
}
console.log(`vendor-mediapipe: copied assets to ${dest}`);

/**
 * optimize-images.mjs - resize + recompress the migrated images in place so the
 * repo stays lean and pages load fast. Keeps the original format/filename so the
 * Markdown references don't change. Full-res originals are never committed.
 */
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
// Optimise the whole image tree (migrated blog images live in various old
// Joomla paths, not just /blog). Re-running is idempotent enough.
const DIR = resolve(ROOT, process.argv[2] || 'src/assets/img');
const MAX_W = 1400;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(jpe?g|png)$/i.test(name)) out.push(p);
  }
  return out;
}

const files = walk(DIR);
let before = 0;
let after = 0;
for (const file of files) {
  before += statSync(file).size;
  try {
    const img = sharp(file, { failOn: 'none' }).rotate();
    const meta = await img.metadata();
    if (meta.width && meta.width > MAX_W) img.resize({ width: MAX_W, withoutEnlargement: true });
    const isPng = extname(file).toLowerCase() === '.png';
    const buf = await (
      isPng
        ? img.png({ compressionLevel: 9, palette: true, quality: 82 })
        : img.jpeg({ quality: 80, mozjpeg: true })
    ).toBuffer();
    writeFileSync(file, buf);
    after += buf.length;
  } catch (e) {
    console.log(`  ! ${file}: ${e.message}`);
    after += statSync(file).size;
  }
}
const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
console.log(`Optimised ${files.length} images: ${mb(before)} -> ${mb(after)}`);

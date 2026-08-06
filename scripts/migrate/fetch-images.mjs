/**
 * fetch-images.mjs - download the re-hosted images listed in migration/images.txt
 * (from the old site) into src/assets/img/. Maintainer tool; the downloaded
 * files are committed and served from our own origin.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const list = readFileSync(resolve(ROOT, 'migration/images.txt'), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)
  .map((l) => l.split(/\s+/));

const UA = 'Mozilla/5.0 (migration image fetch; silavapi.co.uk)';
const failures = [];
let ok = 0;
let skipped = 0;

async function fetchOne([url, localPath]) {
  const dest = resolve(ROOT, 'src' + localPath); // localPath starts with /assets/...
  if (existsSync(dest)) {
    skipped += 1;
    return;
  }
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) throw new Error(`tiny (${buf.length}b)`);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    ok += 1;
  } catch (e) {
    failures.push(`${url}  ->  ${e.message}`);
  }
}

// Small concurrency pool.
const POOL = 6;
let i = 0;
async function worker() {
  while (i < list.length) {
    const item = list[i++];
    await fetchOne(item);
    if ((ok + failures.length + skipped) % 25 === 0) {
      console.log(`  ${ok + failures.length + skipped}/${list.length}…`);
    }
  }
}
await Promise.all(Array.from({ length: POOL }, worker));

writeFileSync(resolve(ROOT, 'migration/image-failures.txt'), failures.join('\n') + '\n');
console.log(`\nDownloaded: ${ok} | skipped(existing): ${skipped} | failed: ${failures.length}`);
if (failures.length) console.log('Failures written to migration/image-failures.txt');

#!/usr/bin/env node
/**
 * fetch-icons.mjs - vendor the Lucide SVGs we use into src/assets/icons/.
 *
 * Like the font script, this contacts a dependency (the ISC-licensed
 * lucide-static package) only at maintainer time; the committed SVGs are the
 * source of truth and the site inlines them (so currentColor + a strict CSP
 * both work). Re-run after adding an icon to NEEDED.
 *
 * Usage:  node scripts/fetch-icons.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'node_modules/lucide-static/icons');
const OUT = resolve(ROOT, 'src/assets/icons');

// Icons the site uses. Keep this list tight; add as components need them.
const NEEDED = [
  'users',
  'accessibility',
  'flower',
  'activity',
  'search',
  'arrow-right',
  'arrow-left',
  'arrow-up-right',
  'play',
  'map-pin',
  'calendar',
  'sun',
  'moon',
  'monitor',
  'menu',
  'x',
];

await mkdir(OUT, { recursive: true });
for (const name of NEEDED) {
  let svg = await readFile(resolve(SRC, `${name}.svg`), 'utf8');
  // Strip the license comment and the library class; keep the geometry.
  svg = svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*class="[^"]*"/, '')
    .trim();
  await writeFile(resolve(OUT, `${name}.svg`), `${svg}\n`);
  console.log(`  vendored ${name}.svg`);
}
console.log(`\nVendored ${NEEDED.length} icons -> src/assets/icons/`);

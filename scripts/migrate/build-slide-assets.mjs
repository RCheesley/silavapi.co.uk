#!/usr/bin/env node
/**
 * build-slide-assets.mjs - build the self-hosted slide assets for migrated
 * talks: a lean image-PDF rebuilt from Notist's slide JPGs, plus a cover image
 * (the first slide). This is the heavy, network-bound half of the migration and
 * is RESUMABLE - it skips any talk whose PDF already exists, so a throttled run
 * can simply be run again until everything is present.
 *
 * Why rebuild rather than mirror Notist's PDF: a Notist deck is ~30MB; rebuilt
 * from downscaled slides it is ~2-3MB, keeping the repo lean while staying fully
 * self-hosted (no third-party dependency - Ruth's decision, 2026-08-06).
 *
 * Reads migration/talk-decks.json (written by scrape-notist.mjs).
 *
 * Usage:
 *   node scripts/migrate/build-slide-assets.mjs           # all pending
 *   node scripts/migrate/build-slide-assets.mjs --force   # rebuild even if present
 *   node scripts/migrate/build-slide-assets.mjs --only who-owns-your-data-...
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST = resolve(ROOT, 'migration/talk-decks.json');
const SLIDE_DIR = resolve(ROOT, 'src/assets/slides');
const IMG_DIR = resolve(ROOT, 'src/assets/img/talks');
const UA = 'Mozilla/5.0 (compatible; silavapi-migration/1.0; +https://silavapi.co.uk)';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exists = (p) =>
  access(p)
    .then(() => true)
    .catch(() => false);

/** Fetch a slide JPG, retrying throttled/partial responses; returns a decoded,
 *  downscaled JPEG buffer (or null if the slide genuinely 404s / can't decode). */
async function getSlide(url, { tries = 5 } = {}) {
  let wait = 1000;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA } });
      if (res.status === 404) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      if (res.ok && buf[0] === 0xff && buf[1] === 0xd8) {
        // Validate + downscale; a truncated body throws here and we retry.
        return await sharp(buf)
          .resize({ width: 1600, withoutEnlargement: true })
          .jpeg({ quality: 72, mozjpeg: true })
          .toBuffer();
      }
    } catch {
      /* retry */
    }
    await sleep(wait);
    wait = Math.min(wait * 2, 12000);
  }
  throw new Error(`slide unavailable after ${tries} tries: ${url}`);
}

async function buildOne(entry) {
  const { slug, deckId, slideCount } = entry;
  const pdfPath = resolve(SLIDE_DIR, `${slug}.pdf`);
  const coverPath = resolve(IMG_DIR, `${slug}.jpg`);
  if (!FORCE && (await exists(pdfPath)) && (await exists(coverPath)))
    return { slug, skipped: true };

  const pdf = await PDFDocument.create();
  let built = 0;
  for (let n = 0; n < slideCount; n++) {
    const jpg = await getSlide(`https://on.notist.cloud/slides/deck${deckId}/large-${n}.jpg`);
    if (!jpg) continue; // slide missing - skip, keep going
    if (n === 0) await writeFile(coverPath, jpg); // first slide = cover
    const img = await pdf.embedJpg(jpg);
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    built++;
    await sleep(180);
  }
  if (!built) throw new Error(`no slides built for ${slug}`);
  const bytes = await pdf.save();
  await writeFile(pdfPath, bytes);
  return { slug, pages: built, bytes: bytes.length };
}

// --- main ------------------------------------------------------------------
await mkdir(SLIDE_DIR, { recursive: true });
await mkdir(IMG_DIR, { recursive: true });
const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
let decks = manifest.filter((m) => m.deckId && m.slideCount > 0);
if (ONLY) decks = decks.filter((m) => m.slug === ONLY);

console.log(
  `Building slide assets for ${decks.length} deck(s)${FORCE ? ' (force)' : ' (resumable)'}...\n`
);
let done = 0;
let skipped = 0;
let failed = 0;
let totalBytes = 0;
for (const [i, entry] of decks.entries()) {
  try {
    const r = await buildOne(entry);
    if (r.skipped) {
      skipped++;
      console.log(`  [${i + 1}/${decks.length}] ${entry.slug} — already built, skipped`);
    } else {
      done++;
      totalBytes += r.bytes;
      console.log(
        `  [${i + 1}/${decks.length}] ${entry.slug} — ${r.pages} pages, ${(r.bytes / 1e6).toFixed(2)}MB`
      );
    }
  } catch (e) {
    failed++;
    console.log(`  [${i + 1}/${decks.length}] ${entry.slug} — FAILED: ${e.message}`);
  }
}

console.log('\n=== Summary ===');
console.log(`Built   : ${done}  (${(totalBytes / 1e6).toFixed(0)}MB this run)`);
console.log(`Skipped : ${skipped} (already present)`);
console.log(`Failed  : ${failed}${failed ? '  — re-run to retry (resumable)' : ''}`);

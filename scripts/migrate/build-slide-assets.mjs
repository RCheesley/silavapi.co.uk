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
import { readFile, writeFile, mkdir, access, readdir, unlink } from 'node:fs/promises';
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
  const { slug, kind, deckId, slideCount } = entry;
  const pdfPath = resolve(SLIDE_DIR, `${slug}.pdf`);
  const coverPath = resolve(IMG_DIR, `${slug}.jpg`);
  const url = (n) => `https://on.notist.cloud/slides/deck${deckId}/large-${n}.jpg`;
  // Every deck yields a cover (first slide); only a real multi-slide talk deck
  // yields a slides PDF (podcasts are audio/video - a cover, no slides).
  const wantPdf = kind === 'talk' && slideCount > 1;
  const needCover = FORCE || !(await exists(coverPath));
  const needPdf = wantPdf && (FORCE || !(await exists(pdfPath)));
  if (!needCover && !needPdf) return { slug, skipped: true };

  // Cover only: use the first slide that actually exists (some decks are
  // 1-based or have sparse indices, so large-0 is not guaranteed). Probe a small
  // window even when the slide count is unknown (0), e.g. podcast cover decks.
  if (needCover && !needPdf) {
    const probeMax = Math.max(slideCount, 6);
    for (let n = 0; n <= probeMax; n++) {
      const jpg = await getSlide(url(n));
      if (jpg) {
        await writeFile(coverPath, jpg);
        return { slug, cover: true };
      }
      await sleep(150);
    }
    throw new Error(`no cover slide for ${slug}`);
  }

  const pdf = await PDFDocument.create();
  let built = 0;
  let coverWritten = false;
  for (let n = 0; n <= slideCount; n++) {
    const jpg = await getSlide(url(n));
    if (!jpg) continue; // slide missing - skip, keep going
    if (needCover && !coverWritten) {
      await writeFile(coverPath, jpg); // first slide that exists = cover
      coverWritten = true;
    }
    const img = await pdf.embedJpg(jpg);
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    built++;
    await sleep(180);
  }
  if (!built) throw new Error(`no slides built for ${slug}`);
  const bytes = await pdf.save();
  await writeFile(pdfPath, bytes);
  return { slug, pages: built, bytes: bytes.length, cover: needCover };
}

// --- main ------------------------------------------------------------------
await mkdir(SLIDE_DIR, { recursive: true });
await mkdir(IMG_DIR, { recursive: true });
const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
let decks = manifest.filter((m) => m.deckId);
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
    } else if (r.pages) {
      done++;
      totalBytes += r.bytes;
      console.log(
        `  [${i + 1}/${decks.length}] ${entry.slug} — ${r.pages} pages, ${(r.bytes / 1e6).toFixed(2)}MB`
      );
    } else {
      done++;
      console.log(`  [${i + 1}/${decks.length}] ${entry.slug} — cover only`);
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

// Reconcile: drop any cover:/slides: front-matter line whose target file was not
// built (e.g. a podcast whose "deck" is only a thumbnail with no slide images),
// so the committed content never references a missing asset.
const TALK_DIR = resolve(ROOT, 'src/talks');
const POD_DIR = resolve(ROOT, 'src/podcasts');
let stripped = 0;
const referenced = new Set(); // web paths still referenced after stripping
for (const dir of [TALK_DIR, POD_DIR]) {
  let files;
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {
    continue;
  }
  for (const f of files) {
    const p = resolve(dir, f);
    const lines = (await readFile(p, 'utf8')).split('\n');
    const kept = [];
    for (const line of lines) {
      // A web path like /assets/img/talks/x.jpg maps to src/assets/img/talks/x.jpg.
      const m = line.match(/^(cover|slides):\s*\/(\S+)$/);
      if (m && !(await exists(resolve(ROOT, 'src', m[2])))) {
        stripped++;
        continue; // drop the dangling reference
      }
      if (m) referenced.add(m[2]);
      kept.push(line);
    }
    if (kept.length !== lines.length) await writeFile(p, kept.join('\n'));
  }
}
if (stripped) console.log(`Reconciled: removed ${stripped} dangling cover/slides reference(s)`);

// Prune built assets no talk references (e.g. slide PDFs of items later classed
// as podcasts) so the repo carries only what the site actually links.
let pruned = 0;
for (const sub of ['assets/slides', 'assets/img/talks']) {
  const dir = resolve(ROOT, 'src', sub);
  let files;
  try {
    files = await readdir(dir);
  } catch {
    continue;
  }
  for (const f of files) {
    if (!/\.(pdf|jpg)$/.test(f)) continue;
    if (!referenced.has(`${sub}/${f}`)) {
      await unlink(resolve(dir, f));
      pruned++;
    }
  }
}
if (pruned) console.log(`Reconciled: pruned ${pruned} unreferenced asset file(s)`);

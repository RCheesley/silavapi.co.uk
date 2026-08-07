/**
 * fetch-galleries.mjs - recover the image galleries from the old Joomla site's
 * JoomlArt content-type articles. Those galleries were custom-field data that
 * wasn't in the SQL export, but they still render on the live old site, so we
 * scrape each article's gallery (image src + migrated alt text), download and
 * downscale the files into src/assets/img/, and emit src/_data/galleries.json
 * keyed by the new-site slug. Maintainer tool; outputs are committed.
 *
 * Usage: node scripts/migrate/fetch-galleries.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseHtml } from 'node-html-parser';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const IMG_DIR = resolve(ROOT, 'src/assets/img');
const OLD_ORIGIN = 'https://www.ruthcheesley.co.uk';
const UA = 'Mozilla/5.0 (gallery recovery; silavapi.co.uk)';
const MAX_W = 1400;

// slug (new-site) -> live old-site path carrying the JA gallery.
const ARTICLES = {
  'introducing-silavapi': '/blog/buddhism/introducing-silavapi',
  'first-breathworks-in-person-board-meeting':
    '/blog/volunteering/first-breathworks-in-person-board-meeting',
  'my-first-long-distance-race-endure24-reading':
    '/blog/health-and-fitness/my-first-long-distance-race-endure24-reading',
  'acquia-volunteering-day-at-camp-mohawk':
    '/blog/volunteering/acquia-volunteering-day-at-camp-mohawk',
  runner: '/about/what-i-do/runner',
};

// Mirror migrate.mjs: decode segments; sanitise for the local filename but
// re-encode for the fetch URL so it still resolves on the old site. Returns null
// on anything malformed - the src comes from a scraped page, so it is untrusted.
function mapImage(srcRaw) {
  let decoded;
  try {
    decoded = decodeURIComponent(String(srcRaw).split('#')[0].split('?')[0]);
  } catch {
    return null; // invalid percent-encoding
  }
  const clean = decoded.replace(/^\/+/, '');
  if (!/^images\//i.test(clean)) return null;
  const segs = clean.split('/');
  const localSegs = segs.slice(1).map((s) => s.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-'));
  // Reject empty or dot segments so a crafted path can't escape src/assets/img/.
  if (localSegs.some((s) => s === '' || s === '.' || s === '..')) return null;
  const fetchUrl = OLD_ORIGIN + '/' + segs.map((s) => encodeURIComponent(s)).join('/');
  return { fetchUrl, local: '/assets/img/' + localSegs.join('/') };
}

// Alt text for gallery images that had none on the old site (keyed by the local
// filename). Written from the photos so screen-reader users aren't shorted.
const ALT_OVERRIDES = {
  'IMG_9850-2.jpg':
    'A facilitator gestures over a large design-thinking sheet on the table while four members of the Breathworks board and team look on, in a brick-walled room.',
  'IMG_9864-2.jpg':
    'Three of the group standing with their arms raised and hands joined above their heads, laughing, in front of the Breathworks library shelves.',
  'IMG_9858-2.jpg':
    'Members of the Breathworks board and team seated around the table, listening, beside tall brick-framed windows covered in notes and postcards.',
  'image_6483441.jpg':
    'Volunteers digging out the ground around an accessible playground roundabout, one kneeling in gardening gloves, under a gazebo in the woods.',
  'image_6483441-1.jpg':
    'Two volunteers grinning at the camera beside a wheelbarrow of soil, one holding a clump of earth, while others dig behind.',
  'roundabout-building.jpg':
    'A team of volunteers digging around the playground roundabout, with green gazebos and woodland behind.',
  'IMG_0547.png':
    'The volunteering group lined up behind four wheelbarrows in front of the wooden lodges at Camp Mohawk.',
};

// Some migrated alt strings have an unbalanced trailing "(" - tidy it.
function tidyAlt(alt) {
  let a = String(alt || '').trim();
  const opens = (a.match(/\(/g) || []).length;
  const closes = (a.match(/\)/g) || []).length;
  if (opens > closes) a += ')'.repeat(opens - closes);
  return a;
}

// Download + downscale a gallery image, returning the final local path. These
// are all photos, so we re-encode to JPG (flattening any alpha onto white) to
// keep the repo lean. An image already present in the repo is reused as-is, so
// a path referenced elsewhere (e.g. the migrated ordination lead image) stays.
async function download(fetchUrl, local) {
  if (existsSync(resolve(ROOT, 'src' + local))) return { local, skipped: true };
  const finalLocal = local.replace(/\.png$/i, '.jpg');
  const dest = resolve(ROOT, 'src' + finalLocal);
  // Defence in depth: never write outside src/assets/img/ (mapImage already
  // rejects dot segments, but the write path is the thing that must be safe).
  if (dest !== IMG_DIR && !dest.startsWith(IMG_DIR + sep)) {
    throw new Error(`refusing to write outside images dir: ${finalLocal}`);
  }
  if (existsSync(dest)) return { local: finalLocal, skipped: true };
  const res = await fetch(fetchUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const img = sharp(buf).rotate();
  const meta = await img.metadata();
  const pipe = meta.width && meta.width > MAX_W ? img.resize({ width: MAX_W }) : img;
  const out = await pipe
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, out);
  return { local: finalLocal, bytes: out.length };
}

const galleries = {};
let downloaded = 0;
let skipped = 0;
const failures = [];

for (const [slug, path] of Object.entries(ARTICLES)) {
  const res = await fetch(OLD_ORIGIN + path, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    failures.push(`${slug}: page fetch HTTP ${res.status}`);
    continue;
  }
  const root = parseHtml(await res.text());
  const article = root.querySelector('.item-page') || root;
  const wrap = article.querySelector('.ja-gallery-list-wrap');
  if (!wrap) {
    failures.push(`${slug}: no .ja-gallery-list-wrap found`);
    continue;
  }
  const seen = new Set();
  const items = [];
  for (const img of wrap.querySelectorAll('img')) {
    const mapped = mapImage(img.getAttribute('src') || '');
    if (!mapped || seen.has(mapped.local)) continue; // owl-carousel clones repeat srcs
    seen.add(mapped.local);
    let finalLocal;
    try {
      const r = await download(mapped.fetchUrl, mapped.local);
      finalLocal = r.local;
      r.skipped ? (skipped += 1) : (downloaded += 1);
    } catch (e) {
      failures.push(`${mapped.fetchUrl}: ${e.message}`);
      continue;
    }
    const base = finalLocal.split('/').pop();
    const origBase = mapped.local.split('/').pop();
    const alt =
      tidyAlt(img.getAttribute('alt')) || ALT_OVERRIDES[base] || ALT_OVERRIDES[origBase] || '';
    items.push({ src: finalLocal, alt, caption: '' });
  }
  galleries[slug] = items;
  console.log(`${slug}: ${items.length} images`);
}

writeFileSync(resolve(ROOT, 'src/_data/galleries.json'), JSON.stringify(galleries, null, 2) + '\n');
console.log(`\nDownloaded ${downloaded}, skipped ${skipped}. Wrote src/_data/galleries.json`);
if (failures.length) console.log('\nFailures:\n' + failures.join('\n'));

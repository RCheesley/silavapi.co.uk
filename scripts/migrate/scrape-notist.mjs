#!/usr/bin/env node
/**
 * scrape-notist.mjs - migrate Ruth's Notist speaking site into first-party
 * content. Fast metadata pass only; heavy slide assets are built separately by
 * build-slide-assets.mjs (which reads the manifest this writes).
 *
 * Like the other migration tooling this contacts the source (the public Notist
 * pages) only at maintainer time; the committed Markdown + images are the source
 * of truth. Reads the talk URLs from the gitignored migration/talk-urls.txt.
 *
 * Model (agreed with Ruth):
 *  - A talk given at several events is ONE page carrying an `events[]` array
 *    (every event, date and location); the archive still lists each presentation
 *    separately and the map lights up every location.
 *  - Podcasts / interviews / community-update videos are a SEPARATE kind
 *    (src/podcasts/) - not stage talks, kept out of the talks stat and the map.
 *
 * Usage:
 *   node scripts/migrate/scrape-notist.mjs            # all
 *   node scripts/migrate/scrape-notist.mjs --limit 8  # first N (smoke test)
 */
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parse } from 'node-html-parser';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://speaking.ruthcheesley.co.uk';
const URLS_FILE = resolve(ROOT, 'migration/talk-urls.txt');
const TALK_DIR = resolve(ROOT, 'src/talks');
const POD_DIR = resolve(ROOT, 'src/podcasts');
const MANIFEST = resolve(ROOT, 'migration/talk-decks.json');
const UA = 'Mozilla/5.0 (compatible; silavapi-migration/1.0; +https://silavapi.co.uk)';

const args = process.argv.slice(2);
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity;

// Country name -> ISO alpha-2 (lowercased keys). Unmapped names are reported.
const COUNTRY_ISO = {
  uk: 'gb',
  'united kingdom': 'gb',
  england: 'gb',
  scotland: 'gb',
  wales: 'gb',
  usa: 'us',
  us: 'us',
  'united states': 'us',
  'united states of america': 'us',
  germany: 'de',
  netherlands: 'nl',
  'the netherlands': 'nl',
  belgium: 'be',
  ireland: 'ie',
  france: 'fr',
  spain: 'es',
  portugal: 'pt',
  canada: 'ca',
  india: 'in',
  'south africa': 'za',
  kenya: 'ke',
  nigeria: 'ng',
  italy: 'it',
  austria: 'at',
  switzerland: 'ch',
  poland: 'pl',
  czechia: 'cz',
  'czech republic': 'cz',
  denmark: 'dk',
  sweden: 'se',
  norway: 'no',
  finland: 'fi',
  greece: 'gr',
  romania: 'ro',
  bulgaria: 'bg',
  hungary: 'hu',
  croatia: 'hr',
  serbia: 'rs',
  slovenia: 'si',
  slovakia: 'sk',
  luxembourg: 'lu',
  brazil: 'br',
  mexico: 'mx',
  australia: 'au',
  'new zealand': 'nz',
  japan: 'jp',
  singapore: 'sg',
  'hong kong': 'hk',
  uae: 'ae',
  'united arab emirates': 'ae',
  estonia: 'ee',
  latvia: 'lv',
  lithuania: 'lt',
  ukraine: 'ua',
  turkey: 'tr',
  israel: 'il',
  iceland: 'is',
};

// Curated topic tags from title + abstract (keyword -> tag), on-brand and
// matching the blog's tags rather than Notist's noisy auto "about" list.
const TAG_RULES = [
  [/\bmautic\b/i, 'Mautic'],
  [/\b(open source|open-source|foss|libre)\b/i, 'Open source'],
  [
    /\b(sovereignty|lock-?in|vendor|self-?host|own your data|independence)\b/i,
    'Digital sovereignty',
  ],
  [/\b(marketing|automation|dxp|digital experience|campaign|crm|email)\b/i, 'Marketing'],
  [/\b(community|contributor|maintainer|governance|volunteer|bus factor)\b/i, 'Community'],
  [/\b(accessib|a11y|inclusive design)\b/i, 'Accessibility'],
  [/\b(ehlers|eds|disabilit|chronic|invisible illness|spoons|active)\b/i, 'Living with EDS'],
  [/\b(document|docs|readme|technical writing)\b/i, 'Documentation'],
  [/\b(security|secure|supply chain|vulnerab)\b/i, 'Security'],
  [
    /\b(diversity|inclusion|belonging|underrepresented|women in tech)\b/i,
    'Diversity and inclusion',
  ],
  [/\b(joomla)\b/i, 'Joomla'],
  [/\b(seo|search engine|microdata|schema|rich snippet)\b/i, 'SEO'],
];

// A presentation is a podcast/interview (not a stage talk) when its slug/title
// carries an explicit signal below. NB: no "has no slides => podcast" fallback -
// that wrongly caught online talks. Note "... with Ruth Cheesley" / "feat." are
// interview signals (a talk is titled by its topic, an interview names her).
const PODCAST_RE =
  /podcast|episode|\bep-?\d|mauticast|chaosscast|sustainoss|developers?-bakery|presents|s\d+e\d+|webinar|\binterview\b|office-hours|\bama\b|fireside|deconstructed|with[- ]ruth[- ]cheesley|\bfeat\b/i;

// Manual classification overrides (win over the heuristic) for the handful of
// edge cases Ruth has corrected. Keyed by slug.
const FORCE_TALK = new Set([]);
const FORCE_PODCAST = new Set([]);

// Talks that recur under one name but are a DIFFERENT talk each time (Ruth: "The
// Mautic Update is different each year"). Notist reuses the slug, so these would
// otherwise merge into one page; instead each presentation becomes its own page
// with a year-disambiguated slug. Matched against the Notist slug.
const NO_MERGE_RE = /^the-mautic-update/;
const shortId = (source) => source.match(/\/\/[^/]+\/([^/]+)\//)?.[1] || '';

// A talk is a keynote when the title says so, or it is a "Mautic Update"
// (Ruth's recurring project-lead keynote). Keynotes are badged in the archive.
const isKeynoteTalk = (slug, title) =>
  /keynote/i.test(title || '') || /the[- ]mautic[- ]update/i.test(slug);

const MONTHS = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
};

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
const yamlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugFromPath(p) {
  const seg = p.replace(/^\/+/, '').split('/');
  return (seg[1] || seg[0]).toLowerCase().replace(/[^a-z0-9-]/g, '');
}

async function fetchText(url, { minLength = 5000, tries = 4 } = {}) {
  let wait = 1500;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA } });
      const body = res.ok ? await res.text() : '';
      if (res.ok && body.length >= minLength) return body;
      if (attempt === tries)
        throw new Error(`${res.status}, ${body.length} bytes after ${tries} tries`);
    } catch (e) {
      if (attempt === tries) throw e;
    }
    await sleep(wait);
    wait *= 2;
  }
  throw new Error('unreachable');
}

function parseHeader(headerText, title) {
  let s = clean(headerText);
  if (title && s.startsWith(clean(title))) s = clean(s.slice(clean(title).length));
  const m = s.match(/A presentation at (.+?) in ([A-Z][a-z]+ \d{4})(?: in (.+?))? by /);
  if (!m) return {};
  const [, event, monthYear, place] = m;
  const out = { event: clean(event) };
  const my = monthYear.toLowerCase().match(/([a-z]+) (\d{4})/);
  if (my && MONTHS[my[1]]) out.monthYear = `${my[2]}-${MONTHS[my[1]]}`;
  if (place && !/^online$|^virtual$|^remote$/i.test(clean(place))) {
    const parts = clean(place)
      .split(',')
      .map((x) => x.trim());
    const countryName = parts[parts.length - 1];
    out.city = parts.length > 1 ? parts.slice(0, -1).join(', ') : undefined;
    out.region = countryName;
    out.country = COUNTRY_ISO[countryName.toLowerCase()];
  }
  return out;
}

function deriveTags(text) {
  const tags = [];
  for (const [re, tag] of TAG_RULES) if (re.test(text) && !tags.includes(tag)) tags.push(tag);
  return tags;
}

/** Extract a single presentation's data from its Notist page. */
async function scrapeOne(path) {
  const url = BASE + path;
  const html = await fetchText(url);
  const root = parse(html);
  const slug = slugFromPath(path);
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || '';
  const title =
    clean(root.querySelector('h1')?.text) || clean(ld.match(/"name":\s*"([^"]+)"/)?.[1]);
  const header = parseHeader(root.querySelector('.presentation-header')?.text, title);

  const dt = html.match(/<time[^>]*datetime="([^"]+)"/)?.[1];
  const dp = ld.match(/"datePublished":\s*"([^"]+)"/)?.[1];
  const date = dp
    ? dp.slice(0, 10)
    : dt
      ? dt.slice(0, 10)
      : header.monthYear
        ? `${header.monthYear}-01`
        : null;

  const abstract = clean(root.querySelector('.presentation-description')?.text);

  const resources = [];
  const rl = root.querySelector('.resource-list');
  if (rl)
    for (const a of rl.querySelectorAll('a')) {
      const href = a.getAttribute('href');
      const label = clean(a.text);
      if (href && label) resources.push({ label, url: href });
    }

  const video =
    [
      ...html.matchAll(
        /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+|vimeo\.com\/\d+)/g
      ),
    ].map((m) => m[0])[0] || null;

  const deckId = html.match(/on\.notist\.cloud\/slides\/deck(\d+)\//)?.[1] || null;
  // Slide count: the header's total when present, else the highest large-N index
  // referenced on the page (podcast/video pages often omit the count element).
  const countEl = Number(html.match(/slide-count-total[^>]*>\s*(\d+)/)?.[1]) || 0;
  const maxRef = deckId
    ? Math.max(
        0,
        ...[...html.matchAll(new RegExp(`slides/deck${deckId}/large-(\\d+)\\.jpg`, 'g'))].map(
          (m) => Number(m[1]) + 1
        )
      )
    : 0;
  const slideCount = Math.max(countEl, maxRef);

  const text = `${slug} ${title} ${abstract}`;
  // Classify by explicit signal only; manual overrides win.
  let isPodcast;
  if (FORCE_TALK.has(slug)) isPodcast = false;
  else if (FORCE_PODCAST.has(slug)) isPodcast = true;
  else isPodcast = PODCAST_RE.test(`${slug} ${title}`);

  let format = 'Talk';
  if (/workshop/i.test(text)) format = 'Workshop';
  else if (isKeynoteTalk(slug, title)) format = 'Keynote';
  else if (/\bpanel\b/i.test(text)) format = 'Panel';

  return {
    slug,
    kind: isPodcast ? 'podcast' : 'talk',
    title,
    format,
    date,
    event: header.event,
    location:
      header.country || header.city
        ? { city: header.city, region: header.region, country: header.country }
        : null,
    abstract,
    resources,
    video,
    tags: deriveTags(text),
    deckId,
    slideCount: deckId ? slideCount : 0,
    source: url,
    unmappedCountry: header.region && !header.country ? header.region : null,
  };
}

/** Merge presentations sharing a slug into one record with events[]. */
function mergeGroup(items) {
  const byDate = [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const primary = byDate[0];
  const kind = items.some((i) => i.kind === 'talk') ? 'talk' : 'podcast';

  const events = byDate
    .filter((i) => i.date || i.event)
    .map((i) => ({ event: i.event, date: i.date, location: i.location }));

  // Richest deck wins (most slides) for the rebuilt PDF + cover.
  const withDeck = items.filter((i) => i.deckId).sort((a, b) => b.slideCount - a.slideCount);
  const deck = withDeck[0] || null;

  const resources = [];
  const seen = new Set();
  for (const i of items)
    for (const r of i.resources)
      if (!seen.has(r.url)) {
        seen.add(r.url);
        resources.push(r);
      }

  const tags = [...new Set(items.flatMap((i) => i.tags))];
  const abstract = byDate.map((i) => i.abstract).find(Boolean) || '';

  return {
    slug: primary.slug,
    kind,
    title: primary.title,
    format: primary.format,
    date: primary.date, // most recent = primary/sort date
    events,
    abstract,
    excerpt: abstract ? abstract.split(/(?<=[.!?])\s/)[0].slice(0, 160) : '',
    video: items.map((i) => i.video).find(Boolean) || null,
    tags,
    resources,
    deckId: deck?.deckId || null,
    slideCount: deck?.slideCount || 0,
    sources: items.map((i) => i.source),
  };
}

function frontMatter(t) {
  const L = ['---'];
  L.push(`title: ${yamlStr(t.title)}`);
  L.push(`date: ${t.date || t.events.find((e) => e.date)?.date || ''}`);
  L.push(`kind: ${t.kind}`);
  if (t.kind === 'talk') L.push(`format: ${t.format}`);
  if (t.events.length) {
    L.push('events:');
    for (const e of t.events) {
      L.push(`  - event: ${yamlStr(e.event || 'Online')}`);
      if (e.date) L.push(`    date: ${e.date}`);
      if (e.location && (e.location.city || e.location.country)) {
        L.push('    location:');
        if (e.location.city) L.push(`      city: ${yamlStr(e.location.city)}`);
        if (e.location.region) L.push(`      region: ${yamlStr(e.location.region)}`);
        if (e.location.country) L.push(`      country: ${e.location.country}`);
      }
    }
  }
  if (t.abstract) L.push(`abstract: >-\n  ${t.abstract.replace(/\n/g, ' ')}`);
  if (t.excerpt) L.push(`excerpt: ${yamlStr(t.excerpt)}`);
  // A cover comes from any deck's first slide; a slides PDF only from a real
  // multi-slide talk deck (podcasts are audio/video - no slides).
  if (t.deckId) L.push(`cover: /assets/img/talks/${t.slug}.jpg`);
  if (t.deckId && t.kind === 'talk' && t.slideCount > 1)
    L.push(`slides: /assets/slides/${t.slug}.pdf`);
  if (t.video) L.push(`video: ${t.video}`);
  if (t.tags.length) {
    L.push('tags:');
    for (const tag of t.tags) L.push(`  - ${yamlStr(tag)}`);
  }
  if (t.resources.length) {
    L.push('resources:');
    for (const r of t.resources) {
      L.push(`  - label: ${yamlStr(r.label)}`);
      L.push(`    url: ${r.url}`);
    }
  }
  L.push(`source: ${t.sources[0]}`);
  L.push('---');
  L.push('');
  return L.join('\n');
}

// --- main ------------------------------------------------------------------
const paths = (await readFile(URLS_FILE, 'utf8'))
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)
  .slice(0, LIMIT);
// Fresh start so removed/renamed talks don't linger - but delete only the
// generated *.md, never the *.11tydata.js directory-data files that live here.
const clearMarkdown = async (dir) => {
  await mkdir(dir, { recursive: true });
  for (const f of await readdir(dir)) if (f.endsWith('.md')) await unlink(resolve(dir, f));
};
await clearMarkdown(TALK_DIR);
await clearMarkdown(POD_DIR);
console.log(`Scraping ${paths.length} presentation(s) from Notist...\n`);

const presentations = [];
const errors = [];
for (const [i, path] of paths.entries()) {
  try {
    const p = await scrapeOne(path);
    presentations.push(p);
    console.log(
      `  [${i + 1}/${paths.length}] ${p.kind === 'podcast' ? '🎙 ' : '   '}${p.slug} · ${p.date || '?'} · ${p.event || '—'} · ${p.deckId ? p.slideCount + ' slides' : 'no deck'}`
    );
  } catch (e) {
    console.log(`  [${i + 1}/${paths.length}] ${path} -> ERROR ${e.message}`);
    errors.push(`${path}: ${e.message}`);
  }
  await sleep(900);
}

// Group by slug -> merged records.
const groups = new Map();
for (const p of presentations) {
  if (!groups.has(p.slug)) groups.set(p.slug, []);
  groups.get(p.slug).push(p);
}

// Expand no-merge groups: a same-named-but-distinct talk (e.g. The Mautic
// Update) is split back into one page per presentation, each with a unique
// year-disambiguated slug (falling back to the Notist short-id on a clash).
for (const [slug, items] of [...groups]) {
  if (!NO_MERGE_RE.test(slug) || items.length < 2) continue;
  groups.delete(slug);
  const used = new Set();
  for (const it of items) {
    const year = String(it.date || '').slice(0, 4) || 'x';
    let s = `${slug}-${year}`;
    if (used.has(s)) s = `${slug}-${year}-${shortId(it.source)}`;
    used.add(s);
    groups.set(s, [{ ...it, slug: s }]);
  }
}

const manifest = [];
const countries = new Set();
let talkCount = 0;
let podCount = 0;
let presentationCount = 0;
const unmapped = new Set();

for (const items of groups.values()) {
  const t = mergeGroup(items);
  const dir = t.kind === 'talk' ? TALK_DIR : POD_DIR;
  await writeFile(resolve(dir, `${t.slug}.md`), frontMatter(t));
  manifest.push({ slug: t.slug, kind: t.kind, deckId: t.deckId, slideCount: t.slideCount });
  if (t.kind === 'talk') {
    talkCount++;
    presentationCount += t.events.length || 1;
    for (const e of t.events) if (e.location?.country) countries.add(e.location.country);
  } else {
    podCount++;
  }
  for (const i of items) if (i.unmappedCountry) unmapped.add(i.unmappedCountry);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));

console.log('\n=== Summary ===');
console.log(`Presentations scraped : ${presentations.length}`);
console.log(`Talks (merged pages)  : ${talkCount}  (${presentationCount} presentations)`);
console.log(`Podcasts / interviews : ${podCount}`);
console.log(`Countries             : ${[...countries].sort().join(', ')} (${countries.size})`);
console.log(`Decks to rebuild      : ${manifest.filter((m) => m.deckId).length}`);
console.log(`Manifest              : ${MANIFEST}`);
if (unmapped.size)
  console.log(`Unmapped countries    : ${[...unmapped].join(', ')} (add to COUNTRY_ISO)`);
if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  for (const e of errors) console.log('  -', e);
}
console.log(
  '\nNext: node scripts/migrate/build-slide-assets.mjs   (builds covers + lean slide PDFs)'
);

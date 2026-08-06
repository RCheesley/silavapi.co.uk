/**
 * migrate.mjs - convert the published Joomla articles into Markdown posts.
 *
 * Reads the SQL dumps in migration/, filters to PUBLISHED (state=1) only
 * (never unpublished/trashed - the repo is public), converts HTML → Markdown,
 * rewrites internal links + inline images to the new site, converts {tweetme}
 * shortcodes into a self-hosted "Share on X" tweetable, and writes:
 *   - src/blog/<alias>.md            (blog posts, all real categories kept)
 *   - src/about/<alias>.md           (personal "general" pages)
 * plus migration/redirects.txt, migration/images.txt and migration/RECONCILIATION.md.
 *
 * Migration-only tooling; not part of the site build.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';
import { parse as parseHtml } from 'node-html-parser';
import { parseInserts } from './parse-sql.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const MIG = resolve(ROOT, 'migration');
const OLD_ORIGIN = 'https://ruthcheesley.co.uk';

// --- Category display names (keep all real categories as chips) ------------
const CAT_MAP = {
  'blog/buddhism': 'Buddhism',
  'blog/community-management': 'Community',
  'blog/digital-sovereignty': 'Digital Sovereignty',
  'blog/marketing': 'Marketing',
  'blog/mautic': 'Mautic',
  'blog/health-and-fitness': 'Being bendy',
  'blog/health-and-fitness/ehlers-danlos-syndrome-eds-awareness-month': 'Being bendy',
  'blog/geek': 'Geek',
  'blog/open-source': 'Open source',
  'blog/personal-development': 'Personal development',
  'blog/volunteering': 'Volunteering',
  // network-marketing + jamberry: intentionally NOT migrated (redirect only).
};

// Personal "general" pages to migrate as /about/<alias>/ (by content id).
const PERSONAL_IDS = new Set(['2', '3', '4', '143', '92', '19', '94', '10']);
// Known old menu URLs for the personal pages (for redirects).
const PERSONAL_OLD_URL = {
  2: '/about/life-to-date/the-school-years',
  3: '/about/life-to-date/university',
  4: '/about/life-to-date/the-working-years',
  143: '/about/life-to-date/getting-ordained',
  92: '/life/being-buddhist',
  19: '/life/living-and-working-with-ehlers-danlos-syndrome-hypermobility-syndrome',
  94: '/about/what-i-do/runner',
  10: '/life/open-source-technology',
};

// --- Load dumps ------------------------------------------------------------
const content = parseInserts(
  readFileSync(resolve(MIG, 'h8u7t_content.sql'), 'utf8'),
  'h8u7t_content'
).rows;
const catRows = parseInserts(
  readFileSync(resolve(MIG, 'h8u7t_categories.sql'), 'utf8'),
  'h8u7t_categories'
).rows;
const catPath = new Map(catRows.map((c) => [c.id, c.path]));

const published = content.filter((r) => r.state === '1');

// alias → new blog url, for rewriting internal links.
const aliasToNew = new Map();
for (const r of published) {
  const path = catPath.get(r.catid) || '';
  if (path.startsWith('blog/') && !path.includes('network-marketing')) {
    aliasToNew.set(r.alias, `/blog/${r.alias}/`);
  }
}

// --- Helpers ---------------------------------------------------------------
const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
});
// Keep <figure>/<figcaption> out; turndown drops unknown by default.

function stripJoomlaImage(p) {
  // "images/blog/2025/x.jpg#joomlaImage://...?width=..." → "images/blog/2025/x.jpg"
  return String(p || '')
    .split('#')[0]
    .replace(/^\/+/, '');
}

function normaliseImageSrc(src) {
  let s = String(src || '').trim();
  s = s.replace(/^https?:\/\/(www\.)?ruthcheesley\.co\.uk\//i, '');
  s = s.split('#')[0].replace(/^\/+/, '');
  return s; // e.g. "images/blog/2025/x.jpg"
}

const images = new Map(); // fetchUrl → newLocalPath (/assets/img/...)
function registerImage(srcRel) {
  const clean = normaliseImageSrc(srcRel);
  if (!clean || !/^images\//i.test(clean)) return null;
  // Decode each segment, then: sanitise for the LOCAL filename (spaces/unsafe →
  // hyphen) but re-encode for the FETCH url so it still resolves on the old site.
  const segs = clean.split('/').map((s) => decodeURIComponent(s));
  const fetchUrl = OLD_ORIGIN + '/' + segs.map((s) => encodeURIComponent(s)).join('/');
  const localRel = segs
    .slice(1) // drop leading "images"
    .map((s) => s.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-'))
    .join('/');
  const local = '/assets/img/' + localRel;
  images.set(fetchUrl, local);
  return local;
}

function rewriteInternalHref(href) {
  let h = String(href || '').trim();
  if (!h) return h;
  h = h.replace(/^https?:\/\/(www\.)?ruthcheesley\.co\.uk\//i, '/');
  // blog/<cat>/<alias> or /blog/<cat>/<alias> → /blog/<alias>/
  const m = h.match(/^\/?blog\/[^/]+(?:\/[^/]+)?\/([^/?#]+)\/?$/);
  if (m && aliasToNew.has(m[1])) return aliasToNew.get(m[1]);
  return h;
}

function extractExcerpt(introHtml, metadesc) {
  let base;
  if (metadesc && metadesc.trim()) {
    base = metadesc.trim().replace(/\s+/g, ' ');
  } else {
    const text = parseHtml(introHtml || '')
      .text.replace(/\s+/g, ' ')
      .trim();
    if (!text) return '';
    base = text.length > 155 ? text.slice(0, 155).replace(/\s+\S*$/, '') : text;
  }
  return base.replace(/[.…\s]*$/, '') + '…'; // excerpts end with an ellipsis
}

// Convert {tweetme ...}quote{/tweetme} (and self-closing {tweetme ...}) into a
// marker Turndown won't escape; base64 the quote so delimiters are safe.
function tweetmeMarker(params, inner) {
  const hashRaw = /hashtags=([^|}]+)/i.exec(params);
  const viaRaw = /via=@?([A-Za-z0-9_]+)/i.exec(params);
  const hashtags = hashRaw ? hashRaw[1].replace(/[#\s]/g, '').replace(/,+$/, '') : '';
  const via = viaRaw ? viaRaw[1] : '';
  const quote = String(inner || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const q64 = Buffer.from(quote, 'utf8').toString('base64');
  return `\n\n@@TWEETABLE:${hashtags}:${via}:${q64}@@\n\n`;
}
function convertTweetme(html) {
  return html
    .replace(/\{tweetme([^}]*)\}([\s\S]*?)\{\/tweetme\}/gi, (_a, params, inner) =>
      tweetmeMarker(params, inner)
    )
    .replace(/\{tweetme([^}]*)\}/gi, (_a, params) => tweetmeMarker(params, ''));
}

function markerToShortcode(md) {
  return md.replace(/@@TWEETABLE:([^:@]*):([^:@]*):([^@]*)@@/g, (_all, hashtags, via, q64) => {
    const quote = Buffer.from(q64, 'base64').toString('utf8').replace(/"/g, '\\"');
    return `{% tweetable "${quote}", "${hashtags}", "${via}" %}`;
  });
}

function prepHtml(rawHtml) {
  // Move a trailing <br> that sits INSIDE an emphasis tag to after it, so
  // Turndown doesn't strand the closing ** on its own line (which Markdown then
  // renders literally). e.g. <strong><a>x</a><br></strong> → <strong><a>x</a></strong><br>
  const cleaned = convertTweetme(rawHtml || '').replace(
    /((?:<br\s*\/?>\s*)+)(<\/(?:strong|b|em|i)>)/gi,
    '$2$1'
  );
  const root = parseHtml(cleaned, { comment: true });
  // Rewrite links.
  for (const a of root.querySelectorAll('a[href]')) {
    a.setAttribute('href', rewriteInternalHref(a.getAttribute('href')));
  }
  // Rewrite + register inline images; drop width/height/style.
  for (const img of root.querySelectorAll('img')) {
    const local = registerImage(img.getAttribute('src'));
    if (local) img.setAttribute('src', local);
    for (const attr of ['width', 'height', 'style', 'loading', 'srcset', 'sizes', 'class']) {
      img.removeAttribute(attr);
    }
    if (!img.getAttribute('alt')) img.setAttribute('alt', '');
  }
  // Drop empty headings / paragraphs / list items and unwrap empty links -
  // Joomla content is full of these and they fail HTML + a11y validation.
  const blank = (s) => !String(s).replace(/\s+/g, '').length;
  for (const el of root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li')) {
    if (blank(el.text) && !el.querySelector('img')) el.remove();
  }
  for (const a of root.querySelectorAll('a')) {
    if (blank(a.text) && !a.querySelector('img')) a.replaceWith(a.innerHTML);
  }
  return root.toString();
}

// Escape stray '<' outside code so prose placeholders like '<your link>' and
// '<insert phrase>' render literally instead of being parsed as HTML tags.
// Only '<' is touched (never '>') so Markdown blockquotes are unaffected.
function escapeStrayAngles(md) {
  const CODE = /(```[\s\S]*?```|`[^`\n]*`)/g;
  return md
    .split(CODE)
    .map((seg, i) => (i % 2 === 1 ? seg : seg.replace(/</g, '&lt;')))
    .join('');
}

function frontMatter(obj) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      if (!v.length) continue;
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${yamlScalar(item)}`);
    } else {
      lines.push(`${k}: ${yamlScalar(v)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}
function yamlScalar(v) {
  const s = String(v);
  if (/^[\d-]/.test(s) && !/[:#]/.test(s) && k_isDateish(s)) return s;
  return "'" + s.replace(/'/g, "''") + "'";
}
function k_isDateish(s) {
  return /^\d{4}-\d{2}-\d{2}/.test(s);
}

// --- Build ------------------------------------------------------------------
mkdirSync(resolve(ROOT, 'src/about'), { recursive: true });

const redirects = [];
const recon = [];
let blogCount = 0;
let aboutCount = 0;
let redirectOnly = 0;

for (const r of published) {
  const path = catPath.get(r.catid) || '';
  const isBlog = path.startsWith('blog/') && !path.includes('network-marketing');
  const isPersonal = PERSONAL_IDS.has(r.id);

  if (!isBlog && !isPersonal) {
    // Stale general / network-marketing → redirect old URL to a sensible page.
    const oldUrl = path.startsWith('blog/') ? `/${path}/${r.alias}` : null;
    if (oldUrl) redirects.push([oldUrl, '/blog/']);
    recon.push({
      id: r.id,
      title: r.title,
      action: 'skip+redirect',
      cat: path,
      newUrl: '/blog/ or /',
    });
    redirectOnly += 1;
    continue;
  }

  // Parse the Joomla images field for the lead image.
  let image = '';
  let imageAlt = '';
  let imageCaption = '';
  try {
    const im = JSON.parse(r.images || '{}');
    const p = im.image_intro || im.image_fulltext;
    if (p) {
      image = registerImage(stripJoomlaImage(p));
      imageAlt = im.image_intro_alt || im.image_fulltext_alt || '';
      imageCaption = im.image_intro_caption || im.image_fulltext_caption || '';
    }
  } catch {
    /* no images */
  }

  const bodyHtml = prepHtml((r.introtext || '') + '\n' + (r.fulltext || ''));
  const md = markerToShortcode(escapeStrayAngles(td.turndown(bodyHtml)))
    .replace(/^#{1,6}[ \t]*$/gm, '') // drop empty headings that survived conversion
    .replace(/[ \t]+$/gm, '') // strip trailing whitespace (redundant hard breaks)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const date = (r.publish_up || r.created || '').slice(0, 10);
  const tags = (r.metakey || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const excerpt = extractExcerpt(r.introtext, r.metadesc);

  if (isBlog) {
    const category = CAT_MAP[path] || 'Uncategorised';
    const fm = frontMatter({
      title: r.title,
      date,
      category,
      tags,
      image,
      imageAlt,
      imageCaption,
      excerpt,
      sourceUrl: `/${path}/${r.alias}`,
    });
    writeFileSync(resolve(ROOT, 'src/blog', `${r.alias}.md`), `${fm}\n\n${md}\n`);
    redirects.push([`/${path}/${r.alias}`, `/blog/${r.alias}/`]);
    recon.push({
      id: r.id,
      title: r.title,
      action: 'blog',
      cat: category,
      newUrl: `/blog/${r.alias}/`,
    });
    blogCount += 1;
  } else {
    // Personal → /about/<alias>/
    const fm = frontMatter({
      layout: 'layouts/page.njk',
      title: r.title,
      date,
      eleventyNavigation: undefined,
      image,
      imageAlt,
      excerpt,
      sourceUrl: PERSONAL_OLD_URL[r.id] || '',
    });
    writeFileSync(resolve(ROOT, 'src/about', `${r.alias}.md`), `${fm}\n\n${md}\n`);
    if (PERSONAL_OLD_URL[r.id]) redirects.push([PERSONAL_OLD_URL[r.id], `/about/${r.alias}/`]);
    recon.push({
      id: r.id,
      title: r.title,
      action: 'about',
      cat: 'about',
      newUrl: `/about/${r.alias}/`,
    });
    aboutCount += 1;
  }
}

// --- Write outputs ----------------------------------------------------------
writeFileSync(
  resolve(MIG, 'redirects.txt'),
  redirects.map(([a, b]) => `${a}  ${b}  301`).join('\n') + '\n'
);
writeFileSync(
  resolve(MIG, 'images.txt'),
  [...images].map(([url, local]) => `${url}  ${local}`).join('\n') + '\n'
);

const reconMd = [
  '# Migration reconciliation report',
  '',
  `Generated from the Joomla export. **Published only** (state=1): ${published.length} articles.`,
  '',
  `- Blog posts migrated: **${blogCount}**`,
  `- Personal /about pages migrated: **${aboutCount}**`,
  `- Skipped + redirected (stale general / network-marketing): **${redirectOnly}**`,
  `- Inline/lead images to re-host: **${images.size}**`,
  '',
  '| id | action | category | new URL | title |',
  '| --- | --- | --- | --- | --- |',
  ...recon
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map(
      (r) => `| ${r.id} | ${r.action} | ${r.cat} | ${r.newUrl} | ${r.title.replace(/\|/g, '\\|')} |`
    ),
  '',
].join('\n');
writeFileSync(resolve(MIG, 'RECONCILIATION.md'), reconMd);

console.log(
  `Blog: ${blogCount} | About: ${aboutCount} | Skip+redirect: ${redirectOnly} | Images: ${images.size}`
);
console.log('Wrote migration/{redirects.txt,images.txt,RECONCILIATION.md}');

import { readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle, browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';
import { RenderPlugin } from '@11ty/eleventy';
import { feedPlugin } from '@11ty/eleventy-plugin-rss';
import navigationPlugin from '@11ty/eleventy-navigation';
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItAttrs from 'markdown-it-attrs';
import { readableDate, isoDate } from './lib/dates.js';
import { renderTalksMap } from './lib/world-map.js';
import { threadComments, countComments } from './lib/comments.js';
import {
  byCategories,
  byTags,
  byFormat,
  groupByYear,
  presentationsOf,
  presentationCountries,
} from './lib/talks.js';

const CSS_TARGETS = browserslistToTargets(browserslist('>= 0.5%, last 2 versions, not dead'));
const ROOT_DIR = dirname(fileURLToPath(import.meta.url));
const ICON_DIR = resolve(ROOT_DIR, 'src/assets/icons');
const ICON_CACHE = new Map(); // processed SVG per `${name}:${px}`

export default function (eleventyConfig) {
  // --- Plugins ------------------------------------------------------------
  eleventyConfig.addPlugin(RenderPlugin);
  eleventyConfig.addPlugin(navigationPlugin);
  eleventyConfig.addPlugin(feedPlugin, {
    type: 'rss',
    outputPath: '/feed.xml',
    collection: { name: 'posts', limit: 0 },
    metadata: {
      language: 'en-GB',
      title: 'Sīlavāpi (Ruth Cheesley)',
      subtitle: 'Writing on Buddhism, open source, digital sovereignty and life with EDS.',
      base: 'https://silavapi.co.uk/',
      author: { name: 'Sīlavāpi (Ruth Cheesley)' },
    },
  });

  // --- Markdown -----------------------------------------------------------
  const md = markdownIt({ html: true, linkify: true, typographer: true })
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.headerLink({ safariReaderFix: true }),
      level: [2, 3],
      slugify: (s) => {
        const slug = s
          .trim()
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s-]/gu, '')
          .replace(/\s+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (!slug) return 'section';
        return /^[a-z]/.test(slug) ? slug : `s-${slug}`; // ids must start with a letter
      },
    })
    .use(markdownItAttrs);
  eleventyConfig.setLibrary('md', md);

  // --- CSS: bundle + minify app.css with LightningCSS ---------------------
  // Only app.css is emitted; its @import partials are read from disk by the
  // bundler, so we tell Eleventy to ignore them as standalone templates.
  eleventyConfig.ignores.add('src/assets/css/tokens/**');
  eleventyConfig.ignores.add('src/assets/css/fonts.css');
  eleventyConfig.ignores.add('src/assets/css/base.css');
  eleventyConfig.ignores.add('src/assets/css/components.css');
  eleventyConfig.ignores.add('src/assets/css/pages.css');

  eleventyConfig.addExtension('css', {
    outputFileExtension: 'css',
    compile: async (_inputContent, inputPath) => {
      // Normalise separators so the check holds on Windows (where Eleventy may
      // pass backslash paths) as well as POSIX.
      if (!inputPath.replace(/\\/g, '/').endsWith('/assets/css/app.css')) return; // skip partials
      return async () => {
        // bundle() resolves @import from disk, so the whole stylesheet ships as
        // one same-origin request (no leftover @import, no extra round-trips).
        const { code } = bundle({
          filename: inputPath,
          minify: true,
          sourceMap: false,
          targets: CSS_TARGETS,
          drafts: { customMedia: true },
        });
        return code.toString();
      };
    },
  });

  // --- Passthrough copy ---------------------------------------------------
  eleventyConfig.addPassthroughCopy({ 'src/assets/fonts': 'assets/fonts' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/img': 'assets/img' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/icons': 'assets/icons' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/slides': 'assets/slides' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/js': 'assets/js' });
  eleventyConfig.addPassthroughCopy({ 'src/_headers': '_headers' });
  eleventyConfig.addPassthroughCopy({ 'src/_redirects': '_redirects' });
  eleventyConfig.addPassthroughCopy({ 'src/robots.txt': 'robots.txt' });
  eleventyConfig.addWatchTarget('src/assets/css/');

  // --- Filters ------------------------------------------------------------
  // British date rendering ("03 March, 2025") + ISO for <time>/sitemap.
  eleventyConfig.addFilter('readableDate', readableDate);
  eleventyConfig.addFilter('isoDate', isoDate);

  // Estimated reading time from rendered content (~200 wpm, min 1).
  eleventyConfig.addFilter('readingTime', (content) => {
    const words = (
      String(content)
        .replace(/<[^>]+>/g, ' ')
        .match(/\S+/g) || []
    ).length;
    return `${Math.max(1, Math.round(words / 200))} min read`;
  });
  // Take the first n items.
  eleventyConfig.addFilter('limit', (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : arr));
  // Posts whose category is in the given list (e.g. speaking-topic categories).
  eleventyConfig.addFilter('byCategories', byCategories);
  // Posts sharing at least one tag with the given list. Used to surface writing
  // relevant to a specific talk (matched on the talk's tags).
  eleventyConfig.addFilter('byTags', byTags);

  // --- Shortcodes ---------------------------------------------------------
  // Inline a vendored Lucide SVG (currentColor, 1.5px stroke, decorative).
  // `name` is validated (no path traversal) and `size` coerced to a number, so
  // the shortcode can never read outside ICON_DIR or inject attributes.
  eleventyConfig.addShortcode('icon', (name, size = 24) => {
    if (typeof name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(name)) {
      throw new Error(`icon: invalid name "${name}"`);
    }
    const n = Number(size);
    const px = Number.isFinite(n) && n > 0 ? Math.round(n) : 24;
    const key = `${name}:${px}`;
    let out = ICON_CACHE.get(key);
    if (out === undefined) {
      const file = resolve(ICON_DIR, `${name}.svg`);
      if (!file.startsWith(ICON_DIR + sep)) {
        throw new Error(`icon: path escapes ICON_DIR for "${name}"`);
      }
      out = readFileSync(file, 'utf8')
        .replace('<svg', '<svg aria-hidden="true" focusable="false" class="icon"')
        .replace(/\swidth="[^"]*"/, ` width="${px}"`)
        .replace(/\sheight="[^"]*"/, ` height="${px}"`)
        .replace(/stroke-width="[^"]*"/, 'stroke-width="1.5"');
      ICON_CACHE.set(key, out);
    }
    return out;
  });

  // Tweetable: a shareable quote + a "Share on X" link (an outbound intent URL
  // built at build time - no third-party script, no cookies). Migrated from the
  // Joomla {tweetme} shortcodes.
  eleventyConfig.addShortcode('tweetable', function (quote, hashtags = '', via = '') {
    const esc = (s) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    const url = 'https://silavapi.co.uk' + (this.page && this.page.url ? this.page.url : '/');
    // Each share target is a plain outbound link (no scripts, no cookies).
    const x = new URLSearchParams({ text: quote || '', url });
    if (hashtags) x.set('hashtags', hashtags);
    if (via) x.set('via', via);
    const bsky = new URLSearchParams({ text: `${quote || ''} ${url}`.trim() });
    const li = new URLSearchParams({ url });
    const link = (href, label) =>
      `<a class="tweetable__btn" href="${esc(href)}" aria-label="Share on ${label}" rel="noopener noreferrer" target="_blank">${label}</a>`;
    return (
      `<figure class="tweetable">` +
      `<blockquote class="tweetable__quote">${esc(quote)}</blockquote>` +
      `<div class="tweetable__share">` +
      `<span class="tweetable__label">Share this</span>` +
      link('https://twitter.com/intent/tweet?' + x.toString(), 'X') +
      link('https://bsky.app/intent/compose?' + bsky.toString(), 'Bluesky') +
      link('https://www.linkedin.com/sharing/share-offsite/?' + li.toString(), 'LinkedIn') +
      // Mastodon has no universal share URL; a small script (share.js) reveals
      // this and asks for the reader's instance. Hidden without JavaScript.
      `<a class="tweetable__btn" href="https://joinmastodon.org/" data-mastodon-share data-text="${esc((quote || '') + ' ' + url)}" aria-label="Share on Mastodon" rel="noopener noreferrer" target="_blank" hidden>Mastodon</a>` +
      `</div>` +
      `</figure>`
    );
  });

  // Self-hosted SVG world map highlighting the countries a set of talks were in.
  eleventyConfig.addShortcode('talksMap', (countries) => renderTalksMap(countries || []));

  // Mid-article pull quote (usable from Markdown post bodies).
  eleventyConfig.addShortcode('pullquote', (text, attribution = '') => {
    const attr = attribution
      ? `<figcaption class="quote__attribution">${attribution}</figcaption>`
      : '';
    return `<figure class="quote quote--light quote--accent"><blockquote class="quote__text">${text}</blockquote>${attr}</figure>`;
  });

  // --- Collections --------------------------------------------------------
  eleventyConfig.addCollection('posts', (collectionApi) =>
    collectionApi.getFilteredByGlob('src/blog/**/*.md').sort((a, b) => b.date - a.date)
  );

  // Talks. A talk may carry an `announce` date: until that date passes it is
  // withheld from every listing (the "publish on a date" feature - a daily
  // scheduled rebuild re-runs this so an announced talk appears on its date
  // without a manual deploy). `date` is the primary (most recent) presentation.
  const announcedTalks = (api) => {
    const now = new Date();
    return api.getFilteredByGlob('src/talks/*.md').filter((t) => {
      const a = t.data.announce;
      return !a || new Date(a) <= now;
    });
  };
  eleventyConfig.addCollection('talks', (api) =>
    announcedTalks(api).sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection('podcasts', (api) =>
    api.getFilteredByGlob('src/podcasts/*.md').sort((a, b) => b.date - a.date)
  );

  // A talk given at several events is one page; the archive and map treat each
  // event as its own "presentation" row (presentationsOf lives in lib/talks.js).
  eleventyConfig.addCollection('talkPresentations', (api) =>
    presentationsOf(announcedTalks(api)).sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection('upcomingPresentations', (api) => {
    const now = new Date();
    return presentationsOf(announcedTalks(api))
      .filter((p) => p.date >= now)
      .sort((a, b) => a.date - b.date); // soonest first
  });
  eleventyConfig.addCollection('pastPresentations', (api) => {
    const now = new Date();
    return presentationsOf(announcedTalks(api))
      .filter((p) => p.date < now)
      .sort((a, b) => b.date - a.date); // most recent first
  });

  // Presentation rows whose talk has a given format (e.g. Keynote), for stats.
  eleventyConfig.addFilter('byFormat', byFormat);
  // Group dated items by calendar year (newest first) for a scannable archive.
  eleventyConfig.addFilter('groupByYear', groupByYear);
  // Unique ISO alpha-2 country codes across a set of presentation rows (map).
  eleventyConfig.addFilter('presentationCountries', presentationCountries);
  // Blog comments: thread a post's comment store into an approved, nested tree.
  eleventyConfig.addFilter('threadComments', threadComments);
  eleventyConfig.addFilter('countComments', countComments);

  // --- Global build metadata ---------------------------------------------
  eleventyConfig.addGlobalData('buildTime', () => new Date());
  eleventyConfig.addGlobalData('year', () => new Date().getFullYear());

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    // `css` is explicit here (not only via addExtension) so app.css is always
    // recognised and emitted, independent of addTemplateFormats merge order.
    templateFormats: ['njk', 'md', 'html', 'css'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    pathPrefix: '/',
  };
}

// Keep a stable reference to this file's dir if needed by future helpers.
export const __dirname = dirname(fileURLToPath(import.meta.url));

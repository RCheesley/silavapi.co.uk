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

const CSS_TARGETS = browserslistToTargets(browserslist('>= 0.5%, last 2 versions, not dead'));
const ROOT_DIR = dirname(fileURLToPath(import.meta.url));
const ICON_DIR = resolve(ROOT_DIR, 'src/assets/icons');

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
      slugify: (s) =>
        s
          .trim()
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s-]/gu, '')
          .replace(/\s+/g, '-'),
    })
    .use(markdownItAttrs);
  eleventyConfig.setLibrary('md', md);

  // --- CSS: bundle + minify app.css with LightningCSS ---------------------
  // Only app.css is emitted; its @import partials are read from disk by the
  // bundler, so we tell Eleventy to ignore them as standalone templates.
  eleventyConfig.ignores.add('src/assets/css/tokens/**');
  eleventyConfig.ignores.add('src/assets/css/fonts.css');
  eleventyConfig.ignores.add('src/assets/css/base.css');

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
  eleventyConfig.addPassthroughCopy({ 'src/assets/js': 'assets/js' });
  eleventyConfig.addPassthroughCopy({ 'src/_headers': '_headers' });
  eleventyConfig.addPassthroughCopy({ 'src/_redirects': '_redirects' });
  eleventyConfig.addPassthroughCopy({ 'src/robots.txt': 'robots.txt' });
  eleventyConfig.addWatchTarget('src/assets/css/');

  // --- Filters ------------------------------------------------------------
  // British date rendering ("03 March, 2025") + ISO for <time>/sitemap.
  eleventyConfig.addFilter('readableDate', readableDate);
  eleventyConfig.addFilter('isoDate', isoDate);

  // --- Shortcodes ---------------------------------------------------------
  // Inline a vendored Lucide SVG (currentColor, 1.5px stroke, decorative).
  // `name` is validated (no path traversal) and `size` coerced to a number, so
  // the shortcode can never read outside ICON_DIR or inject attributes.
  eleventyConfig.addShortcode('icon', (name, size = 24) => {
    if (typeof name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(name)) {
      throw new Error(`icon: invalid name "${name}"`);
    }
    const file = resolve(ICON_DIR, `${name}.svg`);
    if (!file.startsWith(ICON_DIR + sep)) {
      throw new Error(`icon: path escapes ICON_DIR for "${name}"`);
    }
    const px = Number(size) || 24;
    const svg = readFileSync(file, 'utf8');
    return svg
      .replace('<svg', '<svg aria-hidden="true" focusable="false" class="icon"')
      .replace(/\swidth="[^"]*"/, ` width="${px}"`)
      .replace(/\sheight="[^"]*"/, ` height="${px}"`)
      .replace(/stroke-width="[^"]*"/, 'stroke-width="1.5"');
  });

  // --- Collections --------------------------------------------------------
  eleventyConfig.addCollection('posts', (collectionApi) =>
    collectionApi.getFilteredByGlob('src/blog/**/*.md').sort((a, b) => b.date - a.date)
  );

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

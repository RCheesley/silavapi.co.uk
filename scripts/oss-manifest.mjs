#!/usr/bin/env node
/**
 * oss-manifest.mjs - regenerates docs/OPEN_SOURCE.md, a manifest of every
 * open-source project this site depends on. Reads the installed package
 * metadata so versions + licences are accurate. Run after changing deps:
 *
 *   node scripts/oss-manifest.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PURPOSE = {
  '@11ty/eleventy': 'Static site generator (build)',
  '@11ty/eleventy-img': 'Responsive image transforms (build)',
  '@11ty/eleventy-navigation': 'Navigation/breadcrumb helper (build)',
  '@11ty/eleventy-plugin-rss': 'RSS/Atom feed generation (build)',
  '@11ty/eleventy-plugin-syntaxhighlight': 'Code-block highlighting (build)',
  '@axe-core/playwright': 'axe accessibility engine for e2e (test)',
  '@eslint/js': 'ESLint recommended ruleset (lint)',
  '@lhci/cli': 'Lighthouse CI - accessibility score gate (test)',
  '@playwright/test': 'Functional + accessibility e2e runner (test)',
  '@vitest/coverage-v8': 'Unit-test coverage (test)',
  browserslist: 'Target-browser resolution for CSS (build)',
  eslint: 'JavaScript linter (lint)',
  globals: 'Environment global definitions for ESLint (lint)',
  'html-validate': 'HTML validation of the built output (test)',
  lightningcss: 'CSS bundling + minification (build)',
  linkinator: 'Broken-link checker (test)',
  'lucide-static': 'Source SVGs for the interface icons (build-time only)',
  'markdown-it': 'Markdown → HTML renderer (build)',
  'markdown-it-anchor': 'Heading anchors for Markdown (build)',
  'markdown-it-attrs': 'Attribute syntax for Markdown (build)',
  'pa11y-ci': 'HTML CodeSniffer accessibility checks (test)',
  pagefind: 'Client-side site search index (build + runtime)',
  prettier: 'Code formatter (lint)',
  'start-server-and-test': 'Serves the build for a11y/link tests (test)',
  turndown: 'HTML → Markdown for content migration (dev)',
  'node-html-parser': 'HTML parsing for content migration (dev)',
  vitest: 'Unit-test runner (test)',
};

async function pkgMeta(name) {
  try {
    const p = JSON.parse(
      await readFile(resolve(ROOT, 'node_modules', name, 'package.json'), 'utf8')
    );
    const repo = typeof p.repository === 'string' ? p.repository : p.repository?.url;
    let home = p.homepage || (repo ? repo.replace(/^git\+/, '').replace(/\.git$/, '') : '');
    // Normalise npm's GitHub shorthand ("user/repo" or "github:user/repo").
    home = home.replace(/^github:/, '');
    if (home && !/^https?:\/\//.test(home)) home = `https://github.com/${home}`;
    return { version: p.version, license: p.license || 'see project', home };
  } catch {
    return { version: '-', license: '-', home: '' };
  }
}

async function main() {
  const rootPkg = JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8'));
  const deps = Object.keys(rootPkg.devDependencies || {}).sort((a, b) => a.localeCompare(b));

  const rows = [];
  for (const name of deps) {
    const m = await pkgMeta(name);
    const link = m.home ? `[${name}](${m.home})` : name;
    rows.push(`| ${link} | ${m.version} | ${m.license} | ${PURPOSE[name] ?? ''} |`);
  }

  const md = `# Open-source manifest

Every open-source project this site is built with. Regenerate with
\`node scripts/oss-manifest.mjs\` (reads installed package metadata). The site
ships **no third-party code to the browser** except the self-hosted Pagefind
search bundle and self-hosted fonts - all served from our own origin.

## Build, test & tooling (npm)

| Package | Version | Licence | Purpose |
| --- | --- | --- | --- |
${rows.join('\n')}

## Fonts & assets (self-hosted)

| Project | Licence | Purpose |
| --- | --- | --- |
| [Libre Bodoni](https://github.com/impallari/Libre-Bodoni) | OFL-1.1 | Display typeface (headings) |
| [Lato](https://github.com/latofonts/lato-source) | OFL-1.1 | Text typeface (body + UI) |
| [Lucide](https://lucide.dev/) | ISC | Interface icons (self-hosted SVGs) |

## Platform

| Service | Role |
| --- | --- |
| [Cloudflare Pages](https://pages.cloudflare.com/) | Static hosting + Functions (contact form), edge analytics |
| [GitHub Actions](https://github.com/features/actions) | CI: build, tests, accessibility gates |

_Fonts (OFL) and Lucide (ISC) permit self-hosting and subsetting. This file is
generated for the npm section; the sections below it are maintained by hand._
`;

  await writeFile(resolve(ROOT, 'docs/OPEN_SOURCE.md'), md);
  console.log(`Wrote docs/OPEN_SOURCE.md (${deps.length} npm packages).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

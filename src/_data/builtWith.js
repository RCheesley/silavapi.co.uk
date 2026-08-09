/**
 * Data for the /built-with/ page: the open source projects this site is built
 * on, grouped by what they do. Funding URLs are the ones each project declares
 * (as reported by `npm fund`), so a "Support" link only appears where the
 * maintainers actually ask for support. `total` is read straight from the
 * lockfile so the headline figure stays accurate as dependencies change.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

function countPackages() {
  try {
    const lockPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../package-lock.json');
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
    // `packages` keys the root project as "" - don't count it as a dependency.
    return Object.keys(lock.packages || {}).filter((k) => k !== '').length;
  } catch {
    return 0;
  }
}

const total = countPackages();

const groups = [
  {
    group: 'Building the pages',
    items: [
      {
        name: 'Eleventy',
        url: 'https://www.11ty.dev/',
        funding: 'https://opencollective.com/11ty',
        desc: 'The static site generator that turns my Markdown into the pages you are reading.',
      },
      {
        name: 'Nunjucks',
        url: 'https://mozilla.github.io/nunjucks/',
        desc: 'The templating language behind every layout.',
      },
      {
        name: 'markdown-it',
        url: 'https://github.com/markdown-it/markdown-it',
        funding: 'https://github.com/sponsors/puzrin',
        desc: 'Turns my Markdown writing into HTML.',
      },
      {
        name: 'Lightning CSS',
        url: 'https://lightningcss.dev/',
        funding: 'https://opencollective.com/parcel',
        desc: 'Bundles and minifies the stylesheet into one fast, same-origin file.',
      },
      {
        name: 'Browserslist',
        url: 'https://github.com/browserslist/browserslist',
        funding: 'https://opencollective.com/browserslist',
        desc: 'Decides which browsers the CSS needs to support.',
      },
    ],
  },
  {
    group: 'Search, icons and the map',
    items: [
      {
        name: 'Pagefind',
        url: 'https://pagefind.app/',
        desc: 'Full-text search that runs entirely in your browser - no server, no tracking.',
      },
      {
        name: 'Lucide',
        url: 'https://lucide.dev/',
        desc: 'The clean, open icon set used across the site.',
      },
      {
        name: 'SVG Maps',
        url: 'https://github.com/VictorCazanave/svg-maps',
        desc: 'The world map on my speaking page.',
      },
    ],
  },
  {
    group: 'Keeping it correct and accessible',
    items: [
      {
        name: 'Vitest',
        url: 'https://vitest.dev/',
        funding: 'https://opencollective.com/vitest',
        desc: 'Runs the unit tests on every change.',
      },
      {
        name: 'Playwright',
        url: 'https://playwright.dev/',
        desc: 'Drives a real browser to test the site in both light and dark themes.',
      },
      {
        name: 'axe-core',
        url: 'https://github.com/dequelabs/axe-core',
        desc: 'The accessibility engine that checks every page.',
      },
      {
        name: 'Pa11y',
        url: 'https://pa11y.org/',
        desc: 'A second accessibility checker, for belt and braces.',
      },
      {
        name: 'HTML-validate',
        url: 'https://html-validate.org/',
        funding: 'https://github.com/sponsors/html-validate',
        desc: 'Validates the HTML on every build.',
      },
      {
        name: 'Lighthouse CI',
        url: 'https://github.com/GoogleChrome/lighthouse-ci',
        desc: 'Audits every page and blocks anything below a perfect accessibility score.',
      },
      {
        name: 'ESLint',
        url: 'https://eslint.org/',
        funding: 'https://eslint.org/donate',
        desc: 'Catches mistakes in the JavaScript.',
      },
      {
        name: 'Prettier',
        url: 'https://prettier.io/',
        funding: 'https://github.com/prettier/prettier?sponsor=1',
        desc: 'Keeps all the code tidy and consistent.',
      },
      {
        name: 'Linkinator',
        url: 'https://github.com/JustinBeckwith/linkinator',
        desc: 'Checks that none of my links are broken.',
      },
    ],
  },
  {
    group: 'Moving fifteen years across',
    items: [
      {
        name: 'Turndown',
        url: 'https://github.com/mixmark-io/turndown',
        desc: 'Converted the old Joomla HTML into clean Markdown.',
      },
      {
        name: 'node-html-parser',
        url: 'https://github.com/taoqf/node-html-parser',
        desc: 'Parsed the old pages during the migration.',
      },
    ],
  },
];

export default { total, groups };

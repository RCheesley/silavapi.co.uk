# Open-source manifest

Every open-source project this site is built with. Regenerate with
`node scripts/oss-manifest.mjs` (reads installed package metadata). The site
ships **no third-party code to the browser** except the self-hosted Pagefind
search bundle and self-hosted fonts - all served from our own origin.

## Build, test & tooling (npm)

| Package                                                                                     | Version | Licence       | Purpose                                               |
| ------------------------------------------------------------------------------------------- | ------- | ------------- | ----------------------------------------------------- |
| [@11ty/eleventy](https://www.11ty.dev/)                                                     | 3.1.6   | MIT           | Static site generator (build)                         |
| [@11ty/eleventy-img](https://github.com/11ty/image#readme)                                  | 7.0.0   | MIT           | Responsive image transforms (build)                   |
| [@11ty/eleventy-navigation](https://www.11ty.dev/docs/plugins/navigation/)                  | 1.0.5   | MIT           | Navigation/breadcrumb helper (build)                  |
| [@11ty/eleventy-plugin-rss](https://www.11ty.dev/docs/plugins/rss/)                         | 3.0.0   | MIT           | RSS/Atom feed generation (build)                      |
| [@11ty/eleventy-plugin-syntaxhighlight](https://www.11ty.dev/docs/plugins/syntaxhighlight/) | 5.0.2   | MIT           | Code-block highlighting (build)                       |
| [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm)                           | 4.12.1  | MPL-2.0       | axe accessibility engine for e2e (test)               |
| [@eslint/js](https://eslint.org)                                                            | 10.0.1  | MIT           | ESLint recommended ruleset (lint)                     |
| [@lhci/cli](https://github.com/GoogleChrome/lighthouse-ci)                                  | 0.15.1  | Apache-2.0    | Lighthouse CI - accessibility score gate (test)       |
| [@playwright/test](https://playwright.dev)                                                  | 1.62.1  | Apache-2.0    | Functional + accessibility e2e runner (test)          |
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage)                                    | 4.1.10  | MIT           | Unit-test coverage (test)                             |
| [browserslist](https://github.com/browserslist/browserslist)                                | 4.28.7  | MIT           | Target-browser resolution for CSS (build)             |
| [eslint](https://eslint.org)                                                                | 10.8.0  | MIT           | JavaScript linter (lint)                              |
| [globals](https://github.com/sindresorhus/globals)                                          | 17.9.0  | MIT           | Environment global definitions for ESLint (lint)      |
| [html-validate](https://html-validate.org)                                                  | 11.6.2  | MIT           | HTML validation of the built output (test)            |
| [lightningcss](https://github.com/parcel-bundler/lightningcss)                              | 1.33.0  | MPL-2.0       | CSS bundling + minification (build)                   |
| [linkinator](https://github.com/JustinBeckwith/linkinator)                                  | 8.0.3   | MIT           | Broken-link checker (test)                            |
| [lucide-static](https://lucide.dev)                                                         | 1.28.0  | ISC           | Source SVGs for the interface icons (build-time only) |
| [markdown-it](https://github.com/markdown-it/markdown-it)                                   | 15.0.0  | MIT           | Markdown → HTML renderer (build)                      |
| [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor)                 | 9.2.1   | Unlicense     | Heading anchors for Markdown (build)                  |
| [markdown-it-attrs](https://github.com/arve0/markdown-it-attrs)                             | 5.0.1   | MIT           | Attribute syntax for Markdown (build)                 |
| [node-html-parser](https://github.com/taoqf/node-fast-html-parser)                          | 9.0.1   | MIT           | HTML parsing for content migration (dev)              |
| [pa11y-ci](https://github.com/pa11y/pa11y-ci)                                               | 4.1.1   | LGPL-3.0-only | HTML CodeSniffer accessibility checks (test)          |
| [pagefind](https://github.com/Pagefind/pagefind#readme)                                     | 1.5.2   | MIT           | Client-side site search index (build + runtime)       |
| [prettier](https://prettier.io)                                                             | 3.9.6   | MIT           | Code formatter (lint)                                 |
| [start-server-and-test](https://github.com/bahmutov/start-server-and-test#readme)           | 2.1.5   | MIT           | Serves the build for a11y/link tests (test)           |
| [turndown](https://github.com/mixmark-io/turndown)                                          | 7.2.4   | MIT           | HTML → Markdown for content migration (dev)           |
| [vitest](https://vitest.dev)                                                                | 4.1.10  | MIT           | Unit-test runner (test)                               |

## Fonts & assets (self-hosted)

| Project                                                   | Licence | Purpose                            |
| --------------------------------------------------------- | ------- | ---------------------------------- |
| [Libre Bodoni](https://github.com/impallari/Libre-Bodoni) | OFL-1.1 | Display typeface (headings)        |
| [Lato](https://github.com/latofonts/lato-source)          | OFL-1.1 | Text typeface (body + UI)          |
| [Lucide](https://lucide.dev/)                             | ISC     | Interface icons (self-hosted SVGs) |

## Platform

| Service                                               | Role                                                      |
| ----------------------------------------------------- | --------------------------------------------------------- |
| [Cloudflare Pages](https://pages.cloudflare.com/)     | Static hosting + Functions (contact form), edge analytics |
| [GitHub Actions](https://github.com/features/actions) | CI: build, tests, accessibility gates                     |

_Fonts (OFL) and Lucide (ISC) permit self-hosting and subsetting. This file is
generated for the npm section; the sections below it are maintained by hand._

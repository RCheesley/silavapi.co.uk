# Contributing

Thanks for taking an interest. This is my personal site, so it is not a
community project in the usual sense - but it is open source so that people can
learn from it, borrow from it, and help me keep it accurate. Contributions are
genuinely welcome, within that spirit.

## The most useful things you can do

- **Spot something wrong in the content?** A typo, a broken link, an out-of-date
  fact, or a page that reads oddly - please open a _content correction_ issue.
  These are the contributions I value most.
- **Found a bug on the site?** Something visually broken, an interaction that
  fails, an accessibility problem - open a _bug report_ issue.
- **Want to borrow the code?** Please do. It is MIT licensed. No need to ask.

For anything that is really a personal message rather than an issue with the
site, the [contact form](https://silavapi.co.uk/contact/) is the better route.

## Ground rules

- Be kind and constructive. This project follows a
  [Code of Conduct](CODE_OF_CONDUCT.md).
- I write in British English and follow a consistent house style. Content
  changes should match the surrounding prose.
- I will not merge changes that invent facts, put words in my mouth, or change
  the meaning of something I have written. Corrections, yes; rewrites of my
  views, no.

## Working on the code

Prerequisites: **Node.js 24+** (see `.nvmrc`) and npm.

```bash
npm ci            # install exact dependencies
npm run dev       # local dev server with live reload (Eleventy)
```

Other useful scripts:

```bash
npm run build     # production build into _site/ (+ Pagefind search index)
npm run serve     # serve the built _site/ (what the tests run against)
npm run lint      # ESLint + Prettier check
npm run lint:fix  # auto-fix what can be fixed
```

## The checks

Every change runs through the same gauntlet in CI, and nothing merges unless all
of it passes. You can run the whole thing locally with `npm test`, or piece by
piece:

```bash
npm run test:unit    # Vitest unit tests
npm run test:e2e     # Playwright functional + axe-core a11y (light and dark)
npm run test:html    # html-validate on the built output
npm run test:a11y    # pa11y-ci
npm run test:links   # linkinator (no broken links)
npm run test:lh      # Lighthouse CI
```

Accessibility is a hard requirement (WCAG 2.2 AA) and is enforced automatically,
so please keep it green. If you add or change a component, add or update the test
that covers it.

## Pull requests

- Keep them small and focused - one idea per PR.
- Write tests for new behaviour; aim to keep coverage high (`lib/**` is gated at
  100%).
- Make sure the full gauntlet passes before you ask for review.
- PRs also get an automated review pass; please address the feedback.

## Licensing of contributions

- Contributions to the **code** are accepted under the [MIT Licence](LICENSE).
- Please do not add third-party code, images, or fonts without a compatible
  licence, and credit the source. Stock or third-party images must keep their
  original terms and attribution.

By opening a pull request, you agree that your contribution may be distributed
under these terms.

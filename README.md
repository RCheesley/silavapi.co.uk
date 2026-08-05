# silavapi.co.uk

The personal site of **Sīlavāpi** (formerly Ruth Cheesley) - a privacy-first, accessible
static site, migrated from the old Joomla site at ruthcheesley.co.uk.

> Built in the open, with free software. This site sets **no cookies**, runs **no trackers**,
> and loads **nothing from third parties**.

## Status

🚧 **In active migration.** This repository is private for now and will be made **public**
later - transparency is the default. Nothing secret is ever committed here.

## Tech stack

| Concern               | Choice                                                                             |
| --------------------- | ---------------------------------------------------------------------------------- |
| Static site generator | [Eleventy](https://www.11ty.dev/) v3 + Nunjucks                                    |
| Search                | [Pagefind](https://pagefind.app/) (build-time index, 100% client-side)             |
| Hosting               | Cloudflare Pages (`silavapi.co.uk`, proxied)                                       |
| Contact form          | Cloudflare Pages Function → server-side email (works without JavaScript)           |
| Analytics             | Cloudflare edge/server-side - no client script, no cookies, no third-party request |
| Fonts                 | Libre Bodoni + Lato, self-hosted as subset woff2                                   |

A full manifest of every open-source project used lives in
[`docs/OPEN_SOURCE.md`](docs/OPEN_SOURCE.md), and the cookie register (target: zero) in
[`docs/COOKIES.md`](docs/COOKIES.md).

## Principles

- **WCAG 2.2 AA**, AAA where achievable. Accessibility is a gate, not an afterthought.
- **Zero third-party requests** from the browser. Strict Content-Security-Policy.
- **No cookies at all** → no consent banner.
- British English; the identity name is always written **Sīlavāpi** (with diacritics).

## Development

```bash
nvm use          # Node 24 LTS (see .nvmrc)
npm install
npm run dev      # local dev server
npm run build    # production build to _site/
npm test         # unit + functional + accessibility checks
```

Full contributor and deployment docs will land in [`docs/`](docs/) as the build progresses.

## Design source of truth

The design handoff (spec + high-fidelity mockups + design tokens) lives in
[`design-handoff/`](design-handoff/) - see `design-handoff/BUILD_SPEC.md` and
`design-handoff/README.md`.

## Licence

To be confirmed. (Code and written content will likely carry separate licences -
a permissive licence for the site code, and a Creative Commons licence for the writing.)

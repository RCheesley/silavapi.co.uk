# Deployment

The site is a pile of static files (`_site/`) plus a couple of Cloudflare Pages
Functions (the contact form, added in Phase 4). It is hosted on **Cloudflare
Pages**, served from **silavapi.co.uk** proxied through Cloudflare.

## Build settings (Cloudflare Pages project)

| Setting                | Value                                                |
| ---------------------- | ---------------------------------------------------- |
| Framework preset       | None                                                 |
| Build command          | `npm run build`                                      |
| Build output directory | `_site`                                              |
| Node version           | from `.nvmrc` (24) — set `NODE_VERSION=24` if needed |

`npm run build` runs Eleventy and then Pagefind, producing the full static site
including the client-side search index.

## Headers & redirects

- **`src/_headers`** → served as `/_headers`: the strict Content-Security-Policy
  (`default-src 'self'`), HSTS, `Referrer-Policy`, `Permissions-Policy`, and
  cache rules. The only CSP concession is `'wasm-unsafe-eval'` for Pagefind's
  client-side search WASM.
- **`src/_redirects`** → served as `/_redirects`: the 301 map from old
  ruthcheesley.co.uk URLs (populated during content migration, Phase 3) and the
  legacy feed redirect.

## Analytics

Cloudflare **Web Analytics** in the zone's server-side/edge mode: no client-side
script, no cookies, no third-party request. Aggregate only. (Configured in the
Cloudflare dashboard; nothing is added to the pages.)

## Contact form (Phase 4)

A Cloudflare Pages Function receives the POST, sends one email server-side, and
303-redirects to a thank-you page. Honeypot + time-trap instead of a CAPTCHA.
Works with JavaScript disabled. No secrets live in the repo — the mail
credential is a Cloudflare environment variable.

## The old domain

`ruthcheesley.co.uk` is kept serving **301 redirects indefinitely** to the new
home of each URL, and `/feed.xml` stays stable with a redirect from the old feed.

## CI → deploy

CI (`.github/workflows/ci.yml`) must be green before merge. Cloudflare Pages
builds and deploys from `main` on merge (and gives every PR a preview URL).

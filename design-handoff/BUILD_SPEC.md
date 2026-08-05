# silavapi.co.uk — build handoff

Migration of ruthcheesley.co.uk (Joomla) to a static site at **https://silavapi.co.uk**, managed in a private GitHub repo. This document + the `.dc.html` mockups in this project are the design source of truth.

## Mockups in this project

| File | Page |
| --- | --- |
| `Home.dc.html` | Home (hero with name transition, latest posts, pillars, about, events band, blog grid, quote) |
| `Blog.dc.html` | Blog index — category filter chips + client-side search |
| `Article.dc.html` | Article — incl. reader text-size control |
| `Dharma.dc.html` | New Dharma section landing page |
| `Contact.dc.html` | Contact form + "other ways" card |
| `Privacy.dc.html` | Plain-English privacy page |
| `SiteHeader.dc.html` / `SiteFooter.dc.html` | Shared chrome (skip link, flat nav, privacy pledge footer) |

Design tokens, components and photography: `_ds/ruth-cheesley-design-system-672a1632-a13e-48b6-befc-b3f658adf6a9/` (tokens as CSS custom properties — port them verbatim). Full DS source incl. component specs: design-system project `672a1632-a13e-48b6-befc-b3f658adf6a9`.

## Identity

- Site name is **Sīlavāpi** (always with correct diacritics, incl. `<title>`, headings, metadata; slug/domain uses `silavapi`).
- Header/footer mark: **lotus symbol** (`assets/logo-symbol.png`) + "Sīlavāpi" set in Libre Bodoni. The full "Ruth Cheesley" wordmark lockups are retired from site chrome but the artwork is unchanged and may appear in historical contexts.
- A "formerly Ruth Cheesley" bridge appears in the home hero and about copy during the transition. Keep `Ruth Cheesley` in metadata (`og:see_also`, structured data `alternateName`) for findability.
- Logo, colours, fonts: **unchanged** from the 2022 identity. No new colours.

## Stylistic changes vs. the current site (all deliberate)

1. **Flat navigation, no hover dropdowns.** The old About/Life/Blog dropdowns fail keyboard and touch users (WCAG 1.4.13, 2.1.1). Nav is now: Home · About · Dharma · Blog · Contact. About/Life child pages become blog category pages + the home about band.
2. **New Dharma section** — first-class area for Buddhist life, ordination story, Breathworks.
3. **Links are always underlined** in body text, purple-light `#533D90` (≈7.6:1 on white — AAA). Pink is reserved for accents, active-nav, and bold/large text only (4.6:1 = AA for normal text, so never use pink for small/regular text).
4. **Visible focus everywhere**: 2px purple-light outline, offset 2–4px; orange-light outline on dark bands. Never remove outlines.
5. **Skip link** to `#main` on every page.
6. **Footer**: phone number removed (privacy), socials trimmed to Mastodon / LinkedIn / RSS, privacy pledge box added, "Built with Joomla" line replaced.
7. **Reader text-size control** on articles (17px / 19px / 21px body). Persist choice in `localStorage`.
8. **Contact form** stays but gets an inline plain-language privacy note; success/error states are `aria-live` announced.
9. **Calm motion kept**, plus a global `prefers-reduced-motion` kill switch.

## Accessibility target: WCAG 2.2 AA, AAA where achievable

Must-haves beyond the mockups:

- Semantic landmarks on every page (`header`, `nav[aria-label]`, `main#main`, `footer`); one `h1` per page; no skipped heading levels.
- All interactive targets ≥ 44×44px (2.5.8 AAA); mockups follow this.
- Category filter + search results region uses `aria-live="polite"` result counts (implemented in `Blog.dc.html`).
- `aria-current="page"` on active nav item; `aria-pressed` on toggles (see mockups).
- Text: base 17px Lato, line-height 1.65, measure ≤ 64ch, `text-wrap: pretty` on headings. Bodoni never below 19px, never all-caps.
- Alt text policy: decorative photos (`alt=""`), meaningful portraits get descriptive alt (see mockups for tone).
- **Dark mode** via `prefers-color-scheme` (not built in mockups — spec): swap `--surface-page` → `#120035`-derived near-black `#161122`, text → warm off-white, cards → translucent white borders per DS dark-card rules, links → orange-light `#F9B233`. Keep photos un-filtered; keep AAA contrast for body text.
- Publish an **Accessibility statement** page (footer link exists) stating the conformance target and a contact route.
- CI: axe-core + pa11y on every PR; Lighthouse a11y score gate ≥ 100.

## Privacy requirements (binding)

- **Zero third-party requests.** Self-host Libre Bodoni + Lato as woff2 with `font-display: swap` (both are OFL — subset to latin + latin-ext for the diacritics ā/ī). No CDNs, no Google Fonts, no external embeds; YouTube etc. become click-to-load posters or plain links.
- **No cookies at all** → no consent banner.
- **Analytics**: self-hosted Plausible CE or Umami, proxied on the same domain, aggregate only.
- **Contact form**: self-hosted handler (e.g. a tiny mail relay on Ruth's VPS) — POST → one email → 303 redirect to a thank-you page; honeypot + time-trap instead of CAPTCHA. Must work without JavaScript.
- **Search**: Pagefind (build-time index, runs entirely client-side). Blog filter mockup behaviour = progressive enhancement over plain category pages that work without JS.
- Strict CSP (`default-src 'self'`), no inline third-party scripts; Referrer-Policy `strict-origin-when-cross-origin` or stricter.
- Privacy page content is written final in `Privacy.dc.html` — port verbatim (update the "last updated" date and the log-retention numbers to match reality).

## Suggested stack

- **Eleventy (11ty)** + Nunjucks — HTML-first, zero client JS by default, easy Joomla-HTML import. (Hugo equally fine if Go templating preferred.)
- Pagefind for search; Plausible/Umami self-hosted; deploy via GitHub Actions to Ruth's own server (rsync) — avoids putting visitor traffic through a third-party host if self-hosting is preferred; otherwise any static host she trusts.
- Content as Markdown with front matter: `title, date, category (one of: Buddhism, Community, Digital Sovereignty, Marketing, Mautic, Being bendy), tags, image, imageAlt, excerpt` (excerpts end with an ellipsis, dates render `03 March, 2025`).

## Migration checklist

- Export all Joomla articles → Markdown; preserve publish dates and categories; full archive migrates.
- **Redirect map**: every old `ruthcheesley.co.uk` URL 301s to its new home on `silavapi.co.uk` (keep the old domain serving redirects indefinitely). RSS feed URL kept stable at `/feed.xml` with a redirect from the old feed.
- 404 page in site style with search + link home.
- `humans.txt` optional; `robots.txt` plain; sitemap.xml generated.
- British English throughout; first person singular voice; sentence case headings; UPPERCASE tracked eyebrows/labels/buttons.

## Open items (ask Ruth)

- Real email address + Mastodon handle (mockups use placeholders `hello@silavapi.co.uk`, `@silavapi`).
- Whether speaking.ruthcheesley.co.uk also migrates (footer/contact link to it as external for now).
- Accessibility statement wording; analytics tool choice; host for the static site.

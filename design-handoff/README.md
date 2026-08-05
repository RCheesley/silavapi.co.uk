# Handoff: silavapi.co.uk — static site rebuild

## Overview
Migration of ruthcheesley.co.uk (Joomla) to a static site at **https://silavapi.co.uk**, following Ruth's ordination as **Sīlavāpi**. Six page designs plus shared header/footer, an accessibility spec (WCAG 2.2 AA, AAA where achievable) and binding privacy requirements. The site will live in a private GitHub repo and deploy as plain static files.

**Read `BUILD_SPEC.md` alongside this README** — it carries the identity rules, the nine deliberate stylistic changes vs. the old site, the full accessibility + privacy requirements, the suggested stack (Eleventy + Pagefind + self-hosted analytics), content model, and the Joomla migration checklist. This README covers the design reference itself.

## About the design files
Files in `mocks/` are **design references created in HTML** (Design Component format: markup between `<x-dc>` tags + a small logic class). They are prototypes showing intended look and behaviour — **not production code to ship**. The task is to recreate these designs as a static site (Eleventy/Nunjucks recommended, see BUILD_SPEC.md; Hugo acceptable). Open each `.dc.html` in a text editor: the inline styles carry exact values, all referencing the CSS custom properties in `design_system/tokens/`. The `<x-import component-from-global-scope="RuthCheesleyDesignSystem_672a16.X">` tags mount design-system components — their visual specs are in `design_system/styles.css` and the token files; recreate them as site partials/macros.

## Fidelity
**High-fidelity.** Colours, type, spacing, radii, shadows, copy and interaction states are final. Recreate pixel-perfectly. All values come from `design_system/tokens/*.css` — port these token files verbatim as the site's CSS custom properties.

## Screens

### `mocks/SiteHeader.dc.html` — shared header (every page)
- Skip link: visually hidden `<a href="#main">Skip to main content</a>`, appears top-left on focus (purple-dark fill, white text, pink focus outline).
- Sticky header: `rgba(255,255,255,.92)` + backdrop blur, 1px `--border-subtle` bottom hairline, content max-width 1200px, 40px gutters.
- Mark: `assets/logo-symbol.png` at 40px + "Sīlavāpi" in Libre Bodoni 500, `--text-xl`, purple-dark. Links to home.
- Nav (flat, **no dropdowns**): Home · About (→ home `#about`) · Dharma · Blog · Contact. Uppercase Lato `--text-2xs` bold, wide tracking. Active page: pink text + 2px pink bottom border + `aria-current="page"`. Hover: pink. Focus: 2px purple-light outline, offset 4px. Pages not in the nav (e.g. Privacy) mark **no** item active.

### `mocks/SiteFooter.dc.html` — shared footer (every page)
- Aubergine→plum gradient (`--gradient-inverse-surface`), 160°.
- Col 1: lotus symbol 44px + "Sīlavāpi" Bodoni; one-line description; **privacy pledge box** (1px translucent white border, radius 8px): "This site sets no cookies, runs no trackers, and loads nothing from third parties." + link to Privacy.
- Col 2 "Explore": Home, Dharma, Blog, Contact, Privacy, Accessibility statement. Col 3 "Elsewhere": Mastodon, LinkedIn, RSS feed, Send an email, Speaking. Links: muted on-dark, underlined, hover white, focus orange-light outline. Column headings: uppercase, `--rc-pink-60`.
- Bottom bar over 1px on-dark border: "© 2026 Sīlavāpi (Ruth Cheesley) · silavapi.co.uk" / "A static site, built in the open with free software."
- **No phone number** (deliberate removal).

### `mocks/Home.dc.html`
1. **Hero**: h1 "Hello, I'm Sīlavāpi." (Bodoni `--text-4xl`, -0.02em), 3px × 72px pink→orange gradient rule, standfirst with "formerly Ruth Cheesley" bridge copy, link to the name article.
2. **Latest from the blog**: eyebrow + 3-col grid of Bodoni `--text-lg` title links (hover: underline + link-hover colour).
3. **Pillars** (paper-tinted `--surface-subtle`): 4 TopicCards — white card, hairline border, radius 14px, circular lotus-gradient icon plate with white Lucide icon (users / accessibility / flower / activity), Bodoni title, body, text link. Hover: lift -3px + shadow step.
4. **About** (`id="about"`): 420px portrait (`assets/photography/portrait-05.jpg`, 2:3, radius 14, `--shadow-lg`) + SectionHeading "ABOUT / Here's a bit about me …" + 5 FactRows (label column + prose, hairline rules between) + buttons "Read the blog" (primary) / "Get in touch" (secondary).
5. **Events band**: full-bleed `speaking-stage-01.jpg` under `--gradient-protection` (transparent → 90% aubergine), dark-tone SectionHeading + event list (bold date column 190px, muted description).
6. **Recent writing**: SectionHeading + ghost "All posts" button; 3 ArticleCards (image, uppercase date, category badge, Bodoni title, ellipsis excerpt).
7. **Quote band** (inverse gradient): Bodoni italic pull quote, centred, uppercase attribution.

### `mocks/Blog.dc.html`
- H1 SectionHeading + standfirst.
- **Category filter chips**: All / Buddhism / Community / Digital Sovereignty / Mautic / Being bendy. Pill radius, uppercase `--text-2xs` bold; selected = purple-dark fill, white text, `aria-pressed="true"`; unselected = white fill, `--border-strong` 1px. Group has `role="group"` + label.
- **Search input** (280px) with visually-hidden label; filters with the chips (AND).
- Result count line, `aria-live="polite"` ("6 posts", "2 posts in Community matching “dāna”").
- 3-col ArticleCard grid on `--surface-subtle`; empty state = info Alert.
- Static build: chips/search are progressive enhancement (Pagefind + plain category pages work without JS).

### `mocks/Article.dc.html`
- 760px measure. Category badge + "20 July, 2026 · 7 min read" meta, Bodoni h1 `--text-3xl`, one-sentence standfirst, gradient rule.
- **Text-size control**: `role="group"` "Text size", three "A" buttons (14/16/18px glyphs), min 44×36px, `aria-pressed` + `aria-label`; sets body copy 17 → 19 → 21px. Persist in `localStorage` in production.
- Hero figure (980px, 16:8 crop, radius 14, caption "Photo: Simply C Photography").
- Body: Lato, `--leading-loose`, pull Quote mid-article, inline underlined links.
- Tag row over hairline; related-posts band (`--surface-subtle`, 3 ArticleCards).

### `mocks/Dharma.dc.html` (new section)
- Two-col hero: SectionHeading "DHARMA / A practice, not a hobby" + prose (name meaning, Breathworks) + buttons; 380px mono portrait (`portrait-04.jpg`).
- Quote band (inverse gradient); "Dharma on the blog" 3-card grid on `--surface-subtle`.

### `mocks/Contact.dc.html`
- Left: SectionHeading "CONTACT / Fancy a coffee? Drop me a line!" with boundary-setting standfirst; form: Name + Email (2-col), Message textarea, "Send an email" primary button; inline **privacy note** under the button (port copy verbatim).
- Validation: on submit; errors in pink replace field hints, invalid inputs get pink border; success = green Alert ("Message sent…"), announce via `aria-live`/focus. Errors written warmly (see mock copy).
- Right: dark aside "Other ways to reach me" — Email / Mastodon / Speaking enquiries, `--rc-pink-60` uppercase labels, white underlined links; closing line "No phone number here any more — email is kinder to both of us."
- Production: POST to self-hosted handler, works without JS (see BUILD_SPEC.md).

### `mocks/Privacy.dc.html`
- 760px article. Sections: What this site does not do (bulleted) / Analytics / The contact form / Server logs / Links elsewhere / Your rights, and questions. h2s in Bodoni `--text-xl`. **Copy is final — port verbatim**, updating the date and log-retention figures to reality.

## Interactions & behaviour
- Transitions: 150ms colour/border, 240ms hover lift, easing `cubic-bezier(.4,0,.2,1)`; nothing bounces. Global `prefers-reduced-motion: reduce` kill switch (in every mock's style block).
- Links in prose: purple-light `#533D90`, always underlined, hover pink `#E71D73`. On dark: muted white → white, focus outline orange-light.
- Buttons: primary purple-dark → hover purple-light; press `scale(.98)`. Focus: never remove outlines — 2px purple-light outline (mocks) or the DS 1px border + 3px pink ring.
- Hit targets ≥ 44×44px.

## State (static-site translation)
- Blog filter/search: client-side enhancement over static category pages; Pagefind for search.
- Article text size: `localStorage`, applied pre-paint to avoid flash.
- Contact form: plain HTML POST; server renders success/error page; JS enhancement optional.

## Design tokens
`design_system/tokens/` (colors, typography, spacing, radius, elevation, motion, fonts) + `design_system/styles.css`. Key values: purple-dark `#2C2662`, purple-light `#533D90`, pink `#E71D73` (accent + errors; never small/regular text on white), orange-dark `#F39207`, orange-light `#F9B233`, aubergine `#120035`, plum `#600F3E`; ink `#221E2C`, paper `#FBFAFC`; success `#1E7A5A`. Type: Libre Bodoni (headings, ≥19px, never all-caps) + Lato (body 17px/1.65). Radii 3/5/8/14/22px. Shadows tinted `rgba(18,0,53,…)`. **Self-host both fonts as woff2** (OFL; subset latin + latin-ext for ā/ī) — `tokens/fonts.css` in the mocks may reference remote fonts; production must not.

## Assets
`mocks/assets/`: `logo-symbol.png` (gradient lotus — never recolour/rebuild), `logo-monochrome-symbol.png`, photography (Simply C Photography + event shots): portraits 05 (colour), 04/07 (mono), mautic-13/16, speaking-stage-01, speaking-mic-01. The full 23-photo brand set exists in the design system source. Icons: Lucide v0.544.0, 1.5px stroke, monochrome, `currentColor` — self-host the SVGs used.

## Files
- `mocks/*.dc.html` — the eight design references (open `Home.dc.html` first)
- `mocks/assets/` — logo + photography used by the mocks
- `design_system/` — token CSS + styles.css (port verbatim)
- `BUILD_SPEC.md` — identity rules, a11y + privacy requirements, stack, migration checklist, open items

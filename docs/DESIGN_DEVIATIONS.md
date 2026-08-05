# Deliberate deviations from the mockups

The mockups are high-fidelity and treated as the source of truth. Where the
build departs from them, it is for a documented reason - almost always an
accessibility requirement that the design handoff itself flags. Each deviation
keeps within the existing brand palette (no new hues).

## 1. Active/hover nav text uses the palette's deeper pink

- **Mock:** active nav item and link-hover use brand pink `--rc-pink #E71D73`.
- **Problem:** at the nav's size (12px bold), `#E71D73` on white measures
  **4.35:1** - below WCAG AA's 4.5:1 for normal text. The design README says
  as much: _"never use pink for small/regular text."_
- **Change:** nav **text** uses `--action-accent-hover #CF1665` (an existing
  palette step) at **5.3:1**. The active **underline** stays bright pink
  `#E71D73` - as a non-text UI indicator it only needs 3:1, which it clears.
- **Where:** `--nav-link-accent` in `src/assets/css/tokens/semantic-overrides.css`.

## 2. Eyebrow labels use one tint darker

- **Mock:** eyebrows use `--text-eyebrow` = `--rc-purple-dark-60 #807CA1`.
- **Problem:** small uppercase text at **3.95:1** on white - fails AA.
- **Change:** `--text-eyebrow` → `--rc-purple-dark-80 #565182` (~7:1, clears AAA).
- **Where:** `semantic-overrides.css` (light) + `tokens/dark.css` (dark uses a
  light tint on the dark surface).

## 3. Gradient bands carry a solid background-color fallback

- **Mock:** dark bands (footer, events, quote) use gradients only.
- **Problem:** contrast tooling cannot evaluate a gradient background, and a
  gradient with no fallback degrades poorly if unsupported.
- **Change:** every gradient band also sets a solid, opaque `background-color`
  in the same tone (e.g. footer: `--rc-bg-aubergine` under the gradient). No
  visible change; it just gives a definite background to fall back to.
- **Guarded by:** a Playwright test that fails if any text-bearing gradient
  element lacks a solid fallback (`tests/e2e/structure.spec.js`).

## Accessibility tooling note

- **axe-core** runs via Playwright on every page in **both** colour schemes.
- **pa11y** runs the **HTML CodeSniffer** engine (a second, independent engine).
  pa11y's own axe runner is not used: it cannot read gradient backgrounds and
  has no colour-scheme control, so it false-positives on the gradient bands that
  axe-via-Playwright already checks correctly. Rationale is recorded in
  `.pa11yci.json`.

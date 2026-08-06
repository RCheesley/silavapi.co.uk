# Backlog - Ruth's refinements

A living list of refinements Ruth has asked for. She adds to this over time.
Items are checked off as they land (with the PR that did it).

## Copy & house style

- [x] Never hyphenate **"open source"** (two words, even as a modifier) - homepage hero. _(Phase 0)_
- [x] Use hyphens, not em dashes, in copy. _(Phase 0; adopted as an ongoing convention)_
- [ ] **Birth-name format:** when the birth name is used in copy, write **"Sīlavāpi (ex Ruth) Cheesley"**. Keep `alternateName` = "Ruth Cheesley" in structured data for findability. _Open question: does this replace the hero's "formerly Ruth Cheesley" bridge (from the design spec)?_

## UI / design

- [x] Don't underline the name in the footer (brand lockup, not a text link). _(Phase 0)_
- [ ] **Theme toggle:** add a light / dark / **system** control (today the site only follows `prefers-color-scheme`). Persist without cookies (localStorage), apply pre-paint to avoid a flash. _(Targeting Phase 1/2 with the reader controls.)_

## Snags

- [x] **Contact form:** the "Your name" input rendered far too tall at mid-to-large widths (~820px+, before the two-column row collapses). The email column carries a helper note beneath its input, so the stretched grid pulled the name input to match. Fixed with `align-items: start` on `.contact__row` (#8).
- [ ] **Header nav overflows on narrow screens.** At ~375px the primary nav ran off the right edge (HOME / ABOUT / DHARMA… clipped). Fixed on the responsive/theme branch (touch-friendly disclosure menu); pending its own PR.

## How to add to this list

Tell Claude the change; it gets recorded here and, if durable, in project memory.

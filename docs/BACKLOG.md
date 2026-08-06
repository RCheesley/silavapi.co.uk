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

## Snags (bugs to fix)

- [ ] **Contact form: "Your name" input balloons tall at mid widths.** On the
      two-column form row (roughly 820px and up, before the field stack
      collapses), the "Your name" input renders far too tall and looks dropped
      down next to "Email address". Cause: `.contact__row` is a `1fr 1fr` grid
      with the default `align-items: stretch`; the email column is taller (it
      carries the "Only used to reply to you" helper note), so the name column
      stretches to match and its input fills the extra height. Fix: set
      `align-items: start` on `.contact__row` (in `src/assets/css/pages.css`).
      _(Reported by Ruth, 2026-08-06; verified at 900px.)_
- [x] **Header nav overflows on narrow screens.** At ~375px the primary nav
      ran off the right edge (HOME / ABOUT / DHARMA… clipped). Fixed by wrapping
      the header + nav below 820px so every item stays visible. _(Observed while
      checking the contact snag, 2026-08-06; fixed on `responsive-mobile-pass`.)_

## How to add to this list

Tell Claude the change; it gets recorded here and, if durable, in project memory.

# Cookie register

**Target: zero cookies.** The site is built so that no cookies are set at all,
which is why there is **no consent banner** - there is nothing to consent to.

This file is the running record of every cookie the site sets, why, and its
lifetime. It is kept accurate as the site grows; a change that introduces a
cookie must add a row here and explain the justification in its pull request.

## Cookies currently set

| Cookie   | Set by | Purpose | Type | Lifetime |
| -------- | ------ | ------- | ---- | -------- |
| _(none)_ | -      | -       | -    | -        |

**Current count: 0.**

## How this is enforced

- **No analytics cookies.** Analytics run at Cloudflare's edge (aggregate, no
  client script, no identifiers) - see [`OPEN_SOURCE.md`](OPEN_SOURCE.md).
- **No third-party embeds.** A strict `Content-Security-Policy`
  (`default-src 'self'`) blocks anything that could set a third-party cookie.
- **Automated check.** The Playwright privacy suite
  (`tests/e2e/privacy.spec.js`) asserts, on every page in both colour schemes,
  that `document.cookie` is empty and that no cookies exist in the browser
  context. CI fails if any cookie appears.

## Client-side storage that is _not_ a cookie

For completeness (these are not cookies, are not sent to any server, and do not
track anyone), the following browser storage may be used:

| Key                 | Storage        | Purpose                                                                                                                                    | Introduced        |
| ------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| `reader-text-size`  | `localStorage` | Remembers the reader's chosen article text size (17 / 19 / 21px) on their own device only                                                  | In use (Phase 2)  |
| `mastodon-instance` | `localStorage` | Remembers the reader's own Mastodon instance so the "Share on Mastodon" link works next time. Device-only, never transmitted.              | In use (Phase 3)  |
| `theme`             | `localStorage` | Remembers the reader's colour-theme choice (light / dark / system). Device-only, never transmitted; with none set the site follows the OS. | In use (Phase 5+) |

`localStorage` values stay on the visitor's device, are never transmitted, and
carry no identifier. They are noted here in the spirit of full transparency.

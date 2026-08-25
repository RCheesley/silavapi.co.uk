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
| Node version           | from `.nvmrc` (24) - set `NODE_VERSION=24` if needed |

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

## Contact form

`functions/api/contact.js` (a Cloudflare Pages Function) receives the POST,
screens it (honeypot + time-trap, no CAPTCHA - `lib/contact.js`), validates it,
sends **one** email server-side, and 303-redirects to `/thank-you/`. With
JavaScript the form posts via `fetch` and the result is announced inline; without
JavaScript the native POST + redirect does the same job. Spam is silently
accepted (redirected like a success) so bots get no signal.

**Email delivery is a deployment decision - it is not wired until you set these
Cloudflare environment variables** (the handler returns a 503 until then, and
there is no traffic before go-live):

| Variable         | Example                                             | Notes                           |
| ---------------- | --------------------------------------------------- | ------------------------------- |
| `CONTACT_TO`     | `hello@silavapi.co.uk`                              | where messages land             |
| `CONTACT_FROM`   | `silavapi.co.uk contact form <form@silavapi.co.uk>` | a verified sender on the domain |
| `RESEND_API_KEY` | _(secret)_                                          | the provider API key            |

The default targets **[Resend](https://resend.com)** (simple API, EU region, DPA
available). **Choosing the provider is Ruth's call**: whoever sends the mail
becomes a **data processor** for contact messages, so pick one with an EU region
and a Data Processing Agreement, and note it on the privacy page. To use a
different provider, swap the `deliverEmail` function in
`functions/api/contact.js` - everything else is provider-agnostic. Keep the
credential in Cloudflare only; never in the repo.

### Anti-spam

The form always runs a honeypot, a JS time-trap, and content heuristics (links
in the name, link markup, many links, predominantly-Cyrillic text, and
"add me to your list / newsletter" requests) with no configuration. Two optional
variables enable an extra **Project Honeypot [http:BL](https://www.projecthoneypot.org/httpbl_api.php)**
IP-reputation check on submit:

| Variable            | Example    | Notes                                                                 |
| ------------------- | ---------- | --------------------------------------------------------------------- |
| `HTTPBL_ACCESS_KEY` | _(secret)_ | free 12-letter key from projecthoneypot.org; absent = check disabled  |
| `HTTPBL_MIN_THREAT` | `25`       | optional; threat score (0-255) at/above which a suspicious IP is spam |

The lookup is **server-side only** (DNS-over-HTTPS from the function - no browser
request, no cookie) and **fails open**: a missing key, an IPv6 client (http:BL is
IPv4-only), or any lookup error simply skips the check so a genuine message is
never dropped. A confirmed spam IP is silently accepted (like the honeypot) and
never emailed. Because the visitor's IP is shared with Project Honeypot's DNS on
submit, note the check on the privacy page. The **blog comment endpoint uses the
same `HTTPBL_ACCESS_KEY`** (its "comment spammer" listing type is exactly that
traffic) plus the Cyrillic heuristic. Recommended alongside them (dashboard, no
code): Cloudflare **Bot Fight Mode** and a **rate-limit rule** on
`POST /api/contact` and `POST /api/comment`.

## Blog comments

Comments are file-based and moderated, and **unapproved comments never reach
`main`** (so they never rebuild or appear on the live site).

**Flow.** A reader posts → `functions/api/comment.js` validates + spam-checks it,
then commits the comment as `src/_data/comments/<post-slug>/<id>.json` to a
**holding branch** (`comments-pending`, created from `main` automatically if it
doesn't exist), and emails you **one-click Approve and Reject links**:

- **Approve** (`functions/api/moderate.js`) writes the file to `main` with
  `approved: true` (which rebuilds and publishes it) and removes it from the
  queue.
- **Reject** deletes the pending file — it never touches `main`.

Replies are the same flow with a `parent` id; the build threads them. The
commenter's email is **never stored** (it only rides along in the moderation
email so you can reply personally). HMAC-signed links; honeypot + time-trap
spam defence (obvious bot spam is dropped without being stored at all).

**Spam that slips past the bot checks** simply sits unapproved on
`comments-pending` (never on `main`, never shown). Reject it from the email, or
delete the file on the pending branch — either way it costs no production build.

**Keeping the queue current.** `.github/workflows/sync-comments-pending.yml`
merges `main` into `comments-pending` nightly (and creates the branch if
missing), so the queue doesn't drift from the live content. It uses the built-in
Actions token — no setup needed.

Like the contact form, this is inert until you set the Cloudflare env vars
(the handler returns 503, and the form still validates client-side):

| Variable                | Example                    | Notes                                                        |
| ----------------------- | -------------------------- | ------------------------------------------------------------ |
| `GITHUB_TOKEN`          | _(secret)_                 | fine-grained PAT, **Contents: read/write** on this repo only |
| `GITHUB_REPO`           | `RCheesley/silavapi.co.uk` | `owner/name`                                                 |
| `GITHUB_BRANCH`         | `main`                     | optional, defaults to `main` (the published branch)          |
| `GITHUB_PENDING_BRANCH` | `comments-pending`         | optional, defaults to `comments-pending` (the queue)         |
| `COMMENT_SECRET`        | _(secret)_                 | random string; signs the approve/reject links (HMAC)         |
| `SITE_URL`              | `https://silavapi.co.uk`   | used to build the moderation links                           |

Reuses `RESEND_API_KEY` / `CONTACT_TO` / `CONTACT_FROM` (above) for the
notification email. Create the token at GitHub → Settings → Developer settings →
**Fine-grained tokens**, scoped to this repo with **Contents: Read and write**,
then add all of the above under Cloudflare Pages → Settings → Environment
variables (mark the token + secret as **encrypted**).

### Abuse hardening

Comment endpoints attract spam, so the system is defended in layers:

- **Nothing publishes without a click** (approve-first) and unapproved comments
  never reach `main`, so spam can't appear on the live site.
- **Honeypot + time-trap** drop obvious bots without storing anything, and
  **content heuristics** catch the rest of the usual comment spam - a URL in the
  name field, or more than two links in the body - before it is stored or
  emailed.
- **Bounded requests** - an oversized POST body is rejected before it is parsed
  (a `Content-Length` cap), and a non-form body returns `400` rather than an
  uncaught `500`.
- **Moderation is POST-behind-a-confirmation** (`/api/moderate` GET only shows a
  confirm page) so email/link scanners that issue GET requests can't auto-approve
  or auto-reject. Links are **HMAC-signed** (unforgeable without `COMMENT_SECRET`)
  and **expire 30 days after they are issued** (the timestamp is part of the
  signed payload), so a link left in a stale or compromised inbox goes dead on
  its own; rotating `COMMENT_SECRET` voids every outstanding link at once.
- **Stored content is escaped** at render (no HTML from commenters), the
  commenter email is never stored, paths are validated (no traversal), and the
  redirect `Location` is CR/LF-sanitised.

**Why the approve/reject links can't be forged.** The repo is public, so anyone
can see a pending comment's `slug` and `id` and work out the moderation URL
shape (`/api/moderate?action=approve&slug=…&id=…&sig=…`). That is deliberately
harmless: the link also carries `sig`, an **HMAC-SHA256 of `action:slug:id`
keyed on `COMMENT_SECRET`**, and `/api/moderate` refuses to act (on both GET and
POST) unless `sig` verifies — a signature-mismatch returns `403`. `COMMENT_SECRET`
lives only in Cloudflare's encrypted env; it is never in the repo, the built
site, the client JS, or the comment files, so an attacker cannot compute a valid
`sig`, and the signature is verified with a length guard plus a constant-time compare. Nor can the key be attacked offline: a
valid signature only ever appears in the moderation email to you, never in
public, so there is no `(payload, signature)` pair to brute-force against. Use a
high-entropy random secret (e.g. `openssl rand -base64 32`) so that recovering it
is infeasible even in the worst case. Security rests on the secret alone, not on
the URL structure being hidden - the standard signed-URL
pattern (password-reset links, webhook signatures). If the secret ever leaked,
rotate it in Cloudflare and every outstanding link is instantly void.

**Required at go-live — a Cloudflare rate-limit rule on `/api/comment`.** The one
thing the code can't do statelessly is stop a flood (each accepted POST is a
GitHub commit + an email). Add a WAF **Rate limiting rule**: path equals
`/api/comment`, method `POST`, e.g. **5 requests / minute per IP**, action
_Block_. This is cookie-free, needs no JS, and stops flood abuse at the edge.

**Optional escalation if spam persists — Cloudflare Turnstile.** A privacy-
respecting, no-tracking bot challenge (largely invisible). It is the strongest
content-level defence, but it loads a script from `challenges.cloudflare.com`
(a CSP `script-src`/`frame-src` addition and a departure from the strict
own-origin CSP), so it is a deliberate trade-off — enable it only if the
rate-limit rule and moderation prove insufficient.

## The old domain

`ruthcheesley.co.uk` is kept serving **301 redirects indefinitely** to the new
home of each URL, and `/feed.xml` stays stable with a redirect from the old feed.
Set this up in Cloudflare with a **Bulk Redirect** (or a redirect rule)
`https://ruthcheesley.co.uk/* -> https://silavapi.co.uk/$1 (301)`; the per-URL
path map already lives in `src/_redirects` on the new zone. The Notist speaking
subdomain (`speaking.ruthcheesley.co.uk`) should 301 to `https://silavapi.co.uk/speaking/`
once the in-house Speaking section is live.

## CI → deploy

The site deploys to Cloudflare Pages by **direct upload from CI** (Wrangler),
not by connecting Cloudflare to the Git repo — so Cloudflare never needs write
access to GitHub. `.github/workflows/ci.yml` runs the full gauntlet (lint, unit
tests with coverage, build, HTML validation, e2e, pa11y and Lighthouse) on every
push and PR. On a **push to `main`**, the daily **schedule**, or a manual
dispatch, a `deploy` job then builds and runs `wrangler pages deploy _site` once
`verify` is green. Pull requests are verified but never deployed.

This is what makes an approved comment (a commit to `main`) and a date-gated talk
announcement (the daily schedule) publish themselves — no manual step. It needs
two repository secrets:

| Secret                  | Where to get it                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare → My Profile → API Tokens → Create Token → **Account · Cloudflare Pages · Edit** (scoped to your account) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard (Workers & Pages overview), or `wrangler whoami`                                                |

The first project + deploy were created with `wrangler pages project create
silavapi` and `wrangler pages deploy _site`; CI simply repeats the deploy step.
To deploy by hand in a pinch: `npm run build && npx wrangler pages deploy _site
--project-name silavapi --branch main`.

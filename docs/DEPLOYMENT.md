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

## Blog comments

Comments are file-based and moderated. A reader posts on a blog post →
`functions/api/comment.js` validates + spam-checks it, then **commits a pending
file** to the repo at `src/_data/comments/<post-slug>/<id>.json` (via the GitHub
API) and emails you a **one-click approve link**. Clicking it
(`functions/api/approve.js`) flips `approved: true` and commits, triggering a
rebuild that publishes the comment. Replies are the same flow with a `parent`
id; the build threads them. No cookies, no third party, and the commenter's
email is **never stored** (it only rides along in the moderation email so you
can reply personally).

Like the contact form, this is inert until you set the Cloudflare env vars
(the handler returns 503, and the form still validates client-side):

| Variable         | Example                    | Notes                                                        |
| ---------------- | -------------------------- | ------------------------------------------------------------ |
| `GITHUB_TOKEN`   | _(secret)_                 | fine-grained PAT, **Contents: read/write** on this repo only |
| `GITHUB_REPO`    | `RCheesley/silavapi.co.uk` | `owner/name`                                                 |
| `GITHUB_BRANCH`  | `main`                     | optional, defaults to `main`                                 |
| `COMMENT_SECRET` | _(secret)_                 | random string; signs the approve links (HMAC)                |
| `SITE_URL`       | `https://silavapi.co.uk`   | used to build the approve link                               |

Reuses `RESEND_API_KEY` / `CONTACT_TO` / `CONTACT_FROM` (above) for the
notification email. Create the token at GitHub → Settings → Developer settings →
**Fine-grained tokens**, scoped to this repo with **Contents: Read and write**,
then add all of the above under Cloudflare Pages → Settings → Environment
variables (mark the token + secret as **encrypted**).

To moderate without the email you can also flip `approved` to `true` directly in
the file on GitHub. Unapproved comment files are harmless (never rendered); prune
any spam files at your leisure.

## The old domain

`ruthcheesley.co.uk` is kept serving **301 redirects indefinitely** to the new
home of each URL, and `/feed.xml` stays stable with a redirect from the old feed.
Set this up in Cloudflare with a **Bulk Redirect** (or a redirect rule)
`https://ruthcheesley.co.uk/* -> https://silavapi.co.uk/$1 (301)`; the per-URL
path map already lives in `src/_redirects` on the new zone. The Notist speaking
subdomain (`speaking.ruthcheesley.co.uk`) should 301 to `https://silavapi.co.uk/speaking/`
once the in-house Speaking section is live.

## CI → deploy

CI (`.github/workflows/ci.yml`) must be green before merge. Cloudflare Pages
builds and deploys from `main` on merge (and gives every PR a preview URL).

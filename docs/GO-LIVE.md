# Go-live runbook

An ordered launch checklist for **silavapi.co.uk**. Detail for each item lives in
[`DEPLOYMENT.md`](DEPLOYMENT.md); this is the sequence to follow on the day.

Legend: 🧑 = your action (account/DNS/secrets) · ✅ = already done in the code.

## 0. Pre-flight (code) ✅

The build is certified by the CI gauntlet (`npm run test`): unit + **100%
library coverage**, Eleventy + Pagefind build, HTML validation, Playwright e2e
(light + dark), pa11y, and Lighthouse (accessibility gate = 100). All the
launch plumbing ships in the repo:

- Strict CSP + HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-*` (`src/_headers`).
- `robots.txt`, `sitemap.xml`, RSS `feed.xml`, and the old-Joomla-path 301 map
  (`src/_redirects`, 115 entries).
- Contact + comment Pages Functions that **fail safe** (return 503) until their
  env vars exist, so nothing breaks before you configure them.
- Daily `scheduled-rebuild` (publishes date-gated talks) and nightly
  `sync-comments-pending` workflows.

## 1. Cloudflare Pages project 🧑

- [ ] Create a Pages project connected to the `RCheesley/silavapi.co.uk` repo,
      production branch `main`.
- [ ] Build command `npm run build`; output directory `_site`; set
      `NODE_VERSION` to match `.nvmrc` if the default is older.
- [ ] Confirm the first build succeeds (it will build without any secrets — the
      Functions just stay inert).

## 2. Email delivery — Resend 🧑

- [ ] Create a Resend account and **verify the sending domain** (add the DKIM/SPF
      records to DNS). Pick the EU region and accept the DPA (data-processor note
      on the privacy page).
- [ ] Add Cloudflare Pages env vars: `RESEND_API_KEY`, `CONTACT_TO`
      (`hello@silavapi.co.uk`), `CONTACT_FROM` (a verified sender on the domain).

## 3. Comments 🧑

- [ ] Create a **fine-grained GitHub token** scoped to this repo, **Contents:
      read/write** only. Add as `GITHUB_TOKEN`.
- [ ] Add `GITHUB_REPO` (`RCheesley/silavapi.co.uk`), `COMMENT_SECRET` (a random
      string), `SITE_URL` (`https://silavapi.co.uk`). (`GITHUB_BRANCH` /
      `GITHUB_PENDING_BRANCH` default sensibly.)
- [ ] **Required — abuse rule:** add a Cloudflare WAF **Rate limiting rule** on
      `POST /api/comment`, e.g. **5 requests/minute per IP → Block**. This is the
      one thing the stateless code can't do; it stops comment-spam floods at the
      edge. (Turnstile is documented as an optional escalation if needed.)

## 4. Scheduled rebuild hook 🧑

- [ ] Create a Pages **Deploy Hook** and add its URL as the repo secret
      `CLOUDFLARE_DEPLOY_HOOK`. Until set, the daily rebuild job is a harmless
      no-op; with it, date-scheduled talk announcements publish themselves.

## 5. Custom domain + DNS 🧑

- [ ] Add `silavapi.co.uk` (and `www`, redirecting to the apex) as a custom
      domain on the Pages project; let Cloudflare provision the certificate.
- [ ] Point the domain's DNS at Pages (proxied / orange-cloud).

## 6. Old-domain redirects 🧑

- [ ] Cloudflare **Bulk Redirect** (or redirect rule):
      `https://ruthcheesley.co.uk/*` → `https://silavapi.co.uk/$1` (301). The
      per-URL Joomla path map already lives in `src/_redirects` on the new zone.
- [ ] Redirect the Notist subdomain `speaking.ruthcheesley.co.uk` →
      `https://silavapi.co.uk/speaking/` (301).

## 7. Analytics 🧑

- [ ] Enable **Cloudflare Web Analytics** in the zone's server-side/edge mode
      (no client script, no cookies, no third-party request). Nothing is added
      to the pages.

## 8. Launch ✅🧑

- [ ] With the above in place, a push/merge to `main` builds and deploys. Confirm
      the deploy is green and the site loads on `https://silavapi.co.uk`.

## 9. Post-launch smoke test 🧑

- [ ] Home, About, Dharma, Speaking, Blog, Contact all load; dark/light toggle
      persists; header collapses to the menu on mobile with no overflow.
- [ ] **Contact form** sends (you receive the email) and shows the inline success.
- [ ] **Comment** on a post: you get the moderation email, the **Approve** link
      shows the confirm page, and after confirming the comment appears on rebuild.
- [ ] **Search** (header icon + blog) returns results.
- [ ] Spot-check a few **old URLs** 301 to the right new pages; check `/feed.xml`,
      `/sitemap.xml`, `/robots.txt`, and a 404.

## Rollback

Cloudflare Pages keeps every deployment — if anything looks wrong, roll back to
the previous deployment in the dashboard while you investigate. The old Joomla
site can stay up (behind the redirect) until you're confident.

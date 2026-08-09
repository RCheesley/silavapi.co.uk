# Security Policy

I take the security and privacy of this site seriously - it handles reader
messages and comments, so I would much rather hear about a problem than not.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Instead, report privately using GitHub's
[private vulnerability reporting](https://github.com/RCheesley/silavapi.co.uk/security/advisories/new),
or email **hello@silavapi.co.uk** with enough detail to reproduce the issue.

Please give me a reasonable chance to fix it before disclosing it publicly. I
will acknowledge your report, keep you updated, and credit you if you would like
(and if the report is valid). This is a personal project, so there is no bug
bounty - just my genuine thanks.

## Scope

In scope:

- The live site at `silavapi.co.uk`
- The serverless functions under `functions/` - the contact form and the
  file-based comment system
- The build and migration tooling in this repository

Out of scope:

- Third-party services this site relies on (Cloudflare, Resend, GitHub) - please
  report those to the relevant provider
- Findings that require a compromised device, browser, or email account to
  exploit
- Missing hardening headers with no demonstrable impact, and volumetric
  denial-of-service testing (please do not run it against the live site)

## Good to know

Some things are deliberate by design rather than bugs:

- There are no cookies, no client-side analytics, and no third-party requests.
- Reader email addresses are never stored in this public repository. Comments
  are moderated before anything appears on the site.
- Comment moderation links are cryptographically signed and expire, and the
  signing secret can be rotated as a kill switch.

If you think any of the above is not behaving as described, that is exactly the
kind of report I want.

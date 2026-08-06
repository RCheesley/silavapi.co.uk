# Scope: bringing "Speaking" in-house (replacing Notist)

Ruth's speaking site (`speaking.ruthcheesley.co.uk`) runs on **Notist**. This
scopes replacing it with a first-party `/speaking/` section on silavapi.co.uk.

## What Notist gives today

- Speaker profile (bio, photo, topics) + a **presentations** list.
- **78 talks**, each a page with: title, event, date, abstract, **slides**
  (slide images hosted on `on.notist.cloud`), **resources** (links), and
  sometimes a **video** link.
- An **interactive map** of where Ruth has spoken.
- **Scheduled talk announcements** (Pro): announce an upcoming talk with a cover
  image + title, set to publish automatically on a chosen date.
- Nice-to-haves: automatic per-talk share images, a private CFP/submission
  tracker, frictionless slide upload, and a **speaker-discovery directory**
  (event organisers browse Notist to find speakers).

_(Ruth has a Notist **Pro** account; docs: https://docs.noti.st/guide/)_

- Downsides today: the pages load **Google Tag Manager** and third-party assets
  from `on.notist.cloud` - i.e. trackers + third-party requests, the exact
  things this new site is built to avoid.

## What we'd build (a new content type, mirroring the blog)

- **`/speaking/`** - a speaker profile: bio, the rider, headshots, topics and
  formats (talk / workshop / keynote / panel), and a contact CTA.
- A **talks collection**: each talk a Markdown file with front matter
  (`title, event, date, location, abstract, video, slides, resources[], tags`),
  rendered with a talk template + an upcoming/past index. This is the same
  pattern as the blog, so it's well-trodden here.
- Privacy-respecting media (per the site's rules):
  - **Video** → a click-to-load poster or a plain outbound link (no embeds).
  - **Slides** → see the decision below.
- **Map of talks** → a **self-hosted inline SVG world map** with a plotted point
  per talk location (from each talk's `location`/coords in front matter), hover/
  focus tooltips. This is the privacy-clean equivalent of Notist's map: most map
  widgets (Google Maps, Mapbox, Leaflet + OSM tiles) make third-party requests
  and often set cookies - a static SVG makes none. Fully on-brand.
- **Upcoming talks + scheduled announcements** → talks carry a `date` (and
  optional `cover` image); a template lists **Upcoming** vs **Past**. "Publish on
  a date" is handled by a **daily scheduled rebuild** (a GitHub Actions cron, or
  Cloudflare Pages scheduled deploy) plus Eleventy date-filtering, so an
  announced talk appears on its date without a manual deploy.

## The one real decision: slides

Notist hosts each deck as ~20-40 slide images. Replicating that first-party for
78 talks means **thousands of images / hundreds of MB** in the repo - heavy and
high-maintenance. Three options:

| Option                       | What it is                                      | Weight                                         | Recommendation                         |
| ---------------------------- | ----------------------------------------------- | ---------------------------------------------- | -------------------------------------- |
| A. Self-host slide images    | Download every slide image, show a viewer       | Heavy (100s MB, every new talk = many uploads) | Only if slide-level browsing matters   |
| B. **Per-talk PDF download** | One self-hosted PDF per talk, "Download slides" | Lean, fully owned, privacy-clean               | **Recommended**                        |
| C. Link out to slides        | Link to wherever the deck lives                 | Leanest                                        | If you don't want to host decks at all |

## Trade-offs

**For bringing it in-house**

- **Digital sovereignty** - this is literally Ruth's topic; owning the talks and
  dropping Google Tag Manager / third-party assets is walking the talk.
- One site, one design, full control; no dependence on a third-party service.

**Against / costs**

- Loss of Notist's **speaker-discovery directory** (a genuine reach/marketing
  channel for inbound speaking invites).
- Loss of Notist conveniences (CFP tracker, one-click slide upload, auto share
  images).
- **Migration**: ~78 talks to pull across (scrape Notist → Markdown), plus
  whichever slide approach.
- Ongoing: adding a talk becomes "write Markdown + attach a PDF" rather than
  Notist's polished flow.

## Recommendation

**Yes, it's a viable and very on-brand option** - best done as its own phase
**after go-live** (call it Phase 5). Suggested shape:

1. Build the `/speaking/` profile + talks section (talk content type + templates),
   incl. the **self-hosted SVG talks map** and the **Upcoming/Past** split.
2. Migrate the 78 Notist talks (title/event/date/location/abstract/resources/
   video link + cover images).
3. Slides via **option B** (per-talk PDF) to stay lean and fully owned.
4. Add a **daily scheduled rebuild** (GitHub Actions cron / Cloudflare scheduled
   deploy) so date-scheduled talk announcements publish themselves.
5. Keep a lightweight profile on Notist purely as a discovery pointer if the
   directory reach still matters - or drop it entirely for full sovereignty.

Effort: roughly one build phase (section + templates + SVG map + scheduled
rebuild) + one migration pass (78 talks), comparable to Phases 2-3. Everything
Notist Pro does here has a privacy-clean first-party equivalent **except** the
speaker-discovery directory - that's the one thing you'd trade away.

## Migration result (Phase 5, built 2026-08-06)

Scraped all **78 Notist presentations** into first-party content:

- **47 talks** (58 presentations) at `/speaking/<slug>/`, and **18 podcasts /
  interviews** at `/speaking/podcasts/<slug>/`. Repeat talks are merged into one
  page carrying an `events[]` array; the archive lists each presentation
  separately and the map lights up all **16 countries**.
- **Slides**: rebuilt from Notist's slide images into lean self-hosted PDFs -
  **~1.3GB of original decks became ~62MB** (30 PDFs) plus 35 covers (~2.7MB),
  fully owned, no Notist dependency. (Ruth chose "rebuild lean PDFs, self-host".)
- Curated topic tags (matching the blog's), resources, and self-hosted covers
  captured per talk. Social "buzz" is left for Ruth to add per talk.
- Tooling: `scripts/migrate/scrape-notist.mjs` (metadata, resumable/paced) +
  `scripts/migrate/build-slide-assets.mjs` (slide PDFs + covers, resumable, with
  a reconcile/prune pass). Talk URLs live in gitignored `migration/talk-urls.txt`.

Decisions taken with Ruth (2026-08-06): rebuild lean self-hosted PDFs; separate
podcasts/interviews from stage talks; merge repeat talks but list every
presentation in the archive.

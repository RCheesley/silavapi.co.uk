/**
 * Shared front matter for podcasts / interviews / community-update videos in
 * src/podcasts/. These are media appearances rather than stage talks, so they
 * live at /speaking/podcasts/<slug>/ and are kept out of the talks stat + map.
 * They reuse the talk layout, which adapts to a missing `format`.
 */
export default {
  layout: 'layouts/talk.njk',
  permalink: '/speaking/podcasts/{{ page.fileSlug }}/',
  navActive: 'speaking',
  kind: 'podcast',
};

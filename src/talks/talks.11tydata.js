/**
 * Shared front matter for every talk in src/talks/. Each talk renders through
 * the talk layout at /speaking/<file-slug>/. Talks are collected by glob (not
 * by a `tags` collection) so the per-talk `tags` field stays free for topics.
 */
export default {
  layout: 'layouts/talk.njk',
  permalink: '/speaking/{{ page.fileSlug }}/',
  navActive: 'speaking',
};

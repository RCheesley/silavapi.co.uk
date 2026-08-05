/**
 * Global site metadata. Placeholders flagged `TODO(ruth)` are confirmed before
 * go-live (see BUILD_SPEC "Open items").
 */
export default {
  name: 'Sīlavāpi',
  legalName: 'Ruth Cheesley',
  // Kept in metadata for findability during the name transition.
  alternateName: 'Ruth Cheesley',
  url: 'https://silavapi.co.uk',
  lang: 'en-GB',
  locale: 'en_GB',
  description:
    'The personal site of Sīlavāpi (formerly Ruth Cheesley) — Buddhism and dharma life, open source, digital sovereignty, and living actively with EDS.',
  tagline: 'Open source is where I found a home for that drive to connect.',
  author: {
    name: 'Sīlavāpi (Ruth Cheesley)',
    // TODO(ruth): confirm the real address before go-live.
    email: 'hello@silavapi.co.uk',
  },
  social: {
    // TODO(ruth): confirm the real Mastodon handle before go-live.
    mastodon: { handle: '@silavapi', url: 'https://mastodon.social/@silavapi' },
    linkedin: { url: 'https://www.linkedin.com/in/ruthcheesley/' },
    // TODO(ruth): confirm whether speaking.ruthcheesley.co.uk also migrates.
    speaking: { url: 'https://speaking.ruthcheesley.co.uk/', external: true },
    rss: { url: '/feed.xml' },
  },
  // The privacy pledge shown in the footer + used on the privacy page.
  privacyPledge:
    'This site sets no cookies, runs no trackers, and loads nothing from third parties.',
};

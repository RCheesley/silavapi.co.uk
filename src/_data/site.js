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
    'The personal site of Sīlavāpi (formerly Ruth Cheesley) - Buddhism and dharma life, open source, digital sovereignty, and living actively with EDS.',
  tagline: 'Open source is where I found a home for that drive to connect.',
  author: {
    name: 'Sīlavāpi (Ruth Cheesley)',
    email: 'hello@silavapi.co.uk',
  },
  social: {
    mastodon: { handle: '@rcheesley', url: 'https://mastodon.online/@rcheesley' },
    linkedin: { url: 'https://www.linkedin.com/in/ruthcheesley/' },
    // Speaking is now a first-party section (Phase 5), replacing the Notist site.
    speaking: { url: '/speaking/', external: false },
    rss: { url: '/feed.xml' },
  },
  // The privacy pledge shown in the footer + used on the privacy page.
  privacyPledge:
    'This site sets no cookies, runs no trackers, and loads nothing from third parties.',
};

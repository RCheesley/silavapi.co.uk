/**
 * world-map.js - render a self-hosted inline SVG world map, highlighting the
 * countries a set of talks were given in. No third-party tiles/scripts/cookies
 * (the privacy-clean equivalent of Notist's map). Country paths from the
 * @svg-maps/world package (CC-BY-4.0; attributed in docs/OPEN_SOURCE.md).
 */
import world from '@svg-maps/world';

const MAP = world.default || world;

// Escape text before placing it inside SVG/XML markup (country names may carry
// & < > etc.). Applied to <title> content so the markup can't be broken.
const escapeXml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * @param {string[]} highlight - ISO alpha-2 country codes to highlight (any case)
 * @returns {string} inline SVG markup
 */
export function renderTalksMap(highlight = []) {
  const set = new Set((highlight || []).map((s) => String(s).toLowerCase()));
  const paths = MAP.locations
    .map((loc) => {
      const on = set.has(loc.id);
      const cls = on ? 'talks-map__country is-active' : 'talks-map__country';
      const title = on ? `<title>${escapeXml(loc.name)}</title>` : '';
      return `<path d="${loc.path}" class="${cls}">${title}</path>`;
    })
    .join('');
  const noun = set.size === 1 ? 'country' : 'countries';
  return (
    `<svg class="talks-map__svg" viewBox="${MAP.viewBox}" role="img" ` +
    `aria-label="World map highlighting the ${set.size} ${noun} where these talks were given">` +
    `${paths}</svg>`
  );
}

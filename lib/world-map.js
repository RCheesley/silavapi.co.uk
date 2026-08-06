/**
 * world-map.js - render a self-hosted inline SVG world map, highlighting the
 * countries a set of talks were given in. No third-party tiles/scripts/cookies
 * (the privacy-clean equivalent of Notist's map). Country paths from the
 * ISC-licensed @svg-maps/world package.
 */
import world from '@svg-maps/world';

const MAP = world.default || world;

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
      const title = on ? `<title>${loc.name}</title>` : '';
      return `<path d="${loc.path}" class="${cls}">${title}</path>`;
    })
    .join('');
  return (
    `<svg class="talks-map__svg" viewBox="${MAP.viewBox}" role="img" ` +
    `aria-label="World map highlighting the ${set.size} countries where these talks were given">` +
    `${paths}</svg>`
  );
}

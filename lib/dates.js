/**
 * Date helpers, kept as pure functions so they can be unit-tested and reused by
 * both eleventy.config.js and templates. British rendering throughout.
 */

/** Coerce a Date | string | number to a Date (UTC-safe). */
export function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Render a date as "03 March, 2025" (day zero-padded, full month name, en-GB).
 * @param {Date|string|number} value
 * @returns {string}
 */
export function readableDate(value) {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) throw new TypeError(`readableDate: invalid date "${value}"`);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = d.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
  return `${day} ${month}, ${d.getUTCFullYear()}`;
}

/**
 * Render a date as an ISO-8601 string (used for <time datetime> and sitemaps).
 * @param {Date|string|number} value
 * @returns {string}
 */
export function isoDate(value) {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) throw new TypeError(`isoDate: invalid date "${value}"`);
  return d.toISOString();
}

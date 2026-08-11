/**
 * Date helpers, kept as pure functions so they can be unit-tested and reused by
 * both eleventy.config.js and templates. British rendering throughout.
 */

/**
 * Coerce a Date | string | number to a Date.
 *
 * Note on timezones: date-only ISO strings ("2025-03-03") and Z-qualified
 * strings parse as UTC, so the UTC-based formatters below are stable for them.
 * A timezone-less date-TIME string ("2025-03-03T12:00:00") is parsed in the
 * host's local zone by the platform and can shift the UTC day - pass a Date, a
 * date-only string, or a timezone-qualified string to avoid that.
 */
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
 * Render a date as an ISO-8601 UTC string with second precision and no
 * milliseconds, e.g. "2025-03-03T09:30:00Z". This is the W3C Datetime format
 * sitemaps.org specifies for <lastmod>; Google Search Console rejects the
 * millisecond form (…".000Z") that Date.toISOString() produces as an invalid
 * date. Also valid for <time datetime>.
 * @param {Date|string|number} value
 * @returns {string}
 */
export function isoDate(value) {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) throw new TypeError(`isoDate: invalid date "${value}"`);
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

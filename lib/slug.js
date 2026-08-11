/**
 * URL-slug helpers, kept pure so they can be unit-tested and shared by both
 * eleventy.config.js (building category pages + their links) and templates.
 */

/**
 * Slugify a blog category name for use in a URL, e.g. "Digital Sovereignty" ->
 * "digital-sovereignty", "Being bendy" -> "being-bendy". Lower-cases, replaces
 * any run of non-alphanumeric characters with a single hyphen, and trims
 * leading/trailing hyphens. The same function is used to generate the category
 * page permalinks and the links that point at them, so they always match.
 * @param {string} value
 * @returns {string}
 */
export function categorySlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

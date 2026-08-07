/**
 * gallery.js - render an accessible image gallery as a captioned figure grid.
 * Used for the photo galleries recovered from the old Joomla site's JoomlArt
 * content-type articles. A responsive grid of figures, each image carrying its
 * migrated alt text (and an optional visible caption). Each image links to its
 * full-size file, which works with no JS and is progressively enhanced into a
 * lightbox by gallery-lightbox.js.
 */

/** Escape a string for safe placement in an HTML attribute or text node. */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {Array<{src:string, alt?:string, caption?:string}>} items
 * @returns {string} inline HTML for a <div> figure grid, or '' when empty
 */
export function renderGallery(items = []) {
  // Coerce to an array first: the shortcode may pass a non-array (e.g. a slug
  // that resolved to something odd via the prototype), which lacks .filter.
  const list = (Array.isArray(items) ? items : []).filter((it) => it && it.src);
  if (!list.length) return '';

  const figures = list
    .map((it) => {
      const src = escapeHtml(it.src);
      const alt = escapeHtml(it.alt || '');
      const caption =
        it.caption && String(it.caption).trim()
          ? `<figcaption class="gallery__caption">${escapeHtml(it.caption)}</figcaption>`
          : '';
      // The image is wrapped in a link to the full-size file: without JS this
      // opens the larger image; gallery-lightbox.js enhances it to an in-page
      // dialog. The link's accessible name comes from the image alt.
      return (
        `<figure class="gallery__figure">` +
        `<a class="gallery__link" href="${src}">` +
        `<img class="gallery__img" src="${src}" alt="${alt}" loading="lazy" decoding="async" /></a>` +
        `${caption}</figure>`
      );
    })
    .join('');

  // A div of self-describing <figure>s: each image carries its own alt text, so
  // no list semantics are needed (and role="list" would be redundant markup).
  return `<div class="gallery">${figures}</div>`;
}

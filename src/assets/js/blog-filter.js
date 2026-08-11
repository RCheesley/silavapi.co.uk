/**
 * blog-filter.js - progressive enhancement for the blog index.
 *
 * The category chips are real links to the static /blog/category/<slug>/ pages,
 * so they work (and are shareable) with no JavaScript. Where JS is available and
 * the full set of posts is on the page (the index carries data-blog-filterable),
 * this intercepts chip clicks to filter the already-rendered cards in place and
 * syncs the address bar to the same shareable category URL - so you get the
 * instant filter AND a link you can copy. Back/forward is handled via popstate.
 *
 * Only the index (blog.njk) loads this script; the static category pages do not,
 * so their chips are plain links that navigate. The data-blog-filterable guard
 * below is belt-and-braces - it keeps the script inert if it is ever included on
 * a page that is not the full, filterable post list. Full-text search is separate
 * (search.js). Without JS, every post is shown on the index.
 */
(function () {
  var grid = document.querySelector('[data-blog-grid]');
  var chipGroup = document.querySelector('[data-blog-chips]');
  var count = document.querySelector('[data-blog-count]');
  var empty = document.querySelector('[data-blog-empty]');
  if (!grid || !chipGroup || !grid.hasAttribute('data-blog-filterable')) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.article-card'));
  var chips = Array.prototype.slice.call(chipGroup.querySelectorAll('.chip'));

  function apply(category) {
    var shown = 0;
    cards.forEach(function (card) {
      var visible = category === 'All' || card.getAttribute('data-category') === category;
      card.hidden = !visible;
      if (visible) shown += 1;
    });

    chips.forEach(function (chip) {
      if (chip.getAttribute('data-category') === category) {
        chip.setAttribute('aria-current', 'page');
      } else {
        chip.removeAttribute('aria-current');
      }
    });

    if (count) {
      var label = shown + (shown === 1 ? ' post' : ' posts');
      if (category !== 'All') label += ' in ' + category;
      count.textContent = label;
    }
    if (empty) empty.hidden = shown !== 0;
  }

  // Which category does the current path represent? Match a chip's own href so
  // the mapping stays in one place (the markup), then fall back to "All".
  function categoryForPath(path) {
    for (var i = 0; i < chips.length; i += 1) {
      if (new URL(chips[i].href, window.location.origin).pathname === path) {
        return chips[i].getAttribute('data-category');
      }
    }
    return 'All';
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      // Leave modified clicks (open-in-new-tab, middle click, etc.) alone.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      // Re-clicking the active chip is a no-op: don't refilter or push a
      // duplicate history entry for the URL we're already on.
      if (chip.getAttribute('aria-current') === 'page') return;
      var category = chip.getAttribute('data-category');
      apply(category);
      if (window.history && window.history.pushState) {
        window.history.pushState({ category: category }, '', chip.href);
      }
    });
  });

  window.addEventListener('popstate', function () {
    apply(categoryForPath(window.location.pathname));
  });
})();

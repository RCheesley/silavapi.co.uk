/**
 * blog-filter.js - progressive enhancement for the blog index.
 * Filters the already-rendered post cards by category chip and announces the
 * result count politely. Full-text search is handled separately by the search
 * dialog (search.js), scoped to the blog. Without JS, every post is shown.
 */
(function () {
  var grid = document.querySelector('[data-blog-grid]');
  var chipGroup = document.querySelector('[data-blog-chips]');
  var count = document.querySelector('[data-blog-count]');
  var empty = document.querySelector('[data-blog-empty]');
  if (!grid || !chipGroup) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.article-card'));
  var chips = Array.prototype.slice.call(chipGroup.querySelectorAll('.chip'));
  var state = { category: 'All' };

  function apply() {
    var shown = 0;
    cards.forEach(function (card) {
      var visible =
        state.category === 'All' || card.getAttribute('data-category') === state.category;
      card.hidden = !visible;
      if (visible) shown += 1;
    });

    if (count) {
      var label = shown + (shown === 1 ? ' post' : ' posts');
      if (state.category !== 'All') label += ' in ' + state.category;
      count.textContent = label;
    }
    if (empty) empty.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      state.category = chip.getAttribute('data-category');
      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
      apply();
    });
  });
})();

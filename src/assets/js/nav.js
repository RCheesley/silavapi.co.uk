/**
 * nav.js - the narrow-screen menu toggle (progressive enhancement).
 * The full nav is always in the DOM; without JS it is shown in full. With JS,
 * CSS collapses it behind a menu button on narrow screens and this wires the
 * button up (aria-expanded + an is-open class, close on Escape / outside click).
 * The `js` class that flips the CSS is set pre-paint in theme.js, so there is no
 * flash of the expanded menu.
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('.site-nav');
    var btn = nav && nav.querySelector('.site-nav__toggle');
    if (!btn) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    // Close on Escape (returning focus to the button) and on an outside click.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        btn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
    });
  });
})();

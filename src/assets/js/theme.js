/**
 * theme.js - light / dark / system colour-theme control.
 * Loaded synchronously in <head> so a saved choice is applied before paint (no
 * flash). Persists the choice in localStorage (device-only, not a cookie, never
 * transmitted - see docs/COOKIES.md). With no choice saved, the site follows the
 * OS via CSS `prefers-color-scheme`, so it still themes correctly without JS.
 */
(function () {
  // Mark that JS is available (pre-paint, in <head>) so CSS can switch the nav
  // to a collapsible menu without a flash of the no-JS (fully expanded) layout.
  document.documentElement.classList.add('js');

  var KEY = 'theme';
  var ALLOWED = ['light', 'dark', 'system'];

  // Apply a mode by setting (or clearing) data-theme on <html>. "system" clears
  // the attribute so the CSS media query decides.
  function apply(mode) {
    var el = document.documentElement;
    if (mode === 'dark' || mode === 'light') el.setAttribute('data-theme', mode);
    else el.removeAttribute('data-theme');
  }

  function readSaved() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  // Pre-paint: apply the saved choice immediately.
  var saved = readSaved();
  var current = ALLOWED.indexOf(saved) !== -1 ? saved : 'system';
  apply(current);

  document.addEventListener('DOMContentLoaded', function () {
    var group = document.querySelector('.theme-toggle');
    if (!group) return;
    group.hidden = false; // reveal only when JS can drive it
    var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-theme-choice]'));

    function set(mode, persist) {
      current = mode;
      apply(mode);
      buttons.forEach(function (b) {
        b.setAttribute(
          'aria-pressed',
          b.getAttribute('data-theme-choice') === mode ? 'true' : 'false'
        );
      });
      if (persist) {
        try {
          localStorage.setItem(KEY, mode);
        } catch (e) {
          /* storage may be unavailable; the control still works for the session */
        }
      }
    }

    set(current, false);
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        set(b.getAttribute('data-theme-choice'), true);
      });
    });
  });
})();

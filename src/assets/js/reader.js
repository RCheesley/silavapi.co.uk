/**
 * reader.js - article reader text-size control.
 * Loaded in <head> on article pages so the saved size is applied before paint
 * (no flash). Persists the choice in localStorage (device-only, not a cookie,
 * never transmitted - see docs/COOKIES.md).
 */
(function () {
  var KEY = 'reader-text-size';
  var ALLOWED = [1, 1.125, 1.25];

  function setSize(scale) {
    document.documentElement.style.setProperty(
      '--reader-size',
      'calc(var(--text-base) * ' + scale + ')'
    );
  }

  // localStorage access can throw when storage is blocked (some privacy modes).
  // This runs pre-paint in <head>, so failures must be swallowed.
  function readSaved() {
    try {
      return parseFloat(localStorage.getItem(KEY));
    } catch (e) {
      return NaN;
    }
  }

  // Pre-paint: apply any saved, valid size immediately.
  var saved = readSaved();
  if (ALLOWED.indexOf(saved) !== -1) setSize(saved);

  document.addEventListener('DOMContentLoaded', function () {
    var group = document.querySelector('.text-size');
    if (!group) return;
    var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-reader-size]'));

    function apply(scale, persist) {
      setSize(scale);
      buttons.forEach(function (b) {
        b.setAttribute(
          'aria-pressed',
          parseFloat(b.getAttribute('data-reader-size')) === scale ? 'true' : 'false'
        );
      });
      if (persist) {
        try {
          localStorage.setItem(KEY, String(scale));
        } catch (e) {
          /* storage may be unavailable; the control still works for the session */
        }
      }
    }

    if (ALLOWED.indexOf(saved) !== -1) apply(saved, false);

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        apply(parseFloat(b.getAttribute('data-reader-size')), true);
      });
    });
  });
})();

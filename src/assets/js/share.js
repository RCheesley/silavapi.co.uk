/**
 * share.js - reveals the "Mastodon" share button on tweetables and, on click,
 * asks for the reader's instance (Mastodon has no universal share URL). The
 * instance is remembered on the reader's own device (localStorage, not a
 * cookie, never transmitted - see docs/COOKIES.md). Without JavaScript the
 * Mastodon button stays hidden; X / Bluesky / LinkedIn work regardless.
 */
(function () {
  var links = document.querySelectorAll('[data-mastodon-share]');
  if (!links.length) return;
  var KEY = 'mastodon-instance';

  Array.prototype.forEach.call(links, function (a) {
    a.hidden = false;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var saved = '';
      try {
        saved = localStorage.getItem(KEY) || '';
      } catch (err) {
        /* storage blocked */
      }
      var instance = window.prompt('Your Mastodon instance (e.g. mastodon.social):', saved);
      if (!instance) return;
      // Keep only the host[:port]: strip protocol and anything from the first
      // path/query/hash character, then validate it looks like a hostname.
      instance = instance
        .trim()
        .replace(/^https?:\/\//i, '')
        .replace(/[/?#].*$/, '');
      if (!/^[a-z0-9.-]+(:\d+)?$/i.test(instance)) return;
      try {
        localStorage.setItem(KEY, instance);
      } catch (err) {
        /* storage blocked */
      }
      var text = a.getAttribute('data-text') || '';
      window.open(
        'https://' + instance + '/share?text=' + encodeURIComponent(text),
        '_blank',
        'noopener'
      );
    });
  });
})();

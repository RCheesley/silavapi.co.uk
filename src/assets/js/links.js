/**
 * links.js - shared "does this text contain a link" check for the contact,
 * speaker-enquiry and comment forms. Loaded before those form scripts so
 * window.Silavapi.hasLink is available to them.
 *
 * The forms drop any link server-side (see lib/spam.js); with JS we warn and
 * block submission first, so a visitor fixes it rather than losing their message
 * silently. The regex below mirrors LINK_OR_DOMAIN_RE in lib/spam.js - keep the
 * two in sync.
 */
(function () {
  // A URL (http/https/www) or a bare domain on a common TLD (so code-ish tokens
  // like index.html or node.js don't register as links).
  var RE =
    /(?:https?:\/\/|www\.)\S+|\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(?:com|net|org|info|biz|io|co|ru|ua|cn|xyz|online|site|shop|store|top|club|live|news|link|click|buzz|pro|vip|app)\b/i;
  window.Silavapi = window.Silavapi || {};
  window.Silavapi.hasLink = function (s) {
    return RE.test(String(s || ''));
  };
})();

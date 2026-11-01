/**
 * enquiry.js - light enhancement for the speaker-enquiry form.
 * The form submits natively (works without JS; the honeypot is the spam defence
 * either way). With JS this stamps the time-trap, reveals the error banner if the
 * server bounced us back with ?error, and blocks submission with a warning if a
 * free-text field contains a link (the server drops links, so warn first rather
 * than lose the enquiry silently). HTML5 `required` handles the rest.
 */
(function () {
  var form = document.querySelector('[data-enquiry-form]');
  var trap = document.querySelector('[data-enquiry-form] [data-time-trap]');
  if (trap) trap.value = String(Date.now());

  if (/[?&]error=/.test(location.search)) {
    var banner = document.querySelector('[data-form-error]');
    if (banner) {
      banner.hidden = false;
      banner.scrollIntoView({ block: 'center' });
    }
  }

  if (!form) return;

  // Links aren't allowed; warn via the browser's own validation (the flow this
  // form already uses for `required`) so the visitor removes it before sending.
  var LINK_MSG = "Links aren't allowed here, I'm afraid - please remove it.";
  var linkFields = ['b-name', 'b-topic', 'b-message']
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  // Clear the custom error as soon as a field changes, so a corrected field is
  // no longer blocked.
  linkFields.forEach(function (el) {
    el.addEventListener('input', function () {
      el.setCustomValidity('');
    });
  });

  form.addEventListener('submit', function (e) {
    var firstBad = null;
    linkFields.forEach(function (el) {
      if (window.Silavapi && window.Silavapi.hasLink(el.value)) {
        el.setCustomValidity(LINK_MSG);
        if (!firstBad) firstBad = el;
      } else {
        el.setCustomValidity('');
      }
    });
    if (firstBad) {
      e.preventDefault();
      form.reportValidity();
      firstBad.focus();
    }
  });
})();

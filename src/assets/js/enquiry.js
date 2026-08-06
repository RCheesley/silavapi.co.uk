/**
 * enquiry.js - light enhancement for the speaker-enquiry form.
 * The form submits natively (works without JS; the honeypot is the spam defence
 * either way). With JS this stamps the time-trap and, if the server bounced us
 * back with ?error, reveals the error banner. HTML5 `required` handles the rest.
 */
(function () {
  var trap = document.querySelector('[data-enquiry-form] [data-time-trap]');
  if (trap) trap.value = String(Date.now());

  if (/[?&]error=/.test(location.search)) {
    var banner = document.querySelector('[data-form-error]');
    if (banner) {
      banner.hidden = false;
      banner.scrollIntoView({ block: 'center' });
    }
  }
})();

/**
 * contact.js - progressive enhancement for the contact form.
 * Adds warm inline validation (announced via aria-live), stamps the time-trap,
 * and submits via fetch so the result is announced inline. Without JS the form
 * submits natively to /api/contact, which performs the same checks server-side
 * and 303-redirects to /thank-you/.
 */
(function () {
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;
  var status = document.querySelector('[data-contact-status]');
  var trap = form.querySelector('[data-time-trap]');
  if (trap) trap.value = String(Date.now());

  var fields = [
    {
      id: 'c-name',
      err: 'c-name-error',
      test: function (v) {
        return v.trim().length > 0;
      },
      msg: 'Please tell me your name.',
    },
    {
      id: 'c-email',
      err: 'c-email-error',
      test: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
      },
      msg: 'That email address doesn’t look quite right.',
    },
    {
      id: 'c-msg',
      err: 'c-msg-error',
      test: function (v) {
        return v.trim().length > 0;
      },
      msg: 'The message is the important bit!',
    },
  ];

  function setError(field, show) {
    var input = document.getElementById(field.id);
    var errEl = document.getElementById(field.err);
    // errEl is a persistent aria-live region; changing its text announces it,
    // and it collapses (CSS :empty) when cleared.
    if (show) {
      input.setAttribute('aria-invalid', 'true');
      errEl.textContent = field.msg;
    } else {
      input.removeAttribute('aria-invalid');
      errEl.textContent = '';
    }
  }

  form.addEventListener('submit', function (e) {
    var firstInvalid = null;
    fields.forEach(function (field) {
      var ok = field.test(document.getElementById(field.id).value);
      setError(field, !ok);
      if (!ok && !firstInvalid) firstInvalid = document.getElementById(field.id);
    });

    if (firstInvalid) {
      e.preventDefault();
      firstInvalid.focus();
      return;
    }

    // Enhanced submit: POST via fetch and announce the result inline, so the
    // reader stays on the page. Without JS the form submits natively and the
    // server 303-redirects to /thank-you/.
    e.preventDefault();

    function showAlert(tone, role, titleText, bodyText) {
      if (!status) return;
      var alert = document.createElement('div');
      alert.className = 'alert alert--' + tone;
      alert.setAttribute('role', role);
      var title = document.createElement('p');
      title.className = 'alert__title';
      title.textContent = titleText;
      var body = document.createElement('p');
      body.className = 'alert__body';
      body.textContent = bodyText;
      alert.appendChild(title);
      alert.appendChild(body);
      status.replaceChildren(alert);
    }
    // Derive the fallback address from the page's own mailto link (the contact
    // aside), so it never drifts from site.author.email.
    var mailLink = document.querySelector('a[href^="mailto:"]');
    var email = mailLink
      ? mailLink
          .getAttribute('href')
          .replace(/^mailto:/, '')
          .split('?')[0]
      : 'hello@silavapi.co.uk';
    var failMsg =
      'Something went wrong sending your message. Please email me directly at ' + email + '.';

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    fetch(form.action, {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: new FormData(form),
    })
      .then(function (res) {
        return res.json().catch(function () {
          return { ok: res.ok };
        });
      })
      .then(function (data) {
        if (data && data.ok) {
          showAlert(
            'success',
            'status',
            'Message sent',
            'Thank you - your message is on its way. I reply to everything, though sometimes slowly when I’m on retreat or running somewhere remote.'
          );
          form.reset();
        } else {
          showAlert('info', 'alert', 'That didn’t send', failMsg);
        }
      })
      .catch(function () {
        showAlert('info', 'alert', 'That didn’t send', failMsg);
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();

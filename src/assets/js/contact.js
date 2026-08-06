/**
 * contact.js - progressive enhancement for the contact form.
 * Adds warm inline validation announced via aria-live and stamps the time-trap.
 * Without JS the form still submits natively to the server handler (Phase 4),
 * which performs the same checks. NOTE: until the Phase 4 handler exists, this
 * confirms client-side so the preview doesn't 404 on submit.
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
    if (show) {
      input.setAttribute('aria-invalid', 'true');
      errEl.textContent = field.msg;
      errEl.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      errEl.textContent = '';
      errEl.hidden = true;
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

    // TODO(phase 4): let the native submit reach the server handler. For now,
    // confirm client-side so preview submissions don't hit a missing endpoint.
    e.preventDefault();
    if (status) {
      var alert = document.createElement('div');
      alert.className = 'alert alert--success';
      alert.setAttribute('role', 'status');
      var title = document.createElement('p');
      title.className = 'alert__title';
      title.textContent = 'Message sent';
      var body = document.createElement('p');
      body.className = 'alert__body';
      body.textContent =
        'Thank you - your message is on its way. I reply to everything, though sometimes slowly when I’m on retreat or running somewhere remote.';
      alert.appendChild(title);
      alert.appendChild(body);
      status.replaceChildren(alert);
    }
    form.reset();
  });
})();

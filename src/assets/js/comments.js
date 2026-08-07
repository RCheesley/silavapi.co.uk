/**
 * comments.js - progressive enhancement for blog comments.
 * Reveals the per-comment Reply buttons (which relocate the single form under a
 * comment and set its `parent`), stamps the time-trap, validates inline, and
 * submits via fetch so the reader stays on the page. Without JS the form still
 * posts natively to /api/comment (top-level comments only); the server applies
 * the same checks and 303-redirects back with a status flag.
 */
(function () {
  var form = document.querySelector('[data-comment-form]');
  if (!form) return;

  // With JS we show our own inline errors, so opt out of native validation
  // bubbles. Without JS the markup keeps `required`, so the browser validates.
  form.noValidate = true;

  var trap = form.querySelector('[data-time-trap]');
  if (trap) trap.value = String(Date.now());

  var parentField = form.querySelector('[data-comment-parent]');
  var titleEl = form.querySelector('[data-comment-form-title]');
  var replyingEl = form.querySelector('[data-comment-replying]');
  var cancelBtn = form.querySelector('[data-comment-cancel]');
  var statusEl = document.querySelector('[data-comment-status]');

  // Marker so we can move the form back to its home position after a reply.
  var home = document.createComment('comment-form-home');
  form.parentNode.insertBefore(home, form);

  function setStatus(tone, title, body) {
    if (!statusEl) return;
    statusEl.className = 'comments__status alert alert--' + tone;
    statusEl.textContent = '';
    var h = document.createElement('p');
    h.className = 'alert__title';
    h.textContent = title;
    var p = document.createElement('p');
    p.className = 'alert__body';
    p.textContent = body;
    statusEl.appendChild(h);
    statusEl.appendChild(p);
  }

  function resetReply() {
    parentField.value = '';
    titleEl.textContent = 'Leave a comment';
    replyingEl.hidden = true;
    replyingEl.textContent = '';
    cancelBtn.hidden = true;
    home.parentNode.insertBefore(form, home.nextSibling);
  }

  var replyButtons = document.querySelectorAll('.comment__reply');
  Array.prototype.forEach.call(replyButtons, function (btn) {
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-reply-to');
      parentField.value = id;
      titleEl.textContent = 'Leave a reply';
      replyingEl.hidden = false;
      replyingEl.textContent = 'Replying to ' + btn.getAttribute('data-reply-name');
      cancelBtn.hidden = false;
      var li = document.getElementById('comment-' + id);
      var card = li && li.querySelector('.comment__card');
      if (card) card.after(form);
      var field = form.querySelector('#cm-comment');
      if (field) field.focus();
    });
  });
  cancelBtn.addEventListener('click', resetReply);

  // Reflect a native (no-JS) round-trip: ?posted=1 or ?error=1 in the URL.
  if (/[?&]posted=1/.test(location.search)) {
    setStatus(
      'success',
      'Thank you',
      'Your comment has been sent for moderation and will appear once approved.'
    );
  } else if (/[?&]error=1/.test(location.search)) {
    setStatus(
      'info',
      'That didn’t send',
      'Something went wrong. Please check your details and try again.'
    );
  }

  function fieldError(id, message) {
    var input = document.getElementById(id);
    var err = document.getElementById(id + '-error');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (err) err.textContent = message;
    } else {
      input.removeAttribute('aria-invalid');
      if (err) err.textContent = '';
    }
  }

  function validate() {
    var ok = true;
    var name = document.getElementById('cm-name');
    var comment = document.getElementById('cm-comment');
    var email = document.getElementById('cm-email');
    if (!name.value.trim()) {
      fieldError('cm-name', 'Please add your name.');
      ok = false;
    } else fieldError('cm-name', '');
    if (!comment.value.trim()) {
      fieldError('cm-comment', 'The comment is the important bit!');
      ok = false;
    } else fieldError('cm-comment', '');
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.setAttribute('aria-invalid', 'true');
      ok = false;
    } else email.removeAttribute('aria-invalid');
    return ok;
  }

  form.addEventListener('submit', function (e) {
    if (!validate()) {
      e.preventDefault();
      var bad = form.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
      return;
    }
    e.preventDefault();
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
          setStatus(
            'success',
            'Thank you',
            'Your comment has been sent for moderation and will appear once approved.'
          );
          form.reset();
          resetReply();
        } else {
          setStatus('info', 'That didn’t send', 'Please check your details and try again.');
        }
      })
      .catch(function () {
        setStatus('info', 'That didn’t send', 'Please check your connection and try again.');
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();

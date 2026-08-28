/**
 * gallery-lightbox.js - click a gallery image to view it larger in a dialog.
 * Progressive enhancement: the markup is a plain link to the full-size image
 * (which works without JS); here we intercept it and show the image in a native
 * <dialog> instead. No cookies, no third-party. Exits early when there are no
 * galleries on the page.
 */
(function () {
  var links = document.querySelectorAll('.gallery__link');
  if (!links.length || typeof HTMLDialogElement !== 'function') return;

  var dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Enlarged image');
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'lightbox__close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '✕'; // ✕
  var img = document.createElement('img');
  img.className = 'lightbox__img';
  var figure = document.createElement('figure');
  figure.className = 'lightbox__figure';
  // The visible caption mirrors the gallery's figcaption. open() decides
  // whether assistive tech should hear it: a real caption (which may add
  // context like a photo credit that isn't in the alt) is exposed; a caption
  // that only echoes the alt stays aria-hidden to avoid a double announcement.
  var caption = document.createElement('figcaption');
  caption.className = 'lightbox__caption';
  caption.setAttribute('aria-hidden', 'true');
  figure.appendChild(img);
  figure.appendChild(caption);
  dialog.appendChild(closeBtn);
  dialog.appendChild(figure);
  document.body.appendChild(dialog);

  var lastFocus = null;

  function open(href, alt, text) {
    lastFocus = document.activeElement;
    img.src = href;
    img.alt = alt || '';
    // Show the gallery's own caption; fall back to the alt when there is none.
    // A real caption may carry a photo credit the alt doesn't, so expose it to
    // assistive tech; a caption that only echoes the alt stays hidden from it.
    var shown = text || alt || '';
    caption.textContent = shown;
    caption.hidden = !shown;
    if (text) caption.removeAttribute('aria-hidden');
    else caption.setAttribute('aria-hidden', 'true');
    dialog.showModal();
    closeBtn.focus();
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      // Let modified / non-primary clicks fall through to the plain link, so
      // Ctrl/Cmd/middle-click still opens the full image in a new tab.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      e.preventDefault();
      var inner = link.querySelector('img');
      var fig = link.closest('.gallery__figure');
      var cap = fig ? fig.querySelector('.gallery__caption') : null;
      open(
        link.getAttribute('href'),
        inner ? inner.getAttribute('alt') : '',
        cap ? cap.textContent.trim() : ''
      );
    });
  });

  closeBtn.addEventListener('click', function () {
    dialog.close();
  });
  // Click on the backdrop (the dialog element itself, outside the figure) closes.
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });
  // Restore focus to the thumbnail that opened it (native dialog handles Escape).
  dialog.addEventListener('close', function () {
    img.removeAttribute('src');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  });
})();

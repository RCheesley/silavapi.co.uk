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
  // The caption repeats the image's alt for sighted users; the img already
  // carries the alt for assistive tech, so hide the duplicate from it.
  var caption = document.createElement('figcaption');
  caption.className = 'lightbox__caption';
  caption.setAttribute('aria-hidden', 'true');
  figure.appendChild(img);
  figure.appendChild(caption);
  dialog.appendChild(closeBtn);
  dialog.appendChild(figure);
  document.body.appendChild(dialog);

  var lastFocus = null;

  function open(href, alt) {
    lastFocus = document.activeElement;
    img.src = href;
    img.alt = alt || '';
    caption.textContent = alt || '';
    caption.hidden = !alt;
    dialog.showModal();
    closeBtn.focus();
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var inner = link.querySelector('img');
      open(link.getAttribute('href'), inner ? inner.getAttribute('alt') : '');
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

/**
 * prompt-copy.js - adds a "Copy" button to each prompt callout (code.prompt) so
 * readers can lift a prompt in one click. Progressive enhancement: without
 * JavaScript (or the Clipboard API) the prompts are still fully readable and
 * selectable, and no button is shown. No cookies, no third party.
 */
(function () {
  if (!navigator.clipboard || !navigator.clipboard.writeText) return;

  var blocks = document.querySelectorAll('pre > code.prompt');
  if (!blocks.length) return;

  Array.prototype.forEach.call(blocks, function (code) {
    var pre = code.parentNode;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prompt-copy';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy prompt to clipboard');

    var timer;
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(code.textContent).then(
        function () {
          btn.textContent = 'Copied';
          btn.classList.add('is-copied');
          clearTimeout(timer);
          timer = setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('is-copied');
          }, 2000);
        },
        function () {
          btn.textContent = 'Copy failed';
        }
      );
    });

    pre.appendChild(btn);
  });
})();

/**
 * search.js - site search (progressive enhancement).
 *
 * The search controls are hidden by default and revealed here, because search
 * needs both JS and the self-hosted Pagefind index and has no no-JS fallback.
 * Any [data-search-open] control opens the dialog; data-search-open="blog"
 * (or any section name) scopes results to that section via the Pagefind filter
 * baked into each page's <main data-pagefind-filter="section:...">.
 *
 * Pagefind (WASM + index) is loaded lazily on first open, so the homepage never
 * pays for it up front. The whole thing degrades to hidden if the index is
 * missing (e.g. `eleventy --serve`, which doesn't build the index).
 */
(function () {
  var dialog = document.querySelector('[data-search-dialog]');
  var openers = document.querySelectorAll('[data-search-open]');
  if (!dialog || !openers.length || typeof dialog.showModal !== 'function') return;

  var input = dialog.querySelector('[data-search-input]');
  var statusEl = dialog.querySelector('[data-search-status]');
  var resultsEl = dialog.querySelector('[data-search-results]');
  var closeBtn = dialog.querySelector('[data-search-close]');

  var pagefind = null; // the loaded module, once ready
  var loadState = 'idle'; // idle | loading | ready | failed
  var activeSection = null; // null = whole site; otherwise a section filter
  var debounce = null;
  var seq = 0; // guards against out-of-order async results

  // Reveal the controls now that JS is running.
  for (var i = 0; i < openers.length; i++) openers[i].hidden = false;

  function setStatus(text) {
    statusEl.textContent = text || '';
  }

  function loadPagefind() {
    if (loadState === 'ready' || loadState === 'loading') return;
    loadState = 'loading';
    // Path is absolute so it resolves the same from any page depth. Built by
    // `pagefind --site _site` in the production build (not in dev serve).
    import('/pagefind/pagefind.js')
      .then(function (mod) {
        return mod.init
          ? mod.init().then(function () {
              return mod;
            })
          : mod;
      })
      .then(function (mod) {
        pagefind = mod;
        loadState = 'ready';
        if (input.value.trim()) runSearch(input.value);
      })
      .catch(function () {
        loadState = 'failed';
        setStatus('Search is unavailable right now. Please try again later.');
      });
  }

  function scopeLabel() {
    return activeSection === 'blog' ? 'the blog' : 'the site';
  }

  function clearResults() {
    resultsEl.replaceChildren();
  }

  function renderResults(items, term) {
    clearResults();
    if (!items.length) {
      setStatus('No results for “' + term + '” in ' + scopeLabel() + '.');
      return;
    }
    setStatus(
      items.length + (items.length === 1 ? ' result' : ' results') + ' for “' + term + '”.'
    );
    var frag = document.createDocumentFragment();
    items.forEach(function (data) {
      var li = document.createElement('li');
      li.className = 'search-result';

      var a = document.createElement('a');
      a.className = 'search-result__link';
      a.href = data.url;

      var h = document.createElement('span');
      h.className = 'search-result__title';
      h.textContent = (data.meta && data.meta.title) || data.url;
      a.appendChild(h);

      if (data.excerpt) {
        var p = document.createElement('span');
        p.className = 'search-result__excerpt';
        // Pagefind's excerpt wraps matches in <mark>; it is library-generated,
        // not user input, so rendering it as HTML is safe and keeps highlights.
        p.innerHTML = data.excerpt;
        a.appendChild(p);
      }

      li.appendChild(a);
      frag.appendChild(li);
    });
    resultsEl.appendChild(frag);
  }

  function runSearch(term) {
    term = term.trim();
    if (!term) {
      clearResults();
      setStatus('');
      return;
    }
    if (loadState === 'failed') {
      setStatus('Search is unavailable right now. Please try again later.');
      return;
    }
    if (loadState !== 'ready') {
      setStatus('Loading search…');
      loadPagefind();
      return;
    }
    var mine = ++seq;
    setStatus('Searching…');
    var opts = activeSection ? { filters: { section: activeSection } } : undefined;
    pagefind
      .search(term, opts)
      .then(function (search) {
        // Cap the number of full data fetches; the dialog shows the top matches.
        return Promise.all(
          search.results.slice(0, 10).map(function (r) {
            return r.data();
          })
        );
      })
      .then(function (items) {
        if (mine !== seq) return; // a newer query superseded this one
        renderResults(items, term);
      })
      .catch(function () {
        if (mine !== seq) return;
        setStatus('Something went wrong searching. Please try again.');
      });
  }

  function open(section) {
    activeSection = section || null;
    input.value = '';
    clearResults();
    setStatus('');
    input.setAttribute(
      'aria-label',
      activeSection === 'blog' ? 'Search the blog' : 'Search the site'
    );
    input.placeholder = activeSection === 'blog' ? 'Search the blog' : 'Search';
    dialog.showModal();
    input.focus();
    loadPagefind();
  }

  for (var j = 0; j < openers.length; j++) {
    (function (opener) {
      opener.addEventListener('click', function () {
        // data-search-open="" (site-wide) or a section name (e.g. "blog").
        open(opener.getAttribute('data-search-open') || null);
      });
    })(openers[j]);
  }

  input.addEventListener('input', function () {
    var term = input.value;
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      runSearch(term);
    }, 180);
  });

  // Don't let Enter submit/reload the page; results are live.
  dialog.querySelector('[data-search-form]').addEventListener('submit', function (e) {
    e.preventDefault();
    clearTimeout(debounce);
    runSearch(input.value);
  });

  closeBtn.addEventListener('click', function () {
    dialog.close();
  });

  // Close when the backdrop (the dialog element itself, outside the panel) is
  // clicked. Clicks inside the panel don't reach here.
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });
})();

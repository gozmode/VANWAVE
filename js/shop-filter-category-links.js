// Biegt jeden nativen Squarespace-Kategorielink (/shop/<kategorie>/)
// site-weit auf /shop?vw-category-slug=<slug>#shop-filter um, damit er
// den Will-Myers-Store-Filter statt der eigenen Kategorieseite öffnet.
// Läuft auf jeder Seite (Desktop- und Mobilmenü, Kategorieliste im Shop
// selbst), auch für Links, die erst nachträglich ins DOM kommen.
// Auf /shop selbst wird beim Laden zusätzlich die passende Filter-Option
// anhand des Parameters angeklickt.

(function () {
  'use strict';

  var PARAM = 'vw-category-slug';
  var ANCHOR = 'shop-filter';
  var SHOP = '/shop';

  function slug(value) {
    return String(value || '')
      .trim()
      .replace(/ä/gi, 'ae')
      .replace(/ö/gi, 'oe')
      .replace(/ü/gi, 'ue')
      .replace(/ß/g, 'ss')
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLocaleLowerCase('de-DE')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function rewrite(link) {
    if (!link || link.dataset.vwCategoryLink === 'true') return;

    var url;
    try {
      url = new URL(link.href, location.origin);
    } catch (error) {
      return;
    }
    if (url.origin !== location.origin) return;

    var match = url.pathname.match(/^\/shop\/([^/]+)\/?$/i);
    if (!match || match[1].toLocaleLowerCase('de-DE') === 'p') return;

    var destination = new URL(SHOP, location.origin);
    destination.searchParams.set(PARAM, decodeURIComponent(match[1]));
    destination.hash = ANCHOR;

    link.href = destination.pathname + destination.search + destination.hash;
    link.dataset.vwCategoryLink = 'true';
  }

  function rewriteAll(root) {
    if (root instanceof HTMLAnchorElement) rewrite(root);
    if (root.querySelectorAll) root.querySelectorAll('a[href]').forEach(rewrite);
  }

  function start() {
    rewriteAll(document);

    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node instanceof Element) rewriteAll(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  // Auswahl anhand des URL-Parameters anwenden, sobald der Filter selbst
  // im DOM ist - unabhängig vom Rewriting oben, läuft parallel.
  if ((location.pathname.replace(/\/+$/, '') || '/') !== SHOP) return;

  var requested = new URLSearchParams(location.search).get(PARAM);
  if (!requested) return;

  var applyStarted = Date.now();

  (function apply() {
    var inputs = Array.from(
      document.querySelectorAll('.wm-store-filter-group[data-type="category"] .wm-store-filter-input[type="radio"]')
    );
    var input = inputs.find(function (item) {
      return slug(item.value) === slug(requested);
    });

    if (input) {
      if (!input.checked) input.click();
      return;
    }
    if (Date.now() - applyStarted < 15000) {
      setTimeout(apply, 100);
    } else {
      console.warn('[VANWAVE Shop] Kategorie-Slug nicht gefunden: ' + requested);
    }
  })();
})();

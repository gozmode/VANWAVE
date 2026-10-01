// Ersetzt die feste "SHOP"-Überschrift durch den Namen der gerade
// gewählten Kategorie im Will-Myers-Store-Filter (nur auf /shop) und
// macht sie von H2 zur H1.

(function () {
  'use strict';

  if ((location.pathname.replace(/\/+$/, '') || '/') !== '/shop') return;

  var started = Date.now();

  // Squarespace gibt die Überschrift als H2 aus. Hier wird sie zur H1,
  // damit die gewählte Kategorie die Hauptüberschrift der Produktliste
  // ist (Semantik und H1-Schriftgröße).
  function promoteToH1() {
    document.querySelectorAll('.product-list-header h2.nested-category-title').forEach(function (h2) {
      var h1 = document.createElement('h1');
      Array.prototype.forEach.call(h2.attributes, function (attribute) {
        h1.setAttribute(attribute.name, attribute.value);
      });
      // Die Einblend-Animation von Squarespace hängt am alten Element.
      // Ihren Zustand nicht mitnehmen, sonst bleibt die H1 unsichtbar.
      h1.classList.remove('preFade', 'fadeIn');
      h1.removeAttribute('style');
      while (h2.firstChild) h1.appendChild(h2.firstChild);
      h2.replaceWith(h1);
    });
  }

  function update() {
    promoteToH1();

    // Squarespace rendert die Überschrift doppelt (Desktop und Mobil).
    var headings = document.querySelectorAll('.product-list-header .nested-category-title');
    var selected = document.querySelector(
      '.wm-store-filter-group[data-type="category"] .wm-store-filter-input[type="radio"]:checked'
    );
    if (!headings.length) return false;

    // "Alle Artikel" hat value="" - dann bleibt es bei "SHOP".
    var text = selected && selected.value ? selected.value : 'SHOP';
    headings.forEach(function (heading) {
      heading.textContent = text;
    });
    return !!selected;
  }

  (function wait() {
    if (update()) return;
    if (Date.now() - started < 15000) setTimeout(wait, 100);
  })();

  document.addEventListener('wm-store-filter:loaded', update);
  document.addEventListener('wm-store-filter:filtered', update);
  document.addEventListener('change', function (event) {
    if (
      event.target &&
      event.target.matches &&
      event.target.matches('.wm-store-filter-group[data-type="category"] .wm-store-filter-input[type="radio"]')
    ) {
      setTimeout(update, 0);
    }
  });
})();

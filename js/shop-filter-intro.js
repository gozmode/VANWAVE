// Zeigt unter der Kategorie-Überschrift der Produktliste (nur auf /shop)
// einen kurzen Einleitungstext, passend zur gewählten Kategorie im
// Will-Myers-Store-Filter.
//
// Die Texte stehen nicht hier, sondern in der Code-Injection der
// Shop-Seite, damit sie ohne Commit geändert werden können:
//
//   window.vwShopIntroTexts = {
//     "": "Text für Alle Artikel",
//     "VANslide Heckauszüge": "Text für diese Kategorie"
//   };
//
// Schlüssel = Beschriftung der Kategorie im Filter, "" = keine Kategorie.
// Ohne passenden Eintrag bleibt die Stelle leer. Aussehen: Abschnitt 21
// in vanwave-custom-css.css (.vw-shop-intro).

(function () {
  'use strict';

  if ((location.pathname.replace(/\/+$/, '') || '/') !== '/shop') return;

  var started = Date.now();

  function normalize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('de-DE');
  }

  function textFor(label) {
    var texts = window.vwShopIntroTexts;
    if (!texts || typeof texts !== 'object') return '';
    if (typeof texts[label] === 'string') return texts[label];

    var wanted = normalize(label);
    var key = Object.keys(texts).find(function (candidate) {
      return normalize(candidate) === wanted;
    });
    return key !== undefined && typeof texts[key] === 'string' ? texts[key] : '';
  }

  function selectedLabel() {
    var selected = document.querySelector(
      '.wm-store-filter-group[data-type="category"] .wm-store-filter-input[type="radio"]:checked'
    );
    if (!selected || !selected.value) return '';

    var option = selected.closest('.wm-store-filter-option');
    var label = option && option.querySelector('.wm-store-filter-option-label');
    return (label && label.textContent.trim()) || selected.value;
  }

  function update() {
    var header = document.querySelector('.product-list-header');
    if (!header) return false;

    var intro = header.querySelector('.vw-shop-intro');
    if (!intro) {
      intro = document.createElement('p');
      intro.className = 'vw-shop-intro';
      header.appendChild(intro);
    }

    var text = textFor(selectedLabel());
    intro.textContent = text;
    intro.hidden = !text;
    return true;
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

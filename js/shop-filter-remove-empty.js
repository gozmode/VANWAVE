// Beschriftet die "Alle"-Option der Kategorie-Filterliste des
// Will-Myers-Store-Filters (Radiobutton mit value="", vom Plugin fest als
// "All <Gruppenname>" erzeugt) als "Alle Artikel". Ein Klick darauf hebt
// die Kategorie-Auswahl auf. Läuft beim ersten Laden, bei jeder
// DOM-Änderung (neue Optionen) sowie bei den eigenen Events des Plugins.
//
// Hinweis: Frühere Versionen dieses Scripts haben die Option entfernt -
// daher der Dateiname. Er bleibt, damit der <script>-Link in der
// Squarespace-Code-Injection unverändert weiter funktioniert.

(function () {
  'use strict';

  var LABEL = 'Alle Artikel';
  var SELECTOR = '.wm-store-filter-group[data-type="category"] .wm-store-filter-input[value=""]';

  function labelAll(root) {
    var inputs = [];
    if (root instanceof HTMLInputElement && root.matches(SELECTOR)) inputs.push(root);
    if (root.querySelectorAll) {
      root.querySelectorAll(SELECTOR).forEach(function (input) {
        inputs.push(input);
      });
    }

    inputs.forEach(function (input) {
      var option = input.closest('.wm-store-filter-option');
      var label = option && option.querySelector('.wm-store-filter-option-label');
      if (label && label.textContent !== LABEL) label.textContent = LABEL;
    });
  }

  function start() {
    labelAll(document);

    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node instanceof Element) labelAll(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener('wm-store-filter:loaded', function () {
    labelAll(document);
  });
  document.addEventListener('wm-store-filter:filtered', function () {
    labelAll(document);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();

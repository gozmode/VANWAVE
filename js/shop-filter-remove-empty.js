// Entfernt die leere "Alle"-Option aus der Kategorie-Filterliste des
// Will-Myers-Store-Filters (Radiobutton mit value=""). Läuft beim ersten
// Laden, bei jeder DOM-Änderung (neue Optionen) sowie bei den eigenen
// Events des Plugins.

(function () {
  'use strict';

  var SELECTOR = '.wm-store-filter-group[data-type="category"] .wm-store-filter-input[value=""]';

  function removeAll(root) {
    var inputs = [];
    if (root instanceof HTMLInputElement && root.matches(SELECTOR)) inputs.push(root);
    if (root.querySelectorAll) {
      root.querySelectorAll(SELECTOR).forEach(function (input) {
        inputs.push(input);
      });
    }

    inputs.forEach(function (input) {
      var option = input.closest('.wm-store-filter-option-item, .wm-store-filter-option');
      if (option) option.remove();
    });
  }

  function start() {
    removeAll(document);

    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node instanceof Element) removeAll(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener('wm-store-filter:loaded', function () {
    removeAll(document);
  });
  document.addEventListener('wm-store-filter:filtered', function () {
    removeAll(document);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();

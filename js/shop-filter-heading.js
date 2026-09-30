// Ersetzt die feste "SHOP"-Überschrift durch den Namen der gerade
// gewählten Kategorie im Will-Myers-Store-Filter (nur auf /shop).

(function () {
  'use strict';

  if ((location.pathname.replace(/\/+$/, '') || '/') !== '/shop') return;

  var started = Date.now();

  function update() {
    var heading = document.querySelector('.product-list-header .nested-category-title');
    var selected = document.querySelector(
      '.wm-store-filter-group[data-type="category"] .wm-store-filter-input[type="radio"]:checked'
    );
    if (!heading) return false;

    heading.textContent = selected ? selected.value : 'SHOP';
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

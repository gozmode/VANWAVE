// Zeigt auf der /sale-Seite nur Produkte, die aktuell wirklich im Sale sind
// (variants[].onSale aus der Shop-JSON), da Squarespace Summary Blocks
// nicht nach "gerade reduziert" filtern können (nur nach Tag/Kategorie).
// Läuft nur auf /sale, auch wenn versehentlich sitewide eingebunden.

document.addEventListener('DOMContentLoaded', function () {
  if (location.pathname !== '/sale') return;

  const items = document.querySelectorAll('.summary-item');
  if (!items.length) return;

  fetch('/shop?format=json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      const onSaleUrls = new Set(
        (data.items || [])
          .filter(function (i) {
            return Array.isArray(i.variants) && i.variants.some(function (v) { return v.onSale; });
          })
          .map(function (i) { return i.fullUrl; })
      );

      function filterItem(item) {
        const link = item.querySelector('a[href]');
        if (!link) return;
        const href = link.getAttribute('href').split('?')[0];
        if (!onSaleUrls.has(href)) {
          item.remove();
        }
      }

      items.forEach(filterItem);

      // Summary Block (autogrid) lädt beim Scrollen weitere Produkte nach -
      // neu eingefügte Items ebenfalls prüfen.
      const gallery = document.querySelector('.sqs-block-summary-v2');
      if (gallery) {
        new MutationObserver(function (mutations) {
          mutations.forEach(function (m) {
            m.addedNodes.forEach(function (node) {
              if (node.nodeType === 1 && node.classList && node.classList.contains('summary-item')) {
                filterItem(node);
              }
            });
          });
        }).observe(gallery, { childList: true, subtree: true });
      }
    })
    .catch(function () {});
});

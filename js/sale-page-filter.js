// Zeigt auf der /sale-Seite nur Produkte, die aktuell wirklich reduziert sind,
// da Squarespace Summary Blocks nicht nach "gerade reduziert" filtern können
// (nur nach Tag/Kategorie). Läuft nur auf /sale, auch wenn versehentlich
// sitewide eingebunden.
//
// WICHTIG: variants[].onSale aus der Shop-JSON ist dafür NICHT zuverlässig -
// bei manchen Produkten steht dort false, obwohl ein niedrigerer Verkaufspreis
// gesetzt ist und die Seite selbst (Badges, Streichpreis) das Produkt normal
// als reduziert anzeigt. Deshalb wie der Rest der Seite direkt salePrice vs.
// price vergleichen, statt dem onSale-Feld zu vertrauen.

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
            return Array.isArray(i.variants) && i.variants.some(function (v) {
              return v.salePrice > 0 && v.salePrice < v.price;
            });
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

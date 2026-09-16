// Erkennt Produkte mit dem Tag "BUNDLE" und setzt dafür die Klasse
// .bundle-product (auf .product-detail bzw. .summary-item), die das
// SALE-Badge/die Preisfarben in Abschnitt 01e/vanwave-custom-css.css
// überschreibt. Läuft nach js/sale-badge.js in der Footer-Einbindung.

document.addEventListener('DOMContentLoaded', function () {
  const BUNDLE_TAG = 'BUNDLE';

  function hasBundleTag(tags) {
    return Array.isArray(tags) && tags.some(function (t) {
      return String(t).toUpperCase() === BUNDLE_TAG;
    });
  }

  // --- Produktdetailseite: Tags stehen im globalen Squarespace-Kontext ---
  const pdpItem = window.Static && window.Static.SQUARESPACE_CONTEXT && window.Static.SQUARESPACE_CONTEXT.item;
  if (pdpItem && hasBundleTag(pdpItem.tags)) {
    const detail = document.querySelector('.product-detail');
    if (detail) detail.classList.add('bundle-product');
  }

  // --- Summary-Blocks (Abschnitt 01c): Tags stehen direkt in der JSON
  // der aktuellen Seite (data.items[].tags) - ein Fetch reicht für alle. ---
  const summaryItems = document.querySelectorAll('.summary-item');
  if (!summaryItems.length) return;

  fetch(location.pathname + '?format=json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      const items = data.items || [];
      const bundleUrls = new Set(
        items
          .filter(function (i) { return hasBundleTag(i.tags); })
          .map(function (i) { return i.fullUrl || i.url; })
          .filter(Boolean)
      );
      if (!bundleUrls.size) return;

      summaryItems.forEach(function (item) {
        const link = item.querySelector('a[href]');
        if (!link) return;
        const href = link.getAttribute('href').split('?')[0];
        if (!bundleUrls.has(href)) return;

        item.classList.add('bundle-product');
        const status = item.querySelector('.summary-product-status');
        if (status) {
          status.textContent = 'BUNDLE';
          status.classList.remove('custom-sale-badge');
          status.classList.add('custom-bundle-badge');
        }
      });
    })
    .catch(function () {});
});

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

  // --- Summary-Blocks (Abschnitt 01c): Tags über die JSON-Daten der
  // verlinkten Produktseite holen, da sie im DOM nicht direkt stehen ---
  document.querySelectorAll('.summary-item').forEach(function (item) {
    const link = item.querySelector('a[href]');
    if (!link) return;

    fetch(link.getAttribute('href') + '?format=json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const tags = data.item && data.item.tags;
        if (!hasBundleTag(tags)) return;

        item.classList.add('bundle-product');
        const status = item.querySelector('.summary-product-status');
        if (status) {
          status.textContent = 'BUNDLE';
          status.classList.remove('custom-sale-badge');
          status.classList.add('custom-bundle-badge');
        }
      })
      .catch(function () {});
  });
});

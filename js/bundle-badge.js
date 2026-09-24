// Erkennt Produkte mit dem Tag "BUNDLE" und setzt dafür die Klasse
// .bundle-product (auf .product-detail, .summary-item oder .product-list-item),
// die das SALE-Badge/die Preisfarben in Abschnitt 01e/vanwave-custom-css.css
// überschreibt. Läuft nach js/sale-badge.js in der Footer-Einbindung.
//
// Drei unabhängige Blöcke, je nachdem welche Struktur auf der jeweiligen
// Seite vorkommt (nur die passenden greifen, die anderen finden nichts
// und tun nichts):
//  - Produktdetailseite (.product-detail)
//  - Summary-Block (.summary-item, Abschnitt 01c)
//  - Produktliste Shop/Kategorien (.product-list-item, Abschnitt 01d)

document.addEventListener('DOMContentLoaded', function () {
  const BUNDLE_TAG = 'BUNDLE';

  function hasBundleTag(tags) {
    return Array.isArray(tags) && tags.some(function (t) {
      return String(t).toUpperCase() === BUNDLE_TAG;
    });
  }

  // --- Produktdetailseite: Tags über die JSON der aktuellen Seite holen
  // (window.Static.SQUARESPACE_CONTEXT.item hat kein tags-Feld) ---
  const detail = document.querySelector('.product-detail');
  if (detail) {
    fetch(location.pathname + '?format=json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.item && hasBundleTag(data.item.tags)) {
          detail.classList.add('bundle-product');
        }
      })
      .catch(function () {});
  }

  // --- Summary-Blocks (Abschnitt 01c): Summary Blocks liegen oft auf
  // einer eigenen Seite (z.B. /sale), ziehen ihre Produkte aber aus /shop -
  // die Tags stehen also in der Shop-JSON, nicht in der der aktuellen Seite. ---
  const summaryItems = document.querySelectorAll('.summary-item');
  if (summaryItems.length) {
    fetch('/shop?format=json')
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
  }

  // --- Produktlisten (Abschnitt 01d): das ist die tatsächlich genutzte
  // Shop-/Kategorie-Grid-Struktur. .product-list-item trägt data-product-id,
  // das direkt der Produkt-ID aus der JSON entspricht - kein URL-Abgleich nötig. ---
  const listItems = document.querySelectorAll('.product-list-item[data-product-id]');
  if (listItems.length) {
    fetch(location.pathname + '?format=json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        // Auf Produktseiten (z.B. "Das könnte dir auch gefallen") liefert die eigene
        // JSON nur das eine Produkt (item), keine items - dann die Shop-JSON nehmen.
        if (Array.isArray(data.items)) return data.items;
        return fetch('/shop?format=json')
          .then(function (res) { return res.json(); })
          .then(function (shop) { return shop.items || []; });
      })
      .then(function (items) {
        const bundleIds = new Set(
          items.filter(function (i) { return hasBundleTag(i.tags); }).map(function (i) { return i.id; })
        );
        if (!bundleIds.size) return;

        listItems.forEach(function (item) {
          const id = item.getAttribute('data-product-id');
          if (!bundleIds.has(id)) return;

          item.classList.add('bundle-product');
          const mark = item.querySelector('.product-mark.sale');
          if (mark) mark.textContent = 'BUNDLE';
        });
      })
      .catch(function () {});
  }
});

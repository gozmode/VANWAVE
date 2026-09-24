// Erkennt Produkte mit dem Tag "REFURBISHED" und setzt die Klasse
// .refurbished-product (Optik: vanwave-custom-css.css, Abschnitt 17).
// Drei unabhängige Blöcke, wie in js/bundle-badge.js:
//  - Produktdetailseite: Badge im Bild (per CSS), "Einzelstück" über dem
//    Titel, erster Zitat-Block der Beschreibung wird zur Zustandsbox
//    (Zeilen im Format "Funktion: Text")
//  - Summary-Blocks: SALE-Badge wird zu REFURBISHED
//  - Produktlisten (Shop/Kategorien): SALE-Badge wird zu REFURBISHED

document.addEventListener('DOMContentLoaded', function () {
  const TAG = 'REFURBISHED';

  function hasTag(tags) {
    return Array.isArray(tags) && tags.some(function (t) {
      return String(t).toUpperCase() === TAG;
    });
  }

  function buildConditionBox(quote) {
    if (!quote || quote.classList.contains('refurb-box')) return;
    quote.classList.add('refurb-box');

    const heading = document.createElement('div');
    heading.className = 'refurb-title';
    heading.textContent = 'ZUSTAND DIESES ARTIKELS';

    const grid = document.createElement('div');
    grid.className = 'refurb-grid';
    quote.querySelectorAll('p').forEach(function (p) {
      const text = p.textContent.trim();
      if (!text) return;
      const idx = text.indexOf(':');
      const label = document.createElement('span');
      const value = document.createElement('span');
      if (idx > 0 && idx < 25) {
        label.textContent = text.slice(0, idx).trim();
        value.textContent = text.slice(idx + 1).trim();
      } else {
        value.textContent = text;
      }
      grid.appendChild(label);
      grid.appendChild(value);
    });

    quote.textContent = '';
    quote.appendChild(heading);
    quote.appendChild(grid);
  }

  // --- Produktdetailseite ---
  const detail = document.querySelector('.product-detail');
  if (detail) {
    fetch(location.pathname + '?format=json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.item || !hasTag(data.item.tags)) return;

        detail.classList.add('refurbished-product');

        const title = detail.querySelector('.product-title, h1');
        if (title && !detail.querySelector('.refurb-badges')) {
          const badges = document.createElement('div');
          badges.className = 'refurb-badges';
          badges.innerHTML = '<span class="refurb-badge">Einzelstück</span>';
          title.parentNode.insertBefore(badges, title);
        }

        // Squarespace rendert die Beschreibung doppelt (Desktop und Mobil) -
        // deshalb in jeder .product-description das erste Zitat umbauen.
        const descriptions = detail.querySelectorAll('.product-description');
        const quotes = descriptions.length
          ? Array.from(descriptions).map(function (d) { return d.querySelector('blockquote'); })
          : [detail.querySelector('blockquote')];
        quotes.forEach(buildConditionBox);
      })
      .catch(function () {});
  }

  // --- Summary-Blocks: Tags stehen in der Shop-JSON, nicht in der der
  // aktuellen Seite (z.B. /sale) ---
  const summaryItems = document.querySelectorAll('.summary-item');
  if (summaryItems.length) {
    fetch('/shop?format=json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const urls = new Set(
          (data.items || [])
            .filter(function (i) { return hasTag(i.tags); })
            .map(function (i) { return i.fullUrl || i.url; })
            .filter(Boolean)
        );
        if (!urls.size) return;

        summaryItems.forEach(function (item) {
          const link = item.querySelector('a[href]');
          if (!link) return;
          if (!urls.has(link.getAttribute('href').split('?')[0])) return;

          item.classList.add('refurbished-product');
          const status = item.querySelector('.summary-product-status');
          if (status) {
            status.textContent = TAG;
            status.classList.remove('custom-sale-badge', 'custom-bundle-badge');
            status.classList.add('custom-refurb-badge');
          }
        });
      })
      .catch(function () {});
  }

  // --- Produktlisten: data-product-id entspricht der Produkt-ID der JSON ---
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
        const ids = new Set(
          items.filter(function (i) { return hasTag(i.tags); }).map(function (i) { return i.id; })
        );
        if (!ids.size) return;

        listItems.forEach(function (item) {
          if (!ids.has(item.getAttribute('data-product-id'))) return;

          item.classList.add('refurbished-product');
          const mark = item.querySelector('.product-mark.sale');
          if (mark) mark.textContent = TAG;
        });
      })
      .catch(function () {});
  }
});

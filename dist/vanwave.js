/* VANWAVE - Sammeldatei aller eigenen Skripte.
 * Automatisch erzeugt von tools/build-bundle.js - nicht von Hand ändern.
 * Quellen: 17 Dateien unter js/ (Reihenfolge siehe Bau-Skript). */

/* ===== js/mega-announcement-bar.js ===== */
try {
document.addEventListener('DOMContentLoaded', function () {
  // Extra-Footer-Sektion, die als Quelle für die Ankündigungsleiste dient
  const footerSectionId = "6aa6ba2cc7c1be040da45df4";
  const originalFooter = document.querySelector(`section[data-section-id="${footerSectionId}"]`);

  if (!originalFooter) return;

  // Wurde die Leiste bereits per X dauerhaft geschlossen? Dann gar nicht erst aufbauen.
  const STORAGE_KEY = 'announcement-state';
  if (localStorage.getItem(STORAGE_KEY) === 'closed') return;

  // Original-Sektion markieren, damit unser CSS sie ausblenden kann
  originalFooter.classList.add('original-footer-section');

  // Struktur der Ankündigungsleiste aufbauen
  const wrapper = document.createElement('div');
  wrapper.className = 'announcement-bar-wrapper';

  const trigger = document.createElement('div');
  trigger.className = 'announcement-trigger';
  trigger.innerHTML = `
    RELAUNCH-RABATT: 5% auf alles
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 9l-7 7-7-7"></path>
    </svg>
    <div class="close-button">✕</div>
  `;

  const content = document.createElement('div');
  content.className = 'announcement-content';

  const innerContent = document.createElement('div');
  innerContent.className = 'announcement-inner';

  // Inhalt der Extra-Footer-Sektion klonen
  const clonedFooter = originalFooter.cloneNode(true);
  clonedFooter.classList.remove('original-footer-section');
  innerContent.appendChild(clonedFooter);
  content.appendChild(innerContent);

  // Zusammensetzen
  wrapper.appendChild(trigger);
  wrapper.appendChild(content);
  document.body.insertBefore(wrapper, document.body.firstChild);

  // Header um die tatsächliche Höhe der Leiste nach unten schieben
  // (Header ist hier position:absolute, nicht fixed - Prinzip ist aber dasselbe)
  const header = document.querySelector('header');

  // Nur die Trigger-Zeile verdrängt den Header dauerhaft - der aufklappende
  // Inhalt soll darüber schweben (overlay), nicht zusätzlich Platz einnehmen.
  function updateOffset() {
    const barHeight = trigger.getBoundingClientRect().height;
    if (header) header.style.top = barHeight + 'px';
    document.body.style.paddingTop = barHeight + 'px';
  }

  // Auf-/Zuklapp-Logik
  let isOpen = false;

  function toggleAnnouncement(shouldOpen = !isOpen) {
    isOpen = shouldOpen;

    if (shouldOpen) {
      content.classList.add('active');
      trigger.classList.add('active');
      document.body.classList.add('announcement-open');
    } else {
      content.classList.remove('active');
      trigger.classList.remove('active');
      document.body.classList.remove('announcement-open');
    }
  }

  updateOffset();
  window.addEventListener('resize', updateOffset);

  trigger.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-button')) return; // eigener Handler unten
    toggleAnnouncement();
  });

  // Schließen bei Klick außerhalb
  document.addEventListener('click', (e) => {
    if (isOpen && !wrapper.contains(e.target)) {
      toggleAnnouncement(false);
    }
  });

  // X: Leiste komplett und dauerhaft ausblenden (nicht nur den Inhalt zuklappen)
  const closeButton = wrapper.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, 'closed');
    wrapper.remove();
    if (header) header.style.top = '';
    document.body.style.paddingTop = '';
  });
});
} catch (error) {
  console.error('[VANWAVE] js/mega-announcement-bar.js', error);
}

/* ===== js/sale-badge.js ===== */
try {
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.summary-item').forEach(function (item) {
    const originalPrice = item.querySelector('.original-price');
    const status = item.querySelector('.summary-product-status');

    if (originalPrice && status && !status.textContent.trim()) {
      status.textContent = 'SALE';
      status.classList.add('custom-sale-badge');
    }
  });
});
} catch (error) {
  console.error('[VANWAVE] js/sale-badge.js', error);
}

/* ===== js/bundle-badge.js ===== */
try {
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
} catch (error) {
  console.error('[VANWAVE] js/bundle-badge.js', error);
}

/* ===== js/restock-info.js ===== */
try {
document.addEventListener('DOMContentLoaded', function () {
  const productStatus = document.querySelector('.product-status');
  const restockCta = document.querySelector('.product-restock-cta');
  const restockForm = document.querySelector('.product-restock-form');
  const captcha = document.querySelector('.captcha-container');

  if (!productStatus || !restockCta || !restockForm) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'custom-restock-wrapper';

  wrapper.appendChild(restockCta);
  wrapper.appendChild(restockForm);

  if (captcha) {
    wrapper.appendChild(captcha);
  }

  productStatus.insertAdjacentElement('afterend', wrapper);
});
} catch (error) {
  console.error('[VANWAVE] js/restock-info.js', error);
}

/* ===== js/sale-page-filter.js ===== */
try {
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
} catch (error) {
  console.error('[VANWAVE] js/sale-page-filter.js', error);
}

/* ===== js/section-slider-progress-bullets.js ===== */
try {
// Alternative Bullet-Darstellung für den Will-Myers Section Slider:
// dünne Striche statt Punkte, der aktive Strich füllt sich über die
// Autoplay-Dauer (data-autoplay-timer) hinweg auf.
//
// Aktivieren pro Slider: dem data-wm-plugin="section-slider"-Div
// zusätzlich data-render-bullet="progressBullet" geben.

window.wmSectionSliderSettings = Object.assign({}, window.wmSectionSliderSettings, {
  progressBullet: function (index, className) {
    return `<span class="${className} progress-bullet"><span class="progress-bullet-fill"></span></span>`;
  }
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-wm-plugin="section-slider"]').forEach(function (el) {
    const timerMs = parseInt(el.getAttribute('data-autoplay-timer'), 10) || 4500;
    const scope = el.closest('.sqs-block') || el.parentElement;
    if (scope) {
      scope.style.setProperty('--wm-slider-autoplay-duration', (timerMs / 1000) + 's');
    }
  });
});
} catch (error) {
  console.error('[VANWAVE] js/section-slider-progress-bullets.js', error);
}

/* ===== js/header-search-icon.js ===== */
try {
// Fügt links vom Konto-Link im Header ein Such-Icon ein, das zu /search
// verlinkt. Die Optik (Icon-Maske) kommt aus vanwave-custom-css.css,
// Abschnitt 15 - dieses Skript erzeugt nur das Element selbst, da reines
// CSS keine neuen, klickbaren Elemente einfügen kann.

document.addEventListener('DOMContentLoaded', function () {
  const accountLink = document.querySelector('.header-actions .user-accounts-link');
  if (!accountLink || document.querySelector('.header-search-icon')) return;

  const searchLink = document.createElement('a');
  searchLink.href = '/search';
  searchLink.className = 'header-search-icon';
  searchLink.setAttribute('aria-label', 'Suche');

  accountLink.parentNode.insertBefore(searchLink, accountLink);
});
} catch (error) {
  console.error('[VANWAVE] js/header-search-icon.js', error);
}

/* ===== js/refurbished.js ===== */
try {
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
} catch (error) {
  console.error('[VANWAVE] js/refurbished.js', error);
}

/* ===== js/price-note.js ===== */
try {
// Preishinweis unter dem Preis auf der Produktdetailseite mit Link auf "Versand".
// Der Text steht als Rückfall weiterhin per ::after im CSS (Abschnitt 04) - ein
// Link ist in ::after nicht möglich. Sobald dieses Script den echten Hinweis
// einfügt, blendet .has-price-note den ::after-Text aus.
// Linkziel hier ändern:
const SHIPPING_URL = 'https://vanwave.squarespace.com/versand';

document.addEventListener('DOMContentLoaded', function () {
  const detail = document.querySelector('.product-detail');
  const price = detail && detail.querySelector('.product-price-value');
  if (!price || detail.querySelector('.price-note')) return;

  const note = document.createElement('div');
  note.className = 'price-note';
  note.innerHTML = 'inkl. MwSt., zzgl. <a href="' + SHIPPING_URL + '" target="_self">Versand</a> (wird beim Checkout berechnet)';

  // Neben den Preis statt hinein: Squarespace überschreibt den Preistext beim
  // Variantenwechsel, ein eingefügtes Kind würde dabei verschwinden.
  price.insertAdjacentElement('afterend', note);
  detail.classList.add('has-price-note');
});
} catch (error) {
  console.error('[VANWAVE] js/price-note.js', error);
}

/* ===== js/create-accordions.js ===== */
try {
function createAccordion(selector = '.ProductItem-details-excerpt') {
  // Get all matching container elements
  const containers = document.querySelectorAll(selector);
  if (containers.length === 0) {
    console.warn(`No accordion containers matching "${selector}" found on page`);
    return;
  }

  // Process each container
  containers.forEach((container, containerIndex) => {
    // Check for required h1 elements
    if (!container.querySelector('h1')) {
      console.warn(`No accordion content (h1 elements) found in container "${selector}" at index ${containerIndex}`);
      return;
    }

    const accordionContent = [];
    let currentSection = null;
    let sectionContent = [];
    let introContent = [];

    // Process all child elements (Elemente statt HTML-Strings sammeln, damit sich
    // Abschluss-Boxen am Ende noch anhand ihres Tags erkennen und heraustrennen lassen)
    Array.from(container.children).forEach((element, index, array) => {
      if (element.tagName === 'H1') {
        if (currentSection) {
          accordionContent.push({
            title: currentSection,
            content: sectionContent
          });
        }
        currentSection = element.textContent;
        sectionContent = [];
      } else if (currentSection) {
        sectionContent.push(element);

        if (index === array.length - 1) {
          accordionContent.push({
            title: currentSection,
            content: sectionContent
          });
        }
      } else {
        introContent.push(element.outerHTML);
      }
    });

    if (accordionContent.length === 0) {
      console.warn(`No accordion sections found to process in container at index ${containerIndex}`);
      return;
    }

    // Abschluss-Boxen (Zustandsbox als Zitat-Block, "Kompatibel mit" als rein kursiver
    // Absatz) sollen immer sichtbar nach dem Akkordeon stehen: vom Ende des letzten
    // Abschnitts alle zusammenhängenden Box-Elemente abtrennen.
    function isClosingBox(el) {
      if (el.tagName === 'BLOCKQUOTE') return true;
      if (el.tagName === 'P' && el.children.length === 1 &&
          (el.children[0].tagName === 'EM' || el.children[0].tagName === 'STRONG')) return true;
      return false;
    }

    const outroContent = [];
    const lastSection = accordionContent[accordionContent.length - 1];
    while (lastSection.content.length > 0 && isClosingBox(lastSection.content[lastSection.content.length - 1])) {
      outroContent.unshift(lastSection.content.pop());
    }

    try {
      // Create wrapper element
      const wrapper = document.createElement('div');
      wrapper.innerHTML = introContent.join('');

      // Create accordion container
      const accordionContainer = document.createElement('div');
      accordionContainer.className = 'accordion';
      accordionContainer.setAttribute('role', 'presentation');

      // Add each accordion section
      accordionContent.forEach((section, index) => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';

        const button = document.createElement('button');
        button.className = 'accordion-trigger';
        button.id = `accordion-trigger-${containerIndex}-${index}`;
        button.setAttribute('aria-controls', `accordion-content-${containerIndex}-${index}`);
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('role', 'button');

        const titleSpan = document.createElement('span');
        titleSpan.className = 'accordion-title';
        titleSpan.textContent = section.title;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'accordion-icon';
        iconSpan.setAttribute('aria-hidden', 'true');

        const content = document.createElement('div');
        content.className = 'accordion-content';
        content.id = `accordion-content-${containerIndex}-${index}`;
        content.setAttribute('role', 'region');
        content.setAttribute('aria-labelledby', `accordion-trigger-${containerIndex}-${index}`);
        content.hidden = true;
        content.innerHTML = section.content.map((el) => el.outerHTML).join('');

        // Add click handler directly to this button
        button.addEventListener('click', () => {
          const isExpanded = button.getAttribute('aria-expanded') === 'true';
          button.setAttribute('aria-expanded', !isExpanded);
          content.hidden = isExpanded;
        });

        button.appendChild(titleSpan);
        button.appendChild(iconSpan);
        accordionItem.appendChild(button);
        accordionItem.appendChild(content);
        accordionContainer.appendChild(accordionItem);
      });

      wrapper.appendChild(accordionContainer);
      outroContent.forEach((el) => wrapper.appendChild(el));

      // Replace container contents
      container.innerHTML = '';
      container.appendChild(wrapper);

    } catch (error) {
      console.error(`Error creating accordion in container ${containerIndex}:`, error);
    }
  });
}

createAccordion('.product-description');
} catch (error) {
  console.error('[VANWAVE] js/create-accordions.js', error);
}

/* ===== js/hotspot-navigator.js ===== */
try {
/* Hotspot Navigator v3.1 — configurable companion add-on for Will Myers Image Hotspots. */
(function (window, document) {
  'use strict';
  var DOT = '.image-hotspot-dot';
  var SOURCE = 'ImageHotspots[block], [data-wm-plugin="image-hotspots"]';

  function clean(value) { return value ? value.trim() : ''; }
  function sourceFor(nav) {
    var root = nav.closest ? (nav.closest('section') || nav.closest('.fluid-engine') || document) : document;
    var candidates = Array.prototype.slice.call(root.querySelectorAll(SOURCE));
    var before = candidates.filter(function (candidate) {
      return candidate !== nav && (candidate.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    return before[before.length - 1] || candidates[0] || null;
  }
  function dotsFor(source) {
    var block = null;
    try { block = source && document.querySelector(source.getAttribute('block')); } catch (error) {}
    if (!block) return [];
    var scope = block.closest ? (block.closest('.sqs-block') || block.parentElement) : block.parentElement;
    return scope ? Array.prototype.slice.call(scope.querySelectorAll(DOT)) : [];
  }
  function init(nav) {
    if (nav.dataset.hsnReady === 'true') return;
    var source = sourceFor(nav), dots = dotsFor(source);
    if (!source || !dots.length) return;
    var titles = Array.prototype.slice.call(source.querySelectorAll('DotTitle'));
    var descriptions = Array.prototype.slice.call(source.querySelectorAll('DotDescription'));
    var data = dots.map(function (dot, index) {
      var box = descriptions[index];
      var info = box && box.querySelector('.hsn-info-title');
      var teaser = box && box.querySelector('.hsn-teaser');
      var longtext = box && box.querySelector('.hsn-longtext');
      return { dot: dot, number: clean(titles[index] && titles[index].textContent) || String(index + 1), title: clean(info && info.textContent) || 'Hotspot ' + (index + 1), teaser: teaser ? teaser.outerHTML : '', longtext: longtext ? longtext.outerHTML : '' };
    });
    nav.dataset.hsnReady = 'true';
    var navStyles = window.getComputedStyle(nav);
    dots.forEach(function (dot) {
      ['--hsn-dot-ring', '--hsn-dot-ring-width', '--hsn-dot-ring-gap', '--hsn-dot-glow'].forEach(function (name) {
        var value = navStyles.getPropertyValue(name).trim();
        if (value) dot.style.setProperty(name, value);
      });
    });
    nav.innerHTML = '<div class="hsn-list" role="list">' + data.map(function (item, index) {
      return '<article class="hsn-item" role="listitem"><button class="hsn-trigger" type="button" aria-expanded="false"><span class="hsn-number" aria-hidden="true">' + item.number + '</span><span class="hsn-copy"><span class="hsn-title">' + item.title.replace(/[&<>]/g, '') + '</span><span class="hsn-description">' + item.teaser + item.longtext + '</span></span></button></article>';
    }).join('') + '</div>';
    var items = Array.prototype.slice.call(nav.querySelectorAll('.hsn-item'));
    function activate(index, open) {
      items.forEach(function (item, i) { var active = i === index; item.classList.toggle('is-active', active); item.querySelector('.hsn-trigger').setAttribute('aria-expanded', active && open ? 'true' : 'false'); data[i].dot.classList.toggle('hsn-navigator-active', active); });
    }
    items.forEach(function (item, index) {
      var button = item.querySelector('.hsn-trigger');
      button.addEventListener('click', function () { activate(index, true); data[index].dot.click(); });
      button.addEventListener('mouseenter', function () { activate(index, false); });
      button.addEventListener('focus', function () { activate(index, false); });
      data[index].dot.addEventListener('mouseenter', function () { activate(index, false); });
      data[index].dot.addEventListener('focus', function () { activate(index, false); });
    });
    var observer = new MutationObserver(function (changes) { changes.forEach(function (change) { if (change.target.getAttribute('aria-expanded') === 'true') activate(data.findIndex(function (item) { return item.dot === change.target; }), true); }); });
    data.forEach(function (item) { observer.observe(item.dot, { attributes: true, attributeFilter: ['aria-expanded'] }); });
  }
  function scan() { Array.prototype.forEach.call(document.querySelectorAll('.hsn-navigator'), init); }
  window.HotspotNavigator = { init: scan };
  function start() { scan(); new MutationObserver(scan).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}(window, document));
} catch (error) {
  console.error('[VANWAVE] js/hotspot-navigator.js', error);
}

/* ===== js/add-ons-heading.js ===== */
try {
document.addEventListener('DOMContentLoaded', function () {
  var addOns = document.querySelector('.product-add-ons');
  if (addOns && !document.querySelector('.add-ons-heading')) {
    var heading = document.createElement('h3');
    heading.className = 'add-ons-heading';
    heading.textContent = 'Passende Ergänzungen'; // change this text as you like
    addOns.parentNode.insertBefore(heading, addOns);
  }
});
} catch (error) {
  console.error('[VANWAVE] js/add-ons-heading.js', error);
}

/* ===== js/account-translations.js ===== */
try {
/*
  VANWAVE · Deutsche Texte und deine Website-Schriften im Kundenkonto

  Squarespace 7.1 · Code-Injection > Footer

  Dieses Script verändert ausschließlich Texte innerhalb des
  Squarespace-Kundenkontos. Es verändert nicht das Flyout, die Breite,
  die Position oder das Layout.
*/

(() => {
  'use strict';

  const translations = {
    'Account': 'Konto',
    'Address': 'Adresse',
    'Addresses': 'Adressen',
    'Add new address': 'Neue Adresse hinzufügen',
    'Close': 'Schließen',
    'Confirm New': 'Neu bestätigen',
    'Current': 'Aktuell',
    'Default': 'Standard',
    'Delete Address': 'Adresse löschen',
    'Delete Payment Method': 'Zahlungsmethode löschen',
    'Digital Products': 'Digitale Produkte',
    'Email': 'E-Mail',
    'Items': 'Artikel',
    'New': 'Neu',
    'New Address': 'Neue Adresse',
    'New Payment Method': 'Neue Zahlungsmethode',
    'No orders yet': 'Noch keine Bestellungen',
    'No saved addresses': 'Keine gespeicherten Adressen',
    'No saved payments': 'Keine gespeicherten Zahlungsmethoden',
    'Order': 'Bestellung',
    'Order Date': 'Bestelldatum',
    'Orders': 'Bestellungen',
    'Other': 'Weitere',
    'Password': 'Passwort',
    'Payment': 'Zahlung',
    'Payment Method': 'Zahlungsmethode',
    'Payment Methods': 'Zahlungsmethoden',
    'Profile': 'Profil',
    'Resend verification email': 'Bestätigungs-E-Mail erneut senden',
    'Search': 'Suchen',
    'Shipping': 'Versand',
    'Shipping Address': 'Lieferadresse',
    'Shipping Option': 'Versandoption',
    'Sign out': 'Abmelden',
    'Status': 'Status',
    'Subtotal': 'Zwischensumme',
    'Summary': 'Zusammenfassung',
    'Tax': 'Steuern',
    'Total': 'Gesamt',
    'Update Password': 'Passwort aktualisieren'
  };

  // Entspricht den Squarespace-Einstellungen:
  // Überschriften/Verschiedenes = Rama Gothic E, Absätze = Open Sans.
  const fontStyles = `
    #user-profile-page-root,
    #user-profile-page-root button,
    #user-profile-page-root a,
    #user-profile-page-root input,
    #user-profile-page-root label,
    #user-profile-page-root p,
    #user-profile-page-root span {
      font-family: 'Open Sans', Arial, sans-serif !important;
    }

    #user-profile-page-root h1,
    #user-profile-page-root h2,
    #user-profile-page-root h3,
    #user-profile-page-root h4,
    #user-profile-page-root h5,
    #user-profile-page-root h6,
    #user-profile-page-root [role='heading'] {
      font-family: 'Rama Gothic E', Arial, sans-serif !important;
    }
  `;

  let currentFrame = null;
  let currentDocument = null;
  let currentObserver = null;
  let translating = false;
  let scheduled = false;

  // Das Kundenkonto ist eine React-App. Wenn wir Textknoten genau in dem
  // Moment ändern, in dem React selbst gerade DOM-Elemente ein-/ausbaut
  // (z.B. beim Wechsel von der Bestellliste in eine einzelne Bestellung),
  // kann React "seine" Knoten nicht mehr wiederfinden und die Seite hängt
  // sich auf. Zwei Gegenmaßnahmen:
  //  1. translate() läuft nie synchron aus dem MutationObserver heraus,
  //     sondern gebündelt einmal pro Frame (requestAnimationFrame) - React
  //     hat seinen eigenen DOM-Umbau dann bereits abgeschlossen.
  //  2. Während translate() selbst schreibt, ignoriert der Observer die
  //     dadurch entstehenden Mutations (sonst reagiert er auf seine eigenen
  //     Änderungen und läuft dauerhaft weiter).
  function translate(root) {
    if (!root) return;

    translating = true;
    try {
      const walker = root.ownerDocument.createTreeWalker(root, 4);
      const nodes = [];

      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach((node) => {
        try {
          const original = node.nodeValue;
          const trimmed = original.trim();
          let replacement = translations[trimmed];

          if (!replacement) {
            replacement = trimmed.replace(/^Hi,\s*/i, 'Moin, ');
            if (replacement === trimmed) return;
          }

          node.nodeValue = original.replace(trimmed, replacement);
        } catch (error) {
          // Knoten kann durch React zwischenzeitlich entfernt worden sein.
        }
      });

      root.querySelectorAll('[aria-label], [title], input[placeholder]').forEach((element) => {
        ['aria-label', 'title', 'placeholder'].forEach((attribute) => {
          try {
            const value = element.getAttribute(attribute);
            const replacement = value && translations[value.trim()];
            if (replacement) element.setAttribute(attribute, replacement);
          } catch (error) {
            // s.o.
          }
        });
      });
    } finally {
      translating = false;
    }
  }

  function scheduleTranslate(accountDocument) {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      translate(accountDocument.body);
    });
  }

  function translateFrame(frame) {
    try {
      const accountDocument = frame.contentDocument;
      if (!accountDocument || !accountDocument.body) return;

      if (!accountDocument.head.querySelector('style[data-vanwave-account-fonts]')) {
        const style = accountDocument.createElement('style');
        style.dataset.vanwaveAccountFonts = '';
        style.textContent = fontStyles;
        accountDocument.head.appendChild(style);
      }

      translate(accountDocument.body);

      if (accountDocument !== currentDocument) {
        currentDocument = accountDocument;
        if (currentObserver) currentObserver.disconnect();
        currentObserver = new MutationObserver(() => {
          if (translating) return; // eigene Änderungen nicht erneut anstoßen
          scheduleTranslate(accountDocument);
        });
        currentObserver.observe(accountDocument.body, {
          childList: true,
          characterData: true,
          subtree: true
        });
      }
    } catch (error) {
      // Das Konto kann während des Ladens kurzzeitig noch nicht zugänglich sein.
    }
  }

  function scan() {
    const frame = document.querySelector('#accountFrame');

    if (frame !== currentFrame) {
      currentFrame = frame;
      currentDocument = null;

      if (frame) {
        frame.addEventListener('load', () => {
          currentDocument = null;
          translateFrame(frame);
        });
      }
    }

    if (frame) translateFrame(frame);
  }

  function start() {
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    // Nur noch ein seltenes Sicherheitsnetz (statt jede Sekunde) für den
    // Fall, dass sich der Konto-Inhalt ändert, ohne dass unser Observer es
    // bemerkt - der Regelfall läuft über den MutationObserver oben.
    window.setInterval(scan, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
} catch (error) {
  console.error('[VANWAVE] js/account-translations.js', error);
}

/* ===== js/shop-filter-anchor.js ===== */
try {
// Springt beim Laden von /shop mit "#shop-filter" in der Adresse zur
// Kategorie-Überschrift. Setzt dafür deren id, sobald sie im DOM steht -
// Sprungziel/Versatz kommt aus vanwave-custom-css.css, Abschnitt 21
// (#shop-filter { scroll-margin-top: ... }). Der Hash in der Adresse
// stammt aus js/shop-filter-category-links.js (umgeschriebene Links).
//
// Hinweis: Eine frühere Version dieses Scripts hat hier zusätzlich über
// einen eigenen URL-Parameter (?vw-category=) eine Filter-Option
// angeklickt. Das ist inzwischen ungenutzt, weil ausnahmslos alle
// Kategorielinks auf der Seite (Desktop- und Mobilmenü, Kategorieliste)
// von js/shop-filter-category-links.js auf ?vw-category-slug=
// umgeschrieben werden - deshalb hier nur noch der Scroll-Teil.

(function () {
  'use strict';

  var ANCHOR = 'shop-filter';
  var started = Date.now();
  var done = false;

  if ((location.pathname.replace(/\/+$/, '') || '/') !== '/shop') return;

  function heading() {
    return document.querySelector('.product-list-header');
  }

  function scrollToAnchor(el) {
    if (done || location.hash !== '#' + ANCHOR) return;
    done = true;

    // Zweimal requestAnimationFrame, damit Filterleiste und Bilder ihr
    // Layout fertig haben, bevor gescrollt wird.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });
  }

  // Kommt der Aufruf über einen Kategorielink (?vw-category-slug=), erst
  // scrollen, wenn js/shop-filter-category-links.js die Kategorie gewählt
  // hat - der Filter verändert beim Aufbau noch das Layout.
  var needsCategory = new URLSearchParams(location.search).has('vw-category-slug');

  function categoryApplied() {
    return !!document.querySelector(
      '.wm-store-filter-group[data-type="category"] .wm-store-filter-input[type="radio"]:checked:not([value=""])'
    );
  }

  (function waitForHeading() {
    var el = heading();
    var timedOut = Date.now() - started >= 15000;

    if (el) {
      el.id = ANCHOR;
      if (!needsCategory || timedOut) {
        scrollToAnchor(el);
        return;
      }
      if (categoryApplied()) {
        setTimeout(function () {
          scrollToAnchor(el);
        }, 120);
        return;
      }
    }
    if (!timedOut) setTimeout(waitForHeading, 100);
  })();
})();
} catch (error) {
  console.error('[VANWAVE] js/shop-filter-anchor.js', error);
}

/* ===== js/shop-filter-category-links.js ===== */
try {
// Biegt jeden nativen Squarespace-Kategorielink (/shop/<kategorie>/)
// site-weit auf /shop?vw-category-slug=<slug>#shop-filter um, damit er
// den Will-Myers-Store-Filter statt der eigenen Kategorieseite öffnet.
// Läuft auf jeder Seite (Desktop- und Mobilmenü, Kategorieliste im Shop
// selbst), auch für Links, die erst nachträglich ins DOM kommen.
// Auf /shop selbst wird beim Laden zusätzlich die passende Filter-Option
// anhand des Parameters angeklickt. Auf Produktseiten bekommt außerdem
// der "SHOP"-Link der Brotkrumen-Navigation das Sprungziel #shop-filter.

(function () {
  'use strict';

  var PARAM = 'vw-category-slug';
  var ANCHOR = 'shop-filter';
  var SHOP = '/shop';

  function slug(value) {
    return String(value || '')
      .trim()
      .replace(/ä/gi, 'ae')
      .replace(/ö/gi, 'oe')
      .replace(/ü/gi, 'ue')
      .replace(/ß/g, 'ss')
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLocaleLowerCase('de-DE')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function rewrite(link) {
    if (!link || link.dataset.vwCategoryLink === 'true') return;

    var url;
    try {
      url = new URL(link.href, location.origin);
    } catch (error) {
      return;
    }
    if (url.origin !== location.origin) return;

    var match = url.pathname.match(/^\/shop\/([^/]+)\/?$/i);
    if (!match || match[1].toLocaleLowerCase('de-DE') === 'p') return;

    var destination = new URL(SHOP, location.origin);
    destination.searchParams.set(PARAM, decodeURIComponent(match[1]));
    destination.hash = ANCHOR;

    link.href = destination.pathname + destination.search + destination.hash;
    link.dataset.vwCategoryLink = 'true';
  }

  // Auf Produktseiten (/shop/p/...) springt der "SHOP"-Link der
  // Brotkrumen-Navigation direkt zur Produktliste statt zum Seitenanfang.
  // Der Hauptmenüpunkt /shop bleibt unverändert.
  var onProductPage = /^\/shop\/p\//i.test(location.pathname);
  var BREADCRUMB = '.product-nav, .ProductItem-nav, .ProductItem-nav-breadcrumb, [class*="ProductItem-nav"]';

  function rewriteProductShopLink(link) {
    if (!onProductPage || !link || link.dataset.vwProductShopLink === 'true') return;

    var url;
    try {
      url = new URL(link.href, location.origin);
    } catch (error) {
      return;
    }
    if (url.origin !== location.origin || url.pathname.replace(/\/+$/, '') !== SHOP) return;
    if (!link.closest(BREADCRUMB)) return;

    url.hash = ANCHOR;
    link.href = url.pathname + url.search + url.hash;
    link.dataset.vwProductShopLink = 'true';
  }

  function rewriteAll(root) {
    if (root instanceof HTMLAnchorElement) {
      rewrite(root);
      rewriteProductShopLink(root);
    }
    if (root.querySelectorAll) {
      root.querySelectorAll('a[href]').forEach(function (link) {
        rewrite(link);
        rewriteProductShopLink(link);
      });
    }
  }

  function start() {
    rewriteAll(document);

    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node instanceof Element) rewriteAll(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  // Auswahl anhand des URL-Parameters anwenden, sobald der Filter selbst
  // im DOM ist - unabhängig vom Rewriting oben, läuft parallel.
  if ((location.pathname.replace(/\/+$/, '') || '/') !== SHOP) return;

  var requested = new URLSearchParams(location.search).get(PARAM);
  if (!requested) return;

  var applyStarted = Date.now();

  (function apply() {
    var inputs = Array.from(
      document.querySelectorAll('.wm-store-filter-group[data-type="category"] .wm-store-filter-input[type="radio"]')
    );
    var input = inputs.find(function (item) {
      return slug(item.value) === slug(requested);
    });

    if (input) {
      if (!input.checked) input.click();
      return;
    }
    if (Date.now() - applyStarted < 15000) {
      setTimeout(apply, 100);
    } else {
      console.warn('[VANWAVE Shop] Kategorie-Slug nicht gefunden: ' + requested);
    }
  })();
})();
} catch (error) {
  console.error('[VANWAVE] js/shop-filter-category-links.js', error);
}

/* ===== js/shop-filter-remove-empty.js ===== */
try {
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
} catch (error) {
  console.error('[VANWAVE] js/shop-filter-remove-empty.js', error);
}

/* ===== js/shop-filter-heading.js ===== */
try {
// Ersetzt die feste "SHOP"-Überschrift durch den Namen der gerade
// gewählten Kategorie im Will-Myers-Store-Filter (nur auf /shop) und
// macht sie von H2 zur H1.

(function () {
  'use strict';

  if ((location.pathname.replace(/\/+$/, '') || '/') !== '/shop') return;

  var started = Date.now();

  // Squarespace gibt die Überschrift als H2 aus. Hier wird sie zur H1,
  // damit die gewählte Kategorie die Hauptüberschrift der Produktliste
  // ist (Semantik und H1-Schriftgröße).
  function promoteToH1() {
    document.querySelectorAll('.product-list-header h2.nested-category-title').forEach(function (h2) {
      var h1 = document.createElement('h1');
      Array.prototype.forEach.call(h2.attributes, function (attribute) {
        h1.setAttribute(attribute.name, attribute.value);
      });
      // Die Einblend-Animation von Squarespace hängt am alten Element.
      // Ihren Zustand nicht mitnehmen, sonst bleibt die H1 unsichtbar.
      h1.classList.remove('preFade', 'fadeIn');
      h1.removeAttribute('style');
      while (h2.firstChild) h1.appendChild(h2.firstChild);
      h2.replaceWith(h1);
    });
  }

  function update() {
    promoteToH1();

    // Squarespace rendert die Überschrift doppelt (Desktop und Mobil).
    var headings = document.querySelectorAll('.product-list-header .nested-category-title');
    var selected = document.querySelector(
      '.wm-store-filter-group[data-type="category"] .wm-store-filter-input[type="radio"]:checked'
    );
    if (!headings.length) return false;

    // "Alle Artikel" hat value="" - dann bleibt es bei "SHOP".
    var text = selected && selected.value ? selected.value : 'SHOP';
    headings.forEach(function (heading) {
      heading.textContent = text;
    });
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
} catch (error) {
  console.error('[VANWAVE] js/shop-filter-heading.js', error);
}

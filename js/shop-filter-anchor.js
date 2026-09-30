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

  (function waitForHeading() {
    var el = heading();
    if (el) {
      el.id = ANCHOR;
      scrollToAnchor(el);
      return;
    }
    if (Date.now() - started < 15000) setTimeout(waitForHeading, 100);
  })();
})();
